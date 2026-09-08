import React, { useState, useEffect } from 'react';
import { Bug, Trophy, Medal, Sparkles, Radio, Tv, Award, ArrowUp, ArrowDown, ArrowLeft, Shield } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { subscribeToLeaderboard, subscribeToState, subscribeToWinnerReveal, subscribeToSubmission } from '../services/socket';
import { soundService } from '../services/sound';

export default function ProjectorPage({ onBack, onOpenAdmin }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [compState, setCompState] = useState({
    status: 'WAITING',
    active_round: 0,
    message: '',
    results_locked: false,
    winner_reveal_state: 'NONE'
  });

  const [recentNotification, setRecentNotification] = useState(null);
  const [revealData, setRevealData] = useState(null);
  const [transitionBanner, setTransitionBanner] = useState(null);

  // 1. Initial Load & Polling Fallback
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 6000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [lbRes, stateRes] = await Promise.all([
        api.getLeaderboard(),
        api.getCompetitionStatus()
      ]);

      if (lbRes.success && lbRes.leaderboard) {
        setLeaderboard(lbRes.leaderboard);
      }
      if (stateRes.success) {
        setCompState(prev => {
          // If round changed, show transition banner
          if (stateRes.active_round > 0 && stateRes.active_round !== prev.active_round) {
            triggerRoundTransition(stateRes.active_round);
          }
          return stateRes;
        });
      }
    } catch (e) {
      console.error('Projector load error:', e);
    }
  };

  // 2. Real-Time Socket.IO Subscriptions
  useEffect(() => {
    const unsubLb = subscribeToLeaderboard((data) => {
      if (data?.leaderboard) {
        setLeaderboard(data.leaderboard);
      }
    });

    const unsubState = subscribeToState((newState) => {
      setCompState(prev => {
        if (newState.active_round > 0 && newState.active_round !== prev.active_round) {
          triggerRoundTransition(newState.active_round);
        }
        return { ...prev, ...newState };
      });
    });

    const unsubReveal = subscribeToWinnerReveal((data) => {
      if (data?.reveal_state) {
        handleWinnerReveal(data.reveal_state, data.team);
      }
    });

    const unsubSub = subscribeToSubmission((data) => {
      if (data?.team_name) {
        setRecentNotification(`${data.team_name} SUBMITTED ROUND ${data.round_num}!`);
        setTimeout(() => setRecentNotification(null), 4000);
      }
    });

    return () => {
      unsubLb();
      unsubState();
      unsubReveal();
      unsubSub();
    };
  }, []);

  const triggerRoundTransition = (roundNum) => {
    const titles = {
      1: { name: 'ROUND 1 — BASIC MCQ', marks: '10 MARKS', lang: 'C, C++, Java, Python, HTML' },
      2: { name: 'ROUND 2 — IDENTIFY THE BUG', marks: '15 MARKS', lang: 'Java (Bug Line & Type)' },
      3: { name: 'ROUND 3 — IDENTIFY & CORRECT', marks: '25 MARKS', lang: 'Python (IDE + Test Cases)' }
    };
    const info = titles[roundNum] || { name: `ROUND ${roundNum}`, marks: '50 MARKS', lang: '' };
    setTransitionBanner(info);
    soundService.playRoundComplete();
    setTimeout(() => setTransitionBanner(null), 5000);
  };

  const handleWinnerReveal = (state, team) => {
    setRevealData({ state, team });
    soundService.playRoundComplete();

    // Trigger celebratory confetti for 1st, 2nd, 3rd
    confetti({
      particleCount: state === 'WINNER' ? 150 : 80,
      spread: 100,
      origin: { y: 0.6 }
    });
  };

  const getRoundLabel = () => {
    if (compState.status === 'WAITING') return 'TOURNAMENT PREPARATION';
    if (compState.active_round === 1) return 'ROUND 1 — BASIC MCQ';
    if (compState.active_round === 2) return 'ROUND 2 — IDENTIFY THE BUG';
    if (compState.active_round === 3) return 'ROUND 3 — IDENTIFY & CORRECT';
    if (compState.status === 'FINISHED') return 'TOURNAMENT CONCLUDED';
    return 'LIVE ARENA';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-hidden relative">
      
      {/* Dynamic Background Ambient Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyber-green/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyber-cyan/10 rounded-full blur-3xl pointer-events-none" />

      {/* Auditorium Projector Header (Optimized for 1080p, 1440p, 4K) */}
      <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur px-8 py-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <Bug className="w-10 h-10 text-cyber-green animate-pulse drop-shadow-[0_0_12px_#00ff88]" />
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold font-display tracking-tight text-slate-100 flex items-center gap-3">
              BUG HUNT
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30">
                AUDITORIUM DISPLAY
              </span>
            </h1>
            <p className="text-xs font-mono text-slate-400">
              TECHNICAL DEBUGGING COMPETITION • 50 MAXIMUM MARKS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          
          {/* Submission Broadcast Ticker */}
          {recentNotification && (
            <div className="px-4 py-1.5 rounded-full bg-cyber-green/20 border border-cyber-green text-cyber-green font-mono text-xs font-bold animate-pulse shadow-[0_0_15px_#00ff88]">
              {recentNotification}
            </div>
          )}

          {/* Current Stage Pill */}
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 font-mono text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-cyber-green animate-ping" />
            <span className="font-bold text-slate-200 uppercase">{getRoundLabel()}</span>
          </div>

          <div className="hidden lg:flex items-center gap-2 font-mono text-xs text-slate-500">
            <Radio className="w-4 h-4 text-cyber-cyan" />
            <span>REAL-TIME ENGINE LIVE</span>
          </div>

          {/* Navigation Controls */}
          {onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="px-3 py-1.5 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-300 font-mono text-xs hover:bg-rose-500/20 transition flex items-center gap-1.5"
              title="Organizer Admin Console"
            >
              <Shield className="w-3.5 h-3.5" />
              Admin
            </button>
          )}

          {onBack && (
            <button
              onClick={onBack}
              className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 font-mono text-xs hover:bg-slate-800 transition flex items-center gap-1.5"
              title="Exit Projector Display"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Exit Display
            </button>
          )}

        </div>
      </header>

      {/* Main Screen Content */}
      <main className="flex-1 p-6 md:p-8 flex flex-col max-w-7xl w-full mx-auto justify-center z-10">
        
        {/* Fullscreen Round Transition Overlay */}
        {transitionBanner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md animate-in fade-in zoom-in duration-300 p-6">
            <div className="text-center max-w-3xl w-full p-10 rounded-3xl border-2 border-cyber-cyan bg-slate-900/90 shadow-[0_0_80px_#00e5ff40]">
              <div className="w-20 h-20 rounded-full bg-cyber-cyan/20 border border-cyber-cyan text-cyber-cyan flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-10 h-10" />
              </div>
              <h2 className="text-4xl md:text-6xl font-extrabold font-display text-slate-100 mb-3 tracking-tight">
                {transitionBanner.name}
              </h2>
              <div className="inline-block text-2xl md:text-3xl font-extrabold font-mono text-cyber-green mb-4">
                {transitionBanner.marks}
              </div>
              <p className="text-base font-mono text-slate-400">
                {transitionBanner.lang}
              </p>
            </div>
          </div>
        )}

        {/* Winner Reveal Mode Display */}
        {revealData && revealData.state !== 'NONE' && (
          <div className="mb-8 p-6 md:p-8 rounded-3xl border-2 border-amber-400 bg-gradient-to-r from-amber-500/15 via-slate-900 to-amber-500/15 shadow-[0_0_50px_#f59e0b40] text-center animate-in zoom-in duration-500">
            <div className="text-4xl mb-2">{revealData.team?.medal}</div>
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-amber-400 block mb-1">
              OFFICIAL WINNER CEREMONY
            </span>
            <h3 className="text-3xl md:text-5xl font-extrabold font-display text-slate-100 mb-2">
              {revealData.team?.place}: <span className="text-amber-300">{revealData.team?.team_name}</span>
            </h3>
            <div className="text-2xl font-mono font-extrabold text-cyber-green">
              FINAL SCORE: {revealData.team?.final_score} / 50 MARKS
            </div>
          </div>
        )}

        {/* Leaderboard Table Container */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur shadow-2xl overflow-hidden flex flex-col flex-1">
          
          {/* Table Header Bar */}
          <div className="grid grid-cols-12 px-6 py-4 bg-slate-950/80 border-b border-slate-800 font-mono text-xs md:text-sm font-bold text-slate-400 uppercase tracking-wider">
            <div className="col-span-1 text-center">RANK</div>
            <div className="col-span-4">TEAM / DEPARTMENT</div>
            <div className="col-span-2 text-center text-cyber-cyan">R1 (/10)</div>
            <div className="col-span-2 text-center text-amber-400">R2 (/15)</div>
            <div className="col-span-1 text-center text-cyber-green">R3 (/25)</div>
            <div className="col-span-2 text-right text-slate-200">TOTAL (/50)</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-800/60 overflow-y-auto flex-1 font-mono">
            {leaderboard.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-sm">
                No scores registered yet. The leaderboard will automatically update as teams submit solutions.
              </div>
            ) : (
              leaderboard.map((team, idx) => {
                const rank = idx + 1;
                let rankBadge = `${rank}`;
                let rowBg = 'hover:bg-slate-800/30';

                if (rank === 1) {
                  rankBadge = '🥇 1st';
                  rowBg = 'bg-amber-500/10 hover:bg-amber-500/15 border-l-4 border-amber-400';
                } else if (rank === 2) {
                  rankBadge = '🥈 2nd';
                  rowBg = 'bg-slate-400/10 hover:bg-slate-400/15 border-l-4 border-slate-400';
                } else if (rank === 3) {
                  rankBadge = '🥉 3rd';
                  rowBg = 'bg-amber-700/10 hover:bg-amber-700/15 border-l-4 border-amber-600';
                }

                return (
                  <div
                    key={team.team_id}
                    className={`grid grid-cols-12 px-6 py-4 items-center text-sm md:text-base transition duration-300 ${rowBg}`}
                  >
                    {/* Rank */}
                    <div className="col-span-1 text-center font-bold text-base md:text-lg">
                      {rankBadge}
                    </div>

                    {/* Team & Dept */}
                    <div className="col-span-4 flex flex-col">
                      <span className="font-bold text-slate-100 text-base md:text-lg truncate">
                        {team.team_name}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-2">
                        <span>{team.department}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-[11px] text-slate-500">{team.team_id}</span>
                      </span>
                    </div>

                    {/* R1 */}
                    <div className="col-span-2 text-center text-cyber-cyan font-bold text-base">
                      {team.r1_score || 0}
                    </div>

                    {/* R2 */}
                    <div className="col-span-2 text-center text-amber-400 font-bold text-base">
                      {team.r2_score || 0}
                    </div>

                    {/* R3 */}
                    <div className="col-span-1 text-center text-cyber-green font-bold text-base">
                      {team.r3_score || 0}
                    </div>

                    {/* Final */}
                    <div className="col-span-2 text-right font-extrabold text-xl md:text-2xl text-slate-100">
                      <span className={rank === 1 ? 'text-amber-400' : 'text-cyber-green'}>
                        {team.final_score || 0}
                      </span>
                      <span className="text-xs text-slate-500 font-normal ml-1">/50</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Projector Read-Only Footer Note */}
          <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 text-slate-500 text-xs font-mono flex items-center justify-between">
            <span>Official BUG HUNT Live Standings</span>
            <span>Refreshes automatically via WebSocket broadcast</span>
          </div>

        </div>

      </main>

    </div>
  );
}
