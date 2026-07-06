const express = require('express');
const authController = require('../controllers/authController');
const { authRateLimiter } = require('../middleware/rateLimiter');
const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
} = require('../middleware/validator');

const router = express.Router();

// Public routes with rate limiting and validation
router.post('/register', authRateLimiter, validateRegister, authController.register);
router.post('/login', authRateLimiter, validateLogin, authController.login);
router.post('/forgot-password', authRateLimiter, validateForgotPassword, authController.forgotPassword);
router.post('/reset-password', authRateLimiter, validateResetPassword, authController.resetPassword);

// Refresh and Logout (No validation body rules required / handled internally)
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);

module.exports = router;
