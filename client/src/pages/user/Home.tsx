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
  QrCode,
  CheckCircle2,
} from 'lucide-react';
import eventService from '../../services/eventService';
import EventCard from '../../components/event/EventCard';
import PulseDivider from '../../components/common/PulseDivider';
import Button from '../../components/common/Button';
import BloodDonationCriteriaModal from '../../components/registration/BloodDonationCriteriaModal';
import { CardSkeleton } from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';

export const Home = () => {
  const [isCriteriaModalOpen, setIsCriteriaModalOpen] = useState(false);

  // Fetch open events
  const { data: eventsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['home-events'],
    queryFn: () => eventService.getEvents({ status: 'open', limit: 3 }),
  });

  const featuredEvents = eventsData?.data || [];

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* HERO SECTION */}
      <section className="relative isolate overflow-hidden rounded-[2rem] border border-sand dark:border-white/10 bg-[#F4EDE5] dark:bg-[#181D20] shadow-warm-lg">
        <div className="relative h-64 sm:h-80 lg:absolute lg:inset-y-0 lg:right-0 lg:h-full lg:w-[58%]">
          <img
            src="/images/blood-donation-vietnam.jpg"
            alt="Bạn trẻ tham gia hiến máu tại Viện Huyết học – Truyền máu Trung ương, Việt Nam"
            width={1800}
            height={1200}
            fetchPriority="high"
            className="h-full w-full object-cover object-[40%_center] lg:object-[35%_center]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#F4EDE5] via-transparent to-transparent dark:from-[#181D20] lg:hidden" aria-hidden="true" />
          <div className="absolute inset-0 hidden lg:block bg-[linear-gradient(90deg,#F4EDE5_0%,rgba(244,237,229,0.96)_10%,rgba(244,237,229,0.55)_24%,transparent_42%)] dark:bg-[linear-gradient(90deg,#181D20_0%,rgba(24,29,32,0.96)_10%,rgba(24,29,32,0.55)_24%,transparent_42%)]" aria-hidden="true" />
        </div>
        <div className="relative z-10 px-6 pb-8 sm:px-10 sm:pb-10 lg:px-12 lg:py-16 xl:px-14 xl:py-20">
          {/* Banner content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl lg:w-[52%] space-y-6"
          >
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-crimson-light dark:bg-[#2A181B] dark:border-transparent border border-crimson/30 text-crimson dark:text-[#F7D4D8] text-xs font-bold shadow-sm dark:shadow-none">
              <Activity className="w-4 h-4 animate-pulse text-crimson dark:text-[#FFB0B8]" />
              <span>Nền Tảng Đăng Ký Hiến Máu Trực Tuyến Quốc Gia</span>
            </div>

            {/* Main Heading */}
            <h1 className="font-display text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-extrabold text-ink dark:text-white tracking-tight leading-[1.15]">
              Mỗi Nhịp Tim Sẻ Chia, <br className="hidden sm:block" />
              <span className="text-crimson">
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
            <div className="pt-4 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-ink-muted dark:text-gray-400 border-t border-sand/60 dark:border-white/[0.06]">
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


        </div>
      </section>

      <p className="!mt-3 text-right text-[10px] text-ink-muted dark:text-gray-400">
        Ảnh: Quang Hải / <a href="https://vienhuyethoc.vn/mua-he-se-chia-nguoi-dan-chung-tay-hien-mau/" target="_blank" rel="noreferrer" className="underline underline-offset-2">Viện Huyết học – Truyền máu Trung ương</a>
      </p>
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
        ) : isError ? (
          <EmptyState
            icon={Calendar}
            title="Không thể tải danh sách sự kiện"
            description="Máy chủ đang tạm thời không phản hồi. Vui lòng thử lại sau ít phút."
            actionText="Thử lại"
            onAction={() => refetch()}
          />
        ) : featuredEvents.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="Chưa có đợt hiến máu đang mở"
            description="Các sự kiện mới sẽ được cập nhật tại đây. Bạn có thể xem toàn bộ lịch hoạt động."
            actionText="Xem tất cả sự kiện"
            onAction={() => window.location.assign('/events')}
            actionVariant="outline"
          />
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
