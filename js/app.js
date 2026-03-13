// Global Variables
let currentStudent = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Enter key to submit
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
    
    // Reset error
    errorMsg.classList.remove('show');
    
    // Validate ID Card
    if (!idCard || idCard.length !== 13 || !/^\d{13}$/.test(idCard)) {
        showError(CONFIG.MESSAGES.INVALID_ID);
        return;
    }
    
    // Show loading
    loading.classList.add('show');
    
    try {
        // Fetch data from Google Sheets
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

// Display Dashboard
function displayDashboard() {
    // Hide login, show dashboard
    document.getElementById('loginSection').classList.remove('active');
    document.getElementById('dashboardSection').classList.add('active');
    
    // Display student info (ไม่แสดงเลขบัตร)
    const student = currentStudent.student;
    // document.getElementById('studentPhoto').src = student.photoUrl || '';
    document.getElementById('studentName').textContent = `${student.firstName} ${student.lastName}`;
    
    // Calculate statistics
    const attendance = currentStudent.attendance || [];
    const totalHoursAttended = attendance.reduce((sum, record) => sum + (parseFloat(record.hoursReceived) || 0), 0);
    const totalHoursSoFar = attendance.reduce((sum, record) => sum + (parseFloat(record.totalHours) || 0), 0);
    
    // ชั่วโมงทั้งหลักสูตร (267) จาก API summary
    const totalHoursFull = parseFloat(currentStudent.summary?.totalHoursFull) || totalHoursSoFar;
    
    // เปอร์เซ็นต์เทียบกับคาบที่ผ่านมาแล้ว (แสดงในการ์ด)
    const attendancePercent = totalHoursSoFar > 0 
        ? ((totalHoursAttended / totalHoursSoFar) * 100).toFixed(2) 
        : '0.00';
    
    // Display statistics
    document.getElementById('totalHours').textContent = formatHours(totalHoursAttended);
    document.getElementById('totalHoursMax').textContent = formatHours(totalHoursSoFar);
    document.getElementById('attendancePercent').textContent = `${attendancePercent}%`;
    
    // หลอด scale ตามชั่วโมงทั้งหลักสูตรจริง (267)
    const realPercent = totalHoursFull > 0 
        ? (totalHoursAttended / totalHoursFull) * 100 
        : 0;
    const progressFill = document.getElementById('progressFill');
    progressFill.style.width = `${Math.min(realPercent, 100)}%`;
    
    // ข้อความข้างหลอด เช่น "42.5 / 267 ชั่วโมง"
    document.getElementById('progressHours').textContent = `${formatHours(totalHoursAttended)} / ${formatHours(totalHoursFull)}`;
    
    // Display attendance table
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