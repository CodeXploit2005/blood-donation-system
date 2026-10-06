import { Response } from 'express';
import { z } from 'zod';
import { verifyQRToken } from '../services/qrService';
import { Registration } from '../models/Registration';
import { BloodDonationEvent } from '../models/BloodDonationEvent';
import { AuthRequest } from '../middleware/authMiddleware';
import { successResponse, errorResponse } from '../utils/response';

export const checkInSchema = z.object({
  body: z.object({
    qrData: z.string({ required_error: 'Dữ liệu mã QR là bắt buộc' }).min(1, 'Dữ liệu mã QR là bắt buộc'),
    eventId: z.string().optional(),
    preview: z.boolean().optional(),
    action: z.enum(['presence']).optional(),
    actualVolumeMl: z.number().min(200, 'Thể tích tối thiểu 200ml').max(500, 'Thể tích tối đa 500ml').default(350),
    confirmedBloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown']).optional(),
    nurseNotes: z.string().optional(),
    bloodPressure: z.string().optional(),
    hemoglobinLevel: z.number().optional(),
  }),
});

export const verifyAndCheckIn = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Vui lòng đăng nhập', 401);
      return;
    }

    const {
      qrData,
      eventId,
      actualVolumeMl,
      confirmedBloodType,
      nurseNotes,
      bloodPressure,
      hemoglobinLevel,
    } = req.body;

    let searchCode = qrData.trim();
    let searchRegId: string | null = null;

    const compactPayload = /^(BD-\d{4}-[A-F0-9]{6}):([a-f0-9]{16})$/i.exec(searchCode);
    if (compactPayload) searchCode = compactPayload[1];

    // Attempt parsing JSON payload
    try {
      if (qrData.startsWith('{') && qrData.endsWith('}')) {
        const parsed = JSON.parse(qrData);
        searchRegId = parsed.regId || null;
        searchCode = parsed.code || searchCode;
      }
    } catch {
      // Direct string QR code
    }

    let registration = null;

    if (searchRegId) {
      registration = await Registration.findById(searchRegId)
        .populate('eventId')
        .populate({ path: 'userId', select: 'fullName email phone identityCardNumber', transform: (doc: any, id: any) => doc || { _id: id } });
    }

    if (!registration) {
      registration = await Registration.findOne({
        $or: [
          { 'qrCode.code': searchCode.toUpperCase() },
          { _id: searchCode.match(/^[0-9a-fA-F]{24}$/) ? searchCode : null },
        ],
      })
        .populate('eventId')
        .populate({ path: 'userId', select: 'fullName email phone identityCardNumber', transform: (doc: any, id: any) => doc || { _id: id } });
    }

    if (!registration) {
      errorResponse(res, 'Không tìm thấy thông tin đăng ký tương ứng với mã QR này', 404);
      return;
    }

    if (compactPayload && !verifyQRToken(String(registration._id), String(registration.userId._id), String(registration.eventId._id), registration.qrCode.code, compactPayload[2])) {
      errorResponse(res, 'Mã QR không hợp lệ hoặc đã bị thay đổi', 400); return;
    }
    if (qrData.trim().startsWith('{')) {
      const payload = JSON.parse(qrData.trim());
      if (payload.code !== registration.qrCode.code || !verifyQRToken(String(registration._id), String(registration.userId._id), String(registration.eventId._id), payload.code, payload.tok || '')) {
        errorResponse(res, 'Mã QR không hợp lệ hoặc đã bị thay đổi', 400); return;
      }
    }
    // Verify the signature before disclosing even the destination event.
    if (eventId && String(registration.eventId._id) !== eventId) {
      if (req.body.preview === true) {
        successResponse(res, {
          eventMismatch: true,
          event: { _id: registration.eventId._id, title: (registration.eventId as any).title, startDate: (registration.eventId as any).startDate, location: (registration.eventId as any).location },
        }, 'Mã QR thuộc đợt hiến máu khác');
      } else {
        errorResponse(res, 'Không thể điểm danh: mã QR thuộc đợt hiến máu khác. Chuyển sang đúng đợt trước khi tiếp nhận.', 400);
      }
      return;
    }

    if (req.body.preview !== true && ['cancelled', 'screened_ineligible', 'no_show'].includes(registration.donationStatus)) {
      errorResponse(res, 'Đơn đăng ký đã hủy hoặc không đủ điều kiện tiếp nhận', 400); return;
    }
    if (req.body.preview === true) {
      successResponse(res, {
        _id: registration._id, fullName: registration.fullName, phone: registration.phone,
        event: { title: (registration.eventId as any).title, startDate: (registration.eventId as any).startDate },
        preferredTimeSlot: registration.preferredTimeSlot, donationStatus: registration.donationStatus,
        code: registration.qrCode.code,
        identityCardNumber: registration.identityCardNumber, dateOfBirth: registration.dateOfBirth,
        gender: registration.gender, weight: registration.weight, bloodType: registration.bloodType,
        confirmedBloodType: registration.confirmedBloodType, donationVolume: registration.donationVolume,
        screeningResult: registration.screeningResult, checkedInAt: registration.checkIn?.checkInTime,
        canCheckIn: ['registered', 'screened_eligible'].includes(registration.donationStatus) && registration.checkIn?.status === 'pending',
      }, 'Đã tìm thấy người đăng ký'); return;
    }
    if (req.body.action === 'presence') {
      const updated = await Registration.findOneAndUpdate(
        { _id: registration._id, donationStatus: { $in: ['registered', 'screened_eligible'] }, 'checkIn.status': 'pending' },
        { $set: { donationStatus: 'checked_in', 'checkIn.status': 'checked_in', 'checkIn.checkInTime': new Date(), 'checkIn.checkedInBy': req.user._id } },
        { new: true }
      );
      if (!updated) { errorResponse(res, 'Đơn đã được điểm danh hoặc không thể xác nhận có mặt', 409); return; }
      successResponse(res, updated, 'Đã xác nhận có mặt. Chưa ghi nhận hiến máu.'); return;
    }
    // Check if already donated
    if (registration.donationStatus === 'donated') {
      const checkedTime = registration.checkIn?.checkInTime
        ? new Date(registration.checkIn.checkInTime).toLocaleTimeString('vi-VN')
        : '';
      errorResponse(
        res,
        `Người hiến máu "${registration.fullName}" đã được tiếp nhận hiến ${registration.donationVolume || 350}ml máu lúc ${checkedTime}`,
        400,
        { registration }
      );
      return;
    }

    if (!Number.isFinite(actualVolumeMl) || actualVolumeMl < 200 || actualVolumeMl > 500 || !confirmedBloodType || confirmedBloodType === 'unknown') {
      errorResponse(res, 'Ghi nhận hiến máu cần thể tích thực tế và nhóm máu đã xác nhận; quét QR không tự ghi nhận hiến máu', 422); return;
    }
    // Determine confirmed blood type
    const resolvedBloodType =
      confirmedBloodType && confirmedBloodType !== 'unknown'
        ? confirmedBloodType
        : registration.bloodType !== 'unknown'
        ? registration.bloodType
        : confirmedBloodType;

    // Perform check-in and mark as donated
    registration.checkIn = {
      status: 'checked_in',
      checkInTime: new Date(),
      checkedInBy: req.user._id,
      nurseNotes: nurseNotes || '',
      bloodPressure: bloodPressure || undefined,
      hemoglobinLevel: hemoglobinLevel ?? undefined,
    };

    registration.donationStatus = 'donated';
    registration.donationVolume = actualVolumeMl || 350;
    registration.confirmedBloodType = resolvedBloodType as any;

    if (!registration.screeningResult) {
      registration.screeningResult = {
        doctorConclusion: 'eligible',
        notes: 'Đủ điều kiện tiếp nhận máu tại quầy.',
      };
    } else {
      registration.screeningResult.doctorConclusion = 'eligible';
    }

    await registration.save();

    // Increment collected blood units in event
    await BloodDonationEvent.findByIdAndUpdate(registration.eventId._id, {
      $inc: { collectedBloodUnits: 1 },
    });

    const populatedResult = await Registration.findById(registration._id)
      .populate('eventId')
      .populate('userId', 'fullName email phone')
      .populate('checkIn.checkedInBy', 'fullName');

    successResponse(
      res,
      populatedResult,
      `Điểm danh thành công! Đã ghi nhận ${actualVolumeMl}ml máu (${resolvedBloodType}) từ ${registration.fullName}`
    );
  } catch (error: any) {
    errorResponse(res, error.message || 'Lỗi khi điểm danh qua mã QR', 500, error);
  }
};

export const getEventCheckinList = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;

    const [checkedInList, totalRegistered, totalCheckedIn, totalDonated, event] = await Promise.all([
      Registration.find({ eventId, donationStatus: { $in: ['checked_in', 'donated'] } })
        .sort({ 'checkIn.checkInTime': -1 })
        .populate('userId', 'fullName email phone')
        .populate('checkIn.checkedInBy', 'fullName')
        .lean(),
      Registration.countDocuments({ eventId, donationStatus: { $ne: 'cancelled' } }),
      Registration.countDocuments({
        eventId,
        $or: [{ 'checkIn.status': 'checked_in' }, { donationStatus: { $in: ['checked_in', 'donated'] } }],
      }),
      Registration.countDocuments({ eventId, donationStatus: 'donated' }),
      BloodDonationEvent.findById(eventId).lean(),
    ]);

    successResponse(
      res,
      {
        checkedInList,
        totalRegistered,
        totalCheckedIn,
        totalDonated,
        remaining: Math.max(0, totalRegistered - totalCheckedIn),
        event,
      },
      'Lấy danh sách điểm danh thành công'
    );
  } catch (error: any) {
    errorResponse(res, error.message || 'Lỗi khi lấy danh sách điểm danh', 500, error);
  }
};

export const undoCheckIn = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { registrationId } = req.params;

    const registration = await Registration.findById(registrationId);
    if (!registration) {
      errorResponse(res, 'Không tìm thấy thông tin đăng ký', 404);
      return;
    }

    if (registration.donationStatus !== 'donated' && registration.checkIn?.status !== 'checked_in') {
      errorResponse(res, 'Người này chưa được điểm danh', 400);
      return;
    }

    const wasDonated = registration.donationStatus === 'donated';
    if (wasDonated && req.user?.role !== 'staff') {
      errorResponse(res, 'Chỉ nhân viên y tế được điều chỉnh lượt đã hiến máu', 403);
      return;
    }
    registration.checkIn = {
      status: 'pending',
      checkInTime: undefined,
      checkedInBy: undefined,
      nurseNotes: '',
    };
    registration.donationStatus = 'registered';
    registration.donationVolume = null;
    await registration.save();

    if (wasDonated) await BloodDonationEvent.findByIdAndUpdate(registration.eventId, {
      $inc: { collectedBloodUnits: -1 },
    });

    successResponse(res, registration, 'Đã hoàn tác điểm danh thành công');
  } catch (error: any) {
    errorResponse(res, error.message || 'Lỗi khi hoàn tác điểm danh', 500, error);
  }
};
