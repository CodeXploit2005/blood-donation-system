"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncAutomaticEventStatuses = exports.resolveEventStatus = void 0;
const BloodDonationEvent_1 = require("../models/BloodDonationEvent");
const MANUAL_STATUSES = ['closed', 'completed'];
/**
 * Open/upcoming are controlled by the event window. Closed/completed remain
 * explicit admin decisions and are never reopened by the scheduler.
 */
const resolveEventStatus = (startDate, endDate, requestedStatus, now = new Date()) => {
    if (MANUAL_STATUSES.includes(requestedStatus))
        return requestedStatus;
    if (now < startDate)
        return 'upcoming';
    if (now > endDate)
        return 'closed';
    return 'open';
};
exports.resolveEventStatus = resolveEventStatus;
/** Keep stored values current so filtering, badges and registration agree. */
const syncAutomaticEventStatuses = async (now = new Date()) => {
    await BloodDonationEvent_1.BloodDonationEvent.bulkWrite([
        {
            updateMany: {
                filter: { status: { $in: ['open', 'upcoming'] }, startDate: { $gt: now } },
                update: { $set: { status: 'upcoming' } },
            },
        },
        {
            updateMany: {
                filter: {
                    status: { $in: ['open', 'upcoming'] },
                    startDate: { $lte: now },
                    endDate: { $gte: now },
                },
                update: { $set: { status: 'open' } },
            },
        },
        {
            updateMany: {
                filter: { status: { $in: ['open', 'upcoming'] }, endDate: { $lt: now } },
                update: { $set: { status: 'closed' } },
            },
        },
    ]);
};
exports.syncAutomaticEventStatuses = syncAutomaticEventStatuses;
