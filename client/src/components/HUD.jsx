import React, { useEffect } from 'react';
import { Bug, Clock, Flame, Heart, Lightbulb, Zap, ShieldAlert } from 'lucide-react';
import { playTimerUrgent, playClick } from '../audio/soundEffects';

export const HUD = ({
  roundNum,
  roundTitle,
  currentQuestionIndex,
  totalQuestions,
  timeLeft,
  maxTime,
  score,
  combo,
  lives,
  hintsRemaining,
  onUseHint,
  tabSwitches = 0
}) => {
  const isUrgent = timeLeft <= 10 && timeLeft > 0;

  // Beep warning on urgent timer
  useEffect(() => {
    if (isUrgent) {
      playTimerUrgent();
    }
  }, [timeLeft, isUrgent]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const progressPercent = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;
  const comboMultiplier = Math.min(Math.max(combo, 1), 4);

  return (
    <div className="w-full bg-cyber-surface/95 border border-cyber-border rounded-xl shadow-2xl p-4 mb-6 backdrop-blur-md">
      
      {/* Top HUD Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 items-center">
        
        {/* 1. Round & Mode */}
        <div className="bg-cyber-card/80 border border-slate-800 rounded-lg p-2.5 flex items-center gap-2.5">
          <div className="p-2 rounded bg-cyan-500/10 border border-cyber-cyan/30 text-cyber-cyan">
            <Bug className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">ROUND {roundNum}</p>
            <p className="text-xs sm:text-sm font-bold text-white truncate">{roundTitle || `ROUND ${roundNum}`}</p>
          </div>
        </div>

        {/* 2. Question Progress */}
        <div className="bg-cyber-card/80 border border-slate-800 rounded-lg p-2.5 flex items-center gap-2.5">
          <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">CHALLENGE</p>
            <p className="text-xs sm:text-sm font-extrabold text-white font-mono">
              {String(currentQuestionIndex + 1).padStart(2, '0')} / {String(totalQuestions).padStart(2, '0')}
            </p>
          </div>
        </div>

        {/* 3. Timer (Visually Urgent <10s) */}
        <div className={`rounded-lg p-2.5 flex items-center gap-2.5 transition-all duration-300 ${
          isUrgent 
            ? 'bg-rose-950/60 border-2 border-rose-500 animate-pulse shadow-crimson-md text-rose-300' 
            : 'bg-cyber-card/80 border border-slate-800 text-slate-200'
        }`}>
          <div className={`p-2 rounded ${isUrgent ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-300'}`}>
            <Clock className={`w-4 h-4 ${isUrgent ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <p className={`text-[10px] uppercase font-mono tracking-wider ${isUrgent ? 'text-rose-300 font-bold' : 'text-slate-400'}`}>
              TIME LEFT
            </p>
            <p className={`text-base sm:text-lg font-black font-mono tracking-widest ${isUrgent ? 'text-rose-400 text-glow-crimson' : 'text-white'}`}>
              {formatTime(timeLeft)}
            </p>
          </div>
        </div>

        {/* 4. Score Counter */}
        <div className="bg-cyber-card/80 border border-slate-800 rounded-lg p-2.5 flex items-center gap-2.5">
          <div className="p-2 rounded bg-cyber-neon/10 border border-cyber-neon/30 text-cyber-neon">
            <span className="font-mono text-xs font-bold">PTS</span>
          </div>
          <div>
            <p className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">SCORE</p>
            <p className="text-base sm:text-lg font-black text-cyber-neon font-mono text-glow-neon">
              {score}
            </p>
          </div>
        </div>

        {/* 5. Combo Indicator */}
        <div className={`bg-cyber-card/80 border rounded-lg p-2.5 flex items-center gap-2.5 transition-colors ${
          combo > 1 ? 'border-amber-500/50 bg-amber-950/20 shadow-amber-md' : 'border-slate-800'
        }`}>
          <div className={`p-2 rounded ${combo > 1 ? 'bg-amber-500/20 text-amber-400 animate-bounce' : 'bg-slate-800 text-slate-400'}`}>
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">COMBO</p>
            <p className={`text-xs sm:text-sm font-extrabold font-mono ${combo > 1 ? 'text-amber-400 text-glow-amber' : 'text-slate-300'}`}>
              x{comboMultiplier} {combo >= 2 && <span className="text-[10px] text-amber-300 font-sans tracking-tight">STREAK!</span>}
            </p>
          </div>
        </div>

        {/* 6. Lives & Hints Bar */}
        <div className="bg-cyber-card/80 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between col-span-2 sm:col-span-1 lg:col-span-1">
          {/* Lives */}
          <div>
            <p className="text-[10px] uppercase font-mono text-slate-400 mb-1">LIVES</p>
            <div className="flex gap-1">
              {[1, 2, 3].map((heartIndex) => (
                <Heart
                  key={heartIndex}
                  className={`w-3.5 h-3.5 transition-all duration-300 ${
                    heartIndex <= lives
                      ? 'text-rose-500 fill-rose-500 drop-shadow-[0_0_6px_rgba(244,63,94,0.6)]'
                      : 'text-slate-700 fill-transparent'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Hint Trigger Button */}
          <button
            onClick={() => { playClick(); onUseHint(); }}
            disabled={hintsRemaining <= 0}
            title={hintsRemaining > 0 ? "Use a hint (-5 points)" : "No hints remaining"}
            className={`px-2 py-1 rounded text-xs font-mono font-bold flex items-center gap-1 transition-all ${
              hintsRemaining > 0
                ? 'bg-amber-500/10 border border-amber-500/40 text-amber-400 hover:bg-amber-500/20 hover:border-amber-400 shadow-sm'
                : 'bg-slate-800/60 border border-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Lightbulb className="w-3 h-3" />
            <span>{hintsRemaining}</span>
          </button>
        </div>

      </div>

      {/* Progress Bar */}
      <div className="mt-3.5 pt-2 border-t border-slate-800/80 flex items-center gap-3">
        <div className="flex-1 bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-cyber-cyan via-cyber-neon to-amber-400 transition-all duration-500 rounded-full shadow-neon-sm"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>
        <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
          {Math.round(progressPercent)}% PROGRESS
        </span>

        {tabSwitches > 0 && (
          <span className="text-[10px] font-mono text-rose-400 bg-rose-950/40 border border-rose-500/30 px-2 py-0.5 rounded flex items-center gap-1">
            <ShieldAlert className="w-2.5 h-2.5" />
            <span>{tabSwitches} TAB VIOLATION{tabSwitches > 1 ? 'S' : ''}</span>
          </span>
        )}
      </div>

    </div>
  );
};
