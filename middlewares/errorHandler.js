// errorHandler.js

const errorHandler = (err, req, res, next) => {
  console.error(err); // Log the error for debugging

  // Determine the status code; default to 500 for server errors
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400; // Bad Request for validation errors
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401; // Unauthorized for invalid tokens
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401; // Unauthorized for expired tokens
  }

  res.status(statusCode);

  res.json({
    error: {
      message: err.message || 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'production' ? null : err.stack, // Hide stack trace in production
    }
  });
};

module.exports = errorHandler;
