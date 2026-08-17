import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { QrCode, Calendar, ShieldCheck, ChevronDown } from 'lucide-react';
import registrationService from '../../services/registrationService';
import QRCodeDisplay from '../../components/checkin/QRCodeDisplay';
import EmptyState from '../../components/common/EmptyState';
import Loading from '../../components/common/Loading';
import useAuth from '../../hooks/useAuth';
import { formatDate } from '../../utils/formatDate';

export const MyQRCode = () => {
  const { user } = useAuth();
  const [selectedRegId, setSelectedRegId] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['my-registrations-for-qr'],
    queryFn: () => registrationService.getMyRegistrations(),
  });

  const rawList = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
  const registrations = rawList.filter(
    (r) => r && r.donationStatus !== 'cancelled' && r.registrationStatus !== 'cancelled'
  );

  // Default select the latest registration
  const activeRegistration = selectedRegId
    ? registrations.find((r) => r._id === selectedRegId) || registrations[0]
    : registrations[0];

  if (isLoading) {
    return <Loading fullScreen text="Đang tải thẻ QR điểm danh của bạn..." />;
  }

  if (registrations.length === 0) {
    return (
      <div className="max-w-md mx-auto py-12">
        <EmptyState
          icon={QrCode}
          title="Bạn chưa có thẻ QR nào"
          description="Đăng ký tham gia một đợt hiến máu để nhận mã QR thông minh phục vụ điểm danh tại sự kiện."
          actionText="Tìm đợt hiến máu"
          onAction={() => (window.location.href = '/events')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-crimson uppercase tracking-wider">
          <QrCode className="w-4 h-4" />
          <span>Thẻ Điểm Danh Kỹ Thuật Số</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink dark:text-porcelain">
          Mã QR Điểm Danh Hiến Máu
        </h1>
        <p className="text-xs text-ink-muted">
          Xuất trình thẻ này cho nhân viên y tế tại bàn tiếp nhận
        </p>
      </div>

      {/* Compact selector that stays usable even with many registrations */}
      {registrations.length > 1 && (
        <div className="mx-auto max-w-lg rounded-2xl border border-sand dark:border-white/10 bg-porcelain-card dark:bg-ink-card p-3.5 sm:p-4 shadow-warm">
          <div className="mb-2 flex items-center justify-between gap-3">
            <label htmlFor="qr-registration-selector" className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              Chọn thẻ điểm danh
            </label>
            <span className="rounded-full bg-crimson-light dark:bg-crimson/15 px-2 py-0.5 text-[10px] font-bold text-crimson">
              {registrations.length} đợt
            </span>
          </div>

          <div className="relative">
            <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-crimson" />
            <select
              id="qr-registration-selector"
              value={activeRegistration?._id || ''}
              onChange={(event) => setSelectedRegId(event.target.value)}
              className="w-full appearance-none rounded-xl border border-sand dark:border-white/10 bg-porcelain dark:bg-ink-deep py-2.5 pl-9 pr-9 text-xs font-semibold text-ink dark:text-porcelain outline-none transition focus:border-crimson focus:ring-1 focus:ring-crimson"
            >
              {registrations.map((registration, index) => (
                <option key={registration._id} value={registration._id}>
                  {index + 1}. {registration.eventId?.title || 'Đợt hiến máu'}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          </div>

          <div className="mt-3 border-t border-sand/60 dark:border-white/10 pt-3">
            <p className="break-words text-sm font-bold leading-snug text-ink dark:text-white">
              {activeRegistration?.eventId?.title || 'Đợt hiến máu'}
            </p>
            {activeRegistration?.eventId?.startDate && (
              <p className="mt-1 flex items-center gap-1.5 text-[11px] text-ink-muted">
                <Calendar className="h-3.5 w-3.5 flex-none" />
                <span>Diễn ra ngày {formatDate(activeRegistration.eventId.startDate)}</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main Glass Breathing QR Card */}
      {activeRegistration && (
        <QRCodeDisplay registration={activeRegistration} user={user} />
      )}

      {/* Important instructions notice */}
      <div className="p-4 rounded-2xl bg-sand-light/50 dark:bg-ink-card border border-sand dark:border-sand/20 text-xs text-ink-light space-y-1.5 max-w-sm sm:max-w-md mx-auto">
        <div className="flex items-center gap-1.5 font-bold text-ink dark:text-porcelain">
          <ShieldCheck className="w-4 h-4 text-sage" />
          <span>Hướng dẫn tại hiện trường sự kiện:</span>
        </div>
        <ul className="list-disc pl-5 space-y-1 text-ink-muted text-[11px]">
          <li>Giữ màn hình điện thoại có độ sáng tốt khi đưa vào mắt camera quét.</li>
          <li>Mang theo <strong>Căn cước công dân (CCCD)</strong> bản gốc để đối soát.</li>
          <li>Thẻ QR có giá trị check-in trực tiếp và ghi nhận chứng nhận hiến máu.</li>
        </ul>
      </div>
    </div>
  );
};

export default MyQRCode;
