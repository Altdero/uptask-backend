import { z } from 'zod';

const passwordField = z.string().min(8, 'Password must be at least 8 characters');
const emailField = z.email('Invalid email address');

const passwordWithConfirmation = z
  .object({
    password: passwordField,
    // eslint-disable-next-line camelcase
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  });

export const createAccountSchema = {
  body: z
    .object({
      name: z.string().min(1, 'Name is required'),
      email: emailField,
    })
    .and(passwordWithConfirmation),
};

export const confirmAccountSchema = {
  body: z.object({ token: z.string().min(1, 'Token is required') }),
};

export const loginSchema = {
  body: z.object({
    email: emailField,
    password: z.string().min(1, 'Password is required'),
  }),
};

export const emailSchema = {
  body: z.object({ email: emailField }),
};

export const validateTokenSchema = {
  body: z.object({ token: z.string().min(1, 'Token is required') }),
};

export const updatePasswordWithTokenSchema = {
  params: z.object({ token: z.string().regex(/^\d+$/, 'Invalid token') }),
  body: passwordWithConfirmation,
};

export const updateProfileSchema = {
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: emailField,
  }),
};

export const updateCurrentUserPasswordSchema = {
  body: z
    // eslint-disable-next-line camelcase
    .object({ current_password: z.string().min(1, 'Current password is required') })
    .and(passwordWithConfirmation)
    .refine((data) => data.current_password !== data.password, {
      message: 'New password must be different from current password',
      path: ['password'],
    }),
};

export const verifyPasswordSchema = {
  body: z.object({ password: z.string().min(1, 'Password is required') }),
};
