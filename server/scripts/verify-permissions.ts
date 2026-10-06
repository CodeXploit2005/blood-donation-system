import assert from 'node:assert/strict';
import { donorMiddleware, cancelPermission, registrationUpdatePermission, checkinPermission, staffMiddleware } from '../src/middleware/adminMiddleware';
function check(middleware: Function, role: string, body: object = {}) {
  let allowed = false, status = 200;
  const req = { user: { role }, body };
  const res = { status(value: number) { status = value; return this; }, json() { return this; } };
  middleware(req, res, () => { allowed = true; });
  return { allowed, status };
}
for (const role of ['user', 'admin', 'staff']) {
  assert.equal(check(donorMiddleware, role).allowed, role === 'user');
  assert.equal(check(cancelPermission, role).allowed, role !== 'staff');
  assert.equal(check(staffMiddleware, role).allowed, role !== 'user');
  assert.equal(check(registrationUpdatePermission, role, { screeningResult: { doctorConclusion: 'eligible' } }).allowed, role === 'staff');
  assert.equal(check(registrationUpdatePermission, role, { donationStatus: 'cancelled' }).allowed, role === 'admin');
  assert.equal(check(registrationUpdatePermission, role, { donationStatus: 'donated', donationVolume: 350, confirmedBloodType: 'O+' }).allowed, role === 'staff');
}
assert.equal(check(checkinPermission, 'admin', { action: 'presence' }).allowed, true);
assert.equal(check(checkinPermission, 'admin', { preview: true }).allowed, true);
assert.equal(check(checkinPermission, 'admin', { action: 'presence', nurseNotes: 'clinical' }).status, 403);
assert.equal(check(checkinPermission, 'admin', { confirmedBloodType: 'O+' }).status, 403);
assert.equal(check(registrationUpdatePermission, 'staff', { donationStatus: 'cancelled', screeningResult: {} }).status, 403);
assert.equal(check(registrationUpdatePermission, 'admin', { donationStatus: 'cancelled', screeningResult: {} }).status, 403);
console.log('PASS: donor-only registration, admin/donor cancellation, staff-only clinical results, admin presence/preview, blocked mixed payloads.');
