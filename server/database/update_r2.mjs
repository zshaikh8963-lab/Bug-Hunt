import db from './db.js';
import { r2JavaChallenges } from './questions_r2.js';

console.log('Updating Round 2 Question Bank...');

// Ensure difficulty column exists
try {
    const javaCols = db.prepare("PRAGMA table_info(java_challenges)").all();
    if (!javaCols.some(c => c.name === 'difficulty')) {
        db.prepare("ALTER TABLE java_challenges ADD COLUMN difficulty TEXT DEFAULT 'Moderate'").run();
        console.log('[DB] Added difficulty column to java_challenges.');
    }
} catch (e) {
    console.error('[DB] Migration error for java_challenges difficulty:', e);
}

// Clear existing Round 2 challenges and stale assignments
db.prepare('DELETE FROM java_challenges').run();
db.prepare('DELETE FROM round_assignments WHERE round_num = 2').run();

// Insert all 10 official organizer questions
const insertJava = db.prepare(`
    INSERT INTO java_challenges (challenge_code, difficulty, title, description, code_snippet, buggy_line, bug_type, explanation, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
`);

const insertAll = db.transaction((challenges) => {
    for (const c of challenges) {
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
});

insertAll(r2JavaChallenges);

const count = db.prepare('SELECT COUNT(*) as count FROM java_challenges').get();
console.log(`✓ Successfully loaded ${count.count} official Round 2 Java challenges into SQLite database!`);

// Print distribution
const distro = db.prepare('SELECT difficulty, COUNT(*) as count FROM java_challenges GROUP BY difficulty').all();
console.log('Difficulty distribution:');
distro.forEach(d => console.log(`  - ${d.difficulty}: ${d.count} questions`));
