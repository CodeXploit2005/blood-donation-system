import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Share2, ShieldCheck, Heart, Calendar, Clock, MapPin, Sparkles } from 'lucide-react';
import { formatDate, formatTime } from '../../utils/formatDate';
import Button from '../common/Button';

export const QRCodeDisplay = ({ registration, user }) => {
  const cardRef = useRef(null);

  if (!registration) {
    return null;
  }

  const {
    _id,
    eventId,
    fullName = user?.fullName || 'Người hiến máu',
    bloodType = user?.bloodType || 'unknown',
    phone = user?.phone || '',
    identityCardNumber = user?.identityCardNumber || '',
    preferredTimeSlot = '08:00 - 10:00',
    qrCode,
    checkIn,
    donationStatus,
    registeredAt,
  } = registration;

  // Safe QR string calculation
  const qrString =
    qrCode?.code
      ? JSON.stringify({
          regId: String(_id),
          code: qrCode.code,
          tok: qrCode.token ? qrCode.token.substring(0, 16) : 'VERIFIED',
        })
      : String(_id || 'BD-2026-DONATION');

  const downloadQR = () => {
    const svg = document.getElementById('donation-qr-svg');
    if (!svg) return;
    try {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width + 40;
        canvas.height = img.height + 40;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `The_QR_Hien_Mau_${qrCode?.code || 'NhipSong'}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (err) {
      console.warn('QR download fallback:', err);
    }
  };

  const isCheckedIn =
    checkIn?.status === 'checked_in' ||
    donationStatus === 'donated' ||
    donationStatus === 'checked_in';

  return (
    <div className="flex flex-col items-center max-w-sm sm:max-w-md mx-auto w-full">
      {/* Mobile-first Glass Breathing QR Card */}
      <motion.div
        ref={cardRef}
        animate={{
          scale: [1, 1.015, 1],
          boxShadow: [
            '0 10px 30px -5px rgba(196, 56, 74, 0.25)',
            '0 15px 40px -5px rgba(196, 56, 74, 0.45)',
            '0 10px 30px -5px rgba(196, 56, 74, 0.25)',
          ],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="w-full glass-qr rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-crimson/40 bg-porcelain-card/90 dark:bg-ink-card/95"
      >
        {/* Subtle decorative background gradient */}
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-crimson/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-sage/15 blur-2xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex items-center justify-between pb-4 border-b border-sand dark:border-sand/20 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-crimson flex items-center justify-center text-white shadow-sm">
              <Heart className="w-4 h-4 fill-current animate-pulse" />
            </div>
            <div>
              <h4 className="font-display text-sm font-bold text-ink dark:text-porcelain leading-tight">
                Thẻ Điểm Danh Hiến Máu
              </h4>
              <p className="text-[10px] text-ink-muted uppercase tracking-wider font-semibold">
                Nhịp Sống Digital Pass
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-crimson-light dark:bg-crimson/20 text-crimson text-[11px] font-bold border border-crimson/20">
            <Sparkles className="w-3 h-3" />
            <span>{bloodType !== 'unknown' ? `Nhóm ${bloodType}` : 'Người hiến'}</span>
          </div>
        </div>

        {/* Event Title */}
        <div className="py-4 text-center border-b border-sand/60 dark:border-sand/20">
          <h3 className="font-display text-base sm:text-lg font-bold text-ink dark:text-porcelain line-clamp-2">
            {eventId?.title || 'Đợt Hiến Máu Nhân Đạo'}
          </h3>
          <p className="text-xs text-ink-muted mt-1 flex items-center justify-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-crimson inline flex-shrink-0" />
            <span className="truncate max-w-[280px]">{eventId?.location || 'Điểm tiếp nhận'}</span>
          </p>
        </div>

        {/* QR Code Canvas */}
        <div className="my-5 flex flex-col items-center justify-center">
          <div className="p-4 bg-white rounded-3xl border-2 border-sand shadow-inner relative group">
            {/* Corner brackets */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-crimson" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-crimson" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-crimson" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-crimson" />

            <QRCodeSVG
              id="donation-qr-svg"
              value={qrString}
              size={210}
              level="H"
              includeMargin={false}
              fgColor="#1E2226"
            />
          </div>

          {/* Unique alphanumeric code */}
          <div className="mt-3 text-center">
            <span className="text-[11px] text-ink-muted uppercase tracking-wider block font-bold">MÃ XÁC THỰC</span>
            <span className="font-mono text-base sm:text-lg font-bold text-crimson tracking-wider">
              {qrCode?.code || 'BD-2026-PASS'}
            </span>
          </div>
        </div>

        {/* Donor information */}
        <div className="p-4 rounded-2xl bg-sand-light/60 dark:bg-ink-deep border border-sand dark:border-sand/20 space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-ink-muted">Người hiến:</span>
            <span className="font-bold text-ink dark:text-porcelain">{fullName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-ink-muted">Số CCCD / CMND:</span>
            <span className="font-mono font-bold text-ink dark:text-porcelain">{identityCardNumber || 'Chưa cập nhật'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-ink-muted">Khung giờ:</span>
            <span className="font-semibold text-crimson">{preferredTimeSlot}</span>
          </div>
          {eventId?.startDate && (
            <div className="flex justify-between items-center">
              <span className="text-ink-muted">Ngày diễn ra:</span>
              <span className="font-semibold text-ink dark:text-porcelain">{formatDate(eventId.startDate)}</span>
            </div>
          )}
        </div>

        {/* Check-in status tag */}
        <div className="mt-4 text-center">
          {isCheckedIn ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sage-light dark:bg-sage/20 text-sage-deep dark:text-sage border border-sage/40 text-xs font-bold shadow-sm">
              <ShieldCheck className="w-4 h-4 text-sage" />
              <span>ĐÃ TIẾP NHẬN TẠI SỰ KIỆN ({registration.donationVolume || 350}ml)</span>
            </div>
          ) : (
            <span className="text-[11px] text-ink-muted">
              Xuất trình mã này cho tình nguyện viên tại bàn đón tiếp.
            </span>
          )}
        </div>
      </motion.div>

      {/* Action buttons below card */}
      <div className="w-full mt-6 flex gap-3 justify-center">
        <Button
          variant="primary"
          onClick={downloadQR}
          leftIcon={<Download className="w-4 h-4" />}
          className="flex-1"
        >
          Tải Thẻ Về Máy
        </Button>
      </div>
    </div>
  );
};

export default QRCodeDisplay;
