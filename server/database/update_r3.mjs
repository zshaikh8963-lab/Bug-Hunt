import db from './db.js';
import { r3PythonChallenges } from './questions_r3.js';

console.log('Updating Round 3 Question Bank...');

// Ensure difficulty column exists
try {
    const pyCols = db.prepare("PRAGMA table_info(python_challenges)").all();
    if (!pyCols.some(c => c.name === 'difficulty')) {
        db.prepare("ALTER TABLE python_challenges ADD COLUMN difficulty TEXT DEFAULT 'Easy'").run();
        console.log('[DB] Added difficulty column to python_challenges.');
    }
} catch (e) {
    console.error('[DB] Migration error for python_challenges difficulty:', e);
}

// Clear existing Round 3 challenges and stale assignments
db.prepare('DELETE FROM python_challenges').run();
db.prepare('DELETE FROM round_assignments WHERE round_num = 3').run();

// Insert all 4 official organizer questions
const insertPy = db.prepare(`
    INSERT INTO python_challenges (challenge_code, difficulty, title, description, expected_behavior, input_format, output_format, constraints, buggy_code, canonical_solution, faulty_line, bug_type, visible_tests_json, hidden_tests_json, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
`);

const insertAll = db.transaction((challenges) => {
    for (const p of challenges) {
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
});

insertAll(r3PythonChallenges);

const count = db.prepare('SELECT COUNT(*) as count FROM python_challenges').get();
console.log(`✓ Successfully loaded ${count.count} official Round 3 Python challenges into SQLite database!`);

// Print distribution
const distro = db.prepare('SELECT difficulty, COUNT(*) as count FROM python_challenges GROUP BY difficulty').all();
console.log('Difficulty distribution:');
distro.forEach(d => console.log(`  - ${d.difficulty}: ${d.count} questions`));
