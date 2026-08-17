import { Request, Response } from 'express';
import { BloodDonationEvent } from '../models/BloodDonationEvent';
import { Registration } from '../models/Registration';
import {
  getDashboardAnalytics,
  getEventFunnelAnalytics,
  generateEventCSV,
} from '../services/reportService';
import { successResponse, errorResponse } from '../utils/response';

export const getDashboardReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await getDashboardAnalytics();
    successResponse(res, stats, 'Lấy dữ liệu thống kê tổng quan thành công');
  } catch (error: any) {
    errorResponse(res, error.message || 'Lỗi khi tải dữ liệu báo cáo thống kê', 500, error);
  }
};

export const getEventReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;

    const event = await BloodDonationEvent.findById(eventId);
    if (!event) {
      errorResponse(res, 'Không tìm thấy thông tin đợt hiến máu', 404);
      return;
    }

    const [registrations, funnel, bloodTypeStats, totalVolumeResult] = await Promise.all([
      Registration.find({ eventId, donationStatus: { $ne: 'cancelled' } })
        .populate('userId', 'fullName email phone identityCardNumber')
        .sort({ registeredAt: -1 })
        .lean(),
      getEventFunnelAnalytics(eventId),
      Registration.aggregate([
        {
          $match: {
            eventId: event._id,
            donationStatus: 'donated',
            confirmedBloodType: { $ne: null, $nin: ['', 'unknown'] },
          },
        },
        { $group: { _id: '$confirmedBloodType', count: { $sum: 1 } } },
      ]),
      Registration.aggregate([
        { $match: { eventId: event._id, donationStatus: 'donated', donationVolume: { $gt: 0 } } },
        { $group: { _id: null, total: { $sum: '$donationVolume' } } },
      ]),
    ]);

    const totalVolumeMl = totalVolumeResult[0]?.total || 0;

    successResponse(
      res,
      {
        event,
        totalRegistrations: funnel.registered,
        totalCheckedIn: funnel.checkedIn,
        totalDonated: funnel.donated,
        funnel,
        checkInRate: funnel.attendanceRate,
        conversionRate: funnel.conversionRate,
        totalVolumeMl,
        bloodTypeStats,
        registrations,
      },
      'Lấy báo cáo sự kiện thành công'
    );
  } catch (error: any) {
    errorResponse(res, error.message || 'Lỗi khi tạo báo cáo sự kiện', 500, error);
  }
};

export const getEventFunnel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const funnel = await getEventFunnelAnalytics(eventId);
    successResponse(res, funnel, 'Lấy phễu chuyển đổi sự kiện thành công');
  } catch (error: any) {
    errorResponse(res, error.message || 'Lỗi khi tải dữ liệu phễu chuyển đổi', 500, error);
  }
};

export const exportEventReportCSV = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;

    const event = await BloodDonationEvent.findById(eventId);
    if (!event) {
      errorResponse(res, 'Không tìm thấy đợt hiến máu để xuất file', 404);
      return;
    }

    const registrations = await Registration.find({ eventId, donationStatus: { $ne: 'cancelled' } })
      .populate('userId', 'fullName email phone')
      .sort({ registeredAt: 1 })
      .lean();

    const csvContent = generateEventCSV(event, registrations);
    const filename = `Bao_cao_Hien_Mau_${event.title.replace(/\s+/g, '_')}_${Date.now()}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.status(200).send(csvContent);
  } catch (error: any) {
    errorResponse(res, error.message || 'Lỗi khi xuất file báo cáo CSV', 500, error);
  }
};
