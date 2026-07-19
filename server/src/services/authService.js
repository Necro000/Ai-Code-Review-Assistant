const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/db');
const AppError = require('../utils/AppError');
const env = require('../config/env');

/**
 * Generate Access Token (JWT)
 */
const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId },
    env.JWT_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRY }
  );
};

/**
 * Generate Refresh Token (JWT)
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRY }
  );
};

/**
 * Generate Password Reset Token (JWT)
 */
const generateResetToken = (email) => {
  return jwt.sign(
    { email },
    env.JWT_SECRET,
    { expiresIn: '1h' } // Reset token expires in 1 hour
  );
};

/**
 * Register a new user
 */
const registerUser = async (name, email, password) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new AppError('Email is already registered', 409, 'EMAIL_EXISTS');
  }

  // Hash password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const newUser = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      githubId: true,
      role: true,
      createdAt: true,
    },
  });

  return newUser;
};

/**
 * Log in a user
 */
const loginUser = async (email, password) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw new AppError('No account found with this email. Please create a new account first.', 404, 'ACCOUNT_NOT_FOUND');
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError('Incorrect password. Please check your password and try again.', 401, 'INVALID_PASSWORD');
  }

  // Generate tokens
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      githubId: user.githubId,
      role: user.role,
      createdAt: user.createdAt,
    },
  };
};

/**
 * Refresh access token using a refresh token
 */
const refreshUserToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError('Refresh token is required', 401, 'REFRESH_TOKEN_REQUIRED');
  }

  try {
    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    
    // Check if user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw new AppError('User not found', 401, 'USER_NOT_FOUND');
    }

    const newAccessToken = generateAccessToken(user.id);
    return { accessToken: newAccessToken };
  } catch (error) {
    throw new AppError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
  }
};

/**
 * Generate password reset link/token
 */
const forgotPasswordFlow = async (email) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  // Security best practice: Do not reveal if the email exists or not
  if (!user) {
    return { message: 'If the email exists, a reset link will be sent.' };
  }

  const resetToken = generateResetToken(user.email);
  
  // Since we don't have a mail server configured yet, we return the token in response
  // (In production, you'd send this as a link: clientUrl/reset-password?token=resetToken)
  return { 
    message: 'If the email exists, a reset link will be sent.',
    resetToken // Returned for development convenience
  };
};

/**
 * Reset password using a reset token
 */
const resetPasswordFlow = async (token, newPassword) => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const normalizedEmail = decoded.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password
    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { password: hashedPassword },
    });

    return { message: 'Password has been reset successfully' };
  } catch (error) {
    throw new AppError('Invalid or expired reset token', 400, 'INVALID_RESET_TOKEN');
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshUserToken,
  forgotPasswordFlow,
  resetPasswordFlow,
};
