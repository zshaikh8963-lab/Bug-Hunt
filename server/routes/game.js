import express from 'express';
import db from '../database/db.js';
import { validateCodeFix } from '../services/codeValidator.js';

const router = express.Router();

// Helper: Verify session and get details
const getSession = (token) => {
    if (!token) return null;
    return db.prepare('SELECT * FROM game_sessions WHERE session_token = ?').get(token);
};

// POST /api/game/start - Start or resume game session
router.post('/start', (req, res) => {
    try {
        const { participant_id, is_demo = false } = req.body;

        // Check competition state
        const compState = db.prepare('SELECT status, message FROM competition_state WHERE id = 1').get();
        if (compState && compState.status === 'NOT_STARTED' && !is_demo) {
            return res.status(403).json({
                error: 'Competition has not started yet.',
                competition_status: 'NOT_STARTED'
            });
        }
        if (compState && compState.status === 'PAUSED' && !is_demo) {
            return res.status(403).json({
                error: 'Competition temporarily paused by organizer.',
                competition_status: 'PAUSED'
            });
        }
        if (compState && compState.status === 'ENDED' && !is_demo) {
            return res.status(403).json({
                error: 'Competition has ended.',
                competition_status: 'ENDED'
            });
        }

        let pid = participant_id;

        // Auto-provision demo participant if needed
        if (is_demo || !pid) {
            const demoId = `DEMO-${Math.floor(1000 + Math.random() * 9000)}`;
            db.prepare(`
                INSERT INTO participants (participant_id, name, team_name, college, email)
                VALUES (?, ?, ?, ?, ?)
            `).run(demoId, 'Demo Debugger', 'Terminal Hunters', 'Tech University - CS', 'demo@bughunt.io');
            pid = demoId;
        }

        const participant = db.prepare('SELECT * FROM participants WHERE participant_id = ?').get(pid);
        if (!participant) {
            return res.status(404).json({ error: 'Participant not found. Please register first.' });
        }

        // Check if there is an existing in_progress session
        let session = db.prepare(`
            SELECT * FROM game_sessions 
            WHERE participant_id = ? AND status = 'in_progress' 
            ORDER BY id DESC LIMIT 1
        `).get(pid);

        if (!session) {
            const session_token = `TOKEN-${pid}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
            const insert = db.prepare(`
                INSERT INTO game_sessions (
                    session_token, participant_id, current_round, score, bugs_found,
                    lives, hints_remaining, combo, max_combo, tab_switches, status, total_time_sec
                ) VALUES (?, ?, 1, 0, 0, 3, 3, 0, 0, 0, 'in_progress', 0)
            `);
            insert.run(session_token, pid);
            session = db.prepare('SELECT * FROM game_sessions WHERE session_token = ?').get(session_token);
        }

        return res.json({
            success: true,
            session: {
                session_token: session.session_token,
                participant_id: session.participant_id,
                current_round: session.current_round,
                score: session.score,
                bugs_found: session.bugs_found,
                lives: session.lives,
                hints_remaining: session.hints_remaining,
                combo: session.combo,
                max_combo: session.max_combo,
                tab_switches: session.tab_switches,
                status: session.status
            },
            participant
        });
    } catch (err) {
        console.error('Game start error:', err);
        return res.status(500).json({ error: 'Failed to start game session.' });
    }
});

// GET /api/game/round/:round_num - Get sanitized questions for round
router.get('/round/:round_num', (req, res) => {
    try {
        const round_num = parseInt(req.params.round_num, 10);
        const session_token = req.query.token || req.headers['x-session-token'];

        if (session_token) {
            const session = getSession(session_token);
            if (session && session.status !== 'in_progress') {
                return res.status(400).json({ error: 'Session is no longer active', session_status: session.status });
            }
        }

        // Fetch questions without exposing correct_answer and hint upfront
        const questions = db.prepare(`
            SELECT id, round_num, language, difficulty, question_type, 
                   title, description, code_snippet, options_json, 
                   points, penalty, time_limit_sec
            FROM questions 
            WHERE round_num = ? AND is_active = 1
            ORDER BY id ASC
        `).all(round_num);

        const formatted = questions.map(q => {
            let options = [];
            try {
                options = JSON.parse(q.options_json);
            } catch (e) {
                options = [];
            }
            return {
                id: q.id,
                round_num: q.round_num,
                language: q.language,
                difficulty: q.difficulty,
                question_type: q.question_type,
                title: q.title,
                description: q.description,
                code_snippet: q.code_snippet,
                options,
                points: q.points,
                penalty: q.penalty,
                time_limit_sec: q.time_limit_sec
            };
        });

        return res.json({
            success: true,
            round_num,
            count: formatted.length,
            questions: formatted
        });
    } catch (err) {
        console.error('Get round error:', err);
        return res.status(500).json({ error: 'Failed to fetch round questions.' });
    }
});

// POST /api/game/answer - Submit answer and calculate score/combo/lives
router.post('/answer', (req, res) => {
    try {
        const { session_token, question_id, selected_answer, time_taken_sec = 0 } = req.body;

        if (!session_token || !question_id) {
            return res.status(400).json({ error: 'Session token and question ID are required.' });
        }

        const session = getSession(session_token);
        if (!session) {
            return res.status(404).json({ error: 'Game session not found.' });
        }

        if (session.status !== 'in_progress') {
            return res.status(400).json({ error: 'Session is not active.', status: session.status });
        }

        const question = db.prepare('SELECT * FROM questions WHERE id = ?').get(question_id);
        if (!question) {
            return res.status(404).json({ error: 'Question not found.' });
        }

        // Determine if answer is correct
        let is_correct = false;
        let validation_feedback = '';

        if (question.round_num === 1 || question.question_type === 'mcq') {
            const normalizedSelected = String(selected_answer || '').trim().toLowerCase();
            const normalizedCorrect = String(question.correct_answer || '').trim().toLowerCase();
            is_correct = normalizedSelected === normalizedCorrect;
            validation_feedback = is_correct 
                ? 'Correct! Bug successfully identified.' 
                : 'Incorrect identification. Check the runtime exception / syntax rules.';
        } else {
            // Rounds 2, 3, 4: In-editor code fix evaluation
            const validation = validateCodeFix(question, selected_answer);
            is_correct = validation.is_correct;
            validation_feedback = validation.feedback;
        }

        let new_combo = session.combo;
        let points_earned = 0;
        let new_score = session.score;
        let new_bugs_found = session.bugs_found;
        let max_combo = session.max_combo;

        if (is_correct) {
            new_combo += 1;
            const multiplier = Math.min(new_combo, 4); // x1, x2, x3, x4
            points_earned = question.points * multiplier;
            new_score += points_earned;
            new_bugs_found += 1;
            if (new_combo > max_combo) {
                max_combo = new_combo;
            }
        } else {
            new_combo = 0; // Combo reset
            points_earned = -question.penalty;
            new_score = Math.max(0, new_score - question.penalty);
        }

        const is_game_over = false;
        const new_status = 'in_progress';

        // Record attempt in answers table
        db.prepare(`
            INSERT INTO answers (session_id, participant_id, question_id, selected_answer, is_correct, points_earned, time_taken_sec)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(session.id, session.participant_id, question.id, String(selected_answer || ''), is_correct ? 1 : 0, points_earned, time_taken_sec);

        // Update session
        db.prepare(`
            UPDATE game_sessions 
            SET score = ?, bugs_found = ?, combo = ?, max_combo = ?, status = ?, total_time_sec = total_time_sec + ?
            WHERE id = ?
        `).run(new_score, new_bugs_found, new_combo, max_combo, new_status, time_taken_sec, session.id);

        return res.json({
            success: true,
            is_correct,
            points_earned,
            correct_answer: question.correct_answer,
            solution_code: question.solution_code || '',
            validation_feedback,
            explanation: question.explanation,
            current_score: new_score,
            combo: new_combo,
            bugs_found: new_bugs_found,
            is_game_over: false
        });

    } catch (err) {
        console.error('Answer submission error:', err);
        return res.status(500).json({ error: 'Failed to process answer.' });
    }
});

// POST /api/game/hint - Use a hint (-5 points)
router.post('/hint', (req, res) => {
    try {
        const { session_token, question_id } = req.body;

        const session = getSession(session_token);
        if (!session) {
            return res.status(404).json({ error: 'Game session not found.' });
        }

        if (session.hints_remaining <= 0) {
            return res.status(400).json({ error: 'No hints remaining.' });
        }

        const question = db.prepare('SELECT hint FROM questions WHERE id = ?').get(question_id);
        if (!question) {
            return res.status(404).json({ error: 'Question not found.' });
        }

        // Deduct 5 points and 1 hint
        const new_score = Math.max(0, session.score - 5);
        const new_hints = session.hints_remaining - 1;

        db.prepare(`
            UPDATE game_sessions 
            SET score = ?, hints_remaining = ?
            WHERE id = ?
        `).run(new_score, new_hints, session.id);

        return res.json({
            success: true,
            hint: question.hint,
            hints_remaining: new_hints,
            current_score: new_score
        });
    } catch (err) {
        console.error('Hint error:', err);
        return res.status(500).json({ error: 'Failed to use hint.' });
    }
});

// POST /api/game/tab-switch - Record anti-cheat violation
router.post('/tab-switch', (req, res) => {
    try {
        const { session_token } = req.body;
        const session = getSession(session_token);
        if (!session) {
            return res.status(404).json({ error: 'Session not found.' });
        }

        db.prepare(`
            UPDATE game_sessions 
            SET tab_switches = tab_switches + 1 
            WHERE id = ?
        `).run(session.id);

        const updated = db.prepare('SELECT tab_switches FROM game_sessions WHERE id = ?').get(session.id);

        return res.json({
            success: true,
            tab_switches: updated.tab_switches
        });
    } catch (err) {
        console.error('Tab switch error:', err);
        return res.status(500).json({ error: 'Failed to log tab switch.' });
    }
});

// POST /api/game/finish - Complete game session and return final results
router.post('/finish', (req, res) => {
    try {
        const { session_token, total_time_sec = 0 } = req.body;

        const session = getSession(session_token);
        if (!session) {
            return res.status(404).json({ error: 'Session not found.' });
        }

        const final_time = total_time_sec > 0 ? total_time_sec : session.total_time_sec;

        db.prepare(`
            UPDATE game_sessions 
            SET status = 'completed', finished_at = CURRENT_TIMESTAMP, total_time_sec = ?
            WHERE id = ?
        `).run(final_time, session.id);

        // Fetch participant details
        const participant = db.prepare('SELECT * FROM participants WHERE participant_id = ?').get(session.participant_id);

        // Fetch answer statistics
        const stats = db.prepare(`
            SELECT 
                COUNT(*) as total_attempts,
                SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_count
            FROM answers 
            WHERE session_id = ?
        `).get(session.id);

        const attempts = stats ? stats.total_attempts : 0;
        const correct = stats ? (stats.correct_count || 0) : 0;
        const accuracy = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;

        let rank_title = 'CODE RECRUIT';
        if (accuracy >= 90) {
            rank_title = 'MASTER DEBUGGER';
        } else if (accuracy >= 70) {
            rank_title = 'BUG SLAYER';
        } else if (accuracy >= 50) {
            rank_title = 'DEBUGGING APPRENTICE';
        }

        // Compute rank on leaderboard
        const rankResult = db.prepare(`
            SELECT COUNT(*) + 1 as rank 
            FROM game_sessions 
            WHERE (score > ? OR (score = ? AND total_time_sec < ?))
              AND status = 'completed'
        `).get(session.score, session.score, final_time);

        const currentRank = rankResult ? rankResult.rank : 1;

        return res.json({
            success: true,
            participant,
            final_stats: {
                score: session.score,
                bugs_found: session.bugs_found,
                accuracy,
                total_time_sec: final_time,
                max_combo: session.max_combo,
                tab_switches: session.tab_switches,
                rank_title,
                rank: currentRank
            }
        });
    } catch (err) {
        console.error('Finish game error:', err);
        return res.status(500).json({ error: 'Failed to complete game.' });
    }
});

export default router;
