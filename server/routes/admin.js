import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../database/db.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { broadcastCompetitionState, broadcastWinnerReveal, broadcastLeaderboard, broadcastProjectorIntro } from '../services/socketManager.js';
import { generateCertificatesForTeams } from '../services/certificateService.js';
import { createRequire } from 'module';
import { parseCSVToObjects } from '../services/csvParser.js';

const require = createRequire(import.meta.url);
const archiver = require('archiver');

const router = express.Router();

// Apply admin authentication to all routes below
router.use(authenticateAdmin);

// Helper: Log Admin Actions
function logAdminAction(adminUser, action, target = '', details = '') {
    try {
        db.prepare(`
            INSERT INTO admin_logs (admin_username, action, target, details)
            VALUES (?, ?, ?, ?)
        `).run(adminUser, action, target, details);
    } catch (e) {
        console.error('Failed to write admin log:', e);
    }
}

// 1. GET /api/admin/statistics - Overview metrics for dashboard
router.get('/statistics', (req, res) => {
    try {
        const totalTeams = db.prepare('SELECT COUNT(*) as c FROM teams').get().c;
        const activeTeams = db.prepare(`SELECT COUNT(*) as c FROM teams WHERE status IN ('ROUND_1', 'ROUND_2', 'ROUND_3') AND is_disqualified = 0`).get().c;
        const completedTeams = db.prepare(`SELECT COUNT(*) as c FROM teams WHERE status = 'FINISHED' AND is_disqualified = 0`).get().c;
        const disqualifiedTeams = db.prepare('SELECT COUNT(*) as c FROM teams WHERE is_disqualified = 1').get().c;

        const scoreStats = db.prepare(`
            SELECT 
                COALESCE(AVG(final_score), 0) as avg_score,
                COALESCE(MAX(final_score), 0) as max_score
            FROM teams
            WHERE is_disqualified = 0 AND final_score > 0
        `).get();

        const currentLeader = db.prepare(`
            SELECT team_name, final_score FROM teams 
            WHERE is_disqualified = 0 
            ORDER BY final_score DESC, r3_score DESC, total_time_sec ASC LIMIT 1
        `).get();

        const r1Count = db.prepare('SELECT COUNT(*) as c FROM mcq_questions WHERE is_active = 1').get().c;
        const r2Count = db.prepare('SELECT COUNT(*) as c FROM java_challenges WHERE is_active = 1').get().c;
        const r3Count = db.prepare('SELECT COUNT(*) as c FROM python_challenges WHERE is_active = 1').get().c;

        const compState = db.prepare('SELECT * FROM competition_state WHERE id = 1').get();

        // Recent submissions
        const recentSubmissions = db.prepare(`
            SELECT rs.*, t.team_name 
            FROM round_submissions rs
            JOIN teams t ON rs.team_id = t.team_id
            ORDER BY rs.id DESC LIMIT 8
        `).all();

        // Recent violations
        const recentViolations = db.prepare(`
            SELECT v.*, t.team_name 
            FROM violations v
            JOIN teams t ON v.team_id = t.team_id
            ORDER BY v.id DESC LIMIT 8
        `).all();

        return res.json({
            success: true,
            stats: {
                total_teams: totalTeams,
                active_teams: activeTeams,
                completed_teams: completedTeams,
                disqualified_teams: disqualifiedTeams,
                average_score: Math.round(scoreStats.avg_score * 10) / 10,
                max_score: scoreStats.max_score,
                current_leader: currentLeader ? `${currentLeader.team_name} (${currentLeader.final_score}/50)` : 'None',
                competition_state: compState,
                question_counts: { r1: r1Count, r2: r2Count, r3: r3Count, total: r1Count + r2Count + r3Count },
                recent_submissions: recentSubmissions,
                recent_violations: recentViolations
            }
        });
    } catch (err) {
        console.error('Admin statistics error:', err);
        return res.status(500).json({ error: 'Failed to retrieve statistics.' });
    }
});

// 2. GET /api/admin/teams - All teams with 4 members, scores, status, violations
router.get('/teams', (req, res) => {
    try {
        const teams = db.prepare(`
            SELECT * FROM teams 
            ORDER BY is_disqualified ASC, final_score DESC, id ASC
        `).all();

        const formatted = teams.map(t => {
            const members = db.prepare('SELECT * FROM team_members WHERE team_id = ? ORDER BY member_number ASC').all(t.team_id);
            return {
                ...t,
                is_disqualified: Boolean(t.is_disqualified),
                members
            };
        });

        return res.json({
            success: true,
            count: formatted.length,
            teams: formatted
        });
    } catch (err) {
        console.error('Admin teams error:', err);
        return res.status(500).json({ error: 'Failed to retrieve teams.' });
    }
});

// Team Actions: Disqualify, Restore, Reset, Adjust Score
router.post('/teams/:teamId/:action', (req, res) => {
    try {
        const { teamId, action } = req.params;
        const { reason = '', new_score } = req.body;
        const team = db.prepare('SELECT * FROM teams WHERE team_id = ?').get(teamId);

        if (!team) return res.status(404).json({ error: 'Team not found.' });

        if (action === 'disqualify') {
            db.prepare(`
                UPDATE teams 
                SET is_disqualified = 1, status = 'DISQUALIFIED', disqualify_reason = ? 
                WHERE team_id = ?
            `).run(reason || 'Disqualified by Competition Administrator', teamId);
            logAdminAction(req.admin.username, 'DISQUALIFY_TEAM', teamId, reason);

        } else if (action === 'restore') {
            db.prepare(`
                UPDATE teams 
                SET is_disqualified = 0, status = 'WAITING', disqualify_reason = '', violations_count = 0 
                WHERE team_id = ?
            `).run(teamId);
            logAdminAction(req.admin.username, 'RESTORE_TEAM', teamId, 'Restored team access');

        } else if (action === 'reset-session') {
            db.prepare('DELETE FROM round_submissions WHERE team_id = ?').run(teamId);
            db.prepare('DELETE FROM round_assignments WHERE team_id = ?').run(teamId);
            db.prepare(`
                UPDATE teams 
                SET r1_score = 0, r2_score = 0, r3_score = 0, final_score = 0,
                    status = 'WAITING', current_round = 1, total_time_sec = 0,
                    r1_finished_at = NULL, r2_finished_at = NULL, r3_finished_at = NULL
                WHERE team_id = ?
            `).run(teamId);
            logAdminAction(req.admin.username, 'RESET_TEAM_SESSION', teamId, 'Wiped round progress');

        } else if (action === 'adjust-score') {
            const adjusted = Math.min(50, Math.max(0, parseFloat(new_score) || 0));
            db.prepare('UPDATE teams SET final_score = ? WHERE team_id = ?').run(adjusted, teamId);
            logAdminAction(req.admin.username, 'ADJUST_SCORE', teamId, `Adjusted final score to ${adjusted}`);
        } else {
            return res.status(400).json({ error: `Unknown action: ${action}` });
        }

        const updated = db.prepare('SELECT * FROM teams WHERE team_id = ?').get(teamId);
        return res.json({ success: true, message: `Team action ${action} executed successfully.`, team: updated });

    } catch (err) {
        console.error('Team action error:', err);
        return res.status(500).json({ error: 'Failed to execute team action.' });
    }
});

// 3. POST /api/admin/competition/control - Tournament Round Control
router.post('/competition/control', (req, res) => {
    try {
        const { action, round, message = '' } = req.body;
        // Actions: 'START_ROUND', 'LOCK_ROUND', 'PAUSE', 'RESUME', 'END', 'RESET'
        const comp = db.prepare('SELECT * FROM competition_state WHERE id = 1').get();

        if (action === 'START_ROUND') {
            const r = parseInt(round, 10) || 1;
            const statusKey = `ROUND_${r}_ACTIVE`;
            const msg = message || `ROUND ${r} IS NOW LIVE! Begin debugging!`;

            db.prepare(`
                UPDATE competition_state 
                SET status = ?, active_round = ?, is_paused = 0, message = ?, 
                    round_started_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                WHERE id = 1
            `).run(statusKey, r, msg);

            // Update all waiting teams to this round
            db.prepare(`
                UPDATE teams 
                SET status = ?, current_round = ?
                WHERE is_disqualified = 0 AND status IN ('WAITING', 'ROUND_1_DONE', 'ROUND_2_DONE')
            `).run(`ROUND_${r}`, r);

            logAdminAction(req.admin.username, `START_ROUND_${r}`, 'COMPETITION', msg);

        } else if (action === 'LOCK_ROUND') {
            const r = parseInt(round, 10) || comp.active_round;
            const statusKey = `ROUND_${r}_COMPLETED`;
            const msg = message || `Round ${r} concluded! Submissions locked.`;

            db.prepare(`
                UPDATE competition_state 
                SET status = ?, message = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = 1
            `).run(statusKey, msg);

            logAdminAction(req.admin.username, `LOCK_ROUND_${r}`, 'COMPETITION', msg);

        } else if (action === 'PAUSE') {
            db.prepare(`
                UPDATE competition_state 
                SET is_paused = 1, paused_at = CURRENT_TIMESTAMP, 
                    message = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = 1
            `).run(message || 'COMPETITION PAUSED BY ORGANIZER. Please wait.');

            logAdminAction(req.admin.username, 'PAUSE_COMPETITION', 'COMPETITION', message);

        } else if (action === 'RESUME') {
            db.prepare(`
                UPDATE competition_state 
                SET is_paused = 0, paused_at = NULL, 
                    message = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = 1
            `).run(message || 'Competition Resumed! Continue debugging!');

            logAdminAction(req.admin.username, 'RESUME_COMPETITION', 'COMPETITION', message);

        } else if (action === 'END') {
            db.prepare(`
                UPDATE competition_state 
                SET status = 'FINISHED', is_paused = 0, ended_at = CURRENT_TIMESTAMP,
                    results_locked = 1, message = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = 1
            `).run(message || 'BUG HUNT Competition Finished! Calculating awards and certificates.');

            logAdminAction(req.admin.username, 'END_COMPETITION', 'COMPETITION', message);

        } else if (action === 'RESET_TOURNAMENT') {
            db.prepare('DELETE FROM certificates').run();
            db.prepare('DELETE FROM round_submissions').run();
            db.prepare('DELETE FROM round_assignments').run();
            db.prepare('DELETE FROM violations').run();
            db.prepare(`
                UPDATE teams 
                SET r1_score = 0, r2_score = 0, r3_score = 0, final_score = 0,
                    status = 'WAITING', current_round = 1, total_time_sec = 0,
                    is_disqualified = 0, violations_count = 0,
                    r1_finished_at = NULL, r2_finished_at = NULL, r3_finished_at = NULL
            `).run();

            db.prepare(`
                UPDATE competition_state 
                SET status = 'WAITING', active_round = 0, is_paused = 0,
                    results_locked = 0, winner_reveal_state = 'NONE',
                    round_started_at = NULL, paused_at = NULL, ended_at = NULL,
                    message = 'Tournament Reset. Ready for Round 1 start.'
                WHERE id = 1
            `).run();

            logAdminAction(req.admin.username, 'RESET_TOURNAMENT', 'COMPETITION', 'Reset all tournament progress');
        }

        const updatedState = db.prepare('SELECT * FROM competition_state WHERE id = 1').get();
        broadcastCompetitionState(updatedState);

        return res.json({
            success: true,
            message: `Competition action ${action} executed.`,
            state: updatedState
        });

    } catch (err) {
        console.error('Round control error:', err);
        return res.status(500).json({ error: 'Failed to update competition control state.' });
    }
});

// 4. POST /api/admin/projector/reveal - Winner Reveal Mode Controller
router.post('/projector/reveal', (req, res) => {
    try {
        const { state: revealState } = req.body;
        // revealState: 'NONE', 'THIRD_PLACE', 'SECOND_PLACE', 'WINNER'

        db.prepare(`
            UPDATE competition_state 
            SET winner_reveal_state = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = 1
        `).run(revealState || 'NONE');

        // Query top 3 teams
        const topTeams = db.prepare(`
            SELECT team_id, team_name, department, college, final_score, r3_score, total_time_sec 
            FROM teams 
            WHERE is_disqualified = 0 
            ORDER BY final_score DESC, r3_score DESC, total_time_sec ASC 
            LIMIT 3
        `).all();

        let targetTeam = null;
        if (revealState === 'THIRD_PLACE' && topTeams[2]) {
            targetTeam = { ...topTeams[2], place: '3rd Place', medal: '🥉' };
        } else if (revealState === 'SECOND_PLACE' && topTeams[1]) {
            targetTeam = { ...topTeams[1], place: '2nd Place', medal: '🥈' };
        } else if (revealState === 'WINNER' && topTeams[0]) {
            targetTeam = { ...topTeams[0], place: 'Champion / 1st Place', medal: '🏆' };
        }

        broadcastWinnerReveal(revealState, targetTeam);
        logAdminAction(req.admin.username, 'PROJECTOR_WINNER_REVEAL', revealState, targetTeam?.team_name || '');

        return res.json({
            success: true,
            reveal_state: revealState,
            team: targetTeam
        });

    } catch (err) {
        console.error('Projector reveal error:', err);
        return res.status(500).json({ error: 'Failed to set reveal state.' });
    }
});

// POST /api/admin/projector/play-intro - Trigger tournament intro animation on Projector display
router.post('/projector/play-intro', (req, res) => {
    try {
        broadcastProjectorIntro();
        logAdminAction(req.admin.username, 'PROJECTOR_PLAY_INTRO', 'INTRO_ANIMATION', 'Triggered tournament start animation on projector');
        return res.json({ success: true, message: 'Tournament intro animation triggered on projector.' });
    } catch (err) {
        console.error('Play intro error:', err);
        return res.status(500).json({ error: 'Failed to trigger intro animation.' });
    }
});

// 5. POST /api/admin/results/lock - Lock results permanently
router.post('/results/lock', (req, res) => {
    try {
        db.prepare('UPDATE competition_state SET results_locked = 1, updated_at = CURRENT_TIMESTAMP WHERE id = 1').run();
        logAdminAction(req.admin.username, 'LOCK_FINAL_RESULTS', 'COMPETITION', 'Results finalized and locked');
        return res.json({ success: true, message: 'Final results locked.' });
    } catch (err) {
        console.error('Lock results error:', err);
        return res.status(500).json({ error: 'Failed to lock results.' });
    }
});

// 6. GET /api/admin/export-csv - Download complete competition results as CSV
router.get('/export-csv', (req, res) => {
    try {
        const teams = db.prepare(`
            SELECT * FROM teams 
            ORDER BY is_disqualified ASC, final_score DESC, r3_score DESC, total_time_sec ASC
        `).all();

        let csv = 'Rank,Team ID,Team Name,Department,College,Pass Code,Student 1,Student 2,Student 3,Student 4,Round 1 (/10),Round 2 (/15),Round 3 (/25),Final Score (/50),Time (sec),Status,Disqualified\n';

        teams.forEach((t, i) => {
            const members = db.prepare('SELECT name FROM team_members WHERE team_id = ? ORDER BY member_number ASC').all(t.team_id);
            const m1 = members[0]?.name || '';
            const m2 = members[1]?.name || '';
            const m3 = members[2]?.name || '';
            const m4 = members[3]?.name || '';

            const clean = (val) => `"${String(val || '').replace(/"/g, '""')}"`;

            csv += [
                i + 1,
                clean(t.team_id),
                clean(t.team_name),
                clean(t.department),
                clean(t.college),
                clean(t.pass_code),
                clean(m1),
                clean(m2),
                clean(m3),
                clean(m4),
                t.r1_score || 0,
                t.r2_score || 0,
                t.r3_score || 0,
                t.final_score || 0,
                t.total_time_sec || 0,
                clean(t.status),
                t.is_disqualified ? 'YES' : 'NO'
            ].join(',') + '\n';
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="BUG_HUNT_2026_RESULTS.csv"');
        return res.send(csv);

    } catch (err) {
        console.error('CSV export error:', err);
        return res.status(500).json({ error: 'Failed to export CSV.' });
    }
});

// 7. Certificates API: Generate, List, Revoke
router.post('/certificates/generate', (req, res) => {
    try {
        const { filter = 'all' } = req.body;
        const created = generateCertificatesForTeams(filter);
        logAdminAction(req.admin.username, 'GENERATE_CERTIFICATES', filter, `Issued ${created.length} certificates`);

        return res.json({
            success: true,
            message: `Generated ${created.length} certificates successfully.`,
            count: created.length,
            certificates: created
        });
    } catch (err) {
        console.error('Generate certificates error:', err);
        return res.status(500).json({ error: 'Failed to generate certificates.' });
    }
});

router.get('/certificates/list', (req, res) => {
    try {
        const certs = db.prepare(`
            SELECT c.*, t.department, t.college
            FROM certificates c
            LEFT JOIN teams t ON c.team_id = t.team_id
            ORDER BY c.rank ASC, c.team_id ASC, c.member_number ASC
        `).all();

        return res.json({
            success: true,
            count: certs.length,
            certificates: certs
        });
    } catch (err) {
        console.error('List certificates error:', err);
        return res.status(500).json({ error: 'Failed to list certificates.' });
    }
});

router.post('/certificates/:certId/revoke', (req, res) => {
    try {
        const { certId } = req.params;
        db.prepare(`UPDATE certificates SET status = 'REVOKED' WHERE certificate_id = ?`).run(certId);
        logAdminAction(req.admin.username, 'REVOKE_CERTIFICATE', certId, 'Revoked certificate');
        return res.json({ success: true, message: `Certificate ${certId} revoked.` });
    } catch (err) {
        console.error('Revoke cert error:', err);
        return res.status(500).json({ error: 'Failed to revoke certificate.' });
    }
});

// Download ZIP of all certificates data
router.get('/certificates/export-zip', (req, res) => {
    try {
        const certs = db.prepare(`
            SELECT c.*, t.department, t.college 
            FROM certificates c 
            LEFT JOIN teams t ON c.team_id = t.team_id
            WHERE c.status = 'ACTIVE'
            ORDER BY c.rank ASC, c.team_id ASC, c.member_number ASC
        `).all();

        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'attachment; filename="BUG_HUNT_CERTIFICATES_2026.zip"');

        const archive = archiver('zip', { zlib: { level: 9 } });
        archive.pipe(res);

        // Add master index json
        archive.append(JSON.stringify(certs, null, 2), { name: 'certificates_manifest.json' });

        // Add formatted CSV
        let csv = 'Certificate ID,Student Name,Team Name,Member #,Achievement,Rank,Final Score,Date,Status\n';
        certs.forEach(c => {
            const clean = (v) => `"${String(v || '').replace(/"/g, '""')}"`;
            csv += [
                clean(c.certificate_id),
                clean(c.student_name),
                clean(c.team_name),
                c.member_number,
                clean(c.achievement),
                c.rank,
                c.final_score,
                clean(c.competition_date),
                clean(c.status)
            ].join(',') + '\n';
        });
        archive.append(csv, { name: 'certificates_index.csv' });

        archive.finalize();

    } catch (err) {
        console.error('Export zip error:', err);
        return res.status(500).json({ error: 'Failed to generate ZIP archive.' });
    }
});

// 8. Settings API
router.get('/settings', (req, res) => {
    try {
        const settings = db.prepare('SELECT * FROM competition_settings WHERE id = 1').get();
        return res.json({ success: true, settings });
    } catch (err) {
        console.error('Get settings error:', err);
        return res.status(500).json({ error: 'Failed to fetch settings.' });
    }
});

router.put('/settings', (req, res) => {
    try {
        const {
            college_name, department, event_name, competition_date,
            venue, coordinator_name, hod_name, principal_name,
            show_score = 1, show_rank = 1, show_qr = 1
        } = req.body;

        db.prepare(`
            UPDATE competition_settings SET
                college_name = COALESCE(?, college_name),
                department = COALESCE(?, department),
                event_name = COALESCE(?, event_name),
                competition_date = COALESCE(?, competition_date),
                venue = COALESCE(?, venue),
                coordinator_name = COALESCE(?, coordinator_name),
                hod_name = COALESCE(?, hod_name),
                principal_name = COALESCE(?, principal_name),
                show_score = COALESCE(?, show_score),
                show_rank = COALESCE(?, show_rank),
                show_qr = COALESCE(?, show_qr),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = 1
        `).run(
            college_name, department, event_name, competition_date,
            venue, coordinator_name, hod_name, principal_name,
            show_score, show_rank, show_qr
        );

        logAdminAction(req.admin.username, 'UPDATE_SETTINGS', 'SETTINGS', 'Updated event branding and metadata');

        const updated = db.prepare('SELECT * FROM competition_settings WHERE id = 1').get();
        return res.json({ success: true, settings: updated });
    } catch (err) {
        console.error('Update settings error:', err);
        return res.status(500).json({ error: 'Failed to update settings.' });
    }
});

// POST /api/admin/change-password - Securely change admin username and password
router.post('/change-password', (req, res) => {
    try {
        const { current_password, new_username, new_password } = req.body;
        if (!current_password || !new_password) {
            return res.status(400).json({ error: 'Current password and new password are required.' });
        }

        const admin = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(req.admin.username);
        if (!admin) {
            return res.status(404).json({ error: 'Admin account not found.' });
        }

        const isMatch = bcrypt.compareSync(current_password, admin.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Incorrect current password.' });
        }

        if (new_password.trim().length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters.' });
        }

        const salt = bcrypt.genSaltSync(10);
        const newHash = bcrypt.hashSync(new_password.trim(), salt);
        const updatedUsername = (new_username && new_username.trim()) ? new_username.trim() : admin.username;

        if (updatedUsername === 'admin' && admin.username !== 'admin') {
            try {
                db.prepare("DELETE FROM admin_users WHERE username = 'admin' AND id != ?").run(admin.id);
            } catch (e) {}
        }

        db.prepare('UPDATE admin_users SET username = ?, password_hash = ? WHERE id = ?').run(updatedUsername, newHash, admin.id);

        // Keep master fallback 'admin' account updated with same password so organizer is never locked out
        try {
            db.prepare(`
                INSERT INTO admin_users (username, password_hash)
                VALUES ('admin', ?)
                ON CONFLICT(username) DO UPDATE SET password_hash = excluded.password_hash
            `).run(newHash);
        } catch (e) {}

        logAdminAction(admin.username, 'CHANGE_PASSWORD', 'ADMIN_AUTH', `Updated admin credentials to username="${updatedUsername}"`);

        return res.json({ success: true, message: 'Admin credentials updated successfully! Please re-login with your new credentials.' });
    } catch (err) {
        console.error('Change password error:', err);
        return res.status(500).json({ error: 'Failed to update admin credentials.' });
    }
});

// 9. Question Bank Management (CRUD for R1, R2, R3)
router.get('/questions-bank', (req, res) => {
    try {
        const r1 = db.prepare('SELECT * FROM mcq_questions ORDER BY language, id').all();
        const r2 = db.prepare('SELECT * FROM java_challenges ORDER BY id').all();
        const r3 = db.prepare('SELECT * FROM python_challenges ORDER BY id').all();

        const formattedR1 = r1.map(q => {
            let options = [];
            try { options = JSON.parse(q.options_json); } catch (e) { options = []; }
            return { ...q, options };
        });
        const formattedR3 = r3.map(p => {
            let visible_tests = [];
            let hidden_tests = [];
            try { visible_tests = JSON.parse(p.visible_tests_json); } catch (e) { visible_tests = []; }
            try { hidden_tests = JSON.parse(p.hidden_tests_json); } catch (e) { hidden_tests = []; }
            return {
                ...p,
                visible_tests,
                hidden_tests
            };
        });

        return res.json({
            success: true,
            r1: formattedR1,
            r1_mcqs: formattedR1,
            r2: r2,
            r2_java: r2,
            r3: formattedR3,
            r3_python: formattedR3
        });
    } catch (err) {
        console.error('Question bank error:', err);
        return res.status(500).json({ error: 'Failed to retrieve question bank.' });
    }
});

// Helper: Map CSV answer column to 0-3 index
function parseCorrectOptionIndex(val, options) {
    const s = String(val || '').trim();
    const upper = s.toUpperCase();
    if (upper === 'A' || upper === 'OPTION A') return 0;
    if (upper === 'B' || upper === 'OPTION B') return 1;
    if (upper === 'C' || upper === 'OPTION C') return 2;
    if (upper === 'D' || upper === 'OPTION D') return 3;

    for (let i = 0; i < options.length; i++) {
        if (options[i] && options[i].trim().toLowerCase() === s.toLowerCase()) {
            return i;
        }
    }

    const num = parseInt(s, 10);
    if (!isNaN(num)) {
        if (num >= 1 && num <= 4) return num - 1;
        if (num === 0) return 0;
    }

    return 0;
}

// GET /api/admin/questions/csv-template - Download starter CSV template for Round 1 or Round 2
router.get('/questions/csv-template', (req, res) => {
    const round = req.query.round || 'r1';

    if (round === 'r2') {
        const csvContent = [
            'challenge_code,title,description,code_snippet,buggy_line,bug_type,explanation',
            'JAVA-001,Sum Greater-Than Comparison,Examine this Java arithmetic method. Identify which line contains the bug and what type of bug it is.,"1  public class Main {\\n2      public static void main(String[] args) {\\n3          int a = 10;\\n4          int b = 20;\\n5          int result = a + b;\\n6          if (result > 40) {\\n7              System.out.println(\\"\"Correct\\"\" );\\n8          } else {\\n9              System.out.println(\\"\"Incorrect\\"\" );\\n10         }\\n11     }\\n12 }",6,Logical Error,"Sum of 10+20 is 30, but line 6 checks result > 40."',
            'JAVA-002,Variable Declaration Semicolon,Examine this variable declaration. Identify which line contains the bug and what type of bug it is.,"1  public class Main {\\n2      public static void main(String[] args) {\\n3          int number = 25\\n4          System.out.println(number);\\n5      }\\n6  }",3,Syntax Error,"Line 3 is missing a semicolon after 25."',
            'JAVA-003,Arithmetic Division by Zero,Examine this division calculation. Identify which line contains the bug and what type of bug it is.,"1  public class Main {\\n2      public static void main(String[] args) {\\n3          int a = 10;\\n4          int b = 0;\\n5          int result = a / b;\\n6          System.out.println(result);\\n7      }\\n8  }",5,Exception,"Line 5 divides by zero, throwing ArithmeticException."'
        ].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="ROUND_2_JAVA_TEMPLATE.csv"');
        return res.send(csvContent);
    }

    const csvContent = [
        'language,difficulty,title,question_text,code_snippet,option_a,option_b,option_c,option_d,correct_option,explanation',
        'C,Easy,Post-Increment Output,What is the output of the following C code?,"int x = 5;\\nprintf(\\"\"%d\\\"\", x++);",4,5,6,Error,B,"x++ evaluates to 5 before incrementing."',
        'C,Easy,Standard I/O Header,Which header file is required for printf()?,stdlib.h,string.h,stdio.h,math.h,C,"stdio.h contains declaration for printf()."',
        'C++,Easy,Standard Output Stream,Which stream is commonly used for output in C++?,cin,cout,print,output,B,"std::cout is the standard output stream."',
        'Java,Easy,Object Instantiation Keyword,Which keyword is used to create an object in Java?,create,object,new,malloc,C,"The new operator instantiates a class."',
        'Python,Easy,Single-Line Comment Symbol,Which symbol is used for a single-line comment in Python?,//,#,/*,--,B,"Python uses # for single-line comments."',
        'HTML,Easy,HTML Full Form,What does HTML stand for?,Hyper Text Markup Language,High Text Machine Language,Hyperlink Text Management Language,Home Tool Markup Language,A,"HTML stands for HyperText Markup Language."'
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="ROUND_1_MCQ_TEMPLATE.csv"');
    return res.send(csvContent);
});

// POST /api/admin/questions/import-csv - Bulk import questions from CSV
router.post('/questions/import-csv', (req, res) => {
    try {
        const { csvText, round = 'r1', mode = 'append' } = req.body;

        if (!csvText || typeof csvText !== 'string' || !csvText.trim()) {
            return res.status(400).json({ error: 'Please upload or provide valid CSV content.' });
        }

        const { headers, objects, error } = parseCSVToObjects(csvText);

        if (error) {
            return res.status(400).json({ error });
        }

        if (objects.length === 0) {
            return res.status(400).json({ error: 'CSV file contains no data rows.' });
        }

        if (round === 'r1') {
            const hasRequired = headers.some(h => ['question_text', 'question', 'text', 'title'].includes(h));
            if (!hasRequired) {
                return res.status(400).json({
                    error: 'CSV missing required question columns. Must contain headers: language, title, question_text, option_a, option_b, option_c, option_d, correct_option'
                });
            }

            if (mode === 'replace') {
                db.prepare('DELETE FROM mcq_questions').run();
                db.prepare('DELETE FROM round_assignments WHERE round_num = 1').run();
            }

            const insertMcq = db.prepare(`
                INSERT INTO mcq_questions (language, difficulty, title, question_text, code_snippet, options_json, correct_option_index, explanation, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
            `);

            let insertedCount = 0;
            const insertTx = db.transaction((rows) => {
                for (const row of rows) {
                    const qText = row.question_text || row.question || row.text || row.title;
                    if (!qText) continue;

                    const title = row.title || (qText.length > 40 ? qText.substring(0, 40) + '...' : qText);
                    let lang = (row.language || row.lang || 'C').trim();
                    const normLang = lang.toUpperCase();
                    if (normLang === 'CPP' || normLang === 'C++') lang = 'C++';
                    else if (normLang === 'JAVA') lang = 'Java';
                    else if (normLang === 'PYTHON' || normLang === 'PY') lang = 'Python';
                    else if (normLang === 'HTML') lang = 'HTML';
                    else lang = 'C';

                    const diff = ['Easy', 'Medium', 'Hard'].find(d => d.toLowerCase() === (row.difficulty || '').toLowerCase()) || 'Easy';
                    const code = row.code_snippet || row.code || '';
                    
                    const optA = row.option_a || row.a || row.option1 || 'Option A';
                    const optB = row.option_b || row.b || row.option2 || 'Option B';
                    const optC = row.option_c || row.c || row.option3 || 'Option C';
                    const optD = row.option_d || row.d || row.option4 || 'Option D';
                    const options = [optA, optB, optC, optD];

                    const correctIdx = parseCorrectOptionIndex(row.correct_option || row.answer || row.ans || row.correct, options);
                    const explanation = row.explanation || row.explain || '';

                    insertMcq.run(lang, diff, title, qText, code, JSON.stringify(options), correctIdx, explanation);
                    insertedCount++;
                }
            });

            insertTx(objects);

            logAdminAction(req.admin.username, 'IMPORT_CSV_QUESTIONS', 'ROUND_1', `Imported ${insertedCount} questions via CSV (mode=${mode})`);

            return res.json({
                success: true,
                count: insertedCount,
                message: `Successfully imported ${insertedCount} Round 1 MCQs from CSV (${mode === 'replace' ? 'replaced existing questions' : 'added to existing'})!`
            });
        }

        if (round === 'r2') {
            const hasRequired = headers.some(h => ['code_snippet', 'code', 'title', 'buggy_line'].includes(h));
            if (!hasRequired) {
                return res.status(400).json({
                    error: 'CSV missing required Round 2 columns. Must contain headers: title, description, code_snippet, buggy_line, bug_type, explanation'
                });
            }

            if (mode === 'replace') {
                db.prepare('DELETE FROM java_challenges').run();
                db.prepare('DELETE FROM round_assignments WHERE round_num = 2').run();
            }

            const insertJava = db.prepare(`
                INSERT INTO java_challenges (challenge_code, difficulty, title, description, code_snippet, buggy_line, bug_type, explanation, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
            `);

            let insertedCount = 0;
            const insertTx = db.transaction((rows) => {
                for (let i = 0; i < rows.length; i++) {
                    const row = rows[i];
                    const codeSnippet = row.code_snippet || row.code || '';
                    if (!codeSnippet) continue;

                    const title = row.title || `Java Challenge ${i + 1}`;
                    const code = row.challenge_code || `JAVA-${String(i + 1).padStart(3, '0')}`;
                    const difficulty = row.difficulty || (i < 3 ? 'Easy' : i < 6 ? 'Moderate' : 'Hard');
                    const desc = row.description || row.desc || 'Identify the buggy line and its bug type.';
                    const buggyLine = parseInt(row.buggy_line || row.line || '1', 10) || 1;
                    const bugType = row.bug_type || row.type || 'Logical Error';
                    const explanation = row.explanation || row.explain || '';

                    insertJava.run(code, difficulty, title, desc, codeSnippet, buggyLine, bugType, explanation);
                    insertedCount++;
                }
            });

            insertTx(objects);

            logAdminAction(req.admin.username, 'IMPORT_CSV_QUESTIONS', 'ROUND_2', `Imported ${insertedCount} Java challenges via CSV (mode=${mode})`);

            return res.json({
                success: true,
                count: insertedCount,
                message: `Successfully imported ${insertedCount} Round 2 Java challenges from CSV (${mode === 'replace' ? 'replaced existing challenges' : 'added to existing'})!`
            });
        }

        return res.status(400).json({ error: `CSV import for round "${round}" is not supported.` });
    } catch (err) {
        console.error('CSV import error:', err);
        return res.status(500).json({ error: 'Failed to import CSV: ' + err.message });
    }
});

// POST /api/admin/questions/reseed - Force reload official tournament question banks
router.post('/questions/reseed', async (req, res) => {
    try {
        const { r1Questions } = await import('../database/questions_r1.js');
        const { r2JavaChallenges } = await import('../database/questions_r2.js');
        const { r3PythonChallenges } = await import('../database/questions_r3.js');

        // Clear existing questions and assignments
        db.prepare('DELETE FROM mcq_questions').run();
        db.prepare('DELETE FROM java_challenges').run();
        db.prepare('DELETE FROM python_challenges').run();
        db.prepare('DELETE FROM round_assignments').run();

        // 1. Seed Round 1
        const insertMcq = db.prepare(`
            INSERT INTO mcq_questions (language, difficulty, title, question_text, code_snippet, options_json, correct_option_index, explanation, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
        `);
        for (const q of r1Questions) {
            insertMcq.run(
                q.language,
                q.difficulty || 'Easy',
                q.title,
                q.question_text,
                q.code_snippet || '',
                JSON.stringify(q.options),
                q.correct_option_index,
                q.explanation || ''
            );
        }

        // 2. Seed Round 2
        const insertJava = db.prepare(`
            INSERT INTO java_challenges (challenge_code, difficulty, title, description, code_snippet, buggy_line, bug_type, explanation, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
        `);
        for (const c of r2JavaChallenges) {
            insertJava.run(
                c.challenge_code,
                c.difficulty || 'Moderate',
                c.title,
                c.description,
                c.code_snippet,
                c.buggy_line,
                c.bug_type,
                c.explanation || ''
            );
        }

        // 3. Seed Round 3
        const insertPy = db.prepare(`
            INSERT INTO python_challenges (challenge_code, difficulty, title, description, expected_behavior, input_format, output_format, constraints, buggy_code, canonical_solution, faulty_line, bug_type, visible_tests_json, hidden_tests_json, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        `);
        for (const p of r3PythonChallenges) {
            insertPy.run(
                p.challenge_code,
                p.difficulty || 'Easy',
                p.title,
                p.description,
                p.expected_behavior || '',
                p.input_format || '',
                p.output_format || '',
                p.constraints || '',
                p.buggy_code,
                p.canonical_solution,
                p.faulty_line,
                p.bug_type,
                JSON.stringify(p.visible_tests),
                JSON.stringify(p.hidden_tests)
            );
        }

        logAdminAction(req.admin.username, 'RESEED_QUESTION_BANK', 'QUESTIONS', 'Reloaded official question banks');

        return res.json({
            success: true,
            message: `Official questions reloaded! Round 1: ${r1Questions.length} MCQs, Round 2: ${r2JavaChallenges.length} Challenges, Round 3: ${r3PythonChallenges.length} Challenges.`,
            counts: {
                r1: r1Questions.length,
                r2: r2JavaChallenges.length,
                r3: r3PythonChallenges.length
            }
        });
    } catch (err) {
        console.error('Reseed error:', err);
        return res.status(500).json({ error: 'Failed to reseed questions: ' + err.message });
    }
});

// ==========================================
// QUESTION BANK CRUD ENDPOINTS
// ==========================================

// --- ROUND 1: MCQs ---
// POST /api/admin/questions/r1
router.post('/questions/r1', (req, res) => {
    try {
        const {
            language = 'C',
            difficulty = 'Easy',
            title,
            question_text,
            code_snippet = '',
            options = [],
            correct_option_index = 0,
            explanation = '',
            is_active = 1
        } = req.body;

        if (!title || !question_text) {
            return res.status(400).json({ error: 'Question title and text are required.' });
        }

        const optionsArray = Array.isArray(options) ? options : [
            req.body.optA || '', req.body.optB || '', req.body.optC || '', req.body.optD || ''
        ];

        if (optionsArray.length < 2) {
            return res.status(400).json({ error: 'At least two options are required.' });
        }

        const info = db.prepare(`
            INSERT INTO mcq_questions (language, difficulty, title, question_text, code_snippet, options_json, correct_option_index, explanation, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            language,
            difficulty,
            title.trim(),
            question_text.trim(),
            code_snippet || '',
            JSON.stringify(optionsArray),
            parseInt(correct_option_index, 10) || 0,
            explanation || '',
            is_active ? 1 : 0
        );

        const newQuestion = db.prepare('SELECT * FROM mcq_questions WHERE id = ?').get(info.lastInsertRowid);
        logAdminAction(req.admin.username, 'CREATE_R1_MCQ', `MCQ #${info.lastInsertRowid}`, `Created ${language} MCQ: ${title}`);

        return res.json({
            success: true,
            message: 'Round 1 MCQ created successfully.',
            question: {
                ...newQuestion,
                options: optionsArray
            }
        });
    } catch (err) {
        console.error('Create R1 MCQ error:', err);
        return res.status(500).json({ error: 'Failed to create Round 1 MCQ: ' + err.message });
    }
});

// PUT /api/admin/questions/r1/:id
router.put('/questions/r1/:id', (req, res) => {
    try {
        const { id } = req.params;
        const existing = db.prepare('SELECT * FROM mcq_questions WHERE id = ?').get(id);
        if (!existing) {
            return res.status(404).json({ error: 'Round 1 MCQ not found.' });
        }

        const {
            language = existing.language,
            difficulty = existing.difficulty,
            title = existing.title,
            question_text = existing.question_text,
            code_snippet = existing.code_snippet,
            options,
            correct_option_index = existing.correct_option_index,
            explanation = existing.explanation,
            is_active = existing.is_active
        } = req.body;

        const optionsJson = options ? JSON.stringify(options) : existing.options_json;

        db.prepare(`
            UPDATE mcq_questions SET
                language = ?,
                difficulty = ?,
                title = ?,
                question_text = ?,
                code_snippet = ?,
                options_json = ?,
                correct_option_index = ?,
                explanation = ?,
                is_active = ?
            WHERE id = ?
        `).run(
            language,
            difficulty,
            title.trim(),
            question_text.trim(),
            code_snippet || '',
            optionsJson,
            parseInt(correct_option_index, 10),
            explanation || '',
            is_active ? 1 : 0,
            id
        );

        const updated = db.prepare('SELECT * FROM mcq_questions WHERE id = ?').get(id);
        logAdminAction(req.admin.username, 'UPDATE_R1_MCQ', `MCQ #${id}`, `Updated ${language} MCQ: ${title}`);

        let parsedOptions = [];
        try { parsedOptions = JSON.parse(updated.options_json); } catch (e) { parsedOptions = []; }

        return res.json({
            success: true,
            message: 'Round 1 MCQ updated successfully.',
            question: { ...updated, options: parsedOptions }
        });
    } catch (err) {
        console.error('Update R1 MCQ error:', err);
        return res.status(500).json({ error: 'Failed to update Round 1 MCQ: ' + err.message });
    }
});

// DELETE /api/admin/questions/r1/:id
router.delete('/questions/r1/:id', (req, res) => {
    try {
        const { id } = req.params;
        const existing = db.prepare('SELECT * FROM mcq_questions WHERE id = ?').get(id);
        if (!existing) {
            return res.status(404).json({ error: 'Round 1 MCQ not found.' });
        }

        db.prepare('DELETE FROM mcq_questions WHERE id = ?').run(id);
        logAdminAction(req.admin.username, 'DELETE_R1_MCQ', `MCQ #${id}`, `Deleted MCQ: ${existing.title}`);

        return res.json({
            success: true,
            message: `Round 1 MCQ #${id} deleted successfully.`
        });
    } catch (err) {
        console.error('Delete R1 MCQ error:', err);
        return res.status(500).json({ error: 'Failed to delete Round 1 MCQ.' });
    }
});

// PATCH /api/admin/questions/r1/:id/toggle
router.patch('/questions/r1/:id/toggle', (req, res) => {
    try {
        const { id } = req.params;
        const existing = db.prepare('SELECT * FROM mcq_questions WHERE id = ?').get(id);
        if (!existing) {
            return res.status(404).json({ error: 'Round 1 MCQ not found.' });
        }

        const newStatus = existing.is_active ? 0 : 1;
        db.prepare('UPDATE mcq_questions SET is_active = ? WHERE id = ?').run(newStatus, id);
        logAdminAction(req.admin.username, 'TOGGLE_R1_MCQ', `MCQ #${id}`, `Status changed to ${newStatus ? 'ACTIVE' : 'INACTIVE'}`);

        return res.json({
            success: true,
            is_active: newStatus,
            message: `Round 1 MCQ #${id} is now ${newStatus ? 'Active' : 'Inactive'}.`
        });
    } catch (err) {
        console.error('Toggle R1 MCQ error:', err);
        return res.status(500).json({ error: 'Failed to toggle status.' });
    }
});


// --- ROUND 2: JAVA BUG IDENTIFICATION CHALLENGES ---
// POST /api/admin/questions/r2
router.post('/questions/r2', (req, res) => {
    try {
        let {
            challenge_code,
            title,
            description,
            code_snippet,
            buggy_line,
            bug_type,
            explanation = '',
            is_active = 1
        } = req.body;

        if (!title || !description || !code_snippet) {
            return res.status(400).json({ error: 'Title, description, and code snippet are required.' });
        }

        if (!challenge_code || !challenge_code.trim()) {
            const count = db.prepare('SELECT COUNT(*) as c FROM java_challenges').get().c;
            challenge_code = `JAVA-${String(count + 1).padStart(3, '0')}`;
        }

        const info = db.prepare(`
            INSERT INTO java_challenges (challenge_code, title, description, code_snippet, buggy_line, bug_type, explanation, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            challenge_code.trim(),
            title.trim(),
            description.trim(),
            code_snippet,
            parseInt(buggy_line, 10) || 1,
            (bug_type || 'Logical Error').trim(),
            explanation || '',
            is_active ? 1 : 0
        );

        const newChallenge = db.prepare('SELECT * FROM java_challenges WHERE id = ?').get(info.lastInsertRowid);
        logAdminAction(req.admin.username, 'CREATE_R2_CHALLENGE', challenge_code, `Created Java challenge: ${title}`);

        return res.json({
            success: true,
            message: 'Round 2 Java Challenge created successfully.',
            challenge: newChallenge
        });
    } catch (err) {
        console.error('Create R2 Challenge error:', err);
        return res.status(500).json({ error: 'Failed to create Round 2 Challenge: ' + err.message });
    }
});

// PUT /api/admin/questions/r2/:id
router.put('/questions/r2/:id', (req, res) => {
    try {
        const { id } = req.params;
        const existing = db.prepare('SELECT * FROM java_challenges WHERE id = ?').get(id);
        if (!existing) {
            return res.status(404).json({ error: 'Round 2 Challenge not found.' });
        }

        const {
            challenge_code = existing.challenge_code,
            title = existing.title,
            description = existing.description,
            code_snippet = existing.code_snippet,
            buggy_line = existing.buggy_line,
            bug_type = existing.bug_type,
            explanation = existing.explanation,
            is_active = existing.is_active
        } = req.body;

        db.prepare(`
            UPDATE java_challenges SET
                challenge_code = ?,
                title = ?,
                description = ?,
                code_snippet = ?,
                buggy_line = ?,
                bug_type = ?,
                explanation = ?,
                is_active = ?
            WHERE id = ?
        `).run(
            challenge_code.trim(),
            title.trim(),
            description.trim(),
            code_snippet,
            parseInt(buggy_line, 10),
            (bug_type || 'Logical Error').trim(),
            explanation || '',
            is_active ? 1 : 0,
            id
        );

        const updated = db.prepare('SELECT * FROM java_challenges WHERE id = ?').get(id);
        logAdminAction(req.admin.username, 'UPDATE_R2_CHALLENGE', challenge_code, `Updated Java challenge: ${title}`);

        return res.json({
            success: true,
            message: 'Round 2 Java Challenge updated successfully.',
            challenge: updated
        });
    } catch (err) {
        console.error('Update R2 Challenge error:', err);
        return res.status(500).json({ error: 'Failed to update Round 2 Challenge: ' + err.message });
    }
});

// DELETE /api/admin/questions/r2/:id
router.delete('/questions/r2/:id', (req, res) => {
    try {
        const { id } = req.params;
        const existing = db.prepare('SELECT * FROM java_challenges WHERE id = ?').get(id);
        if (!existing) {
            return res.status(404).json({ error: 'Round 2 Challenge not found.' });
        }

        db.prepare('DELETE FROM java_challenges WHERE id = ?').run(id);
        logAdminAction(req.admin.username, 'DELETE_R2_CHALLENGE', existing.challenge_code, `Deleted Java Challenge: ${existing.title}`);

        return res.json({
            success: true,
            message: `Round 2 Challenge #${id} deleted successfully.`
        });
    } catch (err) {
        console.error('Delete R2 Challenge error:', err);
        return res.status(500).json({ error: 'Failed to delete Round 2 Challenge.' });
    }
});

// PATCH /api/admin/questions/r2/:id/toggle
router.patch('/questions/r2/:id/toggle', (req, res) => {
    try {
        const { id } = req.params;
        const existing = db.prepare('SELECT * FROM java_challenges WHERE id = ?').get(id);
        if (!existing) {
            return res.status(404).json({ error: 'Round 2 Challenge not found.' });
        }

        const newStatus = existing.is_active ? 0 : 1;
        db.prepare('UPDATE java_challenges SET is_active = ? WHERE id = ?').run(newStatus, id);
        logAdminAction(req.admin.username, 'TOGGLE_R2_CHALLENGE', existing.challenge_code, `Status changed to ${newStatus ? 'ACTIVE' : 'INACTIVE'}`);

        return res.json({
            success: true,
            is_active: newStatus,
            message: `Round 2 Challenge ${existing.challenge_code} is now ${newStatus ? 'Active' : 'Inactive'}.`
        });
    } catch (err) {
        console.error('Toggle R2 Challenge error:', err);
        return res.status(500).json({ error: 'Failed to toggle status.' });
    }
});


// --- ROUND 3: PYTHON DEBUG & SOLVE CHALLENGES ---
// POST /api/admin/questions/r3
router.post('/questions/r3', (req, res) => {
    try {
        let {
            challenge_code,
            title,
            description,
            expected_behavior = '',
            input_format = '',
            output_format = '',
            constraints = '',
            buggy_code,
            canonical_solution = '',
            faulty_line = 1,
            bug_type = 'Logical Error',
            visible_tests = [],
            hidden_tests = [],
            is_active = 1
        } = req.body;

        if (!title || !description || !buggy_code) {
            return res.status(400).json({ error: 'Title, description, and buggy code are required.' });
        }

        if (!challenge_code || !challenge_code.trim()) {
            const count = db.prepare('SELECT COUNT(*) as c FROM python_challenges').get().c;
            challenge_code = `PY-${String(count + 1).padStart(3, '0')}`;
        }

        const visibleJson = typeof visible_tests === 'string' ? visible_tests : JSON.stringify(visible_tests);
        const hiddenJson = typeof hidden_tests === 'string' ? hidden_tests : JSON.stringify(hidden_tests);

        const info = db.prepare(`
            INSERT INTO python_challenges (
                challenge_code, title, description, expected_behavior, input_format, output_format,
                constraints, buggy_code, canonical_solution, faulty_line, bug_type,
                visible_tests_json, hidden_tests_json, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            challenge_code.trim(),
            title.trim(),
            description.trim(),
            expected_behavior || '',
            input_format || '',
            output_format || '',
            constraints || '',
            buggy_code,
            canonical_solution || buggy_code,
            parseInt(faulty_line, 10) || 1,
            (bug_type || 'Logical Error').trim(),
            visibleJson,
            hiddenJson,
            is_active ? 1 : 0
        );

        const newChallenge = db.prepare('SELECT * FROM python_challenges WHERE id = ?').get(info.lastInsertRowid);
        logAdminAction(req.admin.username, 'CREATE_R3_CHALLENGE', challenge_code, `Created Python challenge: ${title}`);

        let vTests = [];
        let hTests = [];
        try { vTests = JSON.parse(newChallenge.visible_tests_json); } catch (e) { vTests = []; }
        try { hTests = JSON.parse(newChallenge.hidden_tests_json); } catch (e) { hTests = []; }

        return res.json({
            success: true,
            message: 'Round 3 Python Challenge created successfully.',
            challenge: {
                ...newChallenge,
                visible_tests: vTests,
                hidden_tests: hTests
            }
        });
    } catch (err) {
        console.error('Create R3 Challenge error:', err);
        return res.status(500).json({ error: 'Failed to create Round 3 Challenge: ' + err.message });
    }
});

// PUT /api/admin/questions/r3/:id
router.put('/questions/r3/:id', (req, res) => {
    try {
        const { id } = req.params;
        const existing = db.prepare('SELECT * FROM python_challenges WHERE id = ?').get(id);
        if (!existing) {
            return res.status(404).json({ error: 'Round 3 Challenge not found.' });
        }

        const {
            challenge_code = existing.challenge_code,
            title = existing.title,
            description = existing.description,
            expected_behavior = existing.expected_behavior,
            input_format = existing.input_format,
            output_format = existing.output_format,
            constraints = existing.constraints,
            buggy_code = existing.buggy_code,
            canonical_solution = existing.canonical_solution,
            faulty_line = existing.faulty_line,
            bug_type = existing.bug_type,
            visible_tests,
            hidden_tests,
            is_active = existing.is_active
        } = req.body;

        const visibleJson = visible_tests !== undefined
            ? (typeof visible_tests === 'string' ? visible_tests : JSON.stringify(visible_tests))
            : existing.visible_tests_json;

        const hiddenJson = hidden_tests !== undefined
            ? (typeof hidden_tests === 'string' ? hidden_tests : JSON.stringify(hidden_tests))
            : existing.hidden_tests_json;

        db.prepare(`
            UPDATE python_challenges SET
                challenge_code = ?,
                title = ?,
                description = ?,
                expected_behavior = ?,
                input_format = ?,
                output_format = ?,
                constraints = ?,
                buggy_code = ?,
                canonical_solution = ?,
                faulty_line = ?,
                bug_type = ?,
                visible_tests_json = ?,
                hidden_tests_json = ?,
                is_active = ?
            WHERE id = ?
        `).run(
            challenge_code.trim(),
            title.trim(),
            description.trim(),
            expected_behavior || '',
            input_format || '',
            output_format || '',
            constraints || '',
            buggy_code,
            canonical_solution || buggy_code,
            parseInt(faulty_line, 10),
            (bug_type || 'Logical Error').trim(),
            visibleJson,
            hiddenJson,
            is_active ? 1 : 0,
            id
        );

        const updated = db.prepare('SELECT * FROM python_challenges WHERE id = ?').get(id);
        logAdminAction(req.admin.username, 'UPDATE_R3_CHALLENGE', challenge_code, `Updated Python challenge: ${title}`);

        let vTests = [];
        let hTests = [];
        try { vTests = JSON.parse(updated.visible_tests_json); } catch (e) { vTests = []; }
        try { hTests = JSON.parse(updated.hidden_tests_json); } catch (e) { hTests = []; }

        return res.json({
            success: true,
            message: 'Round 3 Python Challenge updated successfully.',
            challenge: {
                ...updated,
                visible_tests: vTests,
                hidden_tests: hTests
            }
        });
    } catch (err) {
        console.error('Update R3 Challenge error:', err);
        return res.status(500).json({ error: 'Failed to update Round 3 Challenge: ' + err.message });
    }
});

// DELETE /api/admin/questions/r3/:id
router.delete('/questions/r3/:id', (req, res) => {
    try {
        const { id } = req.params;
        const existing = db.prepare('SELECT * FROM python_challenges WHERE id = ?').get(id);
        if (!existing) {
            return res.status(404).json({ error: 'Round 3 Challenge not found.' });
        }

        db.prepare('DELETE FROM python_challenges WHERE id = ?').run(id);
        logAdminAction(req.admin.username, 'DELETE_R3_CHALLENGE', existing.challenge_code, `Deleted Python Challenge: ${existing.title}`);

        return res.json({
            success: true,
            message: `Round 3 Challenge #${id} deleted successfully.`
        });
    } catch (err) {
        console.error('Delete R3 Challenge error:', err);
        return res.status(500).json({ error: 'Failed to delete Round 3 Challenge.' });
    }
});

// PATCH /api/admin/questions/r3/:id/toggle
router.patch('/questions/r3/:id/toggle', (req, res) => {
    try {
        const { id } = req.params;
        const existing = db.prepare('SELECT * FROM python_challenges WHERE id = ?').get(id);
        if (!existing) {
            return res.status(404).json({ error: 'Round 3 Challenge not found.' });
        }

        const newStatus = existing.is_active ? 0 : 1;
        db.prepare('UPDATE python_challenges SET is_active = ? WHERE id = ?').run(newStatus, id);
        logAdminAction(req.admin.username, 'TOGGLE_R3_CHALLENGE', existing.challenge_code, `Status changed to ${newStatus ? 'ACTIVE' : 'INACTIVE'}`);

        return res.json({
            success: true,
            is_active: newStatus,
            message: `Round 3 Challenge ${existing.challenge_code} is now ${newStatus ? 'Active' : 'Inactive'}.`
        });
    } catch (err) {
        console.error('Toggle R3 Challenge error:', err);
        return res.status(500).json({ error: 'Failed to toggle status.' });
    }
});

export default router;
