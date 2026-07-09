const express = require('express');
const router = express.Router();
const db = require('../db');

// 3. API: Lấy tổng lượt truy cập (View)
router.get('/view', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT total_views FROM site_stats WHERE id = 1');
        res.json({ success: true, total_views: rows[0].total_views });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3.1. API: Tăng lượt truy cập
router.post('/view', async (req, res) => {
    try {
        await db.execute('UPDATE site_stats SET total_views = total_views + 1 WHERE id = 1');
        const [rows] = await db.execute('SELECT total_views FROM site_stats WHERE id = 1');
        res.json({ success: true, total_views: rows[0].total_views });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
