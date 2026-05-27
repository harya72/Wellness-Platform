

export const THEME = {
  light: {
    primary: "#FC8019",
    primaryDark: "#E27312",
    primaryLight: "#FFF3E8",

    background: "#FFFFFF",
    surface: "#F8F8F8",
    surfaceElevated: "#FFFFFF",

    text: {
      primary: "#3D4152",
      secondary: "#7E808C",
      tertiary: "#93959F",
      inverse: "#FFFFFF",
    },

    cardBackground: "#FFFFFF",
    cardBorder: "#F0F0F5",

    inputBackground: "#FFFFFF",
    inputBorder: "#D4D5D9",
    inputBorderFocus: "#FC8019",
    inputPlaceholderColor: "#9A9BA3",
    inputTextColor: "#3D4152",

    border: "#E9E9EB",
    dividerColor: "#F0F0F5",

    success: "#60B246",
    successLight: "#E8F5E2",
    error: "#E23744",
    errorLight: "#FDEBED",
    warning: "#FFB800",
    warningLight: "#FFF8E6",
    info: "#2196F3",
    infoLight: "#E3F2FD",

    protein: "#FF6B6B",
    carbs: "#4ECDC4",
    fats: "#FFE66D",
    fiber: "#A78BFA",

    shadow: "rgba(0, 0, 0, 0.08)",
    shadowStrong: "rgba(0, 0, 0, 0.12)",
    overlay: "rgba(0, 0, 0, 0.5)",

    buttonBackground: "#FC8019",
    buttonText: "#FFFFFF",
    buttonSecondary: "#F0F0F5",
    buttonSecondaryText: "#3D4152",
    buttonDisabled: "#D4D5D9",
    buttonDisabledText: "#9A9BA3",

    tabBarBackground: "#FFFFFF",
    tabBarBorder: "#F0F0F5",
    inactiveIcon: "#9A9BA3",
    activeIcon: "#FC8019",

    headerBackground: "#FFFFFF",
    headerTextColor: "#3D4152",

    toastBackground: "#3D4152",
    toastText: "#FFFFFF",

    skeletonBase: "#E8E8E8",
    skeletonHighlight: "#F5F5F5",

    green: "#60B246",
    red: "#E23744",
    orange: "#FC8019",
    inputTextFieldBorderColor: "#D4D5D9",
    disabled: "#D4D5D9",
    labelText: "#7E808C",
    modalBgColor: "#FFFFFF",
    bellBackground: "#F8F8F8",
    moreOptions: "#3D4152",
    loadingIndicator: "#FC8019",
    buttonBorder: "#E9E9EB",
    button: "#FC8019",
  },

  dark: {
    primary: "#FC8019",
    primaryDark: "#E27312",
    primaryLight: "#2A2A2A",
    background: "#121212",
    surface: "#1E1E1E",
    surfaceElevated: "#2A2A2A",
    text: {
      primary: "#FFFFFF",
      secondary: "#B3B3B3",
      tertiary: "#808080",
      inverse: "#121212",
    },
    cardBackground: "#1E1E1E",
    cardBorder: "#2A2A2A",
    inputBackground: "#2A2A2A",
    inputBorder: "#404040",
    inputBorderFocus: "#FC8019",
    inputPlaceholderColor: "#808080",
    inputTextColor: "#FFFFFF",
    border: "#2A2A2A",
    dividerColor: "#2A2A2A",
    success: "#60B246",
    successLight: "#1A2E1A",
    error: "#E23744",
    errorLight: "#2E1A1A",
    warning: "#FFB800",
    warningLight: "#2E2A1A",
    info: "#2196F3",
    infoLight: "#1A2A3E",
    protein: "#FF6B6B",
    carbs: "#4ECDC4",
    fats: "#FFE66D",
    fiber: "#A78BFA",
    shadow: "rgba(0, 0, 0, 0.3)",
    shadowStrong: "rgba(0, 0, 0, 0.5)",
    overlay: "rgba(0, 0, 0, 0.7)",
    buttonBackground: "#FC8019",
    buttonText: "#FFFFFF",
    buttonSecondary: "#2A2A2A",
    buttonSecondaryText: "#FFFFFF",
    buttonDisabled: "#404040",
    buttonDisabledText: "#808080",
    tabBarBackground: "#121212",
    tabBarBorder: "#2A2A2A",
    inactiveIcon: "#808080",
    activeIcon: "#FC8019",
    headerBackground: "#121212",
    headerTextColor: "#FFFFFF",
    toastBackground: "#2A2A2A",
    toastText: "#FFFFFF",
    skeletonBase: "#2A2A2A",
    skeletonHighlight: "#404040",
    green: "#60B246",
    red: "#E23744",
    orange: "#FC8019",
    inputTextFieldBorderColor: "#404040",
    disabled: "#404040",
    labelText: "#B3B3B3",
    modalBgColor: "#1E1E1E",
    bellBackground: "#2A2A2A",
    moreOptions: "#FFFFFF",
    loadingIndicator: "#FC8019",
    buttonBorder: "#404040",
    button: "#FC8019",
  },
};

export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 500,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

import { Platform } from "react-native";

export const SHADOWS = {
  small: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
    },
    android: {
      elevation: 1,
    },
  }),
  medium: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    android: {
      elevation: 2,
    },
  }),
  large: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
    },
    android: {
      elevation: 4,
    },
  }),
};
