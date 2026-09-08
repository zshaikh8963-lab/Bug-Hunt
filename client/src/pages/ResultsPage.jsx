import React, { useEffect } from 'react';
import { Trophy, Bug, Clock, Zap, Target, ArrowRight, RotateCcw, Award, CheckCircle2, Skull } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundService } from '../services/sound';

export default function ResultsPage({ stats, participant, isGameOver, onPlayAgain, onViewLeaderboard }) {
  useEffect(() => {
    if (!isGameOver) {
      soundService.playRoundComplete();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } else {
      soundService.playWrong();
    }
  }, [isGameOver]);

  const formatTime = (seconds = 0) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getRankBadgeInfo = (title) => {
    switch (title) {
      case 'MASTER DEBUGGER':
        return {
          color: 'text-amber-300 bg-amber-500/15 border-cyber-amber shadow-neon-cyan',
          icon: Trophy,
          subtitle: 'Supreme engineering excellence & pristine precision!'
        };
      case 'BUG SLAYER':
        return {
          color: 'text-cyber-green bg-cyber-green/15 border-cyber-green shadow-neon-green',
          icon: Award,
          subtitle: 'Formidable code warrior with razor-sharp bug instincts!'
        };
      case 'DEBUGGING APPRENTICE':
        return {
          color: 'text-cyber-cyan bg-cyber-cyan/15 border-cyber-cyan',
          icon: Target,
          subtitle: 'Solid debugging capabilities and tactical acumen.'
        };
      default:
        return {
          color: 'text-slate-300 bg-slate-800 border-slate-700',
          icon: Bug,
          subtitle: 'Valiant effort on the competition grid. Keep honing your craft!'
        };
    }
  };

  const badge = getRankBadgeInfo(stats?.rank_title);
  const BadgeIcon = badge.icon;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      
      {/* Main Results Container */}
      <div className={`cyber-card rounded-2xl p-6 sm:p-10 border text-center shadow-2xl ${
        isGameOver ? 'border-cyber-red/80' : 'border-cyber-green/60'
      }`}>
        
        {/* Header Icon */}
        <div className={`w-20 h-20 rounded-2xl mx-auto flex items-center justify-center mb-4 border ${
          isGameOver 
            ? 'bg-red-500/20 border-cyber-red text-cyber-red shadow-neon-red' 
            : 'bg-cyber-green/20 border-cyber-green text-cyber-green shadow-neon-green animate-bounce'
        }`}>
          {isGameOver ? <Skull className="w-10 h-10" /> : <Trophy className="w-10 h-10" />}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-white mb-1">
          {isGameOver ? 'GAME OVER: OUT OF LIVES' : 'BUG HUNT COMPLETE!'}
        </h1>
        <p className="text-xs font-mono text-slate-400 mb-6 uppercase tracking-wider">
          ENGINEERS DAY TECHNICAL TOURNAMENT
        </p>

        {/* Team & Department Pill */}
        <div className="inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-4 px-4 py-2 rounded-xl bg-slate-900 border border-cyber-border mb-8 text-xs font-mono">
          <div className="text-slate-300">
            Team: <span className="text-cyber-green font-bold">{participant?.team_name || 'Autonomous'}</span>
          </div>
          <span className="hidden sm:inline text-slate-600">•</span>
          <div className="text-slate-300">
            Department: <span className="text-cyber-cyan font-bold uppercase">{participant?.college || 'IT'}</span>
          </div>
          {participant?.name && participant.name !== participant.team_name && (
            <>
              <span className="hidden sm:inline text-slate-600">•</span>
              <div className="text-slate-400">
                Lead: <span className="text-white">{participant.name}</span>
              </div>
            </>
          )}
        </div>


        {/* Title Rank Badge Card */}
        <div className={`p-4 rounded-xl border mb-8 max-w-lg mx-auto ${badge.color}`}>
          <div className="flex items-center justify-center gap-2 text-lg sm:text-xl font-mono font-black uppercase tracking-wider mb-1">
            <BadgeIcon className="w-6 h-6 shrink-0" />
            <span>{stats?.rank_title || 'CODE RECRUIT'}</span>
          </div>
          <p className="text-xs font-mono opacity-90">
            {badge.subtitle}
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10 text-left">
          
          {/* Final Score */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-cyber-border">
            <div className="text-[10px] font-mono uppercase text-slate-400 mb-1">Final Score</div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-cyber-green neon-text-green">
              {stats?.score || 0}
            </div>
            <div className="text-[11px] font-mono text-slate-500 mt-0.5">tournament pts</div>
          </div>

          {/* Bugs Slayed */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-cyber-border">
            <div className="text-[10px] font-mono uppercase text-slate-400 mb-1">Bugs Found</div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-cyber-cyan">
              {stats?.bugs_found || 0}
            </div>
            <div className="text-[11px] font-mono text-slate-500 mt-0.5">eradicated</div>
          </div>

          {/* Accuracy */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-cyber-border">
            <div className="text-[10px] font-mono uppercase text-slate-400 mb-1">Accuracy</div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-cyber-amber">
              {stats?.accuracy || 0}%
            </div>
            <div className="text-[11px] font-mono text-slate-500 mt-0.5">hit rate</div>
          </div>

          {/* Time Taken */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-cyber-border">
            <div className="text-[10px] font-mono uppercase text-slate-400 mb-1">Time Used</div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-purple-400">
              {formatTime(stats?.total_time_sec)}
            </div>
            <div className="text-[11px] font-mono text-slate-500 mt-0.5">mm:ss</div>
          </div>

        </div>

        {/* Max Combo & Tab Switches secondary banner */}
        <div className="flex flex-wrap items-center justify-around gap-4 p-3 rounded-xl bg-slate-900/60 border border-cyber-border/60 text-xs font-mono text-slate-400 mb-10 max-w-lg mx-auto">
          <div>
            Max Combo Streak: <span className="text-white font-bold">x{Math.max(1, stats?.max_combo || 1)}</span>
          </div>
          <span className="text-slate-700 hidden sm:inline">•</span>
          <div>
            Anti-Cheat Violations: <span className={stats?.tab_switches > 0 ? 'text-cyber-red font-bold' : 'text-cyber-green font-bold'}>{stats?.tab_switches || 0}</span>
          </div>
        </div>

        {/* Action Buttons: Participant can only Play Again */}
        <div className="flex items-center justify-center max-w-sm mx-auto">
          
          <button
            onClick={() => { soundService.playClick(); onPlayAgain(); }}
            className="w-full flex items-center justify-center gap-2.5 py-4 px-8 rounded-xl bg-cyber-green hover:bg-emerald-400 text-black font-mono font-black text-sm tracking-wider uppercase transition-all shadow-neon-green hover:scale-[1.02]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>PLAY AGAIN / NEW HUNT</span>
          </button>

        </div>


      </div>

    </div>
  );
}
