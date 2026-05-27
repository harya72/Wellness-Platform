

const { verifyToken, extractTokenFromHeader } = require('../services/auth.service');
const { prisma } = require('../config/database');
const { errorResponse, HTTP_STATUS } = require('../utils/responses');
const { ERROR_CODES } = require('../utils/constants');


const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return errorResponse(res, {
        statusCode: HTTP_STATUS.UNAUTHORIZED.code,
        message: 'Access denied. No token provided.',
        code: ERROR_CODES.AUTHENTICATION_ERROR,
      });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return errorResponse(res, {
          statusCode: HTTP_STATUS.UNAUTHORIZED.code,
          message: 'Token has expired. Please login again.',
          code: ERROR_CODES.AUTHENTICATION_ERROR,
        });
      }
      return errorResponse(res, {
        statusCode: HTTP_STATUS.UNAUTHORIZED.code,
        message: 'Invalid token.',
        code: ERROR_CODES.AUTHENTICATION_ERROR,
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        isOnboarded: true,
        age: true,
        weight: true,
        height: true,
        gender: true,
        activityLevel: true,
        bmi: true,
        dailyCalorieGoal: true,
      },
    });

    if (!user) {
      return errorResponse(res, {
        statusCode: HTTP_STATUS.UNAUTHORIZED.code,
        message: 'User not found.',
        code: ERROR_CODES.AUTHENTICATION_ERROR,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return errorResponse(res, {
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR.code,
      message: 'Authentication failed.',
      code: ERROR_CODES.INTERNAL_ERROR,
    });
  }
};


const requireOnboarding = (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, {
      statusCode: HTTP_STATUS.UNAUTHORIZED.code,
      message: 'User not authenticated.',
      code: ERROR_CODES.AUTHENTICATION_ERROR,
    });
  }

  if (!req.user.isOnboarded) {
    return errorResponse(res, {
      statusCode: HTTP_STATUS.FORBIDDEN.code,
      message: 'Please complete onboarding first.',
      code: ERROR_CODES.AUTHORIZATION_ERROR,
    });
  }

  next();
};


const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return next();
    }

    try {
      const decoded = verifyToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          isOnboarded: true,
        },
      });

      if (user) {
        req.user = user;
      }
    } catch (error) {
    }

    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  authenticate,
  requireOnboarding,
  optionalAuth,
};
