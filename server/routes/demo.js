import express from 'express';
import db from '../database/db.js';
import { broadcastLeaderboard, broadcastCompetitionState } from '../services/socketManager.js';
import { generateCertificatesForTeams } from '../services/certificateService.js';

const router = express.Router();

const DEMO_TEAMS = [
    {
        team_id: 'DEMO-001',
        team_name: 'Team Alpha (Cyber Slayers)',
        department: 'COMPS',
        college: 'Faculty of Computer Engineering',
        pass_code: 'DEMO-ALPHA',
        r1_score: 9,
        r2_score: 14,
        r3_score: 24,
        final_score: 47,
        total_time_sec: 420,
        status: 'FINISHED',
        members: [
            { name: 'Alex Chen (Lead)', email: 'alex@alpha.demo', roll_no: 'CS-01' },
            { name: 'Jordan Lee', email: 'jordan@alpha.demo', roll_no: 'CS-02' },
            { name: 'Samira Khan', email: 'samira@alpha.demo', roll_no: 'CS-03' },
            { name: 'Marcus Vance', email: 'marcus@alpha.demo', roll_no: 'CS-04' }
        ]
    },
    {
        team_id: 'DEMO-002',
        team_name: 'Team Beta (Binary Bandits)',
        department: 'IT',
        college: 'Department of Information Technology',
        pass_code: 'DEMO-BETA',
        r1_score: 8,
        r2_score: 13,
        r3_score: 23,
        final_score: 44,
        total_time_sec: 480,
        status: 'FINISHED',
        members: [
            { name: 'Elena Rostova (Lead)', email: 'elena@beta.demo', roll_no: 'IT-01' },
            { name: 'David Kim', email: 'david@beta.demo', roll_no: 'IT-02' },
            { name: 'Priya Patel', email: 'priya@beta.demo', roll_no: 'IT-03' },
            { name: 'Lucas Silva', email: 'lucas@beta.demo', roll_no: 'IT-04' }
        ]
    },
    {
        team_id: 'DEMO-003',
        team_name: 'Team Gamma (Glitch Hunters)',
        department: 'AIML',
        college: 'Center for AI & Machine Learning',
        pass_code: 'DEMO-GAMMA',
        r1_score: 8,
        r2_score: 12,
        r3_score: 21,
        final_score: 41,
        total_time_sec: 530,
        status: 'FINISHED',
        members: [
            { name: 'Carlos Mendez (Lead)', email: 'carlos@gamma.demo', roll_no: 'AI-01' },
            { name: 'Aisha Bello', email: 'aisha@gamma.demo', roll_no: 'AI-02' },
            { name: 'Liam O’Connor', email: 'liam@gamma.demo', roll_no: 'AI-03' },
            { name: 'Yuki Tanaka', email: 'yuki@gamma.demo', roll_no: 'AI-04' }
        ]
    },
    {
        team_id: 'DEMO-004',
        team_name: 'Team Delta (Stack Overflowed)',
        department: 'ELECTRICAL',
        college: 'Electrical & Embedded Systems',
        pass_code: 'DEMO-DELTA',
        r1_score: 7,
        r2_score: 10,
        r3_score: 18,
        final_score: 35,
        total_time_sec: 590,
        status: 'FINISHED',
        members: [
            { name: 'Ryan Murphy (Lead)', email: 'ryan@delta.demo', roll_no: 'EE-01' },
            { name: 'Zoe Washington', email: 'zoe@delta.demo', roll_no: 'EE-02' },
            { name: 'Vikram Joshi', email: 'vikram@delta.demo', roll_no: 'EE-03' },
            { name: 'Chloe Dupont', email: 'chloe@delta.demo', roll_no: 'EE-04' }
        ]
    }
];

// POST /api/demo/run-simulation - Inject 4 simulated teams & scores for live demonstration
router.post('/run-simulation', (req, res) => {
    try {
        db.transaction(() => {
            // Delete existing demo teams if any
            for (const t of DEMO_TEAMS) {
                db.prepare('DELETE FROM certificates WHERE team_id = ?').run(t.team_id);
                db.prepare('DELETE FROM team_members WHERE team_id = ?').run(t.team_id);
                db.prepare('DELETE FROM round_submissions WHERE team_id = ?').run(t.team_id);
                db.prepare('DELETE FROM round_assignments WHERE team_id = ?').run(t.team_id);
                db.prepare('DELETE FROM teams WHERE team_id = ?').run(t.team_id);
            }

            const insertTeam = db.prepare(`
                INSERT INTO teams (
                    team_id, team_name, department, college, pass_code,
                    r1_score, r2_score, r3_score, final_score,
                    total_time_sec, status, current_round,
                    r1_finished_at, r2_finished_at, r3_finished_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `);

            const insertMember = db.prepare(`
                INSERT INTO team_members (team_id, member_number, name, email, roll_no)
                VALUES (?, ?, ?, ?, ?)
            `);

            for (const t of DEMO_TEAMS) {
                insertTeam.run(
                    t.team_id, t.team_name, t.department, t.college, t.pass_code,
                    t.r1_score, t.r2_score, t.r3_score, t.final_score,
                    t.total_time_sec, t.status
                );

                for (let i = 0; i < t.members.length; i++) {
                    insertMember.run(
                        t.team_id,
                        i + 1,
                        t.members[i].name,
                        t.members[i].email,
                        t.members[i].roll_no
                    );
                }
            }

            // Update competition state to FINISHED with results ready
            db.prepare(`
                UPDATE competition_state 
                SET status = 'FINISHED', active_round = 3, results_locked = 1,
                    winner_reveal_state = 'WINNER',
                    message = 'Competition Concluded! Results Finalized.'
                WHERE id = 1
            `).run();

            // Auto-generate certificates for the 4 demo teams
            generateCertificatesForTeams('all');
        })();

        // Query fresh leaderboard and broadcast to Projector & Admin
        const rows = db.prepare(`
            SELECT 
                team_id, team_name, department, college,
                r1_score, r2_score, r3_score, final_score,
                total_time_sec, status, is_disqualified
            FROM teams
            ORDER BY final_score DESC, r3_score DESC, total_time_sec ASC
        `).all();

        const leaderboard = rows.map((r, i) => ({
            rank: i + 1,
            team_id: r.team_id,
            team_name: r.team_name,
            department: r.department,
            college: r.college,
            r1_score: r.r1_score,
            r2_score: r.r2_score,
            r3_score: r.r3_score,
            final_score: r.final_score,
            total_time_sec: r.total_time_sec,
            status: r.status,
            is_disqualified: Boolean(r.is_disqualified)
        }));

        broadcastLeaderboard(leaderboard);
        broadcastCompetitionState(db.prepare('SELECT * FROM competition_state WHERE id = 1').get());

        return res.json({
            success: true,
            message: 'Simulated 4 teams successfully. Live Leaderboard and Certificates ready.',
            teams: DEMO_TEAMS,
            teams_simulated: DEMO_TEAMS
        });
    } catch (err) {
        console.error('Demo simulation error:', err);
        return res.status(500).json({ error: 'Failed to run simulation.' });
    }
});

// POST /api/demo/clear - Clear demo data
router.post('/clear', (req, res) => {
    try {
        db.transaction(() => {
            for (const t of DEMO_TEAMS) {
                db.prepare('DELETE FROM certificates WHERE team_id = ?').run(t.team_id);
                db.prepare('DELETE FROM team_members WHERE team_id = ?').run(t.team_id);
                db.prepare('DELETE FROM round_submissions WHERE team_id = ?').run(t.team_id);
                db.prepare('DELETE FROM round_assignments WHERE team_id = ?').run(t.team_id);
                db.prepare('DELETE FROM teams WHERE team_id = ?').run(t.team_id);
            }
        })();

        return res.json({ success: true, message: 'Demo data cleared.' });
    } catch (err) {
        console.error('Demo clear error:', err);
        return res.status(500).json({ error: 'Failed to clear demo data.' });
    }
});

export default router;
