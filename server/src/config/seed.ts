import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { BloodDonationEvent } from '../models/BloodDonationEvent';
import { Registration } from '../models/Registration';
import { generateRegistrationQR } from '../services/qrService';
import connectDB, { isUsingMemoryDB } from './db';

dotenv.config();

export const normalizeExistingData = async (): Promise<void> => {
  try {
    // Migration: Update any existing records without donationStatus or confirmedBloodType
    await Registration.updateMany(
      { donationStatus: { $exists: false } },
      [
        {
          $set: {
            donationStatus: {
              $cond: [
                { $eq: ['$checkIn.status', true] },
                'donated',
                {
                  $cond: [
                    { $eq: ['$registrationStatus', 'cancelled'] },
                    'cancelled',
                    'registered',
                  ],
                },
              ],
            },
            'checkIn.status': {
              $cond: [{ $eq: ['$checkIn.status', true] }, 'checked_in', 'pending'],
            },
            donationVolume: {
              $cond: [
                { $eq: ['$checkIn.status', true] },
                { $ifNull: ['$checkIn.actualVolumeMl', 350] },
                null,
              ],
            },
            confirmedBloodType: {
              $cond: [
                { $eq: ['$checkIn.status', true] },
                { $ifNull: ['$bloodType', 'O+'] },
                null,
              ],
            },
          },
        },
      ]
    );

    // Also ensure checkIn.status boolean from old data is converted to 'checked_in' | 'pending'
    await Registration.updateMany(
      { 'checkIn.status': true },
      { $set: { 'checkIn.status': 'checked_in', donationStatus: 'donated' } }
    );

    await Registration.updateMany(
      { 'checkIn.status': false },
      { $set: { 'checkIn.status': 'pending' } }
    );
  } catch (err: any) {
    console.warn('[Migration] Note on data normalization:', err.message);
  }
};

export const seedDatabase = async (): Promise<void> => {
  try {
    await normalizeExistingData();

    const existingAdmin = await User.findOne({ email: 'admin@blooddonation.vn' });
    if (existingAdmin) {
      console.log('[Seed] Database users exist. Data normalized.');
      return;
    }

    console.log('[Seed] Starting initial database seeding with rich demonstration data...');
    
    // 3. Create Blood Donation Events
    const now = new Date();
    const event1Start = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 1);
    const event1End = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 3);

    const event2Start = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 5);
    const event2End = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7);

    const event3Start = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 14);
    const event3End = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 16);

    const event1 = await BloodDonationEvent.create({
      title: 'Chủ Nhật Đỏ 2026 — Giọt Hồng Trao Đi, Nụ Cười Ở Lại',
      description:
        'Chương trình hiến máu nhân đạo thường niên quy mô lớn, tiếp nhận các nhóm máu phục vụ điều trị cấp cứu bệnh nhân tại Viện Huyết học và các bệnh viện tuyến đầu miền Bắc.',
      location: 'Viện Huyết học - Truyền máu Trung ương',
      addressDetails: 'Số 1 Phố Phạm Văn Bạch, Yên Hòa, Cầu Giấy, Hà Nội',
      startDate: event1Start,
      endDate: event1End,
      maxParticipants: 150,
      currentParticipants: 4,
      status: 'open',
      imageUrl:
        'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&q=80&w=1000',
      organizer: 'Báo Tiền Phong & Viện Huyết học - Truyền máu TW',
      contactPhone: '0988123456',
      targetBloodUnits: 120,
      collectedBloodUnits: 2,
      createdBy: adminUser._id,
    });

    const event2 = await BloodDonationEvent.create({
      title: 'Hành Trình Đỏ 2026 — Kết Nối Dòng Máu Việt TP.HCM',
      description:
        'Chiến dịch vận động hiến máu tình nguyện xuyên Việt tại TP. Hồ Chí Minh với thông điệp trao gửi yêu thương và tiếp sức người bệnh hiểm nghèo.',
      location: 'Nhà Văn hóa Thanh niên',
      addressDetails: 'Số 4 Phạm Ngọc Thạch, Bến Nghé, Quận 1, TP. Hồ Chí Minh',
      startDate: event2Start,
      endDate: event2End,
      maxParticipants: 200,
      currentParticipants: 0,
      status: 'open',
      imageUrl:
        'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=1000',
      organizer: 'Hội Chữ Thập Đỏ TP.HCM & Bệnh viện Truyền máu Huyết học',
      contactPhone: '0912345678',
      targetBloodUnits: 180,
      collectedBloodUnits: 0,
      createdBy: adminUser._id,
    });

    const event3 = await BloodDonationEvent.create({
      title: 'Ngày Hội Hiến Máu Tình Nguyện "Trái Tim Bách Khoa"',
      description:
        'Ngày hội truyền thống của sinh viên và cán bộ giảng viên Đại học Bách Khoa Hà Nội nhằm lan tỏa tinh thần sẻ chia vì cộng đồng.',
      location: 'Hội trường C2 - ĐH Bách Khoa Hà Nội',
      addressDetails: 'Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội',
      startDate: event3Start,
      endDate: event3End,
      maxParticipants: 100,
      currentParticipants: 0,
      status: 'upcoming',
      imageUrl:
        'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=1000',
      organizer: 'Đoàn Thanh niên & Hội Sinh viên ĐH Bách Khoa',
      contactPhone: '0977889900',
      targetBloodUnits: 90,
      collectedBloodUnits: 0,
      createdBy: adminUser._id,
    });

    // 4. Create Registrations with State Machine values
    // Reg 1: User 1 -> Donated (350ml, O+)
    const reg1Id = new mongoose.Types.ObjectId();
    const qr1 = await generateRegistrationQR(
      reg1Id.toString(),
      user1._id.toString(),
      event1._id.toString()
    );
    await Registration.create({
      _id: reg1Id,
      userId: user1._id,
      eventId: event1._id,
      fullName: user1.fullName,
      phone: user1.phone,
      email: user1.email,
      bloodType: user1.bloodType,
      confirmedBloodType: 'O+',
      dateOfBirth: user1.dateOfBirth,
      gender: user1.gender,
      identityCardNumber: user1.identityCardNumber,
      weight: 52,
      height: 162,
      healthInfo: {
        hasFever: false,
        hasChronicDisease: false,
        takingMedication: false,
        recentSurgery: false,
      },
      screeningResult: {
        doctorConclusion: 'eligible',
        notes: 'Đủ điều kiện sơ bộ tham gia hiến máu theo tiêu chuẩn của Bộ Y Tế.',
        reasons: [],
      },
      donationStatus: 'donated',
      donationVolume: 350,
      qrCode: qr1,
      preferredTimeSlot: '08:00 - 09:30',
      checkIn: {
        status: 'checked_in',
        checkInTime: new Date(now.getTime() - 1000 * 60 * 45),
        checkedInBy: adminUser._id,
        nurseNotes: 'Sức khỏe tốt, huyết áp 120/80 mmHg, hiến máu thuận lợi.',
        bloodPressure: '120/80',
        hemoglobinLevel: 13.8,
      },
      registeredAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2),
    });

    // Reg 2: User 2 -> Donated (450ml, A+)
    const reg2Id = new mongoose.Types.ObjectId();
    const qr2 = await generateRegistrationQR(
      reg2Id.toString(),
      user2._id.toString(),
      event1._id.toString()
    );
    await Registration.create({
      _id: reg2Id,
      userId: user2._id,
      eventId: event1._id,
      fullName: user2.fullName,
      phone: user2.phone,
      email: user2.email,
      bloodType: user2.bloodType,
      confirmedBloodType: 'A+',
      dateOfBirth: user2.dateOfBirth,
      gender: user2.gender,
      identityCardNumber: user2.identityCardNumber,
      weight: 68,
      height: 175,
      healthInfo: {
        hasFever: false,
        hasChronicDisease: false,
        takingMedication: false,
        recentSurgery: false,
      },
      screeningResult: {
        doctorConclusion: 'eligible',
        notes: 'Đủ điều kiện sơ bộ tham gia hiến máu.',
        reasons: [],
      },
      donationStatus: 'donated',
      donationVolume: 450,
      qrCode: qr2,
      preferredTimeSlot: '09:30 - 11:00',
      checkIn: {
        status: 'checked_in',
        checkInTime: new Date(now.getTime() - 1000 * 60 * 15),
        checkedInBy: adminUser._id,
        nurseNotes: 'Người hiến tình nguyện thể trạng xuất sắc, hiến 450ml.',
        bloodPressure: '118/78',
        hemoglobinLevel: 14.5,
      },
      registeredAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1),
    });

    // Reg 3: User 3 -> Registered (Ready for check-in)
    const reg3Id = new mongoose.Types.ObjectId();
    const qr3 = await generateRegistrationQR(
      reg3Id.toString(),
      user3._id.toString(),
      event1._id.toString()
    );
    await Registration.create({
      _id: reg3Id,
      userId: user3._id,
      eventId: event1._id,
      fullName: user3.fullName,
      phone: user3.phone,
      email: user3.email,
      bloodType: user3.bloodType,
      confirmedBloodType: null,
      dateOfBirth: user3.dateOfBirth,
      gender: user3.gender,
      identityCardNumber: user3.identityCardNumber,
      weight: 64,
      height: 170,
      healthInfo: {
        hasFever: false,
        hasChronicDisease: false,
        takingMedication: false,
        recentSurgery: false,
      },
      screeningResult: {
        doctorConclusion: 'eligible',
        notes: 'Đủ điều kiện sơ bộ tham gia hiến máu.',
        reasons: [],
      },
      donationStatus: 'registered',
      donationVolume: null,
      qrCode: qr3,
      preferredTimeSlot: '13:30 - 15:00',
      checkIn: {
        status: 'pending',
      },
      registeredAt: new Date(now.getTime() - 1000 * 60 * 60 * 12),
    });

    // Reg 4: User 4 -> Deferred (Pending review)
    const reg4Id = new mongoose.Types.ObjectId();
    const qr4 = await generateRegistrationQR(
      reg4Id.toString(),
      user4._id.toString(),
      event1._id.toString()
    );
    await Registration.create({
      _id: reg4Id,
      userId: user4._id,
      eventId: event1._id,
      fullName: user4.fullName,
      phone: user4.phone,
      email: user4.email,
      bloodType: user4.bloodType,
      confirmedBloodType: null,
      dateOfBirth: user4.dateOfBirth,
      gender: user4.gender,
      identityCardNumber: user4.identityCardNumber,
      weight: 48,
      height: 158,
      healthInfo: {
        hasFever: false,
        hasChronicDisease: false,
        takingMedication: true,
        recentSurgery: false,
        notes: 'Đang dùng vitamin tổng hợp và sắt định kỳ',
      },
      screeningResult: {
        doctorConclusion: 'deferred',
        notes:
          'Cần bác sĩ thăm khám và tư vấn trực tiếp tại sự kiện vì: Đang trong quá trình sử dụng thuốc điều trị / thực phẩm bổ sung.',
        reasons: ['Đang dùng thuốc'],
      },
      donationStatus: 'registered',
      donationVolume: null,
      qrCode: qr4,
      preferredTimeSlot: '15:00 - 16:30',
      checkIn: {
        status: 'pending',
      },
      registeredAt: new Date(now.getTime() - 1000 * 60 * 60 * 6),
    });

    console.log('[Seed] Database seeded and normalized successfully!');
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
  }
};

export default seedDatabase;
