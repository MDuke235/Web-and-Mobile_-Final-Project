document.addEventListener("DOMContentLoaded", async function() {
    // --- TRANG ĐĂNG NHẬP ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault(); 
            const user = document.getElementById('username').value.trim();
            const pass = document.getElementById('password').value;
            const errorMsg = document.getElementById('login-error');
            errorMsg.style.display = 'none';

            try {
                const response = await fetch('http://localhost:3000/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: user, password: pass })
                });
                const result = await response.json();

                if (result.success) {
                    localStorage.setItem('currentUser', JSON.stringify(result.user));

                    if (result.user.role === 'admin' || result.user.role === 'teacher') {
                        let roleName = result.user.role === 'admin' ? 'Quản trị viên' : 'Giáo viên';
                        alert(`Đăng nhập ${roleName} thành công!`);
                        window.location.href = 'admin.html';
                    } else {
                        alert("Xin chào! Đang chuyển hướng đến Bảng điểm...");
                        window.location.href = `student.html?id=${result.user.username}`; 
                    }
                } else {
                    errorMsg.style.display = 'block';
                }
            } catch (error) {
                alert("Lỗi kết nối Server!");
            }
        });
    }
});
