import React, { useState, useMemo } from 'react';
import { 
  Bug, Plus, Search, Filter, Edit3, Trash2, Copy, CheckCircle2, 
  XCircle, Eye, EyeOff, AlertTriangle, Code2, Sparkles, Check, 
  ChevronDown, ChevronUp, Play, HelpCircle, Layers, FileCode,
  Upload, Download, FileSpreadsheet
} from 'lucide-react';
import { api } from '../services/api';
import { soundService } from '../services/sound';

export const JAVA_BUG_TYPES = [
  'Syntax Error',
  'Compilation Error',
  'Logical Error',
  'Runtime Error',
  'Exception',
  'OOP Error'
];

export const R1_LANGUAGES = ['C', 'C++', 'Java', 'Python', 'HTML'];
export const R1_DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export default function QuestionBankEditor({ questionsBank = { r1: [], r2: [], r3: [] }, onRefresh, showBanner }) {
  const [activeRound, setActiveRound] = useState('r1'); // 'r1' | 'r2' | 'r3'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLang, setFilterLang] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'INACTIVE'
  const [filterBugType, setFilterBugType] = useState('ALL');

  // Modals state
  const [editModal, setEditModal] = useState(null); // { mode: 'create' | 'edit', round: 'r1' | 'r2' | 'r3', data: {} }
  const [deleteModal, setDeleteModal] = useState(null); // { round: 'r1' | 'r2' | 'r3', item: {} }
  const [saving, setSaving] = useState(false);
  const [testRunResult, setTestRunResult] = useState(null);
  const [testingCode, setTestingCode] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  // CSV Import State
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [csvFileName, setCsvFileName] = useState('');
  const [csvImportMode, setCsvImportMode] = useState('append'); // 'append' | 'replace'
  const [csvPreviewCount, setCsvPreviewCount] = useState(0);
  const [importingCsv, setImportingCsv] = useState(false);
  const [csvError, setCsvError] = useState('');

  // Filtered lists
  const currentList = useMemo(() => {
    const list = questionsBank[activeRound] || [];
    return list.filter(item => {
      // Search filter
      const q = searchQuery.toLowerCase().trim();
      let matchesSearch = true;
      if (q) {
        const title = (item.title || '').toLowerCase();
        const desc = (item.description || item.question_text || '').toLowerCase();
        const code = (item.challenge_code || item.code_snippet || item.buggy_code || '').toLowerCase();
        const bugType = (item.bug_type || '').toLowerCase();
        matchesSearch = title.includes(q) || desc.includes(q) || code.includes(q) || bugType.includes(q);
      }

      // Status filter
      let matchesStatus = true;
      if (filterStatus === 'ACTIVE') matchesStatus = Boolean(item.is_active);
      if (filterStatus === 'INACTIVE') matchesStatus = !Boolean(item.is_active);

      // Language filter (Round 1)
      let matchesLang = true;
      if (activeRound === 'r1' && filterLang !== 'ALL') {
        matchesLang = item.language === filterLang;
      }

      // Bug type filter (Round 2 & 3)
      let matchesBugType = true;
      if ((activeRound === 'r2' || activeRound === 'r3') && filterBugType !== 'ALL') {
        matchesBugType = (item.bug_type || '').toLowerCase() === filterBugType.toLowerCase();
      }

      return matchesSearch && matchesStatus && matchesLang && matchesBugType;
    });
  }, [questionsBank, activeRound, searchQuery, filterLang, filterStatus, filterBugType]);

  // Status counts
  const counts = useMemo(() => {
    const r1 = questionsBank.r1 || [];
    const r2 = questionsBank.r2 || [];
    const r3 = questionsBank.r3 || [];
    return {
      r1Total: r1.length,
      r1Active: r1.filter(q => q.is_active).length,
      r2Total: r2.length,
      r2Active: r2.filter(q => q.is_active).length,
      r3Total: r3.length,
      r3Active: r3.filter(q => q.is_active).length
    };
  }, [questionsBank]);

  // Toggle active / inactive
  const handleToggle = async (round, id) => {
    soundService.playClick();
    try {
      const res = await api.toggleQuestionStatus(round, id);
      if (res.success) {
        showBanner?.(res.message || 'Status updated successfully.');
        onRefresh?.();
      } else {
        alert(res.error || 'Failed to toggle status.');
      }
    } catch (e) {
      alert('Error updating status: ' + e.message);
    }
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    soundService.playClick();
    setTestRunResult(null);
    if (activeRound === 'r1') {
      setEditModal({
        mode: 'create',
        round: 'r1',
        data: {
          language: 'C',
          difficulty: 'Easy',
          title: '',
          question_text: '',
          code_snippet: '',
          options: ['', '', '', ''],
          correct_option_index: 0,
          explanation: '',
          is_active: 1
        }
      });
    } else if (activeRound === 'r2') {
      const nextNum = (questionsBank.r2?.length || 0) + 1;
      setEditModal({
        mode: 'create',
        round: 'r2',
        data: {
          challenge_code: `JAVA-${String(nextNum).padStart(3, '0')}`,
          title: '',
          description: '',
          code_snippet: `public class Solution {\n    public static void main(String[] args) {\n        // Buggy line here\n    }\n}`,
          buggy_line: 1,
          bug_type: 'Logical Error',
          explanation: '',
          is_active: 1
        }
      });
    } else if (activeRound === 'r3') {
      const nextNum = (questionsBank.r3?.length || 0) + 1;
      setEditModal({
        mode: 'create',
        round: 'r3',
        data: {
          challenge_code: `PY-${String(nextNum).padStart(3, '0')}`,
          title: '',
          description: '',
          expected_behavior: '',
          input_format: 'Standard Input',
          output_format: 'Standard Output',
          constraints: '1 <= N <= 10^5',
          buggy_code: `def solve():\n    # Implement here\n    pass\n\nif __name__ == '__main__':\n    solve()\n`,
          canonical_solution: `def solve():\n    # Fixed code here\n    pass\n\nif __name__ == '__main__':\n    solve()\n`,
          faulty_line: 2,
          bug_type: 'Logical Error',
          visible_tests: [{ input: '1\n', expected_output: '1' }],
          hidden_tests: [{ input: '2\n', expected_output: '2' }],
          is_active: 1
        }
      });
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    soundService.playClick();
    setTestRunResult(null);
    let itemData = { ...item };
    if (activeRound === 'r1') {
      let opts = item.options;
      if (!Array.isArray(opts)) {
        try { opts = JSON.parse(item.options_json); } catch (e) { opts = ['', '', '', '']; }
      }
      while (opts.length < 4) opts.push('');
      itemData.options = opts;
    } else if (activeRound === 'r3') {
      let vTests = item.visible_tests;
      let hTests = item.hidden_tests;
      if (!Array.isArray(vTests)) {
        try { vTests = JSON.parse(item.visible_tests_json); } catch (e) { vTests = []; }
      }
      if (!Array.isArray(hTests)) {
        try { hTests = JSON.parse(item.hidden_tests_json); } catch (e) { hTests = []; }
      }
      itemData.visible_tests = vTests;
      itemData.hidden_tests = hTests;
    }

    setEditModal({
      mode: 'edit',
      round: activeRound,
      data: itemData
    });
  };

  // Duplicate Question
  const handleDuplicate = (item) => {
    soundService.playClick();
    setTestRunResult(null);
    let itemData = { ...item };
    delete itemData.id;
    itemData.title = `${item.title} (Copy)`;
    if (activeRound === 'r1') {
      let opts = item.options;
      if (!Array.isArray(opts)) {
        try { opts = JSON.parse(item.options_json); } catch (e) { opts = ['', '', '', '']; }
      }
      itemData.options = [...opts];
    } else if (activeRound === 'r2') {
      const nextNum = (questionsBank.r2?.length || 0) + 1;
      itemData.challenge_code = `JAVA-${String(nextNum).padStart(3, '0')}`;
    } else if (activeRound === 'r3') {
      const nextNum = (questionsBank.r3?.length || 0) + 1;
      itemData.challenge_code = `PY-${String(nextNum).padStart(3, '0')}`;
      let vTests = item.visible_tests;
      let hTests = item.hidden_tests;
      if (!Array.isArray(vTests)) {
        try { vTests = JSON.parse(item.visible_tests_json); } catch (e) { vTests = []; }
      }
      if (!Array.isArray(hTests)) {
        try { hTests = JSON.parse(item.hidden_tests_json); } catch (e) { hTests = []; }
      }
      itemData.visible_tests = [...vTests];
      itemData.hidden_tests = [...hTests];
    }

    setEditModal({
      mode: 'create',
      round: activeRound,
      data: itemData
    });
  };

  // Save Modal (Create or Edit)
  const handleSaveModal = async (e) => {
    e.preventDefault();
    if (!editModal) return;
    setSaving(true);
    soundService.playClick();

    const { mode, round, data } = editModal;
    try {
      let res;
      if (mode === 'create') {
        res = await api.createQuestion(round, data);
      } else {
        res = await api.updateQuestion(round, data.id, data);
      }

      if (res.success) {
        soundService.playCorrect();
        showBanner?.(res.message || 'Question saved successfully!');
        setEditModal(null);
        onRefresh?.();
      } else {
        soundService.playWrong();
        alert(res.error || 'Failed to save question.');
      }
    } catch (err) {
      soundService.playWrong();
      alert('Error saving question: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const [reseeding, setReseeding] = useState(false);

  // Force Reload Official Tournament Questions
  const handleReseedQuestions = async () => {
    soundService.playClick();
    if (!window.confirm('Reload official tournament questions for all 3 rounds? This will populate the 50 Round 1 MCQs, Java challenges, and Python challenges.')) {
      return;
    }
    setReseeding(true);
    try {
      const res = await api.reseedQuestionBank();
      if (res.success) {
        soundService.playVictory();
        showBanner?.(res.message || 'Official questions loaded successfully!');
        onRefresh?.();
      } else {
        soundService.playWrong();
        alert(res.error || 'Failed to reload questions.');
      }
    } catch (err) {
      soundService.playWrong();
      alert('Error reloading questions: ' + err.message);
    } finally {
      setReseeding(false);
    }
  };

  // Handle CSV file selection
  const handleCSVFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFileName(file.name);
    setCsvError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result || '';
      setCsvText(content);
      const rows = content.split(/\r?\n/).filter(r => r.trim().length > 0);
      setCsvPreviewCount(Math.max(0, rows.length - 1));
    };
    reader.onerror = () => setCsvError('Failed to read the selected CSV file.');
    reader.readAsText(file);
  };

  // Download official CSV template
  const handleDownloadCSVTemplate = () => {
    soundService.playClick();
    const csvContent = [
      'language,difficulty,title,question_text,code_snippet,option_a,option_b,option_c,option_d,correct_option,explanation',
      'C,Easy,Post-Increment Output,What is the output of the following C code?,"int x = 5;\\nprintf(\\"\"%d\\\"\", x++);",4,5,6,Error,B,"x++ evaluates to 5 before incrementing."',
      'C,Easy,Standard I/O Header,Which header file is required for printf()?,stdlib.h,string.h,stdio.h,math.h,C,"stdio.h contains declaration for printf()."',
      'C++,Easy,Standard Output Stream,Which stream is commonly used for output in C++?,cin,cout,print,output,B,"std::cout is the standard output stream."',
      'Java,Easy,Object Instantiation Keyword,Which keyword is used to create an object in Java?,create,object,new,malloc,C,"The new operator instantiates a class."',
      'Python,Easy,Single-Line Comment Symbol,Which symbol is used for a single-line comment in Python?,//,#,/*,--,B,"Python uses # for single-line comments."',
      'HTML,Easy,HTML Full Form,What does HTML stand for?,Hyper Text Markup Language,High Text Machine Language,Hyperlink Text Management Language,Home Tool Markup Language,A,"HTML stands for HyperText Markup Language."'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'ROUND_1_MCQ_TEMPLATE.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Submit CSV Import to Server
  const handleImportCSVSubmit = async () => {
    if (!csvText || !csvText.trim()) {
      setCsvError('Please upload or choose a valid CSV file.');
      return;
    }
    soundService.playClick();
    setImportingCsv(true);
    setCsvError('');
    try {
      const res = await api.importQuestionsCSV(activeRound, csvText, csvImportMode);
      if (res.success) {
        soundService.playVictory();
        showBanner?.(res.message || `Imported ${res.count} questions from CSV!`);
        setCsvModalOpen(false);
        setCsvText('');
        setCsvFileName('');
        setCsvPreviewCount(0);
        onRefresh?.();
      } else {
        soundService.playWrong();
        setCsvError(res.error || 'Failed to import CSV.');
      }
    } catch (err) {
      soundService.playWrong();
      setCsvError('Import error: ' + err.message);
    } finally {
      setImportingCsv(false);
    }
  };

  // Delete Question
  const handleConfirmDelete = async () => {
    if (!deleteModal) return;
    const { round, item } = deleteModal;
    soundService.playClick();
    try {
      const res = await api.deleteQuestion(round, item.id);
      if (res.success) {
        showBanner?.(res.message || 'Deleted successfully.');
        setDeleteModal(null);
        onRefresh?.();
      } else {
        alert(res.error || 'Failed to delete.');
      }
    } catch (err) {
      alert('Error deleting: ' + err.message);
    }
  };

  // Test Run R3 Canonical Code
  const handleTestCanonical = async () => {
    if (!editModal?.data?.canonical_solution || !editModal?.data?.visible_tests) return;
    setTestingCode(true);
    setTestRunResult(null);
    try {
      const res = await api.runR3Test({
        question_id: editModal.data.id || 1,
        code: editModal.data.canonical_solution
      });
      setTestRunResult(res);
      if (res.overall_status === 'ACCEPTED') {
        soundService.playCorrect();
      } else {
        soundService.playWrong();
      }
    } catch (e) {
      setTestRunResult({ overall_status: 'ERROR', error: e.message });
    } finally {
      setTestingCode(false);
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      
      {/* Top Banner & Round Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-5 h-5 text-cyber-cyan" />
            <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider">
              Question Bank Studio
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30">
              Live Tournament Engine
            </span>
          </div>
          <p className="text-slate-400 text-xs">
            Manage, edit, add, or toggle challenge pools for all 3 tournament stages. Changes persist immediately.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={handleReseedQuestions}
            disabled={reseeding}
            className="px-4 py-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold transition flex items-center justify-center gap-2 text-xs"
            title="Reload official tournament questions for Round 1, Round 2, and Round 3"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{reseeding ? 'Reloading...' : 'Reload Official Questions'}</span>
          </button>

          <button
            onClick={() => { soundService.playClick(); setCsvModalOpen(true); setCsvError(''); }}
            className="px-4 py-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-bold transition flex items-center justify-center gap-2 text-xs"
            title="Import questions from a .csv file"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Import .CSV</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 rounded-xl bg-cyber-cyan text-slate-950 font-bold hover:bg-cyber-cyan/90 transition shadow-lg shadow-cyber-cyan/20 flex items-center justify-center gap-2 text-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>
              {activeRound === 'r1' && 'Add New MCQ'}
              {activeRound === 'r2' && 'Add Java Challenge'}
              {activeRound === 'r3' && 'Add Python Challenge'}
            </span>
          </button>
        </div>
      </div>

      {/* Round Selection Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Round 1 Tab */}
        <button
          onClick={() => { setActiveRound('r1'); setExpandedId(null); }}
          className={`p-4 rounded-2xl border text-left transition relative overflow-hidden ${
            activeRound === 'r1'
              ? 'border-cyber-cyan bg-cyber-cyan/10 shadow-lg shadow-cyber-cyan/10'
              : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase text-cyber-cyan">Round 1</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
              {counts.r1Active} / {counts.r1Total} Active
            </span>
          </div>
          <h3 className="font-bold text-sm text-slate-100 mb-1">Basic MCQs</h3>
          <p className="text-[11px] text-slate-400">
            C, C++, Java, Python & HTML multiple-choice pool (10 assigned per team).
          </p>
          {activeRound === 'r1' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-cyber-cyan" />
          )}
        </button>

        {/* Round 2 Tab */}
        <button
          onClick={() => { setActiveRound('r2'); setExpandedId(null); }}
          className={`p-4 rounded-2xl border text-left transition relative overflow-hidden ${
            activeRound === 'r2'
              ? 'border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/10'
              : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase text-amber-400">Round 2</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
              {counts.r2Active} / {counts.r2Total} Active
            </span>
          </div>
          <h3 className="font-bold text-sm text-slate-100 mb-1">Identify the Bug (Java)</h3>
          <p className="text-[11px] text-slate-400">
            Buggy Line MCQ (3 pts) & Bug Type MCQ (2 pts) challenges.
          </p>
          {activeRound === 'r2' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-400" />
          )}
        </button>

        {/* Round 3 Tab */}
        <button
          onClick={() => { setActiveRound('r3'); setExpandedId(null); }}
          className={`p-4 rounded-2xl border text-left transition relative overflow-hidden ${
            activeRound === 'r3'
              ? 'border-cyber-green bg-cyber-green/10 shadow-lg shadow-cyber-green/10'
              : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase text-cyber-green">Round 3</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
              {counts.r3Active} / {counts.r3Total} Active
            </span>
          </div>
          <h3 className="font-bold text-sm text-slate-100 mb-1">Identify & Solve (Python)</h3>
          <p className="text-[11px] text-slate-400">
            Real code fixing evaluated with visible & hidden test cases.
          </p>
          {activeRound === 'r3' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-cyber-green" />
          )}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search questions by keyword, code, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-cyber-cyan"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-[11px]">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyber-cyan"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
        </div>

        {/* Round 1 Language Filter */}
        {activeRound === 'r1' && (
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-[11px]">Language:</span>
            <select
              value={filterLang}
              onChange={(e) => setFilterLang(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyber-cyan"
            >
              <option value="ALL">All Languages</option>
              {R1_LANGUAGES.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        )}

        {/* Round 2 Bug Type Filter */}
        {activeRound === 'r2' && (
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-[11px]">Bug Type:</span>
            <select
              value={filterBugType}
              onChange={(e) => setFilterBugType(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyber-cyan"
            >
              <option value="ALL">All Bug Types</option>
              {JAVA_BUG_TYPES.map(bt => (
                <option key={bt} value={bt}>{bt}</option>
              ))}
            </select>
          </div>
        )}

        <div className="text-slate-500 text-[11px]">
          Showing <strong className="text-slate-200">{currentList.length}</strong> items
        </div>
      </div>

      {/* Questions Card List */}
      <div className="space-y-4">
        {currentList.length === 0 ? (
          <div className="p-12 text-center border border-slate-800 rounded-2xl bg-slate-900/40 text-slate-400 space-y-3">
            <Bug className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-slate-300">No questions found matching the selected criteria.</p>
            <p className="text-xs text-slate-500">Try adjusting your search query or create a new question.</p>
            <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
              <button
                onClick={handleReseedQuestions}
                disabled={reseeding}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyber-cyan to-cyber-green text-slate-950 font-bold hover:opacity-90 transition text-xs flex items-center gap-2 shadow-lg shadow-cyber-cyan/20"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>{reseeding ? 'Loading Official Questions...' : '🚀 Load 50 Official Tournament MCQs & Challenges'}</span>
              </button>
              <button
                onClick={() => { soundService.playClick(); setCsvModalOpen(true); setCsvError(''); }}
                className="px-4 py-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-bold transition text-xs flex items-center gap-2"
              >
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Upload .CSV File</span>
              </button>
              <button
                onClick={handleOpenCreate}
                className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 font-bold hover:bg-slate-700 transition text-xs"
              >
                Create Question
              </button>
            </div>
          </div>
        ) : (
          currentList.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border transition shadow-sm ${
                  item.is_active
                    ? 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                    : 'border-slate-800/60 bg-slate-950/60 opacity-70 hover:opacity-100'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Identifier Badges */}
                    {activeRound === 'r1' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30">
                        {item.language}
                      </span>
                    )}
                    {activeRound === 'r2' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-400/30">
                        {item.challenge_code || `JAVA-${item.id}`}
                      </span>
                    )}
                    {activeRound === 'r3' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyber-green/15 text-cyber-green border border-cyber-green/30">
                        {item.challenge_code || `PY-${item.id}`}
                      </span>
                    )}

                    <span className="text-slate-500 text-[10px]">#{item.id}</span>

                    {/* Difficulty Badge */}
                    {item.difficulty && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {item.difficulty}
                      </span>
                    )}

                    {/* Active Status Badge */}
                    <button
                      onClick={() => handleToggle(activeRound, item.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition flex items-center gap-1.5 ${
                        item.is_active
                          ? 'bg-cyber-green/20 text-cyber-green border border-cyber-green/30 hover:bg-cyber-green/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30'
                      }`}
                      title="Click to toggle tournament active status"
                    >
                      {item.is_active ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Active Pool</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          <span>Inactive</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 transition flex items-center gap-1.5 text-xs font-bold"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-cyber-cyan" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDuplicate(item)}
                      className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 transition flex items-center gap-1.5 text-xs"
                      title="Duplicate Question"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Clone</span>
                    </button>

                    <button
                      onClick={() => setDeleteModal({ round: activeRound, item })}
                      className="px-2.5 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition text-xs"
                      title="Delete Question"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition"
                      title={isExpanded ? 'Collapse' : 'Expand full details'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Question Title */}
                <h3 className="text-sm font-bold text-slate-100 mt-2 mb-1">
                  {item.title}
                </h3>

                {/* Description / Question Text */}
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                  {item.question_text || item.description}
                </p>

                {/* ROUND-SPECIFIC SUMMARY BADGES */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-4 text-xs">
                  
                  {/* Round 1 MCQ: Correct Option Callout */}
                  {activeRound === 'r1' && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Correct Answer:</span>
                      <span className="px-2 py-0.5 rounded bg-cyber-cyan/20 border border-cyber-cyan/40 text-cyber-cyan font-bold">
                        Option {String.fromCharCode(65 + (item.correct_option_index || 0))}: {
                          (item.options || [])[item.correct_option_index] || 'Configured'
                        }
                      </span>
                    </div>
                  )}

                  {/* Round 2 Java: Buggy Line MCQ & Bug Type MCQ */}
                  {activeRound === 'r2' && (
                    <>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">Buggy Line MCQ Target:</span>
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold">
                          Line {item.buggy_line}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">Bug Type MCQ Target:</span>
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold">
                          {item.bug_type}
                        </span>
                      </div>
                    </>
                  )}

                  {/* Round 3 Python: Faulty Line & Tests */}
                  {activeRound === 'r3' && (
                    <>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">Faulty Line:</span>
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold">
                          Line {item.faulty_line}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">Bug Type:</span>
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                          {item.bug_type}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <span>Tests:</span>
                        <span className="text-cyber-green font-bold">
                          {(item.visible_tests?.length ?? 0)} visible
                        </span>
                        <span>/</span>
                        <span className="text-purple-400 font-bold">
                          {(item.hidden_tests?.length ?? 0)} hidden
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* EXPANDED DETAILS ACCORDION */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-800 space-y-4">
                    
                    {/* R1 Options Display */}
                    {activeRound === 'r1' && (
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold uppercase text-slate-400 block">MCQ Options:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {(item.options || []).map((opt, optIdx) => {
                            const isCorrect = optIdx === item.correct_option_index;
                            return (
                              <div
                                key={optIdx}
                                className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                                  isCorrect
                                    ? 'border-cyber-cyan bg-cyber-cyan/10 text-slate-100 font-bold'
                                    : 'border-slate-800 bg-slate-950 text-slate-300'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                    isCorrect ? 'bg-cyber-cyan text-slate-950' : 'bg-slate-800 text-slate-400'
                                  }`}>
                                    {String.fromCharCode(65 + optIdx)}
                                  </span>
                                  <span>{opt}</span>
                                </div>
                                {isCorrect && (
                                  <span className="text-[10px] text-cyber-cyan font-bold flex items-center gap-1">
                                    <Check className="w-3 h-3" /> Correct
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Code Snippet Preview with Line Numbers */}
                    {(item.code_snippet || item.buggy_code) && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold uppercase text-slate-400 block">Source Code Preview:</span>
                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 max-h-56 overflow-y-auto font-mono text-xs">
                          {(item.code_snippet || item.buggy_code).split('\n').map((line, lIdx) => {
                            const lineNum = lIdx + 1;
                            const isTargetLine = 
                              (activeRound === 'r2' && lineNum === item.buggy_line) ||
                              (activeRound === 'r3' && lineNum === item.faulty_line);

                            return (
                              <div
                                key={lIdx}
                                className={`flex items-center gap-3 px-2 py-0.5 rounded ${
                                  isTargetLine ? 'bg-rose-500/20 text-rose-300 font-bold border-l-2 border-rose-500' : 'text-slate-300'
                                }`}
                              >
                                <span className="w-6 text-right text-slate-600 select-none text-[11px]">
                                  {lineNum}
                                </span>
                                <pre className="font-mono flex-1 leading-relaxed overflow-x-auto">
                                  <code>{line}</code>
                                </pre>
                                {isTargetLine && (
                                  <span className="text-[10px] text-rose-400 shrink-0 font-bold">
                                    ← Target Buggy Line
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Explanation / Notes */}
                    {item.explanation && (
                      <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/80 text-xs">
                        <span className="text-slate-400 font-bold block mb-1">Explanation / Solution Notes:</span>
                        <p className="text-slate-300">{item.explanation}</p>
                      </div>
                    )}

                    {/* R3 Canonical Solution and Test Cases Details */}
                    {activeRound === 'r3' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold uppercase text-cyber-green block">Canonical Solution:</span>
                          <pre className="p-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 max-h-40 overflow-y-auto text-[11px]">
                            <code>{item.canonical_solution}</code>
                          </pre>
                        </div>
                        <div className="space-y-2">
                          <span className="text-[11px] font-bold uppercase text-slate-400 block">Test Cases:</span>
                          <div className="space-y-1 text-xs">
                            <div className="text-slate-400">
                              Visible Tests: <strong className="text-cyber-green">{item.visible_tests?.length || 0}</strong>
                            </div>
                            <div className="text-slate-400">
                              Hidden Tests: <strong className="text-purple-400">{item.hidden_tests?.length || 0}</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL: CREATE / EDIT QUESTION */}
      {/* ========================================================= */}
      {editModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-3xl w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto font-mono text-xs">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-cyber-cyan" />
                  <span>
                    {editModal.mode === 'create' ? 'Add New' : 'Edit'}{' '}
                    {editModal.round === 'r1' && 'Round 1 MCQ'}
                    {editModal.round === 'r2' && 'Round 2 Java Bug Challenge (Buggy Line & Bug Type)'}
                    {editModal.round === 'r3' && 'Round 3 Python Challenge (Identify & Solve Bug)'}
                  </span>
                </h3>
                <p className="text-slate-400 text-xs mt-1">
                  Configure question details, solution keys, and tournament parameters.
                </p>
              </div>

              <button
                onClick={() => setEditModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveModal} className="space-y-4">
              
              {/* --- FORM FOR ROUND 1 MCQs --- */}
              {editModal.round === 'r1' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Language</label>
                      <select
                        value={editModal.data.language}
                        onChange={(e) => setEditModal(prev => ({
                          ...prev,
                          data: { ...prev.data, language: e.target.value }
                        }))}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyber-cyan"
                      >
                        {R1_LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Difficulty</label>
                      <select
                        value={editModal.data.difficulty}
                        onChange={(e) => setEditModal(prev => ({
                          ...prev,
                          data: { ...prev.data, difficulty: e.target.value }
                        }))}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyber-cyan"
                      >
                        {R1_DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>

                    <div className="flex items-end">
                      <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-800 bg-slate-950 w-full cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(editModal.data.is_active)}
                          onChange={(e) => setEditModal(prev => ({
                            ...prev,
                            data: { ...prev.data, is_active: e.target.checked ? 1 : 0 }
                          }))}
                          className="rounded text-cyber-cyan focus:ring-0"
                        />
                        <span className="text-slate-300 font-bold">Include in Active Pool</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Question Title / Concept *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pointer Arithmetic in C"
                      value={editModal.data.title}
                      onChange={(e) => setEditModal(prev => ({
                        ...prev,
                        data: { ...prev.data, title: e.target.value }
                      }))}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyber-cyan"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Question Text *</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Enter the full question prompt..."
                      value={editModal.data.question_text}
                      onChange={(e) => setEditModal(prev => ({
                        ...prev,
                        data: { ...prev.data, question_text: e.target.value }
                      }))}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyber-cyan"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Code Snippet (Optional)</label>
                    <textarea
                      rows={4}
                      placeholder="// Optional code snippet accompanying the MCQ..."
                      value={editModal.data.code_snippet}
                      onChange={(e) => setEditModal(prev => ({
                        ...prev,
                        data: { ...prev.data, code_snippet: e.target.value }
                      }))}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyber-cyan"
                    />
                  </div>

                  {/* 4 Options with Correct Radio Indicator */}
                  <div className="space-y-2">
                    <label className="block text-slate-400 font-bold uppercase text-[11px]">
                      MCQ Options (Select the Correct Option) *
                    </label>
                    <div className="space-y-2">
                      {[0, 1, 2, 3].map((optIdx) => {
                        const isCorrect = editModal.data.correct_option_index === optIdx;
                        return (
                          <div
                            key={optIdx}
                            className={`p-2.5 rounded-xl border flex items-center gap-3 transition ${
                              isCorrect ? 'border-cyber-cyan bg-cyber-cyan/10' : 'border-slate-800 bg-slate-950'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => setEditModal(prev => ({
                                ...prev,
                                data: { ...prev.data, correct_option_index: optIdx }
                              }))}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition ${
                                isCorrect
                                  ? 'bg-cyber-cyan text-slate-950 ring-2 ring-cyber-cyan'
                                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                              }`}
                              title="Click to mark as correct answer"
                            >
                              {String.fromCharCode(65 + optIdx)}
                            </button>

                            <input
                              type="text"
                              required
                              placeholder={`Option ${String.fromCharCode(65 + optIdx)} text`}
                              value={editModal.data.options[optIdx] || ''}
                              onChange={(e) => {
                                const newOpts = [...(editModal.data.options || ['', '', '', ''])];
                                newOpts[optIdx] = e.target.value;
                                setEditModal(prev => ({
                                  ...prev,
                                  data: { ...prev.data, options: newOpts }
                                }));
                              }}
                              className="flex-1 bg-transparent border-none text-slate-100 placeholder-slate-600 focus:outline-none text-xs"
                            />

                            <button
                              type="button"
                              onClick={() => setEditModal(prev => ({
                                ...prev,
                                data: { ...prev.data, correct_option_index: optIdx }
                              }))}
                              className={`text-[11px] px-2 py-1 rounded transition ${
                                isCorrect ? 'text-cyber-cyan font-bold' : 'text-slate-500 hover:text-slate-300'
                              }`}
                            >
                              {isCorrect ? '✓ Correct Answer' : 'Mark Correct'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Explanation (Shown after round)</label>
                    <textarea
                      rows={2}
                      placeholder="Why this option is correct..."
                      value={editModal.data.explanation}
                      onChange={(e) => setEditModal(prev => ({
                        ...prev,
                        data: { ...prev.data, explanation: e.target.value }
                      }))}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyber-cyan"
                    />
                  </div>
                </>
              )}

              {/* --- FORM FOR ROUND 2: JAVA IDENTIFY BUG (Buggy Line MCQ + Bug Type MCQ) --- */}
              {editModal.round === 'r2' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Challenge Code *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. JAVA-001"
                        value={editModal.data.challenge_code}
                        onChange={(e) => setEditModal(prev => ({
                          ...prev,
                          data: { ...prev.data, challenge_code: e.target.value }
                        }))}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="sm:col-span-2 flex items-end">
                      <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-800 bg-slate-950 w-full cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(editModal.data.is_active)}
                          onChange={(e) => setEditModal(prev => ({
                            ...prev,
                            data: { ...prev.data, is_active: e.target.checked ? 1 : 0 }
                          }))}
                          className="rounded text-amber-400 focus:ring-0"
                        />
                        <span className="text-slate-300 font-bold">Include in Active Tournament Pool</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Null Pointer Dereference in Linked List"
                      value={editModal.data.title}
                      onChange={(e) => setEditModal(prev => ({
                        ...prev,
                        data: { ...prev.data, title: e.target.value }
                      }))}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Description *</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Brief problem context for participants..."
                      value={editModal.data.description}
                      onChange={(e) => setEditModal(prev => ({
                        ...prev,
                        data: { ...prev.data, description: e.target.value }
                      }))}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Java Code Snippet Editor with Clickable Line Number Gutter */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-slate-400">
                        Java Code Snippet * (Click any line in preview to set Buggy Line)
                      </label>
                      <span className="text-[11px] text-amber-400">
                        Selected Buggy Line: <strong>Line {editModal.data.buggy_line || 1}</strong>
                      </span>
                    </div>

                    <textarea
                      required
                      rows={7}
                      placeholder="Enter Java code with standard indentation..."
                      value={editModal.data.code_snippet}
                      onChange={(e) => setEditModal(prev => ({
                        ...prev,
                        data: { ...prev.data, code_snippet: e.target.value }
                      }))}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs focus:outline-none focus:border-amber-400"
                    />

                    {/* Interactive Code Line Picker */}
                    <div className="mt-2 p-3 rounded-xl border border-slate-800 bg-slate-950 max-h-44 overflow-y-auto">
                      <span className="text-[10px] text-slate-500 block mb-1">Click a line below to mark as the Buggy Line:</span>
                      {(editModal.data.code_snippet || '').split('\n').map((line, idx) => {
                        const lineNum = idx + 1;
                        const isSelected = editModal.data.buggy_line === lineNum;
                        return (
                          <div
                            key={idx}
                            onClick={() => setEditModal(prev => ({
                              ...prev,
                              data: { ...prev.data, buggy_line: lineNum }
                            }))}
                            className={`flex items-center gap-3 px-2 py-0.5 rounded cursor-pointer transition ${
                              isSelected
                                ? 'bg-rose-500/20 text-rose-300 font-bold border-l-4 border-rose-500'
                                : 'hover:bg-slate-800/60 text-slate-400'
                            }`}
                          >
                            <span className="w-6 text-right select-none text-slate-500 text-[11px]">
                              {lineNum}
                            </span>
                            <pre className="font-mono text-xs flex-1 leading-relaxed">
                              <code>{line}</code>
                            </pre>
                            {isSelected && (
                              <span className="text-[10px] text-rose-400 shrink-0 font-bold">
                                ← Target Buggy Line (3 Marks)
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dual Scoring Config: Buggy Line MCQ & Bug Type MCQ */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl border border-slate-800 bg-slate-950/80">
                    <div>
                      <label className="block text-xs font-bold text-cyber-cyan uppercase mb-1">
                        1. Buggy Line MCQ Target (3 Marks) *
                      </label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={editModal.data.buggy_line || 1}
                        onChange={(e) => setEditModal(prev => ({
                          ...prev,
                          data: { ...prev.data, buggy_line: parseInt(e.target.value, 10) || 1 }
                        }))}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyber-cyan font-bold"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">
                        Contestants must identify this exact line in Round 2.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-amber-400 uppercase mb-1">
                        2. Bug Type MCQ Target (2 Marks) *
                      </label>
                      <select
                        value={editModal.data.bug_type}
                        onChange={(e) => setEditModal(prev => ({
                          ...prev,
                          data: { ...prev.data, bug_type: e.target.value }
                        }))}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-400 font-bold"
                      >
                        {JAVA_BUG_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                      </select>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Contestants choose from the 6 standard bug classifications.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Detailed Explanation & Fix *</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Explain the error cause and correct patch..."
                      value={editModal.data.explanation}
                      onChange={(e) => setEditModal(prev => ({
                        ...prev,
                        data: { ...prev.data, explanation: e.target.value }
                      }))}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </>
              )}

              {/* --- FORM FOR ROUND 3: PYTHON DEBUG & SOLVE (Identify & Fix with Test Cases) --- */}
              {editModal.round === 'r3' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Challenge Code *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. PY-001"
                        value={editModal.data.challenge_code}
                        onChange={(e) => setEditModal(prev => ({
                          ...prev,
                          data: { ...prev.data, challenge_code: e.target.value }
                        }))}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyber-green"
                      />
                    </div>

                    <div className="sm:col-span-2 flex items-end">
                      <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-800 bg-slate-950 w-full cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(editModal.data.is_active)}
                          onChange={(e) => setEditModal(prev => ({
                            ...prev,
                            data: { ...prev.data, is_active: e.target.checked ? 1 : 0 }
                          }))}
                          className="rounded text-cyber-green focus:ring-0"
                        />
                        <span className="text-slate-300 font-bold">Include in Active Tournament Pool</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Matrix Spiral Traversal Debug"
                      value={editModal.data.title}
                      onChange={(e) => setEditModal(prev => ({
                        ...prev,
                        data: { ...prev.data, title: e.target.value }
                      }))}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyber-green"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Description *</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Challenge problem statement..."
                      value={editModal.data.description}
                      onChange={(e) => setEditModal(prev => ({
                        ...prev,
                        data: { ...prev.data, description: e.target.value }
                      }))}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyber-green"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Input Format</label>
                      <input
                        type="text"
                        value={editModal.data.input_format || ''}
                        onChange={(e) => setEditModal(prev => ({
                          ...prev,
                          data: { ...prev.data, input_format: e.target.value }
                        }))}
                        className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyber-green"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Output Format</label>
                      <input
                        type="text"
                        value={editModal.data.output_format || ''}
                        onChange={(e) => setEditModal(prev => ({
                          ...prev,
                          data: { ...prev.data, output_format: e.target.value }
                        }))}
                        className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyber-green"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Constraints</label>
                      <input
                        type="text"
                        value={editModal.data.constraints || ''}
                        onChange={(e) => setEditModal(prev => ({
                          ...prev,
                          data: { ...prev.data, constraints: e.target.value }
                        }))}
                        className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyber-green"
                      />
                    </div>
                  </div>

                  {/* Buggy Starter Code */}
                  <div>
                    <label className="block text-slate-400 mb-1">
                      Starter Buggy Code (Given to participants) *
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={editModal.data.buggy_code}
                      onChange={(e) => setEditModal(prev => ({
                        ...prev,
                        data: { ...prev.data, buggy_code: e.target.value }
                      }))}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyber-green"
                    />
                  </div>

                  {/* Canonical Correct Solution */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-slate-400">Canonical Solution (Verified Correct Implementation) *</label>
                      <button
                        type="button"
                        onClick={handleTestCanonical}
                        disabled={testingCode}
                        className="px-3 py-1 rounded-lg border border-cyber-green/40 bg-cyber-green/10 text-cyber-green hover:bg-cyber-green/20 transition flex items-center gap-1.5 text-[11px]"
                      >
                        <Play className="w-3 h-3" />
                        <span>{testingCode ? 'Running Tests...' : 'Validate Against Visible Tests'}</span>
                      </button>
                    </div>

                    <textarea
                      required
                      rows={6}
                      value={editModal.data.canonical_solution}
                      onChange={(e) => setEditModal(prev => ({
                        ...prev,
                        data: { ...prev.data, canonical_solution: e.target.value }
                      }))}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyber-green"
                    />

                    {/* Test run banner if executed */}
                    {testRunResult && (
                      <div className={`mt-2 p-3 rounded-xl border text-xs ${
                        testRunResult.overall_status === 'ACCEPTED'
                          ? 'border-cyber-green/40 bg-cyber-green/10 text-cyber-green'
                          : 'border-rose-500/40 bg-rose-500/10 text-rose-300'
                      }`}>
                        <strong>Test Result: {testRunResult.overall_status}</strong>
                        {testRunResult.message && <p className="text-[11px] mt-1">{testRunResult.message}</p>}
                        {testRunResult.results?.map((r, i) => (
                          <div key={i} className="text-[10px] mt-1 font-mono">
                            Test #{r.test_number}: {r.status} (Output: {r.actual_output} vs Expected: {r.expected_output})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Identification Targets */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl border border-slate-800 bg-slate-950">
                    <div>
                      <label className="block text-slate-400 mb-1">Faulty Line Number *</label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={editModal.data.faulty_line || 1}
                        onChange={(e) => setEditModal(prev => ({
                          ...prev,
                          data: { ...prev.data, faulty_line: parseInt(e.target.value, 10) || 1 }
                        }))}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyber-green"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Bug Type / Classification *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Index Out of Bounds"
                        value={editModal.data.bug_type}
                        onChange={(e) => setEditModal(prev => ({
                          ...prev,
                          data: { ...prev.data, bug_type: e.target.value }
                        }))}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyber-green"
                      />
                    </div>
                  </div>

                  {/* Dynamic Visible Test Cases Builder */}
                  <div className="space-y-2 p-4 rounded-2xl border border-slate-800 bg-slate-950">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-cyber-green uppercase text-[11px]">
                        Visible Test Cases (Shown to Contestants)
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const tests = [...(editModal.data.visible_tests || [])];
                          tests.push({ input: '', expected_output: '' });
                          setEditModal(prev => ({
                            ...prev,
                            data: { ...prev.data, visible_tests: tests }
                          }));
                        }}
                        className="px-2.5 py-1 rounded-lg border border-cyber-green/40 bg-cyber-green/10 text-cyber-green hover:bg-cyber-green/20 text-[11px] flex items-center gap-1 font-bold"
                      >
                        <Plus className="w-3 h-3" /> Add Visible Test
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(editModal.data.visible_tests || []).map((test, tIdx) => (
                        <div key={tIdx} className="p-3 rounded-xl border border-slate-800 bg-slate-900 flex items-center gap-3">
                          <span className="text-slate-500 font-bold">#{tIdx + 1}</span>
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-[10px] text-slate-500 block mb-0.5">Input:</span>
                              <input
                                type="text"
                                placeholder="stdin input..."
                                value={test.input}
                                onChange={(e) => {
                                  const tests = [...(editModal.data.visible_tests || [])];
                                  tests[tIdx].input = e.target.value;
                                  setEditModal(prev => ({ ...prev, data: { ...prev.data, visible_tests: tests } }));
                                }}
                                className="w-full p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block mb-0.5">Expected Output:</span>
                              <input
                                type="text"
                                placeholder="stdout output..."
                                value={test.expected_output}
                                onChange={(e) => {
                                  const tests = [...(editModal.data.visible_tests || [])];
                                  tests[tIdx].expected_output = e.target.value;
                                  setEditModal(prev => ({ ...prev, data: { ...prev.data, visible_tests: tests } }));
                                }}
                                className="w-full p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const tests = editModal.data.visible_tests.filter((_, i) => i !== tIdx);
                              setEditModal(prev => ({ ...prev, data: { ...prev.data, visible_tests: tests } }));
                            }}
                            className="text-rose-400 hover:text-rose-300 p-1"
                            title="Remove Test"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Hidden Test Cases Builder */}
                  <div className="space-y-2 p-4 rounded-2xl border border-slate-800 bg-slate-950">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-purple-400 uppercase text-[11px]">
                        Hidden Test Cases (Evaluated on Final Submission)
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const tests = [...(editModal.data.hidden_tests || [])];
                          tests.push({ input: '', expected_output: '' });
                          setEditModal(prev => ({
                            ...prev,
                            data: { ...prev.data, hidden_tests: tests }
                          }));
                        }}
                        className="px-2.5 py-1 rounded-lg border border-purple-400/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 text-[11px] flex items-center gap-1 font-bold"
                      >
                        <Plus className="w-3 h-3" /> Add Hidden Test
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(editModal.data.hidden_tests || []).map((test, tIdx) => (
                        <div key={tIdx} className="p-3 rounded-xl border border-slate-800 bg-slate-900 flex items-center gap-3">
                          <span className="text-slate-500 font-bold">#{tIdx + 1}</span>
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-[10px] text-slate-500 block mb-0.5">Input:</span>
                              <input
                                type="text"
                                placeholder="hidden stdin..."
                                value={test.input}
                                onChange={(e) => {
                                  const tests = [...(editModal.data.hidden_tests || [])];
                                  tests[tIdx].input = e.target.value;
                                  setEditModal(prev => ({ ...prev, data: { ...prev.data, hidden_tests: tests } }));
                                }}
                                className="w-full p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block mb-0.5">Expected Output:</span>
                              <input
                                type="text"
                                placeholder="hidden stdout..."
                                value={test.expected_output}
                                onChange={(e) => {
                                  const tests = [...(editModal.data.hidden_tests || [])];
                                  tests[tIdx].expected_output = e.target.value;
                                  setEditModal(prev => ({ ...prev, data: { ...prev.data, hidden_tests: tests } }));
                                }}
                                className="w-full p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const tests = editModal.data.hidden_tests.filter((_, i) => i !== tIdx);
                              setEditModal(prev => ({ ...prev, data: { ...prev.data, hidden_tests: tests } }));
                            }}
                            className="text-rose-400 hover:text-rose-300 p-1"
                            title="Remove Hidden Test"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                </>
              )}

              {/* Form Actions Footer */}
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditModal(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-cyber-cyan text-slate-950 font-bold hover:bg-cyber-cyan/90 transition shadow-lg shadow-cyber-cyan/20 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Question</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================================================= */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-rose-500/40 rounded-3xl p-6 shadow-2xl space-y-4 font-mono text-xs text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-100">
              Delete Question #{deleteModal.item.id}?
            </h3>

            <p className="text-slate-400">
              Are you sure you want to permanently delete{' '}
              <strong className="text-slate-200">"{deleteModal.item.title}"</strong>?
              This action cannot be undone.
            </p>

            <div className="pt-2 flex gap-3 justify-center">
              <button
                onClick={() => setDeleteModal(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-500 text-white font-bold hover:bg-rose-600 transition shadow-lg shadow-rose-500/20"
              >
                Yes, Delete Question
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* CSV IMPORT MODAL */}
      {/* ========================================================= */}
      {csvModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-xl w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-5 my-8 font-mono text-xs">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-slate-100 uppercase tracking-wide">
                  Import Questions via .CSV
                </h3>
              </div>
              <button
                onClick={() => setCsvModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            {/* Step 1: Download Template */}
            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60 flex items-center justify-between gap-4">
              <div>
                <span className="text-slate-200 font-bold block">Need the CSV Template?</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Download our pre-formatted spreadsheet with headers for C, C++, Java, Python & HTML.
                </span>
              </div>
              <button
                type="button"
                onClick={handleDownloadCSVTemplate}
                className="px-3.5 py-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-bold transition flex items-center gap-1.5 shrink-0 text-xs shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Template .CSV</span>
              </button>
            </div>

            {/* Step 2: Upload File */}
            <div className="space-y-2">
              <label className="text-slate-300 font-bold block">Select .CSV File:</label>
              <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-2xl p-6 text-center bg-slate-950/40 transition cursor-pointer relative group">
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleCSVFileSelect}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                />
                <Upload className="w-8 h-8 text-slate-500 group-hover:text-emerald-400 mx-auto mb-2 transition" />
                <p className="text-slate-200 font-bold">
                  {csvFileName ? (
                    <span className="text-emerald-400">{csvFileName}</span>
                  ) : (
                    'Click to browse or drop your .csv file here'
                  )}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {csvPreviewCount > 0 ? (
                    <span className="text-emerald-300 font-bold">✓ Ready: ~{csvPreviewCount} question rows detected</span>
                  ) : (
                    'Supports standard UTF-8 encoded CSV files'
                  )}
                </p>
              </div>
            </div>

            {/* Step 3: Import Mode */}
            <div className="space-y-2">
              <label className="text-slate-300 font-bold block">Import Mode:</label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-center gap-2.5 ${
                    csvImportMode === 'append'
                      ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300 font-bold'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="csvMode"
                    value="append"
                    checked={csvImportMode === 'append'}
                    onChange={() => setCsvImportMode('append')}
                    className="accent-emerald-400"
                  />
                  <span>Add to Existing</span>
                </label>

                <label
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-center gap-2.5 ${
                    csvImportMode === 'replace'
                      ? 'border-amber-500/60 bg-amber-500/10 text-amber-300 font-bold'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="csvMode"
                    value="replace"
                    checked={csvImportMode === 'replace'}
                    onChange={() => setCsvImportMode('replace')}
                    className="accent-amber-400"
                  />
                  <span>Replace All Questions</span>
                </label>
              </div>
            </div>

            {/* Error Banner */}
            {csvError && (
              <div className="p-3 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{csvError}</span>
              </div>
            )}

            {/* Actions */}
            <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setCsvModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportCSVSubmit}
                disabled={importingCsv || !csvText}
                className={`px-5 py-2.5 rounded-xl font-bold transition flex items-center gap-2 shadow-lg ${
                  !csvText || importingCsv
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>{importingCsv ? 'Importing Questions...' : 'Import Questions Now'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
