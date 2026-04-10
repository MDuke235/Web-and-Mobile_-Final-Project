const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db'); // Gọi file kết nối DB vừa tạo

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Giúp đọc dữ liệu JSON từ Frontend gửi lên
app.use(express.static(path.join(__dirname, 'public'))); // Phục vụ trực tiếp các file HTML/CSS

// ==========================================
// CÁC ĐƯỜNG DẪN API (ROUTING)
// ==========================================

// 1. API: Xử lý Đăng nhập
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await db.execute('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
        if (rows.length > 0) {
            res.json({ success: true, user: rows[0] }); // Trả về thông tin user (kèm role admin/user)
        } else {
            res.json({ success: false, message: 'Sai tài khoản hoặc mật khẩu' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. API: Lấy dữ liệu Bảng điểm & Bình luận của 1 Học sinh
app.get('/api/student/:id', async (req, res) => {
    const studentId = req.params.id;
    try {
        // Lấy thông tin học sinh
        const [students] = await db.execute('SELECT * FROM students WHERE student_id = ?', [studentId]);
        if (students.length === 0) return res.json({ success: false, message: 'Không tìm thấy học sinh' });

        // Lấy điểm các môn học
        const [grades] = await db.execute('SELECT * FROM grades WHERE student_id = ?', [studentId]);
        
        // Lấy bình luận
        const [comments] = await db.execute('SELECT * FROM comments WHERE target_student_id = ? ORDER BY created_at DESC', [studentId]);

        // Gộp chung lại và gửi về Frontend
        res.json({
            success: true,
            data: {
                info: students[0],
                grades: grades,
                comments: comments
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. API: Tăng và lấy tổng lượt truy cập (View)
app.get('/api/stats/view', async (req, res) => {
    try {
        // Cộng 1 vào database
        await db.execute('UPDATE site_stats SET total_views = total_views + 1 WHERE id = 1');
        // Lấy ra số mới nhất
        const [rows] = await db.execute('SELECT total_views FROM site_stats WHERE id = 1');
        res.json({ success: true, total_views: rows[0].total_views });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 4. API: Thêm bình luận mới vào Database
app.post('/api/comments', async (req, res) => {
    const { student_id, reviewer_name, email, content, rating } = req.body;
    try {
        await db.execute(
            'INSERT INTO comments (target_student_id, reviewer_name, email, content, rating) VALUES (?, ?, ?, ?, ?)',
            [student_id, reviewer_name, email, content, rating]
        );
        res.json({ success: true, message: 'Đã lưu bình luận!' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ==========================================
// KHỞI ĐỘNG SERVER
// ==========================================
const PORT = 3000;
// ==========================================
// CÁC API DÀNH CHO TRANG ADMIN
// ==========================================

// 5. API: Lấy danh sách học sinh (Dùng LEFT JOIN để lấy cả HS chưa có điểm)
app.get('/api/admin/students', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT s.student_id, s.full_name, s.class_name, g.semester, g.subject_name, g.process_score, g.final_score
            FROM students s
            LEFT JOIN grades g ON s.student_id = g.student_id
            ORDER BY s.student_id ASC, g.semester ASC
        `);
        res.json({ success: true, data: rows });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// 6. API: Lấy tất cả bình luận
app.get('/api/admin/comments', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM comments ORDER BY created_at DESC');
        res.json({ success: true, data: rows });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// 7. API: Xóa một bình luận
app.delete('/api/admin/comments/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM comments WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// 8. API: Nhập / Cập nhật điểm (Hỗ trợ theo Kỳ và Môn)
app.post('/api/admin/grades', async (req, res) => {
    const { student_id, semester, subject_name, process_score, final_score } = req.body;
    try {
        // Kiểm tra xem môn này ở kỳ này đã có điểm chưa
        const [exist] = await db.execute('SELECT id FROM grades WHERE student_id = ? AND subject_name = ? AND semester = ?', [student_id, subject_name, semester]);
        if (exist.length > 0) {
            // Đã có -> Cập nhật
            await db.execute('UPDATE grades SET process_score = ?, final_score = ? WHERE id = ?', [process_score, final_score, exist[0].id]);
        } else {
            // Chưa có -> Thêm mới
            await db.execute('INSERT INTO grades (student_id, semester, subject_name, process_score, final_score) VALUES (?, ?, ?, ?, ?)', [student_id, semester, subject_name, process_score, final_score]);
        }
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// 9. API: Thêm Học sinh mới (Tự động cấp tài khoản)
app.post('/api/admin/students', async (req, res) => {
    const { student_id, full_name, class_name } = req.body;
    try {
        // Lưu vào bảng students
        await db.execute('INSERT INTO students (student_id, full_name, class_name) VALUES (?, ?, ?)', [student_id, full_name, class_name]);
        // Tự động tạo tài khoản đăng nhập (Mật khẩu mặc định: 123456)
        await db.execute('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [student_id, '123456', 'user']);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
    console.log(`👉 Mở trình duyệt và truy cập: http://localhost:${PORT}/index.html`);
});