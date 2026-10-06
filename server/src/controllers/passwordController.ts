import { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { recoveryEmailConfigured, sendRecoveryEmail } from '../services/recoveryEmailService';
import { z } from 'zod';
import { User } from '../models/User';
import { successResponse, errorResponse } from '../utils/response';

export const forgotPasswordSchema = z.object({ body: z.object({ email: z.string().email() }) });
export const verifyOtpSchema = z.object({ body: z.object({ email: z.string().email(), otp: z.string().regex(/^\d{6}$/) }) });
export const resetPasswordSchema = z.object({ body: z.object({ token: z.string().regex(/^[a-f0-9]{64}$/), password: z.string().min(8).max(128) }) });
const otpDigest = (email: string, otp: string) => crypto.createHmac('sha256', process.env.JWT_SECRET || 'blood_donation_otp_local_secret').update(`${email}:${otp}`).digest('hex');
const digest = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  if (!recoveryEmailConfigured()) {
    errorResponse(res, 'Chức năng gửi email khôi phục chưa được cấu hình. Vui lòng liên hệ quản trị viên.', 503);
    return;
  }
  const message = 'Nếu email đã được đăng ký, bạn sẽ nhận được mã OTP 6 số có hiệu lực trong 10 phút.';
  let tokenHash: string | undefined;
  try {
    const user = await User.findOne({ email: String(req.body.email).trim().toLowerCase() });
    if (user) {
      const otp = crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
      const email = user.email.toLowerCase();
      tokenHash = otpDigest(email, otp);
      const reserved = await User.updateOne({ _id: user._id, $or: [{ passwordResetOtpRequestedAt: { $exists: false } }, { passwordResetOtpRequestedAt: { $lte: new Date(Date.now() - 60_000) } }] }, {
        $set: { passwordResetOtpHash: tokenHash, passwordResetOtpAttempts: 0, passwordResetOtpRequestedAt: new Date(), passwordResetExpires: new Date(Date.now() + 10 * 60_000) },
        $unset: { passwordResetToken: 1 },
      });
      if (reserved.matchedCount) await sendRecoveryEmail(user.email, user.fullName, otp);

    }
    successResponse(res, null, message);
  } catch {
    if (tokenHash) await User.updateOne({ passwordResetOtpHash: tokenHash }, { $unset: { passwordResetOtpHash: 1, passwordResetExpires: 1, passwordResetOtpRequestedAt: 1, passwordResetOtpAttempts: 1 } }).catch(() => {});
    console.error('[Password Reset] Unable to process recovery email');
    // Keep the response identical for existing and unknown email addresses.
    successResponse(res, null, message);
  }
};

export const verifyResetOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const invalid = 'Mã OTP không đúng, hết hạn hoặc đã dùng. Tối đa 5 lần thử; hãy yêu cầu mã mới nếu cần.';
    const email = String(req.body.email).trim().toLowerCase();
    const attempt = await User.findOneAndUpdate({ email, passwordResetOtpHash: { $exists: true }, passwordResetExpires: { $gt: new Date() }, passwordResetOtpAttempts: { $lt: 5 } }, { $inc: { passwordResetOtpAttempts: 1 } }, { new: true }).select('+passwordResetOtpHash');
    const expected = otpDigest(email, req.body.otp);
    if (!attempt?.passwordResetOtpHash || attempt.passwordResetOtpHash.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(attempt.passwordResetOtpHash))) { errorResponse(res, invalid, 400); return; }
    const token = crypto.randomBytes(32).toString('hex');
    const result = await User.updateOne({ _id: attempt._id, passwordResetOtpHash: expected, passwordResetExpires: { $gt: new Date() }, passwordResetOtpAttempts: { $lte: 5 } }, {
      $set: { passwordResetToken: digest(token), passwordResetExpires: new Date(Date.now() + 5 * 60_000) },
      $unset: { passwordResetOtpHash: 1, passwordResetOtpAttempts: 1 },
    });
    if (!result.matchedCount) { errorResponse(res, invalid, 400); return; }
    successResponse(res, { token, expiresIn: 300 }, 'Xác thực OTP thành công. Bạn có thể đặt mật khẩu mới trong 5 phút.');
  } catch { errorResponse(res, 'Không thể xác thực OTP. Vui lòng thử lại.', 500); }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    if (typeof req.body.token !== 'string' || !/^[a-f0-9]{64}$/.test(req.body.token)) { errorResponse(res, 'Vui lòng xác thực OTP trước khi đặt mật khẩu mới.', 400); return; }
    const password = await bcrypt.hash(req.body.password, 10);
    const result = await User.updateOne({ passwordResetToken: digest(req.body.token), passwordResetExpires: { $gt: new Date() } }, { $set: { password }, $unset: { passwordResetToken: 1, passwordResetExpires: 1, passwordResetOtpHash: 1, passwordResetOtpAttempts: 1, passwordResetOtpRequestedAt: 1 }, $inc: { authVersion: 1 } });
    if (!result.matchedCount) { errorResponse(res, 'Phiên xác thực hết hạn hoặc đã dùng. Vui lòng yêu cầu OTP mới.', 400); return; }
    successResponse(res, null, 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập bằng mật khẩu mới.');
  } catch { errorResponse(res, 'Không thể đặt lại mật khẩu. Vui lòng thử lại.', 500); }
};
