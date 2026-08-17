"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyQRToken = exports.generateRegistrationQR = void 0;
const qrcode_1 = __importDefault(require("qrcode"));
const crypto_1 = __importDefault(require("crypto"));
const generateRegistrationQR = async (registrationId, userId, eventId) => {
    // Generate human-readable code: BD-YEAR-RANDOMHEX
    const year = new Date().getFullYear();
    const randomSuffix = crypto_1.default.randomBytes(3).toString('hex').toUpperCase();
    const code = `BD-${year}-${randomSuffix}`;
    // Create verification signature payload
    const secret = process.env.JWT_SECRET || 'blood_donation_heartbeat_secret_salt';
    const rawPayload = `${registrationId}:${userId}:${eventId}:${code}`;
    const hmac = crypto_1.default.createHmac('sha256', secret);
    hmac.update(rawPayload);
    const token = hmac.digest('hex');
    // Payload encoded in QR Code
    const qrPayload = JSON.stringify({
        regId: registrationId,
        code,
        tok: token.substring(0, 16), // verification hash
    });
    // Generate Base64 Data URL with crimson color palette
    const dataUrl = await qrcode_1.default.toDataURL(qrPayload, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 320,
        color: {
            dark: '#1E2226', // ink color
            light: '#FFFFFF',
        },
    });
    return {
        code,
        token,
        dataUrl,
    };
};
exports.generateRegistrationQR = generateRegistrationQR;
const verifyQRToken = (registrationId, userId, eventId, code, tokenToVerify) => {
    const secret = process.env.JWT_SECRET || 'blood_donation_heartbeat_secret_salt';
    const rawPayload = `${registrationId}:${userId}:${eventId}:${code}`;
    const hmac = crypto_1.default.createHmac('sha256', secret);
    hmac.update(rawPayload);
    const expectedToken = hmac.digest('hex');
    return (expectedToken === tokenToVerify ||
        expectedToken.substring(0, 16) === tokenToVerify);
};
exports.verifyQRToken = verifyQRToken;
