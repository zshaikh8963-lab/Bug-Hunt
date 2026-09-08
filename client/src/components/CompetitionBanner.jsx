import React from 'react';
import { AlertTriangle, PauseCircle, CheckCircle, Info } from 'lucide-react';

export default function CompetitionBanner({ status, isPaused, message }) {
  if (isPaused || status === 'PAUSED') {
    return (
      <div className="bg-amber-950/60 border-b border-amber-500/60 px-4 py-2.5 text-center text-sm font-mono flex items-center justify-center gap-2 text-amber-300">
        <PauseCircle className="w-4 h-4 text-amber-400 shrink-0 animate-spin" />
        <span>Competition temporarily paused by organizer. {message && `— "${message}"`}</span>
      </div>
    );
  }

  if (!status || status === 'ACTIVE') return null;

  if (status === 'ENDED') {
    return (
      <div className="bg-red-950/50 border-b border-cyber-red/50 px-4 py-2.5 text-center text-sm font-mono flex items-center justify-center gap-2 text-red-300">
        <AlertTriangle className="w-4 h-4 text-cyber-red shrink-0" />
        <span>Competition has ended. {message || 'Check the final standings on the Leaderboard!'}</span>
      </div>
    );
  }

  return null;
}
