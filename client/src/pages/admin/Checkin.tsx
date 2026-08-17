import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ScanLine, Calendar, Users, Droplet, CheckCircle2, ShieldCheck } from 'lucide-react';
import eventService from '../../services/eventService';
import checkinService from '../../services/checkinService';
import QRScanner from '../../components/checkin/QRScanner';
import CheckinTable from '../../components/checkin/CheckinTable';
import Loading from '../../components/common/Loading';
import { useToast } from '../../components/common/Toast';

export const Checkin = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialEventId = searchParams.get('eventId') || '';
  const [selectedEventId, setSelectedEventId] = useState(initialEventId);

  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  // Fetch events list for selection
  const { data: eventsData, isLoading: isEventsLoading } = useQuery({
    queryKey: ['admin-events-checkin-dropdown'],
    queryFn: () => eventService.getEvents({ limit: 50 }),
  });

  const events = eventsData?.data || [];
  const activeEventId = selectedEventId || events[0]?._id;

  // Fetch real-time check-in attendees list for active event
  const { data: checkinFeedData, isLoading: isFeedLoading } = useQuery({
    queryKey: ['admin-checkin-feed', activeEventId],
    queryFn: () => checkinService.getEventCheckinList(activeEventId),
    enabled: !!activeEventId,
    refetchInterval: 1000 * 10, // Poll every 10s for multi-device sync
  });

  const checkinData = checkinFeedData?.data || {
    checkedInList: [],
    totalRegistered: 0,
    totalCheckedIn: 0,
    remaining: 0,
    event: null,
  };

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: (payload) => checkinService.verifyAndCheckIn(payload),
    onSuccess: (res) => {
      success(res.message || 'Điểm danh thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-checkin-feed', activeEventId] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
    },
    onError: (err) => {
      toastError(err.message || 'Lỗi khi điểm danh');
    },
  });

  // Undo check-in mutation
  const undoMutation = useMutation({
    mutationFn: (registrationId) => checkinService.undoCheckIn(registrationId),
    onSuccess: () => {
      success('Đã hoàn tác điểm danh');
      queryClient.invalidateQueries({ queryKey: ['admin-checkin-feed', activeEventId] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
    },
    onError: (err) => {
      toastError(err.message || 'Lỗi khi hoàn tác');
    },
  });

  const handleCheckInSubmit = async (scanPayload) => {
    return checkInMutation.mutateAsync({
      ...scanPayload,
      eventId: activeEventId,
    });
  };

  const handleUndo = (regId) => {
    if (window.confirm('Bạn có chắc chắn muốn hoàn tác điểm danh cho người này?')) {
      undoMutation.mutate(regId);
    }
  };

  if (isEventsLoading) {
    return <Loading fullScreen text="Đang tải dữ liệu điểm danh..." />;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-crimson uppercase tracking-wider mb-1">
            <ScanLine className="w-4 h-4" />
            <span>Quầy Điểm Danh & Tiếp Nhận Hiện Trường</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">
            Quét Mã QR Điểm Danh
          </h1>
        </div>

        {/* Event Selector */}
        <div className="min-w-[280px]">
          <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-1">
            Sự Kiện Đang Diễn Ra
          </label>
          <select
            value={activeEventId || ''}
            onChange={(e) => {
              setSelectedEventId(e.target.value);
              setSearchParams({ eventId: e.target.value });
            }}
            className="w-full px-3.5 py-2.5 rounded-xl border border-sand bg-porcelain-card text-xs font-bold text-ink outline-none focus:border-crimson shadow-sm"
          >
            {events.map((evt) => (
              <option key={evt._id} value={evt._id}>
                {evt.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Live Event Progress Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-porcelain-card border border-sand shadow-warm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-crimson-light text-crimson flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-ink-muted block">Tổng số người đăng ký:</span>
            <span className="font-mono text-xl font-bold text-ink">
              {checkinData.totalRegistered} người
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-porcelain-card border border-sand shadow-warm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sage-light text-sage flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-ink-muted block">Đã điểm danh & hiến máu:</span>
            <span className="font-mono text-xl font-bold text-sage-deep">
              {checkinData.totalCheckedIn} người
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-porcelain-card border border-sand shadow-warm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sand-light text-ink flex items-center justify-center">
            <Droplet className="w-5 h-5 text-crimson" />
          </div>
          <div>
            <span className="text-[11px] text-ink-muted block">Chưa đến điểm danh:</span>
            <span className="font-mono text-xl font-bold text-ink-muted">
              {checkinData.remaining} người
            </span>
          </div>
        </div>
      </div>

      {/* Main QR Camera Scanner Component */}
      <QRScanner
        onCheckInSuccess={handleCheckInSubmit}
        selectedEventId={activeEventId}
      />

      {/* Real-time Attendees Checked-in Feed */}
      <CheckinTable
        checkedInList={checkinData.checkedInList}
        onUndoCheckIn={handleUndo}
        isUndoing={undoMutation.isPending}
      />
    </div>
  );
};

export default Checkin;
