import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { BloodDonationEvent } from '../src/models/BloodDonationEvent';
import { Registration } from '../src/models/Registration';
import { User } from '../src/models/User';
import { createRegistration, cancelRegistration, updateRegistrationStatus } from '../src/controllers/registrationController';

// Read-only audit of application code: fixtures live only in a disposable database.
async function main() {
  const mongo = await MongoMemoryServer.create({ binary: { version: '7.0.24' } });
  try {
    await mongoose.connect(mongo.getUri());
    await Registration.init();
    const userId = new mongoose.Types.ObjectId();
    await User.collection.insertOne({ _id: userId, fullName: 'Audit donor', email: 'audit@example.com' });
    const event = await BloodDonationEvent.create({ title: 'Audit event', description: 'Audit only', location: 'Audit', addressDetails: 'Audit address', startDate: new Date(Date.now() - 86400000), endDate: new Date(Date.now() + 86400000), status: 'open', maxParticipants: 1, createdBy: userId });
    const body = { eventId: String(event._id), fullName: 'Audit donor', phone: '0912345678', email: 'audit@example.com', dateOfBirth: '1990-01-01', gender: 'male', weight: 55, bloodType: 'O+', healthInfo: {} };
    async function call(controller: any, request: any) {
      let status = 200;
      let result: any;
      await controller({ user: { _id: userId, role: 'user' }, params: {}, body: {}, query: {}, ...request }, { status(code: number) { status = code; return this; }, json(data: any) { result = data; return this; } });
      return { status, result };
    }
    const first = await call(createRegistration, { body });
    assert.equal(first.status, 201);
    const id = String(first.result.data.registration._id);
    assert.equal((await call(cancelRegistration, { params: { id } })).status, 200);
    const secondCancel = await call(cancelRegistration, { params: { id } });
    console.log('Repeated cancellation:', secondCancel.status, 'stored participants:', (await BloodDonationEvent.findById(event._id))!.currentParticipants);
    const retry = await call(createRegistration, { body });
    console.log('Register again after cancellation:', retry.status, retry.result.message);
    await Registration.deleteMany({ eventId: event._id });
    await BloodDonationEvent.updateOne({ _id: event._id }, { currentParticipants: 0 });
    const parallel = await Promise.all([userId, new mongoose.Types.ObjectId()].map(id => call(createRegistration, { user: { _id: id, role: 'user' }, body })));
    console.log('Concurrent registrations for capacity 1:', parallel.map(result => result.status), 'actual registrations:', await Registration.countDocuments({ eventId: event._id }));
    const reg = await Registration.findOne({ eventId: event._id });
    await Registration.updateOne({ _id: reg!._id }, { donationStatus: 'screened_ineligible', 'screeningResult.doctorConclusion': 'ineligible' });
    const donated = await call(updateRegistrationStatus, { user: { _id: userId, role: 'admin' }, params: { id: String(reg!._id) }, body: { donationStatus: 'donated', donationVolume: 350, confirmedBloodType: 'O+' } });
    console.log('Record donation from ineligible state:', donated.status, 'new screening:', donated.result.data?.screeningResult?.doctorConclusion);
  } finally {
    await mongoose.disconnect();
    await mongo.stop();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
