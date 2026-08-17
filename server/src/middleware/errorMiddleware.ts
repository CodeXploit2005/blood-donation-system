import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response';

export const notFoundMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  errorResponse(res, `Không tìm thấy tài nguyên: ${req.originalUrl}`, 404);
};

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('[Server Error]:', err);

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Giá trị '${err.keyValue[field]}' đã tồn tại trên hệ thống`;
    errorResponse(res, message, 409);
    return;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val: any) => val.message);
    errorResponse(res, messages.join(', '), 422);
    return;
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    errorResponse(res, `Mã định danh không hợp lệ: ${err.value}`, 400);
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    errorResponse(res, 'Mã xác thực không hợp lệ', 401);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    errorResponse(res, 'Mã xác thực đã hết hạn', 401);
    return;
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Máy chủ gặp sự cố xử lý yêu cầu';
  errorResponse(res, message, statusCode, process.env.NODE_ENV === 'development' ? err.stack : undefined);
};
