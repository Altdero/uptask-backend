import { Router } from 'express';
import { body, param } from 'express-validator';

import {
  confirmAccount,
  createAccount,
  forgotPassword,
  getUser,
  login,
  requestConfirmationCode,
  updateCurrentUserPassword,
  updatePasswordWithToken,
  updateProfile,
  validateToken,
  verifyPassword,
} from '@/controllers/AuthController';
import { authenticate } from '@/middleware/auth';
import { handleInputErrors } from '@/middleware/validation';

const router = Router();

router.post(
  '/create-account',
  body('name').notEmpty().withMessage('El nombre no puede ir vacio'),
  body('password').isLength({ min: 8 }).withMessage('El password es muy corto, minimo 8 caracteres'),
  body('password_confirmation').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Los Password no son iguales');
    }
    return true;
  }),
  body('email').isEmail().withMessage('E-mail no válido'),
  handleInputErrors,
  createAccount
);

router.post('/confirm-account', body('token').notEmpty().withMessage('El Token no puede ir vacio'), handleInputErrors, confirmAccount);

router.post('/login', body('email').isEmail().withMessage('E-mail no válido'), body('password').notEmpty().withMessage('El password no puede ir vacio'), handleInputErrors, login);

router.post('/request-code', body('email').isEmail().withMessage('E-mail no válido'), handleInputErrors, requestConfirmationCode);

router.post('/forgot-password', body('email').isEmail().withMessage('E-mail no válido'), handleInputErrors, forgotPassword);

router.post('/validate-token', body('token').notEmpty().withMessage('El Token no puede ir vacio'), handleInputErrors, validateToken);

router.post(
  '/update-password/:token',
  param('token').isNumeric().withMessage('Token no válido'),
  body('password').isLength({ min: 8 }).withMessage('El password es muy corto, minimo 8 caracteres'),
  body('password_confirmation').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Los Password no son iguales');
    }
    return true;
  }),
  handleInputErrors,
  updatePasswordWithToken
);

router.get('/user', authenticate, getUser);

/** Profile */
router.put(
  '/profile',
  authenticate,
  body('name').notEmpty().withMessage('El nombre no puede ir vacio'),
  body('email').isEmail().withMessage('E-mail no válido'),
  handleInputErrors,
  updateProfile
);

router.post(
  '/update-password',
  authenticate,
  body('current_password').notEmpty().withMessage('El password actual no puede ir vacio'),
  body('password').isLength({ min: 8 }).withMessage('El password es muy corto, minimo 8 caracteres'),
  body('password_confirmation').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Los Password no son iguales');
    }
    return true;
  }),
  handleInputErrors,
  updateCurrentUserPassword
);

router.post('/check-password', authenticate, body('password').notEmpty().withMessage('El password no puede ir vacio'), handleInputErrors, verifyPassword);

export default router;
