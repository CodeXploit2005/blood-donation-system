"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorResponse = exports.successResponse = void 0;
const successResponse = (res, data, message = 'Thành công', statusCode = 200, pagination) => {
    const responseBody = {
        success: true,
        message,
        data,
        ...(pagination && { pagination }),
    };
    return res.status(statusCode).json(responseBody);
};
exports.successResponse = successResponse;
const errorResponse = (res, message = 'Đã có lỗi xảy ra', statusCode = 400, error) => {
    const responseBody = {
        success: false,
        message,
        ...(error && { error }),
    };
    return res.status(statusCode).json(responseBody);
};
exports.errorResponse = errorResponse;
