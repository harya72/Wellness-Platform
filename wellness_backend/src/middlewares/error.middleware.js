

const { errorResponse, HTTP_STATUS } = require('../utils/responses');
const { ERROR_CODES } = require('../utils/constants');


class ApiError extends Error {
  constructor(statusCode, message, code = null, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}


const notFoundHandler = (req, res, next) => {
  return errorResponse(res, {
    statusCode: HTTP_STATUS.NOT_FOUND.code,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    code: ERROR_CODES.NOT_FOUND,
  });
};


const errorHandler = (err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });


  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    return errorResponse(res, {
      statusCode: HTTP_STATUS.CONFLICT.code,
      message: `A record with this ${field} already exists`,
      code: ERROR_CODES.DUPLICATE_ENTRY,
    });
  }

  if (err.code === 'P2025') {
    return errorResponse(res, {
      statusCode: HTTP_STATUS.NOT_FOUND.code,
      message: 'Record not found',
      code: ERROR_CODES.NOT_FOUND,
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, {
      statusCode: HTTP_STATUS.UNAUTHORIZED.code,
      message: 'Invalid token',
      code: ERROR_CODES.AUTHENTICATION_ERROR,
    });
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, {
      statusCode: HTTP_STATUS.UNAUTHORIZED.code,
      message: 'Token expired',
      code: ERROR_CODES.AUTHENTICATION_ERROR,
    });
  }

  if (err.name === 'ZodError') {
    const errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return errorResponse(res, {
      statusCode: HTTP_STATUS.UNPROCESSABLE_ENTITY.code,
      message: 'Validation failed',
      errors,
      code: ERROR_CODES.VALIDATION_ERROR,
    });
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return errorResponse(res, {
      statusCode: HTTP_STATUS.BAD_REQUEST.code,
      message: 'Invalid JSON in request body',
      code: ERROR_CODES.VALIDATION_ERROR,
    });
  }

  if (err instanceof ApiError) {
    return errorResponse(res, {
      statusCode: err.statusCode,
      message: err.message,
      code: err.code,
      errors: err.errors,
    });
  }

  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR.code;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error';

  return errorResponse(res, {
    statusCode,
    message,
    code: ERROR_CODES.INTERNAL_ERROR,
  });
};

/**
 * Async handler wrapper to catch errors in async functions
 * @param {Function} fn - Async controller function
 * @returns {Function} - Wrapped function
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  ApiError,
  notFoundHandler,
  errorHandler,
  asyncHandler,
};
