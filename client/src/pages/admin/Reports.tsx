import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FileBarChart,
  Download,
  Calendar,
  Users,
  CheckCircle2,
  Droplet,
  Percent,
  MapPin,
  ExternalLink,
  Filter,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';
import reportService from '../../services/reportService';
import eventService from '../../services/eventService';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import { formatDate, formatNumber } from '../../utils/formatDate';

const RARE_TYPES = ['AB-', 'O-', 'B-', 'A-'];

export const Reports = () => {
  const [selectedEventId, setSelectedEventId] = useState('');

  // Fetch events list for dropdown
  const { data: eventsData, isLoading: isEventsLoading } = useQuery({
    queryKey: ['admin-events-reports-dropdown'],
    queryFn: () => eventService.getEvents({ limit: 100 }),
  });

  const events = eventsData?.data || [];
  const activeEventId = selectedEventId || events[0]?._id;

  // Fetch event report data
  const { data: reportData, isLoading: isReportLoading } = useQuery({
    queryKey: ['admin-event-report', activeEventId],
    queryFn: () => reportService.getEventReport(activeEventId),
    enabled: !!activeEventId,
  });

  const report = reportData?.data;

  const handleExportCSV = () => {
    if (!activeEventId) return;
    window.location.href = reportService.exportEventReportCSVUrl(activeEventId);
  };

  if (isEventsLoading) {
    return <Loading fullScreen text="Đang tải danh sách sự kiện..." />;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-crimson uppercase tracking-wider mb-1">
            <FileBarChart className="w-4 h-4" />
            <span>Tổng Hợp Số Liệu & Báo Cáo Y Tế</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink dark:text-porcelain">
            Báo Cáo & Thống Kê Sự Kiện
          </h1>
        </div>

        <Button
          variant="primary"
          onClick={handleExportCSV}
          disabled={!activeEventId}
          leftIcon={<Download className="w-4 h-4" />}
        >
          Xuất Báo Cáo (CSV / Excel)
        </Button>
      </div>

      {/* Event Selection Bar */}
      <div className="p-4 rounded-3xl bg-porcelain-card dark:bg-ink-card border border-sand dark:border-sand/20 shadow-warm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <label className="text-xs font-bold text-ink dark:text-porcelain uppercase tracking-wider">
          Chọn Đợt Hiến Máu Cần Xem Báo Cáo:
        </label>
        <select
          value={activeEventId || ''}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="px-3.5 py-2 rounded-xl border border-sand dark:border-sand/20 bg-porcelain dark:bg-ink-deep text-xs font-bold text-ink dark:text-porcelain outline-none focus:border-crimson sm:w-96"
        >
          {events.map((evt) => (
            <option key={evt._id} value={evt._id}>
              {evt.title} ({formatDate(evt.startDate)})
            </option>
          ))}
        </select>
      </div>

      {/* Report Content */}
      {isReportLoading ? (
        <Loading text="Đang tính toán số liệu báo cáo..." />
      ) : !report ? (
        <div className="p-8 text-center text-xs text-ink-muted">Chưa có dữ liệu báo cáo.</div>
      ) : (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-porcelain-card dark:bg-ink-card border border-sand dark:border-sand/20 shadow-warm space-y-1">
              <span className="text-[11px] text-ink-muted uppercase font-bold">Người Đăng Ký</span>
              <p className="font-display text-2xl font-bold text-ink dark:text-porcelain tabular-nums">
                {report.totalRegistrations}
              </p>
              <p className="text-[11px] text-ink-muted">Chỉ tiêu: {report.event?.maxParticipants}</p>
            </div>

            <div className="p-5 rounded-3xl bg-porcelain-card dark:bg-ink-card border border-sand dark:border-sand/20 shadow-warm space-y-1">
              <span className="text-[11px] text-ink-muted uppercase font-bold">Đã Điểm Danh</span>
              <p className="font-display text-2xl font-bold text-amber-600 tabular-nums">
                {report.totalCheckedIn}
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold">
                Có mặt: {report.checkInRate}%
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-porcelain-card dark:bg-ink-card border border-sand dark:border-sand/20 shadow-warm space-y-1">
              <span className="text-[11px] text-ink-muted uppercase font-bold">Đã Hiến Máu</span>
              <p className="font-display text-2xl font-bold text-sage-deep dark:text-sage tabular-nums">
                {report.totalDonated}
              </p>
              <p className="text-[11px] text-sage-deep dark:text-sage font-semibold">
                Hiệu suất: {report.conversionRate}%
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-porcelain-card dark:bg-ink-card border border-sand dark:border-sand/20 shadow-warm space-y-1">
              <span className="text-[11px] text-ink-muted uppercase font-bold">Thể Tích Máu Đã Thu</span>
              <p className="font-display text-2xl font-bold text-crimson tabular-nums">
                {formatNumber(report.totalVolumeMl)} <span className="text-xs font-normal">ml</span>
              </p>
              <p className="text-[11px] text-ink-muted">
                ~{(report.totalVolumeMl / 1000).toFixed(1)} Lít máu thực tế
              </p>
            </div>
          </div>

          {/* Event Funnel Strip */}
          {report.funnel && (
            <div className="p-6 rounded-3xl bg-porcelain-card dark:bg-ink-card border border-sand dark:border-sand/20 shadow-warm space-y-3">
              <h3 className="font-display text-base font-bold text-ink dark:text-porcelain flex items-center gap-2">
                <Filter className="w-4 h-4 text-crimson" />
                <span>Phễu Quy Trình Tiếp Nhận Đợt Này</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
                <div className="p-3 rounded-2xl bg-sand-light/50 dark:bg-ink-deep border border-sand dark:border-sand/20 text-center">
                  <span className="text-[10px] text-ink-muted uppercase font-bold block">Đăng ký online</span>
                  <span className="font-mono text-lg font-bold text-ink dark:text-porcelain">{report.funnel.registered}</span>
                </div>
                <div className="p-3 rounded-2xl bg-sand-light/50 dark:bg-ink-deep border border-sand dark:border-sand/20 text-center">
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 uppercase font-bold block">Điểm danh</span>
                  <span className="font-mono text-lg font-bold text-amber-600">{report.funnel.checkedIn}</span>
                </div>
                <div className="p-3 rounded-2xl bg-sand-light/50 dark:bg-ink-deep border border-sand dark:border-sand/20 text-center">
                  <span className="text-[10px] text-blue-700 dark:text-blue-400 uppercase font-bold block">Đủ ĐK y tế</span>
                  <span className="font-mono text-lg font-bold text-blue-600">{report.funnel.screenedEligible}</span>
                </div>
                <div className="p-3 rounded-2xl bg-sage-light/60 dark:bg-sage/20 border border-sage/40 text-center">
                  <span className="text-[10px] text-sage-deep dark:text-sage uppercase font-bold block">Đã lấy máu</span>
                  <span className="font-mono text-lg font-bold text-sage-deep dark:text-sage">{report.funnel.donated}</span>
                </div>
                <div className="p-3 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-center">
                  <span className="text-[10px] text-rose-700 dark:text-rose-400 uppercase font-bold block">Loại / Không đến</span>
                  <span className="font-mono text-lg font-bold text-rose-600">{report.funnel.screenedIneligible + report.funnel.noShow}</span>
                </div>
              </div>
            </div>
          )}

          {/* Blood Types Distribution for this Event */}
          <div className="p-6 rounded-3xl bg-porcelain-card dark:bg-ink-card border border-sand dark:border-sand/20 shadow-warm space-y-4">
            <h3 className="font-display text-base font-bold text-ink dark:text-porcelain">
              Phân Bố Nhóm Máu Đã Tiếp Nhận Trong Sự Kiện
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {report.bloodTypeStats?.map((b) => {
                const isRare = RARE_TYPES.includes(b._id) && b.count < 2;
                return (
                  <div
                    key={b._id}
                    className={`p-3.5 rounded-2xl border text-center space-y-1 ${
                      isRare
                        ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-300'
                        : 'bg-sand-light/60 dark:bg-ink-deep border-sand dark:border-sand/20 text-ink dark:text-porcelain'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span className="font-bold text-crimson text-sm block">Nhóm {b._id}</span>
                      {isRare && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                    </div>
                    <span className="font-mono text-xl font-bold text-ink dark:text-porcelain">{b.count}</span>
                    <span className="text-[10px] text-ink-muted block">ca hiến thành công</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Donor Attendees Table Preview */}
          <div className="p-6 rounded-3xl bg-porcelain-card dark:bg-ink-card border border-sand dark:border-sand/20 shadow-warm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-ink dark:text-porcelain">
                  Danh Sách Người Tham Gia ({report.registrations?.length || 0} người)
                </h3>
                <p className="text-xs text-ink-muted">
                  Bảng chi tiết bao gồm nhóm máu xác nhận, lượng máu và mã định danh
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-sand-light/70 dark:bg-ink-deep text-ink-muted uppercase tracking-wider text-[11px] border-b border-sand dark:border-sand/20">
                  <tr>
                    <th className="px-4 py-3 font-bold">Mã Đơn</th>
                    <th className="px-4 py-3 font-bold">Họ Và Tên</th>
                    <th className="px-3 py-3 font-bold text-center">Nhóm Máu</th>
                    <th className="px-4 py-3 font-bold text-center">Cân Nặng</th>
                    <th className="px-4 py-3 font-bold text-center">Sàng Lọc</th>
                    <th className="px-4 py-3 font-bold text-center">Trạng Thái</th>
                    <th className="px-4 py-3 font-bold text-right">Lượng Máu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand/50 dark:divide-sand/20">
                  {report.registrations?.slice(0, 10).map((r) => (
                    <tr key={r._id} className="hover:bg-sand-light/30 dark:hover:bg-sand-light/10 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-crimson">
                        {r.qrCode?.code}
                      </td>
                      <td className="px-4 py-3 font-bold text-ink dark:text-porcelain">{r.fullName}</td>
                      <td className="px-3 py-3 text-center font-bold text-crimson">
                        {r.confirmedBloodType || r.bloodType}
                      </td>
                      <td className="px-4 py-3 text-center font-mono">{r.weight} kg</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sage-light dark:bg-sage/20 text-sage-deep dark:text-sage">
                          {r.screeningResult?.doctorConclusion === 'eligible' ? 'Đủ ĐK' : 'Cần khám lại'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {r.donationStatus === 'donated' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sage-light dark:bg-sage/20 text-sage-deep dark:text-sage">
                            Đã hiến
                          </span>
                        ) : r.checkIn?.status === 'checked_in' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/30 text-amber-700">
                            Đã điểm danh
                          </span>
                        ) : (
                          <span className="text-ink-muted text-[11px]">Chưa điểm danh</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-sage-deep dark:text-sage">
                        {r.donationStatus === 'donated' ? `${r.donationVolume || 350} ml` : '--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {report.registrations?.length > 10 && (
              <p className="text-xs text-ink-muted text-center pt-2">
                Đang hiển thị 10 / {report.registrations.length} người. Xuất file CSV để xem đầy đủ toàn bộ danh sách.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
