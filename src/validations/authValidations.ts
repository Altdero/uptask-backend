import { z } from 'zod';

const passwordField = z.string().min(8, 'El password es muy corto, minimo 8 caracteres');
const emailField = z.email('E-mail no válido');

const passwordWithConfirmation = z
  .object({
    password: passwordField,
    // eslint-disable-next-line camelcase
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Los Password no son iguales',
    path: ['password_confirmation'],
  });

export const createAccountSchema = {
  body: z
    .object({
      name: z.string().min(1, 'El nombre no puede ir vacio'),
      email: emailField,
    })
    .and(passwordWithConfirmation),
};

export const confirmAccountSchema = {
  body: z.object({ token: z.string().min(1, 'El Token no puede ir vacio') }),
};

export const loginSchema = {
  body: z.object({
    email: emailField,
    password: z.string().min(1, 'El password no puede ir vacio'),
  }),
};

export const emailSchema = {
  body: z.object({ email: emailField }),
};

export const validateTokenSchema = {
  body: z.object({ token: z.string().min(1, 'El Token no puede ir vacio') }),
};

export const updatePasswordWithTokenSchema = {
  params: z.object({ token: z.string().regex(/^\d+$/, 'Token no válido') }),
  body: passwordWithConfirmation,
};

export const updateProfileSchema = {
  body: z.object({
    name: z.string().min(1, 'El nombre no puede ir vacio'),
    email: emailField,
  }),
};

export const updateCurrentUserPasswordSchema = {
  // eslint-disable-next-line camelcase
  body: z.object({ current_password: z.string().min(1, 'El password actual no puede ir vacio') }).and(passwordWithConfirmation),
};

export const verifyPasswordSchema = {
  body: z.object({ password: z.string().min(1, 'El password no puede ir vacio') }),
};
