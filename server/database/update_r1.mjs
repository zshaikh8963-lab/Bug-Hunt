import db from './db.js';
import { r1Questions } from './questions_r1.js';

console.log('Updating Round 1 Question Bank...');

// Clear existing Round 1 MCQs
db.prepare('DELETE FROM mcq_questions').run();

// Insert all 50 questions
const insertMcq = db.prepare(`
    INSERT INTO mcq_questions (language, difficulty, title, question_text, code_snippet, options_json, correct_option_index, explanation, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
`);

const insertAll = db.transaction((questions) => {
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

insertAll(r1Questions);

const count = db.prepare('SELECT COUNT(*) as count FROM mcq_questions').get();
console.log(`✓ Successfully loaded ${count.count} official Round 1 questions into SQLite database!`);

// Print distribution
const distro = db.prepare('SELECT language, COUNT(*) as count FROM mcq_questions GROUP BY language').all();
console.log('Language distribution:');
distro.forEach(d => console.log(`  - ${d.language}: ${d.count} questions`));
