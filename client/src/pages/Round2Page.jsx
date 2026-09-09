import React, { useState, useEffect, useRef } from 'react';
import { Bug, Clock, CheckCircle2, XCircle, ArrowRight, Trophy, AlertTriangle, Sparkles, Layers } from 'lucide-react';
import { api } from '../services/api';
import { soundService } from '../services/sound';

export const BUG_TYPES = [
  'Syntax Error',
  'Compilation Error',
  'Logical Error',
  'Runtime Error',
  'Exception',
  'OOP Error'
];

export default function Round2Page({ team, onRoundCompleted, onLeaderboardClick, onBack }) {
  const [tasks, setTasks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedLine, setSelectedLine] = useState(null);
  const [selectedBugType, setSelectedBugType] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [roundScore, setRoundScore] = useState(team?.r2_score || 0);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes per question
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isRoundDone, setIsRoundDone] = useState(false);

  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  const teamId = team?.team_id || 'DEMO-001';
  const teamName = team?.team_name || 'Tournament Team';

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await api.getRoundTasks(teamId, 2);
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
        setRoundScore(res.round_scores?.r2 || 0);
      } else {
        setLoadError(res.error || 'No challenges currently available for Round 2.');
      }
    } catch (err) {
      console.error('Failed to load Round 2 tasks:', err);
      setLoadError('Failed to connect to competition server.');
    } finally {
      setLoading(false);
    }
  };

  // 3-Minute (180 Seconds) Timer per Challenge
  useEffect(() => {
    if (loading || isRoundDone || isSubmitted || tasks.length === 0) return;

    setTimeLeft(180);
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeExpire();
          return 0;
        }
        if (prev <= 10) {
          soundService.playTimerTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [currentIndex, isSubmitted, loading, isRoundDone, tasks.length]);

  const handleTimeExpire = () => {
    soundService.playWrong();
    // Auto-submit with whatever is selected or -1/None
    submitAnswer(selectedLine !== null ? selectedLine : -1, selectedBugType || 'None');
  };

  const handleSubmit = async () => {
    if (isSubmitted || selectedLine === null || !selectedBugType) return;
    clearInterval(timerRef.current);
    submitAnswer(selectedLine, selectedBugType);
  };

  const submitAnswer = async (line, bugType) => {
    if (isSubmitted) return;
    const currentTask = tasks[currentIndex];
    if (!currentTask) return;

    setIsSubmitted(true);
    soundService.playClick();

    const timeTaken = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));

    try {
      const res = await api.submitR2Answer({
        team_id: teamId,
        task_index: currentIndex,
        question_id: currentTask.id,
        selected_line: line,
        selected_bug_type: bugType,
        time_taken_sec: timeTaken
      });

      if (res.success) {
        if (res.score_awarded > 0) {
          soundService.playCorrect();
        } else {
          soundService.playWrong();
        }
        setRoundScore(prev => prev + res.score_awarded);
        setFeedback(res);
      }
    } catch (err) {
      console.error('Failed to submit Round 2 answer:', err);
    }
  };

  const handleNextChallenge = () => {
    soundService.playClick();
    setSelectedLine(null);
    setSelectedBugType(null);
    setIsSubmitted(false);
    setFeedback(null);

    if (currentIndex + 1 >= tasks.length) {
      setIsRoundDone(true);
      onRoundCompleted?.(2, roundScore);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cyber-dark text-slate-100 flex items-center justify-center font-mono">
        <div className="text-center space-y-3">
          <Bug className="w-12 h-12 text-amber-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Loading Round 2 Java Challenges...</p>
        </div>
      </div>
    );
  }

  // Load Error or No Tasks Available
  if (loadError || tasks.length === 0) {
    return (
      <div className="min-h-screen bg-cyber-dark text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-2xl border border-slate-800 bg-slate-900/90 text-center font-mono space-y-4">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
          <h2 className="text-xl font-bold text-slate-100">Round 2 Unavailable</h2>
          <p className="text-xs text-slate-400">
            {loadError || 'No Java challenges currently active for Round 2 in the tournament database.'}
          </p>
          <div className="pt-2 flex gap-3 justify-center">
            <button
              onClick={loadTasks}
              className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition"
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

  // Round 2 Completion View
  if (isRoundDone) {
    return (
      <div className="min-h-screen bg-cyber-dark text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-xl w-full p-8 rounded-2xl border border-amber-400/40 bg-slate-900/90 backdrop-blur text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-400 text-amber-400 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8" />
          </div>

          <h2 className="text-3xl font-extrabold font-display text-slate-100 mb-1">
            ROUND 2 COMPLETE
          </h2>
          <p className="text-xs font-mono text-slate-400 mb-6 uppercase tracking-wider">
            JAVA BUG IDENTIFICATION STAGE FINISHED
          </p>

          <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 font-mono mb-6">
            <span className="text-xs text-slate-500 uppercase block mb-1">YOUR ROUND 2 SCORE</span>
            <div className="text-5xl font-extrabold text-amber-400 mb-1">
              {roundScore} <span className="text-2xl text-slate-500">/ 15</span>
            </div>
            <div className="text-xs text-slate-400 mt-2">
              Cumulative Score (R1 + R2): <strong className="text-cyber-green">{(team?.r1_score || 0) + roundScore} / 25</strong>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-mono font-bold text-xs uppercase tracking-wider transition shadow-lg"
              >
                RETURN TO TOURNAMENT LOBBY
              </button>
            )}
          </div>

          <p className="text-[11px] font-mono text-slate-500 mt-6">
            Awaiting tournament admin to unlock Round 3 (Identify & Correct — Python).
          </p>
        </div>
      </div>
    );
  }

  const currentTask = tasks[currentIndex];

  // Parse lines from code snippet
  const rawLines = (currentTask?.code_snippet || '').split('\n');
  const codeLines = rawLines.map((line, idx) => {
    const match = line.match(/^(\d+)\s+(.*)$/);
    if (match) {
      return { num: parseInt(match[1], 10), content: match[2] };
    }
    return { num: idx + 1, content: line };
  });

  return (
    <div className="min-h-screen bg-cyber-dark text-slate-100 flex flex-col">
      
      {/* Participant Competition HUD */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-20 px-4 py-3">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
          
          <div className="flex items-center gap-2">
            <Bug className="w-5 h-5 text-amber-400 animate-pulse" />
            <span className="font-bold text-slate-200">BUG HUNT</span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400 font-semibold">ROUND 2 — IDENTIFY THE BUG</span>
          </div>

          <div className="flex items-center gap-4">
            {/* 3-Minute Countdown Timer */}
            {!isSubmitted && !isRoundDone && (
              <div className={`px-3 py-1 rounded-full border flex items-center gap-1.5 font-bold transition ${
                timeLeft <= 30
                  ? 'border-rose-500 bg-rose-500/20 text-rose-400 animate-pulse'
                  : 'border-amber-400/40 bg-amber-500/10 text-amber-300'
              }`}>
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}

            <span className="text-slate-400">
              TEAM: <strong className="text-slate-100">{teamName}</strong> ({teamId})
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">
              ROUND SCORE: <strong className="text-amber-400">{roundScore}</strong> / 15
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

      {/* Main Challenge Arena */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6 flex flex-col">
        
        {/* Header Indicators */}
        <div className="flex items-center justify-between mb-4 font-mono text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded bg-slate-800 text-slate-200 font-bold">
              CHALLENGE {currentIndex + 1} / 3
            </span>
            <span className={`px-2.5 py-1 rounded border text-[11px] font-bold uppercase tracking-wider ${
              (currentTask?.difficulty || '').toLowerCase() === 'easy'
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                : (currentTask?.difficulty || '').toLowerCase() === 'hard'
                ? 'border-rose-500/40 bg-rose-500/10 text-rose-400'
                : 'border-amber-400/40 bg-amber-500/10 text-amber-400'
            }`}>
              [{currentTask?.difficulty || (currentIndex === 0 ? 'Easy' : currentIndex === 1 ? 'Moderate' : 'Hard')}]
            </span>
            <span className="px-2 py-1 rounded bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 font-bold">
              JAVA (5 MARKS)
            </span>
            <span className="hidden sm:inline-block text-[11px] text-slate-500 font-normal">
              • Sequence: Easy → Moderate → Hard
            </span>
          </div>

          <div className="text-[11px] text-slate-400">
            Scoring: Correct Buggy Line = <span className="text-cyber-green font-bold">2 Marks</span> • Correct Bug Type = <span className="text-cyber-cyan font-bold">3 Marks</span>
          </div>
        </div>

        {/* Challenge Description */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur mb-4">
          <h2 className="text-lg font-bold text-slate-100 mb-1">
            {currentTask?.title}
          </h2>
          <p className="text-xs text-slate-300">
            {currentTask?.description}
          </p>
        </div>

        {/* Code Viewer with Clickable Lines */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl mb-6">
          <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Java Source Code (Click a line or select below)</span>
            <span className="text-[11px] text-slate-500">Target Line Selection</span>
          </div>

          <div className="p-4 font-mono text-xs md:text-sm overflow-x-auto space-y-1">
            {codeLines.map((lineObj) => {
              const isSelected = selectedLine === lineObj.num;
              const isActualBuggy = isSubmitted && lineObj.num === feedback?.actual_buggy_line;

              let lineBg = 'hover:bg-slate-900/60 cursor-pointer text-slate-300';
              if (isActualBuggy) {
                lineBg = 'bg-rose-500/20 border-l-4 border-rose-500 text-rose-300 font-bold';
              } else if (isSelected) {
                lineBg = 'bg-cyber-cyan/20 border-l-4 border-cyber-cyan text-cyber-cyan font-bold';
              }

              return (
                <div
                  key={lineObj.num}
                  onClick={() => !isSubmitted && setSelectedLine(lineObj.num)}
                  className={`flex items-center gap-4 px-3 py-1 rounded transition ${lineBg}`}
                >
                  <span className="w-6 text-right text-slate-500 select-none text-xs">
                    {lineObj.num}
                  </span>
                  <pre className="font-mono flex-1 leading-relaxed">
                    <code>{lineObj.content}</code>
                  </pre>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dual Selection Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          
          {/* Step 1: Line Selection */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80">
            <label className="block text-xs font-mono font-bold text-cyber-cyan uppercase mb-2">
              1. Which line contains the bug? (2 Marks)
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-1">
              {codeLines.map((lineObj) => {
                const isSelected = selectedLine === lineObj.num;
                return (
                  <button
                    key={lineObj.num}
                    type="button"
                    disabled={isSubmitted}
                    onClick={() => { soundService.playClick(); setSelectedLine(lineObj.num); }}
                    className={`py-2 rounded-lg border font-mono text-xs font-bold transition ${
                      isSelected
                        ? 'border-cyber-cyan bg-cyber-cyan/20 text-cyber-cyan ring-1 ring-cyber-cyan'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    Line {lineObj.num}
                  </button>
                );
              })}
            </div>
            {selectedLine !== null && (
              <p className="text-[11px] font-mono text-cyber-cyan mt-2">
                Selected: <strong className="underline">Line {selectedLine}</strong>
              </p>
            )}
          </div>

          {/* Step 2: Bug Type Selection */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80">
            <label className="block text-xs font-mono font-bold text-amber-400 uppercase mb-2">
              2. What type of bug is present? (3 Marks)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {BUG_TYPES.map((type) => {
                const isSelected = selectedBugType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    disabled={isSubmitted}
                    onClick={() => { soundService.playClick(); setSelectedBugType(type); }}
                    className={`p-2.5 rounded-lg border font-mono text-xs font-bold transition text-left ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/20 text-amber-400 ring-1 ring-amber-400'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
            {selectedBugType && (
              <p className="text-[11px] font-mono text-amber-400 mt-2">
                Selected Bug Type: <strong className="underline">{selectedBugType}</strong>
              </p>
            )}
          </div>

        </div>

        {/* Feedback Section */}
        {feedback && (
          <div className={`p-4 rounded-xl border font-mono text-xs mb-6 ${
            feedback.score_awarded === 5 
              ? 'border-cyber-green/50 bg-cyber-green/10 text-slate-200'
              : feedback.score_awarded > 0
              ? 'border-amber-400/50 bg-amber-500/10 text-slate-200'
              : 'border-rose-500/50 bg-rose-500/10 text-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm flex items-center gap-2">
                {feedback.score_awarded === 5 ? (
                  <span className="text-cyber-green flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Perfect Identification! (+5 Marks)
                  </span>
                ) : (
                  <span className="text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> Partial Score: +{feedback.score_awarded} / 5 Marks
                  </span>
                )}
              </span>
              <div className="flex gap-3 text-[11px]">
                <span>Buggy Line: {feedback.line_correct ? '✓ Correct (2pts)' : `✗ Faulty Line was ${feedback.actual_buggy_line}`}</span>
                <span>Bug Type: {feedback.type_correct ? '✓ Correct (3pts)' : `✗ Type was ${feedback.actual_bug_type}`}</span>
              </div>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {feedback.explanation}
            </p>
          </div>
        )}

        {/* Submit Controls */}
        <div className="flex justify-end mt-auto">
          {!isSubmitted ? (
            <button
              onClick={handleSubmit}
              disabled={selectedLine === null || !selectedBugType}
              className="px-8 py-3.5 rounded-xl bg-amber-400 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider hover:bg-amber-300 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20"
            >
              Submit Bug Identification
            </button>
          ) : (
            <button
              onClick={handleNextChallenge}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyber-green to-emerald-500 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider hover:opacity-90 transition flex items-center gap-2 shadow-lg shadow-cyber-green/20"
            >
              <span>{currentIndex + 1 >= tasks.length ? 'Finish Round 2' : 'Next Java Challenge'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </main>
    </div>
  );
}
