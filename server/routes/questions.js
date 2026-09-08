import express from 'express';
import db from '../database/db.js';

const router = express.Router();

// GET /api/questions?round_num=1
router.get('/', (req, res) => {
    try {
        const { round_num, difficulty, language } = req.query;

        let query = 'SELECT id, round_num, language, difficulty, question_type, title, description, code_snippet, options_json, points, penalty, time_limit_sec FROM questions WHERE is_active = 1';
        const params = [];

        if (round_num) {
            query += ' AND round_num = ?';
            params.push(Number(round_num));
        }

        if (difficulty) {
            query += ' AND difficulty = ?';
            params.push(difficulty);
        }

        if (language) {
            query += ' AND language = ?';
            params.push(language);
        }

        query += ' ORDER BY id ASC';

        const rawQuestions = db.prepare(query).all(...params);

        const questions = rawQuestions.map(q => ({
            ...q,
            options: JSON.parse(q.options_json)
        }));

        return res.json({
            success: true,
            count: questions.length,
            questions
        });
    } catch (err) {
        console.error('Fetch questions error:', err);
        return res.status(500).json({ error: 'Failed to fetch questions.' });
    }
});

// GET /api/questions/:id
router.get('/:id', (req, res) => {
    try {
        const q = db.prepare(`
            SELECT id, round_num, language, difficulty, question_type, title, description,
                   code_snippet, options_json, points, penalty, time_limit_sec
            FROM questions WHERE id = ? AND is_active = 1
        `).get(req.params.id);

        if (!q) {
            return res.status(404).json({ error: 'Question not found' });
        }

        return res.json({
            success: true,
            question: {
                ...q,
                options: JSON.parse(q.options_json)
            }
        });
    } catch (err) {
        console.error('Fetch single question error:', err);
        return res.status(500).json({ error: 'Failed to fetch question.' });
    }
});

export default router;
