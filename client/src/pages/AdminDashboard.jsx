import React, { useState, useEffect } from 'react';
import {
  Shield, Key, Users, Trophy, Play, Pause, Square, RotateCcw,
  Download, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, Eye, EyeOff, Search, FileSpreadsheet
} from 'lucide-react';
import { api } from '../services/api';
import { playClick, playCorrect, playWrong } from '../audio/soundEffects';

export const AdminDashboard = ({ onCompetitionStatusChange }) => {
  const [token, setToken] = useState(localStorage.getItem('bughunt_admin_token') || '');
  const [credentials, setCredentials] = useState({ username: 'admin', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Dashboard Data
  const [activeTab, setActiveTab] = useState('overview'); // overview, questions, participants
  const [stats, setStats] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);

  // Question Modal State
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionFormData, setQuestionFormData] = useState({
    round_num: 1,
    language: 'C',
    difficulty: 'Easy',
    question_type: 'mcq',
    title: '',
    description: '',
    code_snippet: '',
    options: ['', '', '', ''],
    correct_answer: '',
    explanation: '',
    hint: '',
    points: 10,
    penalty: 2,
    time_limit_sec: 30
  });

  // Load Admin Data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const statsRes = await api.getAdminStats();
      setStats(statsRes.statistics);
      if (onCompetitionStatusChange) {
        onCompetitionStatusChange(statsRes.statistics.competition_status);
      }

      const qRes = await api.getAdminQuestions();
      setQuestions(qRes.questions || []);

      const pRes = await api.getAdminParticipants();
      setParticipants(pRes.participants || []);
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
      if (err.message?.includes('authorization') || err.message?.includes('expired')) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadDashboardData();
    }
  }, [token]);

  // Admin Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await api.adminLogin(credentials);
      localStorage.setItem('bughunt_admin_token', res.token);
      setToken(res.token);
      playCorrect();
    } catch (err) {
      playWrong();
      setLoginError(err.message || 'Invalid admin credentials');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    playClick();
    localStorage.removeItem('bughunt_admin_token');
    setToken('');
    setStats(null);
  };

  // Competition Control
  const handleSetCompetitionStatus = async (status, message = '') => {
    playClick();
    try {
      await api.setCompetitionStatus(status, message);
      await loadDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to update competition state');
    }
  };

  const handleResetCompetition = async () => {
    if (!window.confirm('WARNING: Are you sure you want to RESET the competition? All participants, scores, and answers will be cleared!')) {
      return;
    }
    playClick();
    try {
      await api.resetCompetition();
      await loadDashboardData();
      alert('Competition reset successfully.');
    } catch (err) {
      alert(err.message || 'Failed to reset competition');
    }
  };

  // Question CRUD Handlers
  const handleOpenAddQuestion = () => {
    playClick();
    setEditingQuestion(null);
    setQuestionFormData({
      round_num: 1,
      language: 'C',
      difficulty: 'Easy',
      question_type: 'mcq',
      title: '',
      description: '',
      code_snippet: '',
      options: ['', '', '', ''],
      correct_answer: '',
      explanation: '',
      hint: '',
      points: 10,
      penalty: 2,
      time_limit_sec: 30
    });
    setShowQuestionModal(true);
  };

  const handleOpenEditQuestion = (q) => {
    playClick();
    setEditingQuestion(q);
    setQuestionFormData({
      round_num: q.round_num,
      language: q.language,
      difficulty: q.difficulty,
      question_type: q.question_type,
      title: q.title,
      description: q.description,
      code_snippet: q.code_snippet,
      options: Array.isArray(q.options) ? q.options : ['', '', '', ''],
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      hint: q.hint,
      points: q.points,
      penalty: q.penalty,
      time_limit_sec: q.time_limit_sec
    });
    setShowQuestionModal(true);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    try {
      if (editingQuestion) {
        await api.updateQuestion(editingQuestion.id, questionFormData);
      } else {
        await api.createQuestion(questionFormData);
      }
      playCorrect();
      setShowQuestionModal(false);
      await loadDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to save question');
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Delete this question permanently?')) return;
    playClick();
    try {
      await api.deleteQuestion(id);
      await loadDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to delete question');
    }
  };

  // If not logged in, render Admin Login view
  if (!token) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 cyber-grid">
        <div className="w-full max-w-md bg-cyber-card border border-cyber-border rounded-2xl shadow-2xl p-8 backdrop-blur-md">
          
          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-xl bg-purple-950/40 border border-purple-500/40 text-purple-400 mb-3 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              <Shield className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">
              ADMIN CONTROL CENTER
            </h2>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Organizer Authentication Required
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-slate-300 font-bold mb-1.5 uppercase tracking-wider">
                Admin Username
              </label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                placeholder="admin"
                required
                className="w-full px-3 py-2.5 bg-[#0b1120] border border-slate-700 rounded-lg text-white font-sans text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1.5 uppercase tracking-wider">
                Admin Password
              </label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2.5 bg-[#0b1120] border border-slate-700 rounded-lg text-white font-sans text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full mt-2 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm uppercase rounded-lg shadow-lg transition-all"
            >
              {loginLoading ? 'AUTHENTICATING...' : 'ACCESS CONTROL PANEL'}
            </button>
          </form>

        </div>
      </div>
    );
  }

  // Logged-in Admin Dashboard
  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto cyber-grid">
      
      {/* Top Bar: Title & Competition Controller */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8 pb-6 border-b border-cyber-border">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-950/50 border border-purple-500/40 text-purple-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                ADMIN COMMAND CONSOLE
              </h1>
              <p className="text-xs font-mono text-slate-400">
                Live Tournament Management & Scoring Engine
              </p>
            </div>
          </div>
        </div>

        {/* Competition State Controls */}
        <div className="flex flex-wrap items-center gap-2 bg-cyber-card border border-slate-800 p-2 rounded-xl">
          <span className="text-xs font-mono font-bold px-2 text-slate-400 uppercase">
            STATUS: <strong className={
              stats?.competition_status === 'ACTIVE' ? 'text-cyber-neon' :
              stats?.competition_status === 'PAUSED' ? 'text-amber-400' :
              stats?.competition_status === 'ENDED' ? 'text-rose-400' : 'text-blue-400'
            }>{stats?.competition_status || 'ACTIVE'}</strong>
          </span>

          <button
            onClick={() => handleSetCompetitionStatus('ACTIVE', 'Competition is now live!')}
            title="Start / Resume Competition"
            className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25 flex items-center gap-1 transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            <span>START</span>
          </button>

          <button
            onClick={() => handleSetCompetitionStatus('PAUSED', 'Competition temporarily paused by organizer.')}
            title="Pause Competition"
            className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 flex items-center gap-1 transition-colors"
          >
            <Pause className="w-3.5 h-3.5" />
            <span>PAUSE</span>
          </button>

          <button
            onClick={() => handleSetCompetitionStatus('ENDED', 'Competition has officially ended.')}
            title="End Competition"
            className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-rose-500/15 border border-rose-500/40 text-rose-300 hover:bg-rose-500/25 flex items-center gap-1 transition-colors"
          >
            <Square className="w-3.5 h-3.5" />
            <span>END</span>
          </button>

          <button
            onClick={handleResetCompetition}
            title="Reset Competition Data"
            className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-2"
          >
            LOGOUT
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-8">
        
        <div className="bg-cyber-card border border-slate-800 rounded-xl p-4">
          <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1">
            TOTAL PARTICIPANTS
          </span>
          <span className="text-2xl sm:text-3xl font-black font-mono text-white">
            {stats?.total_participants ?? 0}
          </span>
        </div>

        <div className="bg-cyber-card border border-slate-800 rounded-xl p-4">
          <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1">
            ACTIVE PLAYERS
          </span>
          <span className="text-2xl sm:text-3xl font-black font-mono text-cyber-neon">
            {stats?.active_players ?? 0}
          </span>
        </div>

        <div className="bg-cyber-card border border-slate-800 rounded-xl p-4">
          <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1">
            TOTAL QUESTIONS
          </span>
          <span className="text-2xl sm:text-3xl font-black font-mono text-cyber-cyan">
            {stats?.total_questions ?? 0}
          </span>
        </div>

        <div className="bg-cyber-card border border-slate-800 rounded-xl p-4">
          <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1">
            AVERAGE SCORE
          </span>
          <span className="text-2xl sm:text-3xl font-black font-mono text-amber-400">
            {stats?.average_score ?? 0}
          </span>
        </div>

        <div className="bg-cyber-card border border-slate-800 rounded-xl p-4 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1">
            HIGHEST SCORE
          </span>
          <span className="text-2xl sm:text-3xl font-black font-mono text-purple-400">
            {stats?.highest_score ?? 0}
          </span>
        </div>

      </div>

      {/* Tabs Navigation & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2 bg-cyber-card border border-slate-800 p-1.5 rounded-xl text-xs font-mono">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'overview'
                ? 'bg-purple-600 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            PARTICIPANTS & SESSIONS
          </button>

          <button
            onClick={() => setActiveTab('questions')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'questions'
                ? 'bg-purple-600 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            QUESTIONS REPOSITORY ({questions.length})
          </button>
        </div>

        {/* Tab-specific actions */}
        <div className="flex items-center gap-2">
          {activeTab === 'questions' && (
            <button
              onClick={handleOpenAddQuestion}
              className="px-3.5 py-2 bg-gradient-to-r from-cyber-neon to-emerald-400 text-slate-950 font-bold text-xs font-mono rounded-lg shadow-neon-sm hover:shadow-neon-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>ADD QUESTION</span>
            </button>
          )}

          <a
            href={api.getExportCsvUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-cyber-card border border-slate-700 hover:border-slate-500 text-slate-200 font-bold text-xs font-mono rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-cyber-cyan" />
            <span>EXPORT CSV</span>
          </a>
        </div>
      </div>

      {/* TAB 1: Participants List */}
      {activeTab === 'overview' && (
        <div className="bg-cyber-card border border-cyber-border rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="bg-cyber-surface border-b border-cyber-border text-slate-400 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">PARTICIPANT ID</th>
                  <th className="py-3 px-4">NAME / TEAM</th>
                  <th className="py-3 px-4">COLLEGE</th>
                  <th className="py-3 px-4 text-center">ROUND</th>
                  <th className="py-3 px-4 text-right">SCORE</th>
                  <th className="py-3 px-4 text-center">BUGS</th>
                  <th className="py-3 px-4 text-center">TAB SWITCHES</th>
                  <th className="py-3 px-4 text-center">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {participants.length > 0 ? (
                  participants.map((p) => (
                    <tr key={p.participant_id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-bold text-cyber-neon">{p.participant_id}</td>
                      <td className="py-3 px-4">
                        <div className="text-white font-bold">{p.name}</div>
                        <div className="text-slate-400 text-[11px]">{p.team_name}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-sans">{p.college}</td>
                      <td className="py-3 px-4 text-center font-bold text-cyber-cyan">
                        R{p.current_round || 1}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-cyber-neon font-mono">
                        {p.score || 0}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-300">
                        {p.bugs_found || 0}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.tab_switches > 0
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'text-slate-500'
                        }`}>
                          {p.tab_switches || 0} VIOLATIONS
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          p.session_status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : p.session_status === 'in_progress'
                            ? 'bg-cyan-500/20 text-cyan-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {p.session_status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="py-10 text-center text-slate-500">
                      NO PARTICIPANTS RECORDED YET
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Questions Management */}
      {activeTab === 'questions' && (
        <div className="bg-cyber-card border border-cyber-border rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="bg-cyber-surface border-b border-cyber-border text-slate-400 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-12">ROUND</th>
                  <th className="py-3 px-4">TITLE & LANGUAGE</th>
                  <th className="py-3 px-4">DIFFICULTY</th>
                  <th className="py-3 px-4">TYPE</th>
                  <th className="py-3 px-4 text-right">POINTS</th>
                  <th className="py-3 px-4 text-right">TIMER</th>
                  <th className="py-3 px-4 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {questions.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-cyber-cyan">R{q.round_num}</td>
                    <td className="py-3 px-4">
                      <div className="text-white font-bold">{q.title}</div>
                      <div className="text-slate-400 text-[10px]">Lang: {q.language}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        q.difficulty === 'Easy'
                          ? 'text-emerald-400 bg-emerald-950/40'
                          : q.difficulty === 'Medium'
                          ? 'text-amber-400 bg-amber-950/40'
                          : 'text-rose-400 bg-rose-950/40'
                      }`}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 uppercase text-[10px]">{q.question_type}</td>
                    <td className="py-3 px-4 text-right text-cyber-neon font-bold">+{q.points} / -{q.penalty}</td>
                    <td className="py-3 px-4 text-right text-slate-300">{q.time_limit_sec}s</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditQuestion(q)}
                          className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white"
                          title="Edit Question"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-1.5 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                          title="Delete Question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-cyber-card border border-cyber-border rounded-2xl p-6 shadow-2xl">
            
            <h2 className="text-xl font-bold text-white mb-4 uppercase font-mono">
              {editingQuestion ? 'EDIT QUESTION' : 'ADD NEW QUESTION'}
            </h2>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs font-mono">
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">ROUND</label>
                  <select
                    value={questionFormData.round_num}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, round_num: Number(e.target.value) })}
                    className="w-full bg-[#0b1120] border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value={1}>Round 1 (Spot The Bug)</option>
                    <option value={2}>Round 2 (Debug It)</option>
                    <option value={3}>Round 3 (Bug Hunt)</option>
                    <option value={4}>Round 4 (Boss Bug)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">LANGUAGE</label>
                  <select
                    value={questionFormData.language}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, language: e.target.value })}
                    className="w-full bg-[#0b1120] border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="C">C</option>
                    <option value="C++">C++</option>
                    <option value="Java">Java</option>
                    <option value="Python">Python</option>
                    <option value="JavaScript">JavaScript</option>
                    <option value="HTML/CSS">HTML/CSS</option>
                    <option value="SQL">SQL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">DIFFICULTY</label>
                  <select
                    value={questionFormData.difficulty}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, difficulty: e.target.value })}
                    className="w-full bg-[#0b1120] border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">TYPE</label>
                  <select
                    value={questionFormData.question_type}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, question_type: e.target.value })}
                    className="w-full bg-[#0b1120] border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="mcq">MCQ</option>
                    <option value="debug_fix">Debug Fix</option>
                    <option value="multi_bug">Multi-Bug</option>
                    <option value="boss_bug">Boss Bug</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">TITLE</label>
                <input
                  type="text"
                  value={questionFormData.title}
                  onChange={(e) => setQuestionFormData({ ...questionFormData, title: e.target.value })}
                  placeholder="e.g. Division Danger"
                  required
                  className="w-full bg-[#0b1120] border border-slate-700 rounded-lg p-2 text-white font-sans"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">DESCRIPTION / QUESTION PROMPT</label>
                <textarea
                  rows={2}
                  value={questionFormData.description}
                  onChange={(e) => setQuestionFormData({ ...questionFormData, description: e.target.value })}
                  className="w-full bg-[#0b1120] border border-slate-700 rounded-lg p-2 text-white font-sans"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">CODE SNIPPET</label>
                <textarea
                  rows={5}
                  value={questionFormData.code_snippet}
                  onChange={(e) => setQuestionFormData({ ...questionFormData, code_snippet: e.target.value })}
                  required
                  className="w-full bg-[#0b1120] border border-slate-700 rounded-lg p-2 text-white font-mono text-xs leading-relaxed"
                />
              </div>

              {/* Options */}
              <div>
                <label className="block text-slate-400 mb-1">OPTIONS (1 PER LINE)</label>
                <div className="space-y-2">
                  {questionFormData.options.map((opt, idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...questionFormData.options];
                        newOpts[idx] = e.target.value;
                        setQuestionFormData({ ...questionFormData, options: newOpts });
                      }}
                      placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                      className="w-full bg-[#0b1120] border border-slate-700 rounded-lg p-2 text-white"
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">CORRECT ANSWER (EXACT STRING OR JSON FOR MULTI-BUG)</label>
                <input
                  type="text"
                  value={questionFormData.correct_answer}
                  onChange={(e) => setQuestionFormData({ ...questionFormData, correct_answer: e.target.value })}
                  required
                  className="w-full bg-[#0b1120] border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">EXPLANATION</label>
                <textarea
                  rows={2}
                  value={questionFormData.explanation}
                  onChange={(e) => setQuestionFormData({ ...questionFormData, explanation: e.target.value })}
                  required
                  className="w-full bg-[#0b1120] border border-slate-700 rounded-lg p-2 text-white font-sans"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">POINTS</label>
                  <input
                    type="number"
                    value={questionFormData.points}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, points: Number(e.target.value) })}
                    className="w-full bg-[#0b1120] border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">PENALTY</label>
                  <input
                    type="number"
                    value={questionFormData.penalty}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, penalty: Number(e.target.value) })}
                    className="w-full bg-[#0b1120] border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">TIME LIMIT (SEC)</label>
                  <input
                    type="number"
                    value={questionFormData.time_limit_sec}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, time_limit_sec: Number(e.target.value) })}
                    className="w-full bg-[#0b1120] border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  SAVE QUESTION
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
