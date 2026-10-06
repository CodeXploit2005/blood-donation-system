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
import { ageOnDate, birthDateBounds, birthDateError } from '../../utils/donorEligibility';

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
    watch,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerFormSchema),
    mode: 'onTouched',
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

  const birthDate = watch('dateOfBirth');
  const age = ageOnDate(birthDate);
  const dateBounds = birthDateBounds();
  const password = watch('password');
  const strength = password.length >= 12 && /[a-zA-Z]/.test(password) && /\d/.test(password) && /[^a-zA-Z0-9]/.test(password) ? 3 : password.length >= 8 ? 2 : password.length ? 1 : 0;

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const result = await registerUser(data);
      if (result.success) {
        success('Đăng ký tài khoản người hiến máu thành công!');
        navigate('/');
      } else {
        for (const field of result.fieldErrors || []) {
          if (field.field in data) setError(field.field, { type: 'server', message: field.message });
        }
        if (result.status === 409) setError('email', { type: 'server', message: result.error }, { shouldFocus: true });
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
      className="bg-porcelain-card dark:bg-[#1E232A] rounded-3xl border border-sand dark:border-white/10 p-6 sm:p-8 shadow-warm-lg"
    >
      <div className="text-center mb-6">
        <h2 className="font-display text-2xl font-bold text-ink dark:text-white">Đăng Ký Tài Khoản</h2>
        <p className="text-xs text-ink-muted dark:text-gray-400 mt-1">
          Gia nhập cộng đồng người hiến máu tình nguyện
        </p>
      </div>

      <div className="mb-5 rounded-xl border border-sage/30 bg-sage-light/40 dark:bg-sage/10 p-3 text-xs leading-relaxed text-ink dark:text-white">
        Tài khoản người hiến dành cho độ tuổi từ đủ <strong>18 đến 60 tuổi</strong>. Ngày sinh giúp hệ thống kiểm tra tuổi. Nhân viên y tế sẽ đánh giá sức khỏe khi bạn đến hiến máu.
      </div>

      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div>
          <label htmlFor="signup-fullName" className="block text-xs font-bold text-ink dark:text-white uppercase tracking-wider mb-1.5">
            Họ và tên <span className="text-crimson">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-ink-muted dark:text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              autoComplete="name"
              maxLength={100}
              id="signup-fullName"
              aria-invalid={!!errors.fullName}
              {...register('fullName')}
              placeholder="Nguyễn Văn A"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-sand bg-porcelain dark:bg-[#23282E] text-ink dark:text-white text-sm focus:border-crimson outline-none transition"
            />
          </div>
          {errors.fullName && (
            <p className="text-xs text-rose-600 mt-1 font-medium">{errors.fullName.message}</p>
          )}
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="signup-email" className="block text-xs font-bold text-ink dark:text-white uppercase tracking-wider mb-1.5">
              Email <span className="text-crimson">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-ink-muted dark:text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="email"
                autoComplete="email"
                id="signup-email"
              aria-invalid={!!errors.email}
              {...register('email')}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-sand bg-porcelain dark:bg-[#23282E] text-ink dark:text-white text-sm focus:border-crimson outline-none transition"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="signup-phone" className="block text-xs font-bold text-ink dark:text-white uppercase tracking-wider mb-1.5">
              Số điện thoại <span className="text-crimson">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-ink-muted dark:text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                id="signup-phone"
              aria-invalid={!!errors.phone}
              {...register('phone')}
                placeholder="0912345678"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-sand bg-porcelain dark:bg-[#23282E] text-ink dark:text-white text-sm focus:border-crimson outline-none transition"
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
            <label htmlFor="signup-dateOfBirth" className="block text-xs font-bold text-ink dark:text-white uppercase tracking-wider mb-1.5">
              Ngày sinh <span className="text-crimson">*</span>
            </label>
            <input
              type="date"
              min={dateBounds.min}
              max={dateBounds.max}
              autoComplete="bday"
              aria-describedby="birth-date-help"
              id="signup-dateOfBirth"
              aria-invalid={!!errors.dateOfBirth}
              {...register('dateOfBirth')}
              className="w-full px-3 py-2.5 rounded-xl border border-sand bg-porcelain dark:bg-[#23282E] text-ink dark:text-white text-xs focus:border-crimson outline-none transition"
            />
            <p id="birth-date-help" aria-live="polite" className={`mt-1 text-[11px] leading-relaxed ${birthDate && birthDateError(birthDate) ? 'text-rose-600' : 'text-ink-muted'}`}>
              {birthDate ? birthDateError(birthDate) || `${age} tuổi · Đạt điều kiện tuổi đăng ký` : 'Chọn đầy đủ ngày, tháng và năm sinh'}
            </p>
            {errors.dateOfBirth && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errors.dateOfBirth.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="signup-gender" className="block text-xs font-bold text-ink dark:text-white uppercase tracking-wider mb-1.5">
              Giới tính <span className="text-crimson">*</span>
            </label>
            <select
              id="signup-gender"
              aria-invalid={!!errors.gender}
              {...register('gender')}
              className="w-full px-3 py-2.5 rounded-xl border border-sand bg-porcelain dark:bg-[#23282E] text-ink dark:text-white text-xs focus:border-crimson outline-none transition"
            >
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>

          <div>
            <label htmlFor="signup-bloodType" className="block text-xs font-bold text-ink dark:text-white uppercase tracking-wider mb-1.5">
              Nhóm máu
            </label>
            <select
              id="signup-bloodType"
              aria-invalid={!!errors.bloodType}
              {...register('bloodType')}
              className="w-full px-3 py-2.5 rounded-xl border border-sand bg-porcelain dark:bg-[#23282E] text-ink dark:text-white text-xs focus:border-crimson outline-none transition"
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
            <label htmlFor="signup-password" className="block text-xs font-bold text-ink dark:text-white uppercase tracking-wider mb-1.5">
              Mật khẩu <span className="text-crimson">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-ink-muted dark:text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                id="signup-password"
              aria-invalid={!!errors.password}
              {...register('password')}
                placeholder="Tối thiểu 8 ký tự"
                className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-sand bg-porcelain dark:bg-[#23282E] text-ink dark:text-white text-sm focus:border-crimson outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted dark:text-gray-400 hover:text-crimson transition-colors"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="mt-2" aria-live="polite">
              <div className="h-1.5 rounded-full bg-sand overflow-hidden"><div className={`h-full transition-all ${strength === 3 ? 'bg-sage' : strength === 2 ? 'bg-amber-500' : 'bg-crimson'}`} style={{ width: `${strength / 3 * 100}%` }} /></div>
              <p className="mt-1 text-[11px] text-ink-muted dark:text-gray-400">{['Dùng ít nhất 8 ký tự. Nên kết hợp chữ, số và ký hiệu.', 'Chưa đủ 8 ký tự', 'Đủ độ dài · Nên dùng 12 ký tự với chữ, số và ký hiệu', 'Mật khẩu có độ dài và thành phần tốt'][strength]}</p>
            </div>
            {errors.password && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="signup-confirmPassword" className="block text-xs font-bold text-ink dark:text-white uppercase tracking-wider mb-1.5">
              Xác nhận mật khẩu <span className="text-crimson">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-ink-muted dark:text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                id="signup-confirmPassword"
              aria-invalid={!!errors.confirmPassword}
              {...register('confirmPassword')}
                placeholder="Nhập lại mật khẩu"
                className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-sand bg-porcelain dark:bg-[#23282E] text-ink dark:text-white text-sm focus:border-crimson outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted dark:text-gray-400 hover:text-crimson transition-colors"
                aria-label={showConfirmPassword ? 'Ẩn mật khẩu xác nhận' : 'Hiện mật khẩu xác nhận'}
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
      <div className="mt-6 pt-4 border-t border-sand/60 text-center text-xs text-ink-muted dark:text-gray-400">
        <span>Đã có tài khoản? </span>
        <Link to="/login" className="font-bold text-crimson hover:underline">
          Đăng nhập ngay
        </Link>
      </div>
    </motion.div>
  );
};

export default Register;
