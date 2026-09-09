import React, { useState } from 'react';
import { Bug, Volume2, VolumeX, Trophy, FileText, Terminal, LogOut } from 'lucide-react';
import { soundService } from '../services/sound';

export const Navbar = ({ currentScreen, onNavigate, setView, participant, onLogout = () => {}, competitionStatus }) => {
  const [muted, setMuted] = useState(soundService.isMuted());
  const navigate = onNavigate || setView || (() => {});

  const handleMuteToggle = () => {
    const nextState = soundService.toggleMute();
    setMuted(nextState);
    if (!nextState) soundService.playClick();
  };

  const handleNav = (target) => {
    soundService.playClick();
    navigate(target);
  };

  return (
    <nav className="border-b border-cyber-border/70 bg-cyber-bg/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Tagline */}
          <div 
            onClick={() => handleNav('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-cyber-surface border border-cyber-neon/40 group-hover:border-cyber-neon transition-colors shadow-neon-sm">
              <Bug className="w-5 h-5 text-cyber-neon animate-bug-crawl group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-neon opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-neon"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-wider text-white group-hover:text-cyber-neon transition-colors">
                  BUG<span className="text-cyber-neon">HUNT</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase font-mono tracking-widest bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan rounded">
                  ENGINEERS DAY
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden md:block">
                Find the Bug. Fix the Code. Win the Hunt.
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Rules Modal Link */}
            <button
              onClick={() => handleNav('rules')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                currentScreen === 'rules'
                  ? 'bg-cyber-surface text-cyber-cyan border border-cyber-cyan/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
              title="Tournament Rules"
            >
              <FileText className="w-4 h-4 text-cyber-cyan" />
              <span className="hidden sm:inline">Rules</span>
            </button>

            {/* Sound Mute Toggle */}
            <button
              onClick={handleMuteToggle}
              title={muted ? "Unmute sound effects" : "Mute sound effects"}
              className="p-2 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-colors ml-1"
            >
              {muted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-cyber-neon" />
              )}
            </button>

            {/* Participant Status or Start Hunt */}
            {participant ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="hidden lg:block text-right font-mono">
                  <p className="text-xs font-bold text-white leading-tight">{participant.team_name || participant.name}</p>
                  <p className="text-[10px] text-cyber-cyan font-semibold">DEPT: {participant.college || participant.participant_id}</p>
                </div>
                <button
                  onClick={() => { soundService.playClick(); onLogout(); }}
                  title="Leave session"
                  className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleNav('register')}
                className="ml-2 px-3 py-1.5 text-xs sm:text-sm font-bold bg-cyber-neon/10 hover:bg-cyber-neon/20 border border-cyber-neon text-cyber-neon rounded transition-all shadow-neon-sm hover:shadow-neon-md flex items-center gap-1.5"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>START HUNT</span>
              </button>
            )}
          </div>

        </div>
      </div>
      
      {/* Competition Status Banner (if paused or ended) */}
      {competitionStatus && competitionStatus !== 'ACTIVE' && (
        <div className={`py-1.5 px-4 text-center text-xs font-semibold tracking-wide border-t ${
          competitionStatus === 'PAUSED' 
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
            : competitionStatus === 'NOT_STARTED'
            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
            : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
        }`}>
          {competitionStatus === 'PAUSED' && '⚠️ COMPETITION TEMPORARILY PAUSED BY ORGANIZER'}
          {competitionStatus === 'NOT_STARTED' && '🕒 COMPETITION HAS NOT STARTED YET'}
          {competitionStatus === 'ENDED' && '🛑 COMPETITION HAS CONCLUDED. WINNERS WILL BE ANNOUNCED BY ORGANIZERS.'}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
