// Full E2E Test Suite for BUG HUNT Platform
import http from 'http';

function get(path, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: 5000,
      path,
      method: 'GET',
      headers
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function post(path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(body);
    const req = http.request({
      hostname: '127.0.0.1',
      port: 5000,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('=== STARTING COMPLETE BUG HUNT VERIFICATION ===');
  let passed = 0;
  let failed = 0;

  function test(name, ok, details) {
    if (ok) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name}`, details ? JSON.stringify(details) : '');
      failed++;
    }
  }

  // 1. Health
  const health = await get('/api/health');
  test('Health check returns online', health.status === 200 && health.body.status === 'online', health);

  // 2. Competition Status
  const status = await get('/api/competition/status');
  test('Competition status API responds', status.status === 200 && status.body.success === true, status);

  // 3. Leaderboard
  const lb = await get('/api/leaderboard');
  test('Leaderboard API responds with teams', lb.status === 200 && Array.isArray(lb.body.leaderboard), lb);

  // 4. Admin Auth
  const adminLogin = await post('/api/auth/admin-login', { username: 'admin', password: 'admin123' });
  test('Admin authentication succeeds', adminLogin.status === 200 && adminLogin.body.token, adminLogin);
  const token = adminLogin.body?.token;

  // 5. Admin Stats
  const adminStats = await get('/api/admin/statistics', { 'Authorization': `Bearer ${token}` });
  test('Admin stats returns metrics', adminStats.status === 200 && adminStats.body.success === true, adminStats);

  // 6. Admin Teams list
  const adminTeams = await get('/api/admin/teams', { 'Authorization': `Bearer ${token}` });
  test('Admin teams endpoint responsive', adminTeams.status === 200 && Array.isArray(adminTeams.body.teams), adminTeams);

  // 7. Question Bank
  const qBank = await get('/api/admin/questions-bank', { 'Authorization': `Bearer ${token}` });
  test('Admin question bank responsive', qBank.status === 200 && qBank.body.success === true && qBank.body.r1?.length > 0, qBank);

  // 8. Team Registration: 2 Members (Min requirement)
  const test2Member = await post('/api/teams/register', {
    team_name: `E2E-2M-${Date.now().toString().slice(-4)}`,
    college: 'Test College',
    department: 'COMPS',
    members: [
      { name: 'Alice Student', email: 'alice@test.edu', phone: '9876543210', roll_no: 'CS01' },
      { name: 'Bob Student', email: 'bob@test.edu', phone: '9876543211', roll_no: 'CS02' }
    ]
  });
  test('Register 2-member team succeeds', (test2Member.status === 200 || test2Member.status === 201) && test2Member.body.success === true && test2Member.body.team?.team_id, test2Member);
  const testTeamId = test2Member.body?.team?.team_id;

  // 9. Team Registration: 4 Members (Max requirement)
  const test4Member = await post('/api/teams/register', {
    team_name: `E2E-4M-${Date.now().toString().slice(-4)}`,
    college: 'Test College',
    department: 'IT',
    members: [
      { name: 'Member 1', email: 'm1@test.edu', phone: '9876543212', roll_no: 'IT01' },
      { name: 'Member 2', email: 'm2@test.edu', phone: '9876543213', roll_no: 'IT02' },
      { name: 'Member 3', email: 'm3@test.edu', phone: '9876543214', roll_no: 'IT03' },
      { name: 'Member 4', email: 'm4@test.edu', phone: '9876543215', roll_no: 'IT04' }
    ]
  });
  test('Register 4-member team succeeds', (test4Member.status === 200 || test4Member.status === 201) && test4Member.body.success === true, test4Member);

  // 10. Team Registration: 1 Member (Must be rejected)
  const test1Member = await post('/api/teams/register', {
    team_name: `E2E-1M-${Date.now().toString().slice(-4)}`,
    college: 'Test College',
    department: 'COMPS',
    members: [
      { name: 'Solo Student', email: 'solo@test.edu', phone: '9876543216', roll_no: 'CS05' }
    ]
  });
  test('Register 1-member team is properly rejected with 400', test1Member.status === 400);

  // 11. Team Registration: 5 Members (Must be rejected)
  const test5Member = await post('/api/teams/register', {
    team_name: `E2E-5M-${Date.now().toString().slice(-4)}`,
    college: 'Test College',
    department: 'COMPS',
    members: [
      { name: 'M1', email: 'm1@t.com', phone: '1', roll_no: '1' },
      { name: 'M2', email: 'm2@t.com', phone: '2', roll_no: '2' },
      { name: 'M3', email: 'm3@t.com', phone: '3', roll_no: '3' },
      { name: 'M4', email: 'm4@t.com', phone: '4', roll_no: '4' },
      { name: 'M5', email: 'm5@t.com', phone: '5', roll_no: '5' }
    ]
  });
  test('Register 5-member team is properly rejected with 400', test5Member.status === 400);

  // 12. Round 1 Questions retrieval for registered team
  if (testTeamId) {
    const r1Tasks = await get(`/api/rounds/current?team_id=${testTeamId}&round=1`);
    test('Round 1 challenges retrieved for team', r1Tasks.status === 200 && r1Tasks.body.tasks && r1Tasks.body.tasks.length > 0);

    // 13. Round 1 Answer Submission
    if (r1Tasks.body.tasks && r1Tasks.body.tasks[0]) {
      const q = r1Tasks.body.tasks[0];
      const r1Sub = await post('/api/rounds/r1/submit', {
        team_id: testTeamId,
        task_index: 0,
        question_id: q.id,
        selected_option_index: 0,
        time_taken_sec: 12
      });
      test('Round 1 answer submission processed and scored', r1Sub.status === 200 && r1Sub.body.success === true && typeof r1Sub.body.is_correct === 'boolean');
    }

    // 14. Round 2 Questions retrieval
    const r2Tasks = await get(`/api/rounds/current?team_id=${testTeamId}&round=2`);
    test('Round 2 challenges retrieved for team', r2Tasks.status === 200 && r2Tasks.body.tasks && r2Tasks.body.tasks.length > 0);

    // 15. Round 3 Questions retrieval
    const r3Tasks = await get(`/api/rounds/current?team_id=${testTeamId}&round=3`);
    test('Round 3 challenges retrieved for team', r3Tasks.status === 200 && r3Tasks.body.tasks && r3Tasks.body.tasks.length > 0);

    // 16. Round 3 Test Execution Runner
    if (r3Tasks.body.tasks && r3Tasks.body.tasks[0]) {
      const q3 = r3Tasks.body.tasks[0];
      const r3Run = await post('/api/rounds/r3/run-test', {
        question_id: q3.id,
        code: q3.buggy_code
      });
      test('Round 3 Python code execution runner responsive', r3Run.status === 200 && r3Run.body.success === true);
    }
  }

  // 17. Frontend SPA Static Route Verification
  const indexHtml = await get('/');
  test('Root serves built React index.html', indexHtml.status === 200 && typeof indexHtml.body === 'string' && indexHtml.body.includes('<!DOCTYPE html>'));

  console.log(`\n=== RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
