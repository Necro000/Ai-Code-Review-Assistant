const rateLimit = require('express-rate-limit');
const { sendError } = require('../utils/responseFormatter');

/**
 * Rate limiter for sensitive auth endpoints (login, register, forgot/reset password).
 * Limits requests from a single IP to 5 requests per minute.
 */
const authRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 5, // Limit each IP to 5 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    return sendError(res, {
      message: 'Too many login or registration attempts. Please try again after a minute.',
      statusCode: 429,
      errorCode: 'RATE_LIMIT_EXCEEDED',
    });
  },
});

/**
 * General API rate limiter.
 * Limits general requests to 100 requests per 15 minutes.
 */
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(res, {
      message: 'Too many requests. Please try again later.',
      statusCode: 429,
      errorCode: 'RATE_LIMIT_EXCEEDED',
    });
  },
});

module.exports = { authRateLimiter, apiRateLimiter };
