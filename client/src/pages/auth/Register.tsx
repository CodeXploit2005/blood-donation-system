import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Phone, Calendar, Heart, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { registerFormSchema } from '../../utils/validators';
import { BLOOD_TYPES } from '../../utils/constants';
import useAuth from '../../hooks/useAuth';
import { useToast } from '../../components/common/Toast';
import Button from '../../components/common/Button';

export const Register = () => {
  const { register: registerUser } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      gender: 'male',
      bloodType: 'unknown',
      dateOfBirth: '',
      address: '',
      identityCardNumber: '',
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const result = await registerUser(data);
      if (result.success) {
        success('Đăng ký tài khoản người hiến máu thành công!');
        navigate('/');
      } else {
        toastError(result.error || 'Đăng ký không thành công. Vui lòng kiểm tra lại dữ liệu.');
      }
    } catch (err) {
      toastError(err.message || 'Lỗi khi đăng ký tài khoản');
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
        <h2 className="font-display text-2xl font-bold text-ink">Đăng Ký Tài Khoản</h2>
        <p className="text-xs text-ink-muted mt-1">
          Gia nhập cộng đồng người hiến máu tình nguyện
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
            Họ và tên <span className="text-crimson">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-ink-muted absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              {...register('fullName')}
              placeholder="Nguyễn Văn A"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-sand bg-porcelain text-ink text-sm focus:border-crimson outline-none transition"
            />
          </div>
          {errors.fullName && (
            <p className="text-xs text-rose-600 mt-1 font-medium">{errors.fullName.message}</p>
          )}
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
              Email <span className="text-crimson">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-ink-muted absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="email"
                {...register('email')}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-sand bg-porcelain text-ink text-sm focus:border-crimson outline-none transition"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
              Số điện thoại <span className="text-crimson">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-ink-muted absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="tel"
                {...register('phone')}
                placeholder="0912345678"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-sand bg-porcelain text-ink text-sm focus:border-crimson outline-none transition"
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errors.phone.message}</p>
            )}
          </div>
        </div>

        {/* Date of Birth & Gender & Blood Type */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
              Ngày sinh <span className="text-crimson">*</span>
            </label>
            <input
              type="date"
              {...register('dateOfBirth')}
              className="w-full px-3 py-2.5 rounded-xl border border-sand bg-porcelain text-ink text-xs focus:border-crimson outline-none transition"
            />
            {errors.dateOfBirth && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errors.dateOfBirth.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
              Giới tính <span className="text-crimson">*</span>
            </label>
            <select
              {...register('gender')}
              className="w-full px-3 py-2.5 rounded-xl border border-sand bg-porcelain text-ink text-xs focus:border-crimson outline-none transition"
            >
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
              Nhóm máu
            </label>
            <select
              {...register('bloodType')}
              className="w-full px-3 py-2.5 rounded-xl border border-sand bg-porcelain text-ink text-xs focus:border-crimson outline-none transition"
            >
              {BLOOD_TYPES.map((bt) => (
                <option key={bt} value={bt}>
                  {bt === 'unknown' ? 'Chưa rõ' : bt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Passwords */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
              Mật khẩu <span className="text-crimson">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-ink-muted absolute left-3.5 top-3 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="Tối thiểu 6 ký tự"
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

          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
              Xác nhận mật khẩu <span className="text-crimson">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-ink-muted absolute left-3.5 top-3 pointer-events-none" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                placeholder="Nhập lại mật khẩu"
                className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-sand bg-porcelain text-ink text-sm focus:border-crimson outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-crimson transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          isLoading={isSubmitting}
          leftIcon={<Heart className="w-4 h-4 fill-current" />}
        >
          Hoàn Tất Đăng Ký
        </Button>
      </form>

      {/* Switch to Login */}
      <div className="mt-6 pt-4 border-t border-sand/60 text-center text-xs text-ink-muted">
        <span>Đã có tài khoản? </span>
        <Link to="/login" className="font-bold text-crimson hover:underline">
          Đăng nhập ngay
        </Link>
      </div>
    </motion.div>
  );
};

export default Register;
