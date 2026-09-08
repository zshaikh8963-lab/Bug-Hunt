import React, { useState, useEffect } from 'react';
import { Trophy, Search, ArrowLeft, Bug, Award, Users, Shield, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { subscribeToLeaderboard } from '../services/socket';
import { soundService } from '../services/sound';
import CertificateModal from '../components/CertificateModal';

export default function LeaderboardPage({ onBack, onOpenProjector, onOpenAdmin }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [resultsLocked, setResultsLocked] = useState(false);
  const [selectedCertTeam, setSelectedCertTeam] = useState(null);
  const [teamCerts, setTeamCerts] = useState([]);
  const [activeCert, setActiveCert] = useState(null);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    loadLeaderboard();
    const unsub = subscribeToLeaderboard((data) => {
      if (data?.leaderboard) {
        setLeaderboard(data.leaderboard);
      }
    });
    return () => unsub();
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const [res, compRes] = await Promise.all([
        api.getLeaderboard(search),
        api.getCompetitionStatus()
      ]);
      if (res.success && res.leaderboard) {
        setLeaderboard(res.leaderboard);
        setResultsLocked(res.results_locked);
      }
      if (compRes.settings) {
        setSettings(compRes.settings);
      }
    } catch (e) {
      console.error('Failed to load leaderboard:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCertificates = async (team) => {
    soundService.playClick();
    setSelectedCertTeam(team);
    try {
      const res = await api.getTeamCertificates(team.team_id);
      if (res.success && res.certificates.length > 0) {
        setTeamCerts(res.certificates);
        setActiveCert(res.certificates[0]);
      } else {
        alert('Certificates have not been generated yet by tournament organizers.');
      }
    } catch (e) {
      alert('Error fetching team certificates.');
    }
  };

  const filtered = leaderboard.filter(t => 
    (t?.team_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (t?.team_id || '').toLowerCase().includes(search.toLowerCase()) ||
    (t?.department || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-cyber-dark text-slate-100 flex flex-col font-sans">
      
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur px-6 py-4 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 transition"
              title="Return to Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold font-display text-slate-100 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-amber-400" />
                Tournament Leaderboard
              </h1>
              <p className="text-xs font-mono text-slate-400">
                Official Real-Time Standings across all 3 rounds (Max 50 Marks)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadLeaderboard}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 transition"
              title="Refresh Leaderboard"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 space-y-6">
        
        {/* Search & Stats Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search team or department..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 focus:border-cyber-cyan focus:outline-none"
            />
          </div>

          <div className="text-xs font-mono text-slate-400">
            Tie-Breaking: <span className="text-cyber-green">Final Score</span> → <span className="text-cyber-cyan">Round 3 Score</span> → <span className="text-slate-300">Completion Time</span>
          </div>
        </div>

        {/* Podium View for Top 3 */}
        {!search && filtered.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
            
            {/* 2nd Place */}
            <div className="order-2 md:order-1 p-5 rounded-2xl border border-slate-700 bg-slate-900/60 backdrop-blur text-center space-y-2">
              <span className="text-2xl">🥈</span>
              <span className="text-xs font-mono text-slate-400 block uppercase font-bold">2nd Place</span>
              <h3 className="text-lg font-bold text-slate-100 truncate">{filtered[1].team_name}</h3>
              <div className="text-2xl font-mono font-extrabold text-slate-300">
                {filtered[1].final_score} <span className="text-xs text-slate-500 font-normal">/ 50</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">{filtered[1].department}</span>
            </div>

            {/* 1st Place Champion */}
            <div className="order-1 md:order-2 p-6 rounded-2xl border-2 border-amber-400 bg-gradient-to-b from-amber-500/10 via-slate-900/80 to-slate-900 text-center space-y-2 shadow-[0_0_30px_#f59e0b20]">
              <span className="text-4xl">👑 🥇</span>
              <span className="text-xs font-mono text-amber-400 block uppercase font-bold">Tournament Champion</span>
              <h3 className="text-xl font-extrabold text-slate-100 truncate">{filtered[0].team_name}</h3>
              <div className="text-3xl font-mono font-extrabold text-amber-400">
                {filtered[0].final_score} <span className="text-xs text-slate-500 font-normal">/ 50</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">{filtered[0].department}</span>
            </div>

            {/* 3rd Place */}
            <div className="order-3 p-5 rounded-2xl border border-amber-700/60 bg-slate-900/60 backdrop-blur text-center space-y-2">
              <span className="text-2xl">🥉</span>
              <span className="text-xs font-mono text-amber-600 block uppercase font-bold">3rd Place</span>
              <h3 className="text-lg font-bold text-slate-100 truncate">{filtered[2].team_name}</h3>
              <div className="text-2xl font-mono font-extrabold text-amber-600">
                {filtered[2].final_score} <span className="text-xs text-slate-500 font-normal">/ 50</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">{filtered[2].department}</span>
            </div>

          </div>
        )}

        {/* Leaderboard Table */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur shadow-2xl overflow-hidden font-mono">
          <div className="grid grid-cols-12 px-5 py-3.5 bg-slate-950 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <div className="col-span-1 text-center">RANK</div>
            <div className="col-span-4">TEAM / SQUAD</div>
            <div className="col-span-2 text-center text-cyber-cyan">R1 (/10)</div>
            <div className="col-span-2 text-center text-amber-400">R2 (/15)</div>
            <div className="col-span-1 text-center text-cyber-green">R3 (/25)</div>
            <div className="col-span-2 text-right text-slate-200">FINAL (/50)</div>
          </div>

          <div className="divide-y divide-slate-800/60 text-xs md:text-sm">
            {filtered.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-mono space-y-3">
                <Trophy className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-base font-bold text-slate-300">
                  {search ? 'No teams match your search query.' : 'No teams have recorded scores yet.'}
                </p>
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs text-cyber-cyan hover:bg-slate-700 transition"
                  >
                    Clear Search Filter
                  </button>
                )}
              </div>
            ) : (
              filtered.map((t, idx) => {
                const rank = idx + 1;
                return (
                  <div 
                    key={t.team_id || idx}
                    className={`grid grid-cols-12 px-5 py-3.5 items-center transition ${
                      t.is_disqualified ? 'opacity-40 bg-rose-950/20' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="col-span-1 text-center font-bold">
                      {t.is_disqualified ? (
                        <span className="text-rose-400 text-xs">DQ</span>
                      ) : rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                    </div>

                    <div className="col-span-4 flex flex-col">
                      <span className="font-bold text-slate-100 truncate">
                        {t.team_name || 'Anonymous Team'}
                      </span>
                      <span className="text-[11px] text-slate-500 truncate">
                        {t.department || 'General'} • {t.members?.length ? `${t.members.length} Members` : (t.team_id || '')}
                      </span>
                    </div>

                    <div className="col-span-2 text-center text-cyber-cyan font-bold">
                      {t.r1_score || 0}
                    </div>

                    <div className="col-span-2 text-center text-amber-400 font-bold">
                      {t.r2_score || 0}
                    </div>

                    <div className="col-span-1 text-center text-cyber-green font-bold">
                      {t.r3_score || 0}
                    </div>

                    <div className="col-span-2 text-right font-extrabold text-base flex items-center justify-end gap-2">
                      <span className={rank === 1 ? 'text-amber-400' : 'text-cyber-green'}>
                        {t.final_score || 0}
                      </span>
                      <span className="text-[10px] text-slate-500 font-normal">/50</span>

                      {/* Certificate Action */}
                      {resultsLocked && !t.is_disqualified && (
                        <button
                          type="button"
                          onClick={() => handleOpenCertificates(t)}
                          className="p-1.5 rounded-lg bg-cyber-green/10 border border-cyber-green/30 text-cyber-green hover:bg-cyber-green/20 ml-2"
                          title="View Official Certificate"
                        >
                          <Award className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </main>

      {/* Certificate Modal */}
      {activeCert && (
        <CertificateModal
          certificate={activeCert}
          settings={settings}
          onClose={() => setActiveCert(null)}
        />
      )}

    </div>
  );
}
