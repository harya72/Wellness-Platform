

const { errorResponse, HTTP_STATUS } = require('../utils/responses');
const { ERROR_CODES } = require('../utils/constants');

const adminAuth = (req, res, next) => {
  const adminSecret = req.headers['x-admin-secret'];

  if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
    return errorResponse(res, {
      statusCode: HTTP_STATUS.UNAUTHORIZED.code,
      message: 'Admin access denied.',
      code: ERROR_CODES.AUTHENTICATION_ERROR,
    });
  }

  next();
};

module.exports = { adminAuth };
