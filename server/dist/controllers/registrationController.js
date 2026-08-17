"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelRegistration = exports.updateRegistrationStatus = exports.getEventRegistrations = exports.getRegistrationById = exports.getMyRegistrations = exports.createRegistration = exports.createRegistrationSchema = void 0;
const zod_1 = require("zod");
const mongoose_1 = __importDefault(require("mongoose"));
const Registration_1 = require("../models/Registration");
const BloodDonationEvent_1 = require("../models/BloodDonationEvent");
const User_1 = require("../models/User");
const screeningService_1 = require("../services/screeningService");
const qrService_1 = require("../services/qrService");
const response_1 = require("../utils/response");
const eventStatusService_1 = require("../services/eventStatusService");
exports.createRegistrationSchema = zod_1.z.object({
    body: zod_1.z.object({
        eventId: zod_1.z.string({ required_error: 'Vui lòng chọn đợt hiến máu' }).min(1, 'Mã đợt hiến máu là bắt buộc'),
        fullName: zod_1.z.string({ required_error: 'Vui lòng nhập họ và tên' }).min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
        phone: zod_1.z.string({ required_error: 'Vui lòng nhập số điện thoại' }).min(9, 'Số điện thoại không hợp lệ'),
        email: zod_1.z.string({ required_error: 'Vui lòng nhập email' }).email('Email không đúng định dạng'),
        dateOfBirth: zod_1.z.string().optional(),
        gender: zod_1.z.enum(['male', 'female', 'other'], { errorMap: () => ({ message: 'Vui lòng chọn giới tính' }) }).optional(),
        identityCardNumber: zod_1.z.string().optional(),
        bloodType: zod_1.z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown']).default('unknown'),
        weight: zod_1.z.coerce.number({ required_error: 'Vui lòng nhập cân nặng' }).min(35, 'Cân nặng phải từ 35kg trở lên'),
        height: zod_1.z.coerce.number().optional(),
        preferredTimeSlot: zod_1.z.string().default('08:00 - 10:00'),
        healthInfo: zod_1.z
            .object({
            hasFever: zod_1.z.boolean().default(false),
            hasChronicDisease: zod_1.z.boolean().default(false),
            takingMedication: zod_1.z.boolean().default(false),
            recentSurgery: zod_1.z.boolean().default(false),
            lastDonationDate: zod_1.z.string().optional(),
            hasTattooOrPiercingIn6Months: zod_1.z.boolean().default(false),
            isPregnantOrNursing: zod_1.z.boolean().default(false),
            notes: zod_1.z.string().optional(),
        })
            .default({}),
    }),
});
const createRegistration = async (req, res) => {
    try {
        if (!req.user) {
            (0, response_1.errorResponse)(res, 'Vui lòng đăng nhập để đăng ký hiến máu', 401);
            return;
        }
        const { eventId, fullName, phone, email, dateOfBirth, gender, identityCardNumber, bloodType, weight, height, preferredTimeSlot, healthInfo = {}, } = req.body;
        const event = await BloodDonationEvent_1.BloodDonationEvent.findById(eventId);
        if (!event) {
            (0, response_1.errorResponse)(res, 'Không tìm thấy đợt hiến máu', 404);
            return;
        }
        const effectiveStatus = (0, eventStatusService_1.resolveEventStatus)(event.startDate, event.endDate, event.status);
        if (effectiveStatus !== event.status) {
            event.status = effectiveStatus;
            await event.save();
        }
        if (event.status !== 'open') {
            (0, response_1.errorResponse)(res, event.status === 'upcoming'
                ? 'Đợt hiến máu này chưa mở cổng đăng ký'
                : 'Đợt hiến máu này đã đóng cổng tiếp nhận hoặc đã hoàn thành', 400);
            return;
        }
        // Check if user has already registered for this event
        const existing = await Registration_1.Registration.findOne({
            userId: req.user._id,
            eventId: event._id,
            donationStatus: { $ne: 'cancelled' },
        });
        if (existing) {
            (0, response_1.errorResponse)(res, 'Bạn đã đăng ký tham gia đợt hiến máu này rồi', 400);
            return;
        }
        // Check capacity
        const currentCount = await Registration_1.Registration.countDocuments({
            eventId: event._id,
            donationStatus: { $ne: 'cancelled' },
        });
        if (currentCount >= event.maxParticipants) {
            (0, response_1.errorResponse)(res, 'Đợt hiến máu đã đạt đủ số lượng người đăng ký tối đa', 400);
            return;
        }
        // Automatic medical screening evaluation
        const parsedHealthInfo = {
            ...healthInfo,
            lastDonationDate: healthInfo.lastDonationDate ? new Date(healthInfo.lastDonationDate) : undefined,
        };
        const screening = (0, screeningService_1.evaluateHealthScreening)(weight, parsedHealthInfo, gender);
        // Create a temporary Registration document ID to sign QR
        const tempRegId = new mongoose_1.default.Types.ObjectId();
        const qrResult = await (0, qrService_1.generateRegistrationQR)(tempRegId.toString(), req.user._id.toString(), event._id.toString());
        const initialDonationStatus = screening.result === 'ineligible' ? 'screened_ineligible' : 'registered';
        const newRegistration = await Registration_1.Registration.create({
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
        await User_1.User.findByIdAndUpdate(req.user._id, {
            ...(bloodType && bloodType !== 'unknown' && { bloodType }),
            ...(phone && { phone }),
            ...(identityCardNumber && { identityCardNumber }),
        });
        // Update event participant count
        await BloodDonationEvent_1.BloodDonationEvent.findByIdAndUpdate(event._id, {
            $inc: { currentParticipants: 1 },
        });
        const populatedReg = await Registration_1.Registration.findById(newRegistration._id)
            .populate('eventId', 'title location addressDetails startDate endDate organizer contactPhone')
            .populate('userId', 'fullName email phone');
        (0, response_1.successResponse)(res, {
            registration: populatedReg,
            screeningEvaluation: screening,
        }, screening.result === 'eligible'
            ? 'Đăng ký tham gia hiến máu thành công!'
            : screening.result === 'deferred'
                ? 'Đăng ký thành công. Bạn cần bác sĩ tư vấn thêm tại sự kiện.'
                : 'Đơn đăng ký không đáp ứng tiêu chuẩn y tế tạm thời.', 201);
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message || 'Lỗi khi đăng ký hiến máu', 500, error);
    }
};
exports.createRegistration = createRegistration;
const getMyRegistrations = async (req, res) => {
    try {
        if (!req.user) {
            (0, response_1.errorResponse)(res, 'Vui lòng đăng nhập', 401);
            return;
        }
        const registrations = await Registration_1.Registration.find({ userId: req.user._id })
            .populate('eventId', 'title location addressDetails startDate endDate status organizer contactPhone')
            .sort({ registeredAt: -1 })
            .lean();
        (0, response_1.successResponse)(res, registrations, 'Lấy danh sách đơn đăng ký thành công');
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message || 'Lỗi khi lấy danh sách đăng ký', 500, error);
    }
};
exports.getMyRegistrations = getMyRegistrations;
const getRegistrationById = async (req, res) => {
    try {
        const { id } = req.params;
        const registration = await Registration_1.Registration.findById(id)
            .populate('eventId')
            .populate('userId', 'fullName email phone identityCardNumber')
            .populate('checkIn.checkedInBy', 'fullName email');
        if (!registration) {
            (0, response_1.errorResponse)(res, 'Không tìm thấy thông tin đăng ký', 404);
            return;
        }
        if (req.user &&
            req.user.role !== 'admin' &&
            registration.userId._id.toString() !== req.user._id.toString()) {
            (0, response_1.errorResponse)(res, 'Bạn không có quyền truy cập đơn đăng ký này', 403);
            return;
        }
        (0, response_1.successResponse)(res, registration, 'Lấy thông tin đăng ký thành công');
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message || 'Lỗi khi lấy thông tin đăng ký', 500, error);
    }
};
exports.getRegistrationById = getRegistrationById;
const getEventRegistrations = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { status, donationStatus, screening, checkin, q, page = 1, limit = 20 } = req.query;
        const query = { eventId };
        if (donationStatus && donationStatus !== 'all') {
            query.donationStatus = donationStatus;
        }
        else if (status && status !== 'all') {
            query.donationStatus = status;
        }
        if (screening && screening !== 'all') {
            query['screeningResult.doctorConclusion'] = screening;
        }
        if (checkin === 'true' || checkin === 'checked_in') {
            query['checkIn.status'] = 'checked_in';
        }
        else if (checkin === 'false' || checkin === 'pending') {
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
            Registration_1.Registration.find(query)
                .sort({ registeredAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .populate('userId', 'fullName email phone')
                .populate('checkIn.checkedInBy', 'fullName')
                .lean(),
            Registration_1.Registration.countDocuments(query),
            BloodDonationEvent_1.BloodDonationEvent.findById(eventId).select('title location startDate endDate maxParticipants'),
        ]);
        (0, response_1.successResponse)(res, { registrations, event }, 'Lấy danh sách người đăng ký thành công', 200, {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
        });
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message || 'Lỗi khi lấy danh sách đăng ký sự kiện', 500, error);
    }
};
exports.getEventRegistrations = getEventRegistrations;
const updateRegistrationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { donationStatus, confirmedBloodType, donationVolume, screeningResult } = req.body;
        const updated = await Registration_1.Registration.findByIdAndUpdate(id, {
            ...(donationStatus && { donationStatus }),
            ...(confirmedBloodType !== undefined && { confirmedBloodType }),
            ...(donationVolume !== undefined && { donationVolume }),
            ...(screeningResult && { screeningResult }),
        }, { new: true }).populate('eventId', 'title');
        if (!updated) {
            (0, response_1.errorResponse)(res, 'Không tìm thấy đơn đăng ký', 404);
            return;
        }
        (0, response_1.successResponse)(res, updated, 'Cập nhật trạng thái đăng ký thành công');
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message || 'Lỗi khi cập nhật đăng ký', 500, error);
    }
};
exports.updateRegistrationStatus = updateRegistrationStatus;
const cancelRegistration = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user) {
            (0, response_1.errorResponse)(res, 'Vui lòng đăng nhập', 401);
            return;
        }
        const registration = await Registration_1.Registration.findById(id);
        if (!registration) {
            (0, response_1.errorResponse)(res, 'Không tìm thấy thông tin đăng ký', 404);
            return;
        }
        if (req.user.role !== 'admin' &&
            registration.userId.toString() !== req.user._id.toString()) {
            (0, response_1.errorResponse)(res, 'Bạn không có quyền hủy đơn đăng ký này', 403);
            return;
        }
        if (registration.donationStatus === 'donated' || registration.checkIn?.status === 'checked_in') {
            (0, response_1.errorResponse)(res, 'Không thể hủy đơn đăng ký đã được điểm danh hoặc tiếp nhận tại sự kiện', 400);
            return;
        }
        registration.donationStatus = 'cancelled';
        await registration.save();
        // Decrement participant count
        await BloodDonationEvent_1.BloodDonationEvent.findByIdAndUpdate(registration.eventId, {
            $inc: { currentParticipants: -1 },
        });
        (0, response_1.successResponse)(res, null, 'Hủy đăng ký hiến máu thành công');
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message || 'Lỗi khi hủy đăng ký', 500, error);
    }
};
exports.cancelRegistration = cancelRegistration;
