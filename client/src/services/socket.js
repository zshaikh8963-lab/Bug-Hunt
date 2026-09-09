import { io } from 'socket.io-client';

let socket = null;

export function getSocket(role = 'guest', teamId = null) {
    if (!socket || !socket.connected) {
        // Connect to configured backend URL, local dev server, or current origin
        const configuredUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : null;
        const serverUrl = configuredUrl || (window.location.port === '5173' ? 'http://localhost:5000' : window.location.origin);

        socket = io(serverUrl, {
            transports: ['websocket', 'polling'],
            query: {
                role,
                teamId: teamId || ''
            },
            reconnectionAttempts: 10,
            reconnectionDelay: 1000
        });

        socket.on('connect', () => {
            console.log('⚡ Socket connected to BUG HUNT server:', socket.id);
            if (teamId) {
                socket.emit('join_team_channel', { teamId });
            }
        });

        socket.on('disconnect', (reason) => {
            console.log('⚠️ Socket disconnected:', reason);
        });
    }

    return socket;
}

export function subscribeToState(callback) {
    const s = getSocket();
    s.on('competition:state_change', callback);
    return () => s.off('competition:state_change', callback);
}

export function subscribeToLeaderboard(callback) {
    const s = getSocket();
    s.on('leaderboard:update', callback);
    return () => s.off('leaderboard:update', callback);
}

export function subscribeToWinnerReveal(callback) {
    const s = getSocket();
    s.on('winner:reveal', callback);
    return () => s.off('winner:reveal', callback);
}

export function subscribeToTeamStrike(callback) {
    const s = getSocket();
    s.on('team:strike', callback);
    return () => s.off('team:strike', callback);
}

export function subscribeToSubmission(callback) {
    const s = getSocket();
    s.on('team:submitted', callback);
    return () => s.off('team:submitted', callback);
}

export function subscribeToProjectorIntro(callback) {
    const s = getSocket();
    s.on('projector:play_intro', callback);
    return () => s.off('projector:play_intro', callback);
}

