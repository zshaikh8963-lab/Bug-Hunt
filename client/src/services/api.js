const API_HOST = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '';
const API_BASE = API_HOST ? `${API_HOST}/api` : '/api';

export const api = {
    // 1. Competition Status
    async getCompetitionStatus() {
        const res = await fetch(`${API_BASE}/competition/status`);
        return res.json();
    },

    // 2. Team Authentication & Registration (4 Students)
    async registerTeam(data) {
        const res = await fetch(`${API_BASE}/teams/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    async loginTeam(code) {
        const res = await fetch(`${API_BASE}/teams/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
        });
        return res.json();
    },

    async getTeamSession(teamId) {
        const res = await fetch(`${API_BASE}/teams/session?team_id=${encodeURIComponent(teamId)}`);
        return res.json();
    },

    // 3. Rounds Gameplay (R1, R2, R3)
    async getRoundTasks(teamId, roundNum) {
        const res = await fetch(`${API_BASE}/rounds/current?team_id=${encodeURIComponent(teamId)}&round=${roundNum}`);
        return res.json();
    },

    async submitR1Answer(data) {
        const res = await fetch(`${API_BASE}/rounds/r1/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    async submitR2Answer(data) {
        const res = await fetch(`${API_BASE}/rounds/r2/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    async runR3Test(data) {
        const res = await fetch(`${API_BASE}/rounds/r3/run-test`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    async submitR3Answer(data) {
        const res = await fetch(`${API_BASE}/rounds/r3/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    async recordViolation(teamId, violationType, details = '') {
        const res = await fetch(`${API_BASE}/rounds/violation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ team_id: teamId, violation_type: violationType, details })
        });
        return res.json();
    },

    // 4. Leaderboard
    async getLeaderboard(search = '') {
        const res = await fetch(`${API_BASE}/leaderboard?search=${encodeURIComponent(search)}`);
        return res.json();
    },

    // 5. Certificates & Verification
    async verifyCertificate(certId) {
        const res = await fetch(`${API_BASE}/certificates/verify/${encodeURIComponent(certId)}`);
        return res.json();
    },

    async getTeamCertificates(teamId) {
        const res = await fetch(`${API_BASE}/certificates/team/${encodeURIComponent(teamId)}`);
        return res.json();
    },

    // 6. Demo Mode Simulation
    async runDemoSimulation() {
        const res = await fetch(`${API_BASE}/demo/run-simulation`, { method: 'POST' });
        return res.json();
    },

    async clearDemoSimulation() {
        const res = await fetch(`${API_BASE}/demo/clear`, { method: 'POST' });
        return res.json();
    },

    // 7. Admin Authentication & Controls
    async adminLogin(username, password) {
        const res = await fetch(`${API_BASE}/auth/admin-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        return res.json();
    },

    getAdminHeaders() {
        const token = localStorage.getItem('bughunt_admin_token') || '';
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    },

    async getAdminStats() {
        const res = await fetch(`${API_BASE}/admin/statistics`, { headers: this.getAdminHeaders() });
        return res.json();
    },

    async getAdminTeams() {
        const res = await fetch(`${API_BASE}/admin/teams`, { headers: this.getAdminHeaders() });
        return res.json();
    },

    async executeTeamAction(teamId, action, data = {}) {
        const res = await fetch(`${API_BASE}/admin/teams/${encodeURIComponent(teamId)}/${action}`, {
            method: 'POST',
            headers: this.getAdminHeaders(),
            body: JSON.stringify(data)
        });
        return res.json();
    },

    async controlCompetition(action, round = 1, message = '') {
        const res = await fetch(`${API_BASE}/admin/competition/control`, {
            method: 'POST',
            headers: this.getAdminHeaders(),
            body: JSON.stringify({ action, round, message })
        });
        return res.json();
    },

    async setProjectorReveal(state) {
        const res = await fetch(`${API_BASE}/admin/projector/reveal`, {
            method: 'POST',
            headers: this.getAdminHeaders(),
            body: JSON.stringify({ state })
        });
        return res.json();
    },

    async lockResults() {
        const res = await fetch(`${API_BASE}/admin/results/lock`, {
            method: 'POST',
            headers: this.getAdminHeaders()
        });
        return res.json();
    },

    async generateCertificates(filter = 'all') {
        const res = await fetch(`${API_BASE}/admin/certificates/generate`, {
            method: 'POST',
            headers: this.getAdminHeaders(),
            body: JSON.stringify({ filter })
        });
        return res.json();
    },

    async getAdminCertificates() {
        const res = await fetch(`${API_BASE}/admin/certificates/list`, { headers: this.getAdminHeaders() });
        return res.json();
    },

    async revokeCertificate(certId) {
        const res = await fetch(`${API_BASE}/admin/certificates/${encodeURIComponent(certId)}/revoke`, {
            method: 'POST',
            headers: this.getAdminHeaders()
        });
        return res.json();
    },

    async getSettings() {
        const res = await fetch(`${API_BASE}/admin/settings`, { headers: this.getAdminHeaders() });
        return res.json();
    },

    async updateSettings(data) {
        const res = await fetch(`${API_BASE}/admin/settings`, {
            method: 'PUT',
            headers: this.getAdminHeaders(),
            body: JSON.stringify(data)
        });
        return res.json();
    },

    async getQuestionBank() {
        const res = await fetch(`${API_BASE}/admin/questions-bank`, { headers: this.getAdminHeaders() });
        return res.json();
    },

    async createQuestion(round, data) {
        const res = await fetch(`${API_BASE}/admin/questions/${round}`, {
            method: 'POST',
            headers: this.getAdminHeaders(),
            body: JSON.stringify(data)
        });
        return res.json();
    },

    async updateQuestion(round, id, data) {
        const res = await fetch(`${API_BASE}/admin/questions/${round}/${id}`, {
            method: 'PUT',
            headers: this.getAdminHeaders(),
            body: JSON.stringify(data)
        });
        return res.json();
    },

    async deleteQuestion(round, id) {
        const res = await fetch(`${API_BASE}/admin/questions/${round}/${id}`, {
            method: 'DELETE',
            headers: this.getAdminHeaders()
        });
        return res.json();
    },

    async toggleQuestionStatus(round, id) {
        const res = await fetch(`${API_BASE}/admin/questions/${round}/${id}/toggle`, {
            method: 'PATCH',
            headers: this.getAdminHeaders()
        });
        return res.json();
    },

    async changeAdminPassword(data) {
        const res = await fetch(`${API_BASE}/admin/change-password`, {
            method: 'POST',
            headers: this.getAdminHeaders(),
            body: JSON.stringify(data)
        });
        return res.json();
    }
};

