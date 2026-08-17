import React from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Trash2, Users, ScanLine, ExternalLink, Calendar, MapPin } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';
import { EVENT_STATUS_LABELS, EVENT_STATUS_COLORS } from '../../utils/constants';

export const EventTable = ({ events = [], onEdit, onDelete, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="w-full bg-porcelain-card rounded-2xl border border-sand p-8 text-center animate-pulse">
        Đang tải danh sách đợt hiến máu...
      </div>
    );
  }

  if (events.length === 0) {
    return null;
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-sand bg-porcelain-card shadow-warm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-sand-light/70 text-ink-muted uppercase tracking-wider text-[11px] border-b border-sand">
            <tr>
              <th className="px-5 py-4 font-bold">Đợt Hiến Máu</th>
              <th className="px-4 py-4 font-bold">Thời Gian</th>
              <th className="px-4 py-4 font-bold">Địa Điểm</th>
              <th className="px-4 py-4 font-bold text-center">Đã Đăng Ký</th>
              <th className="px-4 py-4 font-bold text-center">Trạng Thái</th>
              <th className="px-5 py-4 font-bold text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand/60">
            {events.map((event) => (
              <tr
                key={event._id}
                className="hover:bg-sand-light/40 transition-colors group"
              >
                {/* Title & Organizer */}
                <td className="px-5 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-ink text-sm group-hover:text-crimson transition-colors line-clamp-1">
                      {event.title}
                    </span>
                    <span className="text-[11px] text-ink-muted line-clamp-1 mt-0.5">
                      {event.organizer}
                    </span>
                  </div>
                </td>

                {/* Dates */}
                <td className="px-4 py-4 whitespace-nowrap text-ink-light font-medium">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-crimson flex-shrink-0" />
                    <span>
                      {formatDate(event.startDate)} - {formatDate(event.endDate)}
                    </span>
                  </div>
                </td>

                {/* Location */}
                <td className="px-4 py-4 text-ink-light">
                  <div className="flex items-center gap-1.5 max-w-[200px] truncate">
                    <MapPin className="w-3.5 h-3.5 text-crimson flex-shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                </td>

                {/* Registered / Capacity */}
                <td className="px-4 py-4 text-center whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-porcelain border border-sand text-ink font-mono font-bold">
                    <Users className="w-3.5 h-3.5 text-crimson" />
                    {event.currentParticipants} / {event.maxParticipants}
                  </span>
                </td>

                {/* Status Badge */}
                <td className="px-4 py-4 text-center whitespace-nowrap">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                      EVENT_STATUS_COLORS[event.status] || EVENT_STATUS_COLORS.open
                    }`}
                  >
                    {EVENT_STATUS_LABELS[event.status] || event.status}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-5 py-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      to={`/admin/registrations?eventId=${event._id}`}
                      title="Xem danh sách người đăng ký"
                      className="p-1.5 rounded-lg border border-sand hover:border-crimson hover:bg-crimson-light text-ink-muted hover:text-crimson transition-colors"
                    >
                      <Users className="w-4 h-4" />
                    </Link>

                    <Link
                      to={`/admin/checkin?eventId=${event._id}`}
                      title="Quét mã QR điểm danh tại chỗ"
                      className="p-1.5 rounded-lg border border-sand hover:border-crimson hover:bg-crimson text-ink-muted hover:text-white transition-all shadow-sm"
                    >
                      <ScanLine className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => onEdit(event)}
                      title="Chỉnh sửa thông tin"
                      className="p-1.5 rounded-lg border border-sand hover:border-amber-400 hover:bg-amber-50 text-ink-muted hover:text-amber-700 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDelete(event)}
                      title="Xóa đợt hiến máu"
                      className="p-1.5 rounded-lg border border-sand hover:border-rose-400 hover:bg-rose-50 text-ink-muted hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EventTable;
