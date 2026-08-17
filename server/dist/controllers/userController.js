"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUserRole = exports.getUsers = exports.updateUserRoleSchema = void 0;
const zod_1 = require("zod");
const User_1 = require("../models/User");
const response_1 = require("../utils/response");
exports.updateUserRoleSchema = zod_1.z.object({
    body: zod_1.z.object({
        role: zod_1.z.enum(['admin', 'user']),
    }),
});
const publicUserFields = 'fullName email phone role bloodType createdAt';
const getUsers = async (req, res) => {
    try {
        const search = String(req.query.q || '').trim();
        const query = search
            ? { $or: ['fullName', 'email', 'phone'].map((field) => ({ [field]: new RegExp(search, 'i') })) }
            : {};
        const users = await User_1.User.find(query).select(publicUserFields).sort({ createdAt: -1 }).lean();
        (0, response_1.successResponse)(res, users, 'Lấy danh sách tài khoản thành công');
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message || 'Không thể lấy danh sách tài khoản', 500, error);
    }
};
exports.getUsers = getUsers;
const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        const targetUser = await User_1.User.findById(id);
        if (!targetUser) {
            (0, response_1.errorResponse)(res, 'Không tìm thấy tài khoản', 404);
            return;
        }
        if (String(targetUser._id) === String(req.user?._id) && role !== 'admin') {
            (0, response_1.errorResponse)(res, 'Bạn không thể tự gỡ quyền quản trị của mình', 400);
            return;
        }
        if (targetUser.role === 'admin' && role === 'user') {
            const adminCount = await User_1.User.countDocuments({ role: 'admin' });
            if (adminCount <= 1) {
                (0, response_1.errorResponse)(res, 'Hệ thống cần duy trì ít nhất một tài khoản quản trị', 400);
                return;
            }
        }
        targetUser.role = role;
        await targetUser.save();
        const updatedUser = await User_1.User.findById(targetUser._id).select(publicUserFields);
        (0, response_1.successResponse)(res, updatedUser, role === 'admin' ? 'Đã cấp quyền quản trị viên' : 'Đã chuyển tài khoản về người dùng');
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message || 'Không thể cập nhật quyền tài khoản', 500, error);
    }
};
exports.updateUserRole = updateUserRole;
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const targetUser = await User_1.User.findById(id);
        if (!targetUser) {
            (0, response_1.errorResponse)(res, 'Không tìm thấy tài khoản', 404);
            return;
        }
        if (String(targetUser._id) === String(req.user?._id)) {
            (0, response_1.errorResponse)(res, 'Bạn không thể xóa tài khoản đang đăng nhập', 400);
            return;
        }
        if (targetUser.role === 'admin') {
            const adminCount = await User_1.User.countDocuments({ role: 'admin' });
            if (adminCount <= 1) {
                (0, response_1.errorResponse)(res, 'Hệ thống cần duy trì ít nhất một tài khoản quản trị', 400);
                return;
            }
        }
        await User_1.User.findByIdAndDelete(id);
        (0, response_1.successResponse)(res, null, `Đã xóa tài khoản ${targetUser.email}`);
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message || 'Không thể xóa tài khoản', 500, error);
    }
};
exports.deleteUser = deleteUser;
