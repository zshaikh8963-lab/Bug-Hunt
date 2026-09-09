import express from 'express';
import db from '../database/db.js';
import { runVisibleTests, evaluatePythonSubmission } from '../services/pythonRunner.js';
import { broadcastLeaderboard, broadcastTeamSubmission, broadcastViolation } from '../services/socketManager.js';

const router = express.Router();

// Helper: Get team by team_id
function getTeam(team_id) {
    if (!team_id) return null;
    return db.prepare('SELECT * FROM teams WHERE team_id = ?').get(team_id);
}

// Helper: Recalculate and broadcast leaderboard
function refreshLeaderboard() {
    try {
        const rows = db.prepare(`
            SELECT 
                team_id, team_name, department, college,
                r1_score, r2_score, r3_score, final_score,
                total_time_sec, status, is_disqualified,
                r3_finished_at, created_at
            FROM teams
            ORDER BY is_disqualified ASC,
                     final_score DESC, 
                     r3_score DESC, 
                     total_time_sec ASC, 
                     id ASC
        `).all();

        const leaderboard = rows.map((r, i) => ({
            rank: i + 1,
            team_id: r.team_id,
            team_name: r.team_name,
            department: r.department,
            college: r.college,
            r1_score: r.r1_score || 0,
            r2_score: r.r2_score || 0,
            r3_score: r.r3_score || 0,
            final_score: Math.min(50, r.final_score || 0),
            total_time_sec: r.total_time_sec || 0,
            status: r.status,
            is_disqualified: Boolean(r.is_disqualified)
        }));

        broadcastLeaderboard(leaderboard);
        return leaderboard;
    } catch (e) {
        console.error('Leaderboard refresh error:', e);
        return [];
    }
}

// GET /api/rounds/current - Fetch questions assigned to the team for the current round
router.get('/current', (req, res) => {
    try {
        const team_id = req.query.team_id || req.headers['x-team-id'];
        const team = getTeam(team_id);

        if (!team) {
            return res.status(404).json({ error: 'Team not found. Please register or log in.' });
        }

        if (team.is_disqualified) {
            return res.status(403).json({ error: 'Team is disqualified.', is_disqualified: true });
        }

        const compState = db.prepare('SELECT * FROM competition_state WHERE id = 1').get();
        const activeRound = compState ? compState.active_round : 0;

        // Current round requested
        const roundNum = parseInt(req.query.round || team.current_round || 1, 10);

        // Fetch or create persistent assignments for this round
        let assignment = db.prepare(`
            SELECT * FROM round_assignments 
            WHERE team_id = ? AND round_num = ?
        `).get(team.team_id, roundNum);

        let questionIds = [];

        if (assignment) {
            try {
                questionIds = JSON.parse(assignment.question_ids_json);
            } catch (e) {
                questionIds = [];
            }

            // Verify that all assigned questions still exist in the database
            if (roundNum === 1) {
                const placeholders = questionIds.length > 0 ? questionIds.map(() => '?').join(',') : '0';
                const validRows = questionIds.length > 0
                    ? db.prepare(`SELECT id FROM mcq_questions WHERE id IN (${placeholders}) AND is_active = 1`).all(...questionIds)
                    : [];
                if (validRows.length < 10) {
                    // Stale assignment with deleted/reseeded IDs! Clean up and reassign
                    db.prepare('DELETE FROM round_assignments WHERE team_id = ? AND round_num = ?').run(team.team_id, roundNum);
                    assignment = null;
                    questionIds = [];
                }
            } else if (roundNum === 2) {
                const placeholders = questionIds.length > 0 ? questionIds.map(() => '?').join(',') : '0';
                const validRows = questionIds.length > 0
                    ? db.prepare(`SELECT id FROM java_challenges WHERE id IN (${placeholders}) AND is_active = 1`).all(...questionIds)
                    : [];
                if (validRows.length < 3) {
                    db.prepare('DELETE FROM round_assignments WHERE team_id = ? AND round_num = ?').run(team.team_id, roundNum);
                    assignment = null;
                    questionIds = [];
                }
            } else if (roundNum === 3) {
                const placeholders = questionIds.length > 0 ? questionIds.map(() => '?').join(',') : '0';
                const validRows = questionIds.length > 0
                    ? db.prepare(`SELECT id FROM python_challenges WHERE id IN (${placeholders}) AND is_active = 1`).all(...questionIds)
                    : [];
                if (validRows.length < 2) {
                    db.prepare('DELETE FROM round_assignments WHERE team_id = ? AND round_num = ?').run(team.team_id, roundNum);
                    assignment = null;
                    questionIds = [];
                }
            }
        }

        if (!assignment) {
            // Assign questions permanently
            if (roundNum === 1) {
                // Recommended selection: 4 Easy + 4 Moderate + 2 Hard (Total = 10 Questions)
                const easyPool = db.prepare(`SELECT id FROM mcq_questions WHERE is_active = 1 AND difficulty = 'Easy' ORDER BY RANDOM() LIMIT 4`).all();
                const modPool = db.prepare(`SELECT id FROM mcq_questions WHERE is_active = 1 AND difficulty = 'Moderate' ORDER BY RANDOM() LIMIT 4`).all();
                const hardPool = db.prepare(`SELECT id FROM mcq_questions WHERE is_active = 1 AND difficulty = 'Hard' ORDER BY RANDOM() LIMIT 2`).all();

                const selected = [
                    ...easyPool.map(p => p.id),
                    ...modPool.map(p => p.id),
                    ...hardPool.map(p => p.id)
                ];

                // If fewer than 10 collected from difficulty buckets, backfill with any remaining active MCQs
                if (selected.length < 10) {
                    const existingSet = new Set(selected);
                    const remaining = db.prepare(`
                        SELECT id FROM mcq_questions 
                        WHERE is_active = 1 
                        ORDER BY RANDOM()
                    `).all().filter(q => !existingSet.has(q.id));
                    for (const q of remaining) {
                        if (selected.length >= 10) break;
                        selected.push(q.id);
                    }
                }

                // Shuffle final 10 question order for each team
                questionIds = selected.sort(() => Math.random() - 0.5);

            } else if (roundNum === 2) {
                // Official Organizer Requirement: Exactly 3 Challenges in sequence Easy -> Moderate -> Hard
                const easy = db.prepare(`
                    SELECT id FROM java_challenges 
                    WHERE is_active = 1 AND LOWER(difficulty) = 'easy'
                    ORDER BY RANDOM() LIMIT 1
                `).get();

                const moderate = db.prepare(`
                    SELECT id FROM java_challenges 
                    WHERE is_active = 1 AND LOWER(difficulty) = 'moderate'
                    ORDER BY RANDOM() LIMIT 1
                `).get();

                const hard = db.prepare(`
                    SELECT id FROM java_challenges 
                    WHERE is_active = 1 AND (LOWER(difficulty) = 'hard' OR LOWER(difficulty) LIKE '%hard%')
                    ORDER BY RANDOM() LIMIT 1
                `).get();

                const selected = [easy?.id, moderate?.id, hard?.id].filter(Boolean);

                // Fallback in case difficulty tags are missing or question pool is constrained
                if (selected.length < 3) {
                    const existingSet = new Set(selected);
                    const remaining = db.prepare(`
                        SELECT id FROM java_challenges 
                        WHERE is_active = 1 
                        ORDER BY RANDOM()
                    `).all().filter(c => !existingSet.has(c.id));
                    for (const c of remaining) {
                        if (selected.length >= 3) break;
                        selected.push(c.id);
                    }
                }

                questionIds = selected.slice(0, 3);

            } else if (roundNum === 3) {
                // Official Organizer Requirement: Exactly 2 Python Challenges (1 Easy + 1 Hard)
                const easy = db.prepare(`
                    SELECT id FROM python_challenges 
                    WHERE is_active = 1 AND LOWER(difficulty) = 'easy'
                    ORDER BY RANDOM() LIMIT 1
                `).get();

                const hard = db.prepare(`
                    SELECT id FROM python_challenges 
                    WHERE is_active = 1 AND LOWER(difficulty) = 'hard'
                    ORDER BY RANDOM() LIMIT 1
                `).get();

                const selected = [easy?.id, hard?.id].filter(Boolean);

                if (selected.length < 2) {
                    const existingSet = new Set(selected);
                    const remaining = db.prepare(`
                        SELECT id FROM python_challenges 
                        WHERE is_active = 1 
                        ORDER BY RANDOM()
                    `).all().filter(c => !existingSet.has(c.id));
                    for (const c of remaining) {
                        if (selected.length >= 2) break;
                        selected.push(c.id);
                    }
                }

                questionIds = selected.slice(0, 2);
            }

            if (questionIds.length > 0) {
                db.prepare(`
                    INSERT INTO round_assignments (team_id, round_num, question_ids_json)
                    VALUES (?, ?, ?)
                `).run(team.team_id, roundNum, JSON.stringify(questionIds));
            }
        }

        // Fetch submissions already made by this team for this round
        const submissions = db.prepare(`
            SELECT task_index, question_id, score_awarded, is_correct, answer_data_json
            FROM round_submissions
            WHERE team_id = ? AND round_num = ?
            ORDER BY task_index ASC
        `).all(team.team_id, roundNum);

        // Fetch and format questions payload based on roundNum
        let formattedTasks = [];

        if (roundNum === 1) {
            for (let i = 0; i < questionIds.length; i++) {
                const q = db.prepare('SELECT * FROM mcq_questions WHERE id = ?').get(questionIds[i]);
                if (q) {
                    let options = [];
                    try { options = JSON.parse(q.options_json); } catch (e) { options = []; }
                    formattedTasks.push({
                        task_index: i,
                        id: q.id,
                        question_id: q.id,
                        language: q.language,
                        title: q.title,
                        question_text: q.question_text,
                        code_snippet: q.code_snippet,
                        options, // sanitized, correct_option_index is kept on server
                        points: 1
                    });
                }
            }
        } else if (roundNum === 2) {
            for (let i = 0; i < questionIds.length; i++) {
                const j = db.prepare('SELECT * FROM java_challenges WHERE id = ?').get(questionIds[i]);
                if (j) {
                    formattedTasks.push({
                        task_index: i,
                        id: j.id,
                        question_id: j.id,
                        challenge_id: j.id,
                        challenge_code: j.challenge_code,
                        title: j.title,
                        difficulty: j.difficulty || (i === 0 ? 'Easy' : i === 1 ? 'Moderate' : 'Hard'),
                        description: j.description,
                        code_snippet: j.code_snippet, // with line numbers
                        points: 5
                    });
                }
            }
        } else if (roundNum === 3) {
            for (let i = 0; i < questionIds.length; i++) {
                const p = db.prepare('SELECT * FROM python_challenges WHERE id = ?').get(questionIds[i]);
                if (p) {
                    let visibleTests = [];
                    try { visibleTests = JSON.parse(p.visible_tests_json); } catch (e) { visibleTests = []; }
                    const diff = p.difficulty || (i === 0 ? 'Easy' : 'Hard');
                    const pts = diff.toLowerCase() === 'easy' ? 12 : 13;
                    formattedTasks.push({
                        task_index: i,
                        id: p.id,
                        question_id: p.id,
                        challenge_id: p.id,
                        challenge_code: p.challenge_code,
                        title: p.title,
                        difficulty: diff,
                        description: p.description,
                        expected_behavior: p.expected_behavior,
                        input_format: p.input_format,
                        output_format: p.output_format,
                        constraints: p.constraints,
                        buggy_code: p.buggy_code,
                        faulty_line: p.faulty_line,
                        visible_tests: visibleTests, // hidden_tests are NEVER sent to frontend!
                        points: pts
                    });
                }
            }
        }

        return res.json({
            success: true,
            round_num: roundNum,
            active_round: activeRound,
            is_paused: Boolean(compState?.is_paused),
            team_status: team.status,
            round_scores: {
                r1: team.r1_score || 0,
                r2: team.r2_score || 0,
                r3: team.r3_score || 0,
                final: team.final_score || 0
            },
            tasks: formattedTasks,
            submissions: submissions.map(s => ({
                task_index: s.task_index,
                question_id: s.question_id,
                score_awarded: s.score_awarded,
                is_correct: Boolean(s.is_correct)
            }))
        });

    } catch (err) {
        console.error('Get round error:', err);
        return res.status(500).json({ error: 'Failed to fetch round challenges.' });
    }
});

// POST /api/rounds/r1/submit - Submit Round 1 MCQ answer (1 mark)
router.post('/r1/submit', (req, res) => {
    try {
        const team_id = req.body.team_id;
        const task_index = req.body.task_index;
        const question_id = req.body.question_id || req.body.id;
        const selected_option_index = req.body.selected_option_index !== undefined ? req.body.selected_option_index : req.body.selected_option;
        const time_taken_sec = req.body.time_taken_sec !== undefined ? req.body.time_taken_sec : (req.body.time_taken || 0);

        const team = getTeam(team_id);
        if (!team) return res.status(404).json({ error: 'Team not found.' });
        if (team.is_disqualified) return res.status(403).json({ error: 'Team is disqualified.' });

        const q = db.prepare('SELECT * FROM mcq_questions WHERE id = ?').get(question_id);
        if (!q) return res.status(404).json({ error: 'Question not found.' });

        // Check if already submitted
        const existing = db.prepare(`
            SELECT id FROM round_submissions 
            WHERE team_id = ? AND round_num = 1 AND task_index = ?
        `).get(team.team_id, task_index);

        if (existing) {
            return res.status(400).json({ error: 'Question already submitted.' });
        }

        const isCorrect = parseInt(selected_option_index, 10) === q.correct_option_index;
        const scoreAwarded = isCorrect ? 1.0 : 0.0;

        db.transaction(() => {
            db.prepare(`
                INSERT INTO round_submissions (team_id, round_num, question_id, task_index, answer_data_json, score_awarded, is_correct, time_taken_sec)
                VALUES (?, 1, ?, ?, ?, ?, ?, ?)
            `).run(team.team_id, q.id, task_index, JSON.stringify({ selected_option_index }), scoreAwarded, isCorrect ? 1 : 0, time_taken_sec);

            // Update team scores
            const newR1Score = (team.r1_score || 0) + scoreAwarded;
            const newFinalScore = Math.min(50, newR1Score + (team.r2_score || 0) + (team.r3_score || 0));

            // Check total R1 submissions
            const subCount = db.prepare(`
                SELECT COUNT(*) as c FROM round_submissions WHERE team_id = ? AND round_num = 1
            `).get(team.team_id).c;

            const isDone = subCount >= 10;
            const newStatus = isDone ? 'ROUND_1_DONE' : 'ROUND_1';

            db.prepare(`
                UPDATE teams 
                SET r1_score = ?, final_score = ?, status = ?, 
                    total_time_sec = total_time_sec + ?,
                    r1_finished_at = CASE WHEN ? = 1 THEN CURRENT_TIMESTAMP ELSE r1_finished_at END
                WHERE team_id = ?
            `).run(newR1Score, newFinalScore, newStatus, time_taken_sec, isDone ? 1 : 0, team.team_id);
        })();

        broadcastTeamSubmission({
            team_id: team.team_id,
            team_name: team.team_name,
            round_num: 1,
            task_index,
            is_correct: isCorrect
        });

        refreshLeaderboard();

        return res.json({
            success: true,
            is_correct: isCorrect,
            score_awarded: scoreAwarded,
            correct_option_index: q.correct_option_index,
            explanation: q.explanation
        });
    } catch (err) {
        console.error('R1 submit error:', err);
        return res.status(500).json({ error: 'Failed to submit MCQ answer.' });
    }
});

// POST /api/rounds/r2/submit - Submit Round 2 Java Bug Identification (5 marks: Line 3pts + Type 2pts)
router.post('/r2/submit', (req, res) => {
    try {
        const team_id = req.body.team_id;
        const task_index = req.body.task_index;
        const question_id = req.body.question_id || req.body.challenge_id || req.body.id;
        const selected_line = req.body.selected_line;
        const selected_bug_type = req.body.selected_bug_type;
        const time_taken_sec = req.body.time_taken_sec !== undefined ? req.body.time_taken_sec : (req.body.time_taken || 0);

        const team = getTeam(team_id);
        if (!team) return res.status(404).json({ error: 'Team not found.' });
        if (team.is_disqualified) return res.status(403).json({ error: 'Team is disqualified.' });

        const j = db.prepare('SELECT * FROM java_challenges WHERE id = ?').get(question_id);
        if (!j) return res.status(404).json({ error: 'Java challenge not found.' });

        const existing = db.prepare(`
            SELECT id FROM round_submissions 
            WHERE team_id = ? AND round_num = 2 AND task_index = ?
        `).get(team.team_id, task_index);

        if (existing) {
            return res.status(400).json({ error: 'Challenge already submitted.' });
        }

        // Scoring rules (Organizer Specification):
        // Correct Line = 2 Marks
        // Correct Bug Type = 3 Marks
        const lineSubmitted = parseInt(selected_line, 10);
        const lineCorrect = lineSubmitted === j.buggy_line;

        const normSubmittedType = String(selected_bug_type || '').trim().toLowerCase();
        const normActualType = String(j.bug_type || '').trim().toLowerCase();
        const typeCorrect = normSubmittedType.length > 0 && 
            (normActualType.includes(normSubmittedType) || normSubmittedType.includes(normActualType));

        let scoreAwarded = 0;
        if (lineCorrect) scoreAwarded += 2;
        if (typeCorrect) scoreAwarded += 3;

        db.transaction(() => {
            db.prepare(`
                INSERT INTO round_submissions (team_id, round_num, question_id, task_index, answer_data_json, score_awarded, is_correct, time_taken_sec)
                VALUES (?, 2, ?, ?, ?, ?, ?, ?)
            `).run(team.team_id, j.id, task_index, JSON.stringify({ selected_line, selected_bug_type }), scoreAwarded, scoreAwarded === 5 ? 1 : 0, time_taken_sec);

            const newR2Score = (team.r2_score || 0) + scoreAwarded;
            const newFinalScore = Math.min(50, (team.r1_score || 0) + newR2Score + (team.r3_score || 0));

            const subCount = db.prepare(`
                SELECT COUNT(*) as c FROM round_submissions WHERE team_id = ? AND round_num = 2
            `).get(team.team_id).c;

            const isDone = subCount >= 3;
            const newStatus = isDone ? 'ROUND_2_DONE' : 'ROUND_2';

            db.prepare(`
                UPDATE teams 
                SET r2_score = ?, final_score = ?, status = ?, 
                    total_time_sec = total_time_sec + ?,
                    r2_finished_at = CASE WHEN ? = 1 THEN CURRENT_TIMESTAMP ELSE r2_finished_at END
                WHERE team_id = ?
            `).run(newR2Score, newFinalScore, newStatus, time_taken_sec, isDone ? 1 : 0, team.team_id);
        })();

        broadcastTeamSubmission({
            team_id: team.team_id,
            team_name: team.team_name,
            round_num: 2,
            task_index,
            score_awarded: scoreAwarded
        });

        refreshLeaderboard();

        return res.json({
            success: true,
            score_awarded: scoreAwarded,
            line_correct: lineCorrect,
            type_correct: typeCorrect,
            actual_buggy_line: j.buggy_line,
            actual_bug_type: j.bug_type,
            explanation: j.explanation
        });
    } catch (err) {
        console.error('R2 submit error:', err);
        return res.status(500).json({ error: 'Failed to submit Java challenge.' });
    }
});

// POST /api/rounds/r3/run-test - Run code in Monaco editor against visible test cases only
router.post('/r3/run-test', async (req, res) => {
    try {
        const question_id = req.body.question_id || req.body.challenge_id || req.body.id;
        const code = req.body.code || req.body.user_code;
        if (!code) {
            return res.status(400).json({ error: 'No code submitted to run.' });
        }

        const p = db.prepare('SELECT visible_tests_json FROM python_challenges WHERE id = ?').get(question_id);
        if (!p) {
            return res.status(404).json({ error: 'Python challenge not found.' });
        }

        let visibleTests = [];
        try { visibleTests = JSON.parse(p.visible_tests_json); } catch (e) { visibleTests = []; }

        const result = await runVisibleTests(code, visibleTests);
        return res.json({
            success: true,
            ...result
        });
    } catch (err) {
        console.error('R3 run test error:', err);
        return res.status(500).json({ error: 'Failed to execute test run.' });
    }
});

// POST /api/rounds/r3/submit - Submit Python code solution against visible + hidden tests
router.post('/r3/submit', async (req, res) => {
    try {
        const team_id = req.body.team_id;
        const task_index = req.body.task_index;
        const question_id = req.body.question_id || req.body.challenge_id || req.body.id;
        const code = req.body.code || req.body.user_code;
        const identified_bug = req.body.identified_bug;
        const faulty_line = req.body.faulty_line;
        const time_taken_sec = req.body.time_taken_sec !== undefined ? req.body.time_taken_sec : (req.body.time_taken || 0);

        const team = getTeam(team_id);
        if (!team) return res.status(404).json({ error: 'Team not found.' });
        if (team.is_disqualified) return res.status(403).json({ error: 'Team is disqualified.' });

        const p = db.prepare('SELECT * FROM python_challenges WHERE id = ?').get(question_id);
        if (!p) return res.status(404).json({ error: 'Python challenge not found.' });

        const existing = db.prepare(`
            SELECT id FROM round_submissions 
            WHERE team_id = ? AND round_num = 3 AND task_index = ?
        `).get(team.team_id, task_index);

        if (existing) {
            return res.status(400).json({ error: 'Challenge already submitted.' });
        }

        // Run comprehensive evaluation (visible + hidden tests)
        const evalResult = await evaluatePythonSubmission(p, code, identified_bug, faulty_line, task_index);

        const scoreAwarded = evalResult.score_awarded || 0;
        const isCorrect = evalResult.overall_status === 'ACCEPTED' ? 1 : 0;

        db.transaction(() => {
            db.prepare(`
                INSERT INTO round_submissions (team_id, round_num, question_id, task_index, answer_data_json, score_awarded, is_correct, time_taken_sec)
                VALUES (?, 3, ?, ?, ?, ?, ?, ?)
            `).run(team.team_id, p.id, task_index, JSON.stringify({ 
                identified_bug, faulty_line, code, 
                overall_status: evalResult.overall_status, 
                breakdown: evalResult.breakdown 
            }), scoreAwarded, isCorrect, time_taken_sec);

            const newR3Score = (team.r3_score || 0) + scoreAwarded;
            const newFinalScore = Math.min(50, (team.r1_score || 0) + (team.r2_score || 0) + newR3Score);

            const subCount = db.prepare(`
                SELECT COUNT(*) as c FROM round_submissions WHERE team_id = ? AND round_num = 3
            `).get(team.team_id).c;

            const isDone = subCount >= 2;
            const newStatus = isDone ? 'FINISHED' : 'ROUND_3';

            db.prepare(`
                UPDATE teams 
                SET r3_score = ?, final_score = ?, status = ?, 
                    total_time_sec = total_time_sec + ?,
                    r3_finished_at = CASE WHEN ? = 1 THEN CURRENT_TIMESTAMP ELSE r3_finished_at END
                WHERE team_id = ?
            `).run(newR3Score, newFinalScore, newStatus, time_taken_sec, isDone ? 1 : 0, team.team_id);
        })();

        broadcastTeamSubmission({
            team_id: team.team_id,
            team_name: team.team_name,
            round_num: 3,
            task_index,
            score_awarded: scoreAwarded,
            overall_status: evalResult.overall_status
        });

        refreshLeaderboard();

        return res.json({
            success: true,
            overall_status: evalResult.overall_status,
            score_awarded: scoreAwarded,
            max_marks: evalResult.max_marks,
            breakdown: evalResult.breakdown,
            visible_results: evalResult.visible_results,
            hidden_passed: evalResult.hidden_passed_count,
            hidden_total: evalResult.hidden_total_count
        });

    } catch (err) {
        console.error('R3 submit error:', err);
        return res.status(500).json({ error: 'Failed to evaluate Python submission.' });
    }
});

// POST /api/rounds/violation - Anti-Cheating Strike Recorder (3 Strikes Rule)
router.post('/violation', (req, res) => {
    try {
        const { team_id, violation_type = 'TAB_SWITCH', details = '' } = req.body;
        const team = getTeam(team_id);

        if (!team) return res.status(404).json({ error: 'Team not found.' });

        const currentStrikes = (team.violations_count || 0) + 1;
        const isDisqualified = currentStrikes >= 3;

        db.transaction(() => {
            db.prepare(`
                INSERT INTO violations (team_id, violation_type, strike_number, details)
                VALUES (?, ?, ?, ?)
            `).run(team.team_id, violation_type, currentStrikes, details);

            db.prepare(`
                UPDATE teams 
                SET violations_count = ?,
                    is_disqualified = ?,
                    status = CASE WHEN ? = 1 THEN 'DISQUALIFIED' ELSE status END,
                    disqualify_reason = CASE WHEN ? = 1 THEN 'Disqualified: Reached 3 anti-cheating violations' ELSE disqualify_reason END
                WHERE team_id = ?
            `).run(currentStrikes, isDisqualified ? 1 : 0, isDisqualified ? 1 : 0, isDisqualified ? 1 : 0, team.team_id);
        })();

        const violationData = {
            strike: currentStrikes,
            strikes: currentStrikes,
            violation_type,
            is_disqualified: isDisqualified,
            message: isDisqualified 
                ? 'TEAM DISQUALIFIED: Exceeded maximum allowed violation strikes.' 
                : (currentStrikes === 2 ? 'WARNING 2/3: Final warning. Another violation will disqualify your team.' : 'WARNING 1/3: Please remain on the BUG HUNT competition screen.')
        };

        broadcastViolation(team.team_id, violationData);
        refreshLeaderboard();

        return res.json({
            success: true,
            ...violationData
        });

    } catch (err) {
        console.error('Violation record error:', err);
        return res.status(500).json({ error: 'Failed to record violation.' });
    }
});

export default router;
