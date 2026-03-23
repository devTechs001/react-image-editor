// backend/src/routes/auth.js
const express = require('express');
const {
  body
} = require('express-validator');
const passport = require('passport');
const router = express.Router();
const authController = require('../controllers/authController');
const {
  auth
} = require('../middleware/auth');
const {
  validate
} = require('../middleware/validation');

// Validation rules
const registerValidation = [body('name').trim().notEmpty().withMessage('Name is required').isLength({
  max: 100
}).withMessage('Name cannot exceed 100 characters'), body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Please provide a valid email').normalizeEmail(), body('password').notEmpty().withMessage('Password is required').isLength({
  min: 8
}).withMessage('Password must be at least 8 characters').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')];
const loginValidation = [body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Please provide a valid email'), body('password').notEmpty().withMessage('Password is required')];

// Routes
router.post('/register', validate(registerValidation), authController.register);
router.post('/login', validate(loginValidation), authController.login);
router.post('/logout', auth, authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.get('/me', auth, authController.getMe);
router.put('/profile', auth, authController.updateProfile);
router.put('/password', auth, authController.changePassword);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.post('/verify-email/:token', authController.verifyEmail);
router.post('/resend-verification', auth, authController.resendVerification);

// Google OAuth
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));
router.get('/google/callback', passport.authenticate('google', {
  session: false
}), authController.googleCallback);
module.exports = router;