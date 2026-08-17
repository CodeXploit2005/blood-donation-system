import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import confetti from 'canvas-confetti';
import {
  Heart,
  Check,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Calendar,
  Clock,
  QrCode,
  User,
  Scale,
  Activity,
  FileCheck,
} from 'lucide-react';
import { donationRegistrationSchema } from '../../utils/validators';
import { BLOOD_TYPES, TIME_SLOTS } from '../../utils/constants';
import Button from '../common/Button';

export const ScreeningForm = ({ event, user, onSubmit, isSubmitting = false }) => {
  const [step, setStep] = useState(1);
  const [isSuccessMorphed, setIsSuccessMorphed] = useState(false);
  const [registrationResult, setRegistrationResult] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(donationRegistrationSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      phone: user?.phone || '',
      email: user?.email || '',
      dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().slice(0, 10) : '1998-01-01',
      gender: user?.gender || 'male',
      identityCardNumber: user?.identityCardNumber || '001098001234',
      bloodType: user?.bloodType || 'unknown',
      weight: 55,
      height: 165,
      preferredTimeSlot: '08:00 - 10:00',
      hasFever: false,
      hasChronicDisease: false,
      takingMedication: false,
      recentSurgery: false,
      hasTattooOrPiercingIn6Months: false,
      isPregnantOrNursing: false,
      lastDonationDate: '',
      notes: '',
      agreeTerms: true,
    },
  });

  const weight = watch('weight');
  const hasFever = watch('hasFever');
  const hasChronicDisease = watch('hasChronicDisease');
  const takingMedication = watch('takingMedication');
  const recentSurgery = watch('recentSurgery');
  const hasTattooOrPiercingIn6Months = watch('hasTattooOrPiercingIn6Months');
  const isPregnantOrNursing = watch('isPregnantOrNursing');

  // Real-time screening warning count
  const warnings = [];
  if (weight < 45) warnings.push('Cân nặng dưới 45kg chưa đủ điều kiện hiến máu toàn phần.');
  if (hasFever) warnings.push('Đang sốt hoặc nhiễm trùng cần hoãn hiến máu đến khi khỏi hẳn.');
  if (hasChronicDisease) warnings.push('Bệnh mãn tính cần được bác sĩ chuyên khoa thăm khám kỹ lưỡng.');
  if (isPregnantOrNursing) warnings.push('Phụ nữ mang thai hoặc nuôi con bú không được hiến máu.');
  if (recentSurgery) warnings.push('Phẫu thuật trong 6 tháng cần bác sĩ tư vấn.');
  if (takingMedication) warnings.push('Đang dùng thuốc cần thông báo rõ với điều dưỡng tại sự kiện.');
  if (hasTattooOrPiercingIn6Months) warnings.push('Xăm/xỏ khuyên trong 6 tháng cần hoãn hiến máu theo quy định.');

  const nextStep = async () => {
    let isValid = false;
    if (step === 1) {
      isValid = await trigger([
        'fullName',
        'phone',
        'email',
        'dateOfBirth',
        'gender',
        'identityCardNumber',
        'bloodType',
        'preferredTimeSlot',
      ]);
    } else if (step === 2) {
      isValid = await trigger(['weight', 'height']);
    }

    if (isValid) {
      setStep((prev) => Math.min(3, prev + 1));
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleFormSubmit = async (formData) => {
    try {
      const response = await onSubmit(formData);
      if (response?.success) {
        setRegistrationResult(response.data);
        setIsSuccessMorphed(true);
        // Fire celebration confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#C4384A', '#7A1F2B', '#10B981', '#F7F3EF'],
        });
      }
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  // If success morphed, render signature success morph animation + QR Code
  if (isSuccessMorphed && registrationResult) {
    const reg = registrationResult.registration;
    const screening = registrationResult.screeningEvaluation;

    return (
      <div className="bg-porcelain-card dark:bg-[#1A1E22] rounded-3xl border border-sand dark:border-white/10 p-6 sm:p-10 shadow-warm-lg text-center max-w-xl mx-auto overflow-hidden">
        {/* Stable success badge so the check icon does not disappear after the enter animation */}
        <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-100 dark:bg-emerald-950/40 border-2 border-emerald-500/50 animate-ping opacity-25 pointer-events-none" />
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/60 dark:to-emerald-900/40 border-2 border-emerald-500 flex items-center justify-center text-emerald-600 dark:text-emerald-300 shadow-md shadow-emerald-500/20"
          >
            <Check className="w-10 h-10 stroke-[3] drop-shadow-sm" />
          </motion.div>
        </div>

        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-display text-2xl sm:text-3xl font-bold text-ink dark:text-white mb-2"
        >
          Đăng Ký Hiến Máu Thành Công!
        </motion.h3>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-ink-muted dark:text-gray-300 mb-6 leading-relaxed"
        >
          Cảm ơn tấm lòng nhân ái của bạn với đợt hiến máu{' '}
          <strong className="text-ink dark:text-white">{event.title}</strong>. Hệ thống đã cấp mã QR điểm danh bên dưới:
        </motion.p>

        {/* QR Code Card with Fade-in and Zoom */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.4, type: 'spring', damping: 22 }}
          className="glass-qr rounded-3xl p-6 mb-6 shadow-pulse-glow max-w-sm mx-auto animate-breathing"
        >
          <div className="w-48 h-48 mx-auto bg-white p-3 rounded-2xl border border-sand shadow-inner flex items-center justify-center">
            {reg.qrCode?.dataUrl ? (
              <img
                src={reg.qrCode.dataUrl}
                alt="QR Code"
                className="w-full h-full object-contain"
              />
            ) : (
              <QrCode className="w-32 h-32 text-ink" />
            )}
          </div>

          <div className="mt-4 space-y-1">
            <p className="font-mono text-base font-bold text-crimson tracking-wider">
              {reg.qrCode?.code}
            </p>
            <p className="text-xs font-bold text-ink dark:text-white">{reg.fullName}</p>
            <p className="text-[11px] text-ink-muted dark:text-gray-400">
              Khung giờ: <span className="font-bold text-ink dark:text-white">{reg.preferredTimeSlot}</span>
            </p>
          </div>
        </motion.div>

        {/* Screening status notice */}
        <div className="p-4 rounded-2xl bg-porcelain dark:bg-[#23282E] border border-sand dark:border-white/10 text-left text-xs text-ink dark:text-gray-300 space-y-2 mb-6">
          <div className="flex items-center gap-2 font-bold text-ink dark:text-white">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>Kết quả sàng lọc sơ bộ: {screening?.result === 'eligible' ? 'Đủ điều kiện' : 'Cần bác sĩ tư vấn tại chỗ'}</span>
          </div>
          <p className="text-ink-muted dark:text-gray-400">{screening?.notes}</p>
          <p className="text-[11px] text-crimson font-semibold">
            * Vui lòng mang theo Căn cước công dân (CCCD) và xuất trình mã QR này khi đến địa điểm hiến máu.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="primary"
            onClick={() => (window.location.href = '/my-qr')}
            leftIcon={<QrCode className="w-4 h-4" />}
          >
            Xem Thẻ QR Đầy Đủ
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = '/events')}
          >
            Quay Lại Danh Sách Đợt Hiến
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-porcelain-card dark:bg-[#1A1E22] rounded-3xl border border-sand dark:border-white/10 p-6 sm:p-8 shadow-warm">
      {/* Top Multi-step ECG Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-ink dark:text-white mb-3">
          <span className={step >= 1 ? 'text-crimson font-bold' : 'text-ink-muted dark:text-gray-400'}>
            1. Thông Tin Người Hiến
          </span>
          <span className={step >= 2 ? 'text-crimson font-bold' : 'text-ink-muted dark:text-gray-400'}>
            2. Khảo Sát Sức Khỏe
          </span>
          <span className={step >= 3 ? 'text-crimson font-bold' : 'text-ink-muted dark:text-gray-400'}>
            3. Xác Nhận & Cam Kết
          </span>
        </div>

        {/* ECG Heartbeat Line Progress Bar */}
        <div className="relative h-3 w-full bg-sand-light dark:bg-[#23282E] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: '33%' }}
            animate={{ width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="h-full bg-gradient-to-r from-crimson via-crimson-deep to-emerald-500 rounded-full"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <AnimatePresence mode="wait">
          {/* STEP 1: Personal info */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div className="pb-2 border-b border-sand/60 dark:border-white/10 mb-4">
                <h4 className="font-display text-lg font-bold text-ink dark:text-white">
                  Bước 1: Thông tin cá nhân & thời gian đăng ký
                </h4>
                <p className="text-xs text-ink-muted dark:text-gray-400">
                  Thông tin này sẽ được đồng bộ với hồ sơ hiến máu tại cơ sở y tế.
                </p>
              </div>

              {/* Full Name & CCCD */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink dark:text-white uppercase tracking-wider mb-1.5">
                    Họ và tên <span className="text-crimson">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('fullName')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand dark:border-white/10 bg-porcelain dark:bg-[#23282E] text-ink dark:text-white text-sm focus:border-crimson outline-none font-medium"
                    placeholder="Nguyễn Văn A"
                  />
                  {errors.fullName && (
                    <p className="text-xs text-rose-600 mt-1">{String(errors.fullName.message || '')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink dark:text-white uppercase tracking-wider mb-1.5">
                    Số CCCD / CMND <span className="text-crimson">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('identityCardNumber')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand dark:border-white/10 bg-porcelain dark:bg-[#23282E] text-ink dark:text-white text-sm focus:border-crimson outline-none font-mono"
                    placeholder="00109900xxxx"
                  />
                  {errors.identityCardNumber && (
                    <p className="text-xs text-rose-600 mt-1">{String(errors.identityCardNumber.message || '')}</p>
                  )}
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink dark:text-white uppercase tracking-wider mb-1.5">
                    Số điện thoại <span className="text-crimson">*</span>
                  </label>
                  <input
                    type="tel"
                    {...register('phone')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand dark:border-white/10 bg-porcelain dark:bg-[#23282E] text-ink dark:text-white text-sm focus:border-crimson outline-none font-mono"
                    placeholder="0912345678"
                  />
                  {errors.phone && (
                    <p className="text-xs text-rose-600 mt-1">{String(errors.phone.message || '')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink dark:text-white uppercase tracking-wider mb-1.5">
                    Email nhận mã QR <span className="text-crimson">*</span>
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand dark:border-white/10 bg-porcelain dark:bg-[#23282E] text-ink dark:text-white text-sm focus:border-crimson outline-none"
                    placeholder="ban@example.com"
                  />
                  {errors.email && (
                    <p className="text-xs text-rose-600 mt-1">{String(errors.email.message || '')}</p>
                  )}
                </div>
              </div>

              {/* Date of birth, Gender, Blood Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink dark:text-white uppercase tracking-wider mb-1.5">
                    Ngày sinh <span className="text-crimson">*</span>
                  </label>
                  <input
                    type="date"
                    {...register('dateOfBirth')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand dark:border-white/10 bg-porcelain dark:bg-[#23282E] text-ink dark:text-white text-sm focus:border-crimson outline-none font-mono"
                  />
                  {errors.dateOfBirth && (
                    <p className="text-xs text-rose-600 mt-1">{errors.dateOfBirth.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink dark:text-white uppercase tracking-wider mb-1.5">
                    Giới tính <span className="text-crimson">*</span>
                  </label>
                  <select
                    {...register('gender')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand dark:border-white/10 bg-porcelain dark:bg-[#23282E] text-ink dark:text-white text-sm focus:border-crimson outline-none"
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink dark:text-white uppercase tracking-wider mb-1.5">
                    Nhóm máu (nếu đã biết)
                  </label>
                  <select
                    {...register('bloodType')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand dark:border-white/10 bg-porcelain dark:bg-[#23282E] text-ink dark:text-white text-sm focus:border-crimson outline-none font-bold text-crimson"
                  >
                    {BLOOD_TYPES.map((bt) => (
                      <option key={bt} value={bt}>
                        {bt === 'unknown' ? 'Chưa rõ nhóm máu' : `Nhóm ${bt}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Preferred Time Slot */}
              <div>
                <label className="block text-xs font-bold text-ink dark:text-white uppercase tracking-wider mb-1.5">
                  Khung giờ dự kiến đến hiến <span className="text-crimson">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {TIME_SLOTS.map((slot) => {
                    const isSelected = watch('preferredTimeSlot') === slot;
                    return (
                      <label
                        key={slot}
                        className={`flex items-center justify-center p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-crimson text-white border-crimson shadow-sm'
                            : 'bg-porcelain dark:bg-[#23282E] text-ink dark:text-white border-sand dark:border-white/10 hover:border-crimson'
                        }`}
                      >
                        <input
                          type="radio"
                          value={slot}
                          {...register('preferredTimeSlot')}
                          className="sr-only"
                        />
                        <span>{slot}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                <Button
                  variant="primary"
                  onClick={nextStep}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Tiếp Theo: Khảo Sát Sức Khỏe
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Medical & Screening */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div className="pb-2 border-b border-sand/60 dark:border-white/10 mb-4">
                <h4 className="font-display text-lg font-bold text-ink dark:text-white">
                  Bước 2: Bảng khảo sát sàng lọc y tế ban đầu
                </h4>
                <p className="text-xs text-ink-muted dark:text-gray-400">
                  Vui lòng trả lời trung thực để đảm bảo an toàn tuyệt đối cho bạn và người nhận máu.
                </p>
              </div>

              {/* Weight & Height */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink dark:text-white uppercase tracking-wider mb-1.5">
                    Cân nặng hiện tại (kg) <span className="text-crimson">* (Tối thiểu 45kg)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      {...register('weight')}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand dark:border-white/10 bg-porcelain dark:bg-[#23282E] text-ink dark:text-white text-sm focus:border-crimson outline-none font-mono font-bold"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-ink-muted dark:text-gray-400">kg</span>
                  </div>
                  {errors.weight && (
                    <p className="text-xs text-rose-600 mt-1">{errors.weight.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink dark:text-white uppercase tracking-wider mb-1.5">
                    Chiều cao (cm)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      {...register('height')}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand dark:border-white/10 bg-porcelain dark:bg-[#23282E] text-ink dark:text-white text-sm focus:border-crimson outline-none font-mono"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-ink-muted dark:text-gray-400">cm</span>
                  </div>
                </div>
              </div>

              {/* Questionnaire checkboxes */}
              <div className="space-y-3 pt-2">
                <p className="text-xs font-bold text-ink dark:text-white uppercase tracking-wider">
                  Tình trạng sức khỏe gần đây (Đánh dấu nếu có):
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-sand dark:border-white/10 bg-porcelain dark:bg-[#23282E] cursor-pointer hover:border-crimson transition">
                    <input
                      type="checkbox"
                      {...register('hasFever')}
                      className="mt-0.5 w-4 h-4 rounded text-crimson focus:ring-crimson"
                    />
                    <div>
                      <span className="font-semibold text-ink dark:text-white block">Đang sốt, ho hoặc cảm cúm</span>
                      <span className="text-ink-muted dark:text-gray-400 text-[11px]">Nhiễm trùng cấp tính trong 7 ngày</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-sand dark:border-white/10 bg-porcelain dark:bg-[#23282E] cursor-pointer hover:border-crimson transition">
                    <input
                      type="checkbox"
                      {...register('hasChronicDisease')}
                      className="mt-0.5 w-4 h-4 rounded text-crimson focus:ring-crimson"
                    />
                    <div>
                      <span className="font-semibold text-ink dark:text-white block">Bệnh lý mãn tính</span>
                      <span className="text-ink-muted dark:text-gray-400 text-[11px]">Tim mạch, gan, thận, hen suyễn, ung thư...</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-sand dark:border-white/10 bg-porcelain dark:bg-[#23282E] cursor-pointer hover:border-crimson transition">
                    <input
                      type="checkbox"
                      {...register('takingMedication')}
                      className="mt-0.5 w-4 h-4 rounded text-crimson focus:ring-crimson"
                    />
                    <div>
                      <span className="font-semibold text-ink dark:text-white block">Đang dùng thuốc điều trị</span>
                      <span className="text-ink-muted dark:text-gray-400 text-[11px]">Kháng sinh, thuốc chống đông, aspirin...</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-sand dark:border-white/10 bg-porcelain dark:bg-[#23282E] cursor-pointer hover:border-crimson transition">
                    <input
                      type="checkbox"
                      {...register('recentSurgery')}
                      className="mt-0.5 w-4 h-4 rounded text-crimson focus:ring-crimson"
                    />
                    <div>
                      <span className="font-semibold text-ink dark:text-white block">Phẫu thuật trong vòng 6 tháng</span>
                      <span className="text-ink-muted dark:text-gray-400 text-[11px]">Can thiệp ngoại khoa, truyền máu trước đó</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-sand dark:border-white/10 bg-porcelain dark:bg-[#23282E] cursor-pointer hover:border-crimson transition">
                    <input
                      type="checkbox"
                      {...register('hasTattooOrPiercingIn6Months')}
                      className="mt-0.5 w-4 h-4 rounded text-crimson focus:ring-crimson"
                    />
                    <div>
                      <span className="font-semibold text-ink dark:text-white block">Xăm hình, xỏ khuyên gần đây</span>
                      <span className="text-ink-muted dark:text-gray-400 text-[11px]">Thực hiện trong vòng 6 tháng qua</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-sand dark:border-white/10 bg-porcelain dark:bg-[#23282E] cursor-pointer hover:border-crimson transition">
                    <input
                      type="checkbox"
                      {...register('isPregnantOrNursing')}
                      className="mt-0.5 w-4 h-4 rounded text-crimson focus:ring-crimson"
                    />
                    <div>
                      <span className="font-semibold text-ink dark:text-white block">Mang thai / Nuôi con bú</span>
                      <span className="text-ink-muted dark:text-gray-400 text-[11px]">Dành cho nữ giới (dưới 12 tháng)</span>
                    </div>
                  </label>
                </div>

                {/* Last donation date */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-ink dark:text-white uppercase tracking-wider mb-1.5">
                    Ngày hiến máu gần nhất (nếu đã từng hiến trước đây)
                  </label>
                  <input
                    type="date"
                    {...register('lastDonationDate')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand dark:border-white/10 bg-porcelain dark:bg-[#23282E] text-ink dark:text-white text-sm focus:border-crimson outline-none font-mono"
                  />
                  <p className="text-[11px] text-ink-muted dark:text-gray-400 mt-1">
                    * Khoảng cách tối thiểu giữa 2 lần hiến máu toàn phần là 84 ngày (12 tuần).
                  </p>
                </div>
              </div>

              {/* Real-time warning alerts */}
              {warnings.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-300 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Lưu ý sàng lọc:</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5">
                    {warnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-6 flex justify-between">
                <Button variant="sand" onClick={prevStep} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Quay Lại
                </Button>
                <Button variant="primary" onClick={nextStep} rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Tiếp Theo: Xem Lại & Xác Nhận
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Review & Voluntary Confirmation */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              <div className="pb-2 border-b border-sand/60 dark:border-white/10 mb-4">
                <h4 className="font-display text-lg font-bold text-ink dark:text-white">
                  Bước 3: Xác nhận thông tin & cam kết hiến máu
                </h4>
                <p className="text-xs text-ink-muted dark:text-gray-400">
                  Vui lòng kiểm tra lại toàn bộ thông tin đăng ký trước khi gửi đơn.
                </p>
              </div>

              {/* Summary Card */}
              <div className="p-5 rounded-2xl bg-sand-light/60 dark:bg-[#23282E] border border-sand dark:border-white/10 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-sand dark:border-white/10">
                  <span className="font-bold text-ink dark:text-white text-sm">{event.title}</span>
                  <span className="text-crimson font-bold">{watch('preferredTimeSlot')}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-ink-muted dark:text-gray-400 block text-[11px]">Họ và tên:</span>
                    <span className="font-bold text-ink dark:text-white">{watch('fullName')}</span>
                  </div>
                  <div>
                    <span className="text-ink-muted dark:text-gray-400 block text-[11px]">Số CCCD:</span>
                    <span className="font-mono font-bold text-ink dark:text-white">{watch('identityCardNumber')}</span>
                  </div>
                  <div>
                    <span className="text-ink-muted dark:text-gray-400 block text-[11px]">Số điện thoại:</span>
                    <span className="font-mono font-bold text-ink dark:text-white">{watch('phone')}</span>
                  </div>
                  <div>
                    <span className="text-ink-muted dark:text-gray-400 block text-[11px]">Cân nặng:</span>
                    <span className="font-mono font-bold text-ink dark:text-white">{watch('weight')} kg</span>
                  </div>
                  <div>
                    <span className="text-ink-muted dark:text-gray-400 block text-[11px]">Nhóm máu:</span>
                    <span className="font-bold text-crimson">{watch('bloodType')}</span>
                  </div>
                  <div>
                    <span className="text-ink-muted dark:text-gray-400 block text-[11px]">Tình trạng sàng lọc:</span>
                    <span className={`font-bold ${warnings.length === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600'}`}>
                      {warnings.length === 0 ? 'Đủ điều kiện sơ bộ' : 'Cần bác sĩ tư vấn'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Voluntary terms agreement */}
              <div className="p-4 rounded-2xl bg-porcelain dark:bg-[#23282E] border border-sand dark:border-white/10 space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('agreeTerms')}
                    className="mt-0.5 w-4 h-4 rounded text-crimson focus:ring-crimson"
                  />
                  <div className="text-xs text-ink-light dark:text-gray-300 leading-relaxed">
                    <span className="font-bold text-ink dark:text-white block">
                      Cam kết tham gia hiến máu hoàn toàn tự nguyện
                    </span>
                    Tôi xác nhận tất cả thông tin trên là chính xác và trung thực. Tôi cam kết tuân thủ
                    hướng dẫn y tế của Ban tổ chức và mang theo CCCD khi đến tham gia.
                  </div>
                </label>
                {errors.agreeTerms && (
                  <p className="text-xs text-rose-600 font-medium pl-7">
                    {errors.agreeTerms.message}
                  </p>
                )}
              </div>

              <div className="pt-4 flex justify-between">
                <Button variant="sand" onClick={prevStep} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Quay Lại
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isSubmitting}
                  leftIcon={<Heart className="w-5 h-5 fill-current" />}
                >
                  Xác Nhận Đăng Ký & Nhận Mã QR
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
};

export default ScreeningForm;
