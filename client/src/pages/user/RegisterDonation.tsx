import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, MapPin, ShieldCheck, Heart } from 'lucide-react';
import eventService from '../../services/eventService';
import registrationService from '../../services/registrationService';
import ScreeningForm from '../../components/registration/ScreeningForm';
import Loading from '../../components/common/Loading';
import useAuth from '../../hooks/useAuth';
import { useToast } from '../../components/common/Toast';
import { formatDate } from '../../utils/formatDate';

export const RegisterDonation = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, warning, error: toastError } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ['event-for-reg', eventId],
    queryFn: () => eventService.getEventById(eventId),
    enabled: !!eventId,
  });

  const event = data?.data;

  // Handle form submit
  const handleRegistrationSubmit = async (formData) => {
    try {
      const payload = {
        eventId,
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: formData.gender || 'male',
        identityCardNumber: formData.identityCardNumber || '',
        bloodType: formData.bloodType || 'unknown',
        weight: Number(formData.weight) || 50,
        height: formData.height ? Number(formData.height) : undefined,
        preferredTimeSlot: formData.preferredTimeSlot || '08:00 - 10:00',
        healthInfo: {
          hasFever: Boolean(formData.hasFever),
          hasChronicDisease: Boolean(formData.hasChronicDisease),
          takingMedication: Boolean(formData.takingMedication),
          recentSurgery: Boolean(formData.recentSurgery),
          hasTattooOrPiercingIn6Months: Boolean(formData.hasTattooOrPiercingIn6Months),
          isPregnantOrNursing: Boolean(formData.isPregnantOrNursing),
          lastDonationDate: formData.lastDonationDate || undefined,
          notes: formData.notes || '',
        },
      };

      const response = await registrationService.createRegistration(payload);
      const isEligible = response.data?.screeningEvaluation?.result === 'eligible';
      if (isEligible) {
        success('Đăng ký tham gia hiến máu thành công! Mã QR đã được cấp.');
      } else {
        warning('Đã tiếp nhận đơn đăng ký. Bạn cần tư vấn thêm với bác sĩ tại sự kiện.');
      }
      return response;
    } catch (err) {
      toastError(err.message || 'Lỗi khi đăng ký hiến máu');
      throw err;
    }
  };

  if (isLoading) {
    return <Loading fullScreen text="Đang tải thông tin đợt hiến máu..." />;
  }

  if (error || !event) {
    return (
      <div className="text-center py-16 space-y-4">
        <h3 className="font-display text-xl font-bold text-ink dark:text-white">Không tìm thấy đợt hiến máu</h3>
        <p className="text-xs text-ink-muted dark:text-gray-400">Sự kiện có thể đã kết thúc hoặc không tồn tại.</p>
        <Link to="/events" className="text-crimson font-bold text-xs hover:underline">
          ← Quay lại danh sách sự kiện
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-ink-muted dark:text-gray-400 hover:text-crimson transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại chi tiết đợt hiến máu</span>
      </button>

      {/* Header card with selected event summary */}
      <div className="p-5 rounded-3xl bg-sand-light/60 dark:bg-[#1A1E22] border border-sand dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-crimson uppercase tracking-wider block">
            Đợt Hiến Máu Đã Chọn
          </span>
          <h2 className="font-display text-lg sm:text-xl font-bold text-ink dark:text-white">{event.title}</h2>
          <div className="flex flex-wrap items-center gap-3 text-xs text-ink-muted dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-crimson" />
              {formatDate(event.startDate)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-crimson" />
              {event.location}
            </span>
          </div>
        </div>

        <div className="text-right sm:border-l sm:border-sand dark:sm:border-white/10 sm:pl-4">
          <span className="text-[11px] text-ink-muted dark:text-gray-400 block">Chỉ tiêu tiếp nhận:</span>
          <span className="font-mono text-base font-bold text-ink dark:text-white">
            {event.currentParticipants || 0} / {event.maxParticipants} người
          </span>
        </div>
      </div>

      {/* 3-Step Screening Form */}
      <ScreeningForm
        event={event}
        user={user}
        onSubmit={handleRegistrationSubmit}
      />
    </div>
  );
};

export default RegisterDonation;
