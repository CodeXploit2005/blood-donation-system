import { Types } from 'mongoose';
import { Registration } from '../models/Registration';

/** Actual results only; never infer volume or confirmed blood type from registration. */
export async function getEventDonationSummaries(eventIds: Types.ObjectId[]) {
  const rows = await Registration.aggregate([
    { $match: { eventId: { $in: eventIds }, donationStatus: 'donated' } },
    { $group: {
      _id: { eventId: '$eventId', bloodType: { $ifNull: ['$confirmedBloodType', 'unknown'] } },
      donors: { $sum: 1 },
      volumeMl: { $sum: { $cond: [{ $gt: ['$donationVolume', 0] }, '$donationVolume', 0] } },
      missingVolume: { $sum: { $cond: [{ $gt: ['$donationVolume', 0] }, 0, 1] } },
    } },
    { $sort: { '_id.bloodType': 1 } },
  ]);
  const summaries = new Map<string, { donors: number; volumeMl: number; missingVolume: number; bloodTypes: { bloodType: string; donors: number; volumeMl: number }[] }>();
  for (const row of rows) {
    const id = String(row._id.eventId);
    const summary = summaries.get(id) || { donors: 0, volumeMl: 0, missingVolume: 0, bloodTypes: [] };
    summary.donors += row.donors;
    summary.volumeMl += row.volumeMl;
    summary.missingVolume += row.missingVolume;
    summary.bloodTypes.push({ bloodType: row._id.bloodType, donors: row.donors, volumeMl: row.volumeMl });
    summaries.set(id, summary);
  }
  return summaries;
}

export const emptyDonationSummary = () => ({ donors: 0, volumeMl: 0, missingVolume: 0, bloodTypes: [] });
