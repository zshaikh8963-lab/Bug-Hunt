import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../database/db.js';
import { generateAdminToken } from '../middleware/auth.js';

const router = express.Router();

// Generate unique participant ID (e.g. HUNT-8492)
const generateUniqueId = () => {
    while (true) {
        const randNum = Math.floor(1000 + Math.random() * 9000);
        const candidateId = `HUNT-${randNum}`;
        const existing = db.prepare('SELECT id FROM participants WHERE participant_id = ?').get(candidateId);
        if (!existing) {
            return candidateId;
        }
    }
};

// Allowed Engineering Departments
const VALID_DEPARTMENTS = ['IT', 'COMPS', 'AIML', 'MECHANICAL', 'CIVIL', 'ELECTRICAL'];

// POST /api/auth/register
router.post('/register', (req, res) => {
    try {
        const { name = '', team_name, department, college, email = '', reg_no = '' } = req.body;

        const deptValue = (department || college || '').trim().toUpperCase();

        if (!team_name?.trim()) {
            return res.status(400).json({ error: 'Team Name is required.' });
        }

        if (!deptValue) {
            return res.status(400).json({ error: 'Department Name is required (Choose from: IT, COMPS, AIML, MECHANICAL, CIVIL, ELECTRICAL).' });
        }

        // Validate department
        const matchedDept = VALID_DEPARTMENTS.find(d => d === deptValue);
        const finalDept = matchedDept || deptValue;

        // If participant name not explicitly given, default to Team Leader
        const participantName = name?.trim() || `${team_name.trim()} (Lead)`;

        const participant_id = generateUniqueId();

        const insert = db.prepare(`
            INSERT INTO participants (participant_id, name, team_name, college, email, reg_no)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        insert.run(participant_id, participantName, team_name.trim(), finalDept, email.trim(), reg_no.trim());

        const participant = db.prepare('SELECT * FROM participants WHERE participant_id = ?').get(participant_id);

        return res.status(201).json({
            success: true,
            message: 'Registration successful! Ready to hunt.',
            participant
        });
    } catch (err) {
        console.error('Registration error:', err);
        return res.status(500).json({ error: 'Failed to complete registration.' });
    }
});


// POST /api/auth/admin-login
router.post('/admin-login', (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required.' });
        }

        const cleanUsername = String(username).trim();
        const cleanPassword = String(password).trim();

        const admin = db.prepare('SELECT * FROM admin_users WHERE username = ? COLLATE NOCASE').get(cleanUsername);
        if (!admin) {
            return res.status(401).json({ error: 'Invalid admin credentials.' });
        }

        const isMatch = bcrypt.compareSync(cleanPassword, admin.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid admin credentials.' });
        }

        const token = generateAdminToken(admin);

        return res.json({
            success: true,
            token,
            admin: {
                id: admin.id,
                username: admin.username
            }
        });
    } catch (err) {
        console.error('Admin login error:', err);
        return res.status(500).json({ error: 'Server authentication error.' });
    }
});

export default router;
