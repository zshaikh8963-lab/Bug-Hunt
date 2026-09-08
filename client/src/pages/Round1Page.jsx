import React, { useState, useEffect, useRef } from 'react';
import { Bug, Clock, CheckCircle2, XCircle, ArrowRight, Trophy, AlertTriangle, Shield } from 'lucide-react';
import { api } from '../services/api';
import { soundService } from '../services/sound';

export default function Round1Page({ team, onRoundCompleted, onLeaderboardClick, onBack }) {
  const [tasks, setTasks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(team?.r1_score || 0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isRoundDone, setIsRoundDone] = useState(false);

  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  const teamId = team?.team_id || 'DEMO-001';
  const teamName = team?.team_name || 'Tournament Team';

  // Load Round 1 questions
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await api.getRoundTasks(teamId, 1);
      if (res.success && res.tasks && res.tasks.length > 0) {
        setTasks(res.tasks);

        // Resume at first unsubmitted question
        const submittedIndices = new Set((res.submissions || []).map(s => s.task_index));
        let nextIdx = 0;
        for (let i = 0; i < res.tasks.length; i++) {
          if (!submittedIndices.has(i)) {
            nextIdx = i;
            break;
          }
          if (i === res.tasks.length - 1) {
            // All 10 answered
            setIsRoundDone(true);
            nextIdx = res.tasks.length - 1;
          }
        }
        setCurrentIndex(nextIdx);
        setScore(res.round_scores?.r1 || 0);
      } else {
        setLoadError(res.error || 'No challenges currently available for Round 1.');
      }
    } catch (err) {
      console.error('Failed to load Round 1 tasks:', err);
      setLoadError('Failed to connect to competition server.');
    } finally {
      setLoading(false);
    }
  };

  // 30-Second Timer per question
  useEffect(() => {
    if (loading || isRoundDone || isSubmitted) return;

    setTimeLeft(30);
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeExpire();
          return 0;
        }
        if (prev <= 6) {
          soundService.playTimerTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [currentIndex, isSubmitted, loading, isRoundDone]);

  // Handle Timeout (Auto-lock with 0 marks)
  const handleTimeExpire = () => {
    soundService.playWrong();
    handleSubmitAnswer(-1); // -1 indicates timeout/unanswered
  };

  const handleSelectOption = (idx) => {
    if (isSubmitted) return;
    soundService.playClick();
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = async (forcedOption = null) => {
    if (isSubmitted) return;
    clearInterval(timerRef.current);

    const optionToSubmit = forcedOption !== null ? forcedOption : selectedOption;
    const currentTask = tasks[currentIndex];
    if (!currentTask) return;

    setIsSubmitted(true);
    const timeTaken = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));

    try {
      const res = await api.submitR1Answer({
        team_id: teamId,
        task_index: currentIndex,
        question_id: currentTask.id,
        selected_option_index: optionToSubmit,
        time_taken_sec: timeTaken
      });

      if (res.success) {
        if (res.is_correct) {
          soundService.playCorrect();
          setScore(prev => prev + 1);
        } else {
          soundService.playWrong();
        }
        setFeedback(res);
      }
    } catch (err) {
      console.error('Error submitting R1 answer:', err);
    }
  };

  const handleNextQuestion = () => {
    soundService.playClick();
    setSelectedOption(null);
    setIsSubmitted(false);
    setFeedback(null);

    if (currentIndex + 1 >= tasks.length) {
      setIsRoundDone(true);
      onRoundCompleted?.(1, score);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cyber-dark text-slate-100 flex items-center justify-center font-mono">
        <div className="text-center space-y-3">
          <Bug className="w-12 h-12 text-cyber-cyan animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Loading Round 1 Challenges...</p>
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
          <h2 className="text-xl font-bold text-slate-100">Round 1 Unavailable</h2>
          <p className="text-xs text-slate-400">
            {loadError || 'No questions currently active for Round 1 in the tournament database.'}
          </p>
          <div className="pt-2 flex gap-3 justify-center">
            <button
              onClick={loadTasks}
              className="px-4 py-2 rounded-xl bg-cyber-cyan text-slate-950 font-bold text-xs hover:bg-cyber-cyan/80 transition"
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

  // Round 1 Finished Screen
  if (isRoundDone) {
    return (
      <div className="min-h-screen bg-cyber-dark text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-xl w-full p-8 rounded-2xl border border-cyber-cyan/40 bg-slate-900/90 backdrop-blur text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-cyber-cyan/20 border border-cyber-cyan text-cyber-cyan flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8" />
          </div>

          <h2 className="text-3xl font-extrabold font-display text-slate-100 mb-1">
            ROUND 1 COMPLETE
          </h2>
          <p className="text-xs font-mono text-slate-400 mb-6 uppercase tracking-wider">
            BASIC MCQ STAGE FINISHED
          </p>

          <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 font-mono mb-6">
            <span className="text-xs text-slate-500 uppercase block mb-1">YOUR ROUND 1 SCORE</span>
            <div className="text-5xl font-extrabold text-cyber-green mb-1">
              {score} <span className="text-2xl text-slate-500">/ 10</span>
            </div>
            <p className="text-xs text-slate-400">
              {score >= 8 ? 'Outstanding accuracy! Strong performance.' : score >= 5 ? 'Good effort! Points recorded.' : 'Keep pushing in Round 2!'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onLeaderboardClick}
              className="flex-1 py-3 rounded-xl border border-cyber-cyan/50 bg-cyber-cyan/10 text-cyber-cyan font-mono font-bold text-xs hover:bg-cyber-cyan/20 transition flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              VIEW ROUND 1 LEADERBOARD
            </button>
            {onBack && (
              <button
                onClick={onBack}
                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono font-bold text-xs transition"
              >
                HOME
              </button>
            )}
          </div>

          <p className="text-[11px] font-mono text-slate-500 mt-6">
            Awaiting tournament admin to unlock Round 2 (Identify the Bug — Java).
          </p>
        </div>
      </div>
    );
  }

  const currentTask = tasks[currentIndex];

  return (
    <div className="min-h-screen bg-cyber-dark text-slate-100 flex flex-col">
      
      {/* Participant Competition HUD */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-20 px-4 py-3">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
          
          <div className="flex items-center gap-2">
            <Bug className="w-5 h-5 text-cyber-green animate-pulse" />
            <span className="font-bold text-slate-200">BUG HUNT</span>
            <span className="text-slate-600">|</span>
            <span className="text-cyber-cyan font-semibold">ROUND 1 — BASIC MCQ</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-slate-400">
              TEAM: <strong className="text-slate-100">{teamName}</strong> ({teamId})
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">
              SCORE: <strong className="text-cyber-green">{score}</strong> / 10
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
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 flex flex-col justify-center">
        
        {/* Progress & Countdown Header */}
        <div className="flex items-center justify-between mb-3 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-bold">
              QUESTION {currentIndex + 1} / 10
            </span>
            <span className="px-2 py-1 rounded bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan text-[11px]">
              {currentTask?.language}
            </span>
          </div>

          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border font-bold ${
            timeLeft <= 5 
              ? 'border-rose-500 bg-rose-500/20 text-rose-400 animate-bounce' 
              : 'border-slate-800 bg-slate-900 text-slate-200'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>TIME LEFT: 00:{String(timeLeft).padStart(2, '0')}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full mb-6 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyber-cyan to-cyber-green transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / 10) * 100}%` }}
          />
        </div>

        {/* Question Card */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur shadow-2xl mb-6">
          <h2 className="text-lg md:text-xl font-bold text-slate-100 mb-2">
            {currentTask?.title}
          </h2>
          <p className="text-sm text-slate-300 mb-4">
            {currentTask?.question_text}
          </p>

          {/* Code Snippet */}
          {currentTask?.code_snippet && (
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-cyber-green font-mono text-xs md:text-sm overflow-x-auto mb-6 leading-relaxed">
              <code>{currentTask.code_snippet}</code>
            </pre>
          )}

          {/* Options Grid */}
          <div className="space-y-2.5">
            {currentTask?.options?.map((option, idx) => {
              const isSelected = selectedOption === idx;
              let btnStyle = 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700';

              if (isSubmitted) {
                if (idx === feedback?.correct_option_index) {
                  btnStyle = 'border-cyber-green bg-cyber-green/15 text-cyber-green font-bold';
                } else if (isSelected && !feedback?.is_correct) {
                  btnStyle = 'border-rose-500 bg-rose-500/15 text-rose-400 line-through';
                }
              } else if (isSelected) {
                btnStyle = 'border-cyber-cyan bg-cyber-cyan/15 text-cyber-cyan font-bold ring-1 ring-cyber-cyan';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isSubmitted}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full p-3.5 rounded-xl border text-left font-mono text-xs md:text-sm transition flex items-center justify-between ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full border border-slate-700 bg-slate-900 flex items-center justify-center text-xs text-slate-400 font-bold shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                  </div>
                  {isSubmitted && idx === feedback?.correct_option_index && (
                    <CheckCircle2 className="w-5 h-5 text-cyber-green shrink-0" />
                  )}
                  {isSubmitted && isSelected && !feedback?.is_correct && (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback Explanation */}
          {feedback && (
            <div className={`mt-5 p-4 rounded-xl border font-mono text-xs leading-relaxed ${
              feedback.is_correct 
                ? 'border-cyber-green/40 bg-cyber-green/10 text-slate-200' 
                : 'border-rose-500/40 bg-rose-500/10 text-slate-200'
            }`}>
              <div className="font-bold mb-1 flex items-center gap-1.5">
                {feedback.is_correct ? (
                  <span className="text-cyber-green flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Correct! (+1 Mark)
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center gap-1">
                    <XCircle className="w-4 h-4" /> Incorrect (0 Marks)
                  </span>
                )}
              </div>
              <p className="text-slate-300 text-[11px]">{feedback.explanation}</p>
            </div>
          )}

        </div>

        {/* Action Controls */}
        <div className="flex justify-end">
          {!isSubmitted ? (
            <button
              onClick={() => handleSubmitAnswer()}
              disabled={selectedOption === null}
              className="px-8 py-3 rounded-xl bg-cyber-cyan text-slate-950 font-bold font-mono text-xs uppercase tracking-wider hover:bg-cyber-cyan/80 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Lock Answer & Submit
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyber-green to-emerald-500 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider hover:opacity-90 transition flex items-center gap-2"
            >
              <span>{currentIndex + 1 >= tasks.length ? 'Finish Round 1' : 'Next Question'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </main>
    </div>
  );
}
