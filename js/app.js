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

// แปลง URL รูปให้เป็น HTTPS เสมอ
function toHttpsImage(url) {
    if (!url) return 'https://via.placeholder.com/80';
    if (url.startsWith('http://')) {
        return `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
    }
    return url;
}

// Display Dashboard
function displayDashboard() {
    document.getElementById('loginSection').classList.remove('active');
    document.getElementById('dashboardSection').classList.add('active');
    
    const student = currentStudent.student;
    document.getElementById('studentPhoto').src = toHttpsImage(student.photoUrl);
    document.getElementById('studentName').textContent = `${student.firstName} ${student.lastName}`;
    
    const attendance = currentStudent.attendance || [];
    const totalHoursAttended = attendance.reduce((sum, record) => sum + (parseFloat(record.hoursReceived) || 0), 0);
    const totalHoursSoFar = attendance.reduce((sum, record) => sum + (parseFloat(record.totalHours) || 0), 0);
    
    const totalHoursFull = parseFloat(currentStudent.summary?.totalHoursFull) || totalHoursSoFar;
    
    const attendancePercent = totalHoursSoFar > 0 
        ? ((totalHoursAttended / totalHoursSoFar) * 100).toFixed(2) 
        : '0.00';
    
    document.getElementById('totalHours').textContent = Math.floor(totalHoursAttended);
    document.getElementById('totalHoursMax').textContent = Math.floor(totalHoursSoFar);
    document.getElementById('attendancePercent').textContent = `${attendancePercent}%`;
    
    const realPercent = totalHoursFull > 0 
        ? (totalHoursAttended / totalHoursFull) * 100 
        : 0;
    document.getElementById('progressFill').style.width = `${Math.min(realPercent, 100)}%`;
    document.getElementById('progressHours').textContent = `${Math.floor(totalHoursAttended)} / ${Math.floor(totalHoursFull)}`;
    
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
            <td>${record.totalHours}</td>
            <td>${record.hoursReceived}</td>
            <td class="${statusClass}">${status}</td>
        `;
        
        tbody.appendChild(row);
    });
}

// Format Date
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('th-TH', options);
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

// ทดสอบ API ด้วยการจำลองข้อมูล (สำหรับการพัฒนา)
// อีกที