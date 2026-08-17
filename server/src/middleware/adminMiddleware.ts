import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import { errorResponse } from '../utils/response';

export const adminMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== 'admin') {
    errorResponse(res, 'Bạn không có quyền quản trị viên để thực hiện thao tác này', 403);
    return;
  }
  next();
};

export default adminMiddleware;
