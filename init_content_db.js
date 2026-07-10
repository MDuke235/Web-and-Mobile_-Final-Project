const db = require('./db');

async function init() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS site_content (
                page VARCHAR(50) PRIMARY KEY,
                content TEXT
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        
        // Insert default content if not exists
        await db.query(`
            INSERT IGNORE INTO site_content (page, content) VALUES 
            ('about', 'Trường Phổ thông tự hào là đơn vị tiên phong trong việc ứng dụng công nghệ thông tin vào quản lý giáo dục. Hệ thống quản lý điểm số trực tuyến giúp phụ huynh và học sinh dễ dàng theo dõi tiến độ học tập một cách minh bạch, nhanh chóng và chính xác.')
        `);
        
        console.log("Created site_content table and default data.");
    } catch (e) {
        console.error(e);
    }
    process.exit();
}

init();
