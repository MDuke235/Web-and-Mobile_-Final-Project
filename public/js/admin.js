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

document.addEventListener("DOMContentLoaded", async function() {
    // --- TRANG QUẢN TRỊ ADMIN (admin.html) ---
    const adminStudentsList = document.getElementById('admin-students-list');
    const adminCommentsList = document.getElementById('admin-comments-list');

    if (adminStudentsList && adminCommentsList) {
        // BẢO MẬT: CHẶN TRUY CẬP NẾU KHÔNG PHẢI ADMIN HOẶC GIÁO VIÊN
        const loggedInUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!loggedInUser || (loggedInUser.role !== 'admin' && loggedInUser.role !== 'teacher')) {
            alert("Bạn không có quyền truy cập trang này!");
            window.location.href = "index.html";
            return;
        }

        // KIỂM TRA QUYỀN VÀ ẨN GIAO DIỆN NẾU LÀ GIÁO VIÊN
        if (loggedInUser.role === 'teacher') {
            document.getElementById('dashboard-title').innerText = "Bảng điều khiển Giáo viên";
            if (document.getElementById('admin-stats-section')) document.getElementById('admin-stats-section').style.display = 'none';
            if (document.getElementById('btn-add-student')) document.getElementById('btn-add-student').style.display = 'none';
            if (document.getElementById('admin-comments-section')) document.getElementById('admin-comments-section').style.display = 'none';
        }
        try {
            const viewRes = await fetch('http://localhost:3000/api/stats/view');
            const viewData = await viewRes.json();
            if (viewData.success) document.getElementById('admin-total-views').innerText = viewData.total_views;
        } catch (e) { }

        window.allStudentsData = [];

        window.loadAdminStudents = async function() {
            const res = await fetch('http://localhost:3000/api/admin/students');
            const result = await res.json();
            if (result.success) {
                window.allStudentsData = result.data;
                renderAdminTable(); 
            }
        }

        window.renderAdminTable = function() {
            if (!window.allStudentsData) return;

            const selectedSemester = document.getElementById('admin-semester-filter').value;
            
            const searchInput = document.getElementById('search-student');
            const searchText = searchInput ? searchInput.value.toLowerCase().trim() : "";

            const studentsMap = {};
            
            window.allStudentsData.forEach(item => {
                const matchSearch = item.full_name.toLowerCase().includes(searchText) || item.student_id.toString().includes(searchText);
                
                if (matchSearch) {
                    if(!studentsMap[item.student_id]) {
                        studentsMap[item.student_id] = { id: item.student_id, name: item.full_name, class: item.class_name, grades: [] };
                    }
                    if (item.subject_name && item.semester === selectedSemester) {
                        studentsMap[item.student_id].grades.push(item);
                    }
                }
            });

            let html = "";
            const studentArray = Object.values(studentsMap);
            
            if (studentArray.length === 0) {
                html = `<tr><td colspan="7" style="text-align:center; color:red;">Không tìm thấy học sinh nào phù hợp!</td></tr>`;
            } else {
                studentArray.forEach(s => {
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
                        html += `
                            <td><strong>${first.subject_name}</strong></td>
                            <td>${first.process_score}</td>
                            <td>${first.final_score}</td>
                            <td><strong>${total}</strong></td>
                            <td rowspan="${rowCount}"><button class="btn-action btn-edit action-column" onclick="openEditModal('${s.id}')">Nhập / Sửa điểm</button></td>
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
                            <td class="action-column"><button class="btn-action btn-edit" onclick="openEditModal('${s.id}')">Nhập điểm</button></td>
                        </tr>`;
                    }
                });
            }
            document.getElementById('admin-students-list').innerHTML = html;
        }

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
                
                try {
                    const res = await fetch('http://localhost:3000/api/admin/grades', { 
                        method: 'POST', 
                        headers: { 'Content-Type': 'application/json' }, 
                        body: JSON.stringify(updateData) 
                    });
                    
                    const result = await res.json();
                    
                    if (result.success) { 
                        alert("Đã lưu điểm thành công!"); 
                        closeModal('edit-modal'); 
                        loadAdminStudents(); 
                    } else {
                        alert(result.message || "Có lỗi xảy ra khi lưu điểm!");
                    }
                } catch (error) {
                    alert("Lỗi kết nối đến máy chủ!");
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
