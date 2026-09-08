import bcrypt from 'bcryptjs';
import db from './db.js';
import { r1Questions } from './questions_r1.js';
import { r2JavaChallenges } from './questions_r2.js';
import { r3PythonChallenges } from './questions_r3.js';

console.log('Seeding BUG HUNT Official Competition Database...');

// 1. Seed Admin User
const adminPassword = 'admin123';
const salt = bcrypt.genSaltSync(10);
const passwordHash = bcrypt.hashSync(adminPassword, salt);

db.prepare('DELETE FROM admin_users WHERE username = ?').run('admin');
db.prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)').run('admin', passwordHash);
console.log('✓ Admin user seeded: username="admin", password="admin123"');

// 2. Clear old competition tables
db.prepare('DELETE FROM round_submissions').run();
db.prepare('DELETE FROM round_assignments').run();
db.prepare('DELETE FROM violations').run();
db.prepare('DELETE FROM certificates').run();
db.prepare('DELETE FROM team_members').run();
db.prepare('DELETE FROM teams').run();
db.prepare('DELETE FROM mcq_questions').run();
db.prepare('DELETE FROM java_challenges').run();
db.prepare('DELETE FROM python_challenges').run();

// Also clear legacy tables for a clean slate
db.prepare('DELETE FROM answers').run();
db.prepare('DELETE FROM game_sessions').run();
db.prepare('DELETE FROM participants').run();

// 3. Seed Round 1 MCQs (50 Questions)
const insertMcq = db.prepare(`
    INSERT INTO mcq_questions (language, difficulty, title, question_text, code_snippet, options_json, correct_option_index, explanation, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
`);

const insertAllMcqs = db.transaction((questions) => {
    for (const q of questions) {
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
});
insertAllMcqs(r1Questions);
console.log(`✓ Seeded ${r1Questions.length} Round 1 MCQs (C, C++, Java, Python, HTML).`);

// 4. Seed Round 2 Java Challenges (30+ Challenges)
const insertJava = db.prepare(`
    INSERT INTO java_challenges (challenge_code, title, description, code_snippet, buggy_line, bug_type, explanation, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
`);

const insertAllJava = db.transaction((challenges) => {
    for (const j of challenges) {
        insertJava.run(
            j.challenge_code,
            j.title,
            j.description,
            j.code_snippet,
            j.buggy_line,
            j.bug_type,
            j.explanation
        );
    }
});
insertAllJava(r2JavaChallenges);
console.log(`✓ Seeded ${r2JavaChallenges.length} Round 2 Java Bug Identification Challenges.`);

// 5. Seed Round 3 Python Challenges (30 Challenges)
const insertPython = db.prepare(`
    INSERT INTO python_challenges (
        challenge_code, title, description, expected_behavior, input_format, output_format,
        constraints, buggy_code, canonical_solution, faulty_line, bug_type,
        visible_tests_json, hidden_tests_json, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
`);

const insertAllPython = db.transaction((challenges) => {
    for (const p of challenges) {
        insertPython.run(
            p.challenge_code,
            p.title,
            p.description,
            p.expected_behavior,
            p.input_format,
            p.output_format,
            p.constraints,
            p.buggy_code,
            p.canonical_solution,
            p.faulty_line,
            p.bug_type,
            JSON.stringify(p.visible_tests),
            JSON.stringify(p.hidden_tests)
        );
    }
});
insertAllPython(r3PythonChallenges);
console.log(`✓ Seeded ${r3PythonChallenges.length} Round 3 Python Challenges with visible & hidden test cases.`);

// 6. Reset Competition State to WAITING
db.prepare(`
    UPDATE competition_state 
    SET status = 'WAITING', is_paused = 0, active_round = 0, message = 'Welcome to BUG HUNT! Awaiting tournament start by Admin.',
        results_locked = 0, winner_reveal_state = 'NONE', round_started_at = NULL, paused_at = NULL, ended_at = NULL
    WHERE id = 1
`).run();

console.log('✓ Competition state initialized to WAITING.');
console.log('==============================================');
console.log('🎉 BUG HUNT DATABASE SEEDING COMPLETED!');
console.log('==============================================');
