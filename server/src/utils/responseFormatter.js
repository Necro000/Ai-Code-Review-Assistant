/**
 * Wrap controller response in a standard API envelope.
 *
 * Success: { success: true, data, message, meta }
 * Error:   { success: false, error: { code, message, details } }
 */

/**
 * Send a success response.
 *
 * @param {import('express').Response} res
 * @param {object}  options
 * @param {*}       options.data    - Response payload
 * @param {string}  options.message - Human-readable message
 * @param {number}  options.statusCode - HTTP status (default 200)
 * @param {object}  options.meta    - Pagination / extra metadata
 */
function sendSuccess(res, { data = null, message = 'Success', statusCode = 200, meta = undefined } = {}) {
  const response = {
    success: true,
    data,
    message,
  };

  if (meta) {response.meta = meta;}

  return res.status(statusCode).json(response);
}

/**
 * Send an error response.
 *
 * @param {import('express').Response} res
 * @param {object}  options
 * @param {string}  options.message   - Human-readable error message
 * @param {number}  options.statusCode - HTTP status (default 500)
 * @param {string}  options.errorCode  - Machine-readable code
 * @param {Array}   options.details    - Field-level validation errors
 */
function sendError(res, { message = 'Internal Server Error', statusCode = 500, errorCode = 'INTERNAL_ERROR', details = undefined } = {}) {
  const response = {
    success: false,
    error: {
      code: errorCode,
      message,
    },
  };

  if (details) {response.error.details = details;}

  return res.status(statusCode).json(response);
}

module.exports = { sendSuccess, sendError };
