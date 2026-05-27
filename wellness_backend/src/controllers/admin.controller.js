

const { prisma } = require('../config/database');
const { successResponse, errorResponse, HTTP_STATUS } = require('../utils/responses');
const { ERROR_CODES } = require('../utils/constants');
const { asyncHandler } = require('../middlewares/error.middleware');


const getAllUsers = asyncHandler(async (req, res) => {
  const { limit = 50, offset = 0 } = req.query;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        age: true,
        weight: true,
        height: true,
        gender: true,
        goal: true,
        bmi: true,
        dailyCalorieGoal: true,
        isOnboarded: true,
        createdAt: true,
        _count: { select: { meals: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    }),
    prisma.user.count(),
  ]);

  return successResponse(res, {
    statusCode: HTTP_STATUS.OK.code,
    message: 'Users retrieved successfully',
    data: { users, total },
  });
});


const createUser = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return errorResponse(res, {
      statusCode: HTTP_STATUS.BAD_REQUEST.code,
      message: 'Email and password are required',
      code: ERROR_CODES.VALIDATION_ERROR,
    });
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return errorResponse(res, {
      statusCode: HTTP_STATUS.CONFLICT.code,
      message: 'User with this email already exists',
      code: ERROR_CODES.DUPLICATE_ENTRY,
    });
  }

  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email: email.toLowerCase(), password: hashedPassword, name: name || null },
    select: { id: true, email: true, name: true, createdAt: true },
  });

  return successResponse(res, {
    statusCode: HTTP_STATUS.CREATED.code,
    message: 'User created successfully',
    data: { user },
  });
});


const getAllMeals = asyncHandler(async (req, res) => {
  const { limit = 50, offset = 0, status, userId } = req.query;

  const where = {};
  if (status) where.status = status;
  if (userId) where.userId = userId;

  const [meals, total] = await Promise.all([
    prisma.meal.findMany({
      where,
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
        foodItems: true,
        comments: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    }),
    prisma.meal.count({ where }),
  ]);

  return successResponse(res, {
    statusCode: HTTP_STATUS.OK.code,
    message: 'Meals retrieved successfully',
    data: { meals, total },
  });
});


const updateMealStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'approved', 'flagged'];
  if (!status || !validStatuses.includes(status)) {
    return errorResponse(res, {
      statusCode: HTTP_STATUS.BAD_REQUEST.code,
      message: `Status must be one of: ${validStatuses.join(', ')}`,
      code: ERROR_CODES.VALIDATION_ERROR,
    });
  }

  const meal = await prisma.meal.findUnique({ where: { id } });
  if (!meal) {
    return errorResponse(res, {
      statusCode: HTTP_STATUS.NOT_FOUND.code,
      message: 'Meal not found',
      code: ERROR_CODES.NOT_FOUND,
    });
  }

  const updated = await prisma.meal.update({
    where: { id },
    data: { status },
    include: {
      user: { select: { id: true, email: true, name: true } },
      foodItems: true,
      comments: true,
    },
  });

  return successResponse(res, {
    statusCode: HTTP_STATUS.OK.code,
    message: 'Meal status updated successfully',
    data: { meal: updated },
  });
});


const addComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { authorName, body } = req.body;

  if (!body || !body.trim()) {
    return errorResponse(res, {
      statusCode: HTTP_STATUS.BAD_REQUEST.code,
      message: 'Comment body is required',
      code: ERROR_CODES.VALIDATION_ERROR,
    });
  }

  const meal = await prisma.meal.findUnique({ where: { id } });
  if (!meal) {
    return errorResponse(res, {
      statusCode: HTTP_STATUS.NOT_FOUND.code,
      message: 'Meal not found',
      code: ERROR_CODES.NOT_FOUND,
    });
  }

  const comment = await prisma.mealComment.create({
    data: {
      mealId: id,
      authorName: authorName || 'Admin',
      body: body.trim(),
    },
  });

  return successResponse(res, {
    statusCode: HTTP_STATUS.CREATED.code,
    message: 'Comment added successfully',
    data: { comment },
  });
});


const getComments = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const comments = await prisma.mealComment.findMany({
    where: { mealId: id },
    orderBy: { createdAt: 'asc' },
  });

  return successResponse(res, {
    statusCode: HTTP_STATUS.OK.code,
    message: 'Comments retrieved successfully',
    data: { comments },
  });
});


const deleteComment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await prisma.mealComment.delete({ where: { id } });

  return successResponse(res, {
    statusCode: HTTP_STATUS.OK.code,
    message: 'Comment deleted successfully',
  });
});

module.exports = {
  getAllUsers,
  createUser,
  getAllMeals,
  updateMealStatus,
  addComment,
  getComments,
  deleteComment,
};
