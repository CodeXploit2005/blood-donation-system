import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5Qrcode } from 'html5-qrcode';
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
  X,
  ScanLine,
} from 'lucide-react';
import Button from '../common/Button';
import Modal from '../common/Modal';

export const QRScanner = ({ onCheckInSuccess, selectedEventId = null }) => {
  const [scanMode, setScanMode] = useState('camera'); // 'camera' | 'upload' | 'manual'
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState(null);
  const [scanFlash, setScanFlash] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check-in modal parameters
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [actualVolumeMl, setActualVolumeMl] = useState(350);
  const [confirmedBloodType, setConfirmedBloodType] = useState('O+');
  const [nurseNotes, setNurseNotes] = useState('Sức khỏe ổn định, hoàn thành tốt.');
  const [bloodPressure, setBloodPressure] = useState('120/80');

  const html5QrCodeRef = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize camera scanner
  const startCamera = async () => {
    try {
      setScannerError(null);
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
      }

      const html5QrCode = new Html5Qrcode('qr-reader-viewport');
      html5QrCodeRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          handleScannedResult(decodedText);
        },
        (errorMessage) => {
          // ignore frame errors
        }
      );

      setIsScanning(true);
    } catch (err) {
      console.warn('Camera start error:', err);
      setScannerError(
        'Không thể truy cập camera. Vui lòng cấp quyền máy ảnh hoặc sử dụng tính năng tải ảnh / nhập mã thủ công.'
      );
      setIsScanning(false);
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (e) {
        console.error(e);
      }
    }
    setIsScanning(false);
  };

  useEffect(() => {
    if (scanMode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [scanMode]);

  // Process scanned QR payload
  const handleScannedResult = (decodedText) => {
    if (!decodedText || isProcessing) return;

    // Trigger visual flash and haptic bounce
    setScanFlash(true);
    setTimeout(() => setScanFlash(false), 400);

    // Vibration API if supported
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }

    setScannedData(decodedText);
    setCheckInModalOpen(true);
  };

  // Image upload scanning
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setScannerError(null);
      const html5QrCode = new Html5Qrcode('qr-reader-viewport-hidden');
      const decodedResult = await html5QrCode.scanFile(file, true);
      handleScannedResult(decodedResult);
    } catch (err) {
      setScannerError('Không nhận diện được mã QR hợp lệ từ bức ảnh này. Vui lòng chụp rõ nét hơn.');
    }
  };

  // Submit check-in confirmation
  const handleConfirmCheckIn = async () => {
    if (!scannedData) return;
    setIsProcessing(true);
    try {
      await onCheckInSuccess({
        qrData: scannedData,
        eventId: selectedEventId,
        actualVolumeMl,
        confirmedBloodType,
        nurseNotes,
        bloodPressure,
      });
      setCheckInModalOpen(false);
      setScannedData(null);
      setManualCode('');
    } catch (err) {
      // The parent shows the reason (for example, a QR that belongs to another event).
      // Close this confirmation because the current scan cannot be accepted here.
      setCheckInModalOpen(false);
      setScannedData(null);
      setManualCode('');
    } finally {
      setIsProcessing(false);
    }
  };

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
              : 'text-ink-muted hover:text-ink dark:hover:text-porcelain'
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
              : 'text-ink-muted hover:text-ink dark:hover:text-porcelain'
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
              : 'text-ink-muted hover:text-ink dark:hover:text-porcelain'
          }`}
        >
          <Keyboard className="w-4 h-4" />
          <span>Nhập Mã</span>
        </button>
      </div>

      {/* Mode 1: Camera Scanner */}
      {scanMode === 'camera' && (
        <div className="flex flex-col items-center">
          <div className="relative w-full max-w-sm aspect-square rounded-3xl overflow-hidden bg-ink-deep border-2 border-crimson/30 shadow-warm-lg flex items-center justify-center">
            {/* Camera Viewport */}
            <div id="qr-reader-viewport" className="w-full h-full object-cover" />

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
            <p className="text-xs font-bold text-ink dark:text-porcelain">
              Căn chỉnh mã QR của người hiến vào trung tâm khung quét
            </p>
            <p className="text-[11px] text-ink-muted mt-0.5">
              Hệ thống sẽ tự động nhận diện và mở bảng xác nhận điểm danh.
            </p>

            <button
              onClick={startCamera}
              className="mt-3 inline-flex items-center gap-1.5 text-xs text-crimson hover:underline font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Khởi động lại Camera
            </button>
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
            onClick={() => fileInputRef.current?.click()}
            className="p-8 border-2 border-dashed border-sand-dark dark:border-sand/30 rounded-3xl bg-sand-light/40 dark:bg-ink-deep hover:bg-sand-light hover:border-crimson cursor-pointer transition-all flex flex-col items-center justify-center gap-3 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-crimson-light dark:bg-crimson/20 text-crimson flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-ink dark:text-porcelain group-hover:text-crimson">
                Nhấn để chọn ảnh chứa mã QR
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
            disabled={!manualCode.trim()}
            onClick={() => handleScannedResult(manualCode.trim())}
          >
            Tìm & Điểm Danh Ngay
          </Button>
        </div>
      )}

      {/* Scanner Error Alert */}
      {scannerError && (
        <div className="mt-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2 max-w-md mx-auto">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">{scannerError}</div>
        </div>
      )}

      {/* Confirmation & Clinical Vitals Modal */}
      <Modal
        isOpen={checkInModalOpen}
        onClose={() => setCheckInModalOpen(false)}
        title="Xác Nhận Điểm Danh & Tiếp Nhận Máu"
        subtitle="Vui lòng kiểm tra thể trạng người hiến trước khi lấy máu"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-sand-light/60 dark:bg-ink-deep border border-sand dark:border-sand/20 space-y-2">
            <div className="flex justify-between items-center pb-2 border-b border-sand dark:border-sand/20">
              <span className="text-ink-muted">Dữ liệu mã quét:</span>
              <span className="font-mono font-bold text-crimson truncate max-w-[200px]">
                {scannedData}
              </span>
            </div>
            <p className="text-ink dark:text-porcelain text-xs">
              Hệ thống sẽ đối soát thông tin và cập nhật trạng thái <strong>Đã hiến máu thành công</strong>.
            </p>
          </div>

          {/* Confirmed Blood Type Selection */}
          <div>
            <label className="block text-xs font-bold text-ink dark:text-porcelain uppercase tracking-wider mb-2">
              Nhóm máu xác nhận qua xét nghiệm nhanh tại quầy:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'].map((bt) => (
                <button
                  key={bt}
                  type="button"
                  onClick={() => setConfirmedBloodType(bt)}
                  className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                    confirmedBloodType === bt
                      ? 'bg-crimson text-white border-crimson shadow-sm'
                      : 'bg-porcelain dark:bg-ink-deep text-ink dark:text-porcelain border-sand dark:border-sand/20 hover:border-crimson'
                  }`}
                >
                  {bt}
                </button>
              ))}
            </div>
          </div>

          {/* Volume selection */}
          <div>
            <label className="block text-xs font-bold text-ink dark:text-porcelain uppercase tracking-wider mb-2">
              Thể tích máu tiếp nhận thực tế <span className="text-crimson">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[250, 350, 450].map((vol) => (
                <button
                  key={vol}
                  type="button"
                  onClick={() => setActualVolumeMl(vol)}
                  className={`py-2.5 rounded-2xl border text-xs font-bold transition-all ${
                    actualVolumeMl === vol
                      ? 'bg-crimson text-white border-crimson shadow-sm shadow-pulse-glow'
                      : 'bg-porcelain dark:bg-ink-deep text-ink dark:text-porcelain border-sand dark:border-sand/20 hover:border-crimson'
                  }`}
                >
                  {vol} ml
                </button>
              ))}
            </div>
          </div>

          {/* Clinical vitals: Blood Pressure & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ink dark:text-porcelain uppercase tracking-wider mb-1">
                Huyết áp (mmHg)
              </label>
              <input
                type="text"
                value={bloodPressure}
                onChange={(e) => setBloodPressure(e.target.value)}
                placeholder="120/80"
                className="w-full px-3 py-2 rounded-xl border border-sand dark:border-sand/20 bg-porcelain dark:bg-ink-deep text-ink dark:text-porcelain text-xs outline-none focus:border-crimson font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink dark:text-porcelain uppercase tracking-wider mb-1">
                Ghi chú của Điều dưỡng / Bác sĩ
              </label>
              <input
                type="text"
                value={nurseNotes}
                onChange={(e) => setNurseNotes(e.target.value)}
                placeholder="vd: Thể trạng tốt, không chóng mặt"
                className="w-full px-3 py-2 rounded-xl border border-sand dark:border-sand/20 bg-porcelain dark:bg-ink-deep text-ink dark:text-porcelain text-xs outline-none focus:border-crimson"
              />
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="pt-4 border-t border-sand dark:border-sand/20 flex justify-end gap-2.5">
            <Button
              variant="ghost"
              onClick={() => setCheckInModalOpen(false)}
              disabled={isProcessing}
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmCheckIn}
              isLoading={isProcessing}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Xác Nhận ({actualVolumeMl}ml - {confirmedBloodType})
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default QRScanner;
