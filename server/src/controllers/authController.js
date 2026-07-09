const authService = require('../services/authService');
const { sendSuccess } = require('../utils/responseFormatter');

// Helper to set refresh token cookie
const setRefreshTokenCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax', // Support cross-origin cookies in dev if needed
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });
};

/**
 * Register User Controller
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = await authService.registerUser(name, email, password);
    
    return sendSuccess(res, {
      data: { user },
      message: 'Registration successful! Please log in.',
      statusCode: 201,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login User Controller
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { accessToken, refreshToken, user } = await authService.loginUser(email, password);

    // Set refresh token in httpOnly cookie
    setRefreshTokenCookie(res, refreshToken);

    return sendSuccess(res, {
      data: { accessToken, user },
      message: 'Logged in successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh Token Controller
 */
const refreshToken = async (req, res, next) => {
  try {
    // Retrieve token from cookie first, fallback to body
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    const { accessToken } = await authService.refreshUserToken(token);

    return sendSuccess(res, {
      data: { accessToken },
      message: 'Token refreshed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout User Controller
 */
const logout = async (req, res, next) => {
  try {
    // Invalidate refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    return sendSuccess(res, {
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot Password Controller
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.forgotPasswordFlow(email);

    return sendSuccess(res, {
      data: result.resetToken ? { resetToken: result.resetToken } : null,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset Password Controller
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const result = await authService.resetPasswordFlow(token, password);

    return sendSuccess(res, {
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
};
