import { body, param } from 'express-validator';

const passwordConfirmation = body('password_confirmation').custom((value, { req }) => {
  if (value !== req.body.password) throw new Error('Los Password no son iguales');
  return true;
});

const passwordRules = body('password').isLength({ min: 8 }).withMessage('El password es muy corto, minimo 8 caracteres');

export const createAccountRules = [
  body('name').notEmpty().withMessage('El nombre no puede ir vacio'),
  passwordRules,
  passwordConfirmation,
  body('email').isEmail().withMessage('E-mail no válido'),
];

export const confirmAccountRules = [body('token').notEmpty().withMessage('El Token no puede ir vacio')];

export const loginRules = [body('email').isEmail().withMessage('E-mail no válido'), body('password').notEmpty().withMessage('El password no puede ir vacio')];

export const emailRules = [body('email').isEmail().withMessage('E-mail no válido')];

export const validateTokenRules = [body('token').notEmpty().withMessage('El Token no puede ir vacio')];

export const updatePasswordWithTokenRules = [param('token').isNumeric().withMessage('Token no válido'), passwordRules, passwordConfirmation];

export const updateProfileRules = [body('name').notEmpty().withMessage('El nombre no puede ir vacio'), body('email').isEmail().withMessage('E-mail no válido')];

export const updateCurrentUserPasswordRules = [body('current_password').notEmpty().withMessage('El password actual no puede ir vacio'), passwordRules, passwordConfirmation];

export const verifyPasswordRules = [body('password').notEmpty().withMessage('El password no puede ir vacio')];
