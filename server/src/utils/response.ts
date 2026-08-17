import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string | any;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const successResponse = <T>(
  res: Response,
  data: T,
  message: string = 'Thành công',
  statusCode: number = 200,
  pagination?: ApiResponse['pagination']
): Response => {
  const responseBody: ApiResponse<T> = {
    success: true,
    message,
    data,
    ...(pagination && { pagination }),
  };
  return res.status(statusCode).json(responseBody);
};

export const errorResponse = (
  res: Response,
  message: string = 'Đã có lỗi xảy ra',
  statusCode: number = 400,
  error?: any
): Response => {
  const responseBody: ApiResponse = {
    success: false,
    message,
    ...(error && { error }),
  };
  return res.status(statusCode).json(responseBody);
};
