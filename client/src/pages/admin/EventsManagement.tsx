import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, Search, Filter, Calendar } from 'lucide-react';
import eventService from '../../services/eventService';
import EventTable from '../../components/event/EventTable';
import EventForm from '../../components/event/EventForm';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../components/common/Toast';

export const EventsManagement = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-events', searchTerm, currentPage],
    queryFn: () =>
      eventService.getEvents({
        q: searchTerm || undefined,
        page: currentPage,
        limit: 10,
      }),
  });

  const events = data?.data || [];
  const pagination = data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

  // Create event mutation
  const createMutation = useMutation<any, Error, any>({
    mutationFn: (newEvent) => eventService.createEvent(newEvent),
    onSuccess: () => {
      success('Tạo đợt hiến máu mới thành công!');
      setIsCreateModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
    },
    onError: (err) => {
      toastError(err.message || 'Lỗi khi tạo đợt hiến máu');
    },
  });

  // Update event mutation
  const updateMutation = useMutation<any, Error, { id: string; data: any }>({
    mutationFn: ({ id, data }) => eventService.updateEvent(id, data),
    onSuccess: () => {
      success('Cập nhật đợt hiến máu thành công!');
      setEditingEvent(null);
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
    },
    onError: (err) => {
      toastError(err.message || 'Lỗi khi cập nhật đợt hiến máu');
    },
  });

  // Delete event mutation
  const deleteMutation = useMutation<any, Error, string>({
    mutationFn: (id) => eventService.deleteEvent(id),
    onSuccess: () => {
      success('Đã xóa đợt hiến máu thành công');
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
    },
    onError: (err) => {
      toastError(err.message || 'Lỗi khi xóa đợt hiến máu');
    },
  });

  const handleEdit = (event) => {
    setEditingEvent(event);
  };

  const handleDelete = (event) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa đợt hiến máu "${event.title}"?`)) {
      deleteMutation.mutate(event._id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            Quản Lý Đợt Hiến Máu
          </h1>
          <p className="text-xs text-ink-muted">
            Tạo mới, chỉnh sửa thông tin, phân bổ chỉ tiêu và kiểm soát trạng thái sự kiện
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
          leftIcon={<PlusCircle className="w-4 h-4" />}
        >
          Tạo Đợt Hiến Mới
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-4 rounded-2xl bg-porcelain-card border border-sand shadow-warm flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm theo tên đợt, địa điểm..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-sand bg-porcelain text-ink text-xs sm:text-sm outline-none focus:border-crimson"
          />
        </div>
      </div>

      {/* Events Table */}
      {events.length === 0 && !isLoading ? (
        <EmptyState
          icon={Calendar}
          title="Chưa có đợt hiến máu nào"
          description="Bắt đầu tạo đợt hiến máu đầu tiên để tiếp nhận người đăng ký tình nguyện."
          actionText="Tạo đợt đầu tiên ngay"
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <>
          <EventTable
            events={events}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(p) => setCurrentPage(p)}
          />
        </>
      )}

      {/* Create Event Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Tạo Đợt Hiến Máu Mới"
        subtitle="Điền các thông tin tổ chức, chỉ tiêu và khung giờ tiếp nhận"
        maxWidth="max-w-2xl"
      >
        <EventForm
          onSubmit={(data) => createMutation.mutate(data)}
          isLoading={createMutation.isPending}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Edit Event Modal */}
      <Modal
        isOpen={!!editingEvent}
        onClose={() => setEditingEvent(null)}
        title="Chỉnh Sửa Đợt Hiến Máu"
        subtitle={`Cập nhật thông tin: ${editingEvent?.title}`}
        maxWidth="max-w-2xl"
      >
        {editingEvent && (
          <EventForm
            initialData={editingEvent}
            onSubmit={(data) => updateMutation.mutate({ id: editingEvent._id, data })}
            isLoading={updateMutation.isPending}
            onCancel={() => setEditingEvent(null)}
          />
        )}
      </Modal>
    </div>
  );
};

export default EventsManagement;
