import type { Request, Response } from 'express';

import { AuthEmail } from '@/emails/AuthEmail';
import Token from '@/models/Token';
import User from '@/models/User';
import { comparePassword, hashPassword } from '@/utils/auth';
import { generateJWT } from '@/utils/jwt';
import { generateToken } from '@/utils/token';

export const createAccount = async (req: Request, res: Response) => {
  try {
    const { password, email } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      const error = new Error('User already registered');
      return res.status(409).json({ error: error.message });
    }

    const user = new User(req.body);

    user.password = await hashPassword(password);

    const token = new Token();
    token.token = generateToken();
    token.user = user._id;

    await AuthEmail.sendConfirmationEmail({
      email: user.email,
      name: user.name,
      token: token.token,
    });

    await Promise.allSettled([user.save(), token.save()]);
    res.send('Account created, check your email to confirm it');
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const confirmAccount = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    const tokenExists = await Token.findOne({ token });
    if (!tokenExists) {
      const error = new Error('Invalid token');
      return res.status(404).json({ error: error.message });
    }

    const user = await User.findById(tokenExists.user);
    user.confirmed = true;

    await Promise.allSettled([user.save(), tokenExists.deleteOne()]);
    res.send('Account confirmed successfully');
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error('User not found');
      return res.status(404).json({ error: error.message });
    }

    if (!user.confirmed) {
      const token = new Token();
      token.user = user._id;
      token.token = generateToken();
      await token.save();

      await AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      const error = new Error('Account not confirmed, we have sent a confirmation email');
      return res.status(401).json({ error: error.message });
    }

    const isPasswordCorrect = await comparePassword(password, user.password);
    if (!isPasswordCorrect) {
      const error = new Error('Incorrect password');
      return res.status(401).json({ error: error.message });
    }

    const token = generateJWT({ id: user._id });

    res.send(token);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const requestConfirmationCode = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error('User not registered');
      return res.status(404).json({ error: error.message });
    }

    if (user.confirmed) {
      const error = new Error('User already confirmed');
      return res.status(403).json({ error: error.message });
    }

    const token = new Token();
    token.token = generateToken();
    token.user = user._id;

    await AuthEmail.sendConfirmationEmail({
      email: user.email,
      name: user.name,
      token: token.token,
    });

    await Promise.allSettled([user.save(), token.save()]);

    res.send('A new token has been sent to your email');
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error('User not registered');
      return res.status(404).json({ error: error.message });
    }

    const token = new Token();
    token.token = generateToken();
    token.user = user._id;
    await token.save();

    await AuthEmail.sendPasswordResetToken({
      email: user.email,
      name: user.name,
      token: token.token,
    });
    res.send('Check your email for instructions');
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const validateToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    const tokenExists = await Token.findOne({ token });
    if (!tokenExists) {
      const error = new Error('Invalid token');
      return res.status(404).json({ error: error.message });
    }
    res.send('Valid token, set your new password');
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePasswordWithToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const tokenExists = await Token.findOne({ token });
    if (!tokenExists) {
      const error = new Error('Invalid token');
      return res.status(404).json({ error: error.message });
    }

    const user = await User.findById(tokenExists.user);
    user.password = await hashPassword(password);

    await Promise.allSettled([user.save(), tokenExists.deleteOne()]);

    res.send('Password updated successfully');
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUser = async (req: Request, res: Response) => {
  return res.json(req.user);
};

export const updateProfile = async (req: Request, res: Response) => {
  const { name, email } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists && userExists.id.toString() !== req.user._id.toString()) {
    const error = new Error('That email is already registered');
    return res.status(409).json({ error: error.message });
  }

  req.user.name = name;
  req.user.email = email;

  try {
    await req.user.save();
    res.send('Profile updated successfully');
  } catch {
    res.status(500).send('Internal server error');
  }
};

export const updateCurrentUserPassword = async (req: Request, res: Response) => {
  // eslint-disable-next-line camelcase
  const { current_password, password } = req.body;

  const user = await User.findById(req.user._id);

  const isPasswordCorrect = await comparePassword(current_password, user.password);
  if (!isPasswordCorrect) {
    const error = new Error('Current password is incorrect');
    return res.status(401).json({ error: error.message });
  }

  try {
    user.password = await hashPassword(password);
    await user.save();
    res.send('Password updated successfully');
  } catch {
    res.status(500).send('Internal server error');
  }
};

export const verifyPassword = async (req: Request, res: Response) => {
  const { password } = req.body;

  const user = await User.findById(req.user._id);

  const isPasswordCorrect = await comparePassword(password, user.password);
  if (!isPasswordCorrect) {
    const error = new Error('Incorrect password');
    return res.status(401).json({ error: error.message });
  }

  res.send('Correct password');
};
