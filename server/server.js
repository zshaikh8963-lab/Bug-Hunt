import express from 'express';
import http from 'http';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import teamsRoutes from './routes/teams.js';
import competitionRoutes from './routes/competition.js';
import roundsRoutes from './routes/rounds.js';
import questionsRoutes from './routes/questions.js';
import gameRoutes from './routes/game.js';
import leaderboardRoutes from './routes/leaderboard.js';
import certificatesRoutes from './routes/certificates.js';
import demoRoutes from './routes/demo.js';
import adminRoutes from './routes/admin.js';
import { initSocket } from './services/socketManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize Socket.IO
initSocket(server);

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Request logger
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        if (req.originalUrl !== '/api/competition/status') {
            console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
        }
    });
    next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/competition', competitionRoutes);
app.use('/api/rounds', roundsRoutes);
app.use('/api/questions', questionsRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/certificates', certificatesRoutes);
app.use('/api/demo', demoRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        service: 'BUG HUNT COMPETITION SERVER',
        timestamp: new Date().toISOString()
    });
});

// Public certificate verification shortcut URL (/verify/:certId)
app.get('/verify/:certId', (req, res, next) => {
    // If client is built, serve index.html with SPA routing
    const clientDist = path.join(__dirname, '../client/dist');
    if (fs.existsSync(path.join(clientDist, 'index.html'))) {
        return res.sendFile(path.join(clientDist, 'index.html'));
    }
    // Otherwise redirect to API representation
    res.redirect(`/api/certificates/verify/${req.params.certId}`);
});

// Serve frontend in production if built
const clientDist = path.join(__dirname, '../client/dist');
app.use('/assets', express.static(path.join(clientDist, 'assets'), {
    immutable: true,
    maxAge: '1y'
}));
app.use(express.static(clientDist, {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
    }
}));

app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/assets')) {
        return res.status(404).end();
    }
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path.join(clientDist, 'index.html'), (err) => {
        if (err) {
            res.status(404).send('BUG HUNT API is running. Start the client dev server via npm run dev:client');
        }
    });
});

server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🐞 BUG HUNT TOURNAMENT SERVER RUNNING ON PORT ${PORT}`);
    console.log(`📡 Real-Time Socket.IO: Active`);
    console.log(`🌐 Base URL: http://localhost:${PORT}`);
    console.log(`=======================================================`);
});
