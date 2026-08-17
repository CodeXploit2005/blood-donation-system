import { Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { generateToken } from '../utils/generateToken';
import { successResponse, errorResponse } from '../utils/response';
import { AuthRequest } from '../middleware/authMiddleware';

export const registerSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
    email: z.string().email('Email không đúng định dạng'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    phone: z.string().min(9, 'Số điện thoại không hợp lệ'),
    dateOfBirth: z.string().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown']).optional(),
    address: z.string().optional(),
    identityCardNumber: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Email không đúng định dạng'),
    password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
  }),
});

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, password, phone, dateOfBirth, gender, bloodType, address, identityCardNumber } =
      req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      errorResponse(res, 'Email này đã được sử dụng bởi một tài khoản khác', 409);
      return;
    }

    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password,
      phone,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      gender,
      bloodType: bloodType || 'unknown',
      address,
      identityCardNumber,
      role: 'user',
    });

    const token = generateToken(user._id, user.role);

    const userResponse = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      bloodType: user.bloodType,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      address: user.address,
      identityCardNumber: user.identityCardNumber,
      createdAt: user.createdAt,
    };

    successResponse(
      res,
      { user: userResponse, token },
      'Đăng ký tài khoản thành công',
      201
    );
  } catch (error: any) {
    errorResponse(res, error.message || 'Lỗi khi đăng ký tài khoản', 500, error);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      errorResponse(res, 'Tài khoản hoặc mật khẩu không chính xác', 401);
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      errorResponse(res, 'Tài khoản hoặc mật khẩu không chính xác', 401);
      return;
    }

    const token = generateToken(user._id, user.role);

    const userResponse = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      bloodType: user.bloodType,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      address: user.address,
      identityCardNumber: user.identityCardNumber,
      createdAt: user.createdAt,
    };

    successResponse(
      res,
      { user: userResponse, token },
      'Đăng nhập thành công'
    );
  } catch (error: any) {
    errorResponse(res, error.message || 'Lỗi khi đăng nhập', 500, error);
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Không tìm thấy thông tin tài khoản', 404);
      return;
    }

    successResponse(res, { user: req.user }, 'Lấy thông tin tài khoản thành công');
  } catch (error: any) {
    errorResponse(res, error.message || 'Lỗi khi lấy thông tin người dùng', 500, error);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Không tìm thấy thông tin tài khoản', 404);
      return;
    }

    const { fullName, phone, bloodType, dateOfBirth, gender, address, identityCardNumber } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        ...(fullName && { fullName }),
        ...(phone && { phone }),
        ...(bloodType && { bloodType }),
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
        ...(gender && { gender }),
        ...(address !== undefined && { address }),
        ...(identityCardNumber !== undefined && { identityCardNumber }),
      },
      { new: true, runValidators: true }
    ).select('-password');

    successResponse(res, { user: updatedUser }, 'Cập nhật thông tin thành công');
  } catch (error: any) {
    errorResponse(res, error.message || 'Lỗi khi cập nhật thông tin', 500, error);
  }
};
