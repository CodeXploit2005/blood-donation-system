import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  ScanLine,
  FileBarChart,
  Heart,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  UserCog,
  Sun,
  Moon,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import Button from '../components/common/Button';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Bảng Điều Khiển', to: '/admin/dashboard', icon: LayoutDashboard, end: true },
    { label: 'Quản Lý Đợt Hiến', to: '/admin/events', icon: Calendar },
    { label: 'Danh Sách Đăng Ký', to: '/admin/registrations', icon: Users },
    { label: 'Quét QR Điểm Danh', to: '/admin/checkin', icon: ScanLine, highlight: true },
    { label: 'Báo Cáo & Thống Kê', to: '/admin/reports', icon: FileBarChart },
    { label: 'Quản Lý Tài Khoản', to: '/admin/accounts', icon: UserCog },
  ];

  return (
    <div className="min-h-screen flex bg-porcelain dark:bg-[#121518] text-ink dark:text-porcelain">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-sand dark:border-white/10 bg-porcelain-card dark:bg-[#1A1E22] shadow-warm">
        {/* Brand Logo & Theme toggle */}
        <div className="p-5 border-b border-sand dark:border-white/10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-crimson flex items-center justify-center text-white shadow-sm">
              <Heart className="w-5 h-5 fill-current animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl font-bold text-ink dark:text-white leading-tight">
                Nhịp Sống
              </span>
              <span className="text-[10px] text-crimson font-bold uppercase tracking-wider">
                Admin Panel
              </span>
            </div>
          </Link>

          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg border border-sand dark:border-white/10 text-ink dark:text-amber-300 hover:text-crimson"
            title={isDark ? 'Giao diện sáng' : 'Giao diện tối'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav list */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? item.highlight
                        ? 'bg-crimson text-white shadow-pulse-glow'
                        : 'bg-sand-light dark:bg-white/10 text-crimson dark:text-white border border-sand dark:border-white/10'
                      : 'text-ink-light dark:text-gray-300 hover:text-crimson dark:hover:text-white hover:bg-sand-light/50 dark:hover:bg-white/5'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span className="flex-1">{item.label}</span>
                {item.highlight && (
                  <span className="w-2 h-2 rounded-full bg-crimson animate-ping" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-sand dark:border-white/10 bg-sand-light/30 dark:bg-[#161A1E]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-crimson-light dark:bg-crimson/30 text-crimson dark:text-white font-bold text-xs flex items-center justify-center border border-crimson/20">
              {user?.fullName?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-ink dark:text-white truncate">{user?.fullName}</p>
              <p className="text-[10px] text-ink-muted dark:text-gray-400 truncate">Quản trị viên hệ thống</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              to="/"
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-sand dark:border-white/10 text-[11px] font-semibold text-ink-light dark:text-gray-200 hover:text-crimson hover:bg-sand-light dark:hover:bg-white/5 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Xem Web</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center p-1.5 rounded-lg border border-sand dark:border-white/10 text-ink-muted hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              title="Đăng xuất"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Admin Header */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-porcelain-card dark:bg-[#1A1E22] border-b border-sand dark:border-white/10">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-crimson flex items-center justify-center text-white">
              <Heart className="w-4 h-4 fill-current" />
            </div>
            <span className="font-display font-bold text-base text-ink dark:text-white">Nhịp Sống Admin</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-ink dark:text-amber-300"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl text-ink dark:text-white hover:text-crimson transition"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </header>

        {/* Mobile Sidebar Dropdown */}
        {isSidebarOpen && (
          <div className="lg:hidden border-b border-sand dark:border-white/10 bg-porcelain-card dark:bg-[#1A1E22] p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive ? 'bg-crimson text-white' : 'text-ink-light dark:text-gray-200 hover:bg-sand-light dark:hover:bg-white/5'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
            <div className="pt-2 border-t border-sand dark:border-white/10 flex justify-between items-center">
              <Link to="/" className="text-xs text-crimson font-semibold">
                ← Về Trang Chủ
              </Link>
              <button
                onClick={handleLogout}
                className="text-xs text-rose-600 dark:text-rose-400 font-semibold"
              >
                Đăng Xuất
              </button>
            </div>
          </div>
        )}

        {/* Admin Content Area */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
