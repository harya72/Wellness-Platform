
const { prisma } = require("../config/database");
const {
  getStartOfToday,
  getEndOfToday,
  getStartOfWeek,
  getEndOfWeek,
  getStartOfMonth,
  getEndOfMonth,
  PAGINATION,
} = require("../utils/constants");
const notificationService = require("./notification.service");

/**
 * Create a new meal entry
 * @param {Object} mealData - Meal data
 * @param {string} mealData.userId - User ID
 * @param {string} mealData.mealType - Type of meal
 * @param {string} [mealData.description] - Meal description
 * @param {string} [mealData.imageUrl] - Image URL
 * @param {number} mealData.totalCalories - Total calories
 * @param {number} [mealData.protein] - Protein in grams
 * @param {number} [mealData.carbs] - Carbs in grams
 * @param {number} [mealData.fats] - Fats in grams
 * @param {number} [mealData.fiber] - Fiber in grams
 * @param {Date} [mealData.mealDate] - Date of the meal
 * @param {Array} [mealData.foodItems] - Array of food items
 * @returns {Promise<Object>} - Created meal
 */
const createMeal = async (mealData) => {
  const {
    userId,
    mealType,
    description,
    imageUrl,
    totalCalories,
    protein,
    carbs,
    fats,
    fiber,
    mealDate,
    foodItems,
  } = mealData;

  const meal = await prisma.meal.create({
    data: {
      userId,
      mealType,
      description,
      imageUrl,
      totalCalories,
      protein,
      carbs,
      fats,
      fiber,
      mealDate: mealDate || new Date(),
      foodItems:
        foodItems && foodItems.length > 0
          ? {
            create: foodItems.map((item) => ({
              foodName: item.foodName,
              quantity: item.quantity,
              unit: item.unit,
              calories: item.calories,
              protein: item.protein,
              carbs: item.carbs,
              fats: item.fats,
            })),
          }
          : undefined,
    },
    include: {
      foodItems: true,
    },
  });

  await updateDailySummary(userId, mealDate || new Date());

  await notificationService.createAndSendNotification({
    userId,
    title: 'Meal Logged 🥗',
    body: `Your ${mealType} has been successfully logged. Keep it up!`,
    type: 'MEAL_LOGGED',
  });

  return meal;
};

/**
 * Get a meal by ID
 * @param {string} mealId - Meal ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object|null>} - Meal or null
 */
const getMealById = async (mealId, userId) => {
  return prisma.meal.findFirst({
    where: {
      id: mealId,
      userId,
    },
    include: {
      foodItems: true,
      comments: {
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });
};

/**
 * Get all meals for a user with pagination
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @param {number} [options.page=1] - Page number
 * @param {number} [options.limit=10] - Items per page
 * @param {Date} [options.startDate] - Filter start date
 * @param {Date} [options.endDate] - Filter end date
 * @param {string} [options.mealType] - Filter by meal type
 * @returns {Promise<Object>} - Paginated meals
 */
const getMeals = async (userId, options = {}) => {
  const page = Math.max(1, options.page || PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    Math.max(1, options.limit || PAGINATION.DEFAULT_LIMIT),
    PAGINATION.MAX_LIMIT,
  );
  const skip = (page - 1) * limit;

  const where = { userId };

  if (options.startDate || options.endDate) {
    where.mealDate = {};
    if (options.startDate) {
      const start = new Date(options.startDate);
      if (!isNaN(start.getTime())) {
        start.setHours(0, 0, 0, 0);
        where.mealDate.gte = start;
      }
    }
    if (options.endDate) {
      const end = new Date(options.endDate);
      if (!isNaN(end.getTime())) {
        end.setHours(23, 59, 59, 999);
        where.mealDate.lte = end;
      }
    }
  }

  if (options.mealType) {
    where.mealType = options.mealType;
  }

  const [total, meals] = await Promise.all([
    prisma.meal.count({ where }),
    prisma.meal.findMany({
      where,
      include: {
        foodItems: true,
        comments: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        mealDate: "desc",
      },
      skip,
      take: limit,
    }),
  ]);

  return {
    meals,
    total,
    page,
    limit,
  };
};

/**
 * Get today's meals for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Today's meals and summary
 */
const getTodaysMeals = async (userId) => {
  const startOfDay = getStartOfToday();
  const endOfDay = getEndOfToday();

  const [meals, aggregation] = await Promise.all([
    prisma.meal.findMany({
      where: {
        userId,
        mealDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        foodItems: true,
        comments: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        mealDate: "asc",
      },
    }),
    prisma.meal.aggregate({
      where: {
        userId,
        mealDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      _sum: {
        totalCalories: true,
        protein: true,
        carbs: true,
        fats: true,
        fiber: true,
      },
    }),
  ]);

  const totals = {
    totalCalories: aggregation._sum.totalCalories || 0,
    totalProtein: aggregation._sum.protein || 0,
    totalCarbs: aggregation._sum.carbs || 0,
    totalFats: aggregation._sum.fats || 0,
    totalFiber: aggregation._sum.fiber || 0,
  };

  return {
    meals,
    totals,
    mealsCount: meals.length,
    date: startOfDay,
  };
};

/**
 * Update a meal
 * @param {string} mealId - Meal ID
 * @param {string} userId - User ID (for authorization)
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object|null>} - Updated meal or null
 */
const updateMeal = async (mealId, userId, updateData) => {
  const existingMeal = await getMealById(mealId, userId);
  if (!existingMeal) {
    return null;
  }

  const { foodItems, ...mealData } = updateData;

  console.log(`Starting transaction for meal update: ${mealId}`);
  const startTime = Date.now();

  const updatedMeal = await prisma.$transaction(async (tx) => {
    const meal = await tx.meal.update({
      where: { id: mealId },
      data: mealData,
    });

    if (foodItems !== undefined) {
      await tx.foodItem.deleteMany({
        where: { mealId },
      });

      if (foodItems && foodItems.length > 0) {
        await tx.foodItem.createMany({
          data: foodItems.map((item) => ({
            mealId,
            foodName: item.foodName,
            quantity: item.quantity,
            unit: item.unit,
            calories: item.calories,
            protein: item.protein,
            carbs: item.carbs,
            fats: item.fats,
          })),
        });
      }
    }

    return tx.meal.findUnique({
      where: { id: mealId },
      include: { foodItems: true },
    });
  }, {
    timeout: 20000, // 20 seconds
    maxWait: 5000,  // 5 seconds
  });

  console.log(`Transaction completed in ${Date.now() - startTime}ms`);

  await updateDailySummary(userId, existingMeal.mealDate);

  return updatedMeal;
};

/**
 * Delete a meal
 * @param {string} mealId - Meal ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object|null>} - Deleted meal or null
 */
const deleteMeal = async (mealId, userId) => {
  const existingMeal = await getMealById(mealId, userId);
  if (!existingMeal) {
    return null;
  }

  const deletedMeal = await prisma.meal.delete({
    where: { id: mealId },
  });

  await updateDailySummary(userId, existingMeal.mealDate);

  return deletedMeal;
};

/**
 * Update or create daily summary for a user
 * @param {string} userId - User ID
 * @param {Date} date - Date to update
 * @returns {Promise<Object>} - Updated summary
 */
const updateDailySummary = async (userId, date) => {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const aggregation = await prisma.meal.aggregate({
    where: {
      userId,
      mealDate: {
        gte: dayStart,
        lte: dayEnd,
      },
    },
    _sum: {
      totalCalories: true,
      protein: true,
      carbs: true,
      fats: true,
    },
    _count: true,
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { dailyCalorieGoal: true },
  });

  const totals = {
    totalCalories: aggregation._sum.totalCalories || 0,
    totalProtein: aggregation._sum.protein || 0,
    totalCarbs: aggregation._sum.carbs || 0,
    totalFats: aggregation._sum.fats || 0,
  };

  return prisma.dailySummary.upsert({
    where: {
      userId_date: {
        userId,
        date: dayStart,
      },
    },
    update: {
      totalCalories: totals.totalCalories,
      totalProtein: totals.totalProtein,
      totalCarbs: totals.totalCarbs,
      totalFats: totals.totalFats,
      calorieGoal: user?.dailyCalorieGoal || 2000,
      mealsCount: aggregation._count,
    },
    create: {
      userId,
      date: dayStart,
      totalCalories: totals.totalCalories,
      totalProtein: totals.totalProtein,
      totalCarbs: totals.totalCarbs,
      totalFats: totals.totalFats,
      calorieGoal: user?.dailyCalorieGoal || 2000,
      mealsCount: aggregation._count,
    },
  });
};

/**
 * Get daily analytics for a user
 * @param {string} userId - User ID
 * @param {Date} [date] - Date (defaults to today)
 * @returns {Promise<Object>} - Daily analytics
 */
const getDailyAnalytics = async (userId, date = new Date()) => {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);

  const [user, summary] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { dailyCalorieGoal: true },
    }),
    prisma.dailySummary.findUnique({
      where: {
        userId_date: {
          userId,
          date: dayStart,
        },
      },
    }),
  ]);

  const calorieGoal = user?.dailyCalorieGoal || 2000;
  const consumed = summary?.totalCalories || 0;
  const remaining = calorieGoal - consumed;
  const percentConsumed = Math.round((consumed / calorieGoal) * 100);

  return {
    date: dayStart,
    calorieGoal,
    consumed,
    remaining,
    percentConsumed,
    macros: {
      protein: summary?.totalProtein || 0,
      carbs: summary?.totalCarbs || 0,
      fats: summary?.totalFats || 0,
    },
    mealsCount: summary?.mealsCount || 0,
  };
};

/**
 * Get weekly analytics for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Weekly analytics
 */
const getWeeklyAnalytics = async (userId) => {
  const startOfWeek = getStartOfWeek();
  const endOfWeek = getEndOfWeek();

  const [summaries, user] = await Promise.all([
    prisma.dailySummary.findMany({
      where: {
        userId,
        date: {
          gte: startOfWeek,
          lte: endOfWeek,
        },
      },
      orderBy: {
        date: "asc",
      },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { dailyCalorieGoal: true },
    }),
  ]);

  console.log(`[Analytics] Found ${summaries.length} summaries for user ${userId} between ${startOfWeek.toISOString()} and ${endOfWeek.toISOString()}`);

  const aggregation = await prisma.dailySummary.aggregate({
    where: {
      userId,
      date: {
        gte: startOfWeek,
        lte: endOfWeek,
      },
    },
    _sum: {
      totalCalories: true,
      totalProtein: true,
      totalCarbs: true,
      totalFats: true,
      mealsCount: true,
    },
  });

  const weeklyTotals = {
    totalCalories: aggregation._sum.totalCalories || 0,
    totalProtein: aggregation._sum.totalProtein || 0,
    totalCarbs: aggregation._sum.totalCarbs || 0,
    totalFats: aggregation._sum.totalFats || 0,
    mealsCount: aggregation._sum.mealsCount || 0,
  };

  const uniqueSummaries = new Map();
  summaries.forEach(summary => {
    const dateStr = summary.date.toISOString().split('T')[0];
    if (!uniqueSummaries.has(dateStr)) {
      uniqueSummaries.set(dateStr, summary);
    } else {
      const existing = uniqueSummaries.get(dateStr);
      uniqueSummaries.set(dateStr, {
        ...existing,
        totalCalories: Math.max(existing.totalCalories, summary.totalCalories),
        totalProtein: Math.max(existing.totalProtein, summary.totalProtein),
        totalCarbs: Math.max(existing.totalCarbs, summary.totalCarbs),
        totalFats: Math.max(existing.totalFats, summary.totalFats),
        mealsCount: Math.max(existing.mealsCount, summary.mealsCount),
      });
    }
  });

  const processedSummaries = Array.from(uniqueSummaries.values());

  const daysTracked = processedSummaries.length;
  const avgCalories =
    daysTracked > 0 ? Math.round(weeklyTotals.totalCalories / daysTracked) : 0;

  return {
    startDate: startOfWeek,
    endDate: endOfWeek,
    dailyCalorieGoal: user?.dailyCalorieGoal || 2000,
    averageCalories: avgCalories,
    totals: weeklyTotals,
    daysTracked,
    dailyBreakdown: processedSummaries,
  };
};

/**
 * Get monthly analytics for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Monthly analytics
 */
const getMonthlyAnalytics = async (userId) => {
  const startOfMonth = getStartOfMonth();
  const endOfMonth = getEndOfMonth();

  const [summaries, user] = await Promise.all([
    prisma.dailySummary.findMany({
      where: {
        userId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      orderBy: {
        date: "asc",
      },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { dailyCalorieGoal: true },
    }),
  ]);

  const aggregation = await prisma.dailySummary.aggregate({
    where: {
      userId,
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    _sum: {
      totalCalories: true,
      totalProtein: true,
      totalCarbs: true,
      totalFats: true,
      mealsCount: true,
    },
  });

  const monthlyTotals = {
    totalCalories: aggregation._sum.totalCalories || 0,
    totalProtein: aggregation._sum.totalProtein || 0,
    totalCarbs: aggregation._sum.totalCarbs || 0,
    totalFats: aggregation._sum.totalFats || 0,
    mealsCount: aggregation._sum.mealsCount || 0,
  };

  const daysTracked = summaries.length;
  const avgCalories =
    daysTracked > 0 ? Math.round(monthlyTotals.totalCalories / daysTracked) : 0;

  const weeklyData = [];
  for (let i = 0; i < 4; i++) {
    const weekStart = new Date(startOfMonth);
    weekStart.setDate(weekStart.getDate() + i * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const weekSummaries = summaries.filter(
      (s) => s.date >= weekStart && s.date <= weekEnd,
    );
    const weekCalories = weekSummaries.reduce(
      (sum, s) => sum + s.totalCalories,
      0,
    );
    const weekDays = weekSummaries.length;

    weeklyData.push({
      week: i + 1,
      totalCalories: weekCalories,
      averageCalories: weekDays > 0 ? Math.round(weekCalories / weekDays) : 0,
      daysTracked: weekDays,
    });
  }

  return {
    startDate: startOfMonth,
    endDate: endOfMonth,
    dailyCalorieGoal: user?.dailyCalorieGoal || 2000,
    averageCalories: avgCalories,
    totals: monthlyTotals,
    daysTracked,
    weeklyTrends: weeklyData,
  };
};

/**
 * Get unique previous meals for a user
 * @param {string} userId - User ID
 * @param {number} [limit=50] - Number of meals to fetch
 * @returns {Promise<Array>} - List of unique previous meals
 */
const getPreviousMeals = async (userId, limit = 50) => {
  const meals = await prisma.meal.findMany({
    where: { userId },
    include: {
      foodItems: true,
    },
    orderBy: {
      mealDate: "desc",
    },
    take: limit,
  });

  const uniqueMeals = [];
  const mealFingerprints = new Set();

  for (const meal of meals) {
    let fingerprint;
    if (meal.description) {
      fingerprint = `desc:${meal.description.toLowerCase().trim()}`;
    } else {
      const foodNames = meal.foodItems
        .map((fi) => fi.foodName.toLowerCase().trim())
        .sort()
        .join("|");
      fingerprint = `foods:${foodNames}`;
    }

    if (!mealFingerprints.has(fingerprint)) {
      mealFingerprints.add(fingerprint);
      uniqueMeals.push(meal);
    }
  }

  return uniqueMeals;
};

module.exports = {
  createMeal,
  getMealById,
  getMeals,
  getPreviousMeals,
  getTodaysMeals,
  updateMeal,
  deleteMeal,
  updateDailySummary,
  getDailyAnalytics,
  getWeeklyAnalytics,
  getMonthlyAnalytics,
};
