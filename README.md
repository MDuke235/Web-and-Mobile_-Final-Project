# Hệ thống Quản lý Học sinh (School Management System)

Đây là hệ thống quản lý học sinh trực tuyến cho phép nhà trường, giáo viên và học sinh/phụ huynh theo dõi điểm số, quản lý thông tin và gửi ý kiến phản hồi. Dự án được xây dựng với kiến trúc Client-Server sử dụng Node.js, Express và MySQL.

## 🚀 Tính năng nổi bật

- **Quản trị viên (Superadmin):** Quản lý toàn bộ danh sách học sinh, xem tổng lượt truy cập, kiểm duyệt và xóa các bình luận phản hồi từ người dùng.
- **Giáo viên (Teacher):** Xem danh sách học sinh và nhập/cập nhật điểm số cho từng môn học theo từng học kỳ.
- **Học sinh (Student):** Xem bảng điểm cá nhân chi tiết theo từng môn và học kỳ, gửi bình luận hoặc phản hồi cho nhà trường.
- **Hệ thống bảo mật:** Ngăn chặn học sinh xem điểm của người khác. Phân quyền truy cập rõ ràng giữa Admin, Teacher và Student.

## 🛠 Cấu trúc thư mục (Project Structure)

Dự án được tổ chức rõ ràng theo chuẩn:

```
school_management/
├── .env                  # Cấu hình biến môi trường (Database credentials)
├── db.js                 # Kết nối CSDL MySQL
├── server.js             # Khởi tạo Express server
├── package.json          # Quản lý dependencies (express, mysql2, cors, dotenv)
├── routes/               # Các API Router được chia nhỏ
│   ├── adminRoutes.js    # API Quản trị & Nhập điểm
│   ├── authRoutes.js     # API Đăng nhập
│   ├── commentRoutes.js  # API Gửi bình luận
│   ├── statsRoutes.js    # API Đếm lượt truy cập
│   └── studentRoutes.js  # API Lấy dữ liệu điểm học sinh
└── public/               # Thư mục Frontend (HTML, CSS, JS)
    ├── index.html        # Trang chủ
    ├── login.html        # Đăng nhập
    ├── admin.html        # Dashboard Admin / Giáo viên
    ├── student.html      # Xem điểm học sinh
    ├── about.html        # Giới thiệu & Liên hệ
    ├── css/              
    │   └── style.css     # Stylesheet chung
    ├── images/           # Hình ảnh dự án
    └── js/               # Scripts được chia nhỏ theo từng trang
        ├── global.js     
        ├── login.js      
        ├── admin.js      
        └── student.js    
```

## ⚙️ Hướng dẫn cài đặt và chạy (Installation)

### 1. Yêu cầu hệ thống
- **Node.js** (Phiên bản >= 14.x)
- **MySQL Server** (XAMPP, WAMP hoặc MySQL độc lập)

### 2. Thiết lập Cơ sở dữ liệu (Database Setup)
1. Mở MySQL và tạo một database tên là `school_management`.
2. Tạo các bảng cần thiết (`users`, `students`, `grades`, `comments`, `site_stats`) và thêm một số dữ liệu mẫu. *(Lưu ý: Import file `.sql` của bạn vào MySQL nếu có).*

### 3. Cài đặt thư viện (Install Dependencies)
Mở terminal/command prompt tại thư mục dự án và chạy:
```bash
npm install
```

### 4. Cấu hình biến môi trường (Environment Setup)
Đảm bảo file `.env` đã được tạo ở thư mục gốc với nội dung tương tự sau (thay đổi thông tin cho phù hợp với MySQL của bạn):
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Mật_Khẩu_Của_Bạn
DB_NAME=school_management
```

### 5. Khởi động Server
Chạy lệnh sau để khởi động Backend:
```bash
node server.js
```
Terminal sẽ hiển thị dòng chữ:
`🚀 Server đang chạy tại: http://localhost:3000`

### 6. Sử dụng
Mở trình duyệt và truy cập vào đường dẫn: **http://localhost:3000**

- **Tài khoản test gợi ý:**
  - Giáo vụ (Admin): `admin_giaovu` / `123456`
  - Quản trị viên (Superadmin): `superadmin` / `123456` (Nếu có cài đặt trong DB)
  - Học sinh (Student): `20233839` / `123456`
