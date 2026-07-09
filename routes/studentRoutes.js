const express = require('express');
const router = express.Router();
const db = require('../db');

// 2. API: Lấy dữ liệu Bảng điểm & Bình luận của 1 Học sinh
router.get('/:id', async (req, res) => {
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

module.exports = router;
