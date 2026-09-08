import express from 'express';
import db from '../database/db.js';

const router = express.Router();

// GET /api/leaderboard - Live leaderboard ranked by official tie-breaking rules
router.get('/', (req, res) => {
    try {
        const { search = '', limit = 100 } = req.query;

        let query = `
            SELECT 
                t.id,
                t.team_id,
                t.team_name,
                t.department,
                t.college,
                t.r1_score,
                t.r2_score,
                t.r3_score,
                t.final_score,
                t.total_time_sec,
                t.status,
                t.is_disqualified,
                t.disqualify_reason,
                t.violations_count,
                t.r3_finished_at,
                t.created_at
            FROM teams t
            WHERE 1=1
        `;

        const params = [];
        if (search.trim()) {
            query += ` AND (t.team_name LIKE ? OR t.team_id LIKE ? OR t.department LIKE ?)`;
            const wildcard = `%${search.trim()}%`;
            params.push(wildcard, wildcard, wildcard);
        }

        // Official Tie-Breaking:
        // 1. Not Disqualified first
        // 2. Higher Final Score (DESC)
        // 3. Higher Round 3 Score (DESC)
        // 4. Faster Total Completion Time (ASC)
        // 5. Earlier final submission timestamp (ASC)
        query += `
            ORDER BY t.is_disqualified ASC,
                     t.final_score DESC,
                     t.r3_score DESC,
                     t.total_time_sec ASC,
                     t.r3_finished_at ASC NULLS LAST,
                     t.id ASC
            LIMIT ?
        `;
        params.push(parseInt(limit, 10) || 100);

        const rows = db.prepare(query).all(...params);

        const leaderboard = rows.map((r, i) => {
            // Fetch team members
            const members = db.prepare('SELECT name FROM team_members WHERE team_id = ? ORDER BY member_number ASC').all(r.team_id);
            return {
                rank: i + 1,
                team_id: r.team_id,
                team_name: r.team_name,
                department: r.department,
                college: r.college,
                members: members.map(m => m.name),
                r1_score: r.r1_score || 0,
                r2_score: r.r2_score || 0,
                r3_score: r.r3_score || 0,
                final_score: Math.min(50, r.final_score || 0),
                total_score: Math.min(50, r.final_score || 0),
                total_time_sec: r.total_time_sec || 0,
                status: r.status,
                is_disqualified: Boolean(r.is_disqualified),
                disqualify_reason: r.disqualify_reason || '',
                violations_count: r.violations_count || 0
            };
        });

        const compState = db.prepare('SELECT status, results_locked, winner_reveal_state FROM competition_state WHERE id = 1').get() || {};

        return res.json({
            success: true,
            count: leaderboard.length,
            results_locked: Boolean(compState.results_locked),
            winner_reveal_state: compState.winner_reveal_state || 'NONE',
            leaderboard
        });
    } catch (err) {
        console.error('Leaderboard error:', err);
        return res.status(500).json({ error: 'Failed to retrieve leaderboard.' });
    }
});

export default router;
