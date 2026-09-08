import React from 'react';
import { Users, Shield, Radio, Sparkles, Clock, AlertCircle, ArrowLeft } from 'lucide-react';
import { soundService } from '../services/sound';

export default function WaitingRoomPage({ team, members = [], compStatus, onOpenRules, onBack }) {
  const teamId = team?.team_id || 'PENDING';
  const teamName = team?.team_name || 'Official Squad';
  const department = team?.department || 'Engineering';

  return (
    <div className="min-h-screen bg-cyber-dark text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Glow Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyber-cyan/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-2xl w-full p-6 sm:p-8 rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur shadow-2xl relative z-10 text-center">
        
        {/* Top Back / Home Button */}
        {onBack && (
          <div className="flex justify-start mb-2">
            <button
              onClick={() => { soundService.playClick(); onBack(); }}
              className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200 hover:border-slate-700 text-xs font-mono flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to Home
            </button>
          </div>
        )}

        {/* Radar Animation */}
        <div className="relative w-20 h-20 mx-auto mb-5 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-cyber-cyan/30 animate-ping" />
          <div className="absolute inset-2 rounded-full border border-cyber-green/40 animate-pulse" />
          <div className="w-12 h-12 rounded-full bg-slate-950 border border-cyber-green text-cyber-green flex items-center justify-center shadow-[0_0_15px_#00ff88]">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyber-green/40 bg-cyber-green/10 text-cyber-green text-xs font-mono font-medium tracking-widest uppercase mb-3">
          <span className="w-2 h-2 rounded-full bg-cyber-green animate-ping" />
          CONNECTED TO TOURNAMENT LOBBY
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-100 mb-1.5">
          WAITING ROOM
        </h2>
        
        <p className="text-xs sm:text-sm font-mono text-cyber-cyan mb-6">
          Awaiting tournament organizer to launch <span className="underline font-bold">Round 1 — Basic MCQ</span>.
        </p>

        {/* Team Details Summary Card */}
        <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 text-left mb-6 space-y-2.5 font-mono">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-xs text-slate-500 uppercase">Team Identification</span>
            <span className="text-cyber-green font-bold text-sm sm:text-base">{teamId}</span>
          </div>

          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-xs text-slate-500 uppercase">Team Name</span>
            <span className="text-slate-100 font-bold text-sm">{teamName}</span>
          </div>

          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-xs text-slate-500 uppercase">Department</span>
            <span className="text-amber-400 font-bold text-sm">{department}</span>
          </div>

          <div>
            <span className="text-xs text-slate-500 uppercase block mb-2">
              Official Squad ({members?.length || 2} Students)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {members && members.length > 0 ? (
                members.map((m, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 text-xs flex items-center justify-between">
                    <span className="text-slate-200 font-semibold truncate mr-2">
                      {m?.name || `Student ${idx + 1}`}
                    </span>
                    <span className="text-[10px] text-cyber-cyan px-1.5 py-0.5 rounded bg-cyber-cyan/10 border border-cyber-cyan/20 shrink-0">
                      {idx === 0 ? 'Lead' : `#${idx + 1}`}
                    </span>
                  </div>
                ))
              ) : (
                [1, 2, 3, 4].map((num) => (
                  <div key={num} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 text-xs flex items-center justify-between text-slate-400">
                    <span>Student {num}</span>
                    <span className="text-[10px] text-slate-600">Enrolled</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Notice Message */}
        <div className="p-3 rounded-xl border border-slate-800 bg-slate-950 text-xs font-mono text-slate-400 flex items-center justify-center gap-2 mb-5">
          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Keep this window active. The round will automatically launch when the Admin initiates it.</span>
        </div>

        <button
          onClick={onOpenRules}
          className="text-xs font-mono text-cyber-cyan hover:underline hover:text-cyber-cyan/80 transition"
        >
          Review Competition Rules & Scoring System →
        </button>

      </div>
    </div>
  );
}

