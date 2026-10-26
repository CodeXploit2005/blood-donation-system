import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import path from 'node:path';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { BloodDonationEvent } from '../src/models/BloodDonationEvent';
import { Registration } from '../src/models/Registration';
import { resolveEventStatus, syncAutomaticEventStatuses } from '../src/services/eventStatusService';
import { getEventDonationSummaries } from '../src/services/eventDonationService';
import { createRegistration } from '../src/controllers/registrationController';

async function main() {
  const now = new Date('2026-10-26T10:00:00+07:00');
  const start = new Date('2026-10-07T08:00:00+07:00');
  const end = new Date('2026-10-20T17:00:00+07:00');
  assert.equal(resolveEventStatus(start, end, 'open', now, 'manual'), 'closed');
  assert.equal(resolveEventStatus(start, end, 'open', end), 'closed');
  assert.equal(resolveEventStatus(start, end, 'open', new Date(start.getTime() - 1)), 'upcoming');
  assert.equal(resolveEventStatus(start, end, 'upcoming', start), 'open');
  assert.equal(resolveEventStatus(start, end, 'completed', now), 'completed');
  assert.equal(resolveEventStatus(start, end, 'closed', start), 'closed');
  console.log('PASS: status expiry boundaries and manual mode.');
  const dbPath = await mkdtemp(path.resolve(__dirname, '../.data/event-results-test-'));
  const mongo = await MongoMemoryServer.create({ instance: { dbPath } });
  try {
    await mongoose.connect(mongo.getUri());
    const event = await BloodDonationEvent.create({ title: 'Expired event', description: 'Test results', location: 'Test', addressDetails: 'Test address', startDate: start, endDate: end, status: 'open', statusMode: 'manual', createdBy: new mongoose.Types.ObjectId() });
    // A stale manual-open record must be rejected even before the scheduler runs.
    let status = 200;
    await createRegistration({ user: { _id: new mongoose.Types.ObjectId() }, body: { eventId: event._id } } as any, { status(code: number) { status = code; return this; }, json() { return this; } } as any);
    assert.equal(status, 400);
    await BloodDonationEvent.updateOne({ _id: event._id }, { status: 'open' });
    await syncAutomaticEventStatuses(now);
    assert.equal((await BloodDonationEvent.findById(event._id))!.status, 'closed');
    for (const [i, donationStatus, donationVolume, confirmedBloodType] of [
      [0, 'donated', 350, 'O+'], [1, 'donated', 450, 'O+'],
      [2, 'donated', 250, 'A+'], [3, 'checked_in', 450, 'B+'],
      [4, 'cancelled', 450, 'B+'], [5, 'donated', null, null],
    ] as const) {
      await Registration.create({ userId: new mongoose.Types.ObjectId(), eventId: event._id, fullName: 'Test donor', phone: '0912345678', email: `test${i}@example.com`, weight: 55, bloodType: 'B+', donationStatus, donationVolume, confirmedBloodType, qrCode: { code: `RESULT-${i}`, token: 'test' } });
    }
    const summary = (await getEventDonationSummaries([event._id])).get(String(event._id))!;
    assert.equal(summary.donors, 4);
    assert.equal(summary.volumeMl, 1050);
    assert.equal(summary.missingVolume, 1);
    assert.equal(summary.bloodTypes.find(item => item.bloodType === 'O+')!.volumeMl, 800);
    assert.equal(summary.bloodTypes.some(item => item.bloodType === 'B+'), false);
    console.log('PASS: expiry boundaries, manual expiry, API rejection, database sync, actual volumes and confirmed blood groups.');
  } finally {
    await mongoose.disconnect();
    await mongo.stop();
    await rm(dbPath, { recursive: true, force: true });
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
