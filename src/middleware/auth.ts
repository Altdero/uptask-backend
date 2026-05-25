import type { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';

import type { IUser } from '@/models/User';
import User from '@/models/User';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const bearer = req.headers.authorization;
  if (!bearer) {
    const error = new Error('Unauthorized');
    return res.status(401).json({ error: error.message });
  }

  const [, token] = bearer.split(' ');

  try {
    const decoded = verify(token, process.env.JWT_SECRET);

    if (typeof decoded === 'object' && decoded.id) {
      const user = await User.findById(decoded.id).select('_id name email');
      if (user) {
        req.user = user;
        next();
      } else {
        res.status(401).json({ error: 'Invalid token' });
      }
    }
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};
