import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Phone, Mail, MapPin, Shield, Activity, Users } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-porcelain-card dark:bg-[#121518] text-ink dark:text-porcelain border-t border-sand dark:border-white/10 mt-auto transition-colors">
      {/* Top CTA Banner */}
      <div className="border-b border-sand/70 dark:border-white/10 py-8 bg-sand-light/50 dark:bg-[#1A1E22]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 rounded-2xl bg-crimson/15 dark:bg-crimson/25 border border-crimson/30 flex items-center justify-center text-crimson flex-shrink-0 shadow-sm">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-display text-lg sm:text-xl font-bold text-ink dark:text-white">
                Mỗi giọt máu cho đi — Một cuộc đời ở lại
              </h3>
              <p className="text-xs sm:text-sm text-ink-muted dark:text-gray-400 mt-0.5">
                Chỉ 450ml máu của bạn có thể cứu sống đến 3 người bệnh hiểm nghèo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/events"
              className="px-5 py-2.5 rounded-xl bg-crimson hover:bg-crimson-deep text-white text-xs sm:text-sm font-bold transition-all shadow-pulse-glow flex items-center gap-2"
            >
              <Heart className="w-4 h-4 fill-current" />
              Đăng Ký Hiến Máu Ngay
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-crimson flex items-center justify-center text-white shadow-sm">
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <span className="font-display text-2xl font-bold text-ink dark:text-white tracking-tight">
                Nhịp Sống
              </span>
            </div>
            <p className="text-xs text-ink-muted dark:text-gray-400 leading-relaxed">
              Nền tảng số hóa quy trình đăng ký, sàng lọc sức khỏe và quản lý đợt hiến máu nhân đạo, kết nối người tình nguyện và các cơ sở y tế trên toàn quốc.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="font-display text-xs font-bold text-crimson uppercase tracking-wider mb-4">
              Đường Dẫn Nhanh
            </h4>
            <ul className="space-y-2.5 text-xs text-ink-muted dark:text-gray-400">
              <li>
                <Link to="/" className="hover:text-crimson transition-colors">Trang Chủ</Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-crimson transition-colors">Danh Sách Đợt Hiến Máu</Link>
              </li>
              <li>
                <Link to="/my-registrations" className="hover:text-crimson transition-colors">Tra Cứu Lịch Sử Đăng Ký</Link>
              </li>
              <li>
                <Link to="/my-qr" className="hover:text-crimson transition-colors">Mã QR Check-in Cá Nhân</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Guidelines */}
          <div>
            <h4 className="font-display text-xs font-bold text-crimson uppercase tracking-wider mb-4">
              Quy Trình & Tiêu Chuẩn
            </h4>
            <ul className="space-y-2.5 text-xs text-ink-muted dark:text-gray-400">
              <li className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-sage" />
                <span>Tiêu chuẩn sức khỏe người hiến</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-sage" />
                <span>Khoảng cách giữa 2 lần hiến (12 tuần)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-sage" />
                <span>Lưu ý trước & sau khi hiến máu</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-sage" />
                <span>Chính sách bảo mật y tế</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Emergency Contacts */}
          <div>
            <h4 className="font-display text-xs font-bold text-crimson uppercase tracking-wider mb-4">
              Tổng Đài Hỗ Trợ
            </h4>
            <div className="space-y-3 text-xs text-ink-muted dark:text-gray-400">
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-crimson mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-ink dark:text-white">Hotline Hiến Máu Khẩn Cấp:</p>
                  <p className="text-crimson font-mono text-sm font-bold">1900 1234 / 0988 123 456</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-crimson mt-0.5 flex-shrink-0" />
                <p>hotro@nhipsong.vn</p>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-crimson mt-0.5 flex-shrink-0" />
                <p>Viện Huyết học - Truyền máu Trung ương, Cầu Giấy, Hà Nội</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-sand/70 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-muted dark:text-gray-400">
          <p>© {new Date().getFullYear()} Nhịp Sống — Nền Tảng Hiến Máu Tình Nguyện Quốc Gia.</p>
          <div className="flex items-center gap-1">
            <span>Thiết kế & phát triển vì sức khỏe cộng đồng</span>
            <Heart className="w-3.5 h-3.5 text-crimson fill-current inline ml-1" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
