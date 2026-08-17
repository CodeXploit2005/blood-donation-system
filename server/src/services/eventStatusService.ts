import { BloodDonationEvent, IBloodDonationEvent } from '../models/BloodDonationEvent';

type EventStatus = IBloodDonationEvent['status'];

const MANUAL_STATUSES: EventStatus[] = ['closed', 'completed'];

/**
 * Open/upcoming are controlled by the event window. Closed/completed remain
 * explicit admin decisions and are never reopened by the scheduler.
 */
export const resolveEventStatus = (
  startDate: Date,
  endDate: Date,
  requestedStatus: EventStatus,
  now = new Date()
): EventStatus => {
  if (MANUAL_STATUSES.includes(requestedStatus)) return requestedStatus;
  if (now < startDate) return 'upcoming';
  if (now > endDate) return 'closed';
  return 'open';
};

/** Keep stored values current so filtering, badges and registration agree. */
export const syncAutomaticEventStatuses = async (now = new Date()): Promise<void> => {
  await BloodDonationEvent.bulkWrite([
    {
      updateMany: {
        filter: { statusMode: { $ne: 'manual' }, status: 'open', startDate: { $gt: now } },
        update: { $set: { status: 'upcoming' } },
      },
    },
    {
      updateMany: {
        filter: {
          statusMode: { $ne: 'manual' },
          status: 'upcoming',
          startDate: { $lte: now },
          endDate: { $gte: now },
        },
        update: { $set: { status: 'open' } },
      },
    },
    {
      updateMany: {
        filter: {
          statusMode: { $ne: 'manual' },
          status: { $in: ['open', 'upcoming'] },
          endDate: { $lt: now },
        },
        update: { $set: { status: 'closed' } },
      },
    },
  ]);
};
