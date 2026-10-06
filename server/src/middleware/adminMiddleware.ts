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
  // Admin may cancel registrations. Clinical results belong to medical staff.
  const fields = Object.keys(req.body || {});
  const permitted = req.user?.role === 'staff'
    ? fields.length > 0 && fields.every(field => ['donationStatus', 'confirmedBloodType', 'donationVolume', 'screeningResult'].includes(field)) && ['screened_eligible', 'screened_ineligible', 'donated', undefined].includes(req.body.donationStatus)
    : req.user?.role === 'admin' && fields.length === 1 && fields[0] === 'donationStatus' && req.body.donationStatus === 'cancelled';
  if (!permitted) {
    errorResponse(res, 'Chỉ nhân viên y tế được nhập kết quả khám và xác nhận hiến máu; admin chỉ được hủy đăng ký', 403);
    return;
  }
  next();
};

export const checkinPermission = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const clinicalFields = ['actualVolumeMl', 'confirmedBloodType', 'nurseNotes', 'bloodPressure', 'hemoglobinLevel'];
  if (req.user?.role === 'admin' && (clinicalFields.some(field => req.body?.[field] !== undefined) || (req.body?.preview !== true && req.body?.action !== 'presence'))) {
    errorResponse(res, 'Admin chỉ được tra cứu QR và xác nhận có mặt; kết quả y tế thuộc nhân viên y tế', 403);
    return;
  }
  next();
};
