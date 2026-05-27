import { Platform } from "react-native";
import { getVersion } from "react-native-device-info";
import { API_BASE_URL, SYSTEM_TOKEN } from "src/constants/constants";

export const isUpdateRequired = (
  currentVersion: string,
  requiredVersion: string,
) => {
  const currentParts = currentVersion.split(".").map(Number);
  const requiredParts = requiredVersion.split(".").map(Number);

  for (let i = 0; i < requiredParts.length; i++) {
    const current = currentParts[i] || 0;
    const required = requiredParts[i] || 0;

    if (current < required) return true; // Update required
    if (current > required) return false; // No update required
  }
  return false;
};

export const checkForUpdate = async (currentAppVersion: string) => {
  try {
    const PLATFORM_ID = Platform.OS === "android" ? "1" : "2";
    const queryParams = new URLSearchParams({
      platformId: PLATFORM_ID,
      currentAppVersion,
    }).toString();

    const response = await fetch(
      `${API_BASE_URL}/app-update/check?${queryParams}`,
      {
        method: "GET",
        headers: {
          "X-JWT-Assertion": SYSTEM_TOKEN,
        },
      },
    );

    const data = await response.json();
    console.log("Update Check Response:", data);

    return data;
  } catch (error) {
    console.error("Error checking for updates:", error);

    return {
      forceUpdate: false,
      latestVersion: currentAppVersion,
      updateType: "NONE",
    };
  }
};

export const getAppVersion = () => getVersion(); // Returns installed app version
