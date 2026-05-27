import { RootStackParamList } from "@navigator/AppNavigator";
import {
  createNavigationContainerRef,
  NavigationContainerRef,
} from "@react-navigation/native";

export const getFontName = (font: keyof font) => {
  switch (font) {
    case "Regular":
      return "NunitoSans_400Regular";

    case "Medium":
      return "NunitoSans_500Medium";

    case "SemiBold":
      return "NunitoSans_600SemiBold";

    case "Bold":
      return "NunitoSans_700Bold";

    default:
      return "NunitoSans_400Regular";
  }
};

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export const getNavigation = (): NavigationContainerRef<RootStackParamList> => {
  if (!navigationRef.isReady()) {
    console.log("Navigation is getting prepared");
  }
  return navigationRef;
};

export const prettier = (prefix: string, data: any) => {
  const prettyData = JSON.stringify(data, null, 2);

  if (prefix) {
    console.log(`${prefix}:`, prettyData);
  } else {
    console.log(prettyData);
  }
};
