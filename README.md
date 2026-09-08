# 🐞 BUG HUNT

> **"Find the Bug. Fix the Code. Win the Hunt."**  
> *Engineers Day Technical Debugging Competition Platform*

BUG HUNT is a modern, high-octane competitive debugging platform designed for college-level hackathons and technical symposiums. Built with a sleek dark cyberpunk aesthetic, the platform tests participants across 4 progressive debugging rounds against a live urgent countdown, featuring combo streak multipliers, progressive hints, and integrated anti-cheating browser telemetry.

---

## ⚡ Key Features

### 1. 🎮 4 Competition Rounds
- **Round 1 — Spot The Bug**: 30s per question. Rapid-fire code inspection. Identify division by zero, dangling pointers, and boundary traps (+10 correct, -2 wrong, 0 unanswered).
- **Round 2 — Debug It**: 60s per challenge. Faulty code presented in a syntax-highlighted editor with line numbers. Pinpoint the root cause and select the exact patch (+20 correct, -5 wrong).
- **Round 3 — Bug Hunt**: 5 minutes overall. Multi-bug detection in larger algorithms (LRU Cache, Vector allocation, Binary Search Tree, JWT middleware). Catch as many simultaneous bugs as possible (+15 per bug, -5 false alarm).
- **Round 4 — Boss Bug**: 10 minutes. "⚠️ BOSS BUG DETECTED" entrance alert with siren sound! Complex distributed multithreaded challenges featuring deadlock, race conditions, and memory corruption (+25 correct, -10 wrong).

### 2. 🎛️ Real-Time Cyber HUD
- **Urgent Timer**: Digital countdown with high-contrast urgent crimson flashing and audio pulses when `< 10s`. Auto-submits on `00:00`.
- **Score & Combo Streak**: Multipliers (`x1`, `x2`, `x3`, `x4`) rewarded for consecutive solves (`BUG STREAK! x4`). Resets on wrong answer.
- **Hint Engine**: 3 hints available. Consumes 5 points to reveal a progressive clue without giving away the direct answer.

- **Synthesized Web Audio SFX**: Procedural sound generation for correct chords, wrong buzzer, timer warning, boss siren, and victory fanfare (with a global mute toggle).

### 3. 🛡️ Anti-Cheating & Integrity Monitoring
- Real-time window blur and tab-switch detection via `visibilitychange`.
- Displays violation alerts and increments server violation counts.
- Context menu and text copying disabled on code snippets during active gameplay.
- Accidental page exit guard (`beforeunload`).
- All violations logged to SQLite and exported on the judges' CSV sheet.

### 4. 🏆 Live Leaderboard & Top 3 Podium
- Special Gold, Silver, and Bronze podium cards for top 3 rankers.
- Real-time auto-refresh (every 6 seconds) with countdown indicator.
- Instant search filter by participant name, team, or college.
- Multi-criteria tie-breaker: Score (desc) -> Accuracy (desc) -> Time elapsed (asc).

### 5. 🛡️ Secure Admin Control Console
- **Credentials**: Username `admin` | Password `admin123`.
- **Competition State Controller**:
  - `START COMPETITION` (enables live play)
  - `PAUSE COMPETITION` (freezes participant timer with announcement)
  - `END COMPETITION` (locks tournament and displays winners)
  - `RESET COMPETITION` (clears all participant sessions with confirmation)
- **Live Statistics**: Total participants, active players, question bank count, average score, and tournament high score.
- **Question Management (CRUD)**: Add, edit, filter, or delete questions with custom time limits, points, and penalty marks.
- **Export Results to CSV**: Single-click downloadable spreadsheet formatted for college judges and organizers.

### 6. 🚀 Instant Demo Sandbox ("TRY DEMO")
- One-click launch from the landing page allowing judges and organizers to evaluate all 4 rounds in an accelerated sandbox without registering test accounts.

### 7. 🎓 Team & Department-Based Registration
- Registration is specifically tailored for inter-department engineering symposiums:
  - **Required Fields**: **Team Name** and **Department Name**.
  - **6 Official Engineering Departments**:
    - 💻 **IT** (Information Technology)
    - 🖥️ **COMPS** (Computer Engineering)
    - 🤖 **AIML** (Artificial Intelligence & Machine Learning)
    - ⚙️ **MECHANICAL** (Mechanical Engineering)
    - 🏗️ **CIVIL** (Civil Engineering)
    - ⚡ **ELECTRICAL** (Electrical Engineering)
  - Interactive glowing department selection tiles with instant visual feedback.
  - Optional Team Leader name, contact email, and student registration number.
  - Generates unique ID (`HUNT-XXXX`) and transitions to the `"READY TO HUNT?"` deployment gate.


---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18 + Vite, Tailwind CSS, Lucide React Icons, Canvas Confetti |
| **Styling** | Cyberpunk dark theme with JetBrains Mono, Outfit fonts, scanlines, and glowing borders |
| **Audio** | Procedural Web Audio API sound synthesizer (zero external MP3 assets required) |
| **Backend** | Node.js + Express REST API |
| **Database** | SQLite with WAL mode (`better-sqlite3`) |
| **Authentication** | JWT (JSON Web Tokens) + bcryptjs password hashing |

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js v18+ (tested on Node v22.18.0)
- npm v9+

### 1. Installation
Clone or navigate to the project directory:
```bash
cd scratch/bug-hunt

# Install all dependencies (root, server, client)
npm run install:all
```

### 2. Database Setup & Seeding
Pre-populate the SQLite database with 42+ realistic college debugging questions, the admin account, and sample leaderboard records:
```bash
npm run seed
```

### 3. Running Locally
Start both the Express API server and Vite client concurrently:
```bash
npm run dev
```

The application will be accessible at:
- **Frontend App**: `http://localhost:5173` (or `http://localhost:5000` via Express unified server)
- **Backend API**: `http://localhost:5000/api`
- **Health Check**: `http://localhost:5000/api/health`

---

## 🔑 Organizer Access & Credentials

To preserve tournament integrity, regular participants only see **START GAME** and tournament rules; **Admin Console** and **Leaderboards** are hidden from participants:

- **Organizer Admin Portal URL**: [http://localhost:5173/#admin](http://localhost:5173/#admin) (or press `Ctrl + Shift + A`)
- **Admin Username**: `admin`
- **Admin Password**: `admin123`
- **Projector / Hall Leaderboard**: [http://localhost:5173/#leaderboard](http://localhost:5173/#leaderboard) (or click **LEADERBOARD** inside Admin Console)


---

## 📁 Project Structure

```
bug-hunt/
├── package.json               # Root scripts: concurrently launches backend & frontend
├── README.md                  # Complete documentation and setup manual
│
├── client/                    # React + Vite Frontend
│   ├── index.html             # Title, SEO meta tags, Google Fonts (JetBrains Mono & Outfit)
│   ├── package.json
│   ├── vite.config.js         # API proxy configured to localhost:5000
│   ├── tailwind.config.js     # Cyberpunk design system (neon, cyan, crimson, amber)
│   └── src/
│       ├── main.jsx           # React DOM root
│       ├── App.jsx            # Screen routing & state management
│       ├── index.css          # Cyber grid, scanlines, custom scrollbars, glowing utility classes
│       ├── audio/
│       │   └── soundEffects.js# Procedural Web Audio API sound generator
│       ├── services/
│       │   └── api.js         # Centralized API client methods
│       ├── hooks/
│       │   └── useAntiCheat.js# Focus tracking, right-click, and copy guards
│       ├── components/
│       │   ├── Navbar.jsx     # Header with sound toggle, status, and navigation
│       │   ├── HUD.jsx        # Persistent HUD: Timer, Score, Combo, Hints
│       │   ├── CodeViewer.jsx # Syntax code editor with line numbers & bug marking
│       │   ├── AntiCheatModal.jsx # Blur/tab-switch detection warning
│       │   ├── BossIntroModal.jsx # Dramatic Boss Bug alert modal & audio
│       │   └── RulesModal.jsx # Comprehensive competition rules breakdown
│       └── pages/
│           ├── LandingPage.jsx     # Hero, Engineers Day banner, round showcases
│           ├── RegistrationPage.jsx# Form with validation & unique ID generator
│           ├── GameArena.jsx       # Dynamic round controller (Rounds 1, 2, 3, 4)
│           ├── ResultsPage.jsx     # Score card, accuracy, rank titles, confetti
│           ├── LeaderboardPage.jsx # Podium cards, standings table, search
│           ├── AdminDashboard.jsx  # Competition controller, stats, CRUD, CSV export
│           └── DemoMode.jsx        # Sandbox evaluator for tournament judges
│
└── server/                    # Node.js + Express Backend
    ├── package.json
    ├── server.js              # Express server setup & route mounting (port 5000)
    ├── database/
    │   ├── db.js              # SQLite connection (WAL mode enabled)
    │   ├── schema.sql         # SQL schema definitions
    │   └── seed.js            # 42+ curated debugging questions & sample data
    ├── middleware/
    │   └── auth.js            # Admin JWT verification
    └── routes/
        ├── auth.js            # Participant registration & Admin login
        ├── competition.js     # Competition live status polling
        ├── questions.js       # Sanitized question delivery
        ├── game.js            # Scoring engine, combos, lives, hints, violations
        ├── leaderboard.js     # Ranked leaderboard calculations
        └── admin.js           # Admin stats, question CRUD, CSV export, reset
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register participant, returns unique `HUNT-XXXX` ID |
| `POST` | `/api/auth/admin-login` | Admin authentication, returns JWT token |
| `GET` | `/api/competition/status` | Current competition status (`ACTIVE`, `PAUSED`, `ENDED`, `NOT_STARTED`) |
| `GET` | `/api/questions` | Returns sanitized questions filtered by `round_num` |
| `POST` | `/api/game/start` | Initiates game session, returns `session_token` |
| `POST` | `/api/game/answer` | Evaluates answer, calculates score, and updates combo multipliers |
| `POST` | `/api/game/hint` | Consumes 5 points, returns debugger clue |
| `POST` | `/api/game/tab-switch` | Logs anti-cheating tab-switch violation |
| `POST` | `/api/game/finish` | Finalizes session, computes accuracy, time, and rank |
| `GET` | `/api/leaderboard` | Ranked leaderboard sorted by score, accuracy, and time |
| `GET` | `/api/admin/statistics` | Admin overview: player counts, average & highest score |
| `GET` | `/api/admin/participants` | Full list of participants with live session telemetry |
| `POST` | `/api/admin/competition/status` | Update competition status (`START`, `PAUSE`, `END`) |
| `POST` | `/api/admin/competition/reset` | Clears all participant attempts and resets tournament |
| `GET` | `/api/admin/questions` | Full questions repository (includes solutions & explanations) |
| `POST` | `/api/admin/questions` | Create new debugging challenge |
| `PUT` | `/api/admin/questions/:id` | Edit existing question |
| `DELETE` | `/api/admin/questions/:id` | Delete question |
| `GET` | `/api/admin/export-csv` | Download complete results spreadsheet in CSV format |

---

## 🏆 Performance Titles

| Accuracy | Title | Recognition |
| :---: | :---: | :---: |
| **90%+** | 🏆 **MASTER DEBUGGER** | Supreme analytical mastery across all 4 rounds |
| **70% – 89%** | ⚡ **BUG SLAYER** | Elite debugging performance |
| **50% – 69%** | 🛡️ **DEBUGGING APPRENTICE** | Solid understanding of algorithmic pitfalls |
| **< 50%** | 💻 **CODE RECRUIT** | Beginning competitive coder |

---

*Engineers Day Technical Competition • BUG HUNT Platform*
