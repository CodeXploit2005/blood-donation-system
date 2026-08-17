import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Building,
  Phone,
  Heart,
  ShieldCheck,
  ArrowLeft,
  Share2,
  AlertCircle,
} from 'lucide-react';
import eventService from '../../services/eventService';
import { formatDate, formatTime } from '../../utils/formatDate';
import { EVENT_STATUS_LABELS, EVENT_STATUS_COLORS } from '../../utils/constants';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import BloodDonationCriteriaModal from '../../components/registration/BloodDonationCriteriaModal';
import useAuth from '../../hooks/useAuth';

export const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isCriteriaOpen, setIsCriteriaOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['event-detail', id],
    queryFn: () => eventService.getEventById(id),
  });

  const event = data?.data;

  if (isLoading) {
    return <Loading fullScreen text="Đang tải thông tin đợt hiến máu..." />;
  }

  if (error || !event) {
    return (
      <div className="text-center py-16 space-y-4">
        <h3 className="font-display text-xl font-bold text-ink dark:text-white">Không tìm thấy đợt hiến máu</h3>
        <p className="text-xs text-ink-muted dark:text-gray-400">Sự kiện có thể đã bị xóa hoặc không tồn tại.</p>
        <Link to="/events">
          <Button variant="primary">Quay lại danh sách</Button>
        </Link>
      </div>
    );
  }

  const remainingSpots = Math.max(0, event.maxParticipants - (event.currentParticipants || 0));
  const percentFilled = Math.min(
    100,
    Math.round(((event.currentParticipants || 0) / event.maxParticipants) * 100)
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-ink-muted dark:text-gray-400 hover:text-crimson transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại</span>
      </button>

      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-[#121518] shadow-warm-lg">
        <div className="h-64 sm:h-80 w-full relative">
          <img
            src={
              event.imageUrl ||
              'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&q=80&w=1000'
            }
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D0F] via-[#121518]/65 to-[#121518]/10" />
        </div>

        {/* Content over banner */}
        <div className="absolute bottom-6 left-6 right-6 text-white space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full border backdrop-blur-md ${
                EVENT_STATUS_COLORS[event.status] || EVENT_STATUS_COLORS.open
              }`}
            >
              {EVENT_STATUS_LABELS[event.status] || event.status}
            </span>
            <span className="max-w-full truncate px-3 py-1 rounded-full bg-black/55 border border-white/25 text-white text-xs font-medium backdrop-blur-md">
              {event.organizer}
            </span>
          </div>

          <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
            {event.title}
          </h1>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Details & Description */}
        <div className="lg:col-span-8 space-y-6">
          {/* Key Facts Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-3xl bg-porcelain-card dark:bg-[#1A1E22] border border-sand dark:border-white/10 shadow-warm flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-crimson-light dark:bg-crimson/20 text-crimson flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-ink-muted dark:text-gray-400 font-medium">Thời gian diễn ra</p>
                <p className="text-sm font-bold text-ink dark:text-white">
                  {formatDate(event.startDate)} — {formatDate(event.endDate)}
                </p>
                <p className="text-xs text-ink-muted dark:text-gray-400 font-mono">
                  {formatTime(event.startDate)} - {formatTime(event.endDate)} hàng ngày
                </p>
              </div>
            </div>

            <div className="p-4 rounded-3xl bg-porcelain-card dark:bg-[#1A1E22] border border-sand dark:border-white/10 shadow-warm flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-crimson-light dark:bg-crimson/20 text-crimson flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-ink-muted dark:text-gray-400 font-medium">Địa điểm tổ chức</p>
                <p className="text-sm font-bold text-ink dark:text-white">{event.location}</p>
                <p className="text-xs text-ink-muted dark:text-gray-400">{event.addressDetails}</p>
              </div>
            </div>
          </div>

          {/* Detailed Description */}
          <div className="p-6 sm:p-8 rounded-3xl bg-porcelain-card dark:bg-[#1A1E22] border border-sand dark:border-white/10 shadow-warm space-y-4">
            <h3 className="font-display text-xl font-bold text-ink dark:text-white">Giới Thiệu Đợt Hiến Máu</h3>
            <p className="text-sm text-ink-light dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>

            <div className="pt-4 border-t border-sand/60 dark:border-white/10 space-y-3">
              <h4 className="font-display font-bold text-ink dark:text-white text-base">Thông Tin Liên Hệ & Đơn Vị Phụ Trách</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-ink-light dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-crimson" />
                  <span>Đơn vị: <strong className="text-ink dark:text-white">{event.organizer}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-crimson" />
                  <span>Hotline: <strong className="text-ink dark:text-white">{event.contactPhone || '1900 1234'}</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Registration Action Widget */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-24 p-6 rounded-3xl bg-porcelain-card dark:bg-[#1A1E22] border border-sand dark:border-white/10 shadow-warm-lg space-y-5">
            <div className="pb-4 border-b border-sand dark:border-white/10">
              <span className="text-xs text-ink-muted dark:text-gray-400 uppercase font-bold block">Tình Trạng Tiếp Nhận</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-mono text-2xl font-bold text-crimson">
                  Còn {remainingSpots} chỗ
                </span>
                <span className="text-xs text-ink-muted dark:text-gray-400 font-mono">
                  {event.currentParticipants || 0} / {event.maxParticipants}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 bg-sand-light dark:bg-[#23282E] rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-crimson to-crimson-deep rounded-full transition-all"
                  style={{ width: `${percentFilled}%` }}
                />
              </div>
            </div>

            {/* Direct CTA */}
            {event.status === 'open' ? (
              <Link to={`/register-donation/${event._id}`} className="block">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full shadow-pulse-glow"
                  leftIcon={<Heart className="w-5 h-5 fill-current" />}
                >
                  Đăng Ký Tham Gia Ngay
                </Button>
              </Link>
            ) : (
              <Button variant="dark" size="lg" className="w-full" disabled>
                {EVENT_STATUS_LABELS[event.status] || 'Đã đóng tiếp nhận'}
              </Button>
            )}

            <button
              onClick={() => setIsCriteriaOpen(true)}
              className="w-full py-2.5 text-xs font-semibold text-ink-muted dark:text-gray-300 hover:text-crimson border border-dashed border-sand dark:border-white/15 rounded-xl hover:border-crimson transition flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-sage" />
              <span>Xem tiêu chuẩn y tế người hiến</span>
            </button>

            <div className="p-3.5 rounded-2xl bg-sand-light/50 dark:bg-[#23282E] border border-sand dark:border-white/10 text-[11px] text-ink-muted dark:text-gray-400 space-y-1">
              <p className="font-semibold text-ink dark:text-white">Lưu ý quan trọng:</p>
              <p>• Mang theo CCCD / CMND khi đến sự kiện.</p>
              <p>• Ăn nhẹ trước khi hiến, không uống sữa đặc hoặc rượu bia.</p>
            </div>
          </div>
        </div>
      </div>

      <BloodDonationCriteriaModal
        isOpen={isCriteriaOpen}
        onClose={() => setIsCriteriaOpen(false)}
      />
    </div>
  );
};

export default EventDetail;
