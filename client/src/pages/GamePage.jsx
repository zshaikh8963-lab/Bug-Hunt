import React, { useState, useEffect, useRef } from 'react';
import { 
  Bug, AlertTriangle, CheckCircle, XCircle, Lightbulb, Zap, 
  ArrowRight, Skull, ShieldAlert, Sparkles, Edit3, Code2, Play 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { soundService } from '../services/sound';
import GameHUD from '../components/GameHUD';
import CodeEditor from '../components/CodeEditor';
import AntiCheatModal from '../components/AntiCheatModal';

export default function GamePage({ session, participant, onFinishGame }) {
  // Game state
  const [currentRound, setCurrentRound] = useState(session.current_round || 1);
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(session.score || 0);
  const [combo, setCombo] = useState(session.combo || 0);
  const [lives, setLives] = useState(session.lives !== undefined ? session.lives : 3);
  const [hintsRemaining, setHintsRemaining] = useState(session.hints_remaining !== undefined ? session.hints_remaining : 3);
  const [bugsFound, setBugsFound] = useState(session.bugs_found || 0);
  const [loading, setLoading] = useState(true);

  // Question / Round Timer
  const [timeLeft, setTimeLeft] = useState(30);
  const [totalTimeTaken, setTotalTimeTaken] = useState(0);

  // Code editor state (for in-editor code fixing in Rounds 2, 3, 4)
  const [editedCode, setEditedCode] = useState('');
  const [showSolution, setShowSolution] = useState(false);

  // Active answer feedback
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [feedback, setFeedback] = useState(null); // { is_correct, points_earned, correct_answer, solution_code, validation_feedback, explanation }
  const [activeHint, setActiveHint] = useState(null);

  // Boss Bug Entrance Animation Overlay
  const [showBossIntro, setShowBossIntro] = useState(false);

  // Anti-cheat detection
  const [showAntiCheatModal, setShowAntiCheatModal] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(session.tab_switches || 0);

  // Round transition modal
  const [roundCompletedModal, setRoundCompletedModal] = useState(false);

  const timerRef = useRef(null);

  // 1. Fetch questions for current round
  useEffect(() => {
    loadRoundQuestions(currentRound);
  }, [currentRound]);

  const loadRoundQuestions = async (roundNum) => {
    setLoading(true);
    try {
      if (roundNum === 4) {
        setShowBossIntro(true);
        soundService.playBossAlert();
        setTimeout(() => setShowBossIntro(false), 3500);
      }

      const res = await api.getRoundQuestions(roundNum, session.session_token);
      if (res.success && res.questions?.length > 0) {
        setQuestions(res.questions);
        setQuestionIndex(0);
        setEditedCode(res.questions[0].code_snippet || '');
        setSelectedOption(null);
        setAnswerSubmitted(false);
        setFeedback(null);
        setActiveHint(null);
        setShowSolution(false);

        // Set initial timer based on round specifications
        if (roundNum === 3) {
          setTimeLeft(300); // 5 minutes for Round 3
        } else if (roundNum === 4) {
          setTimeLeft(600); // 10 minutes for Boss Bug
        } else {
          setTimeLeft(res.questions[0].time_limit_sec || 30);
        }
      }
    } catch (err) {
      console.error('Failed to load round questions', err);
    } finally {
      setLoading(false);
    }
  };

  // Synchronize edited code whenever questionIndex changes
  useEffect(() => {
    if (questions[questionIndex]) {
      setEditedCode(questions[questionIndex].code_snippet || '');
    }
  }, [questionIndex, questions]);

  // 2. Timer Loop
  useEffect(() => {
    if (loading || answerSubmitted || showBossIntro || roundCompletedModal) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });

      setTotalTimeTaken(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [loading, answerSubmitted, showBossIntro, roundCompletedModal, questionIndex, currentRound]);

  // 3. Handle Timeout
  const handleTimeOut = () => {
    if (answerSubmitted) return;
    soundService.playWrong();
    submitAnswer('TIMEOUT_UNANSWERED', true);
  };

  // 4. Anti-Cheat Surveillance: Tab Visibility & Blur detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerCheatWarning();
      }
    };

    const handleBlur = () => {
      triggerCheatWarning();
    };

    const handleContextMenu = (e) => {
      e.preventDefault(); // Prevent right-click during contest
    };

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'BUG HUNT in progress! Are you sure you want to exit?';
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [session.session_token]);

  const triggerCheatWarning = async () => {
    setTabSwitchCount(prev => prev + 1);
    setShowAntiCheatModal(true);
    soundService.playWrong();
    await api.logTabSwitch(session.session_token);
  };

  // 5. Submit Answer
  const currentQuestion = questions[questionIndex];

  const submitAnswer = async (forcedAnswer = null, isTimeout = false) => {
    if (!currentQuestion || answerSubmitted) return;

    let answerToSubmit = forcedAnswer;
    if (answerToSubmit === null) {
      if (currentRound === 1) {
        answerToSubmit = selectedOption;
      } else {
        answerToSubmit = editedCode;
      }
    }

    if (!answerToSubmit && !isTimeout) return;

    clearInterval(timerRef.current);
    setAnswerSubmitted(true);

    try {
      const timeTaken = (currentQuestion.time_limit_sec || 30) - timeLeft;
      const res = await api.submitAnswer(
        session.session_token,
        currentQuestion.id,
        answerToSubmit,
        Math.max(1, timeTaken)
      );

      if (res.success) {
        setFeedback(res);
        setScore(res.current_score);
        setCombo(res.combo);
        setBugsFound(res.bugs_found);

        if (res.is_correct) {
          soundService.playCorrect();
          if (res.combo > 1) {
            soundService.playCombo(res.combo);
          }
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.7 }
          });
        } else {
          soundService.playWrong();
        }
      }

    } catch (err) {
      console.error('Answer submission error', err);
    }
  };

  // 6. Use Hint
  const handleUseHint = async () => {
    if (!currentQuestion || hintsRemaining <= 0 || activeHint) return;
    soundService.playClick();

    try {
      const res = await api.useHint(session.session_token, currentQuestion.id);
      if (res.success) {
        setActiveHint(res.hint);
        setHintsRemaining(res.hints_remaining);
        setScore(res.current_score);
      }
    } catch (err) {
      console.error('Hint error', err);
    }
  };

  // 7. Advance to Next Question or Next Round
  const handleNext = () => {
    soundService.playClick();

    // If more questions in current round
    if (questionIndex < questions.length - 1) {
      const nextIdx = questionIndex + 1;
      setQuestionIndex(nextIdx);
      setEditedCode(questions[nextIdx]?.code_snippet || '');
      setSelectedOption(null);
      setAnswerSubmitted(false);
      setFeedback(null);
      setActiveHint(null);
      setShowSolution(false);

      // Reset timer if round 1 or 2
      if (currentRound <= 2) {
        setTimeLeft(questions[nextIdx]?.time_limit_sec || 30);
      }
    } else {
      // Round completed!
      if (currentRound < 4) {
        soundService.playRoundComplete();
        setRoundCompletedModal(true);
      } else {
        // Completed all 4 rounds!
        handleGameComplete();
      }
    }
  };

  const handleStartNextRound = () => {
    soundService.playClick();
    setRoundCompletedModal(false);
    setCurrentRound(prev => prev + 1);
  };

  const handleGameComplete = async () => {
    soundService.playVictory();
    const res = await api.finishGame(session.session_token, totalTimeTaken);
    onFinishGame(res.final_stats, participant, false);
  };

  if (loading && questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] font-mono space-y-4">
        <div className="w-12 h-12 border-4 border-cyber-cyan border-t-transparent rounded-full animate-spin" />
        <p className="text-cyber-cyan text-sm tracking-widest uppercase animate-pulse">
          INITIALIZING ARENA • ROUND {currentRound}...
        </p>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="text-center py-20 font-mono text-slate-400">
        No challenges available for Round {currentRound}.
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-fade-in relative pb-12">
      
      {/* Anti-Cheat Modal Guard */}
      <AntiCheatModal
        isOpen={showAntiCheatModal}
        switchCount={tabSwitchCount}
        onAcknowledge={() => setShowAntiCheatModal(false)}
      />

      {/* Boss Bug Entrance Warning Alert Overlay */}
      {showBossIntro && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-6 text-center animate-fade-in">
          <Skull className="w-24 h-24 text-cyber-red animate-bounce mb-4 drop-shadow-[0_0_25px_rgba(255,0,60,0.8)]" />
          <div className="font-mono text-xs text-cyber-red tracking-widest uppercase mb-2">
            ⚠️ ANOMALY DETECTED
          </div>
          <h2 className="text-4xl sm:text-6xl font-black font-mono text-white tracking-tight mb-2">
            BOSS BUG DETECTED
          </h2>
          <p className="font-mono text-slate-300 text-sm max-w-lg mb-6">
            FINAL HIGH-STAKES ARENA: Edit and repair concurrency deadlocks, memory corruptions, and rate limiters!
          </p>
          <div className="font-mono text-xs text-cyber-amber animate-pulse">
            INITIALIZING CHALLENGE ENVIRONMENT...
          </div>
        </div>
      )}

      {/* Round Complete Transition Modal */}
      {roundCompletedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-cyber-green rounded-2xl p-6 text-center shadow-neon-green">
            <div className="w-16 h-16 rounded-full bg-cyber-green/20 border border-cyber-green mx-auto flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-cyber-green animate-spin" />
            </div>
            <h3 className="text-2xl font-bold font-mono text-white mb-1">
              ROUND {currentRound} COMPLETE!
            </h3>
            <p className="text-xs font-mono text-cyber-green mb-6">
              EXCELLENT WORK, HUNTER.
            </p>

            <div className="p-4 rounded-xl bg-slate-800/80 border border-cyber-border mb-6 text-left font-mono text-xs space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>Current Score:</span>
                <span className="text-cyber-green font-bold">{score} PTS</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Bugs Slayed:</span>
                <span className="text-cyber-cyan font-bold">{bugsFound}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Next Challenge:</span>
                <span className="text-cyber-purple font-bold">
                  {currentRound === 1 ? 'ROUND 2: DEBUG IT (CODE FIX)' : currentRound === 2 ? 'ROUND 3: BUG HUNT (MULTI-BUG FIX)' : 'ROUND 4: BOSS BUG ⚠️'}
                </span>
              </div>
            </div>

            <button
              onClick={handleStartNextRound}
              className="w-full py-3.5 px-4 rounded-xl bg-cyber-green hover:bg-emerald-400 text-black font-mono font-bold text-sm uppercase tracking-wider transition-all shadow-neon-green cursor-pointer"
            >
              PROCEED TO ROUND {currentRound + 1}
            </button>
          </div>
        </div>
      )}

      {/* Game HUD (Timer, Score, Multiplier, Hints) */}
      <GameHUD
        roundNum={currentRound}
        questionIndex={questionIndex}
        totalQuestions={questions.length}
        timeLeft={timeLeft}
        score={score}
        combo={combo}
        hintsRemaining={hintsRemaining}
        bugsFound={bugsFound}
        onUseHint={handleUseHint}
        isHintUsed={Boolean(activeHint)}
      />

      {/* Main Play Area Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Question Details & Code Snippet (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Question Title & Prompt Card */}
          <div className="cyber-card rounded-xl p-5 border border-cyber-border">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-cyber-cyan bg-cyber-cyan/10 px-2 py-0.5 rounded border border-cyber-cyan/30 uppercase">
                  {currentQuestion.language}
                </span>
                <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  {currentQuestion.difficulty}
                </span>
                {currentRound >= 2 && (
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded font-bold uppercase">
                    Direct Code Edit
                  </span>
                )}
              </div>
              <div className="text-xs font-mono text-slate-400">
                <span className="text-cyber-green font-bold">+{currentQuestion.points}</span> / <span className="text-cyber-red">-{currentQuestion.penalty}</span>
              </div>
            </div>

            <h2 className="text-lg sm:text-xl font-bold font-mono text-white mb-2">
              {currentQuestion.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
              {currentQuestion.description}
            </p>
          </div>

          {/* Interactive Code Editor (Editable for Rounds 2-4, Read-Only for Round 1) */}
          <CodeEditor
            code={currentRound === 1 ? currentQuestion.code_snippet : editedCode}
            originalCode={currentQuestion.code_snippet}
            language={currentQuestion.language}
            title={currentQuestion.title}
            isEditable={currentRound >= 2 && !answerSubmitted}
            onChange={setEditedCode}
            onReset={() => setEditedCode(currentQuestion.code_snippet)}
          />

          {/* Active Hint Box (if participant unlocked a hint) */}
          {activeHint && (
            <div className="p-4 rounded-xl bg-purple-950/40 border border-cyber-purple/60 text-purple-200 text-xs font-mono flex items-start gap-3 animate-fade-in shadow-neon-purple">
              <Lightbulb className="w-5 h-5 text-cyber-purple shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-purple-300 uppercase mb-1">DECRYPTED CLUE (-5 PTS):</div>
                <p className="leading-relaxed">{activeHint}</p>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Answers Selection OR Code Fix Action Deck (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          
          <div className="cyber-card rounded-xl p-5 border border-cyber-border flex-1 flex flex-col justify-between">
            <div>
              
              {/* Header Title depending on Round */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-cyber-border/60">
                {currentRound === 1 ? (
                  <>
                    <span className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider">
                      SELECT THE BUG / EXCEPTION
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Rapid Single Choice
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider flex items-center gap-2">
                      <Edit3 className="w-3.5 h-3.5 text-cyber-green" />
                      {currentRound === 2 ? 'DEBUG IT: CODE FIX' : currentRound === 3 ? 'BUG HUNT: MULTI-FIX' : 'BOSS BUG: REPAIR SYSTEM'}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded">
                      In-Editor Mode
                    </span>
                  </>
                )}
              </div>

              {/* ROUND 1: Multiple Choice Options */}
              {currentRound === 1 ? (
                <div className="space-y-3">
                  {currentQuestion.options && currentQuestion.options.map((option, idx) => {
                    const optLetter = String.fromCharCode(65 + idx);
                    const isSelected = selectedOption === option;

                    let optClass = 'bg-slate-900 hover:bg-slate-800/80 border-cyber-border text-slate-200';
                    
                    if (isSelected && !answerSubmitted) {
                      optClass = 'bg-cyber-green/15 border-cyber-green text-white shadow-neon-green';
                    }

                    if (answerSubmitted) {
                      if (feedback && feedback.correct_answer === option) {
                        optClass = 'bg-emerald-950/60 border-emerald-500 text-emerald-300';
                      } else if (isSelected && !feedback?.is_correct) {
                        optClass = 'bg-red-950/60 border-cyber-red text-red-300';
                      } else {
                        optClass = 'bg-slate-950 border-slate-800 text-slate-500 opacity-60';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={answerSubmitted}
                        onClick={() => {
                          soundService.playClick();
                          setSelectedOption(option);
                        }}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 font-mono text-xs sm:text-sm ${optClass} cursor-pointer`}
                      >
                        <span className={`w-6 h-6 rounded flex items-center justify-center shrink-0 text-xs font-bold ${
                          isSelected ? 'bg-cyber-green text-black' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {optLetter}
                        </span>
                        <span className="flex-1 leading-snug pt-0.5">{option}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* ROUNDS 2, 3, 4: In-Editor Code Fix Diagnostics Console */
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-cyber-border font-mono text-xs space-y-3">
                    <div className="flex items-center justify-between text-slate-400 text-[11px] border-b border-slate-800 pb-2">
                      <span className="font-bold text-cyber-cyan">MISSION OBJECTIVE:</span>
                      <span className="text-emerald-400 font-semibold">Live Interactive Patch</span>
                    </div>

                    <p className="text-slate-200 leading-relaxed">
                      Analyze the faulty code in the editor on the left. Type your correction directly into the code area, then run validation to test your patch!
                    </p>

                    <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800 space-y-1 text-[11px]">
                      <div className="flex justify-between text-slate-400">
                        <span>Editor Status:</span>
                        <span className={`font-bold ${editedCode !== currentQuestion.code_snippet ? 'text-cyber-green' : 'text-slate-400'}`}>
                          {editedCode !== currentQuestion.code_snippet ? 'MODIFICATIONS DETECTED' : 'ORIGINAL CODE'}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Target Points:</span>
                        <span className="text-cyber-green font-bold">+{currentQuestion.points} PTS</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Wrong Fix Penalty:</span>
                        <span className="text-cyber-red font-bold">-{currentQuestion.penalty} PTS</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 italic">
                      Tip: Use <span className="text-cyber-cyan font-bold">Tab</span> for 4-space indentation, or click <span className="text-cyber-cyan font-bold">Reset</span> to restore the original code snippet.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Submit / Next Action Bar */}
            <div className="mt-6 pt-4 border-t border-cyber-border/60">
              
              {!answerSubmitted ? (
                currentRound === 1 ? (
                  <button
                    onClick={() => submitAnswer()}
                    disabled={!selectedOption}
                    className={`w-full py-3.5 px-4 rounded-xl font-mono font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                      selectedOption
                        ? 'bg-cyber-green hover:bg-emerald-400 text-black shadow-neon-green cursor-pointer'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    <span>LOCK IN ANSWER</span>
                    <Zap className="w-4 h-4 fill-black" />
                  </button>
                ) : (
                  <button
                    onClick={() => submitAnswer()}
                    className="w-full py-3.5 px-4 rounded-xl font-mono font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all bg-cyber-green hover:bg-emerald-400 text-black shadow-neon-green cursor-pointer"
                  >
                    <span>RUN PATCH & SUBMIT FIX</span>
                    <Zap className="w-4 h-4 fill-black" />
                  </button>
                )
              ) : (
                <button
                  onClick={handleNext}
                  className="w-full py-3.5 px-4 rounded-xl bg-cyber-cyan hover:bg-cyan-400 text-black font-mono font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-neon-cyan cursor-pointer"
                >
                  <span>NEXT CHALLENGE</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

            </div>

          </div>

          {/* Feedback & Explanation Card (Appears after locking answer) */}
          {feedback && (
            <div className={`p-4 rounded-xl border font-mono text-xs animate-fade-in space-y-2 ${
              feedback.is_correct 
                ? 'bg-emerald-950/40 border-cyber-green text-emerald-200 shadow-neon-green'
                : 'bg-red-950/40 border-cyber-red text-red-200 shadow-neon-crimson'
            }`}>
              <div className="flex items-center gap-2 font-bold mb-1.5">
                {feedback.is_correct ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-cyber-green shrink-0" />
                    <span className="text-cyber-green uppercase">
                      {currentRound === 1 ? 'BUG ERADICATED!' : 'TEST PASSED: BUG FIXED!'} (+{feedback.points_earned} PTS)
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-cyber-red shrink-0" />
                    <span className="text-cyber-red uppercase">
                      {currentRound === 1 ? 'INCORRECT IDENTIFICATION' : 'TEST FAILED: BUG PERSISTS'} ({feedback.points_earned} PTS)
                    </span>
                  </>
                )}
              </div>

              {/* Validation Report Message from Engine */}
              {feedback.validation_feedback && (
                <div className="text-xs text-slate-200 font-mono py-1.5 px-2.5 rounded bg-black/40 border border-slate-800/80">
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">VALIDATION REPORT:</span>
                  <span className="text-slate-200">{feedback.validation_feedback}</span>
                </div>
              )}

              {/* Explanation */}
              <div className="text-slate-300 font-sans leading-relaxed pt-1 border-t border-slate-800/80">
                <span className="font-mono text-[10px] uppercase text-slate-400 block mb-0.5">EXPLANATION:</span>
                {feedback.explanation}
              </div>

              {/* Canonical Solution Reveal for Rounds 2-4 */}
              {feedback.solution_code && (
                <div className="pt-2 border-t border-slate-800">
                  <button
                    onClick={() => setShowSolution(!showSolution)}
                    className="flex items-center gap-1.5 text-xs text-cyber-cyan hover:underline font-mono cursor-pointer"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>{showSolution ? 'Hide Canonical Solution' : 'View Canonical Solution'}</span>
                  </button>

                  {showSolution && (
                    <div className="mt-2 p-2.5 rounded-lg bg-black/70 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-48 whitespace-pre scrollbar-thin">
                      {feedback.solution_code}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
