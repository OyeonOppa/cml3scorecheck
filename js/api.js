// API Functions
const API = {
    // ดึงข้อมูลนักศึกษาและการเข้าเรียน
    async getStudentData(idCard) {
        try {
            const response = await fetch(`${CONFIG.API_URL}?action=getStudent&idCard=${idCard}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching student data:', error);
            throw error;
        }
    }
};