"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = exports.notFoundMiddleware = void 0;
const response_1 = require("../utils/response");
const notFoundMiddleware = (req, res, next) => {
    (0, response_1.errorResponse)(res, `Không tìm thấy tài nguyên: ${req.originalUrl}`, 404);
};
exports.notFoundMiddleware = notFoundMiddleware;
const errorMiddleware = (err, req, res, next) => {
    console.error('[Server Error]:', err);
    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `Giá trị '${err.keyValue[field]}' đã tồn tại trên hệ thống`;
        (0, response_1.errorResponse)(res, message, 409);
        return;
    }
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((val) => val.message);
        (0, response_1.errorResponse)(res, messages.join(', '), 422);
        return;
    }
    // Mongoose CastError (invalid ObjectId)
    if (err.name === 'CastError') {
        (0, response_1.errorResponse)(res, `Mã định danh không hợp lệ: ${err.value}`, 400);
        return;
    }
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        (0, response_1.errorResponse)(res, 'Mã xác thực không hợp lệ', 401);
        return;
    }
    if (err.name === 'TokenExpiredError') {
        (0, response_1.errorResponse)(res, 'Mã xác thực đã hết hạn', 401);
        return;
    }
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Máy chủ gặp sự cố xử lý yêu cầu';
    (0, response_1.errorResponse)(res, message, statusCode, process.env.NODE_ENV === 'development' ? err.stack : undefined);
};
exports.errorMiddleware = errorMiddleware;
