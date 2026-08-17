import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { eventFormSchema } from '../../utils/validators';
import Button from '../common/Button';
import { Calendar, MapPin, Building, Phone, Image, Users, FileText } from 'lucide-react';

export const EventForm = ({ initialData = null, onSubmit, isLoading = false, onCancel }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      addressDetails: '',
      startDate: '',
      endDate: '',
      maxParticipants: 100,
      targetBloodUnits: 100,
      statusSelection: 'auto',
      imageUrl: '',
      organizer: 'Hội Chữ Thập Đỏ & Viện Huyết học',
      contactPhone: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        statusSelection:
          initialData.statusMode === 'manual' || ['closed', 'completed'].includes(initialData.status)
            ? initialData.status
            : 'auto',
        startDate: initialData.startDate
          ? new Date(initialData.startDate).toISOString().slice(0, 16)
          : '',
        endDate: initialData.endDate
          ? new Date(initialData.endDate).toISOString().slice(0, 16)
          : '',
      });
    }
  }, [initialData, reset]);

  return (
    <form
      onSubmit={handleSubmit((data) => {
        const { statusSelection, ...eventData } = data;
        onSubmit({
          ...eventData,
          status: statusSelection === 'auto' ? 'upcoming' : statusSelection,
          statusMode: statusSelection === 'auto' ? 'auto' : 'manual',
        });
      })}
      className="space-y-3.5 sm:space-y-4"
    >
      {/* Title */}
      <div>
        <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
          Tiêu đề đợt hiến máu <span className="text-crimson">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            {...register('title')}
            placeholder="vd: Ngày Hội Giọt Hồng Yêu Thương 2026"
            className="w-full px-3.5 py-2.5 rounded-xl border border-sand bg-porcelain-card text-ink text-sm focus:border-crimson focus:ring-1 focus:ring-crimson outline-none transition"
          />
        </div>
        {errors.title && (
          <p className="text-xs text-rose-600 mt-1 font-medium">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
          Mô tả & Ý nghĩa sự kiện <span className="text-crimson">*</span>
        </label>
        <textarea
          rows={3}
          {...register('description')}
          placeholder="Mô tả mục đích, ý nghĩa và đối tượng tham gia tiếp nhận máu..."
          className="w-full px-3.5 py-2 rounded-xl border border-sand bg-porcelain-card text-ink text-sm focus:border-crimson focus:ring-1 focus:ring-crimson outline-none transition"
        />
        {errors.description && (
          <p className="text-xs text-rose-600 mt-1 font-medium">{errors.description.message}</p>
        )}
      </div>

      {/* Location & Address */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
            Địa điểm tổ chức <span className="text-crimson">*</span>
          </label>
          <input
            type="text"
            {...register('location')}
            placeholder="vd: Viện Huyết học - Truyền máu TW"
            className="w-full px-3.5 py-2.5 rounded-xl border border-sand bg-porcelain-card text-ink text-sm focus:border-crimson focus:ring-1 focus:ring-crimson outline-none transition"
          />
          {errors.location && (
            <p className="text-xs text-rose-600 mt-1 font-medium">{errors.location.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
            Địa chỉ cụ thể <span className="text-crimson">*</span>
          </label>
          <input
            type="text"
            {...register('addressDetails')}
            placeholder="vd: Số 1 Phạm Văn Bạch, Cầu Giấy, Hà Nội"
            className="w-full px-3.5 py-2.5 rounded-xl border border-sand bg-porcelain-card text-ink text-sm focus:border-crimson focus:ring-1 focus:ring-crimson outline-none transition"
          />
          {errors.addressDetails && (
            <p className="text-xs text-rose-600 mt-1 font-medium">{errors.addressDetails.message}</p>
          )}
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
            Thời gian bắt đầu <span className="text-crimson">*</span>
          </label>
          <input
            type="datetime-local"
            {...register('startDate')}
            className="w-full px-3.5 py-2.5 rounded-xl border border-sand bg-porcelain-card text-ink text-sm focus:border-crimson focus:ring-1 focus:ring-crimson outline-none transition"
          />
          {errors.startDate && (
            <p className="text-xs text-rose-600 mt-1 font-medium">{errors.startDate.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
            Thời gian kết thúc <span className="text-crimson">*</span>
          </label>
          <input
            type="datetime-local"
            {...register('endDate')}
            className="w-full px-3.5 py-2.5 rounded-xl border border-sand bg-porcelain-card text-ink text-sm focus:border-crimson focus:ring-1 focus:ring-crimson outline-none transition"
          />
          {errors.endDate && (
            <p className="text-xs text-rose-600 mt-1 font-medium">{errors.endDate.message}</p>
          )}
        </div>
      </div>

      {/* Target numbers & Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
            Số người tối đa <span className="text-crimson">*</span>
          </label>
          <input
            type="number"
            {...register('maxParticipants')}
            className="w-full px-3.5 py-2.5 rounded-xl border border-sand bg-porcelain-card text-ink text-sm focus:border-crimson focus:ring-1 focus:ring-crimson outline-none transition"
          />
          {errors.maxParticipants && (
            <p className="text-xs text-rose-600 mt-1 font-medium">{errors.maxParticipants.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
            Chỉ tiêu đơn vị máu <span className="text-crimson">*</span>
          </label>
          <input
            type="number"
            {...register('targetBloodUnits')}
            className="w-full px-3.5 py-2.5 rounded-xl border border-sand bg-porcelain-card text-ink text-sm focus:border-crimson focus:ring-1 focus:ring-crimson outline-none transition"
          />
          {errors.targetBloodUnits && (
            <p className="text-xs text-rose-600 mt-1 font-medium">{errors.targetBloodUnits.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
            Chế độ trạng thái
          </label>
          <select
            {...register('statusSelection')}
            className="w-full px-3.5 py-2.5 rounded-xl border border-sand bg-porcelain-card text-ink text-sm focus:border-crimson focus:ring-1 focus:ring-crimson outline-none transition"
          >
            <option value="auto">Tự động theo thời gian</option>
            <option value="upcoming">Sắp diễn ra — thủ công</option>
            <option value="open">Đang mở đăng ký — thủ công</option>
            <option value="closed">Đã đóng tiếp nhận (closed)</option>
            <option value="completed">Đã hoàn thành (completed)</option>
          </select>
          <p className="mt-1 text-[11px] leading-relaxed text-ink-muted">
            Chọn thủ công để giữ nguyên trạng thái. Chọn tự động để trạng thái thay đổi theo ngày tổ chức.
          </p>
        </div>
      </div>

      {/* Organizer & Phone & Image */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
            Đơn vị tổ chức <span className="text-crimson">*</span>
          </label>
          <input
            type="text"
            {...register('organizer')}
            className="w-full px-3.5 py-2.5 rounded-xl border border-sand bg-porcelain-card text-ink text-sm focus:border-crimson focus:ring-1 focus:ring-crimson outline-none transition"
          />
          {errors.organizer && (
            <p className="text-xs text-rose-600 mt-1 font-medium">{errors.organizer.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
            Số điện thoại hotline <span className="text-crimson">*</span>
          </label>
          <input
            type="text"
            {...register('contactPhone')}
            placeholder="vd: 0988123456"
            className="w-full px-3.5 py-2.5 rounded-xl border border-sand bg-porcelain-card text-ink text-sm focus:border-crimson focus:ring-1 focus:ring-crimson outline-none transition"
          />
          {errors.contactPhone && (
            <p className="text-xs text-rose-600 mt-1 font-medium">{errors.contactPhone.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
            Link ảnh bìa (URL)
          </label>
          <input
            type="text"
            {...register('imageUrl')}
            placeholder="https://..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-sand bg-porcelain-card text-ink text-sm focus:border-crimson focus:ring-1 focus:ring-crimson outline-none transition"
          />
        </div>
      </div>

      {/* Form Buttons */}
      <div className="sticky -bottom-4 sm:-bottom-6 z-10 -mx-4 sm:-mx-8 mt-5 grid grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-end sm:gap-3 border-t border-sand/60 bg-porcelain-card dark:bg-[#1A1E22] px-4 sm:px-8 pb-1 pt-4 sm:pb-2">
        {onCancel && (
          <Button className="w-full sm:w-auto" variant="ghost" onClick={onCancel} disabled={isLoading}>
            Hủy Bỏ
          </Button>
        )}
        <Button className="w-full sm:w-auto px-2 sm:px-4" type="submit" variant="primary" isLoading={isLoading}>
          {initialData ? 'Cập Nhật Đợt Hiến Máu' : 'Tạo Đợt Hiến Máu Mới'}
        </Button>
      </div>
    </form>
  );
};

export default EventForm;
