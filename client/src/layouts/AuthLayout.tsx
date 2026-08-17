import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Heart, Activity, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const AuthLayout = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-porcelain dark:bg-[#121518] text-ink dark:text-[#F7F3EF] px-4 py-8 relative overflow-hidden transition-colors">
      {/* Theme Toggle Floating Button */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-sand dark:border-white/15 bg-porcelain-card dark:bg-[#1E232A] text-ink dark:text-amber-300 shadow-sm"
          title={isDark ? 'Giao diện sáng' : 'Giao diện tối'}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-ink-light" />}
        </button>
      </div>

      {/* Background Decorative ECG Line */}
      <div className="absolute inset-0 pointer-events-none opacity-15 flex items-center justify-center">
        <svg
          className="w-full max-w-4xl text-crimson"
          height="120"
          viewBox="0 0 1000 120"
          fill="none"
        >
          <path
            d="M0 60 H400 L420 10 L440 110 L460 20 L480 90 L500 60 H1000"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ecg-path-animation"
          />
        </svg>
      </div>

      {/* Brand Header */}
      <div className="text-center mb-6 relative z-10">
        <Link to="/" className="inline-flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-crimson flex items-center justify-center text-white shadow-pulse-glow group-hover:scale-105 transition-transform">
            <Heart className="w-6 h-6 fill-current animate-pulse" />
          </div>
          <div className="text-left">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink dark:text-white tracking-tight">
              Nhịp Sống
            </h1>
            <p className="text-[11px] font-bold text-crimson uppercase tracking-wider">
              Nền Tảng Hiến Máu Tình Nguyện
            </p>
          </div>
        </Link>
      </div>

      {/* Main Form Box */}
      <div className="w-full max-w-md relative z-10">
        <Outlet />
      </div>

      {/* Footer text */}
      <div className="mt-8 text-center text-xs text-ink-muted dark:text-gray-400 relative z-10">
        <p>© {new Date().getFullYear()} Nhịp Sống — Trao Giọt Máu Đào, Gửi Trọn Yêu Thương</p>
      </div>
    </div>
  );
};

export default AuthLayout;
