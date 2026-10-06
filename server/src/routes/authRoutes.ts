import { Router } from 'express';
import { register, login, getMe, updateProfile, registerSchema, loginSchema, profileSchema } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validate } from '../middleware/validateMiddleware';
import { rateLimit } from 'express-rate-limit';
import { forgotPassword, verifyResetOtp, verifyOtpSchema, resetPassword, forgotPasswordSchema, resetPasswordSchema } from '../controllers/passwordController';

const router = Router();
const recoveryLimit = rateLimit({ windowMs: 15 * 60_000, limit: 10, standardHeaders: true, legacyHeaders: false, message: { success: false, message: 'Bạn đã yêu cầu quá nhiều lần. Vui lòng thử lại sau 15 phút.' } });
router.post('/forgot-password', recoveryLimit, validate(forgotPasswordSchema), forgotPassword);
router.post('/verify-reset-otp', recoveryLimit, validate(verifyOtpSchema), verifyResetOtp);
router.post('/reset-password', recoveryLimit, validate(resetPasswordSchema), resetPassword);

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', authMiddleware, getMe);
router.put('/profile', authMiddleware, validate(profileSchema), updateProfile);

export default router;
