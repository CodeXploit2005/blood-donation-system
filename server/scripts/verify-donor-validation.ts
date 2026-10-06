import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ageOnDate, birthDateError, birthDateBounds, vietnamToday } from '../src/utils/donorEligibility';
import { registerSchema, profileSchema } from '../src/controllers/authController';
import { createRegistrationSchema } from '../src/controllers/registrationController';
import { registerFormSchema, donationRegistrationSchema } from '../../client/src/utils/validators';
import { validate } from '../src/middleware/validateMiddleware';

assert.equal(readFileSync('client/src/utils/donorEligibility.ts', 'utf8'), readFileSync('server/src/utils/donorEligibility.ts', 'utf8'), 'Calendar rules must match client/server');
const reference = '2026-10-05';
for (const [birth, age, valid] of [
  ['2008-10-05', 18, true], ['2008-10-06', 17, false],
  ['1965-10-06', 60, true], ['1965-10-05', 61, false],
  ['2009-01-01', 17, false], ['2027-01-01', null, false],
  ['2000-02-30', null, false], ['2000-02-29', 26, true],
] as const) {
  assert.equal(ageOnDate(birth, reference), age, birth);
  assert.equal(birthDateError(birth, reference) === null, valid, birth);
}
assert.equal(ageOnDate('2008-02-29', '2026-02-28'), 17);
assert.equal(ageOnDate('2008-02-29', '2026-03-01'), 18);
assert.deepEqual(birthDateBounds(reference), { min: '1965-10-06', max: '2008-10-05' });
assert.equal(vietnamToday(new Date('2026-10-04T17:01:00Z')), reference);

const body = { fullName: ' Nguyễn Văn A ', email: ' DONOR@EXAMPLE.COM ', phone: '+84 912 345 678', password: 'GoodPass123!', confirmPassword: 'GoodPass123!', dateOfBirth: '1998-01-01', gender: 'male', bloodType: 'unknown' };
const invalid = [{ dateOfBirth: '' }, { dateOfBirth: '2027-01-01' }, { dateOfBirth: '2015-01-01' }, { dateOfBirth: '1900-01-01' }, { dateOfBirth: '2000-02-30' }, { phone: '09123' }, { phone: '++84912345678' }, { fullName: '  ' }, { email: 'not-email' }, { password: '1234567', confirmPassword: '1234567' }, { confirmPassword: 'Different' }, { bloodType: 'X+' }, { password: 'ắ'.repeat(25), confirmPassword: 'ắ'.repeat(25) }];
assert.equal(registerSchema.parse({ body }).body.phone, '0912345678');
assert.equal(registerSchema.parse({ body }).body.email, 'donor@example.com');
assert.equal(registerFormSchema.parse(body).fullName, 'Nguyễn Văn A');
for (const change of invalid) {
  assert.equal(registerSchema.safeParse({ body: { ...body, ...change } }).success, false, JSON.stringify(change));
  assert.equal(registerFormSchema.safeParse({ ...body, ...change }).success, false, JSON.stringify(change));
}
const donation = { ...body, eventId: 'test-event', weight: 55, height: 165, identityCardNumber: '001098001234', agreeTerms: true };
assert.equal(createRegistrationSchema.safeParse({ body: donation }).success, true);
assert.equal(donationRegistrationSchema.safeParse(donation).success, true);
for (const dateOfBirth of ['', '2015-01-01', '1900-01-01', '2000-02-30']) {
  assert.equal(createRegistrationSchema.safeParse({ body: { ...donation, dateOfBirth } }).success, false);
  assert.equal(donationRegistrationSchema.safeParse({ ...donation, dateOfBirth }).success, false);
}
assert.equal(donationRegistrationSchema.safeParse({ ...donation, agreeTerms: false }).success, false);
assert.equal(createRegistrationSchema.safeParse({ body: { ...donation, agreeTerms: false } }).success, false);
assert.equal(profileSchema.safeParse({ body: { dateOfBirth: '2015-01-01' } }).success, false);

// Exercise the actual middleware: bypassing the UI must return 422, and
// validated requests must pass transformed values to the controller.
async function checkMiddleware(input: object) {
  const req: any = { body: input, query: {}, params: {} };
  let status = 200, called = false;
  const res: any = { status(value: number) { status = value; return this; }, json() { return this; } };
  await validate(registerSchema)(req, res, () => { called = true; });
  return { status, called, body: req.body };
}
(async () => {
  const valid = await checkMiddleware(body);
  assert.equal(valid.called, true);
  assert.equal(valid.body.phone, '0912345678');
  for (const change of invalid) {
    const result = await checkMiddleware({ ...body, ...change });
    assert.equal(result.status, 422);
    assert.equal(result.called, false);
  }
  console.log('PASS: birthday boundaries, leap dates, Vietnam timezone, client/server parity, account/donation/profile validation and middleware enforcement.');
})().catch(error => { console.error(error); process.exitCode = 1; });
