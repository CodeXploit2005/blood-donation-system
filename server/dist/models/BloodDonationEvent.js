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
exports.BloodDonationEvent = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const BloodDonationEventSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});
// Indexing for search and status queries
BloodDonationEventSchema.index({ status: 1, startDate: 1 });
BloodDonationEventSchema.index({ title: 'text', location: 'text' });
exports.BloodDonationEvent = mongoose_1.default.model('BloodDonationEvent', BloodDonationEventSchema);
exports.default = exports.BloodDonationEvent;
