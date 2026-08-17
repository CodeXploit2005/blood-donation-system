"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateToken = (userId, role) => {
    const secret = process.env.JWT_SECRET || 'blood_donation_super_secret_jwt_key_2026_heartbeat_life';
    const options = {
        expiresIn: '7d',
    };
    return jsonwebtoken_1.default.sign({
        id: userId.toString(),
        role,
    }, secret, options);
};
exports.generateToken = generateToken;
exports.default = exports.generateToken;
