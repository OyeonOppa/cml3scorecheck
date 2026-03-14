// Global Variables
let currentStudent = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('idCardInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkAttendance();
        }
    });
});

// Format Hours (42 → "42", 42.5 → "42.5", 42.0 → "42")
function formatHours(hours) {
    return hours % 1 === 0 ? hours.toFixed(0) : hours.toFixed(1);
}

// Check Attendance Function
async function checkAttendance() {
    const idCardInput = document.getElementById('idCardInput');
    const idCard = idCardInput.value.trim();
    const errorMsg = document.getElementById('errorMsg');
    const loading = document.getElementById('loading');
    
    errorMsg.classList.remove('show');
    
    if (!idCard || idCard.length !== 13 || !/^\d{13}$/.test(idCard)) {
        showError(CONFIG.MESSAGES.INVALID_ID);
        return;
    }
    
    loading.classList.add('show');
    
    try {
        const data = await API.getStudentData(idCard);
        if (data.success && data.student) {
            currentStudent = data;
            displayDashboard();
        } else {
            showError(CONFIG.MESSAGES.NOT_FOUND);
        }
    } catch (error) {
        showError(CONFIG.MESSAGES.ERROR);
    } finally {
        loading.classList.remove('show');
    }
}

// แสดงตัวอักษรย่อในกรอบรูป (fallback)
function showPhotoFallback(firstName) {
    const photoEl = document.getElementById('studentPhoto');
    const initial = (firstName || '?').charAt(0).toUpperCase();

    // ซ่อน img แล้วแปลงกรอบเป็นวงกลมตัวอักษรแทน
    photoEl.style.display = 'none';

    // สร้าง fallback div ถ้ายังไม่มี
    let fallback = document.getElementById('photoFallback');
    if (!fallback) {
        fallback = document.createElement('div');
        fallback.id = 'photoFallback';
        fallback.style.cssText = `
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background: #4a90e2;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.6rem;
            font-weight: bold;
            flex-shrink: 0;
        `;
        photoEl.parentNode.insertBefore(fallback, photoEl);
    }
    fallback.textContent = initial;
    fallback.style.display = 'flex';
}

// Display Dashboard
function displayDashboard() {
    document.getElementById('loginSection').classList.remove('active');
    document.getElementById('dashboardSection').classList.add('active');

    const student = currentStudent.student;

    // ชื่อ-สกุล
    document.getElementById('studentName').textContent = `${student.firstName} ${student.lastName}`;

    // ชื่อเล่น
    const nicknameEl = document.getElementById('studentNickname');
    if (nicknameEl) {
        nicknameEl.textContent = student.nickname ? `(${student.nickname})` : '';
    }

    // รูปภาพ
    const photoEl = document.getElementById('studentPhoto');
    const fallback = document.getElementById('photoFallback');
    if (fallback) fallback.style.display = 'none'; // reset

    if (student.photoUrl) {
        const safeUrl = student.photoUrl.replace(/^http:\/\//i, 'https://');
        photoEl.style.display = 'block';
        photoEl.src = safeUrl;
        photoEl.onerror = function() {
            this.onerror = null;
            showPhotoFallback(student.firstName);
        };
    } else {
        showPhotoFallback(student.firstName);
    }

    // Calculate statistics
    const attendance = currentStudent.attendance || [];
    const totalHoursAttended = attendance.reduce((sum, r) => sum + (parseFloat(r.hoursReceived) || 0), 0);
    const totalHoursSoFar = attendance.reduce((sum, r) => sum + (parseFloat(r.totalHours) || 0), 0);
    const totalHoursFull = parseFloat(currentStudent.summary?.totalHoursFull) || totalHoursSoFar;

    const attendancePercent = totalHoursSoFar > 0
        ? ((totalHoursAttended / totalHoursSoFar) * 100).toFixed(2)
        : '0.00';

    document.getElementById('totalHours').textContent = formatHours(totalHoursAttended);
    document.getElementById('totalHoursMax').textContent = formatHours(totalHoursSoFar);
    document.getElementById('attendancePercent').textContent = `${attendancePercent}%`;

    const realPercent = totalHoursFull > 0 ? (totalHoursAttended / totalHoursFull) * 100 : 0;
    document.getElementById('progressFill').style.width = `${Math.min(realPercent, 100)}%`;
    document.getElementById('progressHours').textContent = `${formatHours(totalHoursAttended)} / ${formatHours(totalHoursFull)}`;

    displayAttendanceTable(attendance);
}

// Display Attendance Table
function displayAttendanceTable(attendance) {
    const tbody = document.getElementById('attendanceBody');
    tbody.innerHTML = '';

    attendance.forEach((record, index) => {
        const row = document.createElement('tr');
        const status = parseFloat(record.hoursReceived) > 0 ? 'มา' : 'ขาด';
        const statusClass = status === 'มา' ? 'status-present' : 'status-absent';

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${formatDate(record.date)}</td>
            <td>${record.time}</td>
            <td>${record.location}</td>
            <td>${record.details}</td>
            <td>${formatHours(parseFloat(record.totalHours) || 0)}</td>
            <td>${formatHours(parseFloat(record.hoursReceived) || 0)}</td>
            <td class="${statusClass}">${status}</td>
        `;
        tbody.appendChild(row);
    });
}

// Format Date
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Show Error
function showError(message) {
    const errorMsg = document.getElementById('errorMsg');
    errorMsg.textContent = message;
    errorMsg.classList.add('show');
}

// Logout Function
function logout() {
    currentStudent = null;
    document.getElementById('dashboardSection').classList.remove('active');
    document.getElementById('loginSection').classList.add('active');
    document.getElementById('idCardInput').value = '';
}