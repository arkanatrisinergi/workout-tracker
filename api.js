const ApiService = {
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

    async checkIn(user, date, time, duration) {
        try {
            const payload = {
                action: "insert",
                userName: user,
                workoutDate: date,
                workoutTime: time,
                duration: duration || 0
            };

            await fetch(APP_CONFIG.API_URL, {
                method: "POST",
                mode: "no-cors",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            
            return { status: "success" };
        } catch (error) {
            console.error("Error during check-in:", error);
            throw error;
        }
    },

    getLocalDateString() {
        const d = new Date();
        const offset = d.getTimezoneOffset();
        const localDate = new Date(d.getTime() - (offset * 60 * 1000));
        return localDate.toISOString().split('T')[0];
    },

    cleanGoogleSheetsTime(rawTime) {
        if (!rawTime) return "";
        let timeStr = String(rawTime).trim();

        // Jika membawa format ISO utuh dari database
        if (timeStr.includes('T')) {
            timeStr = timeStr.split('T')[1];
        }
        // Pisahkan spasi (AM/PM) jika ada
        timeStr = timeStr.split(' ')[0];

        // Ekstraksi angka jam & menit secara absolut menggunakan Regex
        const match = timeStr.match(/^(\d{1,2})[:.](\d{2})/);
        if (match) {
            const hours = match[1].padStart(2, '0');
            const minutes = match[2];
            return `${hours}:${minutes}`;
        }
        return timeStr;
    }
};