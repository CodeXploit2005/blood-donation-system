import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, PlusCircle, QrCode, Calendar, Heart } from 'lucide-react';
import registrationService from '../../services/registrationService';
import RegistrationStatus from '../../components/registration/RegistrationStatus';
import EmptyState from '../../components/common/EmptyState';
import Loading, { CardSkeleton } from '../../components/common/Loading';
import Button from '../../components/common/Button';
import { useToast } from '../../components/common/Toast';
import useAuth from '../../hooks/useAuth';

export const MyRegistrations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const { data, isLoading } = useQuery({
    refetchInterval: 15000,
    queryKey: ['my-registrations', user?._id],
    enabled: !!user?._id,
    queryFn: ({ signal }) => registrationService.getMyRegistrations(signal),
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => registrationService.cancelRegistration(id),
    onSuccess: () => {
      success('Hủy đăng ký hiến máu thành công');
      queryClient.invalidateQueries();
    },
    onError: (err) => {
      toastError(err.message || 'Lỗi khi hủy đăng ký');
    },
  });

  const registrations = data?.data || [];
  const donations = registrations.filter(reg => reg.donationStatus === 'donated');
  const totalVolume = donations.reduce((total, reg) => total + (reg.donationVolume > 0 ? reg.donationVolume : 0), 0);
  const missingVolume = donations.filter(reg => !(reg.donationVolume > 0)).length;

  const handleCancelRegistration = (reg) => {
    if (window.confirm(`Bạn có chắc chắn muốn hủy đơn đăng ký cho đợt "${reg.eventId?.title}"?`)) {
      cancelMutation.mutate(reg._id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-crimson uppercase tracking-wider mb-1">
            <ClipboardList className="w-4 h-4" />
            <span>Lịch Sử Đăng Ký Của Tôi</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink dark:text-white">
            Các Đợt Hiến Máu Đã Tham Gia
          </h1>
        </div>

        <Link to="/events">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Đăng Ký Đợt Mới
          </Button>
        </Link>
      </div>

      {!isLoading && registrations.length > 0 && <div className="rounded-2xl border border-sand bg-porcelain-card p-5">
        <p className="font-bold text-ink">Kết quả hiến máu của tôi</p>
        <p className="mt-2 text-xl font-bold text-crimson">{donations.length} lần đã hiến · {totalVolume.toLocaleString('vi-VN')} ml đã ghi nhận</p>
        {!!missingVolume && <p className="mt-1 text-xs text-ink-muted">{missingVolume} lần hiến chưa được nhập số ml, chưa tính vào tổng lượng máu.</p>}
      </div>}

      {/* Registrations List */}
      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : registrations.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Bạn chưa có đơn đăng ký hiến máu nào"
          description="Hãy khám phá các đợt hiến máu tình nguyện đang mở và bắt đầu hành trình trao gửi sự sống!"
          actionText="Tìm đợt hiến máu ngay"
          onAction={() => (window.location.href = '/events')}
        />
      ) : (
        <div className="space-y-4">
          {registrations.map((reg) => (
            <RegistrationStatus
              key={reg._id}
              registration={reg}
              onCancel={handleCancelRegistration}
              isCancelling={cancelMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRegistrations;
