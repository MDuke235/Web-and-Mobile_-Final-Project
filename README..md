# 🎓 Hệ thống Quản lý Học sinh (Student Management System)

Đây là dự án cuối kỳ môn học Web and Mobile. Hệ thống cung cấp giải pháp quản lý điểm số học sinh trực tuyến, phân quyền rõ ràng giữa Giáo viên (Admin) và Học sinh (User), đi kèm giao diện responsive không sử dụng thư viện UI (100% Vanilla HTML/CSS/JS).

## 🚀 Công nghệ sử dụng
* **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
* **Backend:** Node.js (Express.js)
* **Database:** MySQL (thư viện `mysql2`)

---

## ⚙️ Hướng dẫn cài đặt và chạy dự án (Dành cho thành viên nhóm)

Để chạy được dự án này trên máy cá nhân, các bạn vui lòng làm theo các bước sau:

### Bước 1: Chuẩn bị môi trường
1. Cài đặt **Node.js**: [Tải tại đây](https://nodejs.org/) (Chọn bản LTS).
2. Cài đặt **XAMPP** hoặc **MySQL Workbench** để chạy Database.

### Bước 2: Tải code về máy
Mở Terminal hoặc Git Bash và chạy lệnh:
```bash
git clone [https://github.com/MDuke235/Web-and-Mobile_-Final-Project.git](https://github.com/MDuke235/Web-and-Mobile_-Final-Project.git)
cd Web-and-Mobile_-Final-Project
```
### Bước 3: Cài đặt thư viện Node.js
Trong thư mục dự án, mở Terminal và chạy lệnh:
```bash
npm install
```
### Bước 4: Thiết lập Cơ sở dữ liệu (MySQL)
Mở phần mềm quản lý MySQL của bạn.

Tạo một database mới tên là school_management .

Copy toàn bộ mã SQL khởi tạo các bảng users, students, grades, comments và dán vào mục SQL để chạy.

Mở file db.js trong code, kiểm tra và đổi lại password cho đúng với mật khẩu MySQL trên máy.

### Bước 5: Khởi động Server
Tại Terminal đang mở ở bước 3, chạy lệnh sau để bật Server Backend:
```bash
node server.js
```
Nếu màn hình báo ✅ Đã kết nối thành công với MySQL! và 🚀 Server đang chạy tại: http://localhost:3000 là thành công.

### Bước 6: Truy cập Website
Mở trình duyệt web và truy cập địa chỉ:
👉 http://localhost:3000

### Update 13/4
Chạy dòng lệnh SQL sau trong phần mềm quản lý CSDL với schema đã tạo phía trên:
```bash
ALTER TABLE grades ADD CONSTRAINT chk_scores CHECK (process_score >= 0 AND process_score <= 10 AND final_score >= 0 AND final_score <= 10);
```
