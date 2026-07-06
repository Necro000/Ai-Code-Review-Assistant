const AppError = require('../utils/AppError');
const { sendError } = require('../utils/responseFormatter');

/**
 * Global error-handling middleware.
 *
 * Catches all errors thrown or passed via next(err).
 * Distinguishes operational errors (AppError) from unexpected bugs.
 */
function errorHandler(err, req, res, _next) {
  // Log the error (full stack in development, minimal in production)
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', err);
  } else {
    console.error('❌ Error:', err.message);
  }

  // Handle known operational errors
  if (err instanceof AppError) {
    return sendError(res, {
      message: err.message,
      statusCode: err.statusCode,
      errorCode: err.errorCode,
    });
  }

  // Handle Prisma known errors
  if (err.code === 'P2002') {
    // Unique constraint violation
    const field = err.meta?.target?.[0] || 'field';
    return sendError(res, {
      message: `A record with this ${field} already exists`,
      statusCode: 409,
      errorCode: 'DUPLICATE_ENTRY',
    });
  }

  if (err.code === 'P2025') {
    // Record not found
    return sendError(res, {
      message: 'Resource not found',
      statusCode: 404,
      errorCode: 'NOT_FOUND',
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, {
      message: 'Invalid token',
      statusCode: 401,
      errorCode: 'INVALID_TOKEN',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, {
      message: 'Token has expired',
      statusCode: 401,
      errorCode: 'TOKEN_EXPIRED',
    });
  }

  // Handle Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return sendError(res, {
      message: 'File size exceeds the 500 KB limit',
      statusCode: 400,
      errorCode: 'FILE_TOO_LARGE',
    });
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return sendError(res, {
      message: 'Maximum 5 files per upload',
      statusCode: 400,
      errorCode: 'TOO_MANY_FILES',
    });
  }

  // Handle body-parser / payload errors
  if (err.type === 'entity.too.large') {
    return sendError(res, {
      message: 'Request payload too large (max 1 MB)',
      statusCode: 413,
      errorCode: 'PAYLOAD_TOO_LARGE',
    });
  }

  if (err.type === 'entity.parse.failed') {
    return sendError(res, {
      message: 'Invalid JSON in request body',
      statusCode: 400,
      errorCode: 'INVALID_JSON',
    });
  }

  // Fallback — unexpected error (don't leak internals in production)
  return sendError(res, {
    message: process.env.NODE_ENV === 'development'
      ? err.message
      : 'An unexpected error occurred',
    statusCode: 500,
    errorCode: 'INTERNAL_ERROR',
  });
}

module.exports = { errorHandler };
