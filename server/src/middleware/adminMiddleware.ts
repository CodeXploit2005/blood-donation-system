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

export const staffMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || !['admin', 'staff'].includes(req.user.role)) {
    errorResponse(res, 'Chỉ nhân viên y tế hoặc quản trị viên được thực hiện thao tác này', 403);
    return;
  }
  next();
};

export const donorMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'user') {
    errorResponse(res, 'Chức năng này chỉ dành cho tài khoản người hiến máu', 403);
    return;
  }
  next();
};

export const cancelPermission = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || !['user', 'admin'].includes(req.user.role)) {
    errorResponse(res, 'Nhân viên y tế không có quyền hủy đăng ký', 403);
    return;
  }
  next();
};

export const registrationUpdatePermission = (req: AuthRequest, res: Response, next: NextFunction): void => {
  // Admin can record donation results; medical screening remains staff-only.
  const fields = Object.keys(req.body || {});
  const adminDonation = req.user?.role === 'admin' &&
    req.body.donationStatus === 'donated' &&
    ['donationVolume', 'confirmedBloodType'].every(field => fields.includes(field)) &&
    fields.every(field => ['donationStatus', 'donationVolume', 'confirmedBloodType', 'reason'].includes(field));
  const permitted = req.user?.role === 'staff'
    ? fields.length > 0 && fields.every(field => ['donationStatus', 'confirmedBloodType', 'donationVolume', 'screeningResult', 'reason'].includes(field)) && ['screened_eligible', 'screened_ineligible', 'donated', undefined].includes(req.body.donationStatus)
    : adminDonation || (req.user?.role === 'admin' && fields.length === 1 && fields[0] === 'donationStatus' && req.body.donationStatus === 'cancelled');
  if (!permitted) {
    errorResponse(res, 'Chỉ nhân viên y tế được nhập kết quả khám; admin hoặc nhân viên y tế được ghi nhận lượng máu hiến', 403);
    return;
  }
  next();
};

export const checkinPermission = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'staff') {
    errorResponse(res, 'Chỉ tài khoản nhân viên y tế được quét QR và điểm danh', 403);
    return;
  }
  next();
};
