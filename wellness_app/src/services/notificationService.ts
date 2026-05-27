import { getApp } from "@react-native-firebase/app";
import * as Notifications from "expo-notifications";
import {
  AuthorizationStatus,
  FirebaseMessagingTypes,
  getMessaging,
} from "@react-native-firebase/messaging";
import DeviceInfo from "react-native-device-info";
import { navigationRef, prettier } from "@utils/utils";
import { API_BASE_URL } from "src/constants/constants";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationPermissionResult {
  granted: boolean;
  status: FirebaseMessagingTypes.AuthorizationStatus;
}

export interface DeviceInfoResult {
  deviceId: string;
  fcmToken: string;
}

const app = getApp();
export const messaging = getMessaging(app);

let foregroundUnsubscribe: (() => void) | null = null;
let notificationResponseSubscription: any = null;

const notificationService = {

  requestNotificationPermission:
    async (): Promise<NotificationPermissionResult> => {
      try {
        const authStatus = await messaging.requestPermission();
        const granted =
          authStatus === AuthorizationStatus.AUTHORIZED ||
          authStatus === AuthorizationStatus.PROVISIONAL;

        return {
          granted,
          status: authStatus,
        };
      } catch (error) {
        console.error("Error requesting notification permission:", error);
        return {
          granted: false,
          status: AuthorizationStatus.NOT_DETERMINED,
        };
      }
    },


  getFCMToken: async (): Promise<string | null> => {
    try {
      const fcmToken = await messaging.getToken();
      console.log("FCM Token:", fcmToken);
      return fcmToken;
    } catch (error) {
      console.error("Error getting FCM token:", error);
      return null;
    }
  },


  getDeviceId: async (): Promise<string | null> => {
    try {
      const deviceId = await DeviceInfo.getUniqueId();
      console.log("Device ID:", deviceId);
      return deviceId;
    } catch (error) {
      console.error("Error getting device ID:", error);
      return null;
    }
  },


  updateTokenOnBackend: async (
    token: string,
    authToken: string,
    isLogin: boolean = false,
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/fcm-token`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ fcmToken: token, isLogin }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update FCM token");
      }
      console.log(
        `FCM token updated on backend successfully (isLogin: ${isLogin})`,
      );
    } catch (error) {
      console.error("Error updating FCM token on backend:", error);
    }
  },


  initializeDeviceInfo: async (): Promise<DeviceInfoResult | null> => {
    try {
      const [deviceId, fcmToken] = await Promise.all([
        notificationService.getDeviceId(),
        notificationService.getFCMToken(),
      ]);

      if (!deviceId || !fcmToken) {
        throw new Error("Failed to get device info or FCM token");
      }

      return { deviceId, fcmToken };
    } catch (error) {
      console.error("Error initializing device info:", error);
      return null;
    }
  },


  handleForegroundMessage: async (
    remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  ): Promise<void> => {
    const { title, body } = remoteMessage.notification || {};

    if (title && body) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: title,
          body: body,
          data: remoteMessage?.data || {},
        },
        trigger: null,
      });
    }
  },

  setupForegroundMessaging: (): (() => void) | null => {
    try {
      if (foregroundUnsubscribe) {
        foregroundUnsubscribe();
        foregroundUnsubscribe = null;
      }

      foregroundUnsubscribe = messaging.onMessage(
        async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
          prettier("FCM message received in foreground", remoteMessage);
          notificationService.handleForegroundMessage(remoteMessage);
        },
      );

      return foregroundUnsubscribe;
    } catch (error) {
      console.error("Error setting up foreground messaging:", error);
      return null;
    }
  },


  setupBackgroundMessaging: (): void => {
    messaging.setBackgroundMessageHandler(
      async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
        prettier("FCM message received in background", remoteMessage);
      },
    );
  },


  handleNotificationNavigation: (data: any): void => {
    try {
      if (!navigationRef?.isReady()) {
        console.log("Navigation not ready, skipping navigation");
        return;
      }

      navigationRef.navigate("NOTIFICATION" as any);
      Notifications.dismissAllNotificationsAsync();
    } catch (error) {
      console.error("Error handling notification navigation:", error);
    }
  },


  setupNotificationListeners: (): void => {
    try {
      if (notificationResponseSubscription) {
        notificationResponseSubscription.remove();
        notificationResponseSubscription = null;
      }

      notificationResponseSubscription =
        Notifications.addNotificationResponseReceivedListener((response) => {
          prettier("Notification tapped", response);

          const data =
            Object.keys(response.notification.request.content.data).length > 0
              ? response.notification.request.content.data
              : null;
          if (data) {
            notificationService.handleNotificationNavigation(data);
          }
        });
    } catch (error) {
      console.error("Error setting up notification listeners:", error);
    }
  },


  cleanupNotifications: (): void => {
    if (foregroundUnsubscribe) {
      foregroundUnsubscribe();
      foregroundUnsubscribe = null;
    }
    if (notificationResponseSubscription) {
      notificationResponseSubscription.remove();
      notificationResponseSubscription = null;
    }
  },


  initializeNotifications: async (
    authToken: string,
    isLogin: boolean = false,
  ): Promise<DeviceInfoResult | null> => {
    try {
      const permissionResult =
        await notificationService.requestNotificationPermission();

      if (!permissionResult.granted) {
        console.log("Notification permission not granted");
        return null;
      }

      const deviceInfo = await notificationService.initializeDeviceInfo();

      if (deviceInfo) {
        await notificationService.updateTokenOnBackend(
          deviceInfo.fcmToken,
          authToken,
          isLogin,
        );
      }

      notificationService.setupForegroundMessaging();
      notificationService.setupNotificationListeners();

      return deviceInfo;
    } catch (error) {
      console.error("Error initializing notification service:", error);
      return null;
    }
  },
};

export default notificationService;
