import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'bughunt_super_secret_cyber_jwt_key_2026';

export const authenticateAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Admin authorization required' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid or expired admin session' });
    }
};

export const generateAdminToken = (admin) => {
    return jwt.sign(
        { id: admin.id, username: admin.username, role: 'admin' },
        JWT_SECRET,
        { expiresIn: '12h' }
    );
};
