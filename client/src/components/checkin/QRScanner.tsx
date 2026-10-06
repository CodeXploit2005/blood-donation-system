import jsQR from 'jsqr';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import {
  Camera,
  Upload,
  Keyboard,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Heart,
  Volume2,
  RefreshCw,
  FlipHorizontal2,
  X,
  ScanLine,
} from 'lucide-react';
import Button from '../common/Button';
import Modal from '../common/Modal';
import checkinService from '../../services/checkinService';

export const QRScanner = ({ onCheckInSuccess, selectedEventId = null, selectedEventTitle = 'Đợt đang chọn', onEventChange }) => {
  const [scanMode, setScanMode] = useState('camera'); // 'camera' | 'upload' | 'manual'
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isPreviewMirrored, setIsPreviewMirrored] = useState(true);
  const [matchedRegistration, setMatchedRegistration] = useState(null);
  const [scannerError, setScannerError] = useState(null);
  const [scanFlash, setScanFlash] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check-in modal parameters
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const html5QrCodeRef = useRef(null);
  const fileInputRef = useRef(null);

  const cameraQueueRef = useRef(Promise.resolve());
  const cameraGenerationRef = useRef(0);
  const scanLockedRef = useRef(false);
  const resultHandlerRef = useRef(null);
  const decoderTimerRef = useRef(null);
  const lastScanRef = useRef({ value: null, until: 0 });
  const lookupGenerationRef = useRef(0);
  const pendingEventScanRef = useRef(null);
  const [notice, setNotice] = useState(null);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);

  // Decode raw pixels independently of the CSS crop and mirrored preview.
  const startPixelDecoder = (generation) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });
    let frame = 0;
    const decode = () => {
      if (generation !== cameraGenerationRef.current) return;
      const video = document.querySelector<HTMLVideoElement>('#qr-reader-viewport video');
      if (!scanLockedRef.current && context && video?.readyState >= 2 && video.videoWidth) {
        const width = video.videoWidth, height = video.videoHeight;
        const crop = frame % 3 !== 0;
        const side = Math.min(width, height);
        const sourceWidth = crop ? side : width, sourceHeight = crop ? side : height;
        const scale = Math.min(1, (frame % 3 === 2 ? 960 : 640) / Math.max(sourceWidth, sourceHeight));
        canvas.width = Math.round(sourceWidth * scale);
        canvas.height = Math.round(sourceHeight * scale);
        context.drawImage(video, crop ? (width-side)/2 : 0, crop ? (height-side)/2 : 0, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
        const result = jsQR(pixels.data, pixels.width, pixels.height, { inversionAttempts: 'attemptBoth' });
        if (result?.data) resultHandlerRef.current?.(result.data);
        frame++;
      }
      decoderTimerRef.current = window.setTimeout(decode, 120);
    };
    decode();
  };

  const releaseCamera = async () => {
    window.clearTimeout(decoderTimerRef.current);
    const scanner = html5QrCodeRef.current;
    html5QrCodeRef.current = null;
    if (!scanner) return;
    try {
      if (scanner.isScanning) await scanner.stop();
      scanner.clear();
    } catch (error) { console.warn('Camera cleanup failed', error); }
  };

  const startCamera = () => {
    const generation = ++cameraGenerationRef.current;
    cameraQueueRef.current = cameraQueueRef.current.then(async () => {
      await releaseCamera();
      if (generation !== cameraGenerationRef.current || !document.getElementById('qr-reader-viewport')) return;
      setIsScanning(false);
      setScannerError(null);
      scanLockedRef.current = false;
      const scanner = new Html5Qrcode('qr-reader-viewport', {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        useBarCodeDetectorIfSupported: true,
        verbose: false,
      });
      html5QrCodeRef.current = scanner;
      try {
        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 15,
            aspectRatio: 1,
            disableFlip: false,
            videoConstraints: {
              facingMode: { ideal: 'environment' },
              width: { ideal: 1080 }, height: { ideal: 1080 }, aspectRatio: { ideal: 1 },
            },
          },
          (decodedText) => {
            if (generation === cameraGenerationRef.current) resultHandlerRef.current?.(decodedText);
          },
          () => {}
        );
        if (generation !== cameraGenerationRef.current) { await releaseCamera(); return; }
        const settings = scanner.getRunningTrackSettings();
        setIsPreviewMirrored(settings.facingMode !== 'environment');
        setIsScanning(true);
        startPixelDecoder(generation);
      } catch (error) {
        await releaseCamera();
        if (generation !== cameraGenerationRef.current) return;
        setScannerError('Không thể khởi động camera. Vui lòng kiểm tra quyền máy ảnh, đóng ứng dụng đang dùng camera hoặc tải ảnh QR.');
        setIsScanning(false);
      }
    }).catch((error) => console.warn('Camera operation failed', error));
  };

  const stopCamera = () => {
    ++cameraGenerationRef.current;
    cameraQueueRef.current = cameraQueueRef.current.then(releaseCamera).catch(() => {});
  };

  useEffect(() => {
    if (scanMode === 'camera') startCamera();
    return () => { ++lookupGenerationRef.current; stopCamera(); };
  }, [scanMode]);

  useEffect(() => {
    if (!checkInModalOpen && !isProcessing) {
      scanLockedRef.current = false;
      try { html5QrCodeRef.current?.resume(); } catch { /* Scanner may already be running. */ }
    }
  }, [checkInModalOpen, isProcessing]);

  useEffect(() => {
    ++lookupGenerationRef.current;
    setCheckInModalOpen(false);
    setIsLookingUp(false);
    setScannerError(null);
    setNotice(null);
    lastScanRef.current = { value: null, until: 0 };
    scanLockedRef.current = false;
    try { html5QrCodeRef.current?.resume(); } catch {}
    const pending = pendingEventScanRef.current;
    if (pending?.eventId === selectedEventId) {
      pendingEventScanRef.current = null;
      handleScannedResult(pending.qrData, 'manual');
    }
  }, [selectedEventId]);

  // Process scanned QR payload
  const handleScannedResult = async (decodedText, source = 'camera') => {
    if (!decodedText || scanLockedRef.current) return;
    if (source === 'camera' && lastScanRef.current.value === decodedText && Date.now() < lastScanRef.current.until) return;
    const generation = ++lookupGenerationRef.current;
    setNotice(null);
    setMatchedRegistration(null);
    scanLockedRef.current = true;
    setIsLookingUp(true);
    try { html5QrCodeRef.current?.pause(); } catch { /* Upload/manual mode has no running camera. */ }

    // Trigger visual flash and haptic bounce
    setScanFlash(true);
    setTimeout(() => setScanFlash(false), 400);

    // Vibration API if supported
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }

    try {
      setScannerError(null);
      const response = await checkinService.lookup({ qrData: decodedText, eventId: selectedEventId });
      if (generation !== lookupGenerationRef.current) return;
      setMatchedRegistration(response.data);
      setScannedData(decodedText);
      setCheckInModalOpen(true);
    } catch (error) {
      if (generation !== lookupGenerationRef.current) return;
      setScannerError(error.message || 'Không tìm thấy đơn đăng ký');
      lastScanRef.current = { value: decodedText, until: Date.now() + 5000 };
      setTimeout(() => {
        if (generation !== lookupGenerationRef.current) return;
        scanLockedRef.current = false;
        try { html5QrCodeRef.current?.resume(); } catch {}
      }, 2000);
    } finally {
      if (generation === lookupGenerationRef.current) setIsLookingUp(false);
    }
  };

  resultHandlerRef.current = handleScannedResult;

  // Image upload scanning
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = '';
    if (scanLockedRef.current || isReadingFile) return;
    setIsReadingFile(true);
    let reader;
    try {
      setScannerError(null);
      reader = new Html5Qrcode('qr-reader-viewport-hidden');
      const decodedResult = await reader.scanFile(file, false);
      await handleScannedResult(decodedResult, 'upload');
    } catch {
      setScannerError('Không đọc được QR trong ảnh. Chọn ảnh rõ nét, có đủ bốn góc mã và không bị cắt.');
    } finally {
      try { reader?.clear(); } catch {}
      setIsReadingFile(false);
    }
  };

  const closeResult = () => {
    if (isProcessing) return;
    lastScanRef.current = { value: scannedData, until: Date.now() + 5000 };
    setCheckInModalOpen(false);
    setScannedData(null);
    setManualCode('');
    setNotice('Sẵn sàng tiếp nhận người tiếp theo. Đưa mã vừa quét ra khỏi camera trước khi quét tiếp.');
  };

  const switchToMatchedEvent = () => {
    if (!matchedRegistration?.eventMismatch || !onEventChange) return;
    pendingEventScanRef.current = { eventId: matchedRegistration.event._id, qrData: scannedData };
    onEventChange(matchedRegistration.event);
  };

  // Submit check-in confirmation
  const handleConfirmCheckIn = async () => {
    if (!scannedData || isProcessing || !matchedRegistration?.canCheckIn || matchedRegistration?.eventMismatch) return;
    setScannerError(null);
    setIsProcessing(true);
    try {
      await onCheckInSuccess({
        qrData: scannedData,
        eventId: selectedEventId,
        action: 'presence',
      });
      setMatchedRegistration(previous => ({ ...previous, donationStatus: 'checked_in', canCheckIn: false, checkedInAt: new Date().toISOString() }));
      setNotice('Điểm danh thành công. Đã ghi nhận người đăng ký có mặt.');
    } catch (err) {
      setScannerError(err.message || 'Chưa thể xác nhận. Vui lòng thử lại.');
      try {
        const refreshed = await checkinService.lookup({ qrData: scannedData, eventId: selectedEventId });
        setMatchedRegistration(refreshed.data);
      } catch {}
    } finally {
      setIsProcessing(false);
    }
  };

    const statusLabels = { registered: 'Chờ điểm danh', screened_eligible: 'Đủ điều kiện sơ bộ', checked_in: 'Đã điểm danh', donated: 'Đã hiến máu', cancelled: 'Đã hủy đăng ký', screened_ineligible: 'Không đủ điều kiện', no_show: 'Đã ghi nhận vắng mặt' };
  const alreadyReceived = matchedRegistration && ['checked_in', 'donated'].includes(matchedRegistration.donationStatus);
  const format = (value, time = false) => value ? new Date(value).toLocaleString('vi-VN', time ? {} : { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Chưa có thông tin';
  const detail = (label, value) => <div className="min-w-0"><dt className="text-xs text-ink-muted dark:text-gray-400 mb-1">{label}</dt><dd className="font-semibold break-words">{value || 'Chưa cung cấp'}</dd></div>;


  return (
    <div className="w-full bg-porcelain-card dark:bg-ink-card rounded-3xl border border-sand dark:border-sand/20 shadow-warm p-6 sm:p-8">
      {/* Hidden div for file scanning */}
      <div id="qr-reader-viewport-hidden" className="hidden" />

      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-center p-1.5 rounded-2xl bg-sand-light dark:bg-ink-deep max-w-md mx-auto mb-6">
        <button
          onClick={() => setScanMode('camera')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all ${
            scanMode === 'camera'
              ? 'bg-porcelain-card dark:bg-ink-card text-crimson shadow-sm'
              : 'text-ink-muted hover:text-ink hover:bg-black/5 dark:hover:text-white dark:hover:bg-white/5'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Camera Trực Tiếp</span>
        </button>

        <button
          onClick={() => setScanMode('upload')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all ${
            scanMode === 'upload'
              ? 'bg-porcelain-card dark:bg-ink-card text-crimson shadow-sm'
              : 'text-ink-muted hover:text-ink hover:bg-black/5 dark:hover:text-white dark:hover:bg-white/5'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Tải Ảnh QR</span>
        </button>

        <button
          onClick={() => setScanMode('manual')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all ${
            scanMode === 'manual'
              ? 'bg-porcelain-card dark:bg-ink-card text-crimson shadow-sm'
              : 'text-ink-muted hover:text-ink hover:bg-black/5 dark:hover:text-white dark:hover:bg-white/5'
          }`}
        >
          <Keyboard className="w-4 h-4" />
          <span>Nhập Mã</span>
        </button>
      </div>

      {/* Mode 1: Camera Scanner */}
      {scanMode === 'camera' && (
        <div className="flex flex-col items-center">
          <div className="relative aspect-square w-full max-w-sm rounded-3xl overflow-hidden bg-black shadow-warm-lg">
            {/* Camera Viewport */}
            <div
              id="qr-reader-viewport"
              className={`w-full h-full [&_video]:block [&_video]:!w-full [&_video]:!h-full [&_video]:object-cover ${isPreviewMirrored ? '[&_video]:[transform:scaleX(-1)]' : '[&_video]:[transform:none]'}`}
            />

            {/* Flash Overlay */}
            {scanFlash && (
              <motion.div
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 0 }}
                className="absolute inset-0 bg-white z-30 pointer-events-none"
              />
            )}

            {/* Laser Line Scanning Effect */}
            <div className="absolute inset-x-8 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-crimson to-transparent shadow-[0_0_12px_#C4384A] animate-laser-scan pointer-events-none z-20" />

            {/* Viewfinder animated 4 corner brackets */}
            <div className="absolute inset-8 pointer-events-none z-20 flex flex-col justify-between">
              <div className="flex justify-between">
                <div className="w-7 h-7 border-t-4 border-l-4 border-crimson rounded-tl-lg shadow-pulse-glow" />
                <div className="w-7 h-7 border-t-4 border-r-4 border-crimson rounded-tr-lg shadow-pulse-glow" />
              </div>
              <div className="flex justify-between">
                <div className="w-7 h-7 border-b-4 border-l-4 border-crimson rounded-bl-lg shadow-pulse-glow" />
                <div className="w-7 h-7 border-b-4 border-r-4 border-crimson rounded-br-lg shadow-pulse-glow" />
              </div>
            </div>

            {/* Central Aim Indicator */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <ScanLine className="w-12 h-12 text-crimson/40 animate-pulse" />
            </div>
          </div>

          <div className="mt-4 text-center">
            <p role="status" aria-live="polite" className="mb-2 text-xs font-semibold text-crimson">
              {isLookingUp ? 'Đã đọc QR — đang tìm thông tin đăng ký…' : isScanning ? 'Camera sẵn sàng — tự động nhận mã QR' : 'Đang mở camera…'}
            </p>
            <p className="text-xs font-bold text-ink dark:text-porcelain">
              Căn chỉnh mã QR của người hiến vào trung tâm khung quét
            </p>
            <p className="text-[11px] text-ink-muted mt-0.5">
              Đưa toàn bộ mã QR vào khung, giữ yên và tránh ánh sáng phản chiếu lên mã.
            </p>

            <div className="mt-3 flex flex-wrap justify-center gap-4">
            <button
              type="button"
              onClick={() => setIsPreviewMirrored((mirrored) => !mirrored)}
              disabled={!isScanning}
              aria-pressed={isPreviewMirrored}
              className="inline-flex items-center gap-1.5 text-xs text-crimson hover:underline font-semibold disabled:opacity-50"
            >
              <FlipHorizontal2 className="w-3.5 h-3.5" />
              Lật hình camera
            </button>
            <button
              type="button"
              onClick={startCamera}
              className="inline-flex items-center gap-1.5 text-xs text-crimson hover:underline font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Khởi động lại Camera
            </button>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Upload image */}
      {scanMode === 'upload' && (
        <div className="max-w-md mx-auto text-center py-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          <div
            onClick={() => !isReadingFile && fileInputRef.current?.click()}
            className="p-8 border-2 border-dashed border-sand-dark dark:border-sand/30 rounded-3xl bg-sand-light/40 dark:bg-ink-deep hover:bg-sand-light hover:border-crimson cursor-pointer transition-all flex flex-col items-center justify-center gap-3 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-crimson-light dark:bg-crimson/20 text-crimson flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-ink dark:text-porcelain group-hover:text-crimson">
                {isReadingFile ? 'Đang đọc ảnh QR…' : 'Nhấn để chọn ảnh chứa mã QR'}
              </p>
              <p className="text-xs text-ink-muted mt-1">Hỗ trợ định dạng JPG, PNG, WEBP</p>
            </div>
          </div>
        </div>
      )}

      {/* Mode 3: Manual Code Entry */}
      {scanMode === 'manual' && (
        <div className="max-w-md mx-auto text-center py-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-ink dark:text-porcelain uppercase tracking-wider mb-2">
              Nhập mã định danh (Code) hoặc ID đơn đăng ký
            </label>
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              placeholder="vd: BD-2026-A1B2C3"
              className="w-full px-4 py-3 rounded-2xl border border-sand dark:border-sand/20 bg-porcelain dark:bg-ink-deep text-center font-mono text-base font-bold text-crimson focus:border-crimson outline-none shadow-inner"
            />
          </div>

          <Button
            variant="primary"
            className="w-full"
            disabled={!manualCode.trim() || isLookingUp}
            isLoading={isLookingUp}
            onClick={() => handleScannedResult(manualCode.trim(), 'manual')}
          >
            Tra cứu người đăng ký
          </Button>
        </div>
      )}

      {notice && !checkInModalOpen && <div role="status" className="mt-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 p-4 text-sm text-emerald-800 dark:text-emerald-200">{notice}</div>}
      {/* Scanner Error Alert */}
      {scannerError && (
        <div className="mt-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2 max-w-md mx-auto">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">{scannerError}</div>
        </div>
      )}

      <Modal
        isOpen={checkInModalOpen}
        onClose={closeResult}
        title={matchedRegistration?.eventMismatch ? 'QR thuộc đợt hiến máu khác' : 'Hồ sơ tiếp nhận người hiến máu'}
        subtitle={matchedRegistration?.eventMismatch ? 'Chọn cách xử lý trước khi tiếp tục tiếp nhận' : 'Đối chiếu thông tin đăng ký và giấy tờ của người đến hiến'}
        maxWidth="max-w-2xl"
        footer={<div className="flex flex-wrap justify-end gap-3">
          <Button variant="ghost" disabled={isProcessing} onClick={closeResult}>{matchedRegistration?.eventMismatch ? 'Giữ đợt hiện tại · Quét tiếp' : 'Quét người tiếp theo'}</Button>
          {matchedRegistration?.eventMismatch && onEventChange && <Button onClick={switchToMatchedEvent}>Chuyển sang đúng đợt</Button>}
          {matchedRegistration?.canCheckIn && <Button isLoading={isProcessing} onClick={handleConfirmCheckIn}>Xác nhận có mặt</Button>}
        </div>}
      >
        {matchedRegistration?.eventMismatch && <div className="space-y-5 text-sm text-ink dark:text-porcelain">
          <div role="alert" className="flex gap-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 p-4 text-amber-900 dark:text-amber-200">
            <AlertTriangle className="h-6 w-6 shrink-0" />
            <div><p className="font-bold">Đã đọc được QR, nhưng chưa đúng đợt tiếp nhận</p><p className="mt-1 leading-relaxed">Chưa ghi nhận điểm danh. Mã này thuộc đợt dưới đây; hãy chuyển sang đúng đợt hoặc hướng dẫn người hiến xuất trình mã của đợt đang chọn.</p></div>
          </div>
          <div className="rounded-2xl border border-sand dark:border-white/10 p-4"><p className="text-xs text-ink-muted dark:text-gray-400 mb-2">ĐỢT ĐANG TIẾP NHẬN</p><p className="font-semibold">{selectedEventTitle}</p></div>
          <div className="rounded-2xl border border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20 p-4"><p className="text-xs text-amber-800 dark:text-amber-300 mb-2">ĐỢT TRÊN MÃ QR</p><p className="font-bold text-base">{matchedRegistration.event.title}</p><p className="text-xs text-ink-muted dark:text-gray-400 mt-2">{format(matchedRegistration.event.startDate)} · {matchedRegistration.event.location || 'Chưa có địa điểm'}</p></div>
          <p className="text-xs text-ink-muted dark:text-gray-400">Chuyển đợt sẽ mở hồ sơ từ mã vừa đọc để đối chiếu. Bạn vẫn cần xác nhận có mặt sau đó.</p>
        </div>}
        {matchedRegistration && !matchedRegistration.eventMismatch && <div className="space-y-5 text-sm text-ink dark:text-porcelain">
          <div role="status" className={'rounded-2xl p-4 flex gap-3 ' + (alreadyReceived ? 'bg-blue-50 text-blue-900 dark:bg-blue-950/40 dark:text-blue-200' : matchedRegistration.canCheckIn ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200' : 'bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-200')}>
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <div><p className="font-bold">{alreadyReceived ? statusLabels[matchedRegistration.donationStatus] : matchedRegistration.canCheckIn ? 'Đọc mã thành công · Tìm thấy hồ sơ' : statusLabels[matchedRegistration.donationStatus]}</p>
              <p className="mt-1 text-xs leading-relaxed">{alreadyReceived ? 'Hồ sơ đã được ghi nhận trước đó. Quét lại chỉ xem thông tin, không tạo thêm lượt điểm danh.' : matchedRegistration.canCheckIn ? 'Kiểm tra họ tên, ngày sinh và CCCD trước khi xác nhận người đăng ký có mặt.' : 'Có thể xem hồ sơ nhưng không thể điểm danh ở trạng thái này.'}</p>
              {matchedRegistration.checkedInAt && <p className="text-xs mt-2 font-semibold">Thời điểm điểm danh: {format(matchedRegistration.checkedInAt, true)}</p>}
            </div>
          </div>
          <div><h4 className="text-xl font-bold">{matchedRegistration.fullName}</h4><p className="font-mono text-crimson mt-1">{matchedRegistration.code}</p></div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl bg-sand-light/50 dark:bg-ink-deep p-4">
            {detail('CCCD / CMND', matchedRegistration.identityCardNumber)}
            {detail('Ngày sinh', format(matchedRegistration.dateOfBirth))}
            {detail('Số điện thoại', matchedRegistration.phone)}
            {detail('Giới tính', ({ male: 'Nam', female: 'Nữ', other: 'Khác' })[matchedRegistration.gender])}
            {detail('Nhóm máu tự khai', matchedRegistration.bloodType === 'unknown' ? 'Chưa biết' : matchedRegistration.bloodType)}
            {detail('Cân nặng đăng ký', matchedRegistration.weight ? matchedRegistration.weight + ' kg' : null)}
          </dl>
          {matchedRegistration.screeningResult?.reasons?.length > 0 && <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 p-4 text-amber-900 dark:text-amber-200"><p className="font-bold mb-2">Lý do sàng lọc đã ghi nhận</p><ul className="list-disc pl-5 space-y-1">{matchedRegistration.screeningResult.reasons.map((reason, index) => <li key={index}>{reason}</li>)}</ul></div>}
          <section className="rounded-2xl border border-sand dark:border-white/10 p-4 space-y-3">
            <h4 className="font-bold">Thông tin lượt đăng ký</h4>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">{detail('Sự kiện', matchedRegistration.event?.title)}</div>
              {detail('Ngày tổ chức', format(matchedRegistration.event?.startDate))}
              {detail('Lịch hẹn', matchedRegistration.preferredTimeSlot)}
              {detail('Trạng thái', statusLabels[matchedRegistration.donationStatus])}
              {detail('Kết luận khám', ({ eligible: 'Đủ điều kiện', ineligible: 'Không đủ điều kiện', deferred: 'Tạm hoãn' })[matchedRegistration.screeningResult?.doctorConclusion] || 'Chưa có kết luận')}
              {matchedRegistration.donationStatus === 'donated' && detail('Thể tích đã hiến', matchedRegistration.donationVolume ? matchedRegistration.donationVolume + ' ml' : 'Chưa ghi nhận')}
              {matchedRegistration.confirmedBloodType && detail('Nhóm máu đã xác nhận', matchedRegistration.confirmedBloodType)}
            </dl>
          </section>
          {notice && <p role="status" className="text-emerald-700 dark:text-emerald-300 font-semibold">{notice}</p>}
          {scannerError && <p role="alert" className="text-rose-700 dark:text-rose-300">{scannerError}</p>}
          {matchedRegistration.canCheckIn && <p className="text-xs text-ink-muted dark:text-gray-400">Thao tác này ghi nhận có mặt. Kết quả khám và thể tích hiến máu được cập nhật ở bước tiếp nhận y tế.</p>}
        </div>}
      </Modal>
    </div>
  );
};

export default QRScanner;
