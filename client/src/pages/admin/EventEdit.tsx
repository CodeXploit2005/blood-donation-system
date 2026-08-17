import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import eventService from '../../services/eventService';
import EventForm from '../../components/event/EventForm';
import Loading from '../../components/common/Loading';
import { useToast } from '../../components/common/Toast';

export const EventEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-event-edit', id],
    queryFn: () => eventService.getEventById(id),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (formData) => eventService.updateEvent(id, formData),
    onSuccess: () => {
      success('Cập nhật thông tin đợt hiến máu thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      navigate('/admin/events');
    },
    onError: (err) => {
      toastError(err.message || 'Lỗi khi cập nhật đợt hiến máu');
    },
  });

  if (isLoading) {
    return <Loading fullScreen text="Đang tải dữ liệu đợt hiến máu..." />;
  }

  const event = data?.data;

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
          <h1 className="font-display text-2xl font-bold text-ink">Chỉnh Sửa Đợt Hiến Máu</h1>
          <p className="text-xs text-ink-muted mt-1">{event?.title}</p>
        </div>

        {event && (
          <EventForm
            initialData={event}
            onSubmit={(formData) => updateMutation.mutate(formData)}
            isLoading={updateMutation.isPending}
            onCancel={() => navigate('/admin/events')}
          />
        )}
      </div>
    </div>
  );
};

export default EventEdit;
