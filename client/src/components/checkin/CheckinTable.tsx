import React from 'react';
import { formatTime, formatDate } from '../../utils/formatDate';
import { CheckCircle2, RotateCcw, Droplet, User, Phone, ShieldCheck } from 'lucide-react';
import Button from '../common/Button';

export const CheckinTable = ({ checkedInList = [], onUndoCheckIn, isUndoing = false }) => {
  if (checkedInList.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-sand-light/40 border border-sand text-center text-xs text-ink-muted">
        Chưa có người nào được điểm danh trong phiên này. Hãy hướng camera vào mã QR để bắt đầu.
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-sand bg-porcelain-card shadow-warm">
      <div className="p-4 bg-sand-light/70 border-b border-sand flex items-center justify-between">
        <h4 className="font-display text-sm font-bold text-ink flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-sage" />
          <span>Danh Sách Vừa Điểm Danh ({checkedInList.length} người)</span>
        </h4>
        <span className="text-[11px] text-ink-muted">Tự động cập nhật thời gian thực</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-porcelain text-ink-muted uppercase tracking-wider text-[11px] border-b border-sand/60">
            <tr>
              <th className="px-4 py-3 font-bold">Thời Gian</th>
              <th className="px-4 py-3 font-bold">Họ Và Tên</th>
              <th className="px-3 py-3 font-bold text-center">Nhóm Máu</th>
              <th className="px-3 py-3 font-bold text-center">Thể Tích</th>
              <th className="px-4 py-3 font-bold">Ghi Chú Y Tế</th>
              <th className="px-4 py-3 font-bold text-right">Hoàn Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand/50">
            {checkedInList.map((item) => (
              <tr key={item._id} className="hover:bg-sand-light/40 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap font-mono text-ink-light">
                  {item.checkIn?.checkInTime ? formatTime(item.checkIn.checkInTime) : ''}
                </td>

                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-bold text-ink">{item.fullName}</span>
                    <span className="text-[11px] text-ink-muted font-mono">{item.phone}</span>
                  </div>
                </td>

                <td className="px-3 py-3 text-center">
                  <span className="inline-block px-2 py-0.5 rounded-full font-bold text-[11px] bg-crimson-light text-crimson border border-crimson/20">
                    {item.bloodType}
                  </span>
                </td>

                <td className="px-3 py-3 text-center font-bold font-mono text-sage-deep">
                  {item.checkIn?.actualVolumeMl || 350} ml
                </td>

                <td className="px-4 py-3 text-ink-muted text-[11px] max-w-[200px] truncate">
                  {item.checkIn?.nurseNotes || 'Thể trạng bình thường'}
                </td>

                <td className="px-4 py-3 text-right">
                  {onUndoCheckIn && (
                    <button
                      onClick={() => onUndoCheckIn(item._id)}
                      disabled={isUndoing}
                      title="Hoàn tác điểm danh nếu quét nhầm"
                      className="p-1.5 rounded-lg border border-sand hover:border-rose-400 hover:bg-rose-50 text-ink-muted hover:text-rose-600 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CheckinTable;
