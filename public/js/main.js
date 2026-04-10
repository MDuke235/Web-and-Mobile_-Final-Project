// ==========================================
// 1. CÁC HÀM TIỆN ÍCH
// ==========================================
function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    document.cookie = cname + "=" + cvalue + ";expires=" + d.toUTCString() + ";path=/";
}

function getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
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

// CẬP NHẬT MENU ĐỘNG DỰA THEO TÀI KHOẢN ĐĂNG NHẬP
function updateNavigation() {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
        const user = JSON.parse(userJson);
        const navUl = document.querySelector('header nav ul');
        
        // Ẩn nút Đăng nhập mặc định
        const loginLinks = navUl.querySelectorAll('a[href="login.html"]');
        loginLinks.forEach(link => { if(!link.getAttribute('onclick')) link.parentElement.remove(); });

        // Hiện nút theo Quyền
        if (user.role === 'admin') {
            if(!document.querySelector('a[href="admin.html"]')) {
                navUl.innerHTML = `<li><a href="admin.html">Quản trị</a></li>` + navUl.innerHTML;
            }
        } else {
            if(!document.querySelector('a[href*="student.html"]')) {
                navUl.innerHTML = `<li><a href="student.html?id=${user.username}">Bảng điểm của tôi</a></li>` + navUl.innerHTML;
            }
        }
        
        // Hiện nút Đăng xuất
        if(!document.querySelector('a[onclick="logout()"]')) {
            navUl.innerHTML += `<li><a href="#" onclick="logout()">Đăng xuất (${user.username})</a></li>`;
        }
    }
}

// ==========================================
// 2. KHỞI CHẠY KHI TRANG LOAD XONG
// ==========================================
document.addEventListener("DOMContentLoaded", async function() {
    updateNavigation(); // Gọi hàm cập nhật menu đầu tiên

    // --- A. XỬ LÝ POPUP QUẢNG CÁO ---
    const adPopup = document.getElementById("ad-popup");
    if (adPopup) {
        if (getCookie("ad_popup_shown") !== "true") {
            setTimeout(() => adPopup.style.display = "block", 60000); 
        }
    }

    // --- B. TRANG LIÊN HỆ ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert(`Cảm ơn bạn! Ý kiến đã được gửi.`);
            contactForm.reset();
        });
    }

    // --- C. TRANG ĐĂNG NHẬP ---
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
                    // LƯU TRÍ NHỚ ĐĂNG NHẬP (localStorage)
                    localStorage.setItem('currentUser', JSON.stringify(result.user));

                    if (result.user.role === 'admin') {
                        alert("Đăng nhập Admin thành công!");
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

    // --- D. TRANG BẢNG ĐIỂM (student.html) ---
    const studentInfoDiv = document.getElementById('student-info');
    if (studentInfoDiv) {
        const urlParams = new URLSearchParams(window.location.search);
        let studentId = urlParams.get('id');

        // Nếu mất URL id, tự động lấy id từ người dùng đang đăng nhập
        if (!studentId && localStorage.getItem('currentUser')) {
            const user = JSON.parse(localStorage.getItem('currentUser'));
            if (user.role === 'user') {
                studentId = user.username;
                window.history.replaceState(null, null, `?id=${studentId}`);
            }
        }

        if (!studentId) {
            studentInfoDiv.innerHTML = `<h2>Vui lòng đăng nhập hoặc nhập mã học sinh!</h2>`;
        } else {
            try {
                const response = await fetch(`http://localhost:3000/api/student/${studentId}`);
                const result = await response.json();

                if (!result.success) {
                    studentInfoDiv.innerHTML = `<h2>Không tìm thấy dữ liệu học sinh</h2>`;
                } else {
                    // LƯU DỮ LIỆU ĐỂ DÙNG KHI ĐỔI KỲ
                    window.currentStudentData = result.data;
                    
                    window.renderStudentTable = function() {
                        // Lấy kỳ đang chọn (Mặc định là Kỳ 1)
                        const filterEl = document.getElementById('student-semester-filter');
                        const selectedSemester = filterEl ? filterEl.value : "Học kỳ 1";
                        
                        const student = window.currentStudentData.info;
                        const grades = window.currentStudentData.grades;
                        
                        // Lọc điểm theo kỳ
                        const filteredGrades = grades.filter(g => g.semester === selectedSemester);

                        let tableHTML = `
                            <h2>Học sinh: ${student.full_name} - Lớp: ${student.class_name}</h2>
                            <p><strong>Mã HS:</strong> ${student.student_id}</p>
                            
                            <div style="margin: 15px 0;">
                                <label><strong>Học Kỳ: </strong></label>
                                <select id="student-semester-filter" onchange="renderStudentTable()" style="padding: 6px; border-radius: 4px; font-weight: bold; border: 1px solid #0056b3;">
                                    <option value="Học kỳ 1" ${selectedSemester === 'Học kỳ 1' ? 'selected' : ''}>Học kỳ 1</option>
                                    <option value="Học kỳ 2" ${selectedSemester === 'Học kỳ 2' ? 'selected' : ''}>Học kỳ 2</option>
                                </select>
                            </div>

                            <div class="table-responsive">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Môn học</th><th>Quá trình</th><th>Thi</th><th>Tổng kết</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                        `;
                        
                        if (filteredGrades.length === 0) {
                            tableHTML += `<tr><td colspan="4" style="text-align:center; color:gray;">Chưa có điểm cho kỳ này</td></tr>`;
                        } else {
                            filteredGrades.forEach(g => {
                                let total = (parseFloat(g.process_score) * 0.4 + parseFloat(g.final_score) * 0.6).toFixed(2);
                                tableHTML += `<tr><td><strong>${g.subject_name}</strong></td><td>${g.process_score}</td><td>${g.final_score}</td><td><strong>${total}</strong></td></tr>`;
                            });
                        }
                        tableHTML += `</tbody></table></div>`;
                        studentInfoDiv.innerHTML = tableHTML;

                        // PHÂN BIỆT GIAO DIỆN ADMIN VS STUDENT (Render lại Banner nếu cần)
                        const userJson = localStorage.getItem('currentUser');
                        if (userJson) {
                            const loggedInUser = JSON.parse(userJson);
                            if (loggedInUser.role === 'admin') {
                                const banner = document.createElement('div');
                                banner.innerHTML = `<div style="background:#ffc107; padding:10px; text-align:center; font-weight:bold; margin-bottom:20px; border-radius:4px; color:#333;">👁️ BẠN ĐANG XEM BẢNG ĐIỂM DƯỚI QUYỀN GIÁO VIÊN</div>`;
                                studentInfoDiv.prepend(banner);
                                const commentForm = document.getElementById('comment-form');
                                if(commentForm) commentForm.style.display = 'none';
                            }
                        }
                    };

                    // Vẽ bảng lần đầu và vẽ bình luận
                    renderStudentTable();
                    renderComments(result.data.comments);
                }
            } catch (error) { console.error(error); }
        }

        // Gửi bình luận
        const commentForm = document.getElementById('comment-form');
        if (commentForm) {
            commentForm.addEventListener('submit', async function(e) {
                e.preventDefault(); 
                const newComment = {
                    student_id: studentId,
                    reviewer_name: document.getElementById('reviewer-name').value,
                    email: document.getElementById('reviewer-email').value,
                    rating: document.getElementById('reviewer-rating').value,
                    content: document.getElementById('reviewer-content').value
                };
                try {
                    const res = await fetch('http://localhost:3000/api/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newComment) });
                    const data = await res.json();
                    if (data.success) { alert("Gửi thành công!"); location.reload(); }
                } catch (error) {}
            });
        }
    }

    // --- E. TRANG QUẢN TRỊ ADMIN (admin.html) ---
    const adminStudentsList = document.getElementById('admin-students-list');
    const adminCommentsList = document.getElementById('admin-comments-list');

    if (adminStudentsList && adminCommentsList) {
        try {
            const viewRes = await fetch('http://localhost:3000/api/stats/view');
            const viewData = await viewRes.json();
            if (viewData.success) document.getElementById('admin-total-views').innerText = viewData.total_views;
        } catch (e) { }

        // GỘP CÁC MÔN VÀO 1 HÀNG CHO GIÁO VIÊN
        // HIỂN THỊ HỌC SINH (GỘP CỘT & LỌC THEO KỲ)
        window.loadAdminStudents = async function() {
            const res = await fetch('http://localhost:3000/api/admin/students');
            const result = await res.json();
            
            if (result.success) {
                // Lấy kỳ học đang được chọn ở nút Dropdown
                const selectedSemester = document.getElementById('admin-semester-filter').value;
                const studentsMap = {};
                
                result.data.forEach(item => {
                    // Luôn khởi tạo học sinh (dù chưa có điểm)
                    if(!studentsMap[item.student_id]) {
                        studentsMap[item.student_id] = { id: item.student_id, name: item.full_name, class: item.class_name, grades: [] };
                    }
                    // CHỈ đẩy môn học vào mảng nếu môn đó thuộc KỲ ĐANG CHỌN
                    if (item.subject_name && item.semester === selectedSemester) {
                        studentsMap[item.student_id].grades.push(item);
                    }
                });

                let html = "";
                Object.values(studentsMap).forEach(s => {
                    let rowCount = s.grades.length > 0 ? s.grades.length : 1;
                    
                    html += `<tr>
                        <td rowspan="${rowCount}">${s.id}</td>
                        <td rowspan="${rowCount}">
                            <a href="student.html?id=${s.id}" target="_blank" style="color: #0056b3; font-weight: bold; text-decoration: underline;">${s.name}</a><br><small>Lớp: ${s.class}</small>
                        </td>
                    `;
                    
                    if (s.grades.length > 0) {
                        let first = s.grades[0];
                        let total = (parseFloat(first.process_score) * 0.4 + parseFloat(first.final_score) * 0.6).toFixed(2);
                        // Đã bỏ cột in Kỳ học
                        html += `
                            <td><strong>${first.subject_name}</strong></td>
                            <td>${first.process_score}</td>
                            <td>${first.final_score}</td>
                            <td><strong>${total}</strong></td>
                            <td rowspan="${rowCount}"><button class="btn-action btn-edit" onclick="openEditModal('${s.id}')">Nhập / Sửa điểm</button></td>
                        </tr>`;
                        
                        for(let i = 1; i < s.grades.length; i++) {
                            let g = s.grades[i];
                            let t = (parseFloat(g.process_score) * 0.4 + parseFloat(g.final_score) * 0.6).toFixed(2);
                            html += `<tr>
                                <td><strong>${g.subject_name}</strong></td>
                                <td>${g.process_score}</td>
                                <td>${g.final_score}</td>
                                <td><strong>${t}</strong></td>
                            </tr>`;
                        }
                    } else {
                        html += `
                            <td colspan="4" style="text-align:center; color:gray;">Chưa có điểm ở ${selectedSemester}</td>
                            <td><button class="btn-action btn-edit" onclick="openEditModal('${s.id}')">Nhập điểm</button></td>
                        </tr>`;
                    }
                });
                adminStudentsList.innerHTML = html;
            }
        }

        // TÍNH NĂNG: Thêm học sinh mới
        const addStudentForm = document.getElementById('add-student-form');
        if (addStudentForm) {
            addStudentForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                const newData = {
                    student_id: document.getElementById('add-student-id').value,
                    full_name: document.getElementById('add-full-name').value,
                    class_name: document.getElementById('add-class-name').value
                };
                const res = await fetch('http://localhost:3000/api/admin/students', { 
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newData) 
                });
                if ((await res.json()).success) { 
                    alert("Đã thêm học sinh thành công!"); 
                    closeModal('add-student-modal'); 
                    addStudentForm.reset();
                    loadAdminStudents(); 
                }
            });
        }

        // TÍNH NĂNG: Cập nhật / Nhập điểm mới
        const editForm = document.getElementById('edit-grade-form');
        if (editForm) {
            editForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                const updateData = {
                    student_id: document.getElementById('edit-student-id').value,
                    semester: document.getElementById('edit-semester').value,
                    subject_name: document.getElementById('edit-subject-name').value,
                    process_score: document.getElementById('edit-process').value,
                    final_score: document.getElementById('edit-final').value
                };
                const res = await fetch('http://localhost:3000/api/admin/grades', { 
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updateData) 
                });
                if ((await res.json()).success) { 
                    alert("Đã lưu điểm thành công!"); 
                    closeModal('edit-modal'); 
                    loadAdminStudents(); 
                }
            });
        }

        window.loadAdminComments = async function() {
            const res = await fetch('http://localhost:3000/api/admin/comments');
            const result = await res.json();
            if (result.success) {
                document.getElementById('admin-total-comments').innerText = result.data.length;
                let html = "";
                result.data.forEach(c => {
                    html += `<tr><td>#${c.id}</td><td>${c.reviewer_name}</td><td>${c.content}</td><td><a href="student.html?id=${c.target_student_id}" target="_blank">${c.target_student_id}</a></td><td><button class="btn-action btn-delete" onclick="deleteComment(${c.id})">Xóa</button></td></tr>`;
                });
                adminCommentsList.innerHTML = html;
            }
        }

        loadAdminStudents(); loadAdminComments();

        window.deleteComment = async function(id) {
            if(confirm("Xóa bình luận này?")) {
                const res = await fetch(`http://localhost:3000/api/admin/comments/${id}`, { method: 'DELETE' });
                if ((await res.json()).success) loadAdminComments();
            }
        }

        
    }
});

// ==========================================
// 3. CÁC HÀM HỖ TRỢ
// ==========================================
function renderComments(commentsArray) {
    const commentsListDiv = document.getElementById('comments-list');
    if (!commentsArray || commentsArray.length === 0) return commentsListDiv.innerHTML = "<p>Chưa có bình luận nào.</p>";
    let html = "<h4>Các bình luận gần đây:</h4>";
    commentsArray.forEach(c => {
        let stars = "★".repeat(c.rating) + "☆".repeat(5 - c.rating);
        html += `<div class="comment-item"><div class="comment-meta"><strong>${c.reviewer_name}</strong> - <span style="color:gold;">${stars}</span></div><p>${c.content}</p></div>`;
    });
    commentsListDiv.innerHTML = html;
}

// Gọi mở popup sửa điểm (Giờ chỉ cần truyền ID HS, giáo viên tự chọn Môn)
// Các hàm hỗ trợ Popup Admin
function openEditModal(studentId) {
    document.getElementById('edit-student-id').value = studentId;
    document.getElementById('edit-subject-name').value = "";
    document.getElementById('edit-semester').value = "Học kỳ 1";
    document.getElementById('edit-process').value = "";
    document.getElementById('edit-final').value = "";
    document.getElementById('edit-modal').style.display = 'block';
}

function openAddStudentModal() {
    document.getElementById('add-student-modal').style.display = 'block';
}

function closeModal(modalId) { 
    document.getElementById(modalId).style.display = 'none'; 
}
function searchStudent() {
    const id = document.getElementById('search-id').value.trim();
    if (id) window.location.href = `student.html?id=${id}`;
}