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

export default db;

