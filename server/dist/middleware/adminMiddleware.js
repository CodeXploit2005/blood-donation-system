"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = void 0;
const response_1 = require("../utils/response");
const adminMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        (0, response_1.errorResponse)(res, 'Bạn không có quyền quản trị viên để thực hiện thao tác này', 403);
        return;
    }
    next();
};
exports.adminMiddleware = adminMiddleware;
exports.default = exports.adminMiddleware;
