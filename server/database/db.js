import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'bughunt.sqlite');
const db = new Database(dbPath);

// Enable WAL mode for high performance concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize schema
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf-8');
db.exec(schema);

// Migration: Ensure competition_state columns exist
try {
    const csCols = db.prepare("PRAGMA table_info(competition_state)").all().map(c => c.name);
    if (!csCols.includes('is_paused')) db.prepare("ALTER TABLE competition_state ADD COLUMN is_paused INTEGER DEFAULT 0").run();
    if (!csCols.includes('active_round')) db.prepare("ALTER TABLE competition_state ADD COLUMN active_round INTEGER DEFAULT 0").run();
    if (!csCols.includes('round_time_limit_sec')) db.prepare("ALTER TABLE competition_state ADD COLUMN round_time_limit_sec INTEGER DEFAULT 30").run();
    if (!csCols.includes('round_started_at')) db.prepare("ALTER TABLE competition_state ADD COLUMN round_started_at DATETIME").run();
    if (!csCols.includes('results_locked')) db.prepare("ALTER TABLE competition_state ADD COLUMN results_locked INTEGER DEFAULT 0").run();
    if (!csCols.includes('winner_reveal_state')) db.prepare("ALTER TABLE competition_state ADD COLUMN winner_reveal_state TEXT DEFAULT 'NONE'").run();
} catch (e) {
    // Already exists
}

// Ensure default competition state row exists
const stateExists = db.prepare('SELECT COUNT(*) as count FROM competition_state WHERE id = 1').get();
if (stateExists.count === 0) {
    db.prepare(`
        INSERT INTO competition_state (id, status, is_paused, active_round, message, round_started_at) 
        VALUES (1, 'WAITING', 0, 0, 'Welcome to BUG HUNT! Awaiting tournament start by Admin.', CURRENT_TIMESTAMP)
    `).run();
}

// Ensure default competition settings row exists
const settingsExists = db.prepare('SELECT COUNT(*) as count FROM competition_settings WHERE id = 1').get();
if (settingsExists.count === 0) {
    db.prepare(`
        INSERT INTO competition_settings (
            id, college_name, department, event_name, competition_date, venue,
            coordinator_name, hod_name, principal_name, show_score, show_rank, show_qr
        ) VALUES (
            1,
            'National Institute of Technology & Engineering',
            'Department of Computer Science & Information Technology',
            'BUG HUNT 2026',
            '2026-09-09',
            'Main Auditorium & Computer Labs',
            'Prof. A. Sharma',
            'Dr. R. K. Patel',
            'Dr. S. Nair',
            1, 1, 1
        )
    `).run();
}

// Ensure default admin user exists if table is empty
try {
    const adminExists = db.prepare('SELECT COUNT(*) as count FROM admin_users').get();
    if (adminExists.count === 0) {
        import('bcryptjs').then(({ default: bcrypt }) => {
            const adminUser = process.env.ADMIN_USERNAME || 'admin';
            const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(adminPass, salt);
            db.prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)').run(adminUser, hash);
            console.log(`[DB] Seeded initial admin account (username: "${adminUser}")`);
        }).catch(err => {
            console.error('[DB] Failed to seed admin user:', err);
        });
    }
} catch (e) {
    console.error('[DB] Admin init check error:', e);
}

// Auto-seed question banks if empty (Ensures cloud deployments like Render have questions instantly)
try {
    const mcqCount = db.prepare('SELECT COUNT(*) as count FROM mcq_questions').get();
    if (mcqCount.count === 0) {
        import('./questions_r1.js').then(({ r1Questions }) => {
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
            console.log(`[DB] Auto-seeded ${r1Questions.length} Round 1 MCQs into database.`);
        }).catch(err => console.error('[DB] Failed to auto-seed R1:', err));
    }

    // Ensure difficulty column exists in java_challenges
    try {
        const javaCols = db.prepare("PRAGMA table_info(java_challenges)").all();
        if (!javaCols.some(c => c.name === 'difficulty')) {
            db.prepare("ALTER TABLE java_challenges ADD COLUMN difficulty TEXT DEFAULT 'Moderate'").run();
            console.log('[DB] Added difficulty column to java_challenges.');
        }
    } catch (e) {
        console.error('[DB] Migration error for java_challenges difficulty:', e);
    }

    const javaCount = db.prepare('SELECT COUNT(*) as count FROM java_challenges').get();
    if (javaCount.count === 0) {
        import('./questions_r2.js').then(({ r2JavaChallenges }) => {
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
            console.log(`[DB] Auto-seeded ${r2JavaChallenges.length} Round 2 Java challenges into database.`);
        }).catch(err => console.error('[DB] Failed to auto-seed R2:', err));
    }

    // Ensure difficulty column exists in python_challenges
    try {
        const pyCols = db.prepare("PRAGMA table_info(python_challenges)").all();
        if (!pyCols.some(c => c.name === 'difficulty')) {
            db.prepare("ALTER TABLE python_challenges ADD COLUMN difficulty TEXT DEFAULT 'Easy'").run();
            console.log('[DB] Added difficulty column to python_challenges.');
        }
    } catch (e) {
        console.error('[DB] Migration error for python_challenges difficulty:', e);
    }

    const pyCount = db.prepare('SELECT COUNT(*) as count FROM python_challenges').get();
    if (pyCount.count === 0) {
        import('./questions_r3.js').then(({ r3PythonChallenges }) => {
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
            console.log(`[DB] Auto-seeded ${r3PythonChallenges.length} Round 3 Python challenges into database.`);
        }).catch(err => console.error('[DB] Failed to auto-seed R3:', err));
    }
} catch (e) {
    console.error('[DB] Auto-seed questions error:', e);
}

export default db;

