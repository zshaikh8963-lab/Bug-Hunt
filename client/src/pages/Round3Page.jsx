import React, { useState, useEffect } from 'react';
import { 
  Bug, Play, Send, RotateCcw, CheckCircle2, XCircle, 
  AlertCircle, Trophy, ArrowRight, Terminal, Clock, Sparkles 
} from 'lucide-react';
import { api } from '../services/api';
import { soundService } from '../services/sound';

export default function Round3Page({ team, onRoundCompleted, onLeaderboardClick, onBack }) {
  const [tasks, setTasks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [code, setCode] = useState('');
  const [identifiedBug, setIdentifiedBug] = useState('');
  const [faultyLine, setFaultyLine] = useState('');
  
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testConsole, setTestConsole] = useState(null);
  const [submitFeedback, setSubmitFeedback] = useState(null);

  const [roundScore, setRoundScore] = useState(team?.r3_score || 0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isRoundDone, setIsRoundDone] = useState(false);

  const teamId = team?.team_id || 'DEMO-001';
  const teamName = team?.team_name || 'Tournament Team';

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await api.getRoundTasks(teamId, 3);
      if (res.success && res.tasks && res.tasks.length > 0) {
        setTasks(res.tasks);

        const submittedIndices = new Set((res.submissions || []).map(s => s.task_index));
        let nextIdx = 0;
        for (let i = 0; i < res.tasks.length; i++) {
          if (!submittedIndices.has(i)) {
            nextIdx = i;
            break;
          }
          if (i === res.tasks.length - 1) {
            setIsRoundDone(true);
            nextIdx = res.tasks.length - 1;
          }
        }
        setCurrentIndex(nextIdx);
        setCode(res.tasks[nextIdx]?.buggy_code || '');
        setRoundScore(res.round_scores?.r3 || 0);
      } else {
        setLoadError(res.error || 'No challenges currently available for Round 3.');
      }
    } catch (err) {
      console.error('Failed to load Round 3 tasks:', err);
      setLoadError('Failed to connect to competition server.');
    } finally {
      setLoading(false);
    }
  };

  const currentTask = tasks[currentIndex];

  // Reset editor code to initial buggy snippet
  const handleResetCode = () => {
    soundService.playClick();
    if (currentTask) {
      setCode(currentTask.buggy_code);
      setTestConsole(null);
    }
  };

  // Run Code against visible test cases only
  const handleRunVisibleTests = async () => {
    if (!currentTask || !code.trim() || isRunningTest) return;
    setIsRunningTest(true);
    soundService.playClick();

    try {
      const res = await api.runR3Test({
        question_id: currentTask.id,
        code
      });

      if (res.success) {
        if (res.overall_status === 'ACCEPTED') {
          soundService.playCorrect();
        } else {
          soundService.playWrong();
        }
        setTestConsole(res);
      }
    } catch (err) {
      console.error('Run test failed:', err);
      setTestConsole({ overall_status: 'EXECUTION ERROR', message: 'Failed to contact execution server.' });
    } finally {
      setIsRunningTest(false);
    }
  };

  // Submit Solution against visible and hidden tests
  const handleSubmitSolution = async () => {
    if (!currentTask || isSubmitting) return;

    if (!identifiedBug.trim()) {
      alert('Please state your bug identification analysis.');
      return;
    }
    if (!faultyLine.trim()) {
      alert('Please specify the faulty line number.');
      return;
    }

    setIsSubmitting(true);
    soundService.playClick();

    try {
      const res = await api.submitR3Answer({
        team_id: teamId,
        task_index: currentIndex,
        question_id: currentTask.id,
        code,
        identified_bug: identifiedBug.trim(),
        faulty_line: faultyLine.trim()
      });

      if (res.success) {
        if (res.score_awarded > 0) {
          soundService.playCorrect();
        } else {
          soundService.playWrong();
        }
        setRoundScore(prev => prev + res.score_awarded);
        setSubmitFeedback(res);
      }
    } catch (err) {
      console.error('Submit solution failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextChallenge = () => {
    soundService.playClick();
    setSubmitFeedback(null);
    setTestConsole(null);
    setIdentifiedBug('');
    setFaultyLine('');

    if (currentIndex + 1 >= tasks.length) {
      setIsRoundDone(true);
      onRoundCompleted?.(3, roundScore);
    } else {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setCode(tasks[nextIdx]?.buggy_code || '');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cyber-dark text-slate-100 flex items-center justify-center font-mono">
        <div className="text-center space-y-3">
          <Bug className="w-12 h-12 text-cyber-green animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Loading Round 3 Python Environment...</p>
        </div>
      </div>
    );
  }

  // Load Error or No Tasks Available
  if (loadError || tasks.length === 0) {
    return (
      <div className="min-h-screen bg-cyber-dark text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-2xl border border-slate-800 bg-slate-900/90 text-center font-mono space-y-4">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
          <h2 className="text-xl font-bold text-slate-100">Round 3 Unavailable</h2>
          <p className="text-xs text-slate-400">
            {loadError || 'No Python challenges currently active for Round 3 in the tournament database.'}
          </p>
          <div className="pt-2 flex gap-3 justify-center">
            <button
              onClick={loadTasks}
              className="px-4 py-2 rounded-xl bg-cyber-green text-slate-950 font-bold text-xs hover:bg-cyber-green/80 transition"
            >
              Retry
            </button>
            <button
              onClick={onBack}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Round 3 & Tournament Finished View
  if (isRoundDone) {
    const totalScore = Math.min(50, (team?.r1_score || 0) + (team?.r2_score || 0) + roundScore);

    return (
      <div className="min-h-screen bg-cyber-dark text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-xl w-full p-8 rounded-2xl border border-cyber-green/50 bg-slate-900/90 backdrop-blur text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-cyber-green/20 border border-cyber-green text-cyber-green flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-10 h-10" />
          </div>

          <h2 className="text-3xl font-extrabold font-display text-cyber-green mb-1">
            ALL ROUNDS COMPLETED!
          </h2>
          <p className="text-xs font-mono text-slate-400 mb-6 uppercase tracking-wider">
            BUG HUNT 2026 COMPETITION CONCLUDED
          </p>

          <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 font-mono mb-6 space-y-3">
            <span className="text-xs text-slate-500 uppercase block">FINAL TOURNAMENT SCORE</span>
            <div className="text-6xl font-extrabold text-cyber-green">
              {totalScore} <span className="text-2xl text-slate-500">/ 50</span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800 text-xs">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">ROUND 1</span>
                <span className="text-cyber-cyan font-bold">{team?.r1_score || 0} / 10</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">ROUND 2</span>
                <span className="text-amber-400 font-bold">{team?.r2_score || 0} / 15</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">ROUND 3</span>
                <span className="text-cyber-green font-bold">{roundScore} / 25</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-mono font-bold text-sm uppercase tracking-wider transition shadow-lg"
              >
                RETURN TO TOURNAMENT LOBBY
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-dark text-slate-100 flex flex-col">
      
      {/* Participant Competition HUD */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-20 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
          
          <div className="flex items-center gap-2">
            <Bug className="w-5 h-5 text-cyber-green animate-pulse" />
            <span className="font-bold text-slate-200">BUG HUNT</span>
            <span className="text-slate-600">|</span>
            <span className="text-cyber-green font-semibold">ROUND 3 — IDENTIFY & CORRECT</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-slate-400">
              TEAM: <strong className="text-slate-100">{teamName}</strong> ({teamId})
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">
              ROUND SCORE: <strong className="text-cyber-green">{roundScore}</strong> / 25
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">
              TOTAL: <strong className="text-cyber-cyan">{(team?.r1_score || 0) + (team?.r2_score || 0) + roundScore}</strong> / 50
            </span>
            {onBack && (
              <button
                onClick={onBack}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-[11px] transition"
              >
                Exit
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Main Split-Panel Arena */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 flex flex-col md:flex-row gap-4">
        
        {/* LEFT PANEL: Challenge Specifications */}
        <div className="w-full md:w-5/12 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-5rem)] pr-1">
          
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-4 font-mono">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded bg-cyber-green/20 text-cyber-green font-bold text-xs">
                CHALLENGE {currentIndex + 1} OF 2 ({currentIndex === 0 ? '12 MARKS' : '13 MARKS'})
              </span>
              <span className="text-xs text-slate-500">{currentTask?.challenge_code}</span>
            </div>

            <h2 className="text-xl font-bold font-display text-slate-100">
              {currentTask?.title}
            </h2>

            <div className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
              <span className="text-slate-500 font-bold block uppercase text-[10px]">Problem Statement</span>
              <p>{currentTask?.description}</p>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
              <span className="text-slate-500 font-bold block uppercase text-[10px]">Expected Behavior</span>
              <p>{currentTask?.expected_behavior}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Input Format</span>
                <span className="text-slate-300">{currentTask?.input_format}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Output Format</span>
                <span className="text-slate-300">{currentTask?.output_format}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
              <span className="text-[10px] text-slate-500 uppercase block font-bold">Constraints</span>
              <code className="text-amber-400 font-mono text-[11px]">{currentTask?.constraints}</code>
            </div>

            {/* Visible Test Cases */}
            <div>
              <span className="text-slate-500 font-bold block uppercase text-[10px] mb-2">
                Sample Visible Test Cases (Hidden tests verified on submit)
              </span>
              <div className="space-y-2">
                {currentTask?.visible_tests?.map((t, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Test Case #{i + 1}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px]">Input: </span>
                      <code className="text-cyber-cyan">{t.input.replace(/\n/g, ' \\n ')}</code>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px]">Expected: </span>
                      <code className="text-cyber-green">{t.expected_output.replace(/\n/g, ' \\n ')}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Bug Identification & Faulty Line Inputs */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-3 font-mono">
            <h3 className="text-xs font-bold text-cyber-cyan uppercase tracking-wider">
              Diagnostic Audit (5 Marks Total)
            </h3>
            
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                1. Identify the Bug Nature (3 Marks)
              </label>
              <input
                type="text"
                value={identifiedBug}
                onChange={(e) => setIdentifiedBug(e.target.value)}
                placeholder="e.g. Off-by-one slice, Type mismatch, Negative number unhandled"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:border-cyber-cyan focus:outline-none"
                disabled={Boolean(submitFeedback)}
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                2. Faulty Line Number (2 Marks)
              </label>
              <input
                type="number"
                value={faultyLine}
                onChange={(e) => setFaultyLine(e.target.value)}
                placeholder="e.g. 6"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:border-cyber-cyan focus:outline-none"
                disabled={Boolean(submitFeedback)}
              />
            </div>
          </div>

        </div>

        {/* RIGHT PANEL: Python Code Editor + Execution Console */}
        <div className="w-full md:w-7/12 flex flex-col gap-4">
          
          {/* Code Editor Container */}
          <div className="flex-1 flex flex-col rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl min-h-[420px]">
            
            {/* Editor Toolbar */}
            <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-cyber-green/80" />
                <span className="ml-2 text-slate-400 font-bold">solution.py (Python 3.14)</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetCode}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1 transition"
                  title="Reset to initial buggy snippet"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>
            </div>

            {/* Python Codearea */}
            <div className="flex-1 relative flex">
              {/* Line Numbers column */}
              <div className="w-10 py-3 bg-slate-950 select-none text-right pr-2 text-slate-600 font-mono text-xs leading-relaxed border-r border-slate-800/60">
                {code.split('\n').map((_, idx) => (
                  <div key={idx}>{idx + 1}</div>
                ))}
              </div>

              {/* Textarea Code Input */}
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                disabled={Boolean(submitFeedback)}
                className="flex-1 p-3 bg-transparent text-cyber-green font-mono text-xs md:text-sm leading-relaxed focus:outline-none resize-none overflow-y-auto whitespace-pre font-medium"
                style={{ tabSize: 4 }}
              />
            </div>

            {/* Action Bar */}
            <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleRunVisibleTests}
                disabled={isRunningTest || Boolean(submitFeedback)}
                className="px-5 py-2 rounded-xl border border-cyber-cyan/50 bg-cyber-cyan/10 text-cyber-cyan hover:bg-cyber-cyan/20 font-mono text-xs font-bold transition flex items-center gap-2 disabled:opacity-40"
              >
                <Play className="w-3.5 h-3.5" />
                {isRunningTest ? 'Running Sandbox...' : 'Run Code (Visible Tests)'}
              </button>

              {!submitFeedback ? (
                <button
                  type="button"
                  onClick={handleSubmitSolution}
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyber-green to-emerald-500 text-slate-950 hover:opacity-90 font-mono text-xs font-bold transition flex items-center gap-2 disabled:opacity-40 shadow-[0_0_15px_#00ff8840]"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Evaluating All Tests...' : 'Submit Final Solution'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNextChallenge}
                  className="px-6 py-2 rounded-xl bg-cyber-cyan text-slate-950 hover:opacity-90 font-mono text-xs font-bold transition flex items-center gap-2"
                >
                  <span>{currentIndex + 1 >= tasks.length ? 'Finalize Round 3' : 'Next Python Challenge'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>

          {/* Test Console Output */}
          {testConsole && (
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 font-mono text-xs shadow-xl space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400 font-bold flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-cyber-cyan" />
                  Execution Console
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  testConsole.overall_status === 'ACCEPTED' ? 'bg-cyber-green/20 text-cyber-green' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {testConsole.overall_status}
                </span>
              </div>

              {testConsole.message && (
                <div className="text-rose-400 text-xs">{testConsole.message}</div>
              )}

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {testConsole.results?.map((res) => (
                  <div key={res.test_number} className="p-2 rounded bg-slate-900 border border-slate-800/80 text-[11px] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-semibold">Test #{res.test_number}</span>
                      <span className={res.status === 'PASSED' ? 'text-cyber-green font-bold' : 'text-rose-400 font-bold'}>
                        {res.status} ({res.duration_ms}ms)
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Output: </span>
                      <code className="text-slate-200">{res.actual_output || '(None)'}</code>
                    </div>
                    {res.error && (
                      <div className="text-rose-400 text-[10px] whitespace-pre-wrap">{res.error}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Official Submission Score Feedback */}
          {submitFeedback && (
            <div className="p-5 rounded-xl border border-cyber-green/50 bg-slate-900 font-mono text-xs shadow-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-cyber-green flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Solution Evaluated: +{submitFeedback.score_awarded} / {submitFeedback.max_marks} Marks
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-cyber-green/20 text-cyber-green font-bold">
                  {submitFeedback.overall_status}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[9px]">BUG IDENTIFIED</span>
                  <span className="text-cyber-cyan font-bold">{submitFeedback.breakdown?.bug_identification} / 3</span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[9px]">FAULTY LINE</span>
                  <span className="text-cyber-cyan font-bold">{submitFeedback.breakdown?.faulty_line} / 2</span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[9px]">CORRECT CODE</span>
                  <span className="text-cyber-green font-bold">{submitFeedback.breakdown?.correct_code} / {currentIndex === 0 ? 4 : 5}</span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[9px]">HIDDEN TESTS</span>
                  <span className="text-purple-400 font-bold">{submitFeedback.hidden_passed} / {submitFeedback.hidden_total} Passed</span>
                </div>
              </div>
            </div>
          )}

        </div>

      </main>
    </div>
  );
}
