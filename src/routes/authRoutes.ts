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

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and user profile
 */

/**
 * @swagger
 * /api/auth/create-account:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, password_confirmation]
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: secret1234
 *               password_confirmation:
 *                 type: string
 *                 example: secret1234
 *     responses:
 *       201:
 *         description: Account created. Confirmation email sent.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: Account created, check your email
 *       409:
 *         description: Email already registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 */
router.post('/create-account', validate(createAccountSchema), createAccount);

/**
 * @swagger
 * /api/auth/confirm-account:
 *   post:
 *     summary: Confirm email with OTP token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Account confirmed
 *       400:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/confirm-account', validate(confirmAccountSchema), confirmAccount);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login and receive a JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: secret1234
 *     responses:
 *       200:
 *         description: JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Invalid credentials or unconfirmed account
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 */
router.post('/login', validate(loginSchema), login);

/**
 * @swagger
 * /api/auth/request-code:
 *   post:
 *     summary: Re-send confirmation OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: New OTP sent
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/request-code', validate(emailSchema), requestConfirmationCode);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Send password reset OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: Reset OTP sent
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/forgot-password', validate(emailSchema), forgotPassword);

/**
 * @swagger
 * /api/auth/validate-token:
 *   post:
 *     summary: Validate a password reset OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Token is valid
 *       404:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/validate-token', validate(validateTokenSchema), validateToken);

/**
 * @swagger
 * /api/auth/update-password/{token}:
 *   post:
 *     summary: Set a new password using a validated OTP
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         example: "123456"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password, password_confirmation]
 *             properties:
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: newpassword1234
 *               password_confirmation:
 *                 type: string
 *                 example: newpassword1234
 *     responses:
 *       200:
 *         description: Password updated
 *       404:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 */
router.post('/update-password/:token', validate(updatePasswordWithTokenSchema), updatePasswordWithToken);

/**
 * @swagger
 * /api/auth/user:
 *   get:
 *     summary: Get the authenticated user's profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/user', authenticate, getUser);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Update name and email
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email]
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: Profile updated
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 */
router.put('/profile', authenticate, validate(updateProfileSchema), updateProfile);

/**
 * @swagger
 * /api/auth/update-password:
 *   post:
 *     summary: Change password (requires current password)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [current_password, password, password_confirmation]
 *             properties:
 *               current_password:
 *                 type: string
 *                 example: oldpassword1234
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: newpassword1234
 *               password_confirmation:
 *                 type: string
 *                 example: newpassword1234
 *     responses:
 *       200:
 *         description: Password updated
 *       401:
 *         description: Incorrect current password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 */
router.post('/update-password', authenticate, validate(updateCurrentUserPasswordSchema), updateCurrentUserPassword);

/**
 * @swagger
 * /api/auth/check-password:
 *   post:
 *     summary: Verify current password is correct
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password:
 *                 type: string
 *                 example: secret1234
 *     responses:
 *       200:
 *         description: Password is correct
 *       401:
 *         description: Password is incorrect
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/check-password', authenticate, validate(verifyPasswordSchema), verifyPassword);

export default router;
