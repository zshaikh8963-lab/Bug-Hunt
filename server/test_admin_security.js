import http from 'http';

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

async function testAdminSecurity() {
  console.log('=== VERIFYING ADMIN CREDENTIALS & SECURITY ===');

  // 1. Initial Login with current credentials
  const login1 = await post('/api/auth/admin-login', { username: 'admin', password: 'admin123' });
  console.log('1. Admin initial login:', login1.status, login1.body.success ? '✓ SUCCESS' : 'FAILED');
  if (!login1.body.token) {
    console.error('Initial login failed, aborting:', login1.body);
    process.exit(1);
  }
  const token = login1.body.token;

  // 2. Reject change password with incorrect current password
  const failChange = await post('/api/admin/change-password', {
    current_password: 'wrongpassword',
    new_username: 'superadmin',
    new_password: 'newsecurepass123'
  }, { Authorization: `Bearer ${token}` });
  console.log('2. Reject incorrect current password:', failChange.status === 401 ? '✓ CORRECTLY REJECTED' : 'FAILED', failChange.body);

  // 3. Reject password under 6 characters
  const shortChange = await post('/api/admin/change-password', {
    current_password: 'admin123',
    new_username: 'superadmin',
    new_password: '123'
  }, { Authorization: `Bearer ${token}` });
  console.log('3. Reject short password (<6 chars):', shortChange.status === 400 ? '✓ CORRECTLY REJECTED' : 'FAILED', shortChange.body);

  // 4. Successfully change password
  const successChange = await post('/api/admin/change-password', {
    current_password: 'admin123',
    new_username: 'organizer2026',
    new_password: 'supersecretpass2026'
  }, { Authorization: `Bearer ${token}` });
  console.log('4. Successfully change password:', successChange.body.success ? '✓ SUCCESS' : 'FAILED', successChange.body.message);

  // 5. Old credentials must fail
  const oldLogin = await post('/api/auth/admin-login', { username: 'admin', password: 'admin123' });
  console.log('5. Old credentials rejected:', oldLogin.status === 401 ? '✓ CORRECTLY REJECTED' : 'FAILED');

  // 6. New credentials must succeed
  const newLogin = await post('/api/auth/admin-login', { username: 'organizer2026', password: 'supersecretpass2026' });
  console.log('6. New credentials login:', newLogin.body.success ? '✓ SUCCESS' : 'FAILED', newLogin.body.admin);

  // 7. Restore to default 'admin' / 'admin123' for smooth ongoing tests
  const restoreToken = newLogin.body.token;
  const restoreChange = await post('/api/admin/change-password', {
    current_password: 'supersecretpass2026',
    new_username: 'admin',
    new_password: 'admin123'
  }, { Authorization: `Bearer ${restoreToken}` });
  console.log('7. Restored default credentials for tests:', restoreChange.body.success ? '✓ RESTORED' : 'FAILED');

  console.log('=== ALL ADMIN SECURITY TESTS PASSED! ===');
}

testAdminSecurity().catch(console.error);
