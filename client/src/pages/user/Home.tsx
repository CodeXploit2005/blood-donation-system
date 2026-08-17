import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Heart,
  Calendar,
  ShieldCheck,
  Activity,
  ArrowRight,
  Droplet,
  Users,
  MapPin,
  Clock,
  Sparkles,
  QrCode,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import eventService from '../../services/eventService';
import EventCard from '../../components/event/EventCard';
import PulseDivider from '../../components/common/PulseDivider';
import Button from '../../components/common/Button';
import BloodDonationCriteriaModal from '../../components/registration/BloodDonationCriteriaModal';
import { CardSkeleton } from '../../components/common/Loading';

export const Home = () => {
  const [isCriteriaModalOpen, setIsCriteriaModalOpen] = useState(false);

  // Fetch open events
  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['home-events'],
    queryFn: () => eventService.getEvents({ status: 'open', limit: 3 }),
  });

  const featuredEvents = eventsData?.data || [];

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. HERO SECTION WITH SIGNATURE SVG PULSE-LINE PATH DRAWING */}
      <section className="relative pt-4 pb-12 sm:pb-20 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Text Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6"
          >
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-crimson-light dark:bg-[#2A181B] dark:border-crimson/50 border border-crimson/30 text-crimson dark:text-[#F7D4D8] text-xs font-bold shadow-sm">
              <Activity className="w-4 h-4 animate-pulse text-crimson dark:text-[#FFB0B8]" />
              <span>Nền Tảng Đăng Ký Hiến Máu Trực Tuyến Quốc Gia</span>
            </div>

            {/* Main Heading */}
            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold text-ink dark:text-white tracking-tight leading-[1.15]">
              Mỗi Nhịp Tim Sẻ Chia, <br className="hidden sm:block" />
              <span className="text-crimson underline decoration-sand dark:decoration-crimson/40 decoration-wavy decoration-from-font">
                Một Cuộc Đời
              </span>{' '}
              Ở Lại.
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-ink-light dark:text-gray-300 max-w-xl leading-relaxed">
              Hệ thống kết nối người tình nguyện hiến máu với các bệnh viện tuyến đầu. Đăng ký nhanh chóng, sàng lọc sức khỏe thông minh và cấp thẻ QR điểm danh tiện lợi tại sự kiện.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link to="/events">
                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={<Heart className="w-5 h-5 fill-current" />}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Tìm Đợt Hiến Máu Gần Bạn
                </Button>
              </Link>

              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsCriteriaModalOpen(true)}
                leftIcon={<ShieldCheck className="w-4 h-4" />}
              >
                Tiêu Chuẩn Người Hiến
              </Button>
            </div>

            {/* Quick stats micro pills */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-ink-muted dark:text-gray-400 border-t border-sand/60 dark:border-white/10">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sage" />
                <span>Bảo mật y tế theo chuẩn</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sage" />
                <span>Điểm danh 1-chạm bằng mã QR</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sage" />
                <span>Tiết kiệm 80% thời gian chờ đợi</span>
              </div>
            </div>
          </motion.div>

          {/* Right Signature SVG Heartbeat Canvas */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative p-8 sm:p-10 rounded-3xl bg-porcelain-card dark:bg-[#1A1E22] border border-sand dark:border-white/10 shadow-warm-lg overflow-hidden">
              {/* Top Card Badge */}
              <div className="flex items-center justify-between pb-6 border-b border-sand dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-crimson flex items-center justify-center text-white shadow-pulse-glow">
                    <Heart className="w-5 h-5 fill-current animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-ink dark:text-white text-base">Nhịp Đập Sự Sống</h3>
                    <p className="text-[11px] text-ink-muted dark:text-gray-400">Tín hiệu tiếp nhận máu trực tiếp</p>
                  </div>
                </div>
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-crimson opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-crimson"></span>
                </span>
              </div>

              {/* Dynamic SVG ECG Wave Canvas */}
              <div className="py-8 my-4 flex items-center justify-center">
                <svg
                  className="w-full text-crimson"
                  height="120"
                  viewBox="0 0 500 120"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0 60 H120 L135 40 L150 85 L170 10 L195 110 L215 50 L230 75 L245 60 H500"
                    stroke="#C4384A"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ecg-path-animation"
                  />
                </svg>
              </div>

              {/* Heart Pulse Visual Metrics Box */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-sand dark:border-white/10 text-xs">
                <div className="p-3.5 rounded-2xl bg-sand-light/60 dark:bg-[#23282E] border border-sand dark:border-white/10">
                  <span className="text-ink-muted dark:text-gray-400 text-[11px] block">Thể tích máu 1 lần hiến:</span>
                  <span className="font-mono text-base font-bold text-crimson">350 - 450 ml</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-sand-light/60 dark:bg-[#23282E] border border-sand dark:border-white/10">
                  <span className="text-ink-muted dark:text-gray-400 text-[11px] block">Số sinh mệnh cứu sống:</span>
                  <span className="font-mono text-base font-bold text-sage-deep dark:text-sage">Đến 3 người bệnh</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. STATS COUNT-UP STRIP (Synchronized Light & Dark) */}
      <section className="bg-porcelain-card dark:bg-[#1A1E22] rounded-3xl p-8 sm:p-12 shadow-warm-lg border border-sand dark:border-white/10 relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-crimson/5 blur-3xl pointer-events-none" />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center relative z-10">
          <div className="space-y-1">
            <p className="font-display text-3xl sm:text-4xl font-extrabold text-crimson tabular-nums">
              1,250+
            </p>
            <p className="text-xs text-ink-muted dark:text-gray-400 font-bold uppercase tracking-wider">
              Lượt Đăng Ký Tình Nguyện
            </p>
          </div>

          <div className="space-y-1">
            <p className="font-display text-3xl sm:text-4xl font-extrabold text-ink dark:text-white tabular-nums">
              437,500
            </p>
            <p className="text-xs text-ink-muted dark:text-gray-400 font-bold uppercase tracking-wider">
              ml Máu Đã Tiếp Nhận
            </p>
          </div>

          <div className="space-y-1">
            <p className="font-display text-3xl sm:text-4xl font-extrabold text-sage-deep dark:text-sage tabular-nums">
              100%
            </p>
            <p className="text-xs text-ink-muted dark:text-gray-400 font-bold uppercase tracking-wider">
              Sàng Lọc Y Tế An Toàn
            </p>
          </div>

          <div className="space-y-1">
            <p className="font-display text-3xl sm:text-4xl font-extrabold text-ink dark:text-white tabular-nums">
              45+
            </p>
            <p className="text-xs text-ink-muted dark:text-gray-400 font-bold uppercase tracking-wider">
              Bệnh Viện & Cơ Sở Tiếp Nhận
            </p>
          </div>
        </div>
      </section>

      {/* 3. FEATURED BLOOD DONATION EVENTS */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-crimson uppercase tracking-wider mb-2">
              <Calendar className="w-4 h-4" />
              <span>Sự Kiện Đang Mở Đăng Ký</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink dark:text-white">
              Các Đợt Hiến Máu Nổi Bật Gần Nhất
            </h2>
          </div>

          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-crimson hover:underline"
          >
            <span>Xem tất cả sự kiện</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredEvents.map((event, index) => (
              <EventCard key={event._id} event={event} index={index} />
            ))}
          </div>
        )}
      </section>

      <PulseDivider />

      {/* 4. 4-STEP STREAMLINED PROCESS */}
      <section className="space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-crimson uppercase tracking-wider">
            Quy Trình 4 Bước
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink dark:text-white">
            Tham Gia Hiến Máu Chỉ Với 4 Bước Đơn Giản
          </h2>
          <p className="text-xs sm:text-sm text-ink-muted dark:text-gray-400">
            Quy trình số hóa giúp bạn tiết kiệm thời gian chờ đợi và bảo đảm an toàn y tế tuyệt đối.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Chọn Đợt Hiến Máu',
              desc: 'Tìm kiếm đợt hiến máu có địa điểm và thời gian phù hợp với lịch trình của bạn.',
              icon: Calendar,
            },
            {
              step: '02',
              title: 'Sàng Lọc Trực Tuyến',
              desc: 'Điền thông tin và bảng câu hỏi y tế 3 bước để hệ thống đánh giá điều kiện ban đầu.',
              icon: ShieldCheck,
            },
            {
              step: '03',
              title: 'Nhận Thẻ QR Check-in',
              desc: 'Hệ thống tự động cấp thẻ QR thông minh lưu trên điện thoại để mang đến sự kiện.',
              icon: QrCode,
            },
            {
              step: '04',
              title: 'Điểm Danh & Tiếp Nhận',
              desc: 'Tình nguyện viên quét mã QR tại hiện trường, khám kiểm tra và tiến hành lấy máu an toàn.',
              icon: Heart,
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative p-6 rounded-3xl bg-porcelain-card dark:bg-[#1A1E22] border border-sand dark:border-white/10 shadow-warm hover:border-crimson/50 transition-all group"
              >
                <div className="text-xs font-mono font-bold text-crimson mb-3">
                  BƯỚC {item.step}
                </div>
                <div className="w-12 h-12 rounded-2xl bg-crimson-light dark:bg-crimson/20 text-crimson flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-display text-base font-bold text-ink dark:text-white mb-1.5">
                  {item.title}
                </h3>
                <p className="text-xs text-ink-muted dark:text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Criteria Modal */}
      <BloodDonationCriteriaModal
        isOpen={isCriteriaModalOpen}
        onClose={() => setIsCriteriaModalOpen(false)}
      />
    </div>
  );
};

export default Home;
