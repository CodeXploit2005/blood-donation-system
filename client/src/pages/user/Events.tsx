import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Calendar, MapPin, SlidersHorizontal } from 'lucide-react';
import eventService from '../../services/eventService';
import EventCard from '../../components/event/EventCard';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/Loading';

export const Events = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['events-list', statusFilter, searchTerm, currentPage],
    queryFn: () =>
      eventService.getEvents({
        status: statusFilter === 'all' ? undefined : statusFilter,
        q: searchTerm || undefined,
        page: currentPage,
        limit: 6,
      }),
  });

  const events = data?.data || [];
  const pagination = data?.pagination || { total: 0, page: 1, limit: 6, totalPages: 1 };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-crimson uppercase tracking-wider">
          <Calendar className="w-4 h-4" />
          <span>Danh Sách Đợt Hiến Máu</span>
        </div>
        <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-ink dark:text-white tracking-tight">
          Các Đợt Hiến Máu Tình Nguyện
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted dark:text-gray-400 max-w-2xl leading-relaxed">
          Tìm kiếm và lựa chọn đợt hiến máu nhân đạo phù hợp nhất với bạn. Bạn có thể đăng ký trước để được ưu tiên phục vụ và nhận mã QR điểm danh.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 rounded-3xl bg-porcelain-card dark:bg-[#1A1E22] border border-sand dark:border-white/10 shadow-warm">
        {/* Search input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-ink-muted dark:text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm theo tên đợt, địa điểm..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-sand dark:border-white/10 bg-porcelain dark:bg-[#23282E] text-ink dark:text-white text-xs sm:text-sm outline-none focus:border-crimson transition font-medium"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'open', label: 'Đang mở đăng ký' },
            { id: 'upcoming', label: 'Sắp diễn ra' },
            { id: 'completed', label: 'Đã hoàn thành' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-crimson text-white shadow-sm'
                  : 'bg-porcelain dark:bg-[#23282E] text-ink-muted dark:text-gray-300 hover:text-ink dark:hover:text-white hover:bg-sand-light dark:hover:bg-white/10 border border-sand dark:border-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="Chưa tìm thấy đợt hiến máu phù hợp"
          description="Hiện tại không có sự kiện nào khớp với tiêu chí tìm kiếm của bạn. Hãy thử thay đổi bộ lọc hoặc từ khóa."
          actionText="Xem tất cả đợt hiến máu"
          onAction={() => {
            setSearchTerm('');
            setStatusFilter('all');
            setCurrentPage(1);
          }}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <EventCard key={event._id} event={event} index={index} />
            ))}
          </div>

          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(p) => setCurrentPage(p)}
          />
        </>
      )}
    </div>
  );
};

export default Events;
