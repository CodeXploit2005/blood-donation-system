import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { errorResponse } from '../utils/response';

export interface AuthRequest extends Request {
  user?: IUser;
}

interface JwtPayload {
  id: string;
  role: string;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    errorResponse(res, 'Vui lòng đăng nhập để tiếp tục truy cập', 401);
    return;
  }

  try {
    const secret = process.env.JWT_SECRET || 'blood_donation_super_secret_jwt_key_2026_heartbeat_life';
    const decoded = jwt.verify(token, secret) as JwtPayload;

    const currentUser = await User.findById(decoded.id).select('-password');
    if (!currentUser) {
      errorResponse(res, 'Tài khoản người dùng không tồn tại hoặc đã bị khóa', 401);
      return;
    }

    req.user = currentUser;
    next();
  } catch (err: any) {
    errorResponse(res, 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ', 401);
  }
};

export default authMiddleware;
