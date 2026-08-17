import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IBloodDonationEvent extends Document {
  title: string;
  description: string;
  location: string;
  addressDetails: string;
  startDate: Date;
  endDate: Date;
  maxParticipants: number;
  currentParticipants: number;
  status: 'upcoming' | 'open' | 'closed' | 'completed';
  statusMode: 'auto' | 'manual';
  imageUrl?: string;
  organizer: string;
  contactPhone?: string;
  targetBloodUnits?: number;
  collectedBloodUnits?: number;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BloodDonationEventSchema = new Schema<IBloodDonationEvent>(
  {
    title: {
      type: String,
      required: [true, 'Tiêu đề đợt hiến máu là bắt buộc'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Mô tả chi tiết là bắt buộc'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Địa điểm tổ chức là bắt buộc'],
      trim: true,
    },
    addressDetails: {
      type: String,
      required: [true, 'Địa chỉ cụ thể là bắt buộc'],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Thời gian bắt đầu là bắt buộc'],
    },
    endDate: {
      type: Date,
      required: [true, 'Thời gian kết thúc là bắt buộc'],
    },
    maxParticipants: {
      type: Number,
      required: [true, 'Số lượng người tối đa là bắt buộc'],
      default: 100,
      min: [1, 'Số lượng người tối đa phải lớn hơn 0'],
    },
    currentParticipants: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['upcoming', 'open', 'closed', 'completed'],
      default: 'upcoming',
    },
    statusMode: {
      type: String,
      enum: ['auto', 'manual'],
      default: 'auto',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    organizer: {
      type: String,
      required: [true, 'Đơn vị tổ chức là bắt buộc'],
      default: 'Hội Chữ Thập Đỏ & Viện Huyết học',
      trim: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    targetBloodUnits: {
      type: Number,
      default: 100,
    },
    collectedBloodUnits: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexing for search and status queries
BloodDonationEventSchema.index({ status: 1, startDate: 1 });
BloodDonationEventSchema.index({ title: 'text', location: 'text' });

export const BloodDonationEvent: Model<IBloodDonationEvent> = mongoose.model<IBloodDonationEvent>(
  'BloodDonationEvent',
  BloodDonationEventSchema
);

export default BloodDonationEvent;
