// Integration check against an isolated local development database only.
const assert = require('node:assert/strict');
const base = process.env.TEST_API_URL || 'http://localhost:5174/api';
async function req(route, method = 'GET', token, body) {
  const r = await fetch(base + route, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  return { status: r.status, body: await r.json() };
}
(async () => {
  assert.equal(process.env.TEST_LOCAL_DB, 'true', 'Set TEST_LOCAL_DB=true only for an isolated test database.');
  assert.equal((await req('/health')).status, 200);
  const events = await req('/events?status=open&limit=3');
  assert.equal(events.status, 200);
  const allEvents = events.body.data.length ? events : await req('/events?limit=1');
  const eventId = allEvents.body.data[0]._id;
  assert.equal((await req('/auth/me')).status, 401);
  const a = await req('/auth/login', 'POST', null, { email: process.env.TEST_ADMIN_EMAIL || 'admin@blooddonation.vn', password: process.env.TEST_ADMIN_PASSWORD || 'Admin@123456' });
  assert.equal(a.status, 200);
  const admin = a.body.data.token;
  const signup = await req('/auth/register', 'POST', null, { fullName: 'Kiểm tra phân quyền', email: `role-check-${Date.now()}@example.com`, phone: '0901234567', password: 'RoleTest@123', confirmPassword: 'RoleTest@123', dateOfBirth: '1998-01-01', gender: 'male', role: 'admin' });
  assert.equal(signup.body.data.user.role, 'user');
  const token = signup.body.data.token;
  const uid = signup.body.data.user._id;
  try {
    assert.equal((await req(`/registrations/event/${eventId}`, 'GET', token)).status, 403);
    assert.equal((await req(`/users/${uid}/role`, 'PATCH', admin, { role: 'staff' })).status, 200);
    assert.equal((await req('/auth/me', 'GET', token)).body.data.user.role, 'staff');
    for (const [endpoint, method] of [['/registrations', 'POST'], ['/registrations/my', 'GET'], ['/registrations/000000000000000000000001', 'DELETE']]) assert.equal((await req(endpoint, method, token, method === 'POST' ? {} : undefined)).status, 403);
    assert.equal((await req('/registrations', 'POST', admin, {})).status, 403);
    assert.equal((await req('/registrations/my', 'GET', admin)).status, 403);
    assert.equal((await req('/checkin', 'POST', admin, { qrData: 'test', actualVolumeMl: 350, confirmedBloodType: 'O+' })).status, 403);
    assert.equal((await req('/registrations/000000000000000000000001', 'PUT', admin, { screeningResult: { doctorConclusion: 'eligible' } })).status, 403);
    assert.equal((await req('/registrations/000000000000000000000001', 'PUT', token, { donationStatus: 'cancelled' })).status, 403);
    for (const endpoint of [`/registrations/event/${eventId}`, `/checkin/event/${eventId}`]) assert.equal((await req(endpoint, 'GET', token)).status, 200);
    for (const endpoint of ['/users', '/reports/dashboard']) assert.equal((await req(endpoint, 'GET', token)).status, 403);
    for (const [endpoint, method] of [['/events', 'POST'], [`/events/${eventId}`, 'PUT'], [`/events/${eventId}`, 'DELETE']]) assert.equal((await req(endpoint, method, token, {})).status, 403);
    assert.equal((await req(`/users/${uid}/role`, 'PATCH', token, { role: 'admin' })).status, 403);
    assert.equal((await req(`/users/${uid}/role`, 'PATCH', admin, { role: 'user' })).status, 200);
    assert.equal((await req(`/registrations/event/${eventId}`, 'GET', token)).status, 403);
    console.log('PASS: Vite proxy, events, auth/me, signup protection, donor/staff/admin permissions, immediate role revocation.');
  } finally {
    assert.equal((await req(`/users/${uid}`, 'DELETE', admin)).status, 200);
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
