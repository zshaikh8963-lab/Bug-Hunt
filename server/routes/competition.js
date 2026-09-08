import express from 'express';
import db from '../database/db.js';
import { broadcastCompetitionState, broadcastWinnerReveal } from '../services/socketManager.js';

const router = express.Router();

// GET /api/competition/status - Public tournament state query
router.get('/status', (req, res) => {
    try {
        const state = db.prepare('SELECT * FROM competition_state WHERE id = 1').get() || {
            status: 'WAITING',
            is_paused: 0,
            active_round: 0,
            message: 'Waiting for Admin to start competition.'
        };

        const settings = db.prepare('SELECT * FROM competition_settings WHERE id = 1').get() || {};

        return res.json({
            success: true,
            status: state.status,
            is_paused: Boolean(state.is_paused),
            active_round: state.active_round,
            message: state.message,
            round_started_at: state.round_started_at,
            round_time_limit_sec: state.round_time_limit_sec,
            results_locked: Boolean(state.results_locked),
            winner_reveal_state: state.winner_reveal_state,
            updated_at: state.updated_at,
            settings: {
                college_name: settings.college_name,
                department: settings.department,
                event_name: settings.event_name,
                competition_date: settings.competition_date,
                venue: settings.venue
            }
        });
    } catch (err) {
        console.error('Competition status error:', err);
        return res.status(500).json({ error: 'Failed to retrieve competition status.' });
    }
});

export default router;
