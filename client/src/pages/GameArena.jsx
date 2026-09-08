import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HUD } from '../components/HUD';
import { CodeViewer } from '../components/CodeViewer';
import { AntiCheatModal } from '../components/AntiCheatModal';
import { BossIntroModal } from '../components/BossIntroModal';
import { useAntiCheat } from '../hooks/useAntiCheat';
import { api } from '../services/api';
import {
  playClick, playCorrect, playWrong, playCombo,
  playRoundWin, playGameOver
} from '../audio/soundEffects';
import { CheckCircle2, XCircle, AlertCircle, ArrowRight, Lightbulb, ShieldAlert, Sparkles, Send } from 'lucide-react';

const ROUND_TITLES = {
  1: 'SPOT THE BUG',
  2: 'DEBUG IT',
  3: 'BUG HUNT',
  4: 'BOSS BUG'
};

export const GameArena = ({ participant, sessionToken, onFinish, isDemo = false }) => {
  const [currentRound, setCurrentRound] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // HUD State
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(3);
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [timeLeft, setTimeLeft] = useState(30);
  const [maxTime, setMaxTime] = useState(30);

  // Question Interaction State
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [multiBugSelections, setMultiBugSelections] = useState([]);
  const [feedback, setFeedback] = useState(null); // { is_correct, points_earned, explanation, correct_answer }
  const [hintModal, setHintModal] = useState(null);
  const [showBossIntro, setShowBossIntro] = useState(false);
  const [roundCompletedModal, setRoundCompletedModal] = useState(false);

  // Stats tracking
  const startTimeRef = useRef(Date.now());
  const timerRef = useRef(null);

  // Anti-cheat hook
  const { tabSwitches, showWarningModal, warningMessage, closeWarningModal } = useAntiCheat(sessionToken, true);

  // Load questions for the current round
  const loadRoundQuestions = useCallback(async (roundNum) => {
    setLoading(true);
    try {
      const response = await api.getQuestions(roundNum);
      const roundQuestions = response.questions || [];
      setQuestions(roundQuestions);
      setCurrentQuestionIndex(0);
      setSelectedAnswer('');
      setMultiBugSelections([]);
      setFeedback(null);

      if (roundQuestions.length > 0) {
        const firstQ = roundQuestions[0];
        const roundTime = firstQ.time_limit_sec || (roundNum === 1 ? 30 : roundNum === 2 ? 60 : roundNum === 3 ? 300 : 600);
        setTimeLeft(roundTime);
        setMaxTime(roundTime);
      }

      // If entering Boss Round, trigger intro modal
      if (roundNum === 4) {
        setShowBossIntro(true);
      }
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoundQuestions(currentRound);
  }, [currentRound, loadRoundQuestions]);

  // Current Question Object
  const currentQuestion = questions[currentQuestionIndex] || null;

  // Handle Answer Submission
  const handleSubmitAnswer = useCallback(async (forcedTimeout = false) => {
    if (feedback || !currentQuestion) return;

    let answerToSubmit = forcedTimeout ? '' : (currentQuestion.question_type === 'multi_bug' ? multiBugSelections : selectedAnswer);

    if (!forcedTimeout && currentQuestion.question_type !== 'multi_bug' && !answerToSubmit) {
      return;
    }

    try {
      const timeTaken = maxTime - timeLeft;
      const result = await api.submitAnswer(
        sessionToken,
        currentQuestion.id,
        answerToSubmit,
        timeTaken
      );

      // Audio feedback
      if (result.is_correct) {
        playCorrect();
        if (result.session.combo > 1) {
          playCombo(result.session.combo);
        }
      } else {
        playWrong();
      }

      // Update HUD state
      setScore(result.session.score);
      setCombo(result.session.combo);
      setLives(result.session.lives);
      setFeedback({
        is_correct: result.is_correct,
        points_earned: result.points_earned,
        explanation: result.explanation,
        correct_answer: result.correct_answer
      });

      // Check Game Over (lives <= 0)
      if (result.session.lives <= 0) {
        playGameOver();
        setTimeout(async () => {
          const totalElapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
          const finishData = await api.finishGame(sessionToken, totalElapsed);
          onFinish(finishData.results);
        }, 2200);
      }
    } catch (err) {
      console.error('Answer submission error:', err);
    }
  }, [feedback, currentQuestion, multiBugSelections, selectedAnswer, maxTime, timeLeft, sessionToken, onFinish]);

  // Timer Tick
  useEffect(() => {
    if (feedback || loading || !currentQuestion) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmitAnswer(true); // Auto-submit when time expires
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [feedback, loading, currentQuestion, handleSubmitAnswer]);

  // Next Question / Round Advance
  const handleNext = () => {
    playClick();
    setFeedback(null);
    setSelectedAnswer('');
    setMultiBugSelections([]);

    if (currentQuestionIndex + 1 < questions.length) {
      // Next Question in Current Round
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      const nextQ = questions[nextIndex];
      const qTime = nextQ.time_limit_sec || 30;
      setTimeLeft(qTime);
      setMaxTime(qTime);
    } else {
      // Round Complete!
      if (currentRound < 4) {
        playRoundWin();
        setRoundCompletedModal(true);
      } else {
        // All 4 Rounds Finished!
        playRoundWin();
        handleFinishAll();
      }
    }
  };

  const handleStartNextRound = () => {
    playClick();
    setRoundCompletedModal(false);
    const nextRoundNum = currentRound + 1;
    setCurrentRound(nextRoundNum);
  };

  const handleFinishAll = async () => {
    try {
      const totalElapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
      const finishData = await api.finishGame(sessionToken, totalElapsed);
      onFinish(finishData.results);
    } catch (err) {
      console.error('Failed to finish game:', err);
    }
  };

  // Use Hint
  const handleUseHint = async () => {
    if (!currentQuestion || hintsRemaining <= 0 || feedback) return;
    try {
      const res = await api.requestHint(sessionToken, currentQuestion.id);
      setHintsRemaining(res.hints_remaining);
      setScore(res.score);
      setHintModal(res.hint);
    } catch (err) {
      console.error('Hint error:', err);
    }
  };

  // Toggle multi-bug selection
  const handleToggleMultiBug = (option) => {
    playClick();
    setMultiBugSelections(prev =>
      prev.includes(option) ? prev.filter(item => item !== option) : [...prev, option]
    );
  };

  if (loading && questions.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center font-mono text-cyber-neon cyber-grid">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-cyber-neon border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm tracking-widest uppercase">LOADING ROUND {currentRound} CHALLENGES...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto cyber-grid">
      
      {/* 1. Game HUD */}
      <HUD
        roundNum={currentRound}
        roundTitle={ROUND_TITLES[currentRound]}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={questions.length}
        timeLeft={timeLeft}
        maxTime={maxTime}
        score={score}
        combo={combo}
        lives={lives}
        hintsRemaining={hintsRemaining}
        onUseHint={handleUseHint}
        tabSwitches={tabSwitches}
      />

      {/* 2. Question Arena */}
      {currentQuestion && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Code Snippet & Inspection */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-cyber-card border border-cyber-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-mono tracking-widest text-cyber-cyan font-bold">
                  {currentQuestion.language} • {currentQuestion.difficulty.toUpperCase()}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  POINTS: +{currentQuestion.points} / -{currentQuestion.penalty}
                </span>
              </div>
              
              <h2 className="text-lg sm:text-xl font-black text-white mb-2">
                {currentQuestion.title}
              </h2>
              
              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                {currentQuestion.description}
              </p>
            </div>

            {/* Syntax Highlighted Code Viewer */}
            <CodeViewer
              code={currentQuestion.code_snippet}
              language={currentQuestion.language}
            />
          </div>

          {/* Right Column: Answers & Interaction Panel */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-cyber-card border border-cyber-border rounded-xl p-5 shadow-xl">
              
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyber-neon"></span>
                  {currentQuestion.question_type === 'multi_bug' 
                    ? 'SELECT ALL DETECTED BUGS' 
                    : currentQuestion.question_type === 'debug_fix'
                    ? 'CHOOSE CORRECT FIX PATCH'
                    : 'SELECT THE RUNTIME BUG'}
                </h3>
                {currentQuestion.question_type === 'multi_bug' && (
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                    MULTI-SELECT
                  </span>
                )}
              </div>

              {/* Options List */}
              <div className="space-y-2.5">
                {currentQuestion.options.map((option, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isSelected = currentQuestion.question_type === 'multi_bug'
                    ? multiBugSelections.includes(option)
                    : selectedAnswer === option;

                  return (
                    <button
                      key={idx}
                      disabled={feedback !== null}
                      onClick={() => {
                        if (currentQuestion.question_type === 'multi_bug') {
                          handleToggleMultiBug(option);
                        } else {
                          playClick();
                          setSelectedAnswer(option);
                        }
                      }}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-mono transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'bg-cyber-neon/15 border-cyber-neon text-white shadow-neon-sm font-semibold'
                          : 'bg-[#0b1120] border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-800/40'
                      } ${feedback ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-cyber-neon text-slate-950'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {letter}
                      </span>
                      <span className="leading-snug break-words flex-1">{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Submit Button (if no feedback yet) */}
              {!feedback ? (
                <button
                  onClick={() => handleSubmitAnswer(false)}
                  disabled={
                    currentQuestion.question_type === 'multi_bug'
                      ? multiBugSelections.length === 0
                      : !selectedAnswer
                  }
                  className="w-full mt-5 py-3.5 bg-gradient-to-r from-cyber-neon to-emerald-400 text-slate-950 font-black text-sm uppercase font-mono tracking-wider rounded-xl shadow-neon-sm hover:shadow-neon-md transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  <span>CONFIRM SUBMISSION</span>
                </button>
              ) : (
                /* Immediate Feedback Card */
                <div className={`mt-5 p-4 rounded-xl border animate-fade-in ${
                  feedback.is_correct
                    ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/60 text-rose-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {feedback.is_correct ? (
                      <CheckCircle2 className="w-5 h-5 text-cyber-neon" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-400" />
                    )}
                    <span className="font-mono font-black text-sm uppercase tracking-wider">
                      {feedback.is_correct ? 'CORRECT! ' : 'INCORRECT! '}
                      <span className={feedback.points_earned >= 0 ? 'text-cyber-neon' : 'text-rose-400'}>
                        ({feedback.points_earned >= 0 ? `+${feedback.points_earned}` : feedback.points_earned} PTS)
                      </span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans mb-3">
                    {feedback.explanation}
                  </p>

                  <button
                    onClick={handleNext}
                    className="w-full py-3 bg-white text-slate-950 font-extrabold text-sm uppercase font-mono tracking-wider rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>{currentQuestionIndex + 1 < questions.length ? 'NEXT QUESTION' : 'COMPLETE ROUND'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>
      )}

      {/* 3. Hint Display Modal */}
      {hintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#0f172a] border border-amber-500/60 rounded-2xl p-6 shadow-amber-md text-center">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500 flex items-center justify-center mx-auto mb-3 text-amber-400">
              <Lightbulb className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-amber-400 uppercase tracking-wider mb-2 font-mono">
              DEBUGGER CLUE REVEALED
            </h3>
            <p className="text-sm text-slate-200 leading-relaxed font-sans mb-4 bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
              "{hintModal}"
            </p>
            <p className="text-[11px] font-mono text-rose-400 mb-4">-5 points deducted from session score.</p>
            <button
              onClick={() => setHintModal(null)}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-lg font-mono tracking-wider transition-colors"
            >
              CLOSE CLUE
            </button>
          </div>
        </div>
      )}

      {/* 4. Round Completed Modal */}
      {roundCompletedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-cyber-card border-2 border-cyber-neon rounded-2xl p-6 shadow-neon-md text-center">
            <div className="w-16 h-16 rounded-full bg-cyber-neon/10 border-2 border-cyber-neon flex items-center justify-center mx-auto mb-4 text-cyber-neon">
              <Sparkles className="w-8 h-8 animate-spin" />
            </div>
            <span className="text-xs font-mono text-cyber-cyan uppercase tracking-widest">
              STAGE CLEARED
            </span>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight mt-1 mb-2">
              ROUND {currentRound} COMPLETE!
            </h2>
            <p className="text-sm text-slate-300 mb-5">
              Outstanding debugging performance! Prepare for {ROUND_TITLES[currentRound + 1]}.
            </p>
            <button
              onClick={handleStartNextRound}
              className="w-full py-3.5 bg-gradient-to-r from-cyber-neon to-cyber-cyan text-slate-950 font-black text-base uppercase font-mono tracking-wider rounded-xl shadow-neon-sm hover:shadow-neon-md transition-all flex items-center justify-center gap-2"
            >
              <span>ENTER ROUND {currentRound + 1}: {ROUND_TITLES[currentRound + 1]}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* 5. Boss Bug Entrance Alert Modal */}
      <BossIntroModal
        isOpen={showBossIntro}
        onDismiss={() => setShowBossIntro(false)}
      />

      {/* 6. Anti-Cheat Security Violation Overlay */}
      <AntiCheatModal
        isOpen={showWarningModal}
        violationCount={tabSwitches}
        message={warningMessage}
        onClose={closeWarningModal}
      />

    </div>
  );
};
