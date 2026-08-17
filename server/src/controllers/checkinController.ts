import { Response } from 'express';
import { z } from 'zod';
import { Registration } from '../models/Registration';
import { BloodDonationEvent } from '../models/BloodDonationEvent';
import { AuthRequest } from '../middleware/authMiddleware';
import { successResponse, errorResponse } from '../utils/response';

export const checkInSchema = z.object({
  body: z.object({
    qrData: z.string({ required_error: 'Dữ liệu mã QR là bắt buộc' }).min(1, 'Dữ liệu mã QR là bắt buộc'),
    eventId: z.string().optional(),
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
      actualVolumeMl = 350,
      confirmedBloodType,
      nurseNotes,
      bloodPressure,
      hemoglobinLevel,
    } = req.body;

    let searchCode = qrData.trim();
    let searchRegId: string | null = null;

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
        .populate('userId', 'fullName email phone identityCardNumber');
    }

    if (!registration) {
      registration = await Registration.findOne({
        $or: [
          { 'qrCode.code': searchCode.toUpperCase() },
          { _id: searchCode.match(/^[0-9a-fA-F]{24}$/) ? searchCode : null },
        ],
      })
        .populate('eventId')
        .populate('userId', 'fullName email phone identityCardNumber');
    }

    if (!registration) {
      errorResponse(res, 'Không tìm thấy thông tin đăng ký tương ứng với mã QR này', 404);
      return;
    }

    // Check if event matches
    if (eventId && registration.eventId._id.toString() !== eventId) {
      errorResponse(
        res,
        `Mã QR này thuộc về sự kiện khác (${(registration.eventId as any).title})`,
        400
      );
      return;
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

    // Determine confirmed blood type
    const resolvedBloodType =
      confirmedBloodType && confirmedBloodType !== 'unknown'
        ? confirmedBloodType
        : registration.bloodType !== 'unknown'
        ? registration.bloodType
        : 'O+';

    // Perform check-in and mark as donated
    registration.checkIn = {
      status: 'checked_in',
      checkInTime: new Date(),
      checkedInBy: req.user._id,
      nurseNotes: nurseNotes || 'Sức khỏe ổn định, hoàn thành tốt.',
      bloodPressure: bloodPressure || '120/80',
      hemoglobinLevel: hemoglobinLevel || 13.5,
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

    registration.checkIn = {
      status: 'pending',
      checkInTime: undefined,
      checkedInBy: undefined,
      nurseNotes: '',
    };
    registration.donationStatus = 'registered';
    registration.donationVolume = null;
    await registration.save();

    await BloodDonationEvent.findByIdAndUpdate(registration.eventId, {
      $inc: { collectedBloodUnits: -1 },
    });

    successResponse(res, registration, 'Đã hoàn tác điểm danh thành công');
  } catch (error: any) {
    errorResponse(res, error.message || 'Lỗi khi hoàn tác điểm danh', 500, error);
  }
};
