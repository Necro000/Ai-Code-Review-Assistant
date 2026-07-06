const AppError = require('../utils/AppError');

/**
 * Regex for email validation
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Regex for password complexity:
 * - At least 8 characters long
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 */
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

/**
 * Middleware to validate registration request body.
 */
const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 50) {
    errors.push({ field: 'name', message: 'Name must be between 2 and 50 characters long.' });
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.push({ field: 'email', message: 'Please provide a valid email address.' });
  }

  if (!password || typeof password !== 'string' || !PASSWORD_REGEX.test(password)) {
    errors.push({
      field: 'password',
      message: 'Password must be at least 8 characters long, and contain at least one uppercase letter, one lowercase letter, and one number.',
    });
  }

  if (errors.length > 0) {
    const error = new AppError('Validation failed', 400, 'VALIDATION_ERROR');
    error.details = errors;
    return next(error);
  }

  next();
};

/**
 * Middleware to validate login request body.
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.push({ field: 'email', message: 'Please provide a valid email address.' });
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    errors.push({ field: 'password', message: 'Password is required.' });
  }

  if (errors.length > 0) {
    const error = new AppError('Validation failed', 400, 'VALIDATION_ERROR');
    error.details = errors;
    return next(error);
  }

  next();
};

/**
 * Middleware to validate forgot password request body.
 */
const validateForgotPassword = (req, res, next) => {
  const { email } = req.body;
  const errors = [];

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.push({ field: 'email', message: 'Please provide a valid email address.' });
  }

  if (errors.length > 0) {
    const error = new AppError('Validation failed', 400, 'VALIDATION_ERROR');
    error.details = errors;
    return next(error);
  }

  next();
};

/**
 * Middleware to validate reset password request body.
 */
const validateResetPassword = (req, res, next) => {
  const { token, password } = req.body;
  const errors = [];

  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    errors.push({ field: 'token', message: 'Reset token is required.' });
  }

  if (!password || typeof password !== 'string' || !PASSWORD_REGEX.test(password)) {
    errors.push({
      field: 'password',
      message: 'Password must be at least 8 characters long, and contain at least one uppercase letter, one lowercase letter, and one number.',
    });
  }

  if (errors.length > 0) {
    const error = new AppError('Validation failed', 400, 'VALIDATION_ERROR');
    error.details = errors;
    return next(error);
  }

  next();
};

/**
 * Middleware to validate user profile update request body.
 */
const validateUpdateProfile = (req, res, next) => {
  const { name, email } = req.body;
  const errors = [];

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 50) {
      errors.push({ field: 'name', message: 'Name must be between 2 and 50 characters long.' });
    }
  }

  if (email !== undefined) {
    if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      errors.push({ field: 'email', message: 'Please provide a valid email address.' });
    }
  }

  if (errors.length > 0) {
    const error = new AppError('Validation failed', 400, 'VALIDATION_ERROR');
    error.details = errors;
    return next(error);
  }

  next();
};

/**
 * Middleware to validate change password request body.
 */
const validateChangePassword = (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  const errors = [];

  if (!oldPassword || typeof oldPassword !== 'string' || oldPassword.length === 0) {
    errors.push({ field: 'oldPassword', message: 'Old password is required.' });
  }

  if (!newPassword || typeof newPassword !== 'string' || !PASSWORD_REGEX.test(newPassword)) {
    errors.push({
      field: 'newPassword',
      message: 'New password must be at least 8 characters long, and contain at least one uppercase letter, one lowercase letter, and one number.',
    });
  }

  if (errors.length > 0) {
    const error = new AppError('Validation failed', 400, 'VALIDATION_ERROR');
    error.details = errors;
    return next(error);
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateUpdateProfile,
  validateChangePassword,
};
