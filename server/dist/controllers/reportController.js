"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportEventReportCSV = exports.getEventFunnel = exports.getEventReport = exports.getDashboardReport = void 0;
const BloodDonationEvent_1 = require("../models/BloodDonationEvent");
const Registration_1 = require("../models/Registration");
const reportService_1 = require("../services/reportService");
const response_1 = require("../utils/response");
const getDashboardReport = async (req, res) => {
    try {
        const stats = await (0, reportService_1.getDashboardAnalytics)();
        (0, response_1.successResponse)(res, stats, 'Lấy dữ liệu thống kê tổng quan thành công');
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message || 'Lỗi khi tải dữ liệu báo cáo thống kê', 500, error);
    }
};
exports.getDashboardReport = getDashboardReport;
const getEventReport = async (req, res) => {
    try {
        const { eventId } = req.params;
        const event = await BloodDonationEvent_1.BloodDonationEvent.findById(eventId);
        if (!event) {
            (0, response_1.errorResponse)(res, 'Không tìm thấy thông tin đợt hiến máu', 404);
            return;
        }
        const [registrations, funnel, bloodTypeStats, totalVolumeResult] = await Promise.all([
            Registration_1.Registration.find({ eventId, donationStatus: { $ne: 'cancelled' } })
                .populate('userId', 'fullName email phone identityCardNumber')
                .sort({ registeredAt: -1 })
                .lean(),
            (0, reportService_1.getEventFunnelAnalytics)(eventId),
            Registration_1.Registration.aggregate([
                {
                    $match: {
                        eventId: event._id,
                        donationStatus: 'donated',
                        confirmedBloodType: { $ne: null, $nin: ['', 'unknown'] },
                    },
                },
                { $group: { _id: '$confirmedBloodType', count: { $sum: 1 } } },
            ]),
            Registration_1.Registration.aggregate([
                { $match: { eventId: event._id, donationStatus: 'donated', donationVolume: { $gt: 0 } } },
                { $group: { _id: null, total: { $sum: '$donationVolume' } } },
            ]),
        ]);
        const totalVolumeMl = totalVolumeResult[0]?.total || 0;
        (0, response_1.successResponse)(res, {
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
        }, 'Lấy báo cáo sự kiện thành công');
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message || 'Lỗi khi tạo báo cáo sự kiện', 500, error);
    }
};
exports.getEventReport = getEventReport;
const getEventFunnel = async (req, res) => {
    try {
        const { eventId } = req.params;
        const funnel = await (0, reportService_1.getEventFunnelAnalytics)(eventId);
        (0, response_1.successResponse)(res, funnel, 'Lấy phễu chuyển đổi sự kiện thành công');
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message || 'Lỗi khi tải dữ liệu phễu chuyển đổi', 500, error);
    }
};
exports.getEventFunnel = getEventFunnel;
const exportEventReportCSV = async (req, res) => {
    try {
        const { eventId } = req.params;
        const event = await BloodDonationEvent_1.BloodDonationEvent.findById(eventId);
        if (!event) {
            (0, response_1.errorResponse)(res, 'Không tìm thấy đợt hiến máu để xuất file', 404);
            return;
        }
        const registrations = await Registration_1.Registration.find({ eventId, donationStatus: { $ne: 'cancelled' } })
            .populate('userId', 'fullName email phone')
            .sort({ registeredAt: 1 })
            .lean();
        const csvContent = (0, reportService_1.generateEventCSV)(event, registrations);
        const filename = `Bao_cao_Hien_Mau_${event.title.replace(/\s+/g, '_')}_${Date.now()}.csv`;
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
        res.status(200).send(csvContent);
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message || 'Lỗi khi xuất file báo cáo CSV', 500, error);
    }
};
exports.exportEventReportCSV = exportEventReportCSV;
