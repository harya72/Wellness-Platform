import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { UserData } from "src/services/authApi";

interface AuthContextType {
  token: string | null;
  storeToken: (token: string) => Promise<void>;
  clearToken: () => Promise<void>;
  loading: boolean;
  profile: UserData | null;
  setProfile: React.Dispatch<React.SetStateAction<UserData | null>>;
  isOnboarded: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<UserData | null>(null);

  const isOnboarded = profile?.isOnboarded ?? false;

  const storeToken = async (newToken: string) => {
    try {
      await SecureStore.setItemAsync("token", newToken);
      setToken(newToken);
      console.log("Token stored successfully");
    } catch (error) {
      console.error("Error storing token:", error);
    }
  };

  const clearToken = async () => {
    try {
      await SecureStore.deleteItemAsync("token");
      await SecureStore.deleteItemAsync("profile");
      setToken(null);
      setProfile(null);
      console.log("Token cleared successfully");
    } catch (error) {
      console.error("Error clearing token:", error);
    }
  };

  const retrieveToken = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync("token");
      setToken(storedToken);

      const storedProfile = await SecureStore.getItemAsync("profile");
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      }
    } catch (error) {
      console.error("Error fetching token:", error);
    }
  };

  useEffect(() => {
    if (profile) {
      SecureStore.setItemAsync("profile", JSON.stringify(profile)).catch(
        (error) => console.error("Error storing profile:", error),
      );
    }
  }, [profile]);

  useEffect(() => {
    const initialize = async () => {
      try {
        await retrieveToken();
      } catch (error) {
        console.error("Error during initialization:", error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        storeToken,
        clearToken,
        loading,
        profile,
        setProfile,
        isOnboarded,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
