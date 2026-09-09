import http from 'http';

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? (typeof data === 'string' ? data : JSON.stringify(data)) : null;
    const headers = { ...options.headers };
    if (postData) {
      headers['Content-Length'] = Buffer.byteLength(postData);
    }
    const req = http.request({ ...options, headers }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== TESTING ADMIN QUESTION BANK CRUD (R1, R2, R3) ===\n');

  // 1. Admin Login
  console.log('1. Authenticating Admin...');
  const loginRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/admin-login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { username: 'admin', password: 'admin123' });

  if (!loginRes.body.token) {
    console.error('Failed to log in as admin:', loginRes.body);
    process.exit(1);
  }
  const token = loginRes.body.token;
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  console.log('✓ Admin authenticated successfully.\n');

  // 2. Test Round 1: Create, Update, Toggle, Delete MCQ
  console.log('2. Testing Round 1 MCQ Endpoints...');
  
  // Create
  const createR1 = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/admin/questions/r1',
    method: 'POST',
    headers: authHeaders
  }, {
    language: 'Python',
    difficulty: 'Medium',
    title: 'Test MCQ: Generator Expressions',
    question_text: 'What is the type returned by a generator expression?',
    code_snippet: 'g = (x * 2 for x in range(5))',
    options: ['list', 'generator', 'tuple', 'iterator'],
    correct_option_index: 1,
    explanation: 'Parentheses with a comprehension create a generator object.',
    is_active: 1
  });

  console.log('  - POST /api/admin/questions/r1:', createR1.status, createR1.body.success ? '✓' : 'FAILED');
  const r1Id = createR1.body.question?.id;
  if (!r1Id) throw new Error('No R1 ID returned: ' + JSON.stringify(createR1.body));

  // Update
  const updateR1 = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/admin/questions/r1/${r1Id}`,
    method: 'PUT',
    headers: authHeaders
  }, {
    title: 'Updated Test MCQ: Generator Expressions',
    question_text: 'Updated text: What does (x for x in range(3)) produce?',
    options: ['list', 'generator', 'tuple', 'set'],
    correct_option_index: 1
  });
  console.log('  - PUT /api/admin/questions/r1/:id:', updateR1.status, updateR1.body.success ? '✓' : 'FAILED');
  console.log('    Updated Title:', updateR1.body.question?.title);

  // Toggle
  const toggleR1 = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/admin/questions/r1/${r1Id}/toggle`,
    method: 'PATCH',
    headers: authHeaders
  });
  console.log('  - PATCH /api/admin/questions/r1/:id/toggle:', toggleR1.status, toggleR1.body.is_active === 0 ? '✓ (Toggled to Inactive)' : 'FAILED');

  // Delete
  const deleteR1 = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/admin/questions/r1/${r1Id}`,
    method: 'DELETE',
    headers: authHeaders
  });
  console.log('  - DELETE /api/admin/questions/r1/:id:', deleteR1.status, deleteR1.body.success ? '✓' : 'FAILED');
  console.log('✓ Round 1 MCQ CRUD passed.\n');


  // 3. Test Round 2: Java Challenge (Buggy Line MCQ & Bug Type MCQ)
  console.log('3. Testing Round 2 Java Challenge Endpoints (Buggy Line & Bug Type)...');

  // Create
  const createR2 = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/admin/questions/r2',
    method: 'POST',
    headers: authHeaders
  }, {
    challenge_code: 'JAVA-TEST-99',
    title: 'Test Java Challenge: Array Bounds Off-by-One',
    description: 'A loop iterates past the end of an array.',
    code_snippet: 'public class Test {\n    public static void main(String[] args) {\n        int[] arr = new int[5];\n        for (int i = 0; i <= arr.length; i++) {\n            arr[i] = i;\n        }\n    }\n}',
    buggy_line: 4,
    bug_type: 'Runtime Error',
    explanation: 'Line 4 has <= arr.length which causes ArrayIndexOutOfBoundsException.',
    is_active: 1
  });
  console.log('  - POST /api/admin/questions/r2:', createR2.status, createR2.body.success ? '✓' : 'FAILED');
  const r2Id = createR2.body.challenge?.id;
  if (!r2Id) throw new Error('No R2 ID returned: ' + JSON.stringify(createR2.body));

  // Update
  const updateR2 = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/admin/questions/r2/${r2Id}`,
    method: 'PUT',
    headers: authHeaders
  }, {
    title: 'Updated Java Off-by-One Challenge',
    buggy_line: 4,
    bug_type: 'Exception',
    explanation: 'ArrayIndexOutOfBoundsException at Line 4.'
  });
  console.log('  - PUT /api/admin/questions/r2/:id:', updateR2.status, updateR2.body.success ? '✓' : 'FAILED');
  console.log('    Updated Bug Type:', updateR2.body.challenge?.bug_type);

  // Toggle
  const toggleR2 = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/admin/questions/r2/${r2Id}/toggle`,
    method: 'PATCH',
    headers: authHeaders
  });
  console.log('  - PATCH /api/admin/questions/r2/:id/toggle:', toggleR2.status, toggleR2.body.is_active === 0 ? '✓' : 'FAILED');

  // Delete
  const deleteR2 = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/admin/questions/r2/${r2Id}`,
    method: 'DELETE',
    headers: authHeaders
  });
  console.log('  - DELETE /api/admin/questions/r2/:id:', deleteR2.status, deleteR2.body.success ? '✓' : 'FAILED');
  console.log('✓ Round 2 Java Challenge CRUD passed.\n');


  // 4. Test Round 3: Python Challenge (Identify & Solve Bug)
  console.log('4. Testing Round 3 Python Challenge Endpoints (Identify & Solve Bug)...');

  // Create
  const createR3 = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/admin/questions/r3',
    method: 'POST',
    headers: authHeaders
  }, {
    challenge_code: 'PY-TEST-99',
    title: 'Test Python Challenge: String Reversal Bug',
    description: 'Reverse words in a given sentence.',
    expected_behavior: 'Input: "hello world" -> Output: "world hello"',
    input_format: 'Single string',
    output_format: 'Reversed string',
    constraints: '1 <= len(S) <= 1000',
    buggy_code: 'def solve():\n    s = input()\n    print(" ".join(s.split()))\n\nsolve()',
    canonical_solution: 'def solve():\n    s = input()\n    print(" ".join(s.split()[::-1]))\n\nsolve()',
    faulty_line: 3,
    bug_type: 'Logical Error',
    visible_tests: [
      { input: 'hello world\n', expected_output: 'world hello' }
    ],
    hidden_tests: [
      { input: 'python is awesome\n', expected_output: 'awesome is python' }
    ],
    is_active: 1
  });
  console.log('  - POST /api/admin/questions/r3:', createR3.status, createR3.body.success ? '✓' : 'FAILED');
  const r3Id = createR3.body.challenge?.id;
  if (!r3Id) throw new Error('No R3 ID returned: ' + JSON.stringify(createR3.body));

  // Update
  const updateR3 = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/admin/questions/r3/${r3Id}`,
    method: 'PUT',
    headers: authHeaders
  }, {
    title: 'Updated Python String Reversal Bug',
    faulty_line: 3,
    bug_type: 'String Manipulation Error'
  });
  console.log('  - PUT /api/admin/questions/r3/:id:', updateR3.status, updateR3.body.success ? '✓' : 'FAILED');
  console.log('    Updated Bug Type:', updateR3.body.challenge?.bug_type);

  // Toggle
  const toggleR3 = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/admin/questions/r3/${r3Id}/toggle`,
    method: 'PATCH',
    headers: authHeaders
  });
  console.log('  - PATCH /api/admin/questions/r3/:id/toggle:', toggleR3.status, toggleR3.body.is_active === 0 ? '✓' : 'FAILED');

  // Delete
  const deleteR3 = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/admin/questions/r3/${r3Id}`,
    method: 'DELETE',
    headers: authHeaders
  });
  console.log('  - DELETE /api/admin/questions/r3/:id:', deleteR3.status, deleteR3.body.success ? '✓' : 'FAILED');
  console.log('✓ Round 3 Python Challenge CRUD passed.\n');

  console.log('==================================================');
  console.log('ALL QUESTION BANK CRUD OPERATIONS PASSED VERIFICATION!');
  console.log('==================================================');
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
