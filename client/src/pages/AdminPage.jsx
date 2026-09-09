import React, { useState, useEffect } from 'react';
import { 
  Shield, Lock, LogOut, Play, Pause, Square, RotateCcw, Download, 
  Users, BarChart3, HelpCircle, Clock, ArrowLeft, RefreshCw, AlertTriangle, 
  Tv, Award, Settings, CheckCircle2, XCircle, Eye, EyeOff, FileSpreadsheet,
  AlertOctagon, Radio, FileText, Sparkles, Plus, Edit2, Trash2, Trophy, BookOpen
} from 'lucide-react';
import { api } from '../services/api';
import { soundService } from '../services/sound';
import CertificateModal from '../components/CertificateModal';
import QuestionBankEditor from '../components/QuestionBankEditor';

export default function AdminPage({ onBack, onOpenLeaderboard, onOpenProjector }) {
  const [token, setToken] = useState(() => {
    try {
      const saved = localStorage.getItem('bughunt_admin_token');
      if (!saved || saved === 'null' || saved === 'undefined' || saved.trim() === '') return '';
      return saved;
    } catch {
      return '';
    }
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Change Admin Credentials state
  const [credCurrentPassword, setCredCurrentPassword] = useState('');
  const [credNewUsername, setCredNewUsername] = useState('');
  const [credNewPassword, setCredNewPassword] = useState('');
  const [credConfirmPassword, setCredConfirmPassword] = useState('');
  const [credMsg, setCredMsg] = useState({ text: '', type: '' });
  const [credLoading, setCredLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  // 10 Tabs: dashboard, teams, rounds, questions, monitor, leaderboard, projector, results, certificates, settings
  const [tab, setTab] = useState('dashboard');

  // Data states with immediate fallback data to prevent blank screen
  const [stats, setStats] = useState({
    total_teams: 0,
    active_teams: 0,
    completed_teams: 0,
    disqualified_teams: 0,
    average_score: 0,
    max_score: 0,
    current_leader: 'None',
    competition_state: { status: 'WAITING', message: 'Tournament Ready' },
    question_counts: { r1: 50, r2: 31, r3: 30, total: 111 },
    recent_submissions: [],
    recent_violations: []
  });
  const [teams, setTeams] = useState([]);
  const [questionsBank, setQuestionsBank] = useState({ r1: [], r2: [], r3: [] });
  const [certificatesList, setCertificatesList] = useState([]);
  const [eventSettings, setEventSettings] = useState({
    college_name: 'National Institute of Technology & Engineering',
    department: 'Department of Computer Science & Engineering',
    event_name: 'BUG HUNT 2026',
    competition_date: 'September 9, 2026',
    coordinator_name: 'Prof. A. Sharma',
    hod_name: 'Dr. R. K. Patel',
    principal_name: 'Dr. S. Nair'
  });
  const [bannerMsg, setBannerMsg] = useState(null);

  // Modals
  const [previewCert, setPreviewCert] = useState(null);
  const [adjustScoreModal, setAdjustScoreModal] = useState(null);
  const [adjustScoreVal, setAdjustScoreVal] = useState('');


  // 1. Admin Login
  const handleLogin = async (e) => {
    e.preventDefault();
    soundService.playClick();
    setAuthError('');
    setLoading(true);

    try {
      const res = await api.adminLogin(username, password);
      if (res.success && res.token) {
        localStorage.setItem('bughunt_admin_token', res.token);
        setToken(res.token);
        soundService.playCorrect();
        loadAllAdminData();
      } else {
        setAuthError(res.error || 'Invalid administrator credentials.');
        soundService.playWrong();
      }
    } catch (err) {
      setAuthError('Connection error during admin authentication.');
      soundService.playWrong();
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    soundService.playClick();
    localStorage.removeItem('bughunt_admin_token');
    setToken('');
    setStats({
      total_teams: 0,
      active_teams: 0,
      total_submissions: 0,
      average_score: 0,
      max_score: 0,
      current_leader: 'None',
      competition_state: { status: 'WAITING', message: 'Tournament Ready' },
      question_counts: { r1: 50, r2: 31, r3: 30, total: 111 },
      recent_submissions: [],
      recent_violations: []
    });
  };

  // Load all admin data
  useEffect(() => {
    if (token) {
      loadAllAdminData();
      const interval = setInterval(loadAllAdminData, 8000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const loadAllAdminData = async () => {
    if (!stats) setDataLoading(true);
    setLoadError('');
    try {
      const [statsRes, teamsRes, qbRes, certsRes, settingsRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminTeams(),
        api.getQuestionBank(),
        api.getAdminCertificates(),
        api.getSettings()
      ]);

      // Detect expired or revoked JWT token
      if (statsRes?.error && (
        statsRes.error.toLowerCase().includes('expired') || 
        statsRes.error.toLowerCase().includes('authorization') || 
        statsRes.error.toLowerCase().includes('token') ||
        statsRes.error.toLowerCase().includes('invalid')
      )) {
        localStorage.removeItem('bughunt_admin_token');
        setToken('');
        setAuthError('Admin session expired. Please sign in with your credentials.');
        return;
      }

      if (statsRes.success) setStats(statsRes.stats);
      if (teamsRes.success) setTeams(teamsRes.teams || []);
      if (qbRes.success) setQuestionsBank(qbRes || { r1: [], r2: [], r3: [] });
      if (certsRes.success) setCertificatesList(certsRes.certificates || []);
      if (settingsRes.success) setEventSettings(settingsRes.settings || {});

      if (!statsRes.success && !stats) {
        setLoadError(statsRes.error || 'Failed to load tournament data. Please verify server connection.');
      }
    } catch (e) {
      console.error('Failed to refresh admin data:', e);
      if (!stats) {
        setLoadError('Cannot connect to backend server at http://localhost:5000.');
      }
    } finally {
      setDataLoading(false);
    }
  };

  const showBanner = (msg) => {
    setBannerMsg(msg);
    setTimeout(() => setBannerMsg(null), 4000);
  };

  // Competition Round Control Action
  const handleControl = async (action, round = 1, message = '') => {
    soundService.playClick();
    try {
      const res = await api.controlCompetition(action, round, message);
      if (res.success) {
        soundService.playCorrect();
        showBanner(`Tournament action executed: ${action}`);
        loadAllAdminData();
      }
    } catch (e) {
      alert('Failed to execute control action');
    }
  };

  // Team Action (Disqualify, Restore, Reset)
  const handleTeamAction = async (teamId, action, data = {}) => {
    soundService.playClick();
    try {
      const res = await api.executeTeamAction(teamId, action, data);
      if (res.success) {
        soundService.playCorrect();
        showBanner(`Team action executed: ${action}`);
        loadAllAdminData();
      }
    } catch (e) {
      alert(`Failed to execute ${action}`);
    }
  };

  // Adjust Score Submit
  const handleScoreAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!adjustScoreModal) return;
    await handleTeamAction(adjustScoreModal.team_id, 'adjust-score', { new_score: adjustScoreVal });
    setAdjustScoreModal(null);
  };

  // Projector Reveal Controller
  const handleProjectorReveal = async (state) => {
    soundService.playClick();
    try {
      const res = await api.setProjectorReveal(state);
      if (res.success) {
        soundService.playCorrect();
        showBanner(`Winner reveal triggered: ${state}`);
        loadAllAdminData();
      }
    } catch (e) {
      alert('Failed to set projector reveal');
    }
  };

  // Trigger Tournament Start Intro Video on Projector
  const handleTriggerProjectorIntro = async () => {
    soundService.playClick();
    try {
      const res = await api.triggerProjectorIntro();
      if (res.success) {
        soundService.playVictory();
        showBanner('🎬 Tournament launch video animation triggered on Projector screen!');
      }
    } catch (e) {
      alert('Failed to trigger projector intro');
    }
  };

  // Switch Stage Projector View Mode (Rules vs Scoreboard)
  const handleSetProjectorView = async (view) => {
    soundService.playClick();
    try {
      const res = await api.setProjectorView(view);
      if (res.success) {
        soundService.playCorrect();
        showBanner(`Stage projector view switched to ${view === 'rules' ? 'OFFICIAL RULES' : 'LIVE SCOREBOARD'}`);
      }
    } catch (e) {
      alert('Failed to switch projector view');
    }
  };

  // Certificates Generation
  const handleGenerateCerts = async (filter = 'all') => {
    soundService.playClick();
    try {
      const res = await api.generateCertificates(filter);
      if (res.success) {
        soundService.playCorrect();
        showBanner(res.message);
        loadAllAdminData();
      }
    } catch (e) {
      alert('Failed to generate certificates');
    }
  };

  // Lock Results
  const handleLockResults = async () => {
    if (!confirm('Are you sure you want to permanently lock final competition results?')) return;
    soundService.playClick();
    try {
      const res = await api.lockResults();
      if (res.success) {
        soundService.playCorrect();
        showBanner('Final tournament results permanently locked.');
        loadAllAdminData();
      }
    } catch (e) {
      alert('Failed to lock results');
    }
  };

  // Settings Update
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    soundService.playClick();
    try {
      const res = await api.updateSettings(eventSettings);
      if (res.success) {
        soundService.playCorrect();
        showBanner('Tournament branding and settings updated.');
      }
    } catch (e) {
      alert('Failed to save settings');
    }
  };

  // Change Admin Master Credentials
  const handleChangeCredentials = async (e) => {
    e.preventDefault();
    soundService.playClick();
    setCredMsg({ text: '', type: '' });

    if (credNewPassword !== credConfirmPassword) {
      setCredMsg({ text: 'New passwords do not match.', type: 'error' });
      soundService.playWrong();
      return;
    }

    if (credNewPassword.length < 6) {
      setCredMsg({ text: 'New password must be at least 6 characters long.', type: 'error' });
      soundService.playWrong();
      return;
    }

    setCredLoading(true);
    try {
      const res = await api.changeAdminPassword({
        current_password: credCurrentPassword,
        new_username: credNewUsername.trim() || undefined,
        new_password: credNewPassword
      });

      if (res.success) {
        soundService.playCorrect();
        setCredMsg({ text: res.message || 'Credentials updated successfully! Please re-login with your new credentials.', type: 'success' });
        setCredCurrentPassword('');
        setCredNewUsername('');
        setCredNewPassword('');
        setCredConfirmPassword('');
        showBanner('Admin credentials changed! Logging out for security...');
        setTimeout(() => {
          handleLogout();
        }, 2200);
      } else {
        soundService.playWrong();
        setCredMsg({ text: res.error || 'Failed to update credentials.', type: 'error' });
      }
    } catch (err) {
      soundService.playWrong();
      setCredMsg({ text: 'Network or server error while updating credentials.', type: 'error' });
    } finally {
      setCredLoading(false);
    }
  };

  // If not logged in, render Admin Login Card
  if (!token) {
    return (
      <div className="min-h-screen bg-cyber-dark text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl border border-slate-800 bg-slate-900/90 backdrop-blur shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7" />
          </div>

          <h2 className="text-2xl font-bold font-display text-center mb-1">
            Admin Control Center
          </h2>
          <p className="text-xs font-mono text-slate-400 text-center mb-6">
            Authorized tournament administrator authentication
          </p>

          {authError && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-400 text-xs font-mono mb-4 flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 shrink-0" />
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-slate-400 uppercase mb-1">Admin Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:border-rose-500 focus:outline-none"
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-slate-400 uppercase mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:border-rose-500 focus:outline-none"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-rose-500 text-white font-bold uppercase tracking-wider hover:bg-rose-600 transition flex items-center justify-center gap-2 shadow-[0_0_15px_#f43f5e40]"
            >
              <Lock className="w-4 h-4" />
              {loading ? 'Authenticating...' : 'Access Command Center'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={onBack}
              className="text-xs font-mono text-slate-500 hover:text-slate-300 flex items-center justify-center gap-1 mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to Competition Landing
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 10-Tab Admin Command Center Layout
  return (
    <div className="min-h-screen bg-cyber-dark text-slate-100 flex flex-col font-sans">
      
      {/* Top Admin Navbar */}
      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur px-6 py-3 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-rose-400" />
          <div>
            <h1 className="text-base font-bold font-display text-slate-100 flex items-center gap-2">
              BUG HUNT
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                ADMIN CONTROL CENTER
              </span>
            </h1>
          </div>
        </div>

        {/* Global Toast Notification */}
        {bannerMsg && (
          <div className="hidden md:block px-4 py-1.5 rounded-full bg-cyber-cyan/20 border border-cyber-cyan text-cyber-cyan text-xs font-mono font-bold animate-in fade-in">
            {bannerMsg}
          </div>
        )}

        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 font-mono text-xs hover:bg-slate-700 transition flex items-center gap-1.5"
              title="Return to Main Competition Site"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Home
            </button>
          )}

          <button
            onClick={() => window.open('/#projector', '_blank')}
            className="px-3 py-1.5 rounded-lg border border-purple-500/40 bg-purple-500/10 text-purple-300 font-mono text-xs hover:bg-purple-500/20 transition flex items-center gap-1.5"
            title="Open Stage Projector in New Window"
          >
            <Tv className="w-3.5 h-3.5" /> Projector View
          </button>

          <button
            onClick={onOpenLeaderboard}
            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 font-mono text-xs hover:bg-slate-700 transition flex items-center gap-1.5"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" /> Leaderboard
          </button>

          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Admin Workspace with 10 Tabs Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 border-r border-slate-800 bg-slate-950/60 p-4 space-y-1 font-mono text-xs shrink-0">
          {[
            { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
            { id: 'teams', name: 'Teams & Members', icon: Users, count: teams.length },
            { id: 'rounds', name: 'Round Controls', icon: Play },
            { id: 'questions', name: 'Question Bank', icon: HelpCircle, count: stats?.question_counts?.total },
            { id: 'monitor', name: 'Live Monitor', icon: Radio },
            { id: 'leaderboard', name: 'Leaderboard', icon: Trophy },
            { id: 'projector', name: 'Projector & Reveal', icon: Tv },
            { id: 'results', name: 'Results & Export', icon: FileSpreadsheet },
            { id: 'certificates', name: 'Certificates', icon: Award, count: certificatesList.length },
            { id: 'settings', name: 'Event Settings', icon: Settings }
          ].map(item => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { soundService.playClick(); setTab(item.id); }}
                className={`w-full px-3.5 py-2.5 rounded-xl border flex items-center justify-between font-medium transition text-left ${
                  active 
                    ? 'border-cyber-cyan bg-cyber-cyan/15 text-cyber-cyan font-bold' 
                    : 'border-transparent text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </div>
                {item.count !== undefined && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Tab Content Area */}
        <main className="flex-1 p-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
          
          {/* Loading Indicator */}
          {dataLoading && !stats && (
            <div className="py-20 flex flex-col items-center justify-center font-mono space-y-3">
              <div className="w-10 h-10 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-400">Loading Tournament Metrics & Controls...</p>
            </div>
          )}

          {/* Connection / Load Error */}
          {loadError && !stats && (
            <div className="p-6 rounded-2xl border border-rose-500/40 bg-rose-500/10 font-mono text-xs space-y-3 max-w-lg mx-auto mt-10">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertOctagon className="w-5 h-5" />
                <span>Failed to Load Tournament Data</span>
              </div>
              <p className="text-slate-300">{loadError}</p>
              <div className="pt-2 flex gap-3">
                <button
                  onClick={loadAllAdminData}
                  className="px-4 py-2 rounded-xl bg-rose-500 text-white font-bold hover:bg-rose-600 transition"
                >
                  Retry Connection
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}

          {/* TAB 1: DASHBOARD */}
          {tab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
                <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/80">
                  <span className="text-slate-500 text-[11px] block uppercase">Registered Teams</span>
                  <span className="text-2xl font-extrabold text-slate-100">{stats.total_teams}</span>
                </div>
                <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/80">
                  <span className="text-slate-500 text-[11px] block uppercase">Active Teams</span>
                  <span className="text-2xl font-extrabold text-cyber-cyan">{stats.active_teams}</span>
                </div>
                <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/80">
                  <span className="text-slate-500 text-[11px] block uppercase">Current Leader</span>
                  <span className="text-sm font-extrabold text-amber-400 truncate block mt-1">{stats.current_leader}</span>
                </div>
                <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/80">
                  <span className="text-slate-500 text-[11px] block uppercase">Average Score</span>
                  <span className="text-2xl font-extrabold text-cyber-green">{stats.average_score} <span className="text-xs text-slate-500 font-normal">/ 50</span></span>
                </div>
              </div>

              {/* Tournament State Banner */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950 font-mono text-xs flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-slate-500 uppercase block mb-1">Current Tournament Status</span>
                  <div className="text-lg font-bold text-cyber-cyan flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyber-cyan animate-ping" />
                    {stats.competition_state?.status} {stats.competition_state?.is_paused ? '(PAUSED)' : ''}
                  </div>
                  <p className="text-slate-400 mt-1">{stats.competition_state?.message}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleControl('PAUSE')}
                    className="px-4 py-2 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 font-bold hover:bg-amber-500/20"
                  >
                    Pause Tournament
                  </button>
                  <button
                    onClick={() => handleControl('RESUME')}
                    className="px-4 py-2 rounded-xl border border-cyber-green/40 bg-cyber-green/10 text-cyber-green font-bold hover:bg-cyber-green/20"
                  >
                    Resume Tournament
                  </button>
                </div>
              </div>

              {/* Recent Submissions & Violations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
                
                {/* Recent Submissions */}
                <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-3">
                  <h3 className="font-bold text-slate-200 flex items-center justify-between">
                    <span>Recent Submissions</span>
                    <span className="text-[10px] text-slate-500">Live feed</span>
                  </h3>
                  <div className="space-y-2">
                    {stats.recent_submissions?.length === 0 ? (
                      <p className="text-slate-500">No submissions recorded yet.</p>
                    ) : (
                      stats.recent_submissions?.map(s => (
                        <div key={s.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-200">{s.team_name}</span>
                            <span className="text-[10px] text-slate-500 ml-2">Round {s.round_num} • Task #{s.task_index + 1}</span>
                          </div>
                          <span className={s.score_awarded > 0 ? 'text-cyber-green font-bold' : 'text-slate-500'}>
                            +{s.score_awarded} pts
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Recent Violations */}
                <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-3">
                  <h3 className="font-bold text-slate-200 flex items-center justify-between">
                    <span>Anti-Cheating Violations</span>
                    <span className="text-[10px] text-rose-400">Security flags</span>
                  </h3>
                  <div className="space-y-2">
                    {stats.recent_violations?.length === 0 ? (
                      <p className="text-slate-500">Zero security violations detected.</p>
                    ) : (
                      stats.recent_violations?.map(v => (
                        <div key={v.id} className="p-2.5 rounded-lg bg-slate-950 border border-rose-500/30 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-rose-400">{v.team_name}</span>
                            <span className="text-[10px] text-slate-500 ml-2">{v.violation_type}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-400 font-bold">
                            Strike {v.strike_number} / 3
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: TEAMS MANAGEMENT */}
          {tab === 'teams' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-100">
                  Registered Competition Teams ({teams.length})
                </h2>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden">
                <div className="grid grid-cols-12 px-4 py-3 bg-slate-950 border-b border-slate-800 font-bold text-slate-400 uppercase text-[11px]">
                  <div className="col-span-3">TEAM / CODE</div>
                  <div className="col-span-3">STUDENT ROSTER (4)</div>
                  <div className="col-span-2 text-center">SCORES (R1/R2/R3)</div>
                  <div className="col-span-1 text-center">TOTAL</div>
                  <div className="col-span-1 text-center">STATUS</div>
                  <div className="col-span-2 text-right">ACTIONS</div>
                </div>

                <div className="divide-y divide-slate-800/60">
                  {teams.map(t => (
                    <div key={t.team_id} className="grid grid-cols-12 px-4 py-3 items-center">
                      <div className="col-span-3">
                        <strong className="text-slate-100 block">{t.team_name}</strong>
                        <span className="text-[10px] text-slate-500">{t.team_id} • {t.department} • Pass: {t.pass_code}</span>
                      </div>

                      <div className="col-span-3 text-[11px] text-slate-300">
                        {t.members?.map((m, i) => (
                          <div key={i} className="truncate">
                            {i + 1}. {m.name}
                          </div>
                        ))}
                      </div>

                      <div className="col-span-2 text-center text-slate-300">
                        <span className="text-cyber-cyan">{t.r1_score || 0}</span> / <span className="text-amber-400">{t.r2_score || 0}</span> / <span className="text-cyber-green">{t.r3_score || 0}</span>
                      </div>

                      <div className="col-span-1 text-center font-extrabold text-sm text-cyber-green">
                        {t.final_score || 0}
                      </div>

                      <div className="col-span-1 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.is_disqualified ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {t.status}
                        </span>
                      </div>

                      <div className="col-span-2 flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => { setAdjustScoreModal(t); setAdjustScoreVal(t.final_score); }}
                          className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 text-[10px]"
                        >
                          Score
                        </button>

                        {!t.is_disqualified ? (
                          <button
                            onClick={() => handleTeamAction(t.team_id, 'disqualify', { reason: 'Admin Disqualification' })}
                            className="px-2 py-1 rounded bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 text-[10px]"
                          >
                            DQ
                          </button>
                        ) : (
                          <button
                            onClick={() => handleTeamAction(t.team_id, 'restore')}
                            className="px-2 py-1 rounded bg-cyber-green/20 text-cyber-green hover:bg-cyber-green/30 text-[10px]"
                          >
                            Restore
                          </button>
                        )}

                        <button
                          onClick={() => handleTeamAction(t.team_id, 'reset-session')}
                          className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-[10px]"
                          title="Reset team round progress"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: ROUND CONTROLS */}
          {tab === 'rounds' && (
            <div className="space-y-6 font-mono text-xs max-w-4xl">
              <h2 className="text-base font-bold text-slate-100">
                Official Tournament Round Controls
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Round 1 Card */}
                <div className="p-5 rounded-2xl border border-cyber-cyan/40 bg-slate-900/80 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-cyber-cyan text-sm">ROUND 1</span>
                    <span className="text-[10px] text-slate-400">10 Marks</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    10 MCQs across C, C++, Java, Python, HTML. 30s per question.
                  </p>
                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() => handleControl('START_ROUND', 1)}
                      className="flex-1 py-2 rounded-xl bg-cyber-cyan text-slate-950 font-bold hover:bg-cyber-cyan/80 transition"
                    >
                      START R1
                    </button>
                    <button
                      onClick={() => handleControl('LOCK_ROUND', 1)}
                      className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                    >
                      LOCK R1
                    </button>
                  </div>
                </div>

                {/* Round 2 Card */}
                <div className="p-5 rounded-2xl border border-amber-400/40 bg-slate-900/80 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-amber-400 text-sm">ROUND 2</span>
                    <span className="text-[10px] text-slate-400">15 Marks</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    3 Java Bug Challenges. Select Buggy Line & Bug Type.
                  </p>
                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() => handleControl('START_ROUND', 2)}
                      className="flex-1 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold hover:bg-amber-300 transition"
                    >
                      START R2
                    </button>
                    <button
                      onClick={() => handleControl('LOCK_ROUND', 2)}
                      className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                    >
                      LOCK R2
                    </button>
                  </div>
                </div>

                {/* Round 3 Card */}
                <div className="p-5 rounded-2xl border border-cyber-green/40 bg-slate-900/80 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-cyber-green text-sm">ROUND 3</span>
                    <span className="text-[10px] text-slate-400">25 Marks</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    2 Python Debugging & Code Fix Challenges with Real Execution.
                  </p>
                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() => handleControl('START_ROUND', 3)}
                      className="flex-1 py-2 rounded-xl bg-cyber-green text-slate-950 font-bold hover:bg-cyber-green/80 transition"
                    >
                      START R3
                    </button>
                    <button
                      onClick={() => handleControl('LOCK_ROUND', 3)}
                      className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                    >
                      LOCK R3
                    </button>
                  </div>
                </div>

              </div>

              {/* Tournament Flow Control */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950 space-y-4">
                <h3 className="font-bold text-slate-200">Global Tournament Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleControl('PAUSE')}
                    className="px-5 py-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 font-bold"
                  >
                    Pause Entire Competition
                  </button>
                  <button
                    onClick={() => handleControl('RESUME')}
                    className="px-5 py-2.5 rounded-xl border border-cyber-green/40 bg-cyber-green/10 text-cyber-green hover:bg-cyber-green/20 font-bold"
                  >
                    Resume Competition
                  </button>
                  <button
                    onClick={() => handleControl('END')}
                    className="px-5 py-2.5 rounded-xl border border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 font-bold"
                  >
                    End Tournament & Finalize
                  </button>
                  <button
                    onClick={() => handleControl('RESET_TOURNAMENT')}
                    className="px-5 py-2.5 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 font-bold"
                  >
                    Reset All Tournament Data
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: QUESTION BANK STUDIO */}
          {tab === 'questions' && (
            <QuestionBankEditor
              questionsBank={questionsBank}
              onRefresh={loadAllAdminData}
              showBanner={showBanner}
            />
          )}

          {/* TAB 5: LIVE MONITOR */}
          {tab === 'monitor' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Radio className="w-5 h-5 text-cyber-cyan animate-pulse" />
                  Live Team Monitor Grid
                </h2>
                <span className="text-slate-400">Real-time status updates</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {teams.map(t => (
                  <div key={t.team_id} className={`p-4 rounded-2xl border bg-slate-900/80 space-y-2 ${
                    t.is_disqualified ? 'border-rose-600/50 bg-rose-950/10' : 'border-slate-800'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-100 truncate">{t.team_name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.is_disqualified ? 'bg-rose-500/20 text-rose-400' : 'bg-cyber-green/20 text-cyber-green'
                      }`}>
                        {t.status}
                      </span>
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>ID: {t.team_id}</span>
                      <span>Strikes: {t.violations_count || 0} / 3</span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 flex justify-between items-center text-xs">
                      <span>Total Score:</span>
                      <span className="text-cyber-green font-bold text-sm">{t.final_score || 0} / 50</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: LEADERBOARD VIEW */}
          {tab === 'leaderboard' && (
            <div className="space-y-4 font-mono text-xs">
              <h2 className="text-base font-bold text-slate-100">Live Rankings</h2>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden">
                <div className="grid grid-cols-12 px-4 py-3 bg-slate-950 border-b border-slate-800 font-bold text-slate-400">
                  <div className="col-span-1 text-center">RANK</div>
                  <div className="col-span-4">TEAM</div>
                  <div className="col-span-2 text-center text-cyber-cyan">R1 (/10)</div>
                  <div className="col-span-2 text-center text-amber-400">R2 (/15)</div>
                  <div className="col-span-1 text-center text-cyber-green">R3 (/25)</div>
                  <div className="col-span-2 text-right">FINAL (/50)</div>
                </div>
                <div className="divide-y divide-slate-800/60">
                  {teams.map((t, idx) => (
                    <div key={t.team_id} className="grid grid-cols-12 px-4 py-2.5 items-center">
                      <div className="col-span-1 text-center font-bold">{idx + 1}</div>
                      <div className="col-span-4 font-bold text-slate-200">{t.team_name}</div>
                      <div className="col-span-2 text-center">{t.r1_score || 0}</div>
                      <div className="col-span-2 text-center">{t.r2_score || 0}</div>
                      <div className="col-span-1 text-center">{t.r3_score || 0}</div>
                      <div className="col-span-2 text-right font-bold text-cyber-green">{t.final_score || 0}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: PROJECTOR & REVEAL */}
          {tab === 'projector' && (
            <div className="space-y-6 font-mono text-xs max-w-2xl">
              <h2 className="text-base font-bold text-slate-100">
                Auditorium Projector & Winner Reveal Controller
              </h2>

              <div className="p-5 rounded-2xl border border-purple-500/40 bg-slate-900/80 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-purple-300">Auditorium Projector Display</span>
                  <button
                    onClick={() => window.open('/#projector', '_blank')}
                    className="px-4 py-1.5 rounded-xl bg-purple-500 text-white font-bold hover:bg-purple-600 transition"
                  >
                    Open Projector Window
                  </button>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Opens the full-screen 1080p/4K read-only leaderboard designed for the auditorium stage projector or LED screen.
                </p>
              </div>

              {/* Tournament Start Video Animation Controller */}
              <div className="p-5 rounded-2xl border border-amber-500/40 bg-slate-900/80 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-amber-300">🎬 Tournament Start Video Animation</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      intro.mp4 Loaded
                    </span>
                  </div>
                  <button
                    onClick={handleTriggerProjectorIntro}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold hover:brightness-110 shadow-lg shadow-amber-500/20 flex items-center gap-2 transition active:scale-95 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Play Intro on Projector</span>
                  </button>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Sends a real-time signal to play the full-screen cinematic intro video (<code className="text-cyber-cyan">/intro.mp4</code>) on the stage projector. When the video ends, it seamlessly displays the official Rules of Bug Hunt briefing.
                </p>
              </div>

              {/* Stage Projector View Controller */}
              <div className="p-5 rounded-2xl border border-slate-700 bg-slate-900/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                      <Tv className="w-4 h-4 text-cyber-cyan" />
                      <span>Stage Projector Screen Display Mode</span>
                    </h3>
                    <p className="text-slate-400 text-[11px]">
                      Switch between the Official Competition Rules and the Live Scoreboard on the auditorium screen in real-time.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSetProjectorView('rules')}
                      className="px-3.5 py-2 rounded-xl border border-cyber-cyan/40 bg-cyber-cyan/15 text-cyber-cyan hover:bg-cyber-cyan/25 font-mono text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>📋 Show Rules on Projector</span>
                    </button>
                    <button
                      onClick={() => handleSetProjectorView('scoreboard')}
                      className="px-3.5 py-2 rounded-xl border border-cyber-green/40 bg-cyber-green/15 text-cyber-green hover:bg-cyber-green/25 font-mono text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                    >
                      <Trophy className="w-3.5 h-3.5" />
                      <span>📊 Show Scoreboard</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Sequential Winner Reveal Steps */}
              <div className="p-5 rounded-2xl border border-amber-500/40 bg-slate-900/80 space-y-4">
                <h3 className="font-bold text-amber-300 text-sm">Sequential Winner Reveal Mode</h3>
                <p className="text-slate-400 text-[11px]">
                  After results are locked, trigger the sequential reveal on the auditorium screen:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => handleProjectorReveal('THIRD_PLACE')}
                    className="p-3 rounded-xl border border-amber-700/60 bg-amber-800/20 text-amber-500 font-bold hover:bg-amber-800/30"
                  >
                    🥉 Reveal 3rd Place
                  </button>

                  <button
                    onClick={() => handleProjectorReveal('SECOND_PLACE')}
                    className="p-3 rounded-xl border border-slate-600 bg-slate-700/20 text-slate-300 font-bold hover:bg-slate-700/30"
                  >
                    🥈 Reveal 2nd Place
                  </button>

                  <button
                    onClick={() => handleProjectorReveal('WINNER')}
                    className="p-3 rounded-xl border border-amber-400 bg-amber-500/20 text-amber-400 font-bold hover:bg-amber-500/30"
                  >
                    🏆 Reveal Champion
                  </button>

                  <button
                    onClick={() => handleProjectorReveal('NONE')}
                    className="p-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-500 font-bold hover:text-slate-300"
                  >
                    Hide Reveal Banner
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 8: RESULTS & EXPORT */}
          {tab === 'results' && (
            <div className="space-y-6 font-mono text-xs max-w-2xl">
              <h2 className="text-base font-bold text-slate-100">
                Tournament Results Management
              </h2>

              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4">
                <h3 className="font-bold text-slate-200">Results Lockdown & Export</h3>
                <p className="text-slate-400 text-[11px]">
                  Locking results seals the final scores, prevents further submissions, and enables certificate generation.
                </p>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleLockResults}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition"
                  >
                    Lock Final Results
                  </button>

                  <a
                    href="/api/admin/export-csv"
                    className="px-5 py-2.5 rounded-xl border border-cyber-cyan/50 bg-cyber-cyan/10 text-cyber-cyan font-bold hover:bg-cyber-cyan/20 transition flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Download Results CSV
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: CERTIFICATES */}
          {tab === 'certificates' && (
            <div className="space-y-6 font-mono text-xs">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-base font-bold text-slate-100">
                  Official Certificates Management ({certificatesList.length})
                </h2>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleGenerateCerts('all')}
                    className="px-4 py-2 rounded-xl bg-cyber-green text-slate-950 font-bold hover:bg-cyber-green/80"
                  >
                    Generate All Certificates
                  </button>
                  <button
                    onClick={() => handleGenerateCerts('winners')}
                    className="px-4 py-2 rounded-xl border border-amber-400 bg-amber-500/10 text-amber-300 font-bold hover:bg-amber-500/20"
                  >
                    Generate Winners
                  </button>
                  <a
                    href="/api/admin/certificates/export-zip"
                    className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 font-bold hover:bg-slate-700 flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Download ZIP
                  </a>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden">
                <div className="grid grid-cols-12 px-4 py-3 bg-slate-950 border-b border-slate-800 font-bold text-slate-400 text-[11px]">
                  <div className="col-span-2">CERT ID</div>
                  <div className="col-span-3">STUDENT NAME</div>
                  <div className="col-span-3">TEAM</div>
                  <div className="col-span-2">ACHIEVEMENT</div>
                  <div className="col-span-1 text-center">SCORE</div>
                  <div className="col-span-1 text-right">PREVIEW</div>
                </div>

                <div className="divide-y divide-slate-800/60 max-h-96 overflow-y-auto">
                  {certificatesList.map(c => (
                    <div key={c.id} className="grid grid-cols-12 px-4 py-2.5 items-center">
                      <div className="col-span-2 text-cyber-cyan font-bold">{c.certificate_id}</div>
                      <div className="col-span-3 font-bold text-slate-200">{c.student_name}</div>
                      <div className="col-span-3 text-slate-400">{c.team_name}</div>
                      <div className="col-span-2 text-amber-400">{c.achievement}</div>
                      <div className="col-span-1 text-center text-cyber-green font-bold">{c.final_score}</div>
                      <div className="col-span-1 text-right">
                        <button
                          onClick={() => setPreviewCert(c)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: SETTINGS */}
          {tab === 'settings' && (
            <div className="max-w-2xl space-y-6 font-mono text-xs">
              <h2 className="text-base font-bold text-slate-100">
                Tournament & Certificate Settings
              </h2>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label className="block text-slate-400 uppercase mb-1">College / Institute Name</label>
                  <input
                    type="text"
                    value={eventSettings.college_name || ''}
                    onChange={(e) => setEventSettings({ ...eventSettings, college_name: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 uppercase mb-1">Department</label>
                  <input
                    type="text"
                    value={eventSettings.department || ''}
                    onChange={(e) => setEventSettings({ ...eventSettings, department: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 uppercase mb-1">Event Name</label>
                    <input
                      type="text"
                      value={eventSettings.event_name || ''}
                      onChange={(e) => setEventSettings({ ...eventSettings, event_name: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 uppercase mb-1">Competition Date</label>
                    <input
                      type="text"
                      value={eventSettings.competition_date || ''}
                      onChange={(e) => setEventSettings({ ...eventSettings, competition_date: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-slate-400 uppercase mb-1 text-[10px]">Coordinator Signature</label>
                    <input
                      type="text"
                      value={eventSettings.coordinator_name || ''}
                      onChange={(e) => setEventSettings({ ...eventSettings, coordinator_name: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 uppercase mb-1 text-[10px]">HOD Signature</label>
                    <input
                      type="text"
                      value={eventSettings.hod_name || ''}
                      onChange={(e) => setEventSettings({ ...eventSettings, hod_name: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 uppercase mb-1 text-[10px]">Principal Signature</label>
                    <input
                      type="text"
                      value={eventSettings.principal_name || ''}
                      onChange={(e) => setEventSettings({ ...eventSettings, principal_name: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-cyber-green text-slate-950 font-bold hover:bg-cyber-green/80 transition"
                >
                  Save All Settings
                </button>
              </form>

              {/* Administrator Security & Password Change */}
              <div className="p-6 rounded-2xl border border-rose-500/30 bg-slate-900/80 space-y-4">
                <div className="flex items-center gap-3 text-rose-400">
                  <Shield className="w-5 h-5 shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">Administrator Security & Credentials</h3>
                    <p className="text-[11px] text-slate-400">Change organizer master credentials. Keep these confidential.</p>
                  </div>
                </div>

                {credMsg.text && (
                  <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    credMsg.type === 'success' 
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400' 
                      : 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                  }`}>
                    {credMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertOctagon className="w-4 h-4 shrink-0" />}
                    {credMsg.text}
                  </div>
                )}

                <form onSubmit={handleChangeCredentials} className="space-y-3">
                  <div>
                    <label className="block text-slate-400 uppercase mb-1 text-[11px]">Current Admin Password *</label>
                    <input
                      type="password"
                      value={credCurrentPassword}
                      onChange={(e) => setCredCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      required
                      className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:border-rose-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 uppercase mb-1 text-[11px]">New Username (Optional)</label>
                      <input
                        type="text"
                        value={credNewUsername}
                        onChange={(e) => setCredNewUsername(e.target.value)}
                        placeholder="Leave blank to keep current"
                        className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:border-rose-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 uppercase mb-1 text-[11px]">New Password (min 6 chars) *</label>
                      <input
                        type="password"
                        value={credNewPassword}
                        onChange={(e) => setCredNewPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        required
                        className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:border-rose-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 uppercase mb-1 text-[11px]">Confirm New Password *</label>
                    <input
                      type="password"
                      value={credConfirmPassword}
                      onChange={(e) => setCredConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      required
                      className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:border-rose-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={credLoading}
                    className="px-6 py-2.5 rounded-xl bg-rose-500 text-white font-bold hover:bg-rose-600 transition flex items-center gap-2 shadow-[0_0_15px_#f43f5e30]"
                  >
                    <Lock className="w-4 h-4" />
                    {credLoading ? 'Updating Credentials...' : 'Update Admin Credentials'}
                  </button>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Adjust Score Modal */}
      {adjustScoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 font-mono">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full space-y-4">
            <h3 className="font-bold text-slate-100">Adjust Score: {adjustScoreModal.team_name}</h3>
            <form onSubmit={handleScoreAdjustSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">New Final Score (0 - 50)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="50"
                  value={adjustScoreVal}
                  onChange={(e) => setAdjustScoreVal(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
                  required
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setAdjustScoreModal(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyber-cyan text-slate-950 font-bold text-xs"
                >
                  Save Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Certificate Preview Modal */}
      {previewCert && (
        <CertificateModal
          certificate={previewCert}
          settings={eventSettings}
          onClose={() => setPreviewCert(null)}
        />
      )}

    </div>
  );
}
