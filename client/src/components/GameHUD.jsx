import React, { useEffect } from 'react';
import { Clock, Zap, Heart, Lightbulb, ShieldAlert, Bug, Target } from 'lucide-react';
import { soundService } from '../services/sound';

export default function GameHUD({
  roundNum,
  questionIndex,
  totalQuestions,
  timeLeft,
  score,
  combo,
  lives,
  hintsRemaining,
  bugsFound,
  onUseHint,
  isHintUsed
}) {
  const isUrgent = timeLeft <= 10 && timeLeft > 0;

  // Sound tick for countdown urgency
  useEffect(() => {
    if (isUrgent) {
      soundService.playTimerTick();
    }
  }, [timeLeft, isUrgent]);

  const roundNames = {
    1: 'ROUND 1 — SPOT THE BUG',
    2: 'ROUND 2 — DEBUG IT',
    3: 'ROUND 3 — BUG HUNT',
    4: 'ROUND 4 — BOSS BUG'
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = totalQuestions > 0 ? Math.round(((questionIndex) / totalQuestions) * 100) : 0;

  return (
    <div className="w-full bg-cyber-card/90 backdrop-blur-md border border-cyber-border rounded-xl p-4 shadow-xl mb-6">
      
      {/* Top Row: Round Name + Streak Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-cyber-border/60">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold tracking-wide uppercase ${
            roundNum === 4 
              ? 'bg-red-500/20 text-cyber-red border border-red-500/40 animate-pulse'
              : 'bg-cyber-green/15 text-cyber-green border border-cyber-green/30'
          }`}>
            {roundNames[roundNum] || `ROUND ${roundNum}`}
          </span>

          <span className="text-xs font-mono text-slate-400">
            {roundNum === 3 
              ? `LIVE MULTI-BUG STAGE` 
              : roundNum === 4
              ? `BOSS ENCOUNTER`
              : `QUESTION ${String(questionIndex + 1).padStart(2, '0')}/${String(totalQuestions).padStart(2, '0')}`}
          </span>
        </div>

        {/* Dynamic Animated Combo Banner */}
        {combo > 1 && (
          <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 border border-cyber-amber text-amber-300 text-xs font-mono font-bold animate-bounce shadow-neon-cyan">
            <Zap className="w-3.5 h-3.5 text-cyber-amber fill-cyber-amber" />
            <span>BUG STREAK! x{Math.min(combo, 4)}</span>
          </div>
        )}
      </div>

      {/* Main HUD Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 items-center">
        
        {/* Timer Card */}
        <div className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
          isUrgent 
            ? 'bg-red-950/60 border-red-500 shadow-neon-red animate-pulse text-red-400' 
            : 'bg-cyber-dark/80 border-cyber-border text-slate-200'
        }`}>
          <Clock className={`w-5 h-5 shrink-0 ${isUrgent ? 'text-cyber-red animate-spin' : 'text-cyber-cyan'}`} />
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Time Left</div>
            <div className={`font-mono text-lg font-bold tracking-tight ${isUrgent ? 'text-cyber-red' : 'text-white'}`}>
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        {/* Current Score */}
        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-cyber-dark/80 border border-cyber-border text-slate-200">
          <Target className="w-5 h-5 text-cyber-green shrink-0" />
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Score</div>
            <div className="font-mono text-lg font-bold text-cyber-green neon-text-green">
              {score}
            </div>
          </div>
        </div>

        {/* Combo Multiplier */}
        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-cyber-dark/80 border border-cyber-border text-slate-200">
          <Zap className={`w-5 h-5 shrink-0 ${combo > 0 ? 'text-cyber-amber fill-cyber-amber' : 'text-slate-500'}`} />
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Multiplier</div>
            <div className={`font-mono text-lg font-bold ${combo > 1 ? 'text-cyber-amber' : 'text-slate-300'}`}>
              x{Math.min(Math.max(1, combo), 4)}
            </div>
          </div>
        </div>

        {/* Bugs Found Counter */}
        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-cyber-dark/80 border border-cyber-border text-slate-200">
          <Bug className="w-5 h-5 text-cyber-cyan shrink-0" />
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Bugs Slayed</div>
            <div className="font-mono text-lg font-bold text-cyber-cyan">
              {bugsFound}
            </div>
          </div>
        </div>


        {/* Hint System Button */}
        <button
          onClick={onUseHint}
          disabled={hintsRemaining <= 0 || isHintUsed}
          className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border font-mono text-xs font-semibold transition-all ${
            isHintUsed
              ? 'bg-cyber-purple/20 border-cyber-purple text-purple-300'
              : hintsRemaining > 0
              ? 'bg-cyber-card hover:bg-cyber-purple/20 border-cyber-border hover:border-cyber-purple text-slate-200 hover:text-purple-300 hover:shadow-neon-purple cursor-pointer'
              : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed opacity-60'
          }`}
          title="Using a hint deducts 5 points"
        >
          <Lightbulb className={`w-4 h-4 ${hintsRemaining > 0 ? 'text-cyber-purple' : 'text-slate-600'}`} />
          <div className="text-left leading-tight">
            <div>{isHintUsed ? 'HINT ACTIVE' : 'USE HINT'}</div>
            <div className="text-[10px] font-normal text-slate-400">
              {hintsRemaining} left (-5 pts)
            </div>
          </div>
        </button>

      </div>

      {/* Progress Bar Across Questions */}
      {roundNum !== 3 && (
        <div className="mt-3 pt-2">
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-cyber-border/40">
            <div 
              className="h-full bg-gradient-to-r from-cyber-green to-cyber-cyan transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

    </div>
  );
}
