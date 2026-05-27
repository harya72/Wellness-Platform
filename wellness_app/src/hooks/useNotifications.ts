import { useEffect } from "react";
import notificationService from "../services/notificationService";
import { useAuth } from "../context/AuthProvider";


export const useNotifications = () => {
  const { token, profile } = useAuth();

  useEffect(() => {
    if (!token || !profile) return;

    notificationService.initializeNotifications(token, false);

    return () => {
      notificationService.cleanupNotifications();
    };
  }, [token, profile?.id]);
};
