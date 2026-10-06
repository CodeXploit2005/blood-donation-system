import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { Types } from 'mongoose';

export const generateToken = (userId: Types.ObjectId | string, role: string, authVersion = 0): string => {
  const secret: Secret = process.env.JWT_SECRET || 'blood_donation_super_secret_jwt_key_2026_heartbeat_life';
  const options: SignOptions = {
    expiresIn: '7d',
  };

  return jwt.sign(
    {
      id: userId.toString(),
      role,
      authVersion,
    },
    secret,
    options
  );
};

export default generateToken;
