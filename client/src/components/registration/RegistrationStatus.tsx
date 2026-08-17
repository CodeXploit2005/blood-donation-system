import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, QrCode, CheckCircle2, AlertCircle, Clock, ShieldCheck, XCircle } from 'lucide-react';
import { formatDate, formatTime } from '../../utils/formatDate';
import {
  REGISTRATION_STATUS_LABELS,
  REGISTRATION_STATUS_COLORS,
  SCREENING_RESULT_LABELS,
  SCREENING_RESULT_COLORS,
} from '../../utils/constants';
import Button from '../common/Button';

export const RegistrationStatus = ({ registration, onCancel, isCancelling = false }) => {
  const {
    _id,
    eventId,
    fullName,
    bloodType,
    weight,
    preferredTimeSlot,
    registrationStatus = 'registered',
    screeningResult = 'eligible',
    screeningNotes,
    checkIn,
    qrCode,
    registeredAt,
  } = registration;

  return (
    <div className="bg-porcelain-card dark:bg-[#1A1E22] rounded-3xl border border-sand dark:border-white/10 shadow-warm p-5 sm:p-6 transition-all hover:border-crimson/40 text-ink dark:text-porcelain">
      {/* Header with Title and Status Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-sand/60 dark:border-white/10">
        <div>
          <span className="text-[11px] font-mono text-crimson font-bold block mb-1">
            MÃ ĐƠN: {qrCode?.code || _id}
          </span>
          <h4 className="font-display text-base sm:text-lg font-bold text-ink dark:text-white">
            {eventId?.title || 'Đợt hiến máu'}
          </h4>
        </div>

        <div className="flex items-center gap-2">
          {/* Check-in status badge */}
          {checkIn?.status === 'checked_in' || registration.donationStatus === 'donated' ? (
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-sage-light dark:bg-sage/20 text-sage-deep dark:text-sage border border-sage/40 flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-sage" />
              Đã hiến {registration.donationVolume || checkIn?.actualVolumeMl || 350}ml
            </span>
          ) : (
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                REGISTRATION_STATUS_COLORS[registrationStatus] || REGISTRATION_STATUS_COLORS.registered
              }`}
            >
              {REGISTRATION_STATUS_LABELS[registrationStatus] || registrationStatus}
            </span>
          )}
        </div>
      </div>

      {/* Details Grid */}
      <div className="py-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-ink-muted dark:text-gray-400">
            <Calendar className="w-3.5 h-3.5 text-crimson" />
            <span>Ngày tổ chức:</span>
          </div>
          <p className="font-semibold text-ink dark:text-white pl-5">
            {formatDate(eventId?.startDate)} ({eventId?.startDate ? formatTime(eventId.startDate) : ''})
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-ink-muted dark:text-gray-400">
            <Clock className="w-3.5 h-3.5 text-crimson" />
            <span>Khung giờ đã chọn:</span>
          </div>
          <p className="font-semibold text-ink dark:text-white pl-5">{preferredTimeSlot || '08:00 - 10:00'}</p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-ink-muted dark:text-gray-400">
            <MapPin className="w-3.5 h-3.5 text-crimson" />
            <span>Địa điểm:</span>
          </div>
          <p className="font-semibold text-ink dark:text-white pl-5 truncate" title={eventId?.location}>
            {eventId?.location || 'Viện Huyết học'}
          </p>
        </div>
      </div>

      {/* Screening details summary */}
      <div className="p-3.5 rounded-2xl bg-sand-light/50 dark:bg-[#23282E] border border-sand dark:border-white/10 flex items-center justify-between text-xs mb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-sage flex-shrink-0" />
          <div>
            <span className="font-bold text-ink dark:text-white">Sàng lọc sơ bộ: </span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                SCREENING_RESULT_COLORS[screeningResult]
              }`}
            >
              {SCREENING_RESULT_LABELS[screeningResult]}
            </span>
          </div>
        </div>
        <span className="text-[11px] text-ink-muted dark:text-gray-400 font-mono">
          Nhóm máu: <strong className="text-crimson">{bloodType}</strong> | Cân nặng: {weight}kg
        </span>
      </div>

      {/* Footer action buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-sand/60 dark:border-white/10">
        <span className="text-[11px] text-ink-muted dark:text-gray-400">
          Đăng ký lúc: {formatDate(registeredAt)}
        </span>

        <div className="flex items-center gap-2">
          {registrationStatus !== 'cancelled' && !checkIn?.status && onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCancel(registration)}
              isLoading={isCancelling}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            >
              Hủy Đăng Ký
            </Button>
          )}

          <Link to={`/my-qr`}>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<QrCode className="w-3.5 h-3.5" />}
            >
              Mở Thẻ QR
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegistrationStatus;
