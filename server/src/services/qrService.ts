import QRCode from 'qrcode';
import crypto from 'crypto';

export interface GeneratedQR {
  code: string;
  token: string;
  dataUrl: string;
}

export const generateRegistrationQR = async (
  registrationId: string,
  userId: string,
  eventId: string
): Promise<GeneratedQR> => {
  // Generate human-readable code: BD-YEAR-RANDOMHEX
  const year = new Date().getFullYear();
  const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  const code = `BD-${year}-${randomSuffix}`;

  // Create verification signature payload
  const secret = process.env.JWT_SECRET || 'blood_donation_heartbeat_secret_salt';
  const rawPayload = `${registrationId}:${userId}:${eventId}:${code}`;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(rawPayload);
  const token = hmac.digest('hex');

  // Payload encoded in QR Code
  const qrPayload = JSON.stringify({
    regId: registrationId,
    code,
    tok: token.substring(0, 16), // verification hash
  });

  // Generate Base64 Data URL with crimson color palette
  const dataUrl = await QRCode.toDataURL(qrPayload, {
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

export const verifyQRToken = (
  registrationId: string,
  userId: string,
  eventId: string,
  code: string,
  tokenToVerify: string
): boolean => {
  const secret = process.env.JWT_SECRET || 'blood_donation_heartbeat_secret_salt';
  const rawPayload = `${registrationId}:${userId}:${eventId}:${code}`;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(rawPayload);
  const expectedToken = hmac.digest('hex');

  return (
    expectedToken === tokenToVerify ||
    expectedToken.substring(0, 16) === tokenToVerify
  );
};
