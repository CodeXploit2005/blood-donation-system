"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const response_1 = require("../utils/response");
const authMiddleware = async (req, res, next) => {
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        (0, response_1.errorResponse)(res, 'Vui lòng đăng nhập để tiếp tục truy cập', 401);
        return;
    }
    try {
        const secret = process.env.JWT_SECRET || 'blood_donation_super_secret_jwt_key_2026_heartbeat_life';
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        const currentUser = await User_1.User.findById(decoded.id).select('-password');
        if (!currentUser) {
            (0, response_1.errorResponse)(res, 'Tài khoản người dùng không tồn tại hoặc đã bị khóa', 401);
            return;
        }
        req.user = currentUser;
        next();
    }
    catch (err) {
        (0, response_1.errorResponse)(res, 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ', 401);
    }
};
exports.authMiddleware = authMiddleware;
exports.default = exports.authMiddleware;
