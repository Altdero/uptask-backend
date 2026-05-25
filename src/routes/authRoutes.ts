import { Router } from 'express';

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
import { validate } from '@/middleware/validation';
import {
  confirmAccountSchema,
  createAccountSchema,
  emailSchema,
  loginSchema,
  updateCurrentUserPasswordSchema,
  updatePasswordWithTokenSchema,
  updateProfileSchema,
  validateTokenSchema,
  verifyPasswordSchema,
} from '@/validations/authValidations';

const router = Router();

router.post('/create-account', validate(createAccountSchema), createAccount);
router.post('/confirm-account', validate(confirmAccountSchema), confirmAccount);
router.post('/login', validate(loginSchema), login);
router.post('/request-code', validate(emailSchema), requestConfirmationCode);
router.post('/forgot-password', validate(emailSchema), forgotPassword);
router.post('/validate-token', validate(validateTokenSchema), validateToken);
router.post('/update-password/:token', validate(updatePasswordWithTokenSchema), updatePasswordWithToken);

router.get('/user', authenticate, getUser);

/** Profile */
router.put('/profile', authenticate, validate(updateProfileSchema), updateProfile);
router.post('/update-password', authenticate, validate(updateCurrentUserPasswordSchema), updateCurrentUserPassword);
router.post('/check-password', authenticate, validate(verifyPasswordSchema), verifyPassword);

export default router;
