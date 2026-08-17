import { Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';
import { errorResponse, successResponse } from '../utils/response';

export const updateUserRoleSchema = z.object({
  body: z.object({
    role: z.enum(['admin', 'user']),
  }),
});

const publicUserFields = 'fullName email phone role bloodType createdAt';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const search = String(req.query.q || '').trim();
    const query = search
      ? { $or: ['fullName', 'email', 'phone'].map((field) => ({ [field]: new RegExp(search, 'i') })) }
      : {};
    const users = await User.find(query).select(publicUserFields).sort({ createdAt: -1 }).lean();
    successResponse(res, users, 'Lấy danh sách tài khoản thành công');
  } catch (error: any) {
    errorResponse(res, error.message || 'Không thể lấy danh sách tài khoản', 500, error);
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body as { role: 'admin' | 'user' };
    const targetUser = await User.findById(id);

    if (!targetUser) {
      errorResponse(res, 'Không tìm thấy tài khoản', 404);
      return;
    }

    if (String(targetUser._id) === String(req.user?._id) && role !== 'admin') {
      errorResponse(res, 'Bạn không thể tự gỡ quyền quản trị của mình', 400);
      return;
    }

    if (targetUser.role === 'admin' && role === 'user') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        errorResponse(res, 'Hệ thống cần duy trì ít nhất một tài khoản quản trị', 400);
        return;
      }
    }

    targetUser.role = role;
    await targetUser.save();
    const updatedUser = await User.findById(targetUser._id).select(publicUserFields);
    successResponse(res, updatedUser, role === 'admin' ? 'Đã cấp quyền quản trị viên' : 'Đã chuyển tài khoản về người dùng');
  } catch (error: any) {
    errorResponse(res, error.message || 'Không thể cập nhật quyền tài khoản', 500, error);
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const targetUser = await User.findById(id);

    if (!targetUser) {
      errorResponse(res, 'Không tìm thấy tài khoản', 404);
      return;
    }

    if (String(targetUser._id) === String(req.user?._id)) {
      errorResponse(res, 'Bạn không thể xóa tài khoản đang đăng nhập', 400);
      return;
    }

    if (targetUser.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        errorResponse(res, 'Hệ thống cần duy trì ít nhất một tài khoản quản trị', 400);
        return;
      }
    }

    await User.findByIdAndDelete(id);
    successResponse(res, null, `Đã xóa tài khoản ${targetUser.email}`);
  } catch (error: any) {
    errorResponse(res, error.message || 'Không thể xóa tài khoản', 500, error);
  }
};
