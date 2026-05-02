import { sign } from 'jsonwebtoken';
import type { Types } from 'mongoose';

type UserPayload = {
  id: Types.ObjectId;
};

export const generateJWT = (payload: UserPayload) => {
  return sign(payload, process.env.JWT_SECRET, {
    expiresIn: '180d',
  });
};
