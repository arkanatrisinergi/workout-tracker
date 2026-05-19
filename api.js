const ApiService = {
    /**
     * Mengambil seluruh riwayat data dari Google Sheets
     */
    async fetchHistory() {
        try {
            const response = await fetch(`${APP_CONFIG.API_URL}?action=read`);
            if (!response.ok) throw new Error("Network response was not ok");
            
            const jsonResult = await response.json();
            if (jsonResult.status === "success" && Array.isArray(jsonResult.data)) {
                return jsonResult.data.map(row => ({
                    userName: row.userName ? String(row.userName).trim() : "",
                    workoutDate: row.workoutDate ? String(row.workoutDate).trim() : "",
                    workoutTime: this.cleanGoogleSheetsTime(row.workoutTime),
                    duration: row.duration ? parseInt(row.duration, 10) || 0 : 0
                }));
            }
            return [];
        } catch (error) {
            console.error("Error fetching history:", error);
            throw error;
        }
    },

    /**
     * Mengirimkan data check-in baru ke Google Sheets
     */
    async checkIn(user, date, time, duration) {
        try {
            const payload = {
                action: "insert",
                userName: user,
                workoutDate: date,
                workoutTime: time,
                duration: duration || 0
            };

            const response = await fetch(APP_CONFIG.API_URL, {
                method: "POST",
                mode: "no-cors", // Menggunakan no-cors sesuai arsitektur Google Apps Script
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            
            return { status: "success" };
        } catch (error) {
            console.error("Error during check-in:", error);
            throw error;
        }
    },

    /**
     * Helper untuk mendapatkan tanggal lokal user (YYYY-MM-DD) tanpa distorsi timezone
     */
    getLocalDateString() {
        const d = new Date();
        const offset = d.getTimezoneOffset();
        const localDate = new Date(d.getTime() - (offset * 60 * 1000));
        return localDate.toISOString().split('T')[0];
    },

    /**
     * Fitur Keamanan: Mengonversi format waktu Google Sheets yang korup menjadi HH:MM bersih
     */
    cleanGoogleSheetsTime(rawTime) {
        if (!rawTime) return "00:00";
        let timeStr = String(rawTime).trim();

        // 1. Jika terpotong format ISO standar (eg. 2026-05-19T15:30:00.000Z)
        if (timeStr.includes('T')) {
            timeStr = timeStr.split('T')[1];
        }

        // 2. Jika format mengandung spasi am/pm atau info zona (eg. "15:30:00 UTC")
        timeStr = timeStr.split(' ')[0];

        // 3. Ambil bagian Jam dan Menit saja
        const parts = timeStr.split(':');
        if (parts.length >= 2) {
            const hours = parts[0].padStart(2, '0');
            const minutes = parts[1].padStart(2, '0');
            
            // Validasi apakah benar angka, menghindari string rusak
            if (!isNaN(hours) && !isNaN(minutes)) {
                return `${hours}:${minutes}`;
            }
        }
        
        return "00:00"; // Fallback jika data rusak total
    }
};