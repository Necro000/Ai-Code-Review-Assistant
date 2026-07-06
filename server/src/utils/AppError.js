/**
 * Custom application error class.
 *
 * Extends the built-in Error with HTTP status code and
 * machine-readable error code for consistent API responses.
 */
class AppError extends Error {
  /**
   * @param {string} message - Human-readable error description
   * @param {number} statusCode - HTTP status code (e.g., 400, 401, 404, 500)
   * @param {string} errorCode - Machine-readable error code (e.g., 'VALIDATION_ERROR')
   */
  constructor(message, statusCode, errorCode) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true; // Distinguishes expected errors from programming bugs

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
