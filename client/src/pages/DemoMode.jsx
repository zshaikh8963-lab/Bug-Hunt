import React, { useState, useEffect, useRef } from 'react';
import { HUD } from '../components/HUD';
import { CodeViewer } from '../components/CodeViewer';
import {
  playClick, playCorrect, playWrong, playCombo,
  playRoundWin, playGameOver, playBossAlert
} from '../audio/soundEffects';
import { Terminal, ArrowRight, FastForward, CheckCircle2, XCircle, Lightbulb, Shield, Send, Bug } from 'lucide-react';

const DEMO_QUESTIONS = [
  // Round 1 Demo
  {
    round_num: 1,
    title: 'Division by Zero Pitfall',
    language: 'C',
    difficulty: 'Easy',
    question_type: 'mcq',
    description: 'What fatal runtime exception happens during the division arithmetic in this C snippet?',
    code_snippet: `#include <stdio.h>

int main() {
    int x = 10;
    int y = 0;
    printf("%d", x / y);
    return 0;
}`,
    options: [
      'Syntax Error at printf statement',
      'Division by Zero causing SIGFPE (Floating Point Exception)',
      'Memory Leak due to missing free()',
      'Stack Overflow in main()'
    ],
    correct_answer: 'Division by Zero causing SIGFPE (Floating Point Exception)',
    explanation: 'Dividing an integer by zero triggers an immediate hardware exception (SIGFPE) and halts program execution.',
    hint: 'Check the denominator value of variable y.',
    points: 10,
    penalty: 2,
    time_limit_sec: 30
  },
  // Round 2 Demo
  {
    round_num: 2,
    title: 'Binary Search Infinite Loop',
    language: 'Python',
    difficulty: 'Medium',
    question_type: 'debug_fix',
    description: 'The binary search gets stuck in an infinite loop on missing elements. Identify the correct fix.',
    code_snippet: `def binary_search(arr, target):
    low = 0
    high = len(arr) - 1
    
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid        # Line 9: Bug here!
        else:
            high = mid       # Line 11: Bug here!
            
    return -1`,
    options: [
      'Change Line 9 to low = mid + 1 and Line 11 to high = mid - 1',
      'Change while condition to while low < high',
      'Change mid calculation to mid = (low + high + 1) // 2',
      'Change return -1 to return None'
    ],
    correct_answer: 'Change Line 9 to low = mid + 1 and Line 11 to high = mid - 1',
    explanation: 'Setting low = mid fails to shrink the search space when low and high differ by 1, resulting in an infinite loop.',
    hint: 'Boundary indices must step past mid by +1 or -1.',
    points: 20,
    penalty: 5,
    time_limit_sec: 45
  },
  // Round 3 Demo
  {
    round_num: 3,
    title: 'Multi-Bug Detection: SimpleVector Class',
    language: 'C++',
    difficulty: 'Medium',
    question_type: 'multi_bug',
    description: 'Detect the 3 critical bugs hidden in this custom dynamic array.',
    code_snippet: `class SimpleVector {
    int* buffer;
    size_t capacity, size;
public:
    SimpleVector(size_t cap = 4) : capacity(cap), size(0) {
        buffer = new int[capacity];
    }
    ~SimpleVector() {
        delete buffer; // Bug 1: Should be delete[]
    }
    void push_back(int val) {
        if (size == capacity) {
            capacity *= 2;
            int* new_buf = new int[capacity];
            for (size_t i = 0; i <= size; i++) new_buf[i] = buffer[i]; // Bug 2: Out of bounds
            delete[] buffer;
            buffer = new_buf;
        }
        buffer[size++] = val;
    }
    size_t get_size() const {
        return capacity; // Bug 3: Returns capacity instead of size
    }
};`,
    options: [
      'Bug A: Destructor uses delete buffer instead of delete[] buffer (Array deallocation error)',
      'Bug B: push_back loop copies i <= size reading uninitialized element past boundary',
      'Bug C: get_size() returns capacity instead of the actual element count size',
      'False Alarm D: Member initializer list is illegal in C++'
    ],
    correct_answer: [
      'Bug A: Destructor uses delete buffer instead of delete[] buffer (Array deallocation error)',
      'Bug B: push_back loop copies i <= size reading uninitialized element past boundary',
      'Bug C: get_size() returns capacity instead of the actual element count size'
    ],
    explanation: '1) Array deallocation requires delete[]. 2) Loop <= size over-reads. 3) get_size() returns capacity.',
    hint: 'Check the destructor, the loop condition, and the getter return value.',
    points: 15,
    penalty: 5,
    time_limit_sec: 120
  },
  // Round 4 Demo
  {
    round_num: 4,
    title: '⚠️ BOSS BUG: Multi-Threaded Memory Pool Corrupter',
    language: 'C',
    difficulty: 'Hard',
    question_type: 'boss_bug',
    description: 'Identify the fundamental concurrency deadlock and corruption bugs.',
    code_snippet: `#include <pthread.h>
#include <stdlib.h>

static pthread_mutex_t pool_lock; // Bug 1: Never initialized!

void* mem_alloc(size_t bytes) {
    pthread_mutex_lock(&pool_lock);
    Block* curr = free_list;
    while (curr) {
        if (curr->is_free && curr->size >= bytes) {
            curr->is_free = false;
            return (void*)(curr + 1); // Bug 2: Returns without mutex unlock -> DEADLOCK!
        }
        curr = curr->next;
    }
    // ...
}`,
    options: [
      'Deadlock caused by returning without calling pthread_mutex_unlock(&pool_lock)',
      'Uninitialized mutex pool_lock causing undefined behavior in pthread_mutex_lock()',
      'Both A and B are critical security and concurrency bugs present in the allocator',
      'Dynamic memory allocation is not permitted in C'
    ],
    correct_answer: 'Both A and B are critical security and concurrency bugs present in the allocator',
    explanation: 'Returning without unlocking leaves the mutex permanently acquired. Uninitialized mutex produces undefined behavior.',
    hint: 'Trace every return statement to see if the mutex was unlocked.',
    points: 25,
    penalty: 10,
    time_limit_sec: 180
  }
];

export const DemoMode = ({ onFinish, onExitDemo }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(3);
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [multiBugSelections, setMultiBugSelections] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [hintModal, setHintModal] = useState(null);

  const currentQ = DEMO_QUESTIONS[currentIdx];

  useEffect(() => {
    if (currentQ) {
      setTimeLeft(currentQ.time_limit_sec);
      setSelectedAnswer('');
      setMultiBugSelections([]);
      setFeedback(null);
      if (currentQ.round_num === 4) {
        playBossAlert();
      }
    }
  }, [currentIdx]);

  // Timer Tick
  useEffect(() => {
    if (feedback) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [feedback, currentIdx]);

  const handleSubmit = (timeout = false) => {
    if (feedback || !currentQ) return;

    let isCorrect = false;
    let earned = 0;

    if (currentQ.question_type === 'multi_bug') {
      const correctArr = currentQ.correct_answer;
      const matches = multiBugSelections.filter(item => correctArr.includes(item)).length;
      isCorrect = matches === correctArr.length && multiBugSelections.length === correctArr.length;
      earned = matches * currentQ.points;
    } else {
      isCorrect = !timeout && selectedAnswer === currentQ.correct_answer;
      earned = isCorrect ? currentQ.points * Math.min(combo + 1, 4) : -currentQ.penalty;
    }

    if (isCorrect) {
      playCorrect();
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      if (nextCombo > 1) playCombo(nextCombo);
      setScore(prev => prev + earned);
    } else {
      playWrong();
      setCombo(0);
      setLives(prev => Math.max(0, prev - 1));
      setScore(prev => Math.max(0, prev + earned));
    }

    setFeedback({
      is_correct: isCorrect,
      points_earned: earned,
      explanation: currentQ.explanation
    });
  };

  const handleNext = () => {
    playClick();
    if (currentIdx + 1 < DEMO_QUESTIONS.length) {
      setCurrentIdx(prev => prev + 1);
    } else {
      playRoundWin();
      onFinish({
        participant_name: 'Demo Evaluator',
        team_name: 'Evaluation Squad',
        college: 'Judge Sandbox',
        score,
        bugs_found: 4,
        accuracy: 90,
        total_time_sec: 145,
        max_combo: Math.max(combo, 2),
        tab_switches: 0,
        status: 'completed',
        rank: 1
      });
    }
  };

  const handleUseHint = () => {
    if (hintsRemaining <= 0 || !currentQ) return;
    playClick();
    setHintsRemaining(prev => prev - 1);
    setScore(prev => Math.max(0, prev - 5));
    setHintModal(currentQ.hint);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto cyber-grid">
      
      {/* Demo Banner */}
      <div className="mb-4 p-2.5 rounded-xl bg-cyan-950/60 border border-cyber-cyan/40 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 text-cyber-cyan">
          <Terminal className="w-4 h-4 animate-pulse" />
          <span className="font-bold">DEMO SANDBOX MODE:</span>
          <span className="text-slate-300">Fast-forward evaluation across all 4 rounds</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleNext}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 transition-colors"
          >
            <FastForward className="w-3 h-3" />
            <span>SKIP CHALLENGE</span>
          </button>
          <button
            onClick={onExitDemo}
            className="px-2.5 py-1 rounded bg-rose-950/50 text-rose-400 hover:bg-rose-900/50 transition-colors"
          >
            EXIT DEMO
          </button>
        </div>
      </div>

      {/* Game HUD */}
      <HUD
        roundNum={currentQ.round_num}
        roundTitle={`ROUND ${currentQ.round_num} (DEMO)`}
        currentQuestionIndex={currentIdx}
        totalQuestions={DEMO_QUESTIONS.length}
        timeLeft={timeLeft}
        maxTime={currentQ.time_limit_sec}
        score={score}
        combo={combo}
        lives={lives}
        hintsRemaining={hintsRemaining}
        onUseHint={handleUseHint}
        tabSwitches={0}
      />

      {/* Question Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-cyber-card border border-cyber-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2 text-[10px] font-mono text-cyber-cyan font-bold">
              <span>{currentQ.language} • {currentQ.difficulty}</span>
              <span className="text-slate-400">POINTS: +{currentQ.points} / -{currentQ.penalty}</span>
            </div>
            <h2 className="text-lg font-bold text-white mb-1">{currentQ.title}</h2>
            <p className="text-sm text-slate-300 font-sans">{currentQ.description}</p>
          </div>

          <CodeViewer code={currentQ.code_snippet} language={currentQ.language} />
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="bg-cyber-card border border-cyber-border rounded-xl p-5 shadow-xl">
            <h3 className="text-sm font-bold uppercase text-slate-200 font-mono mb-3">
              SELECT OPTION / PATCH
            </h3>

            <div className="space-y-2.5">
              {currentQ.options.map((opt, idx) => {
                const letter = String.fromCharCode(65 + idx);
                const isSelected = currentQ.question_type === 'multi_bug'
                  ? multiBugSelections.includes(opt)
                  : selectedAnswer === opt;

                return (
                  <button
                    key={idx}
                    disabled={feedback !== null}
                    onClick={() => {
                      playClick();
                      if (currentQ.question_type === 'multi_bug') {
                        setMultiBugSelections(prev =>
                          prev.includes(opt) ? prev.filter(x => x !== opt) : [...prev, opt]
                        );
                      } else {
                        setSelectedAnswer(opt);
                      }
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-mono flex items-start gap-3 transition-all ${
                      isSelected
                        ? 'bg-cyber-neon/15 border-cyber-neon text-white font-semibold'
                        : 'bg-[#0b1120] border-slate-800 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      isSelected ? 'bg-cyber-neon text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {letter}
                    </span>
                    <span className="leading-snug">{opt}</span>
                  </button>
                );
              })}
            </div>

            {!feedback ? (
              <button
                onClick={() => handleSubmit(false)}
                disabled={currentQ.question_type === 'multi_bug' ? multiBugSelections.length === 0 : !selectedAnswer}
                className="w-full mt-5 py-3 bg-gradient-to-r from-cyber-neon to-emerald-400 text-slate-950 font-black text-sm uppercase font-mono rounded-xl shadow-neon-sm hover:shadow-neon-md transition-all flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
                <span>CONFIRM SUBMISSION</span>
              </button>
            ) : (
              <div className={`mt-4 p-4 rounded-xl border ${
                feedback.is_correct
                  ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-500/60 text-rose-200'
              }`}>
                <div className="flex items-center gap-2 mb-2 font-mono font-bold text-sm">
                  {feedback.is_correct ? <CheckCircle2 className="w-5 h-5 text-cyber-neon" /> : <XCircle className="w-5 h-5 text-rose-400" />}
                  <span>{feedback.is_correct ? 'CORRECT!' : 'INCORRECT!'}</span>
                </div>
                <p className="text-xs text-slate-300 font-sans mb-3">{feedback.explanation}</p>
                <button
                  onClick={handleNext}
                  className="w-full py-2.5 bg-white text-slate-950 font-bold text-xs uppercase font-mono rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                >
                  <span>CONTINUE</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Hint Modal */}
      {hintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#0f172a] border border-amber-500 rounded-2xl p-6 text-center">
            <h3 className="text-lg font-bold text-amber-400 font-mono mb-2">CLUE</h3>
            <p className="text-sm text-slate-200 font-sans mb-4 p-3 bg-slate-900 rounded-lg">{hintModal}</p>
            <button
              onClick={() => setHintModal(null)}
              className="w-full py-2 bg-amber-500 text-slate-950 font-bold rounded-lg font-mono"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
