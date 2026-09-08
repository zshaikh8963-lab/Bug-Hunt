import React, { useState } from 'react';
import { 
  Bug, Terminal, Shield, Trophy, Users, Play, ArrowRight, 
  Tv, Award, Cpu, BookOpen, Key, AlertTriangle, Sparkles, CheckCircle2 
} from 'lucide-react';
import { soundService } from '../services/sound';

export default function LandingPage({ 
  onStartRegistration, 
  onResumeSession, 
  onOpenRules, 
  onOpenAdmin, 
  onOpenProjector, 
  onRunDemo, 
  compStatus 
}) {
  const [resumeCode, setResumeCode] = useState('');
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumeError, setResumeError] = useState('');

  const handleResumeSubmit = (e) => {
    e.preventDefault();
    if (!resumeCode.trim()) {
      setResumeError('Please enter your Team ID or Pass Code.');
      soundService.playWrong();
      return;
    }
    onResumeSession(resumeCode.trim());
  };

  return (
    <div className="relative min-h-screen bg-cyber-dark text-slate-100 overflow-hidden flex flex-col items-center justify-center px-4 py-12">
      
      {/* Background Cyber Grid & Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyber-cyan/15 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00ff8808_1px,transparent_1px),linear-gradient(to_bottom,#00ff8808_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

      {/* Main Content Container */}
      <div className="relative z-10 max-w-5xl w-full flex flex-col items-center text-center">

        {/* Live Status Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyber-cyan/30 bg-cyber-cyan/10 text-cyber-cyan text-xs font-mono font-medium tracking-widest uppercase mb-6 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-cyber-cyan shadow-[0_0_8px_#00e5ff]" />
          STATUS: {compStatus?.status || 'WAITING'} {compStatus?.is_paused ? '(PAUSED)' : ''}
        </div>

        {/* Brand Title */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <Bug className="w-12 h-12 md:w-16 md:h-16 text-cyber-green animate-bounce drop-shadow-[0_0_15px_#00ff88]" />
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight font-display bg-clip-text text-transparent bg-gradient-to-r from-cyber-green via-cyber-cyan to-purple-400">
            BUG HUNT
          </h1>
        </div>

        {/* Tagline */}
        <p className="text-xl md:text-2xl font-mono text-cyber-cyan font-semibold tracking-wide mb-3 drop-shadow">
          “Find the Bug. Fix the Code. Win the Hunt.”
        </p>

        <p className="max-w-2xl text-slate-400 text-sm md:text-base mb-10 leading-relaxed">
          The premier team-based college technical debugging competition. 
          Test your problem solving across 3 rigorous technical stages against real compiler runtimes.
        </p>

        {/* Official 3-Stage Structure Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mb-10 text-left">
          
          {/* Round 1 Card */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur hover:border-cyber-cyan/50 transition duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-cyber-cyan/20 text-cyber-cyan">
                ROUND 1
              </span>
              <span className="text-xs font-mono text-slate-400">10 Marks</span>
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-1 group-hover:text-cyber-cyan transition">
              Basic MCQ
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              10 rapid-fire questions covering C, C++, Java, Python, and HTML. 30s timer per question.
            </p>
            <div className="text-[11px] font-mono text-slate-500">
              Languages: C • C++ • Java • Python • HTML
            </div>
          </div>

          {/* Round 2 Card */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur hover:border-amber-400/50 transition duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/20 text-amber-400">
                ROUND 2
              </span>
              <span className="text-xs font-mono text-slate-400">15 Marks</span>
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-1 group-hover:text-amber-400 transition">
              Identify the Bug
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              3 Java challenges. Pinpoint the exact buggy line (3 marks) and identify the bug type (2 marks).
            </p>
            <div className="text-[11px] font-mono text-slate-500">
              Language: Java (Strictly Bug Identification)
            </div>
          </div>

          {/* Round 3 Card */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur hover:border-cyber-green/50 transition duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-cyber-green/20 text-cyber-green">
                ROUND 3
              </span>
              <span className="text-xs font-mono text-slate-400">25 Marks</span>
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-1 group-hover:text-cyber-green transition">
              Identify & Correct
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              2 deep Python challenges. Spot the bug, rewrite faulty logic, and execute against test cases.
            </p>
            <div className="text-[11px] font-mono text-slate-500">
              Language: Python (Monaco IDE + Tests)
            </div>
          </div>

        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          
          <button
            onClick={() => { soundService.playClick(); onStartRegistration(); }}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyber-green to-emerald-500 text-slate-950 font-bold font-mono tracking-wide shadow-[0_0_20px_#00ff8840] hover:shadow-[0_0_30px_#00ff8870] hover:scale-105 transition transform active:scale-95"
          >
            <Users className="w-5 h-5" />
            REGISTER TEAM (2–4 STUDENTS)
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => { soundService.playClick(); setShowResumeModal(true); }}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-cyber-cyan/40 bg-cyber-cyan/10 text-cyber-cyan font-bold font-mono hover:bg-cyber-cyan/20 hover:border-cyber-cyan transition active:scale-95"
          >
            <Key className="w-4 h-4" />
            RESUME SESSION
          </button>

        </div>

        {/* Secondary Auxiliary Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-slate-400">
          
          <button
            onClick={() => { soundService.playClick(); onOpenRules(); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-slate-600 hover:text-slate-200 transition shadow-sm"
          >
            <BookOpen className="w-4 h-4 text-cyber-cyan" />
            Competition Rules
          </button>

        </div>

      </div>

      {/* Resume Session Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-cyber-cyan/50 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-xl font-bold font-mono text-slate-100 mb-2 flex items-center gap-2">
              <Key className="w-5 h-5 text-cyber-cyan" />
              Resume Team Session
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter your unique Team ID (e.g. <span className="text-cyber-cyan font-mono">TEAM-001</span>) or Pass Code to restore your active competition arena.
            </p>

            <form onSubmit={handleResumeSubmit}>
              <input
                type="text"
                value={resumeCode}
                onChange={(e) => { setResumeCode(e.target.value); setResumeError(''); }}
                placeholder="e.g. TEAM-001 or HUNT-9482"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono focus:border-cyber-cyan focus:outline-none mb-3 text-center uppercase tracking-wider"
                autoFocus
              />

              {resumeError && (
                <div className="text-xs text-rose-400 font-mono mb-3">
                  {resumeError}
                </div>
              )}

              <div className="flex gap-3 justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setShowResumeModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 font-mono text-xs hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-cyber-cyan text-slate-950 font-bold font-mono text-xs hover:bg-cyber-cyan/80 transition"
                >
                  Reconnect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 text-center text-xs font-mono text-slate-600">
        BUG HUNT Technical Debugging Competition • Powered by Real-Time Evaluation Engine
      </footer>

    </div>
  );
}
