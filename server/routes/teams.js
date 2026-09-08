import express from 'express';
import db from '../database/db.js';

const router = express.Router();

// Generate sequential Team ID e.g. TEAM-001
function generateNextTeamId() {
    const lastTeam = db.prepare('SELECT id FROM teams ORDER BY id DESC LIMIT 1').get();
    const nextNum = (lastTeam ? lastTeam.id : 0) + 1;
    return `TEAM-${String(nextNum).padStart(3, '0')}`;
}

// Generate random 4-digit team access code e.g. HUNT-8492
function generatePassCode() {
    return `HUNT-${Math.floor(1000 + Math.random() * 9000)}`;
}

// POST /api/teams/register - Register team with exactly 4 students
router.post('/register', (req, res) => {
    try {
        const { team_name, department, college = '', members = [] } = req.body;

        if (!team_name?.trim()) {
            return res.status(400).json({ error: 'Team Name is required.' });
        }

        if (!department?.trim()) {
            return res.status(400).json({ error: 'Department is required.' });
        }

        // Check if team name already exists
        const existing = db.prepare('SELECT id FROM teams WHERE LOWER(team_name) = LOWER(?)').get(team_name.trim());
        if (existing) {
            return res.status(400).json({ error: `Team name "${team_name}" is already taken. Please choose another.` });
        }

        // Validate 2 to 4 members
        if (!Array.isArray(members) || members.length < 2 || members.length > 4) {
            return res.status(400).json({ error: 'Each team must register between 2 and 4 students (Minimum 2, Maximum 4).' });
        }

        for (let i = 0; i < members.length; i++) {
            if (!members[i]?.name?.trim()) {
                return res.status(400).json({ error: `Student ${i + 1} Name is required.` });
            }
        }

        const team_id = generateNextTeamId();
        const pass_code = generatePassCode();

        db.transaction(() => {
            // Insert Team
            db.prepare(`
                INSERT INTO teams (team_id, team_name, department, college, pass_code, status, current_round)
                VALUES (?, ?, ?, ?, ?, 'WAITING', 1)
            `).run(team_id, team_name.trim(), department.trim().toUpperCase(), college.trim(), pass_code);

            // Insert Members (between 2 and 4)
            const insertMember = db.prepare(`
                INSERT INTO team_members (team_id, member_number, name, email, roll_no)
                VALUES (?, ?, ?, ?, ?)
            `);

            for (let i = 0; i < members.length; i++) {
                insertMember.run(
                    team_id,
                    i + 1,
                    members[i].name.trim(),
                    (members[i].email || '').trim(),
                    (members[i].roll_no || '').trim()
                );
            }
        })();

        const team = db.prepare('SELECT * FROM teams WHERE team_id = ?').get(team_id);
        const savedMembers = db.prepare('SELECT * FROM team_members WHERE team_id = ? ORDER BY member_number ASC').all(team_id);

        return res.status(201).json({
            success: true,
            message: 'Team successfully registered for BUG HUNT!',
            team,
            members: savedMembers
        });
    } catch (err) {
        console.error('Team registration error:', err);
        return res.status(500).json({ error: 'Failed to register team.' });
    }
});

// POST /api/teams/login - Reconnect using Team Code / ID
router.post('/login', (req, res) => {
    try {
        const { code } = req.body;
        if (!code?.trim()) {
            return res.status(400).json({ error: 'Team ID or Pass Code is required.' });
        }

        const cleanCode = code.trim().toUpperCase();
        const team = db.prepare(`
            SELECT * FROM teams 
            WHERE UPPER(team_id) = ? OR UPPER(pass_code) = ? OR UPPER(team_name) = ?
        `).get(cleanCode, cleanCode, cleanCode);

        if (!team) {
            return res.status(404).json({ error: 'Team not found. Please verify your Team ID / Code.' });
        }

        if (team.is_disqualified) {
            return res.status(403).json({ 
                error: 'Team Disqualified.', 
                is_disqualified: true, 
                reason: team.disqualify_reason || 'Anti-cheating violation threshold reached.' 
            });
        }

        const members = db.prepare('SELECT * FROM team_members WHERE team_id = ? ORDER BY member_number ASC').all(team.team_id);

        return res.json({
            success: true,
            team,
            members
        });
    } catch (err) {
        console.error('Team login error:', err);
        return res.status(500).json({ error: 'Failed to authenticate team.' });
    }
});

// GET /api/teams/session - Retrieve active session & state
router.get('/session', (req, res) => {
    try {
        const team_id = req.query.team_id || req.headers['x-team-id'];
        if (!team_id) {
            return res.status(400).json({ error: 'Team ID is required.' });
        }

        const team = db.prepare('SELECT * FROM teams WHERE team_id = ?').get(team_id);
        if (!team) {
            return res.status(404).json({ error: 'Team not found.' });
        }

        const members = db.prepare('SELECT * FROM team_members WHERE team_id = ? ORDER BY member_number ASC').all(team_id);
        const compState = db.prepare('SELECT * FROM competition_state WHERE id = 1').get();

        return res.json({
            success: true,
            team: {
                ...team,
                total_score: team.final_score
            },
            members,
            competition: compState
        });
    } catch (err) {
        console.error('Team session error:', err);
        return res.status(500).json({ error: 'Failed to retrieve session.' });
    }
});

export default router;
