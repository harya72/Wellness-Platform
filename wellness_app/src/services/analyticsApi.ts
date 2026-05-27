

import { API_BASE_URL } from "src/constants/constants";

export interface DailyAnalytics {
  date: string;
  consumed: number;
  calorieGoal: number;
  remaining: number;
  percentConsumed: number;
  mealsCount: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  status: "under" | "over" | "on_track";
  message: string;
}

export interface WeeklyAnalytics {
  startDate: string;
  endDate: string;
  dailyBreakdown: Array<{
    date: string;
    totalCalories: number;
    mealsCount: number;
  }>;
  totals: {
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFats: number;
    mealsCount: number;
  };
  averageCalories: number;
  daysTracked: number;
  weeklyGoal: number;
  weeklyProgress: number;
  macroBreakdown: {
    proteinPercentage: number;
    carbsPercentage: number;
    fatsPercentage: number;
  };
}

export interface MonthlyAnalytics {
  startDate: string;
  endDate: string;
  weeklyTrends: Array<{
    week: number;
    averageCalories: number;
    mealsCount: number;
  }>;
  totals: {
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFats: number;
    mealsCount: number;
  };
  averageCalories: number;
  daysTracked: number;
  consistencyScore: number;
  daysInMonth: number;
  averageMacros: {
    protein: number;
    carbs: number;
    fats: number;
  };
}

export interface OverviewData {
  today: {
    consumed: number;
    goal: number;
    remaining: number;
    percentConsumed: number;
    mealsCount: number;
  };
  thisWeek: {
    averageCalories: number;
    totalMeals: number;
    daysTracked: number;
  };
  thisMonth: {
    averageCalories: number;
    totalMeals: number;
    daysTracked: number;
    consistencyScore: number;
  };
  trends: Array<{
    week: number;
    averageCalories: number;
    mealsCount: number;
  }>;
}

const analyticsApi = {
  getOverview: async (
    token: string,
  ): Promise<{ success: boolean; data: OverviewData }> => {
    const response = await fetch(`${API_BASE_URL}/analytics/overview`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to get overview");
    }
    return data;
  },


  getDaily: async (
    token: string,
    date?: string,
  ): Promise<{ success: boolean; data: DailyAnalytics }> => {
    const queryParams = date ? `?date=${date}` : "";
    const response = await fetch(
      `${API_BASE_URL}/analytics/daily${queryParams}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to get daily analytics");
    }
    return data;
  },

  getWeekly: async (
    token: string,
  ): Promise<{ success: boolean; data: WeeklyAnalytics }> => {
    const response = await fetch(`${API_BASE_URL}/analytics/weekly`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to get weekly analytics");
    }
    return data;
  },


  getMonthly: async (
    token: string,
  ): Promise<{ success: boolean; data: MonthlyAnalytics }> => {
    const response = await fetch(`${API_BASE_URL}/analytics/monthly`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to get monthly analytics");
    }
    return data;
  },
};

export default analyticsApi;
