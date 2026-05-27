

import { API_BASE_URL } from "src/constants/constants";
import { UserData } from "./authApi";

export interface OnboardingPayload {
  name?: string;
  age: number;
  weight: number;
  height: number;
  gender: "male" | "female";
  activityLevel: number;
  goal: string
}

export interface UpdateProfilePayload {
  name?: string;
  age?: number;
  weight?: number;
  height?: number;
  gender?: "male" | "female";
  activityLevel?: number;
}

export interface ProfileResponse {
  success: boolean;
  data: UserData & {
    activityLevelDescription?: string;
  };
}

export interface OnboardingResponse {
  success: boolean;
  data: {
    user: UserData;
    healthMetrics: {
      bmi: number;
      bmiCategory: string;
      bmr: number;
      dailyCalorieGoal: number;
    };
  };
}

export interface UserStatsResponse {
  success: boolean;
  data: {
    totalMeals: number;
    daysTracked: number;
    memberSinceDays: number;
    dailyCalorieGoal: number;
    currentBMI: number;
  };
}

const userApi = {

  getProfile: async (token: string): Promise<ProfileResponse> => {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to get profile");
    }
    return data;
  },


  updateProfile: async (
    token: string,
    payload: UpdateProfilePayload,
  ): Promise<ProfileResponse> => {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to update profile");
    }
    return data;
  },


  completeOnboarding: async (
    token: string,
    payload: OnboardingPayload,
  ): Promise<OnboardingResponse> => {
    const response = await fetch(`${API_BASE_URL}/users/onboarding`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to complete onboarding");
    }
    return data;
  },


  getStats: async (token: string): Promise<UserStatsResponse> => {
    const response = await fetch(`${API_BASE_URL}/users/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to get stats");
    }
    return data;
  },
};

export default userApi;
