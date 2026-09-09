/**
 * Socket.IO Real-Time Event Manager for BUG HUNT
 * Synchronizes competition states, timers, leaderboards, and winner reveals
 * between Admin, Teams, and the Projector display.
 */

import { Server } from 'socket.io';

let io = null;

export function initSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: true,
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        const role = socket.handshake.query.role || 'guest';
        const teamId = socket.handshake.query.teamId;

        if (role === 'admin') {
            socket.join('admin_room');
        } else if (role === 'projector') {
            socket.join('projector_room');
        } else if (role === 'team' && teamId) {
            socket.join(`team_${teamId}`);
            socket.join('all_teams');
        }

        socket.on('join_team_channel', (data) => {
            if (data?.teamId) {
                socket.join(`team_${data.teamId}`);
            }
        });

        socket.on('disconnect', () => {
            // Handled automatically
        });
    });

    console.log('✓ Socket.IO real-time engine initialized.');
    return io;
}

export function getIO() {
    return io;
}

// Broadcast competition state change to all clients
export function broadcastCompetitionState(state) {
    if (!io) return;
    io.emit('competition:state_change', {
        status: state.status,
        is_paused: Boolean(state.is_paused),
        active_round: state.active_round,
        message: state.message,
        round_started_at: state.round_started_at,
        round_time_limit_sec: state.round_time_limit_sec,
        results_locked: Boolean(state.results_locked),
        winner_reveal_state: state.winner_reveal_state,
        timestamp: new Date().toISOString()
    });
}

// Broadcast live leaderboard changes to projector and admin
export function broadcastLeaderboard(leaderboard) {
    if (!io) return;
    io.emit('leaderboard:update', {
        leaderboard,
        timestamp: new Date().toISOString()
    });
}

// Broadcast team submission event for live projector animations
export function broadcastTeamSubmission(teamSubmission) {
    if (!io) return;
    io.emit('team:submitted', teamSubmission);
}

// Broadcast winner reveal step (THIRD_PLACE -> SECOND_PLACE -> WINNER)
export function broadcastWinnerReveal(revealState, teamData) {
    if (!io) return;
    io.emit('winner:reveal', {
        reveal_state: revealState,
        team: teamData,
        timestamp: new Date().toISOString()
    });
}

// Broadcast anti-cheating strike or disqualification
export function broadcastViolation(teamId, violationData) {
    if (!io) return;
    io.to(`team_${teamId}`).emit('team:strike', violationData);
    io.to('admin_room').emit('admin:violation_alert', { teamId, ...violationData });
}

// Broadcast tournament intro video animation to projector
export function broadcastProjectorIntro() {
    if (!io) return;
    io.emit('projector:play_intro', { timestamp: new Date().toISOString() });
}

