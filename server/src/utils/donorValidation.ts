import { z } from 'zod';
import { birthDateError, isVietnamPhone, normalizeVietnamPhone } from './donorEligibility';

export const donorBirthDate = z.string({ required_error: 'Vui lòng chọn ngày sinh' }).superRefine((value, ctx) => {
  const message = birthDateError(value);
  if (message) ctx.addIssue({ code: z.ZodIssueCode.custom, message });
});
export const donorPhone = z.string({ required_error: 'Vui lòng nhập số điện thoại' }).transform(normalizeVietnamPhone).refine(isVietnamPhone, 'Nhập số điện thoại Việt Nam hợp lệ, ví dụ 0912345678 hoặc +84912345678');
export const donorName = z.string().trim().min(2, 'Họ và tên phải có ít nhất 2 ký tự').max(100, 'Họ tên tối đa 100 ký tự');
export const donorEmail = z.string().trim().toLowerCase().email('Email không đúng định dạng');
