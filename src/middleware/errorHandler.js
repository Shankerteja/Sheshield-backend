/**
 * Global error handler middleware
 * This middleware catches any errors that occur during request processing
 * and sends a standardized error response
 */

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error status and message
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler; 