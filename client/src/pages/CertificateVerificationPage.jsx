import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, ShieldX, Bug, Award, CheckCircle2, ArrowLeft, ExternalLink } from 'lucide-react';
import { api } from '../services/api';

export default function CertificateVerificationPage({ certId, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (certId) {
      verifyCert(certId);
    }
  }, [certId]);

  const verifyCert = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.verifyCertificate(id);
      setData(res);
    } catch (e) {
      console.error('Verification error:', e);
      setError('Unable to reach verification server.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cyber-dark text-slate-100 flex items-center justify-center font-mono">
        <div className="text-center space-y-3">
          <Bug className="w-12 h-12 text-cyber-cyan animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Verifying Cryptographic Certificate Record...</p>
        </div>
      </div>
    );
  }

  const isVerified = data?.success && data?.status === 'VERIFIED';
  const isRevoked = data?.status === 'REVOKED';
  const cert = data?.certificate;

  return (
    <div className="min-h-screen bg-cyber-dark text-slate-100 flex flex-col items-center justify-center p-4 relative">
      
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyber-cyan/15 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-lg w-full p-8 rounded-3xl border border-slate-800 bg-slate-900/90 backdrop-blur shadow-2xl relative z-10 text-center">
        
        {/* Verification Status Icon */}
        {isVerified ? (
          <div className="w-20 h-20 rounded-full bg-cyber-green/20 border-2 border-cyber-green text-cyber-green flex items-center justify-center mx-auto mb-5 shadow-[0_0_25px_#00ff8850] animate-in zoom-in">
            <ShieldCheck className="w-10 h-10" />
          </div>
        ) : isRevoked ? (
          <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 text-amber-400 flex items-center justify-center mx-auto mb-5">
            <ShieldAlert className="w-10 h-10" />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full bg-rose-500/20 border-2 border-rose-500 text-rose-400 flex items-center justify-center mx-auto mb-5">
            <ShieldX className="w-10 h-10" />
          </div>
        )}

        {/* Verification Status Header */}
        <h2 className="text-2xl md:text-3xl font-extrabold font-display tracking-tight mb-2">
          {isVerified ? (
            <span className="text-cyber-green">✓ CERTIFICATE VERIFIED</span>
          ) : isRevoked ? (
            <span className="text-amber-400">⚠ CERTIFICATE REVOKED</span>
          ) : (
            <span className="text-rose-400">✗ CERTIFICATE NOT FOUND</span>
          )}
        </h2>

        <p className="text-xs font-mono text-slate-400 mb-6">
          {isVerified 
            ? 'Official tamper-proof competition credential authenticated.' 
            : isRevoked 
            ? 'This credential was revoked by tournament administrators.' 
            : 'No authentic competition certificate matching this identifier exists.'}
        </p>

        {/* Details Card */}
        {cert && (
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-left font-mono text-xs space-y-2.5 mb-6 shadow-inner">
            
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-500 uppercase">Certificate ID</span>
              <span className="text-cyber-cyan font-bold text-sm tracking-wider">{cert.certificate_id}</span>
            </div>

            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-500 uppercase">Recipient Name</span>
              <span className="text-slate-100 font-bold text-sm">{cert.student_name}</span>
            </div>

            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-500 uppercase">Team Name</span>
              <span className="text-slate-200">{cert.team_name}</span>
            </div>

            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-500 uppercase">Achievement</span>
              <span className="text-amber-400 font-bold">{cert.achievement}</span>
            </div>

            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-500 uppercase">Tournament Rank</span>
              <span className="text-slate-200 font-bold">#{cert.rank}</span>
            </div>

            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-500 uppercase">Final Score</span>
              <span className="text-cyber-green font-bold text-sm">{cert.final_score} / 50 Marks</span>
            </div>

            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-500 uppercase">Event / Year</span>
              <span className="text-slate-300">{cert.event_name || 'BUG HUNT 2026'}</span>
            </div>

            <div className="flex justify-between pt-1">
              <span className="text-slate-500 uppercase">Date of Issue</span>
              <span className="text-slate-400">{cert.competition_date}</span>
            </div>

          </div>
        )}

        {/* Back navigation */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-slate-300 font-mono text-xs hover:border-slate-500 hover:text-slate-100 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Platform Home
        </button>

      </div>

    </div>
  );
}
