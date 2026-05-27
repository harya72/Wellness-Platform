

const { prisma } = require('../config/database');
const { hashPassword, comparePassword, generateToken } = require('../services/auth.service');
const { successResponse, errorResponse, HTTP_STATUS } = require('../utils/responses');
const { ERROR_CODES } = require('../utils/constants');
const { asyncHandler } = require('../middlewares/error.middleware');


const register = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    return errorResponse(res, {
      statusCode: HTTP_STATUS.CONFLICT.code,
      message: 'User with this email already exists',
      code: ERROR_CODES.DUPLICATE_ENTRY,
    });
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name || null,
    },
    select: {
      id: true,
      email: true,
      name: true,
      isOnboarded: true,
      createdAt: true,
    },
  });

  const token = generateToken({
    userId: user.id,
    email: user.email,
  });

  return successResponse(res, {
    statusCode: HTTP_STATUS.CREATED.code,
    message: 'User registered successfully',
    data: {
      user,
      token,
    },
  });
});


const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    return errorResponse(res, {
      statusCode: HTTP_STATUS.UNAUTHORIZED.code,
      message: 'Invalid email or password',
      code: ERROR_CODES.AUTHENTICATION_ERROR,
    });
  }

  const isValidPassword = await comparePassword(password, user.password);

  if (!isValidPassword) {
    return errorResponse(res, {
      statusCode: HTTP_STATUS.UNAUTHORIZED.code,
      message: 'Invalid email or password',
      code: ERROR_CODES.AUTHENTICATION_ERROR,
    });
  }

  const token = generateToken({
    userId: user.id,
    email: user.email,
  });

  const userData = {
    id: user.id,
    email: user.email,
    name: user.name,
    isOnboarded: user.isOnboarded,
    age: user.age,
    weight: user.weight,
    height: user.height,
    gender: user.gender,
    activityLevel: user.activityLevel,
    bmi: user.bmi,
    dailyCalorieGoal: user.dailyCalorieGoal,
  };

  return successResponse(res, {
    statusCode: HTTP_STATUS.OK.code,
    message: 'Login successful',
    data: {
      user: userData,
      token,
    },
  });
});


const logout = asyncHandler(async (req, res) => {

  return successResponse(res, {
    statusCode: HTTP_STATUS.OK.code,
    message: 'Logged out successfully',
  });
});


const getCurrentUser = asyncHandler(async (req, res) => {
  const user = req.user;

  return successResponse(res, {
    statusCode: HTTP_STATUS.OK.code,
    message: 'User retrieved successfully',
    data: { user },
  });
});

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
};
