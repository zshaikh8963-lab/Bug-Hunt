/**
 * Secure Isolated Python Execution Service for BUG HUNT
 * Executes participant Python code against visible and hidden test cases.
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

// Locate Python executable on Windows or POSIX
export function getPythonPath() {
    // 1. Explicit Windows path verified on this system
    const localAppData = process.env.LOCALAPPDATA || 'C:\\Users\\LENOVO\\AppData\\Local';
    const localPython = path.join(localAppData, 'Python', 'bin', 'python.exe');
    if (fs.existsSync(localPython)) {
        return localPython;
    }

    // 2. Microsoft WindowsApps fallback
    const winAppsPython = path.join(localAppData, 'Microsoft', 'WindowsApps', 'python.exe');
    if (fs.existsSync(winAppsPython)) {
        return winAppsPython;
    }

    // 3. Fallbacks
    return process.platform === 'win32' ? 'python' : 'python3';
}

const FORBIDDEN_PATTERNS = [
    /import\s+os\b/,
    /from\s+os\b/,
    /import\s+subprocess\b/,
    /from\s+subprocess\b/,
    /import\s+shutil\b/,
    /from\s+shutil\b/,
    /import\s+socket\b/,
    /from\s+socket\b/,
    /__import__\s*\(\s*['"](os|subprocess|shutil|socket|sys)['"]/,
    /\bopen\s*\(/,
    /\beval\s*\(/,
    /\bexec\s*\(/
];

/**
 * Validates Python code against security policies
 */
export function checkCodeSafety(code) {
    for (const pattern of FORBIDDEN_PATTERNS) {
        if (pattern.test(code)) {
            return {
                safe: false,
                reason: 'Security violation: Restricted import or dangerous function call detected.'
            };
        }
    }
    return { safe: true };
}

/**
 * Executes a single test case in an isolated process
 */
function runSingleTestCase(pythonBin, code, inputStr, timeoutMs = 3000) {
    return new Promise((resolve) => {
        const startTime = Date.now();
        const child = spawn(pythonBin, ['-c', code], {
            stdio: ['pipe', 'pipe', 'pipe'],
            windowsHide: true
        });

        let stdout = '';
        let stderr = '';
        let timedOut = false;

        const timer = setTimeout(() => {
            timedOut = true;
            try {
                child.kill('SIGKILL');
            } catch (e) {
                // Ignore
            }
            resolve({
                status: 'TIME LIMIT EXCEEDED',
                output: '',
                error: 'Execution timed out (> 3.0s). Check for infinite loops.',
                duration: Date.now() - startTime
            });
        }, timeoutMs);

        child.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        child.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        child.on('close', (codeStatus) => {
            clearTimeout(timer);
            if (timedOut) return;

            const duration = Date.now() - startTime;

            if (codeStatus !== 0) {
                let status = 'RUNTIME ERROR';
                if (stderr.includes('SyntaxError') || stderr.includes('IndentationError')) {
                    status = 'SYNTAX ERROR';
                }
                resolve({
                    status,
                    output: stdout,
                    error: stderr.trim() || `Process exited with code ${codeStatus}`,
                    duration
                });
            } else {
                resolve({
                    status: 'SUCCESS',
                    output: stdout,
                    error: '',
                    duration
                });
            }
        });

        child.on('error', (err) => {
            clearTimeout(timer);
            resolve({
                status: 'EXECUTION ERROR',
                output: '',
                error: err.message,
                duration: Date.now() - startTime
            });
        });

        // Write input to stdin and close stream
        if (inputStr) {
            child.stdin.write(inputStr);
        }
        child.stdin.end();
    });
}

function normalizeOutput(str) {
    return String(str || '')
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .split('\n')
        .map(line => line.trimEnd())
        .join('\n')
        .trim();
}

/**
 * Test Runs code against visible test cases only (For "Run Code" in Editor)
 */
export async function runVisibleTests(code, visibleTests) {
    const safety = checkCodeSafety(code);
    if (!safety.safe) {
        return {
            overall_status: 'SECURITY VIOLATION',
            message: safety.reason,
            results: []
        };
    }

    const pythonBin = getPythonPath();
    const results = [];
    let allPassed = true;
    let worstStatus = 'ACCEPTED';

    for (let i = 0; i < visibleTests.length; i++) {
        const test = visibleTests[i];
        const res = await runSingleTestCase(pythonBin, code, test.input);

        const actualNorm = normalizeOutput(res.output);
        const expectedNorm = normalizeOutput(test.expected_output);
        const passed = res.status === 'SUCCESS' && actualNorm === expectedNorm;

        if (!passed) {
            allPassed = false;
            if (res.status !== 'SUCCESS') {
                worstStatus = res.status;
            } else {
                worstStatus = 'WRONG ANSWER';
            }
        }

        results.push({
            test_number: i + 1,
            input: test.input,
            expected_output: test.expected_output,
            actual_output: res.output.trim(),
            status: passed ? 'PASSED' : (res.status === 'SUCCESS' ? 'WRONG ANSWER' : res.status),
            error: res.error,
            duration_ms: res.duration
        });
    }

    return {
        overall_status: allPassed ? 'ACCEPTED' : worstStatus,
        results
    };
}

/**
 * Full Evaluation against Visible AND Hidden test cases (For "Submit Solution")
 */
export async function evaluatePythonSubmission(challenge, submittedCode, identifiedBugType, identifiedLine, challengeIndex = 0) {
    const maxMarks = challengeIndex === 0 ? 12 : 13;
    const safety = checkCodeSafety(submittedCode);

    if (!safety.safe) {
        return {
            overall_status: 'SECURITY VIOLATION',
            message: safety.reason,
            score_awarded: 0,
            max_marks: maxMarks,
            breakdown: {
                bug_identification: 0,
                faulty_line: 0,
                correct_code: 0,
                visible_tests: 0,
                hidden_tests: 0
            },
            visible_results: [],
            hidden_passed_count: 0,
            hidden_total_count: 0
        };
    }

    const pythonBin = getPythonPath();
    let visibleTests = [];
    let hiddenTests = [];

    try {
        visibleTests = typeof challenge.visible_tests_json === 'string' 
            ? JSON.parse(challenge.visible_tests_json) 
            : challenge.visible_tests_json;
        hiddenTests = typeof challenge.hidden_tests_json === 'string' 
            ? JSON.parse(challenge.hidden_tests_json) 
            : challenge.hidden_tests_json;
    } catch (e) {
        visibleTests = [];
        hiddenTests = [];
    }

    // 1. Evaluate Bug Identification (3 Marks)
    const normSubmittedType = String(identifiedBugType || '').trim().toLowerCase();
    const normChallengeType = String(challenge.bug_type || '').trim().toLowerCase();
    const bugTypeMatched = normSubmittedType.length > 0 && 
        (normChallengeType.includes(normSubmittedType) || normSubmittedType.includes(normChallengeType));
    const bugIdMarks = bugTypeMatched ? 3 : 0;

    // 2. Evaluate Faulty Line (2 Marks)
    const lineNum = parseInt(identifiedLine, 10);
    const lineMatched = lineNum === challenge.faulty_line || Math.abs(lineNum - challenge.faulty_line) <= 1;
    const lineMarks = lineMatched ? 2 : 0;

    // 3. Run Visible Tests
    const visibleResults = [];
    let visiblePassed = 0;
    for (let i = 0; i < visibleTests.length; i++) {
        const test = visibleTests[i];
        const res = await runSingleTestCase(pythonBin, submittedCode, test.input);
        const actualNorm = normalizeOutput(res.output);
        const expectedNorm = normalizeOutput(test.expected_output);
        const passed = res.status === 'SUCCESS' && actualNorm === expectedNorm;
        if (passed) visiblePassed++;
        visibleResults.push({
            test_number: i + 1,
            input: test.input,
            expected_output: test.expected_output,
            actual_output: res.output.trim(),
            status: passed ? 'PASSED' : (res.status === 'SUCCESS' ? 'WRONG ANSWER' : res.status),
            error: res.error,
            duration_ms: res.duration
        });
    }

    // 4. Run Hidden Tests
    let hiddenPassed = 0;
    for (const test of hiddenTests) {
        const res = await runSingleTestCase(pythonBin, submittedCode, test.input);
        const actualNorm = normalizeOutput(res.output);
        const expectedNorm = normalizeOutput(test.expected_output);
        if (res.status === 'SUCCESS' && actualNorm === expectedNorm) {
            hiddenPassed++;
        }
    }

    // Scoring weights:
    // Visible tests: 1 mark if all visible passed (or proportion)
    const visibleMarks = visibleTests.length > 0 ? (visiblePassed / visibleTests.length) * 1.0 : 1.0;
    // Hidden tests: 2 marks proportional
    const hiddenMarks = hiddenTests.length > 0 ? (hiddenPassed / hiddenTests.length) * 2.0 : 2.0;

    // Correct code marks: Challenge 1 has 4 marks, Challenge 2 has 5 marks
    const codeBaseWeight = challengeIndex === 0 ? 4 : 5;
    const totalTests = visibleTests.length + hiddenTests.length;
    const passedTests = visiblePassed + hiddenPassed;
    const testRatio = totalTests > 0 ? passedTests / totalTests : 0;
    const codeMarks = testRatio >= 1.0 ? codeBaseWeight : Math.round(testRatio * codeBaseWeight * 10) / 10;

    const totalAwarded = Math.min(maxMarks, Math.round((bugIdMarks + lineMarks + codeMarks + visibleMarks + hiddenMarks) * 10) / 10);

    let overallStatus = 'ACCEPTED';
    if (passedTests === 0) {
        overallStatus = visibleResults[0]?.status || 'WRONG ANSWER';
    } else if (passedTests < totalTests) {
        overallStatus = 'PARTIALLY ACCEPTED';
    }

    return {
        overall_status: overallStatus,
        score_awarded: totalAwarded,
        max_marks: maxMarks,
        breakdown: {
            bug_identification: bugIdMarks,
            faulty_line: lineMarks,
            correct_code: codeMarks,
            visible_tests: Math.round(visibleMarks * 10) / 10,
            hidden_tests: Math.round(hiddenMarks * 10) / 10
        },
        visible_results: visibleResults,
        hidden_passed_count: hiddenPassed,
        hidden_total_count: hiddenTests.length
    };
}
