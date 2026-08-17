import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { loginFormSchema } from '../../utils/validators';
import useAuth from '../../hooks/useAuth';
import { useToast } from '../../components/common/Toast';
import Button from '../../components/common/Button';

export const Login = () => {
  const { login } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const result = await login(data);
      if (result.success) {
        success('Đăng nhập thành công! Chào mừng bạn quay trở lại.');
        if (result.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate(from, { replace: true });
        }
      } else {
        toastError(result.error || 'Email hoặc mật khẩu không chính xác');
      }
    } catch (err) {
      toastError(err.message || 'Lỗi khi đăng nhập');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-porcelain-card rounded-3xl border border-sand p-6 sm:p-8 shadow-warm-lg"
    >
      <div className="text-center mb-6">
        <h2 className="font-display text-2xl font-bold text-ink">Đăng Nhập Tài Khoản</h2>
        <p className="text-xs text-ink-muted mt-1">
          Truy cập hệ thống đăng ký và quản lý hiến máu
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
            Địa chỉ Email <span className="text-crimson">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-ink-muted absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="email"
              {...register('email')}
              placeholder="Tên tài khoản"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-sand bg-porcelain text-ink text-sm focus:border-crimson outline-none transition"
            />
          </div>
          {errors.email && (
            <p className="text-xs text-rose-600 mt-1 font-medium">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
            Mật khẩu <span className="text-crimson">*</span>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-ink-muted absolute left-3.5 top-3 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              placeholder="••••••••"
              className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-sand bg-porcelain text-ink text-sm focus:border-crimson outline-none transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-crimson transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-rose-600 mt-1 font-medium">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          isLoading={isSubmitting}
          leftIcon={<LogIn className="w-4 h-4" />}
        >
          Đăng Nhập
        </Button>
      </form>

      {/* Switch to Register */}
      <div className="mt-6 pt-4 border-t border-sand/60 text-center text-xs text-ink-muted">
        <span>Chưa có tài khoản? </span>
        <Link to="/register" className="font-bold text-crimson hover:underline">
          Đăng ký tham gia ngay
        </Link>
      </div>
    </motion.div>
  );
};

export default Login;
