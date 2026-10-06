import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Button from '../../components/common/Button';

export default function PasswordRecovery() {
  const [otpSent, setOtpSent] = useState(false);
  const [verifiedToken, setVerifiedToken] = useState('');
  const [otp, setOtp] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const reset = !!verifiedToken;
  useEffect(() => { if (!cooldown) return; const timer = setTimeout(() => setCooldown(c => c - 1), 1000); return () => clearTimeout(timer); }, [cooldown]);
  const token = verifiedToken;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const inputClass = 'w-full rounded-xl border border-sand bg-porcelain px-3.5 py-3 text-sm text-ink outline-none focus:border-crimson';
  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (reset && password !== confirmation) { setError('Mật khẩu xác nhận không khớp.'); return; }
    if (otpSent && !reset && !/^\d{6}$/.test(otp)) { setError('Nhập mã OTP gồm đúng 6 số.'); return; }
    setBusy(true);
    try {
      if (!otpSent && !reset) {
        const response = await api.post('/auth/forgot-password', { email });
        setMessage(response.message); setOtpSent(true); setCooldown(60);
      } else if (!reset) {
        const response = await api.post('/auth/verify-reset-otp', { email, otp });
        setVerifiedToken(response.data.token); setOtp(''); setMessage(response.message);
      } else {
        const response = await api.post('/auth/reset-password', { token, password });
        setMessage(response.message); setDone(true); setVerifiedToken('');
        localStorage.removeItem('token'); localStorage.removeItem('user'); setPassword(''); setConfirmation('');
      }
    } catch (err) { setError(err.message || 'Không thể xử lý yêu cầu. Vui lòng thử lại.'); }
    finally { setBusy(false); }
  };
  return (
    <div className="rounded-3xl border border-sand bg-porcelain-card p-6 sm:p-8 shadow-warm-lg">
      <h2 className="text-center font-display text-2xl font-bold text-ink">{done ? 'Đổi Mật Khẩu Thành Công' : reset ? 'Đặt Mật Khẩu Mới' : otpSent ? 'Xác Thực OTP' : 'Quên Mật Khẩu'}</h2>
      <p className="mt-2 mb-6 text-center text-sm text-ink-muted">{done ? 'Bạn có thể đăng nhập bằng mật khẩu mới.' : reset ? 'OTP đã được xác thực. Hãy đặt mật khẩu mới trong 5 phút.' : otpSent ? 'Nhập mã OTP 6 số trong Gmail. Mã có hạn 10 phút.' : 'Nhập email đã đăng ký để nhận mã OTP 6 số qua Gmail.'}</p>
      {message && <p role="status" className="mb-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">{message}</p>}
      {error && <p role="alert" className="mb-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-200">{error}</p>}
      {!done && <form onSubmit={submit} className="space-y-4">
        {!token && <div><label htmlFor="recovery-email" className="mb-2 block text-xs font-bold text-ink">ĐỊA CHỈ EMAIL</label><input id="recovery-email" type="email" autoComplete="email" required readOnly={otpSent} value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" className={inputClass} /></div>}
        {otpSent && !reset && <div><label htmlFor="recovery-otp" className="mb-2 block text-xs font-bold text-ink">MÃ OTP</label><input id="recovery-otp" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="Nhập 6 số trong email" className={inputClass + ' text-center font-mono text-xl tracking-widest'} /></div>}
        {reset ? <>
          <div><label htmlFor="new-password" className="mb-2 block text-xs font-bold text-ink">MẬT KHẨU MỚI</label><input id="new-password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} /><p className="mt-1 text-xs text-ink-muted">Tối thiểu 8 ký tự.</p></div>
          <div><label htmlFor="confirm-password" className="mb-2 block text-xs font-bold text-ink">NHẬP LẠI MẬT KHẨU</label><input id="confirm-password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required value={confirmation} onChange={(e) => setConfirmation(e.target.value)} className={inputClass} /></div>
        </> : null}
        <Button type="submit" size="lg" className="w-full" isLoading={busy}>{reset ? 'Lưu Mật Khẩu Mới' : otpSent ? 'Xác Thực OTP' : 'Gửi Mã OTP'}</Button>
      </form>}
      {otpSent && !reset && !done && <div className="mt-4 flex justify-between gap-3 text-xs">
        <button type="button" disabled={busy || cooldown > 0} className="text-crimson font-semibold disabled:opacity-50" onClick={async () => {
          setBusy(true); setError('');
          try { const response = await api.post('/auth/forgot-password', { email }); setMessage(response.message); setOtp(''); setCooldown(60); } catch (err) { setError(err.message); } finally { setBusy(false); }
        }}>{cooldown ? 'Gửi lại sau ' + cooldown + ' giây' : 'Gửi lại OTP'}</button>
        <button type="button" disabled={busy} className="text-ink-muted" onClick={() => { setOtpSent(false); setVerifiedToken(''); setOtp(''); setMessage(''); setError(''); }}>Đổi email</button>
      </div>}
      <div className="mt-6 text-center text-sm"><Link to="/login" className="font-semibold text-crimson hover:underline">Quay lại đăng nhập</Link>{reset && !done && <button type="button" disabled={busy} onClick={() => { setVerifiedToken(''); setOtpSent(false); setPassword(''); setConfirmation(''); setMessage(''); setError(''); }} className="mt-3 block w-full text-ink-muted hover:text-crimson">Yêu cầu mã mới</button>}</div>
    </div>
  );
}
