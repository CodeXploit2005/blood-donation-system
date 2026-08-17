"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const response_1 = require("../utils/response");
const validate = (schema) => async (req, res, next) => {
    try {
        await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            const errorMessages = error.errors.map((err) => ({
                field: err.path.join('.').replace(/^(body|query|params)\./, ''),
                message: err.message,
            }));
            (0, response_1.errorResponse)(res, errorMessages[0]?.message || 'Dữ liệu không hợp lệ', 422, errorMessages);
            return;
        }
        (0, response_1.errorResponse)(res, 'Lỗi xử lý xác thực dữ liệu', 500, error);
    }
};
exports.validate = validate;
exports.default = exports.validate;
