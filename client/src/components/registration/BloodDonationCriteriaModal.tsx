import React from 'react';
import Modal from '../common/Modal';
import { CheckCircle2, XCircle, AlertCircle, ShieldAlert } from 'lucide-react';

export const BloodDonationCriteriaModal = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tiêu Chuẩn Tham Gia Hiến Máu Tình Nguyện"
      subtitle="Theo Thông tư của Bộ Y Tế và Viện Huyết học — Truyền máu Trung ương"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5 text-xs sm:text-sm text-ink dark:text-gray-200">
        {/* Section 1: Eligible */}
        <div className="p-4 rounded-xl bg-sage-light/60 dark:bg-emerald-950/30 border border-sage/40 dark:border-emerald-700/50 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sage-deep dark:text-emerald-300 text-sm sm:text-base">
            <CheckCircle2 className="w-5 h-5 text-sage" />
            <span>1. Điều kiện tham gia hiến máu:</span>
          </div>
          <ul className="space-y-1.5 text-ink-light dark:text-gray-200 pl-6 list-disc marker:text-sage dark:marker:text-emerald-400">
            <li>Người khỏe mạnh trong độ tuổi từ <strong>18 đến 60 tuổi</strong>.</li>
            <li>Cân nặng: Nam & Nữ đạt từ <strong>45kg trở lên</strong> (đối với hiến máu toàn phần).</li>
            <li>Huyết áp tâm thu 100 - 140 mmHg, huyết áp tâm trương 60 - 90 mmHg; nhịp tim đều 60 - 90 lần/phút.</li>
            <li>Không mắc hoặc không có nguy cơ lây nhiễm các bệnh truyền qua đường máu (HIV, Viêm gan B, Viêm gan C, Giang mai...).</li>
            <li>Khoảng cách tối thiểu giữa hai lần hiến máu toàn phần là <strong>12 tuần (tương đương 84 ngày)</strong>.</li>
          </ul>
        </div>

        {/* Section 2: Ineligible */}
        <div className="p-4 rounded-xl bg-rose-50/70 dark:bg-rose-950/35 border border-rose-200 dark:border-rose-700/50 space-y-2">
          <div className="flex items-center gap-2 font-bold text-rose-800 dark:text-rose-300 text-sm sm:text-base">
            <XCircle className="w-5 h-5 text-rose-600" />
            <span>2. Các trường hợp tạm hoãn hoặc không được hiến:</span>
          </div>
          <ul className="space-y-1.5 text-ink-light dark:text-gray-200 pl-6 list-disc marker:text-rose-500 dark:marker:text-rose-400">
            <li>Đang bị sốt, cảm cúm, ho, nhiễm trùng cấp tính hoặc đang uống thuốc kháng sinh.</li>
            <li>Vừa trải qua phẫu thuật lớn hoặc can thiệp ngoại khoa trong vòng <strong>6 tháng</strong>.</li>
            <li>Xăm hình, xỏ khuyên tai, bấm lỗ cơ thể trong vòng <strong>6 tháng gần nhất</strong>.</li>
            <li>Phụ nữ đang mang thai, đang trong kỳ kinh nguyệt nhiều hoặc đang nuôi con bú dưới 12 tháng.</li>
            <li>Người có tiền sử bệnh lý tim mạch, suy gan, suy thận, hen phế quản nặng, ung thư.</li>
          </ul>
        </div>

        {/* Section 3: Notes before and after */}
        <div className="p-4 rounded-xl bg-sand-light dark:bg-amber-950/25 border border-sand dark:border-amber-700/40 space-y-2">
          <div className="flex items-center gap-2 font-bold text-ink dark:text-amber-200 text-sm sm:text-base">
            <AlertCircle className="w-5 h-5 text-crimson" />
            <span>3. Lời khuyên trước và sau ngày hiến máu:</span>
          </div>
          <ul className="space-y-1.5 text-ink-light dark:text-gray-200 pl-6 list-disc marker:text-crimson dark:marker:text-amber-400">
            <li><strong>Đêm hôm trước:</strong> Ngủ đủ giấc ít nhất 6 tiếng, không thức khuya, không uống rượu, bia, trà đặc hoặc cà phê.</li>
            <li><strong>Buổi sáng đi hiến:</strong> Ăn nhẹ (bánh mì, xôi, cháo...), uống nhiều nước (300 - 500ml nước lọc hoặc sữa tươi). Tuyệt đối <em>không ăn đồ nhiều dầu mỡ/sữa đặc</em>.</li>
            <li>Mang theo <strong>Căn cước công dân (CCCD)</strong> hoặc mã QR đăng ký trên hệ thống.</li>
            <li>Sau khi hiến: Nghỉ ngơi tại chỗ 15 phút, uống nhiều nước, giữ băng ép tại vị trí lấy máu ít nhất 4 - 6 giờ.</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};

export default BloodDonationCriteriaModal;
