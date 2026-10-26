import React from 'react';
import { Droplet } from 'lucide-react';

export default function DonationResult({ registration }) {
  const donated = registration.donationStatus === 'donated';
  return (
    <div className="rounded-2xl border border-sand bg-porcelain p-4 space-y-2 text-xs">
      <h3 className="flex items-center gap-2 font-bold text-ink"><Droplet className="w-4 h-4 text-crimson" />Kết quả hiến máu của bạn</h3>
      <div className="grid grid-cols-2 gap-3">
        <div><p className="text-ink-muted">Lượng máu thực tế đã hiến</p><p className="mt-1 text-lg font-bold text-crimson">{donated ? (registration.donationVolume > 0 ? `${registration.donationVolume.toLocaleString('vi-VN')} ml` : 'Chưa ghi nhận ml') : 'Chưa có kết quả'}</p></div>
        <div><p className="text-ink-muted">Nhóm máu đã xác nhận</p><p className="mt-1 text-lg font-bold text-ink">{registration.confirmedBloodType && registration.confirmedBloodType !== 'unknown' ? registration.confirmedBloodType : 'Chưa xác nhận'}</p></div>
      </div>
      <p className="text-ink-muted">{donated ? 'Kết quả do quản trị viên hoặc nhân viên y tế ghi nhận. Nếu thông tin chưa đúng, vui lòng liên hệ đơn vị tổ chức.' : 'Kết quả sẽ cập nhật sau khi bạn hoàn tất hiến máu và được ghi nhận tại điểm tiếp nhận.'}</p>
    </div>
  );
}
