import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Eye,
  ShieldCheck,
  Calendar,
  Clock,
  User,
  Phone,
  Droplet,
} from 'lucide-react';
import registrationService from '../../services/registrationService';
import eventService from '../../services/eventService';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { formatDate, formatTime } from '../../utils/formatDate';
import {
  REGISTRATION_STATUS_LABELS,
  REGISTRATION_STATUS_COLORS,
  SCREENING_RESULT_LABELS,
  SCREENING_RESULT_COLORS,
} from '../../utils/constants';
import { useToast } from '../../components/common/Toast';
import Button from '../../components/common/Button';
import useAuth from '../../hooks/useAuth';
import { BLOOD_TYPES } from '../../utils/constants';

export const RegistrationsManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialEventId = searchParams.get('eventId') || '';

  const [selectedEventId, setSelectedEventId] = useState(initialEventId);
  const [screeningFilter, setScreeningFilter] = useState('all');
  const [checkinFilter, setCheckinFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReg, setSelectedReg] = useState(null);
  const [volumeMl, setVolumeMl] = useState('');
  const [resultReason, setResultReason] = useState('');
  const [confirmedBloodType, setConfirmedBloodType] = useState('');
  const { user } = useAuth();

  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const recordDonation = useMutation({
    mutationFn: () => registrationService.updateRegistrationStatus(selectedReg._id, {
      donationStatus: 'donated',
      donationVolume: Number(volumeMl),
      confirmedBloodType,
      reason: resultReason,
    }),
    onSuccess: (response) => {
      setSelectedReg(response.data);
      queryClient.invalidateQueries();
      success('Đã ghi nhận lượng máu hiến thành công.');
    },
    onError: (err: Error) => toastError(err.message || 'Không thể ghi nhận hiến máu'),
  });

  // Fetch events list for dropdown
  const { data: eventsData } = useQuery({
    refetchInterval: 15000,
    queryKey: ['admin-events-dropdown'],
    queryFn: () => eventService.getEvents({ limit: 100 }),
  });

  const allEvents = eventsData?.data || [];
  const activeEventId = selectedEventId || allEvents[0]?._id;

  // Fetch registrations for selected event
  const { data, isLoading } = useQuery({
    refetchInterval: 15000,
    queryKey: [
      'admin-event-registrations',
      activeEventId,
      screeningFilter,
      checkinFilter,
      searchTerm,
      currentPage,
    ],
    queryFn: () =>
      registrationService.getEventRegistrations(activeEventId, {
        screening: screeningFilter === 'all' ? undefined : screeningFilter,
        checkin: checkinFilter === 'all' ? undefined : checkinFilter,
        q: searchTerm || undefined,
        page: currentPage,
        limit: 15,
      }),
    enabled: !!activeEventId,
  });

  const registrations = data?.data?.registrations || [];
  const event = data?.data?.event;
  const donationSummary = data?.data?.donationSummary;
  const pagination = data?.pagination || { total: 0, page: 1, limit: 15, totalPages: 1 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            Quản Lý Danh Sách Đăng Ký
          </h1>
          <p className="text-xs text-ink-muted">
            Theo dõi danh sách người đăng ký, kết quả sàng lọc sức khỏe và trạng thái điểm danh
          </p>
        </div>
      </div>

      {/* Filter & Event Selector Toolbar */}
      <div className="p-4 rounded-2xl bg-porcelain-card border border-sand shadow-warm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Select Event */}
          <div className="sm:col-span-4">
            <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-1">
              Chọn Đợt Hiến Máu
            </label>
            <select
              value={activeEventId || ''}
              onChange={(e) => {
                setSelectedEventId(e.target.value);
                setSearchParams({ eventId: e.target.value });
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-sand bg-porcelain text-xs font-semibold text-ink outline-none focus:border-crimson"
            >
              {allEvents.map((evt) => (
                <option key={evt._id} value={evt._id}>
                  {evt.title}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="sm:col-span-4">
            <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-1">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Tên, số điện thoại, mã đơn..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-sand bg-porcelain text-xs text-ink outline-none focus:border-crimson"
              />
            </div>
          </div>

          {/* Screening Filter */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-1">
              Sàng Lọc
            </label>
            <select
              value={screeningFilter}
              onChange={(e) => {
                setScreeningFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-sand bg-porcelain text-xs text-ink outline-none focus:border-crimson"
            >
              <option value="all">Tất cả kết quả</option>
              <option value="eligible">Đủ điều kiện</option>
              <option value="deferred">Cần khám lại</option>
              <option value="ineligible">Không đủ ĐK</option>
            </select>
          </div>

          {/* Check-in Filter */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-1">
              Điểm Danh
            </label>
            <select
              value={checkinFilter}
              onChange={(e) => {
                setCheckinFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-sand bg-porcelain text-xs text-ink outline-none focus:border-crimson"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="true">Đã điểm danh</option>
              <option value="false">Chưa điểm danh</option>
            </select>
          </div>
        </div>
      </div>

      {donationSummary && (
        <div className="p-4 rounded-2xl border border-sand bg-porcelain-card space-y-2">
          <h2 className="font-bold text-ink">Kết quả hiến máu toàn đợt</h2>
          <p className="text-sm text-crimson font-semibold">{donationSummary.donors} người đã hiến · {donationSummary.volumeMl.toLocaleString('vi-VN')} ml đã ghi nhận</p>
          <div className="flex flex-wrap gap-2">
            {donationSummary.bloodTypes.map((item) => <span key={item.bloodType} className="px-3 py-1 rounded-lg bg-sand-light text-xs">{item.bloodType === 'unknown' ? 'Chưa xác nhận nhóm máu' : item.bloodType}: {item.donors} người · {item.volumeMl.toLocaleString('vi-VN')} ml</span>)}
          </div>
          {!!donationSummary.missingVolume && <p className="text-xs text-amber-700">{donationSummary.missingVolume} người đã hiến chưa được ghi lượng máu; chưa tính vào tổng ml.</p>}
          <p className="text-xs text-ink-muted">Tổng toàn đợt, không phụ thuộc trang hoặc bộ lọc. Chỉ tính người có kết quả đã hiến.</p>
        </div>
      )}

      {/* Registrations Table */}
      {registrations.length === 0 && !isLoading ? (
        <EmptyState
          icon={Users}
          title="Chưa có người đăng ký nào"
          description="Đợt hiến máu này chưa có người đăng ký hoặc không có mục nào khớp với bộ lọc."
        />
      ) : (
        <div className="w-full overflow-hidden rounded-2xl border border-sand bg-porcelain-card shadow-warm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sand-light/70 text-ink-muted uppercase tracking-wider text-[11px] border-b border-sand">
                <tr>
                  <th className="px-4 py-4 font-bold">Mã QR</th>
                  <th className="px-4 py-4 font-bold">Họ Và Tên</th>
                  <th className="px-3 py-4 font-bold text-center">Nhóm Máu</th>
                  <th className="px-3 py-4 font-bold text-center">Lượng Máu Hiến</th>
                  <th className="px-3 py-4 font-bold text-center">Cân Nặng</th>
                  <th className="px-4 py-4 font-bold">Khung Giờ</th>
                  <th className="px-4 py-4 font-bold text-center">Sàng Lọc</th>
                  <th className="px-4 py-4 font-bold text-center">Điểm Danh</th>
                  <th className="px-4 py-4 font-bold text-right">Chi Tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand/60">
                {registrations.map((reg) => (
                  <tr key={reg._id} className="hover:bg-sand-light/40 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-crimson">
                      {reg.qrCode?.code}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-ink">{reg.fullName}</span>
                        <span className="text-[11px] text-ink-muted">{reg.phone}</span>
                      </div>
                    </td>

                    <td className="px-3 py-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full font-bold text-[11px] bg-crimson-light text-crimson border border-crimson/20">
                        {reg.confirmedBloodType || (reg.bloodType === 'unknown' ? 'Chưa rõ' : reg.bloodType)}
                      </span>
                      <div className="text-[10px] text-ink-muted mt-1">{reg.confirmedBloodType ? 'Đã xác nhận' : 'Tự khai'}</div>
                    </td>

                    <td className="px-3 py-3 text-center whitespace-nowrap font-semibold">
                      {reg.donationStatus === 'donated' ? (reg.donationVolume > 0 ? `${reg.donationVolume} ml` : 'Chưa ghi nhận') : '—'}
                    </td>

                    <td className="px-3 py-3 text-center font-mono font-semibold text-ink">
                      {reg.weight} kg
                    </td>

                    <td className="px-4 py-3 text-ink-light whitespace-nowrap">
                      {reg.preferredTimeSlot}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          SCREENING_RESULT_COLORS[reg.screeningResult?.doctorConclusion] || 'text-ink-muted'
                        }`}
                      >
                        {SCREENING_RESULT_LABELS[reg.screeningResult?.doctorConclusion] || 'Chưa có kết luận'}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span className="text-xs font-semibold text-ink dark:text-porcelain">
                        {reg.donationStatus === 'donated' ? (reg.donationVolume ? 'Đã hiến ' + reg.donationVolume + ' ml' : 'Đã hiến · chưa ghi thể tích') : REGISTRATION_STATUS_LABELS[reg.donationStatus] || 'Chưa điểm danh'}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedReg(reg);
                          setResultReason('');
                          setVolumeMl(reg.donationVolume ? String(reg.donationVolume) : '');
                          setConfirmedBloodType(reg.confirmedBloodType || (reg.bloodType !== 'unknown' ? reg.bloodType : ''));
                        }}
                        className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap px-3 py-2 rounded-xl border border-sand bg-porcelain hover:border-crimson hover:bg-crimson-light text-ink-light hover:text-crimson text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson"
                        title="Xem chi tiết và ghi nhận lượng máu đã hiến"
                      >
                        {['admin', 'staff'].includes(user?.role) && reg.donationStatus !== 'cancelled' ? <Droplet className="w-3.5 h-3.5 shrink-0" /> : <Eye className="w-3.5 h-3.5 shrink-0" />}
                        {['admin', 'staff'].includes(user?.role) && reg.donationStatus !== 'cancelled' ? (reg.donationStatus === 'donated' ? 'Sửa kết quả' : 'Ghi nhận máu') : 'Chi tiết'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-sand">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(p) => setCurrentPage(p)}
            />
          </div>
        </div>
      )}

      {/* Registration Details & Health Form Modal */}
      <Modal
        isOpen={!!selectedReg}
        onClose={() => setSelectedReg(null)}
        title="Chi Tiết Người Hiến & Kết Quả Hiến Máu"
        subtitle={`Người hiến: ${selectedReg?.fullName} — Mã đơn: ${selectedReg?.qrCode?.code}`}
        maxWidth="max-w-2xl"
      >
        {selectedReg && (
          <div className="space-y-4 text-xs text-ink">
            {/* Donor & Event Info */}
            <div className="p-4 rounded-2xl bg-sand-light/50 border border-sand grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-ink-muted block text-[11px]">Họ và tên:</span>
                <span className="font-bold">{selectedReg.fullName}</span>
              </div>
              <div>
                <span className="text-ink-muted block text-[11px]">Số CCCD:</span>
                <span className="font-mono font-bold">{selectedReg.identityCardNumber || 'Chưa có'}</span>
              </div>
              <div>
                <span className="text-ink-muted block text-[11px]">Số điện thoại:</span>
                <span className="font-mono font-bold">{selectedReg.phone}</span>
              </div>
              <div>
                <span className="text-ink-muted block text-[11px]">Cân nặng / Chiều cao:</span>
                <span className="font-bold">{selectedReg.weight} kg / {selectedReg.height || '--'} cm</span>
              </div>
              <div>
                <span className="text-ink-muted block text-[11px]">Nhóm máu:</span>
                <span className="font-bold text-crimson">{selectedReg.confirmedBloodType || selectedReg.bloodType} {selectedReg.confirmedBloodType ? '(đã xác nhận)' : '(tự khai)'}</span>
              </div>
              <div>
                <span className="text-ink-muted block text-[11px]">Khung giờ:</span>
                <span className="font-bold">{selectedReg.preferredTimeSlot}</span>
              </div>
            </div>

            {/* Health Questionnaire Answers */}
            <div className="p-4 rounded-2xl border border-sand bg-porcelain space-y-2">
              <h4 className="font-bold text-ink text-xs uppercase tracking-wider">
                Kết Quả Khảo Sát Sức Khỏe Ban Đầu:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between p-2 rounded-lg bg-sand-light/40">
                  <span>Có sốt / cảm cúm:</span>
                  <strong className={selectedReg.healthInfo?.hasFever ? 'text-rose-600' : 'text-sage-deep'}>
                    {selectedReg.healthInfo?.hasFever ? 'Có' : 'Không'}
                  </strong>
                </div>

                <div className="flex justify-between p-2 rounded-lg bg-sand-light/40">
                  <span>Bệnh lý mãn tính:</span>
                  <strong className={selectedReg.healthInfo?.hasChronicDisease ? 'text-rose-600' : 'text-sage-deep'}>
                    {selectedReg.healthInfo?.hasChronicDisease ? 'Có' : 'Không'}
                  </strong>
                </div>

                <div className="flex justify-between p-2 rounded-lg bg-sand-light/40">
                  <span>Đang uống thuốc:</span>
                  <strong className={selectedReg.healthInfo?.takingMedication ? 'text-amber-700' : 'text-sage-deep'}>
                    {selectedReg.healthInfo?.takingMedication ? 'Có' : 'Không'}
                  </strong>
                </div>

                <div className="flex justify-between p-2 rounded-lg bg-sand-light/40">
                  <span>Phẫu thuật trong 6 tháng:</span>
                  <strong className={selectedReg.healthInfo?.recentSurgery ? 'text-amber-700' : 'text-sage-deep'}>
                    {selectedReg.healthInfo?.recentSurgery ? 'Có' : 'Không'}
                  </strong>
                </div>

                <div className="flex justify-between p-2 rounded-lg bg-sand-light/40">
                  <span>Xăm/xỏ khuyên 6 tháng:</span>
                  <strong className={selectedReg.healthInfo?.hasTattooOrPiercingIn6Months ? 'text-amber-700' : 'text-sage-deep'}>
                    {selectedReg.healthInfo?.hasTattooOrPiercingIn6Months ? 'Có' : 'Không'}
                  </strong>
                </div>

                <div className="flex justify-between p-2 rounded-lg bg-sand-light/40">
                  <span>Mang thai / Nuôi con bú:</span>
                  <strong className={selectedReg.healthInfo?.isPregnantOrNursing ? 'text-rose-600' : 'text-sage-deep'}>
                    {selectedReg.healthInfo?.isPregnantOrNursing ? 'Có' : 'Không'}
                  </strong>
                </div>
              </div>

              {selectedReg.screeningResult?.notes && (
                <div className="mt-3 p-3 rounded-xl bg-sand-light border border-sand text-xs">
                  <span className="font-bold text-ink">Ghi chú y tế tự động: </span>
                  <span className="text-ink-muted">{selectedReg.screeningResult?.notes}</span>
                </div>
              )}
            </div>

            {['admin', 'staff'].includes(user?.role) && selectedReg.donationStatus !== 'cancelled' && (
              <form noValidate className="p-4 sm:p-5 rounded-2xl border border-sand bg-porcelain space-y-4" onSubmit={(e) => {
                e.preventDefault();
                if (!volumeMl || !Number.isInteger(Number(volumeMl)) || Number(volumeMl) < 200 || Number(volumeMl) > 500 || !confirmedBloodType) {
                  toastError('Vui lòng nhập thể tích thực tế từ 200 đến 500 ml và nhóm máu đã xác nhận.');
                  return;
                }
                recordDonation.mutate();
              }}>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-crimson-light text-crimson"><Droplet className="h-5 w-5" /></span>
                  <div><p className="font-bold text-sm text-ink">Ghi nhận hiến máu</p><p className="mt-0.5 text-[11px] text-ink-muted">Cập nhật lượng máu và nhóm máu thực tế</p></div>
                </div>
                <fieldset disabled={recordDonation.isPending} className="grid grid-cols-1 sm:grid-cols-2 gap-5 disabled:opacity-60">
                  <div className="space-y-2.5">
                    <label htmlFor="donation-volume" className="block font-semibold text-ink">Lượng máu đã hiến</label>
                    <div className="relative">
                      <input id="donation-volume" type="text" inputMode="numeric" required autoComplete="off" maxLength={3} value={volumeMl} onChange={(e) => setVolumeMl(e.target.value.replace(/\D/g, '').slice(0, 3))} placeholder="Nhập lượng máu" aria-invalid={!!volumeMl && (Number(volumeMl) < 200 || Number(volumeMl) > 500)} aria-describedby="donation-volume-hint" className="w-full h-12 pl-3.5 pr-12 rounded-xl border border-sand bg-porcelain-card text-ink text-base font-semibold outline-none focus:outline-none focus-visible:outline-none focus:border-crimson focus:ring-0 focus:shadow-[0_0_0_2px_var(--color-crimson-light)] aria-[invalid=true]:border-crimson transition-colors" />
                      <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink-muted">ml</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2" role="group" aria-label="Chọn nhanh lượng máu">
                      {['250', '350', '450'].map(volume => <button key={volume} type="button" aria-pressed={volumeMl === volume} onClick={() => setVolumeMl(volume)} className={`rounded-lg border py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson ${volumeMl === volume ? 'border-crimson bg-crimson-light text-crimson' : 'border-sand bg-porcelain-card text-ink-muted hover:border-crimson hover:text-crimson'}`}>{volume} ml</button>)}
                    </div>
                    <p id="donation-volume-hint" className={`text-[11px] ${volumeMl && (Number(volumeMl) < 200 || Number(volumeMl) > 500) ? 'text-crimson' : 'text-ink-muted'}`}>Nhập số nguyên từ 200 đến 500 ml.</p>
                  </div>
                  <fieldset className="space-y-2.5">
                    <legend className="mb-2.5 font-semibold text-ink">Nhóm máu đã xác nhận</legend>
                    <div className="grid grid-cols-4 gap-2">
                      {BLOOD_TYPES.filter(type => type !== 'unknown').map(type => <button key={type} type="button" aria-pressed={confirmedBloodType === type} onClick={() => setConfirmedBloodType(type)} className={`h-11 rounded-xl border text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson ${confirmedBloodType === type ? 'border-crimson bg-crimson-light text-crimson' : 'border-sand bg-porcelain-card text-ink-light hover:border-crimson hover:text-crimson'}`}>{type}</button>)}
                    </div>
                    <p className="text-[11px] text-ink-muted">Chọn theo kết quả xác nhận tại điểm hiến.</p>
                  </fieldset>
                </fieldset>
                {selectedReg.donationStatus === 'donated' && <label className="block space-y-2"><span className="font-semibold">Lý do điều chỉnh kết quả</span><textarea value={resultReason} maxLength={500} onChange={e => setResultReason(e.target.value)} placeholder="Ví dụ: Điều chỉnh theo phiếu kết quả thực tế" className="w-full rounded-xl border border-sand bg-porcelain-card p-3 text-ink outline-none focus:border-crimson" /></label>}
                <div className="border-t border-sand pt-4 space-y-3">
                  <p className="flex items-start gap-2 text-[11px] leading-relaxed text-ink-muted"><ShieldCheck className="w-4 h-4 shrink-0 text-sage" />Chỉ xác nhận sau khi người hiến đã hoàn tất hiến máu và có kết quả thực tế.</p>
                  <Button className="w-full sm:w-auto" type="submit" leftIcon={<CheckCircle2 className="w-4 h-4" />} isLoading={recordDonation.isPending}>{selectedReg.donationStatus === 'donated' ? 'Lưu kết quả hiến máu' : 'Xác nhận đã hiến máu'}</Button>
                </div>
              </form>
            )}

            {!!selectedReg.resultHistory?.length && <div className="p-4 rounded-2xl border border-sand space-y-3"><h4 className="font-bold">Lịch sử ghi nhận / điều chỉnh</h4>{[...selectedReg.resultHistory].reverse().map((entry, index) => <div key={index} className="border-t border-sand pt-2 text-xs space-y-1"><p className="font-semibold">{entry.actorName || entry.actorRole} · {formatDate(entry.at)} {formatTime(entry.at)}</p><p>{entry.before?.donationVolume ?? '—'} ml / {entry.before?.confirmedBloodType || '—'} → {entry.after?.donationVolume ?? '—'} ml / {entry.after?.confirmedBloodType || '—'}</p><p className="text-ink-muted">{entry.reason}</p></div>)}</div>}
            {/* Check-in info if completed */}
            {selectedReg.checkIn?.status === 'checked_in' && (
              <div className="p-4 rounded-2xl bg-sage-light/60 border border-sage/40 space-y-1">
                <div className="flex items-center gap-2 font-bold text-sage-deep">
                  <CheckCircle2 className="w-4 h-4 text-sage" />
                  <span>{selectedReg.donationStatus === 'donated' ? 'Đã Hiến Máu' : 'Đã Điểm Danh Có Mặt'}</span>
                </div>
                <p className="text-[11px] text-ink">
                  Thời gian điểm danh: {formatDate(selectedReg.checkIn.checkInTime)} (
                  {formatTime(selectedReg.checkIn.checkInTime)}) | Lượng máu:{' '}
                  <strong>{selectedReg.donationStatus === 'donated' ? selectedReg.donationVolume ?? 'Chưa ghi nhận' : 0} ml</strong>
                </p>
                <p className="text-[11px] text-ink-muted">
                  Ghi chú điều dưỡng: {selectedReg.checkIn.nurseNotes}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RegistrationsManagement;
