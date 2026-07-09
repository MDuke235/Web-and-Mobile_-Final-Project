const express = require('express');
const router = express.Router();
const db = require('../db');

// 5. API: Lấy danh sách học sinh (Dùng LEFT JOIN để lấy cả HS chưa có điểm)
router.get('/students', async (req, res) => {
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
router.get('/comments', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM comments ORDER BY created_at DESC');
        res.json({ success: true, data: rows });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// 7. API: Xóa một bình luận
router.delete('/comments/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM comments WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// 8. API: Nhập / Cập nhật điểm (Hỗ trợ theo Kỳ và Môn)
router.post('/grades', async (req, res) => {
    const { student_id, semester, subject_name, process_score, final_score } = req.body;
    
    // --- ĐOẠN CODE MỚI THÊM VÀO ĐỂ BẢO VỆ ---
    if (process_score < 0 || process_score > 10 || final_score < 0 || final_score > 10) {
        return res.status(400).json({ 
            success: false, 
            message: 'Lỗi: Điểm số phải nằm trong khoảng từ 0.0 đến 10.0!' 
        });
    }
    // ----------------------------------------

    try {
        const [exist] = await db.execute('SELECT id FROM grades WHERE student_id = ? AND subject_name = ? AND semester = ?', [student_id, subject_name, semester]);
        if (exist.length > 0) {
            await db.execute('UPDATE grades SET process_score = ?, final_score = ? WHERE id = ?', [process_score, final_score, exist[0].id]);
        } else {
            await db.execute('INSERT INTO grades (student_id, semester, subject_name, process_score, final_score) VALUES (?, ?, ?, ?, ?)', [student_id, semester, subject_name, process_score, final_score]);
        }
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// 9. API: Thêm Học sinh mới (Tự động cấp tài khoản)
router.post('/students', async (req, res) => {
    const { student_id, full_name, class_name } = req.body;
    try {
        // Lưu vào bảng students
        await db.execute('INSERT INTO students (student_id, full_name, class_name) VALUES (?, ?, ?)', [student_id, full_name, class_name]);
        // Tự động tạo tài khoản đăng nhập (Mật khẩu mặc định: 123456)
        await db.execute('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [student_id, '123456', 'user']);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

module.exports = router;
