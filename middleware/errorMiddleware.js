/**
 * Error Middleware for Centralized Error Handling in Express
 */

// 404 Not Found Middleware
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Resource not found at ${req.originalUrl}`
  });
};

// Global Error Handler Middleware
const globalErrorHandler = (err, req, res, next) => {
  console.error('Unhandled Error:', err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    status: statusCode >= 500 ? 'error' : 'fail',
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
};

module.exports = {
  notFoundHandler,
  globalErrorHandler
};
