const express = require('express');
const router = express.Router();
const db = require('../db');

// API: Thêm liên hệ mới vào Database
router.post('/', async (req, res) => {
    const { sender_name, email, message } = req.body;
    try {
        await db.execute(
            'INSERT INTO contacts (sender_name, email, message) VALUES (?, ?, ?)',
            [sender_name, email, message]
        );
        res.json({ success: true, message: 'Đã lưu liên hệ!' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
