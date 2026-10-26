import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Registration } from '../src/models/Registration';
import { BloodDonationEvent } from '../src/models/BloodDonationEvent';
import { User } from '../src/models/User';
import { generateRegistrationQR } from '../src/services/qrService';
import { checkInSchema, verifyAndCheckIn } from '../src/controllers/checkinController';
import { updateRegistrationStatus } from '../src/controllers/registrationController';
import { deleteUser } from '../src/controllers/userController';
import { authMiddleware } from '../src/middleware/authMiddleware';
import { generateToken } from '../src/utils/generateToken';

async function main() {
  assert.equal(checkInSchema.parse({ body: { qrData: 'test' } }).body.actualVolumeMl, undefined);
  const mongo = await MongoMemoryServer.create({ binary: { version: '7.0.24' } });
  try {
    await mongoose.connect(mongo.getUri());
    const donor = new mongoose.Types.ObjectId(), staff = new mongoose.Types.ObjectId();
    await User.collection.insertMany([{ _id: donor, fullName: 'Review donor', email: 'donor@example.com', role: 'user' }, { _id: staff, fullName: 'Review staff', email: 'staff@example.com', role: 'staff' }]);
    const event = await BloodDonationEvent.create({ title: 'Review event', description: 'Test only', location: 'Test', addressDetails: 'Test address', startDate: new Date(), endDate: new Date(Date.now() + 86400000), status: 'open', statusMode: 'manual', createdBy: staff });
    const id = new mongoose.Types.ObjectId();
    const qr = await generateRegistrationQR(String(id), String(donor), String(event._id));
    await Registration.create({ _id: id, userId: donor, eventId: event._id, fullName: 'Review donor', phone: '0912345678', email: 'donor@example.com', bloodType: 'O+', weight: 55, qrCode: qr });
    async function call(controller: any, body = {}, params = {}, role = 'staff', extra = {}) {
      let status = 200, result: any;
      const res: any = { status(code: number) { status = code; return this; }, json(data: any) { result = data; return this; } };
      await controller({ user: { _id: staff, role, fullName: 'Review staff' }, body, params, query: {}, ...extra }, res, () => {});
      return { status, data: result?.data };
    }
    const payload = { qrData: `${qr.code}:${qr.token.substring(0, 16)}`, confirmedBloodType: 'O+' };
    assert.equal((await call(verifyAndCheckIn, payload)).status, 422);
    const results = await Promise.all([call(verifyAndCheckIn, { ...payload, actualVolumeMl: 350 }), call(verifyAndCheckIn, { ...payload, actualVolumeMl: 350 })]);
    assert.equal(results.filter(result => result.status === 200).length, 1);
    assert.equal((await BloodDonationEvent.findById(event._id))!.collectedBloodUnits, 1);
    assert.equal((await Registration.findById(id))!.resultHistory.length, 1);
    const edit = { donationStatus: 'donated', donationVolume: 450, confirmedBloodType: 'A+' };
    assert.equal((await call(updateRegistrationStatus, edit, { id }, 'admin')).status, 422);
    assert.equal((await call(updateRegistrationStatus, { ...edit, reason: 'Đối chiếu phiếu kết quả' }, { id }, 'admin')).status, 200);
    const stored = (await Registration.findById(id))!;
    assert.equal(stored.resultHistory.length, 2);
    assert.equal(stored.resultHistory[1].before.donationVolume, 350);
    assert.equal(stored.resultHistory[1].after.donationVolume, 450);
    assert.equal(stored.resultHistory[1].actorRole, 'admin');
    const token = generateToken(donor, 'user', 0);
    assert.equal((await call(deleteUser, {}, { id: String(donor) }, 'admin')).status, 200);
    assert.equal((await User.findById(donor))!.isActive, false);
    assert.ok((await Registration.findById(id).populate('userId'))!.userId);
    assert.equal((await call(authMiddleware, {}, {}, 'user', { headers: { authorization: `Bearer ${token}` } })).status, 401);
    console.log('PASS: no default QR volume; concurrent QR records once; edit reason and before/after audit; deactivate preserves history and rejects existing session.');
  } finally { await mongoose.disconnect(); await mongo.stop(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
