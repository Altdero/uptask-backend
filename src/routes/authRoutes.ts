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
import { handleInputErrors } from '@/middleware/validation';
import {
  confirmAccountRules,
  createAccountRules,
  emailRules,
  loginRules,
  updateCurrentUserPasswordRules,
  updatePasswordWithTokenRules,
  updateProfileRules,
  validateTokenRules,
  verifyPasswordRules,
} from '@/validations/authValidations';

const router = Router();

router.post('/create-account', createAccountRules, handleInputErrors, createAccount);
router.post('/confirm-account', confirmAccountRules, handleInputErrors, confirmAccount);
router.post('/login', loginRules, handleInputErrors, login);
router.post('/request-code', emailRules, handleInputErrors, requestConfirmationCode);
router.post('/forgot-password', emailRules, handleInputErrors, forgotPassword);
router.post('/validate-token', validateTokenRules, handleInputErrors, validateToken);
router.post('/update-password/:token', updatePasswordWithTokenRules, handleInputErrors, updatePasswordWithToken);

router.get('/user', authenticate, getUser);

/** Profile */
router.put('/profile', authenticate, updateProfileRules, handleInputErrors, updateProfile);
router.post('/update-password', authenticate, updateCurrentUserPasswordRules, handleInputErrors, updateCurrentUserPassword);
router.post('/check-password', authenticate, verifyPasswordRules, handleInputErrors, verifyPassword);

export default router;
