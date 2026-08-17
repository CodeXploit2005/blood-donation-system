"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getMe = exports.login = exports.register = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const User_1 = require("../models/User");
const generateToken_1 = require("../utils/generateToken");
const response_1 = require("../utils/response");
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        fullName: zod_1.z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
        email: zod_1.z.string().email('Email không đúng định dạng'),
        password: zod_1.z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
        phone: zod_1.z.string().min(9, 'Số điện thoại không hợp lệ'),
        dateOfBirth: zod_1.z.string().optional(),
        gender: zod_1.z.enum(['male', 'female', 'other']).optional(),
        bloodType: zod_1.z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown']).optional(),
        address: zod_1.z.string().optional(),
        identityCardNumber: zod_1.z.string().optional(),
    }),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Email không đúng định dạng'),
        password: zod_1.z.string().min(1, 'Vui lòng nhập mật khẩu'),
    }),
});
const register = async (req, res) => {
    try {
        const { fullName, email, password, phone, dateOfBirth, gender, bloodType, address, identityCardNumber } = req.body;
        const existingUser = await User_1.User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            (0, response_1.errorResponse)(res, 'Email này đã được sử dụng bởi một tài khoản khác', 409);
            return;
        }
        const user = await User_1.User.create({
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
        const token = (0, generateToken_1.generateToken)(user._id, user.role);
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
        (0, response_1.successResponse)(res, { user: userResponse, token }, 'Đăng ký tài khoản thành công', 201);
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message || 'Lỗi khi đăng ký tài khoản', 500, error);
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user) {
            (0, response_1.errorResponse)(res, 'Tài khoản hoặc mật khẩu không chính xác', 401);
            return;
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            (0, response_1.errorResponse)(res, 'Tài khoản hoặc mật khẩu không chính xác', 401);
            return;
        }
        const token = (0, generateToken_1.generateToken)(user._id, user.role);
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
        (0, response_1.successResponse)(res, { user: userResponse, token }, 'Đăng nhập thành công');
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message || 'Lỗi khi đăng nhập', 500, error);
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        if (!req.user) {
            (0, response_1.errorResponse)(res, 'Không tìm thấy thông tin tài khoản', 404);
            return;
        }
        (0, response_1.successResponse)(res, { user: req.user }, 'Lấy thông tin tài khoản thành công');
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message || 'Lỗi khi lấy thông tin người dùng', 500, error);
    }
};
exports.getMe = getMe;
const updateProfile = async (req, res) => {
    try {
        if (!req.user) {
            (0, response_1.errorResponse)(res, 'Không tìm thấy thông tin tài khoản', 404);
            return;
        }
        const { fullName, phone, bloodType, dateOfBirth, gender, address, identityCardNumber } = req.body;
        const updatedUser = await User_1.User.findByIdAndUpdate(req.user._id, {
            ...(fullName && { fullName }),
            ...(phone && { phone }),
            ...(bloodType && { bloodType }),
            ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
            ...(gender && { gender }),
            ...(address !== undefined && { address }),
            ...(identityCardNumber !== undefined && { identityCardNumber }),
        }, { new: true, runValidators: true }).select('-password');
        (0, response_1.successResponse)(res, { user: updatedUser }, 'Cập nhật thông tin thành công');
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message || 'Lỗi khi cập nhật thông tin', 500, error);
    }
};
exports.updateProfile = updateProfile;
