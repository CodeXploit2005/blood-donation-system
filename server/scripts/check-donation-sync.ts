import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Registration } from '../src/models/Registration';
import { BloodDonationEvent } from '../src/models/BloodDonationEvent';
import { User } from '../src/models/User';
import { updateRegistrationStatus, getMyRegistrations } from '../src/controllers/registrationController';
import { getDashboardAnalytics } from '../src/services/reportService';
import { getEventCheckinList } from '../src/controllers/checkinController';

async function main() {
  const mongo = await MongoMemoryServer.create({ binary: { version: '7.0.24' } });
  try {
    await mongoose.connect(mongo.getUri());
    const userId = new mongoose.Types.ObjectId();
    await User.collection.insertOne({ _id: userId, fullName: 'Sync Test', email: 'sync@example.com' });
    const event = await BloodDonationEvent.create({ title: 'Sync test', description: 'Test', location: 'Test', addressDetails: 'Test', startDate: new Date(), endDate: new Date(Date.now() + 86400000), statusMode: 'manual', status: 'open', maxParticipants: 10, createdBy: userId });
    const reg = await Registration.create({ userId, eventId: event._id, fullName: 'Sync Test', phone: '0912345678', email: 'sync@example.com', weight: 55, bloodType: 'O+', qrCode: { code: 'SYNC', token: 'test' } });
    async function call(controller: any, body = {}, params = {}) {
      let result: any;
      let status = 200;
      const res: any = { status(code: number) { status = code; return this; }, json(data: any) { result = data; return this; } };
      await controller({ user: { _id: userId, role: 'staff' }, body, params, query: {} }, res);
      assert.equal(status, 200, JSON.stringify(result));
      return result.data;
    }
    for (const volume of [350, 450]) {
      const updated = await call(updateRegistrationStatus, { donationStatus: 'donated', donationVolume: volume, confirmedBloodType: 'O+' }, { id: String(reg._id) });
      assert.equal(updated.donationVolume, volume);
      assert.equal(updated.checkIn.status, 'checked_in');
      assert.equal(updated.screeningResult.doctorConclusion, 'eligible');
      const stored = await Registration.findById(reg._id);
      assert.equal(stored!.donationVolume, volume);
      const mine = await call(getMyRegistrations);
      assert.equal(mine[0].donationVolume, volume);
      const feed = await call(getEventCheckinList, {}, { eventId: String(event._id) });
      assert.equal(feed.totalDonated, 1);
      assert.equal(feed.totalCheckedIn, 1);
      assert.equal(feed.checkedInList[0].donationVolume, volume);
      const stats = await getDashboardAnalytics();
      assert.equal(stats.totalVolumeCollectedMl, volume);
      assert.equal(stats.totalDonated, 1);
      assert.equal(stats.confirmedBloodTypeDistribution[0].totalVolume, volume);
      assert.equal((await BloodDonationEvent.findById(event._id))!.collectedBloodUnits, 1);
    }
    console.log('PASS: save and edit volume sync to database, donor history/QR API, check-in feed, dashboard and event count; no duplicate donation count.');
  } finally {
    await mongoose.disconnect();
    await mongo.stop();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
