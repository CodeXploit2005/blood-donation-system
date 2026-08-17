import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Calendar,
  Users,
  CheckCircle2,
  Droplet,
  ScanLine,
  FileBarChart,
  PlusCircle,
  Activity,
  ArrowUpRight,
  Filter,
  AlertTriangle,
  HeartHandshake,
  UserCheck,
  Percent,
} from 'lucide-react';
import reportService from '../../services/reportService';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import { formatDate, formatNumber } from '../../utils/formatDate';

const BLOOD_COLORS = {
  'O+': '#C4384A',
  'A+': '#7A1F2B',
  'B+': '#6E8B7A',
  'AB+': '#4E6A5B',
  'O-': '#D86372',
  'A-': '#E8DFD3',
  'B-': '#A3B899',
  'AB-': '#8E6870',
};

export const Dashboard = () => {
  const [bloodTypeView, setBloodTypeView] = useState('confirmed'); // 'confirmed' | 'declared'

  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: () => reportService.getDashboardReport(),
    refetchInterval: 1000 * 30, // refresh every 30s
  });

  const stats = data?.data || {
    totalEvents: 0,
    activeEvents: 0,
    totalRegistrations: 0,
    totalCheckedIn: 0,
    totalDonated: 0,
    totalVolumeCollectedMl: 0,
    completionRate: 0,
    funnel: {
      registered: 0,
      checkedIn: 0,
      screenedEligible: 0,
      screenedIneligible: 0,
      donated: 0,
      noShow: 0,
      conversionRate: 0,
      attendanceRate: 0,
    },
    confirmedBloodTypeDistribution: [],
    declaredBloodTypeDistribution: [],
    eventStats: [],
    recentRegistrations: [],
  };

  if (isLoading) {
    return <Loading fullScreen text="Đang tải dữ liệu báo cáo thống kê..." />;
  }

  const activeBloodList =
    bloodTypeView === 'confirmed'
      ? stats.confirmedBloodTypeDistribution || []
      : stats.declaredBloodTypeDistribution || [];

  const bloodTypeChartData = activeBloodList.filter((b) => b.count > 0);

  return (
    <div className="space-y-8">
      {/* Header with quick action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-crimson uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4" />
            <span>Trung Tâm Giám Sát & Điều Hành</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-ink dark:text-porcelain">
            Bảng Điều Khiển Quản Trị
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/admin/checkin">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<ScanLine className="w-4 h-4" />}
            >
              Mở Quét QR Điểm Danh
            </Button>
          </Link>
          <Link to="/admin/events">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              Tạo Đợt Hiến Mới
            </Button>
          </Link>
        </div>
      </div>

      {/* 5 Distinct KPI Cards with Tabular-nums */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Total Events */}
        <div className="p-5 rounded-3xl bg-porcelain-card dark:bg-ink-card border border-sand dark:border-sand/20 shadow-warm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
              Đợt Hiến Máu
            </span>
            <div className="w-8 h-8 rounded-xl bg-crimson-light dark:bg-crimson/20 text-crimson flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="font-display text-2xl font-bold text-ink dark:text-porcelain tabular-nums">
              {formatNumber(stats.totalEvents)}
            </p>
            <p className="text-[11px] text-sage-deep dark:text-sage font-semibold mt-0.5">
              {stats.activeEvents} đợt đang mở
            </p>
          </div>
        </div>

        {/* KPI 2: Total Registrations */}
        <div className="p-5 rounded-3xl bg-porcelain-card dark:bg-ink-card border border-sand dark:border-sand/20 shadow-warm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
              Người Đăng Ký
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="font-display text-2xl font-bold text-ink dark:text-porcelain tabular-nums">
              {formatNumber(stats.totalRegistrations)}
            </p>
            <p className="text-[11px] text-ink-muted mt-0.5">Đơn đăng ký online</p>
          </div>
        </div>

        {/* KPI 3: Checked In Attendees */}
        <div className="p-5 rounded-3xl bg-porcelain-card dark:bg-ink-card border border-sand dark:border-sand/20 shadow-warm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
              Đã Điểm Danh
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="font-display text-2xl font-bold text-amber-700 dark:text-amber-400 tabular-nums">
              {formatNumber(stats.totalCheckedIn)}
            </p>
            <p className="text-[11px] text-ink-muted mt-0.5">
              Có mặt tại sự kiện ({stats.funnel?.attendanceRate || 0}%)
            </p>
          </div>
        </div>

        {/* KPI 4: Actually Donated */}
        <div className="p-5 rounded-3xl bg-porcelain-card dark:bg-ink-card border border-sand dark:border-sand/20 shadow-warm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
              Đã Hiến Thành Công
            </span>
            <div className="w-8 h-8 rounded-xl bg-sage-light dark:bg-sage/20 text-sage flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="font-display text-2xl font-bold text-sage-deep dark:text-sage tabular-nums">
              {formatNumber(stats.totalDonated)}
            </p>
            <p className="text-[11px] text-sage-deep dark:text-sage font-semibold mt-0.5">
              Tỷ lệ hoàn tất: {stats.completionRate}%
            </p>
          </div>
        </div>

        {/* KPI 5: Total Volume (ml) */}
        <div className="p-5 rounded-3xl bg-porcelain-card dark:bg-ink-card border border-sand dark:border-sand/20 shadow-warm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
              Máu Đã Tiếp Nhận
            </span>
            <div className="w-8 h-8 rounded-xl bg-crimson-light dark:bg-crimson/20 text-crimson flex items-center justify-center">
              <Droplet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="font-display text-2xl font-bold text-crimson tabular-nums">
              {formatNumber(stats.totalVolumeCollectedMl)}{' '}
              <span className="text-xs font-sans font-normal text-ink-muted">ml</span>
            </p>
            <p className="text-[11px] text-ink-muted mt-0.5">
              ~{(stats.totalVolumeCollectedMl / 1000).toFixed(1)} Lít máu thực tế
            </p>
          </div>
        </div>
      </div>

      {/* Funnel Analytics Strip (Phễu Tiếp Nhận & Tỷ Lệ Hao Hụt) */}
      <div className="p-6 rounded-3xl bg-porcelain-card dark:bg-ink-card border border-sand dark:border-sand/20 shadow-warm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-base font-bold text-ink dark:text-porcelain flex items-center gap-2">
              <Filter className="w-4 h-4 text-crimson" />
              <span>Phễu Chuyển Đổi Quy Trình Hiến Máu (Funnel Analytics)</span>
            </h3>
            <p className="text-xs text-ink-muted">
              Theo dõi tỷ lệ hao hụt từ lúc đăng ký trực tuyến đến khi tiếp nhận máu thực tế
            </p>
          </div>
          <div className="text-xs font-semibold px-3 py-1 rounded-full bg-sand-light dark:bg-ink-deep text-ink-light dark:text-porcelain self-start">
            Hiệu suất chuyển đổi: <strong>{stats.funnel?.conversionRate || 0}%</strong>
          </div>
        </div>

        {/* Funnel Stages */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          {/* Stage 1 */}
          <div className="p-3.5 rounded-2xl bg-sand-light/60 dark:bg-ink-deep border border-sand dark:border-sand/20 space-y-1">
            <span className="text-[10px] uppercase font-bold text-ink-muted">1. Đăng ký online</span>
            <p className="font-mono text-xl font-bold text-ink dark:text-porcelain">{stats.funnel?.registered || 0}</p>
            <span className="text-[10px] text-ink-muted">100% người dùng</span>
          </div>

          {/* Stage 2 */}
          <div className="p-3.5 rounded-2xl bg-sand-light/60 dark:bg-ink-deep border border-sand dark:border-sand/20 space-y-1">
            <span className="text-[10px] uppercase font-bold text-ink-muted">2. Quét QR có mặt</span>
            <p className="font-mono text-xl font-bold text-amber-600">{stats.funnel?.checkedIn || 0}</p>
            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold">
              {stats.funnel?.attendanceRate || 0}% có mặt
            </span>
          </div>

          {/* Stage 3 */}
          <div className="p-3.5 rounded-2xl bg-sand-light/60 dark:bg-ink-deep border border-sand dark:border-sand/20 space-y-1">
            <span className="text-[10px] uppercase font-bold text-ink-muted">3. Khám Đủ Điều Kiện</span>
            <p className="font-mono text-xl font-bold text-blue-600">{stats.funnel?.screenedEligible || 0}</p>
            <span className="text-[10px] text-ink-muted">Bác sĩ thông qua</span>
          </div>

          {/* Stage 4 */}
          <div className="p-3.5 rounded-2xl bg-sage-light/60 dark:bg-sage/20 border border-sage/40 space-y-1">
            <span className="text-[10px] uppercase font-bold text-sage-deep dark:text-sage">4. Đã Hiến Máu</span>
            <p className="font-mono text-xl font-bold text-sage-deep dark:text-sage">{stats.funnel?.donated || 0}</p>
            <span className="text-[10px] text-sage-deep dark:text-sage font-bold">
              {stats.funnel?.conversionRate || 0}% hoàn thành
            </span>
          </div>

          {/* Stage 5: Ineligible & No show */}
          <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 space-y-1">
            <span className="text-[10px] uppercase font-bold text-rose-700 dark:text-rose-400">5. Tạm hoãn / Vắng</span>
            <p className="font-mono text-xl font-bold text-rose-600">
              {(stats.funnel?.screenedIneligible || 0) + (stats.funnel?.noShow || 0)}
            </p>
            <span className="text-[10px] text-rose-600">Hao hụt tại quầy</span>
          </div>
        </div>
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* BarChart: Event Target vs Registered vs Checked In vs Donated */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-porcelain-card dark:bg-ink-card border border-sand dark:border-sand/20 shadow-warm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-ink dark:text-porcelain">
                Tiến Độ & Tỷ Lệ Tiếp Nhận Từng Đợt Hiến Máu
              </h3>
              <p className="text-xs text-ink-muted">
                So sánh số lượng chỉ tiêu, đăng ký trực tuyến, điểm danh và đã lấy máu
              </p>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.eventStats} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8DFD3" opacity={0.4} vertical={false} />
                <XAxis dataKey="title" tick={{ fontSize: 11, fill: '#636C78' }} />
                <YAxis tick={{ fontSize: 11, fill: '#636C78' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E2226',
                    color: '#F7F3EF',
                    borderRadius: '12px',
                    borderColor: '#C4384A',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="target" name="Chỉ tiêu" fill="#D5C8B7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="registered" name="Đã đăng ký" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="checkedIn" name="Đã điểm danh" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="donated" name="Đã hiến máu" fill="#6E8B7A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PieChart: Blood Type Distribution & Rare Warning */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-porcelain-card dark:bg-ink-card border border-sand dark:border-sand/20 shadow-warm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-ink dark:text-porcelain">Phân Bố Nhóm Máu</h3>
              {/* View Switcher: Confirmed vs Declared */}
              <div className="inline-flex rounded-lg p-0.5 bg-sand-light dark:bg-ink-deep border border-sand dark:border-sand/20 text-[10px]">
                <button
                  onClick={() => setBloodTypeView('confirmed')}
                  className={`px-2 py-1 rounded-md font-bold transition-colors ${
                    bloodTypeView === 'confirmed'
                      ? 'bg-crimson text-white shadow-sm'
                      : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  Xác nhận
                </button>
                <button
                  onClick={() => setBloodTypeView('declared')}
                  className={`px-2 py-1 rounded-md font-bold transition-colors ${
                    bloodTypeView === 'declared'
                      ? 'bg-crimson text-white shadow-sm'
                      : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  Tự khai
                </button>
              </div>
            </div>
            <p className="text-[11px] text-ink-muted mt-1">
              {bloodTypeView === 'confirmed'
                ? 'Nhóm máu đã xác nhận qua xét nghiệm tại quầy'
                : 'Nhóm máu tự khai của người đăng ký (dự đoán)'}
            </p>
          </div>

          <div className="h-48 w-full relative flex items-center justify-center">
            {bloodTypeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bloodTypeChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="name"
                  >
                    {bloodTypeChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={BLOOD_COLORS[entry.name] || '#C4384A'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E2226',
                      color: '#F7F3EF',
                      borderRadius: '12px',
                      border: '1px solid #64748B',
                      fontSize: '12px',
                    }}
                    labelStyle={{ color: '#F7F3EF', fontWeight: 700 }}
                    itemStyle={{ color: '#F7F3EF', fontWeight: 600 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-ink-muted text-center">Chưa có dữ liệu nhóm máu đã hiến</p>
            )}
          </div>

          {/* Blood Type Grid Cards with Rare Warning Badges */}
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-sand dark:border-sand/20 text-center text-xs">
            {activeBloodList.slice(0, 8).map((b) => (
              <div
                key={b.name}
                className={`p-2 rounded-xl border transition-all ${
                  b.isRareWarning
                    ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-300 ring-1 ring-amber-400/50'
                    : 'bg-sand-light/50 dark:bg-ink-deep border-sand dark:border-sand/20 text-ink dark:text-porcelain'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <span className="font-bold text-crimson block text-xs">{b.name}</span>
                  {b.isRareWarning && (
                    <AlertTriangle className="w-3 h-3 text-amber-600 animate-pulse" aria-label="Cảnh báo nhóm máu hiếm cần vận động thêm" />
                  )}
                </div>
                <span className="font-mono text-xs font-bold block mt-0.5">{b.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Registrations Feed */}
      <div className="p-6 rounded-3xl bg-porcelain-card dark:bg-ink-card border border-sand dark:border-sand/20 shadow-warm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-sand/60 dark:border-sand/20">
          <div>
            <h3 className="font-display text-base font-bold text-ink dark:text-porcelain">
              Lượt Đăng Ký Mới Nhất
            </h3>
            <p className="text-xs text-ink-muted">Người hiến máu vừa đăng ký trực tuyến</p>
          </div>

          <Link
            to="/admin/registrations"
            className="text-xs font-bold text-crimson hover:underline flex items-center gap-1"
          >
            <span>Xem tất cả đơn</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sand-light/50 dark:bg-ink-deep text-ink-muted uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3 font-bold">Mã Đơn</th>
                <th className="px-4 py-3 font-bold">Người Hiến Máu</th>
                <th className="px-4 py-3 font-bold">Đợt Hiến Máu</th>
                <th className="px-3 py-3 font-bold text-center">Nhóm Máu</th>
                <th className="px-4 py-3 font-bold text-center">Trạng Thái</th>
                <th className="px-4 py-3 font-bold text-right">Ngày Đăng Ký</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand/50 dark:divide-sand/20">
              {stats.recentRegistrations.map((reg) => (
                <tr key={reg._id} className="hover:bg-sand-light/30 dark:hover:bg-sand-light/10 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-crimson">
                    {reg.qrCode?.code || reg._id.substring(0, 8)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-bold text-ink dark:text-porcelain">{reg.fullName}</span>
                      <span className="text-[11px] text-ink-muted">{reg.phone}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink dark:text-porcelain max-w-[200px] truncate">
                    {reg.eventId?.title || 'Sự kiện'}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className="inline-block px-2 py-0.5 rounded-full font-bold text-[11px] bg-crimson-light dark:bg-crimson/20 text-crimson">
                      {reg.confirmedBloodType || reg.bloodType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {reg.donationStatus === 'donated' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sage-light dark:bg-sage/20 text-sage-deep dark:text-sage">
                        Đã hiến ({reg.donationVolume || 350}ml)
                      </span>
                    ) : reg.checkIn?.status === 'checked_in' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/30 text-amber-700">
                        Đã điểm danh
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 dark:bg-blue-950/30 text-blue-700">
                        Đã đăng ký
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-ink-muted">
                    {formatDate(reg.registeredAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
