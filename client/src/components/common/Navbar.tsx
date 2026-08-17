import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Calendar,
  QrCode,
  ClipboardList,
  LayoutDashboard,
  ShieldCheck,
  User,
  LogOut,
  Menu,
  X,
  PlusCircle,
  ScanLine,
  Sun,
  Moon,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import Button from './Button';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const navLinkClasses = ({ isActive }) =>
    `relative px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all rounded-xl ${
      isActive
        ? 'text-crimson dark:text-white font-bold bg-crimson-light/80 dark:bg-crimson/30 border border-crimson/20 dark:border-crimson/50 shadow-sm'
        : 'text-ink/80 dark:text-gray-200 hover:text-crimson dark:hover:text-white hover:bg-crimson-light/40 dark:hover:bg-white/10'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-sand/80 dark:border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-crimson flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5 fill-current animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl sm:text-2xl font-bold tracking-tight text-ink dark:text-white group-hover:text-crimson transition-colors">
                Nhịp Sống
              </span>
              <span className="text-[10px] text-ink-muted dark:text-gray-400 tracking-wider uppercase font-semibold -mt-1">
                Hiến Máu Nhân Đạo
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-2">
            <NavLink to="/" className={navLinkClasses} end>
              Trang Chủ
            </NavLink>
            <NavLink to="/events" className={navLinkClasses}>
              Đợt Hiến Máu
            </NavLink>

            {isAuthenticated && !isAdmin && (
              <>
                <NavLink to="/my-registrations" className={navLinkClasses}>
                  Đăng Ký Của Tôi
                </NavLink>
                <NavLink to="/my-qr" className={navLinkClasses}>
                  Thẻ QR
                </NavLink>
              </>
            )}

            {isAdmin && (
              <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-sand dark:border-white/15">
                <NavLink to="/admin/dashboard" className={navLinkClasses}>
                  Dashboard
                </NavLink>
                <NavLink to="/admin/events" className={navLinkClasses}>
                  Quản Lý Đợt
                </NavLink>
                <NavLink to="/admin/registrations" className={navLinkClasses}>
                  Người Đăng Ký
                </NavLink>
                <NavLink
                  to="/admin/checkin"
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all ${
                      isActive
                        ? 'bg-crimson text-white border-crimson shadow-pulse-glow'
                        : 'border-crimson/40 dark:border-crimson/50 text-crimson dark:text-white dark:bg-crimson/20 hover:bg-crimson hover:text-white'
                    }`
                  }
                >
                  <ScanLine className="w-3.5 h-3.5" />
                  Quét QR
                </NavLink>
              </div>
            )}
          </nav>

          {/* Right actions: Theme Toggle + User Auth Buttons / Dropdown */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-sand dark:border-white/15 bg-porcelain-card dark:bg-[#1E232A] text-ink dark:text-amber-300 hover:text-crimson dark:hover:text-amber-200 hover:border-crimson/50 shadow-sm transition-all"
              title={isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
              aria-label="Theme toggle"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-300 animate-spin-slow" />
              ) : (
                <Moon className="w-4 h-4 text-ink-light" />
              )}
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pl-3.5 rounded-full border border-sand dark:border-white/15 bg-porcelain-card dark:bg-[#1E232A] hover:border-crimson/50 transition-all text-left shadow-sm"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-ink dark:text-white leading-tight">
                      {user?.fullName}
                    </span>
                    <span className="text-[10px] text-ink-muted dark:text-gray-400 leading-tight">
                      {isAdmin ? 'Quản trị viên' : user?.bloodType !== 'unknown' ? `Nhóm máu ${user?.bloodType}` : 'Người hiến máu'}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-crimson-light dark:bg-crimson/30 text-crimson dark:text-white flex items-center justify-center font-bold text-xs border border-crimson/30">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isUserDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1E232A] rounded-2xl shadow-2xl border border-sand dark:border-white/15 py-2 z-50 overflow-hidden"
                      onMouseLeave={() => setIsUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2.5 border-b border-sand/60 dark:border-white/10">
                        <p className="text-[11px] text-ink-muted dark:text-gray-400">Đăng nhập với email</p>
                        <p className="text-xs font-bold text-ink dark:text-white truncate">{user?.email}</p>
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-ink dark:text-gray-200 hover:bg-crimson-light/50 dark:hover:bg-white/10 hover:text-crimson transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-crimson" />
                          Trang Quản Trị
                        </Link>
                      )}

                      {!isAdmin && (
                        <>
                          <Link
                            to="/my-registrations"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-ink dark:text-gray-200 hover:bg-crimson-light/50 dark:hover:bg-white/10 hover:text-crimson transition-colors"
                          >
                            <ClipboardList className="w-4 h-4 text-crimson" />
                            Đăng Ký Của Tôi
                          </Link>
                          <Link
                            to="/my-qr"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-ink dark:text-gray-200 hover:bg-crimson-light/50 dark:hover:bg-white/10 hover:text-crimson transition-colors"
                          >
                            <QrCode className="w-4 h-4 text-crimson" />
                            Thẻ QR Cá Nhân
                          </Link>
                        </>
                      )}

                      <div className="h-px bg-sand/60 dark:bg-white/10 my-1" />

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Đăng Xuất
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Đăng Nhập
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Đăng Ký
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Actions: Theme Toggle + Menu Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-sand dark:border-white/15 bg-porcelain-card dark:bg-[#1E232A] text-ink dark:text-amber-300 hover:text-crimson"
              aria-label="Theme toggle"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-300" />
              ) : (
                <Moon className="w-4 h-4 text-ink-light" />
              )}
            </button>

            {isAuthenticated && (
              <Link to={isAdmin ? '/admin/checkin' : '/my-qr'} className="p-2 text-crimson dark:text-white">
                {isAdmin ? <ScanLine className="w-5 h-5" /> : <QrCode className="w-5 h-5" />}
              </Link>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-ink dark:text-white hover:text-crimson hover:bg-crimson-light dark:hover:bg-white/10 transition-colors"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-sand dark:border-white/15 bg-porcelain-card dark:bg-[#161A1E] px-4 pt-3 pb-6 space-y-3"
          >
            <div className="flex flex-col space-y-1.5">
              <NavLink
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={navLinkClasses}
                end
              >
                Trang Chủ
              </NavLink>
              <NavLink
                to="/events"
                onClick={() => setIsMobileMenuOpen(false)}
                className={navLinkClasses}
              >
                Đợt Hiến Máu
              </NavLink>

              {isAuthenticated && !isAdmin && (
                <>
                  <NavLink
                    to="/my-registrations"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={navLinkClasses}
                  >
                    Đăng Ký Của Tôi
                  </NavLink>
                  <NavLink
                    to="/my-qr"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={navLinkClasses}
                  >
                    Thẻ QR Cá Nhân
                  </NavLink>
                </>
              )}

              {isAdmin && (
                <div className="pt-2 mt-2 border-t border-sand dark:border-white/15 space-y-1">
                  <p className="text-[10px] uppercase font-bold text-ink-muted dark:text-gray-400 px-3 tracking-wider">
                    Khu Vực Quản Trị
                  </p>
                  <NavLink
                    to="/admin/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={navLinkClasses}
                  >
                    Bảng Điều Khiển
                  </NavLink>
                  <NavLink
                    to="/admin/events"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={navLinkClasses}
                  >
                    Quản Lý Đợt Hiến Máu
                  </NavLink>
                  <NavLink
                    to="/admin/registrations"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={navLinkClasses}
                  >
                    Danh Sách Đăng Ký
                  </NavLink>
                  <NavLink
                    to="/admin/checkin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={navLinkClasses}
                  >
                    Quét Mã Điểm Danh
                  </NavLink>
                  <NavLink
                    to="/admin/reports"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={navLinkClasses}
                  >
                    Báo Cáo Thống Kê
                  </NavLink>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-sand dark:border-white/15">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-3 py-2 bg-sand-light dark:bg-[#222830] rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-crimson text-white flex items-center justify-center text-xs font-bold">
                      {user?.fullName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-ink dark:text-white">{user?.fullName}</p>
                      <p className="text-[10px] text-ink-muted dark:text-gray-400">{user?.email}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
                    Đăng Xuất
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full">
                      Đăng Nhập
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="primary" size="sm" className="w-full">
                      Đăng Ký
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
