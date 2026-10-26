import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Registration } from '../src/models/Registration';
import { BloodDonationEvent } from '../src/models/BloodDonationEvent';
import { User } from '../src/models/User';
import { updateRegistrationStatus, getMyRegistrations } from '../src/controllers/registrationController';
import { getDashboardAnalytics } from '../src/services/reportService';
import { getEventCheckinList, undoCheckIn } from '../src/controllers/checkinController';
import { getEventReport } from '../src/controllers/reportController';
import { generateEventCSV } from '../src/services/reportService';
import { getEventDonationSummaries } from '../src/services/eventDonationService';

async function main() {
  const mongo = await MongoMemoryServer.create({ binary: { version: '7.0.24' } });
  try {
    await mongoose.connect(mongo.getUri());
    const userId = new mongoose.Types.ObjectId();
    await User.collection.insertOne({ _id: userId, fullName: 'Sync Test', email: 'sync@example.com' });
    const event = await BloodDonationEvent.create({ title: 'Sync test', description: 'Test', location: 'Test', addressDetails: 'Test', startDate: new Date(), endDate: new Date(Date.now() + 86400000), statusMode: 'manual', status: 'open', maxParticipants: 10, createdBy: userId });
    const reg = await Registration.create({ userId, eventId: event._id, fullName: 'Sync Test', phone: '0912345678', email: 'sync@example.com', weight: 55, bloodType: 'O+', qrCode: { code: 'SYNC', token: 'test' } });
    async function call(controller: any, body = {}, params = {}, expectedStatus = 200) {
      let result: any;
      let status = 200;
      const res: any = { status(code: number) { status = code; return this; }, json(data: any) { result = data; return this; } };
      await controller({ user: { _id: userId, role: 'staff' }, body, params, query: {} }, res);
      assert.equal(status, expectedStatus, JSON.stringify(result));
      return result.data;
    }
    for (const [volume, bloodType] of [[350, 'O+'], [450, 'A+']] as const) {
      const updated = await call(updateRegistrationStatus, { donationStatus: 'donated', donationVolume: volume, confirmedBloodType: bloodType, reason: 'Đối chiếu phiếu hiến máu thực tế' }, { id: String(reg._id) });
      assert.equal(updated.donationVolume, volume);
      assert.equal(updated.checkIn.status, 'checked_in');
      assert.equal(updated.screeningResult.doctorConclusion, 'eligible');
      const stored = await Registration.findById(reg._id);
      assert.equal(stored!.donationVolume, volume);
      const mine = await call(getMyRegistrations);
      assert.equal(mine[0].donationVolume, volume);
      assert.equal(mine[0].confirmedBloodType, bloodType);
      const report = await call(getEventReport, {}, { eventId: String(event._id) });
      assert.equal(report.totalVolumeMl, volume);
      assert.equal(report.totalDonated, 1);
      assert.equal(report.registrations[0].donationVolume, volume);
      assert.equal(report.bloodTypeStats[0]._id, bloodType);
      const csv = generateEventCSV(event, report.registrations);
      assert.ok(csv.includes(`"${bloodType}"`));
      assert.ok(csv.includes(String(volume)));
      const summary = (await getEventDonationSummaries([event._id])).get(String(event._id))!;
      assert.equal(summary.volumeMl, volume);
      assert.equal(summary.donors, 1);
      assert.equal(summary.bloodTypes[0].bloodType, bloodType);
      const feed = await call(getEventCheckinList, {}, { eventId: String(event._id) });
      assert.equal(feed.totalDonated, 1);
      assert.equal(feed.totalCheckedIn, 1);
      assert.equal(feed.checkedInList[0].donationVolume, volume);
      const stats = await getDashboardAnalytics();
      assert.equal(stats.totalVolumeCollectedMl, volume);
      assert.equal(stats.totalDonated, 1);
      assert.equal(stats.confirmedBloodTypeDistribution.find(item => item.name === bloodType)?.totalVolume, volume);
      assert.equal((await BloodDonationEvent.findById(event._id))!.collectedBloodUnits, 1);
    }
    await call(updateRegistrationStatus, { donationVolume: -10 }, { id: String(reg._id) }, 422);
    await call(updateRegistrationStatus, { confirmedBloodType: 'unknown' }, { id: String(reg._id) }, 422);
    assert.equal((await Registration.findById(reg._id))!.donationVolume, 450);
    await call(undoCheckIn, {}, { registrationId: String(reg._id) });
    const reverted = (await call(getMyRegistrations))[0];
    assert.equal(reverted.donationVolume, null);
    assert.equal(reverted.confirmedBloodType, null);
    const revertedReport = await call(getEventReport, {}, { eventId: String(event._id) });
    assert.equal(revertedReport.totalVolumeMl, 0);
    assert.equal(revertedReport.totalDonated, 0);
    assert.equal((await getDashboardAnalytics()).totalVolumeCollectedMl, 0);
    console.log('PASS: save/edit volume and blood type sync to user history/QR, event report/CSV, dashboard and event totals; invalid edits rejected; undo clears results everywhere.');
  } finally {
    await mongoose.disconnect();
    await mongo.stop();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
