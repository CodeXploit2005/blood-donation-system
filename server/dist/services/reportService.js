"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEventCSV = exports.getEventFunnelAnalytics = exports.getDashboardAnalytics = void 0;
const BloodDonationEvent_1 = require("../models/BloodDonationEvent");
const Registration_1 = require("../models/Registration");
const mongoose_1 = require("mongoose");
const RARE_BLOOD_TYPES = ['AB-', 'O-', 'B-', 'A-'];
const RARE_THRESHOLD = 2;
const getDashboardAnalytics = async () => {
    const [totalEvents, activeEvents, totalRegistrations, funnelAggregation, totalVolumeResult, confirmedBloodTypes, declaredBloodTypes, eventsList, recentRegistrations,] = await Promise.all([
        BloodDonationEvent_1.BloodDonationEvent.countDocuments(),
        BloodDonationEvent_1.BloodDonationEvent.countDocuments({ status: { $in: ['open', 'upcoming'] } }),
        Registration_1.Registration.countDocuments({ donationStatus: { $ne: 'cancelled' } }),
        // Funnel aggregation across all non-cancelled registrations
        Registration_1.Registration.aggregate([
            { $match: { donationStatus: { $ne: 'cancelled' } } },
            {
                $group: {
                    _id: null,
                    registered: { $sum: 1 },
                    checkedIn: {
                        $sum: {
                            $cond: [
                                {
                                    $or: [
                                        { $eq: ['$checkIn.status', 'checked_in'] },
                                        { $in: ['$donationStatus', ['checked_in', 'screened_eligible', 'donated']] },
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                    screenedEligible: {
                        $sum: {
                            $cond: [
                                {
                                    $or: [
                                        { $eq: ['$screeningResult.doctorConclusion', 'eligible'] },
                                        { $eq: ['$donationStatus', 'donated'] },
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                    screenedIneligible: {
                        $sum: {
                            $cond: [
                                {
                                    $or: [
                                        { $eq: ['$screeningResult.doctorConclusion', 'ineligible'] },
                                        { $eq: ['$donationStatus', 'screened_ineligible'] },
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                    donated: {
                        $sum: {
                            $cond: [{ $eq: ['$donationStatus', 'donated'] }, 1, 0],
                        },
                    },
                    noShow: {
                        $sum: {
                            $cond: [{ $eq: ['$donationStatus', 'no_show'] }, 1, 0],
                        },
                    },
                },
            },
        ]),
        // Total actual volume collected: Only when donationStatus === "donated" and donationVolume > 0
        Registration_1.Registration.aggregate([
            {
                $match: {
                    donationStatus: 'donated',
                    donationVolume: { $gt: 0 },
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$donationVolume' },
                    count: { $sum: 1 },
                },
            },
        ]),
        // Confirmed blood type distribution (only from donated records)
        Registration_1.Registration.aggregate([
            {
                $match: {
                    donationStatus: 'donated',
                    confirmedBloodType: { $ne: null, $nin: ['', 'unknown'] },
                },
            },
            {
                $group: {
                    _id: '$confirmedBloodType',
                    count: { $sum: 1 },
                    totalVolume: { $sum: { $ifNull: ['$donationVolume', 350] } },
                },
            },
            { $sort: { count: -1 } },
        ]),
        // Declared blood type distribution (by user self-declaration)
        Registration_1.Registration.aggregate([
            {
                $match: {
                    donationStatus: { $ne: 'cancelled' },
                    bloodType: { $ne: 'unknown' },
                },
            },
            {
                $group: {
                    _id: '$bloodType',
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
        ]),
        BloodDonationEvent_1.BloodDonationEvent.find().sort({ startDate: -1 }).limit(6).lean(),
        Registration_1.Registration.find()
            .populate('userId', 'fullName email phone')
            .populate('eventId', 'title location startDate')
            .sort({ registeredAt: -1 })
            .limit(8)
            .lean(),
    ]);
    const fData = funnelAggregation[0] || {
        registered: totalRegistrations,
        checkedIn: 0,
        screenedEligible: 0,
        screenedIneligible: 0,
        donated: 0,
        noShow: 0,
    };
    const totalCheckedIn = fData.checkedIn;
    const totalDonated = fData.donated;
    const totalVolumeCollectedMl = totalVolumeResult[0]?.total || 0;
    const completionRate = fData.registered > 0 ? Math.round((totalDonated / fData.registered) * 100) : 0;
    const funnel = {
        registered: fData.registered,
        checkedIn: fData.checkedIn,
        screenedEligible: fData.screenedEligible,
        screenedIneligible: fData.screenedIneligible,
        donated: fData.donated,
        noShow: fData.noShow,
        conversionRate: fData.registered > 0 ? Number(((fData.donated / fData.registered) * 100).toFixed(1)) : 0,
        attendanceRate: fData.registered > 0 ? Number(((fData.checkedIn / fData.registered) * 100).toFixed(1)) : 0,
    };
    // Build confirmed blood type distribution with isRareWarning
    const ALL_BLOOD_TYPES = ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'];
    const confirmedBloodTypeDistribution = ALL_BLOOD_TYPES.map((type) => {
        const found = confirmedBloodTypes.find((b) => b._id === type);
        const count = found ? found.count : 0;
        const totalVol = found ? found.totalVolume : 0;
        const isRare = RARE_BLOOD_TYPES.includes(type);
        return {
            name: type,
            count,
            totalVolume: totalVol,
            isRareWarning: isRare && count < RARE_THRESHOLD,
        };
    });
    const declaredBloodTypeDistribution = ALL_BLOOD_TYPES.map((type) => {
        const found = declaredBloodTypes.find((b) => b._id === type);
        return {
            name: type,
            count: found ? found.count : 0,
        };
    });
    // Group stats per event
    const eventIds = eventsList.map((e) => e._id);
    const regCounts = await Registration_1.Registration.aggregate([
        { $match: { eventId: { $in: eventIds }, donationStatus: { $ne: 'cancelled' } } },
        {
            $group: {
                _id: '$eventId',
                registered: { $sum: 1 },
                checkedIn: {
                    $sum: {
                        $cond: [
                            {
                                $or: [
                                    { $eq: ['$checkIn.status', 'checked_in'] },
                                    { $in: ['$donationStatus', ['checked_in', 'donated']] },
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },
                donated: {
                    $sum: { $cond: [{ $eq: ['$donationStatus', 'donated'] }, 1, 0] },
                },
                volumeMl: {
                    $sum: {
                        $cond: [{ $eq: ['$donationStatus', 'donated'] }, { $ifNull: ['$donationVolume', 350] }, 0],
                    },
                },
            },
        },
    ]);
    const regMap = new Map();
    regCounts.forEach((r) => {
        regMap.set(r._id.toString(), r);
    });
    const eventStats = eventsList.map((evt) => {
        const stats = regMap.get(evt._id.toString()) || {
            registered: 0,
            checkedIn: 0,
            donated: 0,
            volumeMl: 0,
        };
        return {
            title: evt.title.length > 22 ? evt.title.substring(0, 20) + '...' : evt.title,
            target: evt.maxParticipants || 100,
            registered: stats.registered,
            checkedIn: stats.checkedIn,
            donated: stats.donated,
            volumeMl: stats.volumeMl,
        };
    });
    return {
        totalEvents,
        activeEvents,
        totalRegistrations,
        totalCheckedIn,
        totalDonated,
        totalVolumeCollectedMl,
        completionRate,
        funnel,
        confirmedBloodTypeDistribution,
        declaredBloodTypeDistribution,
        eventStats,
        recentRegistrations,
    };
};
exports.getDashboardAnalytics = getDashboardAnalytics;
const getEventFunnelAnalytics = async (eventId) => {
    const result = await Registration_1.Registration.aggregate([
        {
            $match: {
                eventId: new mongoose_1.Types.ObjectId(eventId),
                donationStatus: { $ne: 'cancelled' },
            },
        },
        {
            $group: {
                _id: null,
                registered: { $sum: 1 },
                checkedIn: {
                    $sum: {
                        $cond: [
                            {
                                $or: [
                                    { $eq: ['$checkIn.status', 'checked_in'] },
                                    { $in: ['$donationStatus', ['checked_in', 'screened_eligible', 'donated']] },
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },
                screenedEligible: {
                    $sum: {
                        $cond: [
                            {
                                $or: [
                                    { $eq: ['$screeningResult.doctorConclusion', 'eligible'] },
                                    { $eq: ['$donationStatus', 'donated'] },
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },
                screenedIneligible: {
                    $sum: {
                        $cond: [
                            {
                                $or: [
                                    { $eq: ['$screeningResult.doctorConclusion', 'ineligible'] },
                                    { $eq: ['$donationStatus', 'screened_ineligible'] },
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },
                donated: {
                    $sum: {
                        $cond: [{ $eq: ['$donationStatus', 'donated'] }, 1, 0],
                    },
                },
                noShow: {
                    $sum: {
                        $cond: [{ $eq: ['$donationStatus', 'no_show'] }, 1, 0],
                    },
                },
            },
        },
    ]);
    const data = result[0] || {
        registered: 0,
        checkedIn: 0,
        screenedEligible: 0,
        screenedIneligible: 0,
        donated: 0,
        noShow: 0,
    };
    return {
        registered: data.registered,
        checkedIn: data.checkedIn,
        screenedEligible: data.screenedEligible,
        screenedIneligible: data.screenedIneligible,
        donated: data.donated,
        noShow: data.noShow,
        conversionRate: data.registered > 0 ? Number(((data.donated / data.registered) * 100).toFixed(1)) : 0,
        attendanceRate: data.registered > 0 ? Number(((data.checkedIn / data.registered) * 100).toFixed(1)) : 0,
    };
};
exports.getEventFunnelAnalytics = getEventFunnelAnalytics;
const generateEventCSV = (event, registrations) => {
    const BOM = '\uFEFF';
    const headers = [
        'Mã Đăng Ký',
        'Họ Và Tên',
        'Số Điện Thoại',
        'Email',
        'Nhóm Máu Khai Báo',
        'Nhóm Máu Xác Nhận',
        'Cân Nặng (kg)',
        'Khung Giờ',
        'Kết Quả Sàng Lọc',
        'Trạng Thái Hiến Máu',
        'Điểm Danh',
        'Thời Gian Điểm Danh',
        'Thể Tích Đã Hiến (ml)',
        'Ghi Chú Y Tế',
        'Ngày Đăng Ký',
    ];
    const rows = registrations.map((r) => {
        const checkinTime = r.checkIn?.checkInTime
            ? new Date(r.checkIn.checkInTime).toLocaleString('vi-VN')
            : '';
        const registeredDate = r.registeredAt
            ? new Date(r.registeredAt).toLocaleString('vi-VN')
            : '';
        const screening = r.screeningResult?.doctorConclusion === 'eligible'
            ? 'Đủ điều kiện'
            : r.screeningResult?.doctorConclusion === 'ineligible'
                ? 'Không đủ ĐK'
                : r.screeningResult?.doctorConclusion === 'deferred'
                    ? 'Cần khám lại'
                    : 'Chưa khám';
        const donationStatusText = r.donationStatus === 'donated'
            ? 'Đã hiến thành công'
            : r.donationStatus === 'checked_in'
                ? 'Đã điểm danh'
                : r.donationStatus === 'screened_eligible'
                    ? 'Đủ ĐK chờ lấy máu'
                    : r.donationStatus === 'screened_ineligible'
                        ? 'Loại tại quầy'
                        : r.donationStatus === 'no_show'
                            ? 'Không đến'
                            : 'Đã đăng ký';
        const isCheckedIn = r.checkIn?.status === 'checked_in' || r.donationStatus === 'donated'
            ? 'Đã có mặt'
            : 'Chưa có mặt';
        return [
            `"${r.qrCode?.code || ''}"`,
            `"${r.fullName || ''}"`,
            `"${r.phone || ''}"`,
            `"${r.email || ''}"`,
            `"${r.bloodType || 'Chưa rõ'}"`,
            `"${r.confirmedBloodType || ''}"`,
            r.weight || '',
            `"${r.preferredTimeSlot || ''}"`,
            `"${screening}"`,
            `"${donationStatusText}"`,
            `"${isCheckedIn}"`,
            `"${checkinTime}"`,
            r.donationVolume || '',
            `"${(r.checkIn?.nurseNotes || '').replace(/"/g, '""')}"`,
            `"${registeredDate}"`,
        ].join(',');
    });
    return BOM + [headers.join(','), ...rows].join('\r\n');
};
exports.generateEventCSV = generateEventCSV;
