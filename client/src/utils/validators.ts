import { z } from 'zod';

export const loginFormSchema = z.object({
  email: z.string().min(1, 'Vui lòng nhập email').email('Email không đúng định dạng'),
  password: z.string().min(6, 'Mật khẩu phải từ 6 ký tự trở lên'),
});

export const registerFormSchema = z.object({
  fullName: z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
  email: z.string().min(1, 'Vui lòng nhập email').email('Email không đúng định dạng'),
  phone: z.string().min(9, 'Số điện thoại phải từ 9-11 số').regex(/^[0-9+]+$/, 'Số điện thoại chỉ chứa chữ số'),
  password: z.string().min(6, 'Mật khẩu phải từ 6 ký tự trở lên'),
  confirmPassword: z.string().min(1, 'Vui lòng nhập lại mật khẩu'),
  gender: z.enum(['male', 'female', 'other'], {
    errorMap: () => ({ message: 'Vui lòng chọn giới tính' }),
  }),
  bloodType: z.string().optional(),
  dateOfBirth: z.string().min(1, 'Vui lòng chọn ngày sinh'),
  address: z.string().optional(),
  identityCardNumber: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

export const donationRegistrationSchema = z.object({
  fullName: z.string().min(2, 'Họ và tên là bắt buộc'),
  phone: z.string().min(9, 'Số điện thoại không hợp lệ'),
  email: z.string().email('Email không hợp lệ'),
  dateOfBirth: z.string().min(1, 'Vui lòng chọn ngày sinh'),
  gender: z.enum(['male', 'female', 'other'], {
    errorMap: () => ({ message: 'Vui lòng chọn giới tính' }),
  }),
  identityCardNumber: z.string().min(9, 'Số CCCD/CMND là bắt buộc'),
  bloodType: z.string().default('unknown'),
  weight: z.coerce.number().min(35, 'Cân nặng phải lớn hơn 35kg').max(200, 'Cân nặng không hợp lệ'),
  height: z.coerce.number().optional(),
  preferredTimeSlot: z.string().default('08:00 - 10:00'),
  hasFever: z.boolean().default(false),
  hasChronicDisease: z.boolean().default(false),
  takingMedication: z.boolean().default(false),
  recentSurgery: z.boolean().default(false),
  hasTattooOrPiercingIn6Months: z.boolean().default(false),
  isPregnantOrNursing: z.boolean().default(false),
  lastDonationDate: z.string().optional(),
  notes: z.string().optional(),
  agreeTerms: z.literal(true, {
    errorMap: () => ({ message: 'Bạn phải đồng ý với cam kết hiến máu tự nguyện' }),
  }),
});

export const eventFormSchema = z.object({
  title: z.string().min(5, 'Tiêu đề đợt hiến máu phải từ 5 ký tự trở lên'),
  description: z.string().min(15, 'Mô tả chi tiết phải từ 15 ký tự trở lên'),
  location: z.string().min(3, 'Địa điểm tổ chức là bắt buộc'),
  addressDetails: z.string().min(5, 'Địa chỉ cụ thể là bắt buộc'),
  startDate: z.string().min(1, 'Vui lòng chọn ngày bắt đầu'),
  endDate: z.string().min(1, 'Vui lòng chọn ngày kết thúc'),
  maxParticipants: z.coerce.number().min(1, 'Số người tối đa phải lớn hơn 0'),
  targetBloodUnits: z.coerce.number().min(1, 'Chỉ tiêu đơn vị máu phải lớn hơn 0'),
  statusSelection: z
    .enum(['auto', 'upcoming', 'open', 'closed', 'completed'])
    .default('auto'),
  imageUrl: z.string().optional(),
  organizer: z.string().min(2, 'Đơn vị tổ chức là bắt buộc'),
  contactPhone: z.string().min(8, 'Số điện thoại liên hệ là bắt buộc'),
});
