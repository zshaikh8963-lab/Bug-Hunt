-- Schema for BUG HUNT Technical Debugging Competition Platform

-- Admin Users
CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Competition Global State (Singleton id=1)
CREATE TABLE IF NOT EXISTS competition_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    status TEXT NOT NULL DEFAULT 'WAITING', -- 'WAITING', 'ROUND_1_ACTIVE', 'ROUND_1_COMPLETED', 'ROUND_2_ACTIVE', 'ROUND_2_COMPLETED', 'ROUND_3_ACTIVE', 'ROUND_3_COMPLETED', 'FINISHED'
    is_paused INTEGER DEFAULT 0,
    active_round INTEGER DEFAULT 0,
    round_time_limit_sec INTEGER DEFAULT 30,
    round_started_at DATETIME,
    paused_at DATETIME,
    ended_at DATETIME,
    message TEXT DEFAULT 'Welcome to BUG HUNT! Awaiting tournament start.',
    results_locked INTEGER DEFAULT 0,
    winner_reveal_state TEXT DEFAULT 'NONE', -- 'NONE', 'THIRD_PLACE', 'SECOND_PLACE', 'WINNER'
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Competition Settings (Singleton id=1)
CREATE TABLE IF NOT EXISTS competition_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    college_name TEXT DEFAULT 'National Institute of Technology & Engineering',
    department TEXT DEFAULT 'Department of Computer Science & Information Technology',
    event_name TEXT DEFAULT 'BUG HUNT 2026',
    competition_date TEXT DEFAULT '2026-09-09',
    venue TEXT DEFAULT 'Main Auditorium & Computer Labs',
    coordinator_name TEXT DEFAULT 'Prof. A. Sharma',
    hod_name TEXT DEFAULT 'Dr. R. K. Patel',
    principal_name TEXT DEFAULT 'Dr. S. Nair',
    show_score INTEGER DEFAULT 1,
    show_rank INTEGER DEFAULT 1,
    show_qr INTEGER DEFAULT 1,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Teams Table (4 students per team)
CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id TEXT UNIQUE NOT NULL,       -- e.g. 'TEAM-001'
    team_name TEXT NOT NULL,
    department TEXT NOT NULL,
    college TEXT DEFAULT '',
    pass_code TEXT NOT NULL,           -- e.g. 'HUNT-9482'
    status TEXT NOT NULL DEFAULT 'WAITING', -- 'WAITING', 'ROUND_1', 'ROUND_1_DONE', 'ROUND_2', 'ROUND_2_DONE', 'ROUND_3', 'FINISHED', 'DISQUALIFIED'
    current_round INTEGER DEFAULT 1,
    current_task_idx INTEGER DEFAULT 0,
    r1_score REAL DEFAULT 0,
    r2_score REAL DEFAULT 0,
    r3_score REAL DEFAULT 0,
    final_score REAL DEFAULT 0,
    total_time_sec INTEGER DEFAULT 0,
    r1_finished_at DATETIME,
    r2_finished_at DATETIME,
    r3_finished_at DATETIME,
    is_disqualified INTEGER DEFAULT 0,
    disqualify_reason TEXT DEFAULT '',
    violations_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Team Members (Exactly 4 members per team)
CREATE TABLE IF NOT EXISTS team_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id TEXT NOT NULL,
    member_number INTEGER NOT NULL CHECK (member_number BETWEEN 1 AND 4),
    name TEXT NOT NULL,
    email TEXT DEFAULT '',
    roll_no TEXT DEFAULT '',
    FOREIGN KEY(team_id) REFERENCES teams(team_id) ON DELETE CASCADE
);

-- Round 1 Question Bank: Basic MCQs (C, C++, Java, Python, HTML)
CREATE TABLE IF NOT EXISTS mcq_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    language TEXT NOT NULL,             -- 'C', 'C++', 'Java', 'Python', 'HTML'
    difficulty TEXT DEFAULT 'Easy',
    title TEXT NOT NULL,
    question_text TEXT NOT NULL,
    code_snippet TEXT DEFAULT '',
    options_json TEXT NOT NULL,         -- JSON array of 4 options
    correct_option_index INTEGER NOT NULL, -- 0, 1, 2, or 3
    explanation TEXT DEFAULT '',
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Round 2 Question Bank: Java Bug Identification Challenges
CREATE TABLE IF NOT EXISTS java_challenges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    challenge_code TEXT UNIQUE,          -- e.g. 'JAVA-001'
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    code_snippet TEXT NOT NULL,         -- Java code with line numbers
    buggy_line INTEGER NOT NULL,        -- Line containing the bug
    bug_type TEXT NOT NULL,             -- 'Syntax Error', 'Compilation Error', 'Logical Error', 'Runtime Error', 'Exception', 'OOP Error'
    explanation TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Round 3 Question Bank: Python Debug & Correct Challenges
CREATE TABLE IF NOT EXISTS python_challenges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    challenge_code TEXT UNIQUE NOT NULL, -- e.g. 'PY-001'
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    expected_behavior TEXT NOT NULL,
    input_format TEXT NOT NULL,
    output_format TEXT NOT NULL,
    constraints TEXT NOT NULL,
    buggy_code TEXT NOT NULL,           -- Initial code in Monaco editor
    canonical_solution TEXT NOT NULL,
    faulty_line INTEGER NOT NULL,
    bug_type TEXT NOT NULL,
    visible_tests_json TEXT NOT NULL,   -- JSON array of {input, expected_output}
    hidden_tests_json TEXT NOT NULL,    -- JSON array of {input, expected_output}
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Persistent Assignments per Team and Round
CREATE TABLE IF NOT EXISTS round_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id TEXT NOT NULL,
    round_num INTEGER NOT NULL,          -- 1, 2, 3
    question_ids_json TEXT NOT NULL,    -- JSON array of question IDs assigned
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, round_num),
    FOREIGN KEY(team_id) REFERENCES teams(team_id) ON DELETE CASCADE
);

-- Submissions Tracking
CREATE TABLE IF NOT EXISTS round_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id TEXT NOT NULL,
    round_num INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    task_index INTEGER NOT NULL,
    answer_data_json TEXT NOT NULL,     -- R1: option index; R2: line & bug_type; R3: code & answers
    score_awarded REAL NOT NULL,
    is_correct INTEGER NOT NULL,
    time_taken_sec INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(team_id) REFERENCES teams(team_id) ON DELETE CASCADE
);

-- Anti-Cheating Violations (3 Strikes)
CREATE TABLE IF NOT EXISTS violations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id TEXT NOT NULL,
    violation_type TEXT NOT NULL,       -- 'TAB_SWITCH', 'WINDOW_BLUR', 'REFRESH', 'COPY_PASTE'
    strike_number INTEGER NOT NULL,     -- 1, 2, 3
    details TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(team_id) REFERENCES teams(team_id) ON DELETE CASCADE
);

-- Certificates Table
CREATE TABLE IF NOT EXISTS certificates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    certificate_id TEXT UNIQUE NOT NULL, -- e.g. 'BH-2026-000001'
    team_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    member_number INTEGER NOT NULL,
    team_name TEXT NOT NULL,
    achievement TEXT NOT NULL,          -- 'Winner', 'Runner-Up', 'Second Runner-Up', 'Participation', 'Special Recognition'
    rank INTEGER NOT NULL,
    final_score REAL NOT NULL,
    competition_date TEXT NOT NULL,
    status TEXT DEFAULT 'ACTIVE',       -- 'ACTIVE', 'REVOKED'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(team_id) REFERENCES teams(team_id) ON DELETE CASCADE
);

-- Admin Audit Logs
CREATE TABLE IF NOT EXISTS admin_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_username TEXT NOT NULL,
    action TEXT NOT NULL,
    target TEXT DEFAULT '',
    details TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Legacy Tables preserved for backward compatibility
CREATE TABLE IF NOT EXISTS participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    participant_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    team_name TEXT NOT NULL,
    college TEXT NOT NULL,
    email TEXT DEFAULT '',
    reg_no TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    round_num INTEGER NOT NULL,
    language TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    question_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    code_snippet TEXT NOT NULL,
    options_json TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    explanation TEXT NOT NULL,
    hint TEXT NOT NULL,
    solution_code TEXT DEFAULT '',
    validation_rules TEXT DEFAULT '',
    points INTEGER NOT NULL DEFAULT 10,
    penalty INTEGER NOT NULL DEFAULT 2,
    time_limit_sec INTEGER NOT NULL DEFAULT 30,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS game_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_token TEXT UNIQUE NOT NULL,
    participant_id TEXT NOT NULL,
    current_round INTEGER NOT NULL DEFAULT 1,
    score INTEGER NOT NULL DEFAULT 0,
    bugs_found INTEGER NOT NULL DEFAULT 0,
    lives INTEGER NOT NULL DEFAULT 3,
    hints_remaining INTEGER NOT NULL DEFAULT 3,
    combo INTEGER NOT NULL DEFAULT 0,
    max_combo INTEGER NOT NULL DEFAULT 0,
    tab_switches INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'in_progress',
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    finished_at DATETIME,
    total_time_sec INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    participant_id TEXT NOT NULL,
    question_id INTEGER NOT NULL,
    selected_answer TEXT NOT NULL,
    is_correct INTEGER NOT NULL,
    points_earned INTEGER NOT NULL,
    time_taken_sec INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_teams_id ON teams(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_mcq_lang ON mcq_questions(language, is_active);
CREATE INDEX IF NOT EXISTS idx_java_active ON java_challenges(is_active);
CREATE INDEX IF NOT EXISTS idx_py_active ON python_challenges(is_active);
CREATE INDEX IF NOT EXISTS idx_assignments ON round_assignments(team_id, round_num);
CREATE INDEX IF NOT EXISTS idx_cert_id ON certificates(certificate_id);
