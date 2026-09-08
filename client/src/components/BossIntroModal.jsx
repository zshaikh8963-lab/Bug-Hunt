import React, { useEffect } from 'react';
import { Skull, AlertTriangle, Zap, Shield } from 'lucide-react';
import { playBossAlert, playClick } from '../audio/soundEffects';

export const BossIntroModal = ({ isOpen, onDismiss }) => {
  useEffect(() => {
    if (isOpen) {
      playBossAlert();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#110c1f] border-2 border-purple-500 rounded-2xl p-8 text-center shadow-[0_0_50px_rgba(168,85,247,0.5)] overflow-hidden">
        
        {/* Animated Background Pulse Ring */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-rose-600/20 rounded-full blur-3xl animate-pulse"></div>

        {/* Warning Icon */}
        <div className="relative mx-auto w-20 h-20 rounded-2xl bg-purple-950/60 border-2 border-purple-500 flex items-center justify-center mb-5 text-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.6)]">
          <Skull className="w-10 h-10 animate-bounce text-purple-300" />
          <span className="absolute -top-2 -right-2 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-rose-600 text-white rounded">
            FINAL ROUND
          </span>
        </div>

        <div className="flex items-center justify-center gap-2 text-rose-400 font-mono text-xs uppercase tracking-widest mb-1">
          <AlertTriangle className="w-4 h-4 animate-spin" />
          <span>CRITICAL THREAT LEVEL</span>
          <AlertTriangle className="w-4 h-4 animate-spin" />
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-rose-400 to-amber-300 uppercase tracking-wider mb-3">
          ⚠️ BOSS BUG DETECTED
        </h2>

        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
          You have breached the final security boundary. This high-stakes challenge features an intricate distributed system with race conditions, memory leaks, and logic vulnerabilities.
        </p>

        {/* Round Parameters */}
        <div className="grid grid-cols-3 gap-3 mb-6 font-mono text-xs">
          <div className="bg-purple-950/40 border border-purple-800/60 rounded-lg p-2.5">
            <span className="text-slate-400 text-[10px] block">REWARD</span>
            <span className="text-base font-bold text-cyber-neon">+25 PTS</span>
          </div>
          <div className="bg-purple-950/40 border border-purple-800/60 rounded-lg p-2.5">
            <span className="text-slate-400 text-[10px] block">PENALTY</span>
            <span className="text-base font-bold text-rose-400">-10 PTS</span>
          </div>
          <div className="bg-purple-950/40 border border-purple-800/60 rounded-lg p-2.5">
            <span className="text-slate-400 text-[10px] block">TIME LIMIT</span>
            <span className="text-base font-bold text-amber-400">10 MIN</span>
          </div>
        </div>

        <button
          onClick={() => { playClick(); onDismiss(); }}
          className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-extrabold text-base rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.7)] font-mono tracking-wider flex items-center justify-center gap-2"
        >
          <Zap className="w-5 h-5 text-amber-300" />
          <span>ENGAGE BOSS BUG</span>
        </button>

      </div>
    </div>
  );
};
