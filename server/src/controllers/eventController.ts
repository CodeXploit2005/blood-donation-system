import { Request, Response } from 'express';
import { z } from 'zod';
import { BloodDonationEvent } from '../models/BloodDonationEvent';
import { Registration } from '../models/Registration';
import { successResponse, errorResponse } from '../utils/response';
import { AuthRequest } from '../middleware/authMiddleware';
import { resolveEventStatus, syncAutomaticEventStatuses } from '../services/eventStatusService';

export const eventSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Tiêu đề đợt hiến máu phải từ 3 ký tự trở lên'),
    description: z.string().min(10, 'Mô tả chi tiết phải từ 10 ký tự trở lên'),
    location: z.string().min(3, 'Địa điểm tổ chức phải từ 3 ký tự trở lên'),
    addressDetails: z.string().min(5, 'Địa chỉ cụ thể phải từ 5 ký tự trở lên'),
    startDate: z.string().min(1, 'Vui lòng chọn thời gian bắt đầu'),
    endDate: z.string().min(1, 'Vui lòng chọn thời gian kết thúc'),
    maxParticipants: z.number().min(1, 'Số lượng người tối đa phải lớn hơn 0'),
    status: z.enum(['upcoming', 'open', 'closed', 'completed']).optional(),
    statusMode: z.enum(['auto', 'manual']).optional(),
    imageUrl: z.string().optional(),
    organizer: z.string().min(2, 'Tên đơn vị tổ chức là bắt buộc'),
    contactPhone: z.string().optional(),
    targetBloodUnits: z.number().optional(),
  }),
});

export const getEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    await syncAutomaticEventStatuses();
    const { status, q, page = 1, limit = 10, sort = 'startDate' } = req.query;

    const query: any = {};

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

    let sortOption: any = { startDate: 1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'participants') sortOption = { currentParticipants: -1 };

    const [events, total] = await Promise.all([
      BloodDonationEvent.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .populate('createdBy', 'fullName email')
        .lean(),
      BloodDonationEvent.countDocuments(query),
    ]);

    // Attach actual registered counts
    const eventIds = events.map((e) => e._id);
    const registrationCounts = await Registration.aggregate([
      { $match: { eventId: { $in: eventIds }, registrationStatus: { $ne: 'cancelled' } } },
      { $group: { _id: '$eventId', count: { $sum: 1 } } },
    ]);

    const countMap = new Map();
    registrationCounts.forEach((r) => countMap.set(r._id.toString(), r.count));

    const eventsWithCount = events.map((evt) => ({
      ...evt,
      currentParticipants: countMap.get(evt._id.toString()) || 0,
    }));

    successResponse(
      res,
      eventsWithCount,
      'Lấy danh sách đợt hiến máu thành công',
      200,
      {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      }
    );
  } catch (error: any) {
    errorResponse(res, error.message || 'Lỗi khi lấy danh sách sự kiện', 500, error);
  }
};

export const getEventById = async (req: Request, res: Response): Promise<void> => {
  try {
    await syncAutomaticEventStatuses();
    const { id } = req.params;

    const event = await BloodDonationEvent.findById(id).populate('createdBy', 'fullName email phone');
    if (!event) {
      errorResponse(res, 'Không tìm thấy đợt hiến máu', 404);
      return;
    }

    const [registrationCount, checkedInCount] = await Promise.all([
      Registration.countDocuments({ eventId: event._id, registrationStatus: { $ne: 'cancelled' } }),
      Registration.countDocuments({ eventId: event._id, 'checkIn.status': true }),
    ]);

    const eventData = {
      ...event.toObject(),
      currentParticipants: registrationCount,
      checkedInCount,
    };

    successResponse(res, eventData, 'Lấy chi tiết đợt hiến máu thành công');
  } catch (error: any) {
    errorResponse(res, error.message || 'Lỗi khi lấy chi tiết sự kiện', 500, error);
  }
};

export const createEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Vui lòng đăng nhập', 401);
      return;
    }

    const {
      title,
      description,
      location,
      addressDetails,
      startDate,
      endDate,
      maxParticipants,
      status = 'upcoming',
      statusMode = 'auto',
      imageUrl,
      organizer,
      contactPhone,
      targetBloodUnits,
    } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      errorResponse(res, 'Thời gian kết thúc phải diễn ra sau thời gian bắt đầu', 422);
      return;
    }

    const newEvent = await BloodDonationEvent.create({
      title,
      description,
      location,
      addressDetails,
      startDate: start,
      endDate: end,
      maxParticipants,
      status: statusMode === 'auto' ? resolveEventStatus(start, end, status) : status,
      statusMode,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&q=80&w=1000',
      organizer: organizer || 'Hội Chữ Thập Đỏ & Viện Huyết học',
      contactPhone: contactPhone || req.user.phone,
      targetBloodUnits: targetBloodUnits || maxParticipants,
      createdBy: req.user._id,
    });

    successResponse(res, newEvent, 'Tạo đợt hiến máu mới thành công', 201);
  } catch (error: any) {
    errorResponse(res, error.message || 'Lỗi khi tạo sự kiện', 500, error);
  }
};

export const updateEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existingEvent = await BloodDonationEvent.findById(id);
    if (!existingEvent) {
      errorResponse(res, 'Không tìm thấy đợt hiến máu cần cập nhật', 404);
      return;
    }

    const {
      title,
      description,
      location,
      addressDetails,
      startDate,
      endDate,
      maxParticipants,
      status,
      statusMode,
      imageUrl,
      organizer,
      contactPhone,
      targetBloodUnits,
    } = req.body;

    if (startDate && endDate) {
      if (new Date(endDate) <= new Date(startDate)) {
        errorResponse(res, 'Thời gian kết thúc phải diễn ra sau thời gian bắt đầu', 422);
        return;
      }
    }

    const nextStartDate = startDate ? new Date(startDate) : existingEvent.startDate;
    const nextEndDate = endDate ? new Date(endDate) : existingEvent.endDate;
    const nextStatusMode = statusMode || existingEvent.statusMode || 'auto';
    const requestedStatus = status || existingEvent.status;
    const nextStatus = nextStatusMode === 'auto'
      ? resolveEventStatus(nextStartDate, nextEndDate, requestedStatus)
      : requestedStatus;

    const updatedEvent = await BloodDonationEvent.findByIdAndUpdate(
      id,
      {
        ...(title && { title }),
        ...(description && { description }),
        ...(location && { location }),
        ...(addressDetails && { addressDetails }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(maxParticipants !== undefined && { maxParticipants }),
        status: nextStatus,
        statusMode: nextStatusMode,
        ...(imageUrl !== undefined && { imageUrl }),
        ...(organizer && { organizer }),
        ...(contactPhone !== undefined && { contactPhone }),
        ...(targetBloodUnits !== undefined && { targetBloodUnits }),
      },
      { new: true, runValidators: true }
    );

    successResponse(res, updatedEvent, 'Cập nhật đợt hiến máu thành công');
  } catch (error: any) {
    errorResponse(res, error.message || 'Lỗi khi cập nhật sự kiện', 500, error);
  }
};

export const deleteEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const checkedInCount = await Registration.countDocuments({
      eventId: id,
      'checkIn.status': true,
    });

    if (checkedInCount > 0) {
      errorResponse(
        res,
        `Không thể xóa đợt hiến máu đã có ${checkedInCount} người điểm danh thực tế. Bạn có thể chuyển trạng thái sang "completed" (Hoàn thành).`,
        400
      );
      return;
    }

    const deleted = await BloodDonationEvent.findByIdAndDelete(id);
    if (!deleted) {
      errorResponse(res, 'Không tìm thấy đợt hiến máu để xóa', 404);
      return;
    }

    // Delete associated registrations
    await Registration.deleteMany({ eventId: id });

    successResponse(res, null, 'Đã xóa đợt hiến máu và các lượt đăng ký liên quan');
  } catch (error: any) {
    errorResponse(res, error.message || 'Lỗi khi xóa đợt hiến máu', 500, error);
  }
};
