/**
 * Standard API Response View Helper
 * Ensures consistent JSON response structure across the entire application
 */
const successResponse = (res, statusCode = 200, message = 'Success', data = {}) => {
  return res.status(statusCode).json({
    success: true,
    status: 'success',
    message,
    data,
    ...data
  });
};

const failResponse = (res, statusCode = 400, message = 'Validation or client error', extra = {}) => {
  return res.status(statusCode).json({
    success: false,
    status: 'fail',
    message,
    ...extra
  });
};

const errorResponse = (res, statusCode = 500, message = 'Internal server error', error = null) => {
  return res.status(statusCode).json({
    success: false,
    status: 'error',
    message,
    ...(error ? { error: error.message || error } : {})
  });
};

module.exports = {
  successResponse,
  failResponse,
  errorResponse
};
