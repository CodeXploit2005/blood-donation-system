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

export const RegistrationsManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialEventId = searchParams.get('eventId') || '';

  const [selectedEventId, setSelectedEventId] = useState(initialEventId);
  const [screeningFilter, setScreeningFilter] = useState('all');
  const [checkinFilter, setCheckinFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReg, setSelectedReg] = useState(null);

  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  // Fetch events list for dropdown
  const { data: eventsData } = useQuery({
    queryKey: ['admin-events-dropdown'],
    queryFn: () => eventService.getEvents({ limit: 100 }),
  });

  const allEvents = eventsData?.data || [];
  const activeEventId = selectedEventId || allEvents[0]?._id;

  // Fetch registrations for selected event
  const { data, isLoading } = useQuery({
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
              <option value="pending_review">Cần khám lại</option>
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
                        {reg.bloodType}
                      </span>
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
                          SCREENING_RESULT_COLORS[reg.screeningResult]
                        }`}
                      >
                        {SCREENING_RESULT_LABELS[reg.screeningResult]}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      {reg.checkIn?.status ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sage-light text-sage-deep">
                          Đã hiến {reg.checkIn.actualVolumeMl || 350}ml
                        </span>
                      ) : (
                        <span className="text-ink-muted text-[11px]">Chờ check-in</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedReg(reg)}
                        className="p-1.5 rounded-lg border border-sand hover:border-crimson hover:bg-crimson-light text-ink-muted hover:text-crimson transition-colors"
                        title="Xem phiếu sàng lọc chi tiết"
                      >
                        <Eye className="w-4 h-4" />
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
        title="Chi Tiết Tờ Khai Sàng Lọc Sức Khỏe"
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
                <span className="font-bold text-crimson">{selectedReg.bloodType}</span>
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

              {selectedReg.screeningNotes && (
                <div className="mt-3 p-3 rounded-xl bg-sand-light border border-sand text-xs">
                  <span className="font-bold text-ink">Ghi chú y tế tự động: </span>
                  <span className="text-ink-muted">{selectedReg.screeningNotes}</span>
                </div>
              )}
            </div>

            {/* Check-in info if completed */}
            {selectedReg.checkIn?.status && (
              <div className="p-4 rounded-2xl bg-sage-light/60 border border-sage/40 space-y-1">
                <div className="flex items-center gap-2 font-bold text-sage-deep">
                  <CheckCircle2 className="w-4 h-4 text-sage" />
                  <span>Đã Tiếp Nhận Hiến Máu Thành Công</span>
                </div>
                <p className="text-[11px] text-ink">
                  Thời gian điểm danh: {formatDate(selectedReg.checkIn.checkInTime)} (
                  {formatTime(selectedReg.checkIn.checkInTime)}) | Lượng máu:{' '}
                  <strong>{selectedReg.checkIn.actualVolumeMl || 350} ml</strong>
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
