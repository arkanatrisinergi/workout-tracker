const ApiService = {
    /**
     * Safely grabs local date formatted as YYYY-MM-DD
     */
    getLocalDateString() {
        return new Date().toLocaleDateString('sv-SE'); // Outputs YYYY-MM-DD reliably
    },

    /**
     * Pushes a new check-in row to Google Sheets
     */
    async checkIn(userName, duration) {
        const payload = {
            userName: userName,
            timestamp: this.getLocalDateString(),
            duration: duration ? parseInt(duration, 10) : ""
        };

        const response = await fetch(APP_CONFIG.API_URL, {
            method: 'POST',
            mode: 'no-cors', // Required for Google Script redirects
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        return response;
    },

    /**
     * Fetches historical check-in data from Google Sheets
     */
    async fetchHistory() {
        try {
            const response = await fetch(APP_CONFIG.API_URL);
            if (!response.ok) throw new Error("Network response error");
            return await response.json();
        } catch (error) {
            console.error("ApiService.fetchHistory failed:", error);
            throw error;
        }
    }
};