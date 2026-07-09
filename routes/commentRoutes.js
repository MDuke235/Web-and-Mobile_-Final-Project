const express = require('express');
const router = express.Router();
const db = require('../db');

// 4. API: Thêm bình luận mới vào Database
router.post('/', async (req, res) => {
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

module.exports = router;
