const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Giúp đọc dữ liệu JSON từ Frontend gửi lên
app.use(express.static(path.join(__dirname, 'public'))); // Phục vụ trực tiếp các file HTML/CSS

// ==========================================
// ĐĂNG KÝ ROUTER
// ==========================================
app.use('/api/login', require('./routes/authRoutes'));
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// ==========================================
// KHỞI ĐỘNG SERVER
// ==========================================
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
    console.log(`👉 Mở trình duyệt và truy cập: http://localhost:${PORT}/index.html`);
});