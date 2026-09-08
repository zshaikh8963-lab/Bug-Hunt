import React from 'react';
import { ShieldAlert, AlertTriangle, Skull, X } from 'lucide-react';
import { soundService } from '../services/sound';

export default function AntiCheatModal({ isOpen, strikeCount = 1, isDisqualified = false, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-200">
      <div className={`max-w-md w-full p-6 md:p-8 rounded-2xl border text-center shadow-2xl relative ${
        isDisqualified 
          ? 'border-rose-600 bg-slate-900 shadow-[0_0_50px_#ef444450]' 
          : 'border-amber-500 bg-slate-900 shadow-[0_0_40px_#f59e0b40]'
      }`}>
        
        {/* Icon */}
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
          isDisqualified 
            ? 'bg-rose-500/20 text-rose-500 border border-rose-500 animate-bounce' 
            : 'bg-amber-500/20 text-amber-400 border border-amber-400 animate-pulse'
        }`}>
          {isDisqualified ? <Skull className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
        </div>

        {/* Title */}
        <h3 className="text-xl md:text-2xl font-bold font-display tracking-tight text-slate-100 mb-2">
          {isDisqualified ? (
            <span className="text-rose-500">TEAM DISQUALIFIED</span>
          ) : strikeCount === 2 ? (
            <span className="text-amber-400">WARNING 2 / 3 (FINAL WARNING)</span>
          ) : (
            <span className="text-amber-400">WARNING 1 / 3</span>
          )}
        </h3>

        {/* Warning Message Body */}
        <p className="text-xs md:text-sm font-mono text-slate-300 mb-6 leading-relaxed">
          {isDisqualified ? (
            <>
              Your team has exceeded the maximum allowable security strikes (tab switches, window focus loss, or navigation). 
              Your team session has been officially locked and reported to event administrators.
            </>
          ) : strikeCount === 2 ? (
            <>
              <strong>Final Warning:</strong> Window defocus or tab switching was detected. 
              One more violation strike will result in immediate disqualification for your entire team.
            </>
          ) : (
            <>
              Please remain strictly on the <strong>BUG HUNT</strong> competition screen. 
              All activity is logged and monitored server-side by the tournament system.
            </>
          )}
        </p>

        {/* Action Button */}
        {!isDisqualified ? (
          <button
            type="button"
            onClick={() => { soundService.playClick(); onClose(); }}
            className="w-full py-3 rounded-xl bg-amber-400 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider hover:bg-amber-300 transition"
          >
            I Understand & Return to Competition
          </button>
        ) : (
          <div className="text-xs font-mono text-rose-400 border border-rose-500/30 bg-rose-500/10 p-3 rounded-xl">
            Competition Access Revoked. Please contact event coordinators.
          </div>
        )}

      </div>
    </div>
  );
}
