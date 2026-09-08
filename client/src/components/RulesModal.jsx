import React from 'react';
import { X, Trophy, Shield, Zap, Heart, Lightbulb, Clock, CheckCircle, Bug } from 'lucide-react';
import { soundService } from '../services/sound';

export default function RulesModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-cyber-border rounded-2xl p-6 sm:p-8 shadow-2xl scrollbar-thin">
        
        {/* Close Button */}
        <button
          onClick={() => { soundService.playClick(); onClose(); }}
          className="absolute top-5 right-5 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-cyber-green/10 border border-cyber-green/30 text-cyber-green">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-mono text-white tracking-tight">
              BUG HUNT: OFFICIAL COMPETITION RULES
            </h2>
            <p className="text-xs font-mono text-cyber-green">
              ENGINEERS DAY TECHNICAL TOURNAMENT GUIDELINES
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-6 text-slate-300 text-sm">

          {/* Rounds Breakdown */}
          <div>
            <h3 className="text-base font-mono font-bold text-white mb-3 flex items-center gap-2">
              <Bug className="w-4 h-4 text-cyber-cyan" />
              <span>THE 3 OFFICIAL COMPETITION ROUNDS (MAX 50 MARKS)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
              
              {/* Round 1 */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-cyber-cyan/30">
                <div className="text-cyber-cyan font-bold text-sm mb-1">ROUND 1 — BASIC MCQ</div>
                <p className="text-slate-400 mb-2">10 questions covering C, C++, Java, Python, and HTML.</p>
                <div className="flex justify-between text-[11px] pt-2 border-t border-slate-700/60 font-semibold">
                  <span className="text-emerald-400">Total: 10 Marks</span>
                  <span className="text-slate-400">30s / Question</span>
                </div>
              </div>

              {/* Round 2 */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-amber-500/30">
                <div className="text-amber-400 font-bold text-sm mb-1">ROUND 2 — IDENTIFY THE BUG</div>
                <p className="text-slate-400 mb-2">3 Java challenges. Select buggy line and bug type. Strictly bug identification.</p>
                <div className="flex justify-between text-[11px] pt-2 border-t border-slate-700/60 font-semibold">
                  <span className="text-emerald-400">Total: 15 Marks</span>
                  <span className="text-slate-400">Line: 3m • Type: 2m</span>
                </div>
              </div>

              {/* Round 3 */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-cyber-green/30">
                <div className="text-cyber-green font-bold text-sm mb-1">ROUND 3 — IDENTIFY & CORRECT</div>
                <p className="text-slate-400 mb-2">2 Python challenges in real Monaco IDE. Execute against visible & hidden tests.</p>
                <div className="flex justify-between text-[11px] pt-2 border-t border-slate-700/60 font-semibold">
                  <span className="text-emerald-400">Total: 25 Marks</span>
                  <span className="text-slate-400">Ch 1: 12m • Ch 2: 13m</span>
                </div>
              </div>

            </div>
          </div>

          {/* Team Structure & Tie-Breaker */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <div className="flex items-center gap-2 text-cyber-cyan font-mono font-bold text-sm mb-1">
                <Zap className="w-4 h-4 text-cyber-cyan" />
                <span>TEAM SQUAD (2 TO 4 STUDENTS)</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Teams must consist of 2 to 4 students representing their engineering department. All registered members are printed on the official award certificate.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <div className="flex items-center gap-2 text-purple-400 font-mono font-bold text-sm mb-1">
                <Trophy className="w-4 h-4 text-purple-400" />
                <span>TIE-BREAKER PROTOCOL</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                1. Total Points (out of 50)<br />
                2. Highest Round 3 Score (out of 25)<br />
                3. Total Time Elapsed (lower is better)<br />
                4. Earliest final submission timestamp
              </p>
            </div>

          </div>

          {/* Anti Cheat Policy */}
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/50">
            <div className="flex items-center gap-2 text-rose-400 font-mono font-bold text-sm mb-1">
              <Shield className="w-4 h-4 text-rose-400" />
              <span>3-STRIKE ANTI-CHEATING SECURITY</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tab switching, window minimization, or defocus triggers automated security strikes. Strike 1 & 2 display urgent warnings. Strike 3 triggers immediate, irreversible team disqualification.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => { soundService.playClick(); onClose(); }}
            className="px-6 py-2.5 rounded-xl bg-cyber-green hover:bg-emerald-400 text-black font-mono font-bold text-sm transition-all shadow-neon-green"
          >
            I Understand — Back to Hunt
          </button>
        </div>

      </div>
    </div>
  );
}
