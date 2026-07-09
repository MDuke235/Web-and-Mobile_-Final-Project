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

document.addEventListener("DOMContentLoaded", async function() {
    // --- TRANG BẢNG ĐIỂM (student.html) ---
    const studentInfoDiv = document.getElementById('student-info');
    if (studentInfoDiv) {
        const urlParams = new URLSearchParams(window.location.search);
        let studentId = urlParams.get('id');

        const currentUserStr = localStorage.getItem('currentUser');
        if (currentUserStr) {
            const user = JSON.parse(currentUserStr);
            // BẢO MẬT: Nếu là học sinh, CHỈ ĐƯỢC PHÉP xem điểm của chính mình
            if (user.role === 'user') {
                if (studentId !== user.username) {
                    studentId = user.username;
                    window.history.replaceState(null, null, `?id=${studentId}`);
                }
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
});
