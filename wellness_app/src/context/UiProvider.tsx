import { ColorSchemeName } from "react-native";
import React, { createContext, useContext, useState } from "react";
import { THEME } from "../utils/colors";
import FullscreenLoader from "@components/FullscreenLoader";
import ToastMessage from "@components/ToastMessage";

interface UIContextType {
  theme: (typeof THEME)[ThemeMode];
  setAppTheme: React.Dispatch<React.SetStateAction<ColorSchemeName>>;
  appTheme: ColorSchemeName;
  fullscreenLoading: boolean;
  setFullscreenLoading: React.Dispatch<React.SetStateAction<boolean>>;
  showToast: React.Dispatch<React.SetStateAction<ToastMessageProps>>;
  toggleTheme: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UiProvider = ({ children }: { children: React.ReactNode }) => {
  const [appTheme, setAppTheme] = useState<ColorSchemeName>("light");
  const [fullscreenLoading, setFullscreenLoading] = useState<boolean>(false);
  const theme = THEME[appTheme || "light"];
  const [toast, showToast] = useState<ToastMessageProps>({
    visible: false,
    theme,
    success: true,
    title: "",
    message: "",
    duration: 0,
    onClose: () => {},
    canClose: false,
  });

  const toggleTheme = () => {
    setAppTheme(appTheme === "light" ? "dark" : "light");
  };

  return (
    <UIContext.Provider
      value={{
        theme,
        setAppTheme,
        appTheme,
        fullscreenLoading,
        setFullscreenLoading,
        showToast,
        toggleTheme,
      }}
    >
      {children}
      <FullscreenLoader show={fullscreenLoading} theme={theme} />
      <ToastMessage
        theme={theme}
        visible={toast.visible}
        success={toast.success}
        title={toast.title}
        message={toast.message}
        duration={toast.duration}
        canClose={toast.canClose}
        onClose={() => {
          showToast({
            ...toast,
            visible: false,
          });
          toast.onClose && toast.onClose();
        }}
      />
    </UIContext.Provider>
  );
};

export const useUI = (): UIContextType => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error("useUI must be used within a UIContext");
  }
  return context;
};
