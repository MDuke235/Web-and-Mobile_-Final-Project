const mysql = require('mysql2/promise');

// Cấu hình kết nối MySQL
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',           // Tên đăng nhập MySQL của bạn (thường là root)
    password: 'Minhduc2305@',           // Nhập mật khẩu MySQL của bạn vào đây (nếu có)
    database: 'school_management',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Kiểm tra kết nối
pool.getConnection()
    .then(connection => {
        console.log('✅ Đã kết nối thành công với MySQL!');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Lỗi kết nối MySQL:', err.message);
    });

module.exports = pool;