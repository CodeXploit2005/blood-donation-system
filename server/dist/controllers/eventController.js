"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEvent = exports.updateEvent = exports.createEvent = exports.getEventById = exports.getEvents = exports.eventSchema = void 0;
const zod_1 = require("zod");
const BloodDonationEvent_1 = require("../models/BloodDonationEvent");
const Registration_1 = require("../models/Registration");
const response_1 = require("../utils/response");
const eventStatusService_1 = require("../services/eventStatusService");
exports.eventSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(3, 'Tiêu đề đợt hiến máu phải từ 3 ký tự trở lên'),
        description: zod_1.z.string().min(10, 'Mô tả chi tiết phải từ 10 ký tự trở lên'),
        location: zod_1.z.string().min(3, 'Địa điểm tổ chức phải từ 3 ký tự trở lên'),
        addressDetails: zod_1.z.string().min(5, 'Địa chỉ cụ thể phải từ 5 ký tự trở lên'),
        startDate: zod_1.z.string().min(1, 'Vui lòng chọn thời gian bắt đầu'),
        endDate: zod_1.z.string().min(1, 'Vui lòng chọn thời gian kết thúc'),
        maxParticipants: zod_1.z.number().min(1, 'Số lượng người tối đa phải lớn hơn 0'),
        status: zod_1.z.enum(['upcoming', 'open', 'closed', 'completed']).optional(),
        imageUrl: zod_1.z.string().optional(),
        organizer: zod_1.z.string().min(2, 'Tên đơn vị tổ chức là bắt buộc'),
        contactPhone: zod_1.z.string().optional(),
        targetBloodUnits: zod_1.z.number().optional(),
    }),
});
const getEvents = async (req, res) => {
    try {
        await (0, eventStatusService_1.syncAutomaticEventStatuses)();
        const { status, q, page = 1, limit = 10, sort = 'startDate' } = req.query;
        const query = {};
        if (status && status !== 'all') {
            query.status = status;
        }
        if (q) {
            const searchRegex = new RegExp(String(q), 'i');
            query.$or = [
                { title: searchRegex },
                { location: searchRegex },
                { addressDetails: searchRegex },
                { organizer: searchRegex },
            ];
        }
        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.max(1, Number(limit));
        const skip = (pageNum - 1) * limitNum;
        let sortOption = { startDate: 1 };
        if (sort === 'newest')
            sortOption = { createdAt: -1 };
        if (sort === 'oldest')
            sortOption = { createdAt: 1 };
        if (sort === 'participants')
            sortOption = { currentParticipants: -1 };
        const [events, total] = await Promise.all([
            BloodDonationEvent_1.BloodDonationEvent.find(query)
                .sort(sortOption)
                .skip(skip)
                .limit(limitNum)
                .populate('createdBy', 'fullName email')
                .lean(),
            BloodDonationEvent_1.BloodDonationEvent.countDocuments(query),
        ]);
        // Attach actual registered counts
        const eventIds = events.map((e) => e._id);
        const registrationCounts = await Registration_1.Registration.aggregate([
            { $match: { eventId: { $in: eventIds }, registrationStatus: { $ne: 'cancelled' } } },
            { $group: { _id: '$eventId', count: { $sum: 1 } } },
        ]);
        const countMap = new Map();
        registrationCounts.forEach((r) => countMap.set(r._id.toString(), r.count));
        const eventsWithCount = events.map((evt) => ({
            ...evt,
            currentParticipants: countMap.get(evt._id.toString()) || 0,
        }));
        (0, response_1.successResponse)(res, eventsWithCount, 'Lấy danh sách đợt hiến máu thành công', 200, {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
        });
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message || 'Lỗi khi lấy danh sách sự kiện', 500, error);
    }
};
exports.getEvents = getEvents;
const getEventById = async (req, res) => {
    try {
        await (0, eventStatusService_1.syncAutomaticEventStatuses)();
        const { id } = req.params;
        const event = await BloodDonationEvent_1.BloodDonationEvent.findById(id).populate('createdBy', 'fullName email phone');
        if (!event) {
            (0, response_1.errorResponse)(res, 'Không tìm thấy đợt hiến máu', 404);
            return;
        }
        const [registrationCount, checkedInCount] = await Promise.all([
            Registration_1.Registration.countDocuments({ eventId: event._id, registrationStatus: { $ne: 'cancelled' } }),
            Registration_1.Registration.countDocuments({ eventId: event._id, 'checkIn.status': true }),
        ]);
        const eventData = {
            ...event.toObject(),
            currentParticipants: registrationCount,
            checkedInCount,
        };
        (0, response_1.successResponse)(res, eventData, 'Lấy chi tiết đợt hiến máu thành công');
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message || 'Lỗi khi lấy chi tiết sự kiện', 500, error);
    }
};
exports.getEventById = getEventById;
const createEvent = async (req, res) => {
    try {
        if (!req.user) {
            (0, response_1.errorResponse)(res, 'Vui lòng đăng nhập', 401);
            return;
        }
        const { title, description, location, addressDetails, startDate, endDate, maxParticipants, status = 'upcoming', imageUrl, organizer, contactPhone, targetBloodUnits, } = req.body;
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end <= start) {
            (0, response_1.errorResponse)(res, 'Thời gian kết thúc phải diễn ra sau thời gian bắt đầu', 422);
            return;
        }
        const newEvent = await BloodDonationEvent_1.BloodDonationEvent.create({
            title,
            description,
            location,
            addressDetails,
            startDate: start,
            endDate: end,
            maxParticipants,
            status: (0, eventStatusService_1.resolveEventStatus)(start, end, status),
            imageUrl: imageUrl || 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&q=80&w=1000',
            organizer: organizer || 'Hội Chữ Thập Đỏ & Viện Huyết học',
            contactPhone: contactPhone || req.user.phone,
            targetBloodUnits: targetBloodUnits || maxParticipants,
            createdBy: req.user._id,
        });
        (0, response_1.successResponse)(res, newEvent, 'Tạo đợt hiến máu mới thành công', 201);
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message || 'Lỗi khi tạo sự kiện', 500, error);
    }
};
exports.createEvent = createEvent;
const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const existingEvent = await BloodDonationEvent_1.BloodDonationEvent.findById(id);
        if (!existingEvent) {
            (0, response_1.errorResponse)(res, 'Không tìm thấy đợt hiến máu cần cập nhật', 404);
            return;
        }
        const { title, description, location, addressDetails, startDate, endDate, maxParticipants, status, imageUrl, organizer, contactPhone, targetBloodUnits, } = req.body;
        if (startDate && endDate) {
            if (new Date(endDate) <= new Date(startDate)) {
                (0, response_1.errorResponse)(res, 'Thời gian kết thúc phải diễn ra sau thời gian bắt đầu', 422);
                return;
            }
        }
        const nextStartDate = startDate ? new Date(startDate) : existingEvent.startDate;
        const nextEndDate = endDate ? new Date(endDate) : existingEvent.endDate;
        const nextStatus = status
            ? (0, eventStatusService_1.resolveEventStatus)(nextStartDate, nextEndDate, status)
            : existingEvent.status;
        const updatedEvent = await BloodDonationEvent_1.BloodDonationEvent.findByIdAndUpdate(id, {
            ...(title && { title }),
            ...(description && { description }),
            ...(location && { location }),
            ...(addressDetails && { addressDetails }),
            ...(startDate && { startDate: new Date(startDate) }),
            ...(endDate && { endDate: new Date(endDate) }),
            ...(maxParticipants !== undefined && { maxParticipants }),
            status: nextStatus,
            ...(imageUrl !== undefined && { imageUrl }),
            ...(organizer && { organizer }),
            ...(contactPhone !== undefined && { contactPhone }),
            ...(targetBloodUnits !== undefined && { targetBloodUnits }),
        }, { new: true, runValidators: true });
        (0, response_1.successResponse)(res, updatedEvent, 'Cập nhật đợt hiến máu thành công');
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message || 'Lỗi khi cập nhật sự kiện', 500, error);
    }
};
exports.updateEvent = updateEvent;
const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const checkedInCount = await Registration_1.Registration.countDocuments({
            eventId: id,
            'checkIn.status': true,
        });
        if (checkedInCount > 0) {
            (0, response_1.errorResponse)(res, `Không thể xóa đợt hiến máu đã có ${checkedInCount} người điểm danh thực tế. Bạn có thể chuyển trạng thái sang "completed" (Hoàn thành).`, 400);
            return;
        }
        const deleted = await BloodDonationEvent_1.BloodDonationEvent.findByIdAndDelete(id);
        if (!deleted) {
            (0, response_1.errorResponse)(res, 'Không tìm thấy đợt hiến máu để xóa', 404);
            return;
        }
        // Delete associated registrations
        await Registration_1.Registration.deleteMany({ eventId: id });
        (0, response_1.successResponse)(res, null, 'Đã xóa đợt hiến máu và các lượt đăng ký liên quan');
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message || 'Lỗi khi xóa đợt hiến máu', 500, error);
    }
};
exports.deleteEvent = deleteEvent;
