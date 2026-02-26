// Google Sheets Configuration
const CONFIG = {
    // แทนที่ด้วย URL ของ Google Apps Script ที่คุณ Deploy
    API_URL: 'https://script.google.com/macros/s/AKfycbxDF41tTABlQOz_yaJdNPAvddXnlLhA-_g4Y0wryPEpjhknXTQTHpRiy9ROPo3sEvaPnw/exec',
    
    // ชั่วโมงเรียนทั้งหมดของหลักสูตร
    TOTAL_HOURS: 267,
    
    // ข้อความแสดงผล
    MESSAGES: {
        LOADING: 'กำลังโหลดข้อมูล...',
        INVALID_ID: 'กรุณากรอกเลขบัตรประชาชน 13 หลัก',
        NOT_FOUND: 'ไม่พบข้อมูลนักศึกษา',
        ERROR: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
    }
};