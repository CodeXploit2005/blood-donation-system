import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Calendar } from 'lucide-react';
import eventService from '../../services/eventService';
import EventForm from '../../components/event/EventForm';
import { useToast } from '../../components/common/Toast';

export const EventCreate = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const createMutation = useMutation({
    mutationFn: (newEvent) => eventService.createEvent(newEvent),
    onSuccess: () => {
      success('Tạo đợt hiến máu mới thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      navigate('/admin/events');
    },
    onError: (err) => {
      toastError(err.message || 'Lỗi khi tạo đợt hiến máu');
    },
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/admin/events')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-ink-muted hover:text-crimson transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại quản lý đợt</span>
      </button>

      <div className="p-6 sm:p-8 rounded-3xl bg-porcelain-card border border-sand shadow-warm space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Tạo Đợt Hiến Máu Mới</h1>
          <p className="text-xs text-ink-muted mt-1">
            Điền các thông tin tổ chức, chỉ tiêu và khung giờ tiếp nhận người tình nguyện
          </p>
        </div>

        <EventForm
          onSubmit={(data) => createMutation.mutate(data)}
          isLoading={createMutation.isPending}
          onCancel={() => navigate('/admin/events')}
        />
      </div>
    </div>
  );
};

export default EventCreate;
