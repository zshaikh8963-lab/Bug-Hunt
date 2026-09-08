/**
 * Certificate Generator & Verification Service for BUG HUNT
 * Issues permanent IDs (BH-2026-XXXXXX) for each of the 4 students on each team.
 */

import db from '../database/db.js';

// Generate permanent sequential Certificate ID e.g. BH-2026-000001
function generateNextCertificateId() {
    const lastCert = db.prepare(`
        SELECT certificate_id FROM certificates 
        ORDER BY id DESC LIMIT 1
    `).get();

    let nextNum = 1;
    if (lastCert && lastCert.certificate_id) {
        const parts = lastCert.certificate_id.split('-');
        const lastNum = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(lastNum)) {
            nextNum = lastNum + 1;
        }
    }

    return `BH-2026-${String(nextNum).padStart(6, '0')}`;
}

/**
 * Generates official certificates for teams based on locked results
 * @param {string} filter 'all' | 'winners' | 'runner_ups' | 'participation'
 */
export function generateCertificatesForTeams(filter = 'all') {
    // 1. Get competition settings
    const settings = db.prepare('SELECT * FROM competition_settings WHERE id = 1').get() || {
        competition_date: '2026-09-09'
    };

    // 2. Query ranked teams
    const teams = db.prepare(`
        SELECT * FROM teams 
        WHERE is_disqualified = 0
        ORDER BY final_score DESC, r3_score DESC, total_time_sec ASC, id ASC
    `).all();

    const created = [];

    const insertCert = db.prepare(`
        INSERT INTO certificates (
            certificate_id, team_id, student_name, member_number, team_name,
            achievement, rank, final_score, competition_date, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
    `);

    db.transaction(() => {
        teams.forEach((team, idx) => {
            const rank = idx + 1;
            let achievement = 'Participation';
            if (rank === 1) achievement = 'Winner (1st Place)';
            else if (rank === 2) achievement = 'Runner-Up (2nd Place)';
            else if (rank === 3) achievement = 'Second Runner-Up (3rd Place)';

            // Apply filter
            if (filter === 'winners' && rank !== 1) return;
            if (filter === 'runner_ups' && (rank !== 2 && rank !== 3)) return;
            if (filter === 'participation' && rank <= 3) return;

            // Fetch all 4 members
            const members = db.prepare('SELECT * FROM team_members WHERE team_id = ? ORDER BY member_number ASC').all(team.team_id);

            // If no explicit members table populated yet, fall back to team name
            const memberList = members.length > 0 ? members : [
                { member_number: 1, name: `${team.team_name} Lead` },
                { member_number: 2, name: `${team.team_name} Member 2` },
                { member_number: 3, name: `${team.team_name} Member 3` },
                { member_number: 4, name: `${team.team_name} Member 4` }
            ];

            memberList.forEach(m => {
                // Check if certificate already exists for this student/team
                const existing = db.prepare(`
                    SELECT * FROM certificates 
                    WHERE team_id = ? AND member_number = ?
                `).get(team.team_id, m.member_number);

                if (!existing) {
                    const certId = generateNextCertificateId();
                    insertCert.run(
                        certId,
                        team.team_id,
                        m.name,
                        m.member_number,
                        team.team_name,
                        achievement,
                        rank,
                        team.final_score,
                        settings.competition_date || '2026-09-09'
                    );
                    created.push({
                        certificate_id: certId,
                        student_name: m.name,
                        team_name: team.team_name,
                        achievement,
                        rank,
                        final_score: team.final_score
                    });
                }
            });
        });
    })();

    return created;
}

/**
 * Look up public verification record for QR code
 */
export function getCertificateVerification(certificateId) {
    if (!certificateId) return null;

    const cert = db.prepare(`
        SELECT c.*, t.department, t.college
        FROM certificates c
        LEFT JOIN teams t ON c.team_id = t.team_id
        WHERE c.certificate_id = ?
    `).get(certificateId.trim().toUpperCase());

    if (!cert) return null;

    const settings = db.prepare('SELECT * FROM competition_settings WHERE id = 1').get() || {};
    const members = db.prepare('SELECT name, member_number FROM team_members WHERE team_id = ? ORDER BY member_number ASC').all(cert.team_id);

    return {
        certificate_id: cert.certificate_id,
        student_name: cert.student_name,
        team_id: cert.team_id,
        team_name: cert.team_name,
        member_number: cert.member_number,
        achievement: cert.achievement,
        award_rank: cert.achievement,
        rank: cert.rank,
        final_score: cert.final_score,
        competition_date: cert.competition_date,
        status: cert.status, // 'ACTIVE' or 'REVOKED'
        college_name: settings.college_name || 'Institute of Technology',
        department: cert.department || settings.department || 'Computer Science',
        event_name: settings.event_name || 'BUG HUNT 2026',
        members: members.map(m => ({ name: m.name, role: m.member_number === 1 ? 'Leader' : `Member ${m.member_number}` }))
    };
}
