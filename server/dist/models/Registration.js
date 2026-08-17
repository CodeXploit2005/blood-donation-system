"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Registration = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const RegistrationSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    eventId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
        checkedInBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
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
}, {
    timestamps: true,
});
// Compound unique index
RegistrationSchema.index({ userId: 1, eventId: 1 }, { unique: true });
exports.Registration = mongoose_1.default.model('Registration', RegistrationSchema);
exports.default = exports.Registration;
