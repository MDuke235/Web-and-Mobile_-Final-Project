# Báo Cáo Tổng Kết Dự Án Hệ Thống Quản Lý Học Sinh

## 1. Các Chức Năng (Features)
- **Quản trị viên (Superadmin):** Quản lý toàn bộ danh sách học sinh, xem tổng lượt truy cập, kiểm duyệt và xóa các bình luận phản hồi từ người dùng.
- **Giáo viên (Teacher):** Xem danh sách học sinh và nhập/cập nhật điểm số cho từng môn học theo từng học kỳ.
- **Học sinh (Student):** Xem bảng điểm cá nhân chi tiết theo từng môn và học kỳ, gửi bình luận hoặc phản hồi cho nhà trường.
- **Hệ thống bảo mật:** Phân quyền truy cập rõ ràng giữa Admin, Teacher và Student; ngăn chặn học sinh xem điểm của người khác.

## 2. Mức Độ Hoàn Thiện
- **100%** (Hoàn thành đầy đủ các chức năng theo yêu cầu đề ra).

## 3. Phân Công Nhiệm Vụ Của Từng Thành Viên

| STT | Họ và Tên | Vai trò / Nhiệm vụ chi tiết | Mức độ đóng góp |
|:---:|---|---|:---:|
| 1 | **Tạ Minh Đức** | **Nhóm trưởng**: Thiết kế cơ sở dữ liệu, phát triển hệ thống Backend (Node.js/Express), viết API cốt lõi, tích hợp Frontend-Backend, xử lý logic phân quyền và đóng góp vào định hình cấu trúc mã nguồn. | 33.33% |
| 2 | **Nguyễn Lê Trung Hiếu** | **Thành viên**: Phát triển giao diện Frontend (HTML/CSS/JS) cho trang Quản trị viên (Admin) và Giáo viên, xử lý gọi API hiển thị dữ liệu và cập nhật điểm số. | 33.33% |
| 3 | **Trần Gia Huy** | **Thành viên**: Phát triển giao diện Frontend (HTML/CSS/JS) cho trang Học sinh, trang Đăng nhập, thực hiện kiểm thử hệ thống (Testing) và rà soát lỗi giao diện. | 33.33% |

## 4. Hướng Dẫn Cài Đặt Và Sử Dụng

### Yêu Cầu Hệ Thống
- **Node.js** (Phiên bản >= 14.x)
- **MySQL Server** (XAMPP, WAMP hoặc MySQL độc lập)

### Cài Đặt Và Chạy Ứng Dụng
1. **Thiết lập cơ sở dữ liệu:**
   - Tạo một database trong MySQL với tên `school_management`.
   - Import file dữ liệu mẫu `sample_db.sql` đính kèm trong thư mục dự án vào database vừa tạo.
2. **Cài đặt thư viện:**
   - Mở terminal tại thư mục gốc của dự án và chạy lệnh: `npm install`
3. **Cấu hình môi trường:**
   - Đảm bảo có file `.env` ở thư mục gốc với nội dung cấu hình kết nối DB (thay đổi `DB_PASSWORD` cho phù hợp):
     ```env
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=
     DB_NAME=school_management
     ```
4. **Khởi động server:**
   - Chạy lệnh: `node server.js`
   - Truy cập **http://localhost:3000** trên trình duyệt.

### Tài Khoản Sử Dụng Mẫu:
  - Giáo vụ (Admin): `admin_giaovu` / `123456`
  - Quản trị viên (Superadmin): `superadmin` / `123456` (Nếu có cài đặt trong DB)
  - Học sinh (Student): `20233839` / `123456`

