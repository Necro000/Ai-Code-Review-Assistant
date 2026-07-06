const bcrypt = require('bcryptjs');
const { prisma } = require('../config/db');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/responseFormatter');

/**
 * Get current user profile
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    return sendSuccess(res, {
      data: { user },
      message: 'Profile retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile (name, email)
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const updateData = {};

    if (name) updateData.name = name.trim();

    if (email) {
      const normalizedEmail = email.toLowerCase().trim();

      // Check if email is already taken by another user
      const existingUser = await prisma.user.findFirst({
        where: {
          email: normalizedEmail,
          NOT: { id: req.userId },
        },
      });

      if (existingUser) {
        throw new AppError('Email is already in use by another account', 409, 'EMAIL_IN_USE');
      }

      updateData.email = normalizedEmail;
    }

    // If no update data provided, return original profile
    if (Object.keys(updateData).length === 0) {
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { id: true, name: true, email: true, createdAt: true },
      });
      return sendSuccess(res, { data: { user }, message: 'No changes applied' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return sendSuccess(res, {
      data: { user: updatedUser },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change user password
 */
const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new AppError('Incorrect old password', 400, 'INCORRECT_PASSWORD');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await prisma.user.update({
      where: { id: req.userId },
      data: { password: hashedPassword },
    });

    return sendSuccess(res, {
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
};
