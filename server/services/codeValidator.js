/**
 * Intelligent Code Fix Validator for BUG HUNT
 * Evaluates participant code edits against canonical solutions and validation rules.
 */

// Normalize whitespace and newlines for robust comparison
export function normalizeCode(code = '') {
    return String(code)
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .split('\n')
        .map(line => line.trimEnd())
        .join('\n')
        .trim();
}

// Compact code without comments and extra whitespace for structural check
export function compactCode(code = '') {
    return String(code)
        .replace(/\/\*[\s\S]*?\*\//g, '') // remove multi-line comments
        .replace(/\/\/.*$/gm, '')           // remove single-line comments
        .replace(/#.*$/gm, '')            // remove python comments
        .replace(/--.*$/gm, '')           // remove sql comments
        .replace(/\s+/g, ' ')             // collapse whitespace
        .trim()
        .toLowerCase();
}

/**
 * Validates a submitted code patch against a question's validation rules and solution.
 * @param {Object} question The database question object
 * @param {string} submittedCode The participant's submitted code string
 * @returns {{ is_correct: boolean, feedback: string, diff_summary?: string }}
 */
export function validateCodeFix(question, submittedCode) {
    if (!submittedCode || typeof submittedCode !== 'string') {
        return {
            is_correct: false,
            feedback: 'No code submitted.'
        };
    }

    const normSubmitted = normalizeCode(submittedCode);
    const normOriginal = normalizeCode(question.code_snippet);

    // 1. Check if user submitted unedited code
    if (normSubmitted === normOriginal) {
        return {
            is_correct: false,
            feedback: 'No edits detected. The original bug is still present in the code.'
        };
    }

    // 2. Check if user submitted exact canonical solution (ignoring minor whitespace differences)
    if (question.solution_code) {
        const normSolution = normalizeCode(question.solution_code);
        if (normSubmitted === normSolution) {
            return {
                is_correct: true,
                feedback: 'Optimal solution! Code matches canonical solution perfectly.'
            };
        }

        const compSubmitted = compactCode(submittedCode);
        const compSolution = compactCode(question.solution_code);
        if (compSubmitted === compSolution) {
            return {
                is_correct: true,
                feedback: 'Correct! Bug resolved cleanly with valid syntax and structure.'
            };
        }
    }

    // 3. Evaluate validation rules if defined
    let rules = null;
    if (question.validation_rules) {
        try {
            rules = typeof question.validation_rules === 'string' 
                ? JSON.parse(question.validation_rules) 
                : question.validation_rules;
        } catch (e) {
            console.error('Failed to parse validation rules for question', question.id, e);
        }
    }

    if (rules) {
        const compSubmitted = compactCode(submittedCode);
        let allRequiredPassed = true;
        let noForbiddenTriggered = true;
        let failureReason = '';

        // Check required patterns (ALL must match)
        if (Array.isArray(rules.required_patterns) && rules.required_patterns.length > 0) {
            for (const pattern of rules.required_patterns) {
                let matches = false;
                if (pattern.startsWith('regex:')) {
                    const regex = new RegExp(pattern.slice(6), 'i');
                    matches = regex.test(submittedCode);
                } else {
                    const normPattern = compactCode(pattern);
                    matches = compSubmitted.includes(normPattern);
                }

                if (!matches) {
                    allRequiredPassed = false;
                    failureReason = rules.hint_on_missing || 'Your patch is missing the necessary fix construct.';
                    break;
                }
            }
        }

        // Check required_any patterns (At least one must match, if defined)
        if (allRequiredPassed && Array.isArray(rules.required_any) && rules.required_any.length > 0) {
            let anyMatches = false;
            for (const pattern of rules.required_any) {
                if (pattern.startsWith('regex:')) {
                    const regex = new RegExp(pattern.slice(6), 'i');
                    if (regex.test(submittedCode)) {
                        anyMatches = true;
                        break;
                    }
                } else {
                    const normPattern = compactCode(pattern);
                    if (compSubmitted.includes(normPattern)) {
                        anyMatches = true;
                        break;
                    }
                }
            }
            if (!anyMatches) {
                allRequiredPassed = false;
                failureReason = rules.hint_on_missing || 'Your patch did not implement an approved fix pattern.';
            }
        }

        // Check forbidden patterns (NONE must match)
        if (Array.isArray(rules.forbidden_patterns) && rules.forbidden_patterns.length > 0) {
            for (const pattern of rules.forbidden_patterns) {
                let found = false;
                if (pattern.startsWith('regex:')) {
                    const regex = new RegExp(pattern.slice(6), 'i');
                    found = regex.test(submittedCode);
                } else {
                    const normPattern = compactCode(pattern);
                    found = compSubmitted.includes(normPattern);
                }

                if (found) {
                    noForbiddenTriggered = false;
                    failureReason = rules.hint_on_forbidden || 'The buggy code pattern is still present in your solution.';
                    break;
                }
            }
        }

        if (allRequiredPassed && noForbiddenTriggered) {
            return {
                is_correct: true,
                feedback: 'Bug slayed! All validation tests and security criteria passed.'
            };
        } else {
            return {
                is_correct: false,
                feedback: failureReason || 'Test failed: The bug persists or the fix was incomplete.'
            };
        }
    }

    // 4. Fallback if no specific validation rules:
    // Check if the correct_answer string or core keywords exist in submitted code
    const compSubmitted = compactCode(submittedCode);
    const compCorrect = compactCode(question.correct_answer || '');
    if (compCorrect && compSubmitted.includes(compCorrect)) {
        return {
            is_correct: true,
            feedback: 'Bug resolved! Solution criteria satisfied.'
        };
    }

    return {
        is_correct: false,
        feedback: 'Patch rejected: The bug condition is still triggered in the code.'
    };
}
