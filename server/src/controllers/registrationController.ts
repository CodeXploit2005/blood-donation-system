import { Response } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { Registration } from '../models/Registration';
import { BloodDonationEvent } from '../models/BloodDonationEvent';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';
import { evaluateHealthScreening } from '../services/screeningService';
import { generateRegistrationQR } from '../services/qrService';
import { successResponse, errorResponse } from '../utils/response';
import { resolveEventStatus } from '../services/eventStatusService';

export const createRegistrationSchema = z.object({
  body: z.object({
    eventId: z.string({ required_error: 'Vui lòng chọn đợt hiến máu' }).min(1, 'Mã đợt hiến máu là bắt buộc'),
    fullName: z.string({ required_error: 'Vui lòng nhập họ và tên' }).min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
    phone: z.string({ required_error: 'Vui lòng nhập số điện thoại' }).min(9, 'Số điện thoại không hợp lệ'),
    email: z.string({ required_error: 'Vui lòng nhập email' }).email('Email không đúng định dạng'),
    dateOfBirth: z.string().optional(),
    gender: z.enum(['male', 'female', 'other'], { errorMap: () => ({ message: 'Vui lòng chọn giới tính' }) }).optional(),
    identityCardNumber: z.string().optional(),
    bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown']).default('unknown'),
    weight: z.coerce.number({ required_error: 'Vui lòng nhập cân nặng' }).min(35, 'Cân nặng phải từ 35kg trở lên'),
    height: z.coerce.number().optional(),
    preferredTimeSlot: z.string().default('08:00 - 10:00'),
    healthInfo: z
      .object({
        hasFever: z.boolean().default(false),
        hasChronicDisease: z.boolean().default(false),
        takingMedication: z.boolean().default(false),
        recentSurgery: z.boolean().default(false),
        lastDonationDate: z.string().optional(),
        hasTattooOrPiercingIn6Months: z.boolean().default(false),
        isPregnantOrNursing: z.boolean().default(false),
        notes: z.string().optional(),
      })
      .default({}),
  }),
});

export const createRegistration = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Vui lòng đăng nhập để đăng ký hiến máu', 401);
      return;
    }

    const {
      eventId,
      fullName,
      phone,
      email,
      dateOfBirth,
      gender,
      identityCardNumber,
      bloodType,
      weight,
      height,
      preferredTimeSlot,
      healthInfo = {},
    } = req.body;

    const event = await BloodDonationEvent.findById(eventId);
    if (!event) {
      errorResponse(res, 'Không tìm thấy đợt hiến máu', 404);
      return;
    }

    if (event.statusMode !== 'manual') {
      const effectiveStatus = resolveEventStatus(
        event.startDate,
        event.endDate,
        event.status
      );
      if (effectiveStatus !== event.status) {
        event.status = effectiveStatus;
        await event.save();
      }
    }

    if (event.status !== 'open') {
      errorResponse(
        res,
        event.status === 'upcoming'
          ? 'Đợt hiến máu này chưa mở cổng đăng ký'
          : 'Đợt hiến máu này đã đóng cổng tiếp nhận hoặc đã hoàn thành',
        400
      );
      return;
    }

    // Check if user has already registered for this event
    const existing = await Registration.findOne({
      userId: req.user._id,
      eventId: event._id,
      donationStatus: { $ne: 'cancelled' },
    });

    if (existing) {
      errorResponse(res, 'Bạn đã đăng ký tham gia đợt hiến máu này rồi', 400);
      return;
    }

    // Check capacity
    const currentCount = await Registration.countDocuments({
      eventId: event._id,
      donationStatus: { $ne: 'cancelled' },
    });

    if (currentCount >= event.maxParticipants) {
      errorResponse(res, 'Đợt hiến máu đã đạt đủ số lượng người đăng ký tối đa', 400);
      return;
    }

    // Automatic medical screening evaluation
    const parsedHealthInfo = {
      ...healthInfo,
      lastDonationDate: healthInfo.lastDonationDate ? new Date(healthInfo.lastDonationDate) : undefined,
    };
    const screening = evaluateHealthScreening(weight, parsedHealthInfo, gender);

    // Create a temporary Registration document ID to sign QR
    const tempRegId = new mongoose.Types.ObjectId();
    const qrResult = await generateRegistrationQR(
      tempRegId.toString(),
      req.user._id.toString(),
      event._id.toString()
    );

    const initialDonationStatus =
      screening.result === 'ineligible' ? 'screened_ineligible' : 'registered';

    const newRegistration = await Registration.create({
      _id: tempRegId,
      userId: req.user._id,
      eventId: event._id,
      fullName,
      phone,
      email: email.toLowerCase(),
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      gender,
      identityCardNumber,
      bloodType: bloodType || req.user.bloodType || 'unknown',
      confirmedBloodType: null,
      weight,
      height,
      preferredTimeSlot: preferredTimeSlot || '08:00 - 10:00',
      healthInfo: parsedHealthInfo,
      screeningResult: {
        doctorConclusion: screening.doctorConclusion,
        notes: screening.notes,
        reasons: screening.reasons,
      },
      donationVolume: null,
      donationStatus: initialDonationStatus,
      qrCode: qrResult,
      checkIn: {
        status: 'pending',
      },
    });

    // Update user profile if empty
    await User.findByIdAndUpdate(req.user._id, {
      ...(bloodType && bloodType !== 'unknown' && { bloodType }),
      ...(phone && { phone }),
      ...(identityCardNumber && { identityCardNumber }),
    });

    // Update event participant count
    await BloodDonationEvent.findByIdAndUpdate(event._id, {
      $inc: { currentParticipants: 1 },
    });

    const populatedReg = await Registration.findById(newRegistration._id)
      .populate('eventId', 'title location addressDetails startDate endDate organizer contactPhone')
      .populate('userId', 'fullName email phone');

    successResponse(
      res,
      {
        registration: populatedReg,
        screeningEvaluation: screening,
      },
      screening.result === 'eligible'
        ? 'Đăng ký tham gia hiến máu thành công!'
        : screening.result === 'deferred'
        ? 'Đăng ký thành công. Bạn cần bác sĩ tư vấn thêm tại sự kiện.'
        : 'Đơn đăng ký không đáp ứng tiêu chuẩn y tế tạm thời.',
      201
    );
  } catch (error: any) {
    errorResponse(res, error.message || 'Lỗi khi đăng ký hiến máu', 500, error);
  }
};

export const getMyRegistrations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Vui lòng đăng nhập', 401);
      return;
    }

    const registrations = await Registration.find({ userId: req.user._id })
      .populate('eventId', 'title location addressDetails startDate endDate status organizer contactPhone')
      .sort({ registeredAt: -1 })
      .lean();

    successResponse(res, registrations, 'Lấy danh sách đơn đăng ký thành công');
  } catch (error: any) {
    errorResponse(res, error.message || 'Lỗi khi lấy danh sách đăng ký', 500, error);
  }
};

export const getRegistrationById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const registration = await Registration.findById(id)
      .populate('eventId')
      .populate('userId', 'fullName email phone identityCardNumber')
      .populate('checkIn.checkedInBy', 'fullName email');

    if (!registration) {
      errorResponse(res, 'Không tìm thấy thông tin đăng ký', 404);
      return;
    }

    if (
      req.user &&
      req.user.role !== 'admin' &&
      registration.userId._id.toString() !== req.user._id.toString()
    ) {
      errorResponse(res, 'Bạn không có quyền truy cập đơn đăng ký này', 403);
      return;
    }

    successResponse(res, registration, 'Lấy thông tin đăng ký thành công');
  } catch (error: any) {
    errorResponse(res, error.message || 'Lỗi khi lấy thông tin đăng ký', 500, error);
  }
};

export const getEventRegistrations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const { status, donationStatus, screening, checkin, q, page = 1, limit = 20 } = req.query;

    const query: any = { eventId };

    if (donationStatus && donationStatus !== 'all') {
      query.donationStatus = donationStatus;
    } else if (status && status !== 'all') {
      query.donationStatus = status;
    }

    if (screening && screening !== 'all') {
      query['screeningResult.doctorConclusion'] = screening;
    }

    if (checkin === 'true' || checkin === 'checked_in') {
      query['checkIn.status'] = 'checked_in';
    } else if (checkin === 'false' || checkin === 'pending') {
      query['checkIn.status'] = 'pending';
    }

    if (q) {
      const searchRegex = new RegExp(String(q), 'i');
      query.$or = [
        { fullName: searchRegex },
        { phone: searchRegex },
        { email: searchRegex },
        { 'qrCode.code': searchRegex },
      ];
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    const [registrations, total, event] = await Promise.all([
      Registration.find(query)
        .sort({ registeredAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('userId', 'fullName email phone')
        .populate('checkIn.checkedInBy', 'fullName')
        .lean(),
      Registration.countDocuments(query),
      BloodDonationEvent.findById(eventId).select('title location startDate endDate maxParticipants'),
    ]);

    successResponse(
      res,
      { registrations, event },
      'Lấy danh sách người đăng ký thành công',
      200,
      {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      }
    );
  } catch (error: any) {
    errorResponse(res, error.message || 'Lỗi khi lấy danh sách đăng ký sự kiện', 500, error);
  }
};

export const updateRegistrationStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { donationStatus, confirmedBloodType, donationVolume, screeningResult } = req.body;

    const updated = await Registration.findByIdAndUpdate(
      id,
      {
        ...(donationStatus && { donationStatus }),
        ...(confirmedBloodType !== undefined && { confirmedBloodType }),
        ...(donationVolume !== undefined && { donationVolume }),
        ...(screeningResult && { screeningResult }),
      },
      { new: true }
    ).populate('eventId', 'title');

    if (!updated) {
      errorResponse(res, 'Không tìm thấy đơn đăng ký', 404);
      return;
    }

    successResponse(res, updated, 'Cập nhật trạng thái đăng ký thành công');
  } catch (error: any) {
    errorResponse(res, error.message || 'Lỗi khi cập nhật đăng ký', 500, error);
  }
};

export const cancelRegistration = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      errorResponse(res, 'Vui lòng đăng nhập', 401);
      return;
    }

    const registration = await Registration.findById(id);
    if (!registration) {
      errorResponse(res, 'Không tìm thấy thông tin đăng ký', 404);
      return;
    }

    if (
      req.user.role !== 'admin' &&
      registration.userId.toString() !== req.user._id.toString()
    ) {
      errorResponse(res, 'Bạn không có quyền hủy đơn đăng ký này', 403);
      return;
    }

    if (registration.donationStatus === 'donated' || registration.checkIn?.status === 'checked_in') {
      errorResponse(res, 'Không thể hủy đơn đăng ký đã được điểm danh hoặc tiếp nhận tại sự kiện', 400);
      return;
    }

    registration.donationStatus = 'cancelled';
    await registration.save();

    // Decrement participant count
    await BloodDonationEvent.findByIdAndUpdate(registration.eventId, {
      $inc: { currentParticipants: -1 },
    });

    successResponse(res, null, 'Hủy đăng ký hiến máu thành công');
  } catch (error: any) {
    errorResponse(res, error.message || 'Lỗi khi hủy đăng ký', 500, error);
  }
};
