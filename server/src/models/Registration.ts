import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IHealthInfo {
  hasFever: boolean;
  hasChronicDisease: boolean;
  takingMedication: boolean;
  recentSurgery: boolean;
  lastDonationDate?: Date;
  hasTattooOrPiercingIn6Months?: boolean;
  isPregnantOrNursing?: boolean;
  notes?: string;
}

export interface IScreeningResultData {
  hemoglobin?: number;
  bloodPressure?: string;
  doctorConclusion: 'eligible' | 'ineligible' | 'deferred' | null;
  notes?: string;
  reasons?: string[];
}

export interface IQRCodeData {
  code: string;
  token: string;
  dataUrl?: string;
}

export interface ICheckInInfo {
  status: 'pending' | 'checked_in';
  checkInTime?: Date;
  checkedInBy?: Types.ObjectId;
  nurseNotes?: string;
  hemoglobinLevel?: number;
  bloodPressure?: string;
}

export type DonationStatusType =
  | 'registered'
  | 'checked_in'
  | 'screened_eligible'
  | 'screened_ineligible'
  | 'donated'
  | 'no_show'
  | 'cancelled';

export interface IRegistration extends Document {
  userId: Types.ObjectId;
  eventId: Types.ObjectId;
  fullName: string;
  phone: string;
  email: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  identityCardNumber?: string;
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'unknown';
  confirmedBloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | null;
  weight: number;
  height?: number;
  healthInfo: IHealthInfo;
  screeningResult: IScreeningResultData;
  donationVolume: number | null;
  donationStatus: DonationStatusType;
  qrCode: IQRCodeData;
  checkIn: ICheckInInfo;
  preferredTimeSlot?: string;
  registeredAt: Date;
  updatedAt: Date;
}

const RegistrationSchema = new Schema<IRegistration>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'BloodDonationEvent',
      required: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, 'Họ và tên là bắt buộc'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Số điện thoại là bắt buộc'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email là bắt buộc'],
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    identityCardNumber: {
      type: String,
      trim: true,
    },
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'],
      default: 'unknown',
    },
    confirmedBloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', null],
      default: null,
      index: true,
    },
    weight: {
      type: Number,
      required: [true, 'Cân nặng là bắt buộc'],
      min: [35, 'Cân nặng không hợp lệ'],
    },
    height: {
      type: Number,
    },
    healthInfo: {
      hasFever: { type: Boolean, default: false },
      hasChronicDisease: { type: Boolean, default: false },
      takingMedication: { type: Boolean, default: false },
      recentSurgery: { type: Boolean, default: false },
      lastDonationDate: { type: Date },
      hasTattooOrPiercingIn6Months: { type: Boolean, default: false },
      isPregnantOrNursing: { type: Boolean, default: false },
      notes: { type: String, default: '' },
    },
    screeningResult: {
      hemoglobin: { type: Number },
      bloodPressure: { type: String },
      doctorConclusion: {
        type: String,
        enum: ['eligible', 'ineligible', 'deferred', null],
        default: null,
      },
      notes: { type: String, default: '' },
      reasons: { type: [String], default: [] },
    },
    donationVolume: {
      type: Number,
      default: null,
      index: true,
    },
    donationStatus: {
      type: String,
      enum: [
        'registered',
        'checked_in',
        'screened_eligible',
        'screened_ineligible',
        'donated',
        'no_show',
        'cancelled',
      ],
      default: 'registered',
      index: true,
    },
    qrCode: {
      code: { type: String, required: true, unique: true, index: true },
      token: { type: String, required: true },
      dataUrl: { type: String },
    },
    checkIn: {
      status: {
        type: String,
        enum: ['pending', 'checked_in'],
        default: 'pending',
        index: true,
      },
      checkInTime: { type: Date },
      checkedInBy: { type: Schema.Types.ObjectId, ref: 'User' },
      nurseNotes: { type: String, default: '' },
      hemoglobinLevel: { type: Number },
      bloodPressure: { type: String },
    },
    preferredTimeSlot: {
      type: String,
      default: '08:00 - 10:00',
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index
RegistrationSchema.index({ userId: 1, eventId: 1 }, { unique: true });

export const Registration: Model<IRegistration> = mongoose.model<IRegistration>(
  'Registration',
  RegistrationSchema
);

export default Registration;
