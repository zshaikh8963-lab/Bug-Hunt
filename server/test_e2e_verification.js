import assert from 'assert';

const BASE_URL = 'http://localhost:5000/api';

async function request(path, options = {}) {
    const res = await fetch(`${BASE_URL}${path}`, {
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        ...options
    });
    return res.json();
}

async function runTests() {
    console.log('🚀 STARTING FULL-SPECTRUM END-TO-END VERIFICATION: BUG HUNT');
    let testsPassed = 0;

    // 1. Check Competition Status
    console.log('\n[TEST 1] Competition Status');
    const statusRes = await request('/competition/status');
    assert.strictEqual(statusRes.success, true, 'Status response should be success');
    console.log(`✓ Competition status: ${statusRes.status}, active round: ${statusRes.active_round}`);
    testsPassed++;

    // 2. Admin Authentication
    console.log('\n[TEST 2] Admin Authentication');
    const authRes = await request('/auth/admin-login', {
        method: 'POST',
        body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    assert.strictEqual(authRes.success, true, 'Admin login should succeed');
    const adminToken = authRes.token;
    console.log('✓ Admin authenticated successfully, JWT received');
    testsPassed++;

    const adminHeaders = { 'Authorization': `Bearer ${adminToken}` };

    // 3. Question Bank Counts
    console.log('\n[TEST 3] Question Bank Verification');
    const bankRes = await request('/admin/questions-bank', { headers: adminHeaders });
    assert.strictEqual(bankRes.success, true, 'Question bank fetch should succeed');
    assert.ok(bankRes.r1_mcqs.length >= 50, `Expected >= 50 R1 MCQs, got ${bankRes.r1_mcqs.length}`);
    assert.ok(bankRes.r2_java.length >= 30, `Expected >= 30 R2 Java, got ${bankRes.r2_java.length}`);
    assert.ok(bankRes.r3_python.length >= 30, `Expected >= 30 R3 Python, got ${bankRes.r3_python.length}`);
    console.log(`✓ Questions Verified: R1=${bankRes.r1_mcqs.length}, R2=${bankRes.r2_java.length}, R3=${bankRes.r3_python.length}`);
    testsPassed++;

    // 4. Team Registration (4 Students)
    console.log('\n[TEST 4] 4-Member Team Registration');
    const regPayload = {
        team_name: 'CyberDefenders_' + Date.now().toString().slice(-4),
        department: 'COMPS',
        college: 'Apex Engineering College',
        members: [
            { name: 'Alex Mercer', email: 'alex@apex.edu', roll_no: 'CS-01' },
            { name: 'Brianna Scott', email: 'brianna@apex.edu', roll_no: 'CS-02' },
            { name: 'Charles Vance', email: 'charles@apex.edu', roll_no: 'CS-03' },
            { name: 'Diana Prince', email: 'diana@apex.edu', roll_no: 'CS-04' }
        ]
    };
    const regRes = await request('/teams/register', {
        method: 'POST',
        body: JSON.stringify(regPayload)
    });
    assert.strictEqual(regRes.success, true, 'Registration must succeed');
    assert.ok(regRes.team.team_id, 'Team ID must be generated');
    assert.strictEqual(regRes.members.length, 4, 'Must register exactly 4 members');
    const testTeam = regRes.team;
    console.log(`✓ Team registered: ${testTeam.team_id} (${testTeam.team_name}), PassCode: ${testTeam.pass_code}`);
    testsPassed++;

    // 5. Team Login & Reconnect
    console.log('\n[TEST 5] Team Login & Reconnection');
    const loginRes = await request('/teams/login', {
        method: 'POST',
        body: JSON.stringify({ code: testTeam.team_id })
    });
    assert.strictEqual(loginRes.success, true, 'Team login must succeed');
    assert.strictEqual(loginRes.team.team_id, testTeam.team_id);
    assert.strictEqual(loginRes.members.length, 4);
    console.log('✓ Team session restoration verified');
    testsPassed++;

    // 6. Round 1 Gameplay (10 MCQs, 10 Marks max)
    console.log('\n[TEST 6] Round 1 Gameplay (Basic MCQ)');
    const r1TasksRes = await request(`/rounds/current?team_id=${testTeam.team_id}&round=1`);
    assert.strictEqual(r1TasksRes.success, true);
    assert.strictEqual(r1TasksRes.tasks.length, 10, 'Round 1 must assign exactly 10 tasks');

    let r1Score = 0;
    for (let i = 0; i < r1TasksRes.tasks.length; i++) {
        const task = r1TasksRes.tasks[i];
        const subRes = await request('/rounds/r1/submit', {
            method: 'POST',
            body: JSON.stringify({
                team_id: testTeam.team_id,
                task_index: i,
                question_id: task.id,
                selected_option_index: 0,
                time_taken_sec: 15
            })
        });
        assert.strictEqual(subRes.success, true);
        r1Score += subRes.score_awarded || 0;
    }
    console.log(`✓ Round 1 completed: Score = ${r1Score}/10 Marks`);
    testsPassed++;

    // 7. Round 2 Gameplay (3 Java Challenges, 15 Marks max)
    console.log('\n[TEST 7] Round 2 Gameplay (Identify the Bug - Java)');
    const r2TasksRes = await request(`/rounds/current?team_id=${testTeam.team_id}&round=2`);
    assert.strictEqual(r2TasksRes.success, true);
    assert.strictEqual(r2TasksRes.tasks.length, 3, 'Round 2 must assign exactly 3 tasks');

    let r2Score = 0;
    for (let i = 0; i < r2TasksRes.tasks.length; i++) {
        const task = r2TasksRes.tasks[i];
        const subRes = await request('/rounds/r2/submit', {
            method: 'POST',
            body: JSON.stringify({
                team_id: testTeam.team_id,
                task_index: i,
                question_id: task.id,
                selected_line: 4,
                selected_bug_type: 'Syntax Error',
                time_taken_sec: 35
            })
        });
        assert.strictEqual(subRes.success, true);
        r2Score += subRes.score_awarded || 0;
    }
    console.log(`✓ Round 2 completed: Score = ${r2Score}/15 Marks`);
    testsPassed++;

    // 8. Round 3 Python Execution & Grading (2 Challenges, 25 Marks max)
    console.log('\n[TEST 8] Round 3 Python Runner & Submission');
    const r3TasksRes = await request(`/rounds/current?team_id=${testTeam.team_id}&round=3`);
    assert.strictEqual(r3TasksRes.success, true);
    assert.strictEqual(r3TasksRes.tasks.length, 2, 'Round 3 must assign exactly 2 tasks');

    const ch1 = r3TasksRes.tasks[0];
    // Run test on python code
    const runRes = await request('/rounds/r3/run-test', {
        method: 'POST',
        body: JSON.stringify({
            question_id: ch1.id,
            code: ch1.buggy_code
        })
    });
    assert.strictEqual(runRes.success, true, 'Run test should execute in pythonRunner');
    console.log(`✓ Python Runner live execution verified: ${runRes.total_visible_tests || (runRes.results ? runRes.results.length : 0)} visible tests evaluated`);

    // Submit challenge 1
    const subCh1 = await request('/rounds/r3/submit', {
        method: 'POST',
        body: JSON.stringify({
            team_id: testTeam.team_id,
            task_index: 0,
            question_id: ch1.id,
            code: ch1.buggy_code,
            faulty_line: 5,
            identified_bug: 'Logic boundary bug',
            time_taken_sec: 120
        })
    });
    assert.strictEqual(subCh1.success, true);
    console.log(`✓ Round 3 Challenge 1 submitted. Marks awarded: ${subCh1.score_awarded}/12`);

    // Submit challenge 2
    const ch2 = r3TasksRes.tasks[1];
    const subCh2 = await request('/rounds/r3/submit', {
        method: 'POST',
        body: JSON.stringify({
            team_id: testTeam.team_id,
            task_index: 1,
            question_id: ch2.id,
            code: ch2.buggy_code,
            faulty_line: 4,
            identified_bug: 'Indexing error',
            time_taken_sec: 140
        })
    });
    assert.strictEqual(subCh2.success, true);
    console.log(`✓ Round 3 Challenge 2 submitted. Marks awarded: ${subCh2.score_awarded}/13`);
    testsPassed++;

    // 9. Total Score Cap Verification (strictly 50 marks max)
    console.log('\n[TEST 9] Max Total Score Validation');
    const sessionRes = await request(`/teams/session?team_id=${testTeam.team_id}`);
    assert.strictEqual(sessionRes.success, true);
    const totalScore = sessionRes.team.total_score !== undefined ? sessionRes.team.total_score : sessionRes.team.final_score;
    assert.ok(typeof totalScore === 'number', 'Total score must be a number');
    assert.ok(totalScore <= 50, `Total score ${totalScore} must be <= 50`);
    console.log(`✓ Total score verified: ${totalScore} <= 50 Marks (R1: ${sessionRes.team.r1_score}, R2: ${sessionRes.team.r2_score}, R3: ${sessionRes.team.r3_score})`);
    testsPassed++;

    // 10. Anti-Cheat Security & 3 Strikes
    console.log('\n[TEST 10] Anti-Cheat 3-Strike Escalation');
    const strike1 = await request('/rounds/violation', {
        method: 'POST',
        body: JSON.stringify({ team_id: testTeam.team_id, violation_type: 'TAB_SWITCH', details: 'Unfocused tab' })
    });
    assert.strictEqual(strike1.strikes, 1);
    assert.strictEqual(strike1.is_disqualified, false);

    const strike2 = await request('/rounds/violation', {
        method: 'POST',
        body: JSON.stringify({ team_id: testTeam.team_id, violation_type: 'TAB_SWITCH', details: 'Unfocused tab 2' })
    });
    assert.strictEqual(strike2.strikes, 2);
    assert.strictEqual(strike2.is_disqualified, false);

    const strike3 = await request('/rounds/violation', {
        method: 'POST',
        body: JSON.stringify({ team_id: testTeam.team_id, violation_type: 'TAB_SWITCH', details: 'Unfocused tab 3' })
    });
    assert.strictEqual(strike3.strikes, 3);
    assert.strictEqual(strike3.is_disqualified, true, 'Strike 3 must disqualify team');
    console.log('✓ Anti-Cheat 3-Strike Disqualification confirmed');
    testsPassed++;

    // 11. Demo Mode Simulation (4 teams: Alpha, Beta, Gamma, Delta)
    console.log('\n[TEST 11] 4-Team Demo Mode Simulation');
    const demoRes = await request('/demo/run-simulation', { method: 'POST' });
    assert.strictEqual(demoRes.success, true, 'Demo simulation must succeed');
    assert.strictEqual(demoRes.teams_simulated.length, 4, 'Must simulate exactly 4 teams');
    console.log(`✓ Simulated 4 Teams: ${demoRes.teams_simulated.map(t => `${t.team_name} (${t.final_score} pts)`).join(', ')}`);
    testsPassed++;

    // 12. Leaderboard & Tie-Breaker Ordering
    console.log('\n[TEST 12] Leaderboard & Tie-Breaker Validation');
    const lbRes = await request('/leaderboard');
    assert.strictEqual(lbRes.success, true);
    assert.ok(lbRes.leaderboard.length >= 4, 'Leaderboard must have at least 4 teams');
    // Verify non-disqualified teams are sorted in descending order of total score
    const qualified = lbRes.leaderboard.filter(t => !t.is_disqualified);
    for (let i = 0; i < qualified.length - 1; i++) {
        const curr = qualified[i];
        const next = qualified[i + 1];
        assert.ok(curr.final_score >= next.final_score, `Leaderboard must be sorted by score descending: ${curr.final_score} >= ${next.final_score}`);
    }
    console.log(`✓ Leaderboard verified: Rank 1 is ${lbRes.leaderboard[0].team_name} with ${lbRes.leaderboard[0].final_score}/50`);
    testsPassed++;

    // 13. Certificate Generation & Verification
    console.log('\n[TEST 13] Certificate System & Cryptographic Verification');
    const certGen = await request('/admin/certificates/generate', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ filter: 'all' })
    });
    assert.strictEqual(certGen.success, true);
    console.log(`✓ Generated ${certGen.generated_count} official award certificates`);

    const alphaTeam = lbRes.leaderboard[0];
    const teamCertsRes = await request(`/certificates/team/${alphaTeam.team_id}`);
    assert.strictEqual(teamCertsRes.success, true);
    assert.ok(teamCertsRes.certificates.length > 0);
    const sampleCert = teamCertsRes.certificates[0];
    assert.ok(/^BH-2026-\d{6}$/.test(sampleCert.certificate_id), `Cert ID must match BH-2026-XXXXXX format, got ${sampleCert.certificate_id}`);
    console.log(`✓ Permanent Certificate ID verified: ${sampleCert.certificate_id} (${sampleCert.award_rank})`);

    // Public QR Verification Endpoint
    const verifyRes = await request(`/certificates/verify/${sampleCert.certificate_id}`);
    assert.strictEqual(verifyRes.success, true);
    assert.strictEqual(verifyRes.status, 'VERIFIED');
    assert.strictEqual(verifyRes.certificate.certificate_id, sampleCert.certificate_id);
    assert.strictEqual(verifyRes.certificate.members.length, 4, 'Verified certificate must list all 4 members');
    console.log(`✓ QR Verification Endpoint Verified: status=${verifyRes.status}, team=${verifyRes.certificate.team_name}`);
    testsPassed++;

    // 14. Admin Competition Controls & Projector Reveal
    console.log('\n[TEST 14] Admin Competition Controls');
    const pauseRes = await request('/admin/competition/control', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ action: 'pause', message: 'Judges deliberate on round scores' })
    });
    assert.strictEqual(pauseRes.success, true);

    const revealRes = await request('/admin/projector/reveal', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ state: 'WINNER' })
    });
    assert.strictEqual(revealRes.success, true);

    const resumeRes = await request('/admin/competition/control', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ action: 'resume' })
    });
    assert.strictEqual(resumeRes.success, true);
    console.log('✓ Admin state transitions (pause, projector reveal, resume) verified');
    testsPassed++;

    console.log(`\n========================================================`);
    console.log(`🎉 ALL ${testsPassed}/${testsPassed} END-TO-END VERIFICATION SUITES PASSED!`);
    console.log(`========================================================\n`);
}

runTests().catch(err => {
    console.error('\n❌ TEST SUITE FAILED:', err);
    process.exit(1);
});
