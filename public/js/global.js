// ==========================================
// 1. CÁC HÀM TIỆN ÍCH TOÀN CỤC
// ==========================================
function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    document.cookie = cname + "=" + cvalue + ";expires=" + d.toUTCString() + ";path=/";
}

function getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
    }
    return "";
}

function closePopup() {
    document.getElementById("ad-popup").style.display = "none";
    setCookie("ad_popup_shown", "true", 1);
}

function logout() {
    localStorage.removeItem('currentUser'); // Xóa trí nhớ đăng nhập
    alert("Đã đăng xuất thành công!");
    window.location.href = 'index.html';
}

function updateNavigation() {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
        const user = JSON.parse(userJson);
        const navUl = document.querySelector('header nav ul');

        const loginLinks = navUl.querySelectorAll('a[href="login.html"]');
        loginLinks.forEach(link => { if (!link.getAttribute('onclick')) link.parentElement.remove(); });

        if (user.role === 'admin' || user.role === 'teacher') {
            const aboutLinks = navUl.querySelectorAll('a[href="about.html"]');
            aboutLinks.forEach(link => { if (!link.getAttribute('onclick')) link.parentElement.remove(); });
        }

        // Đảm bảo "Trang chủ" luôn nằm ngoài cùng bên trái (Vị trí số 1 là sau Trang chủ)
        if (user.role === 'admin') {
            if (!document.querySelector('a[href="admin.html"]')) {
                const adminLi = document.createElement('li');
                adminLi.innerHTML = `<a href="admin.html">Quản trị Hệ thống</a>`;
                navUl.insertBefore(adminLi, navUl.children[1]);
            }
        } else if (user.role === 'teacher') {
            if (!document.querySelector('a[href="admin.html"]')) {
                const teacherLi = document.createElement('li');
                teacherLi.innerHTML = `<a href="admin.html">Nhập Điểm (GV)</a>`;
                navUl.insertBefore(teacherLi, navUl.children[1]);
            }
        } else {
            if (!document.querySelector('a[href*="student.html"]')) {
                const studentLi = document.createElement('li');
                studentLi.innerHTML = `<a href="student.html?id=${user.username}">Bảng điểm của tôi</a>`;
                navUl.insertBefore(studentLi, navUl.children[1]);
            }
        }

        if (!document.querySelector('a[onclick="logout()"]')) {
            const logoutLi = document.createElement('li');
            logoutLi.innerHTML = `<a href="#" onclick="logout()">Đăng xuất (${user.username})</a>`;
            navUl.appendChild(logoutLi);
        }
    }
}

// ==========================================
// 2. KHỞI CHẠY KHI TRANG LOAD XONG
// ==========================================
document.addEventListener("DOMContentLoaded", async function () {
    updateNavigation(); // Gọi hàm cập nhật menu đầu tiên

    // CHO PHÉP CLICK VÀO TIÊU ĐỀ H1 ĐỂ VỀ TRANG CHỦ
    const headerH1 = document.querySelector('header h1');
    if (headerH1) {
        headerH1.style.cursor = "pointer";
        headerH1.title = "Về Trang chủ";
        headerH1.addEventListener("click", () => {
            window.location.href = "index.html";
        });
    }

    // Gửi request đếm view mỗi khi load bất kỳ trang nào
    try {
        const viewRes = await fetch('http://localhost:3000/api/stats/view', { method: 'POST' });
        const viewData = await viewRes.json();
        const aboutViewCount = document.getElementById('view-count-about');
        if (aboutViewCount && viewData.success) {
            aboutViewCount.innerText = viewData.total_views;
        }
    } catch (e) { console.error("Lỗi đếm view", e); }

    // --- XỬ LÝ POPUP QUẢNG CÁO ---
    const adPopup = document.getElementById("ad-popup");
    if (adPopup) {
        if (getCookie("ad_popup_shown") !== "true") {
            setTimeout(() => adPopup.style.display = "block", 60000);
        }
    }

    // --- TRANG LIÊN HỆ --- 
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const newContact = {
                student_id: "LIÊN HỆ", // Đánh dấu đây là tin nhắn từ form liên hệ
                reviewer_name: document.getElementById('contact-name').value,
                email: document.getElementById('contact-email').value,
                rating: 5, // Mặc định
                content: document.getElementById('contact-message').value
            };

            try {
                const res = await fetch('http://localhost:3000/api/comments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newContact)
                });

                const data = await res.json();
                if (data.success) {
                    alert('Cảm ơn bạn! Lời nhắn của bạn đã được gửi cho Ban Giám Hiệu.');
                    contactForm.reset();
                }
            } catch (error) {
                alert("Lỗi kết nối máy chủ khi gửi lời nhắn.");
            }
        });
    }
});
