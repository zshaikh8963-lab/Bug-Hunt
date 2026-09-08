import express from 'express';
import db from '../database/db.js';
import { getCertificateVerification } from '../services/certificateService.js';

const router = express.Router();

// GET /api/certificates/verify/:certId - Public verification portal
router.get('/verify/:certId', (req, res) => {
    try {
        const { certId } = req.params;
        const cert = getCertificateVerification(certId);

        if (!cert) {
            return res.status(404).json({
                success: false,
                status: 'NOT_FOUND',
                message: 'Certificate not found. Please verify the Certificate ID.'
            });
        }

        if (cert.status === 'REVOKED') {
            return res.json({
                success: false,
                status: 'REVOKED',
                message: 'This certificate has been revoked by event administrators.',
                certificate: {
                    certificate_id: cert.certificate_id,
                    student_name: cert.student_name,
                    team_name: cert.team_name,
                    status: 'REVOKED'
                }
            });
        }

        return res.json({
            success: true,
            status: 'VERIFIED',
            message: 'Official BUG HUNT Certificate Verified Successfully.',
            certificate: cert
        });

    } catch (err) {
        console.error('Certificate verification error:', err);
        return res.status(500).json({ error: 'Failed to verify certificate.' });
    }
});

// GET /api/certificates/team/:teamId - Get certificates for a specific team
router.get('/team/:teamId', (req, res) => {
    try {
        const { teamId } = req.params;
        const certs = db.prepare(`
            SELECT * FROM certificates 
            WHERE team_id = ? 
            ORDER BY member_number ASC
        `).all(teamId);

        return res.json({
            success: true,
            certificates: certs
        });
    } catch (err) {
        console.error('Get team certificates error:', err);
        return res.status(500).json({ error: 'Failed to fetch team certificates.' });
    }
});

export default router;
