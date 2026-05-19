// State Management
const State = {
    currentUser: localStorage.getItem('activeUser') || 'Husband',
    historyData: []
};

// UI Elements Core Cache
const DOM = {
    actionZone: () => document.getElementById('action-zone'),
    questionZone: () => document.getElementById('question-zone'),
    checkinBtn: () => document.getElementById('checkin-btn'),
    submitTimeBtn: () => document.getElementById('submit-time-btn'),
    skipTimeBtn: () => document.getElementById('skip-time-btn'),
    durationInput: () => document.getElementById('duration-input'),
    calendarTitle: () => document.getElementById('calendar-title'),
    calendarGrid: () => document.getElementById('calendar-grid'),
    appVersion: () => document.getElementById('app-version'),
    userButtons: () => document.querySelectorAll('.user-btn')
};

// Orchestration & Logic
const App = {
    init() {
        this.setupEventListeners();
        this.syncUserUI();
        this.loadDashboard();
    },

    setupEventListeners() {
        DOM.checkinBtn().addEventListener('click', () => {
            DOM.actionZone().classList.add('hidden');
            DOM.questionZone().classList.remove('hidden');
            DOM.durationInput().focus();
        });

        DOM.skipTimeBtn().addEventListener('click', () => this.handleCheckIn(''));
        
        DOM.submitTimeBtn().addEventListener('click', () => {
            const mins = DOM.durationInput().value;
            this.handleCheckIn(mins);
        });
    },

    syncUserUI() {
        DOM.userButtons().forEach(btn => {
            if (btn.getAttribute('data-user') === State.currentUser) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        DOM.calendarTitle().innerText = `${State.currentUser}'s Month`;
        DOM.appVersion().innerText = `v${APP_CONFIG.VERSION}`;
    },

    switchUser(targetUser) {
        if (State.currentUser === targetUser) return;
        State.currentUser = targetUser;
        localStorage.setItem('activeUser', targetUser);
        this.syncUserUI();
        this.renderGrid();
    },

    async handleCheckIn(duration) {
        DOM.questionZone().innerHTML = `<p class="loading-text">Saving entry securely...</p>`;
        
        try {
            await ApiService.checkIn(State.currentUser, duration);
            alert(`🎉 Splendid job! Day tracked for ${State.currentUser}.`);
            location.reload();
        } catch (err) {
            alert('Failed to connect to spreadsheet pipeline.');
            console.error(err);
        }
    },

    async loadDashboard() {
        DOM.calendarGrid().innerHTML = `<div style="grid-column: span 7; color: #666; font-size:14px; text-align:center; padding:20px;">Loading charts...</div>`;
        
        try {
            State.historyData = await ApiService.fetchHistory();
            this.renderGrid();
        } catch (err) {
            DOM.calendarGrid().innerHTML = `<div style="grid-column: span 7; color: #da3637; font-size:12px; text-align:center; padding:20px;">Failed to load historical data grid.</div>`;
        }
    },

    renderGrid() {
        DOM.calendarGrid().innerHTML = ""; 
        const now = new Date();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        
        // Isolate matched dates based on local tracking structures and clean up string dates
        const checkedDays = State.historyData
            .filter(entry => entry.userName === State.currentUser)
            .map(entry => {
                const dateStr = String(entry.timestamp).split('T')[0];
                const parts = dateStr.split('-');
                return parseInt(parts[2], 10);
            });

        for (let i = 1; i <= daysInMonth; i++) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.innerText = i;
            
            if (checkedDays.includes(i)) {
                square.classList.add('active');
            }
            DOM.calendarGrid().appendChild(square);
        }
    }
};

// Fire App Execution on script injection
document.addEventListener('DOMContentLoaded', () => App.init());