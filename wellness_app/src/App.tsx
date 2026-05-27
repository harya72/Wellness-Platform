import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "./context/AuthProvider";
import AppNavigator from "./navigator/AppNavigator";
import { UiProvider } from "./context/UiProvider";
import { CustomBottomSheetProvider } from "@context/CustomBottomSheetProvider";
import { NetworkProvider } from "@context/NetworkProvider";
import React from "react";
import { LogBox } from "react-native";
import {
  useFonts,
  NunitoSans_400Regular,
  NunitoSans_600SemiBold,
  NunitoSans_700Bold,
  NunitoSans_800ExtraBold,
  NunitoSans_900Black,
} from "@expo-google-fonts/nunito-sans";
import SplashScreen from "@components/SplashScreen";
import { SafeAreaProvider } from "react-native-safe-area-context";
LogBox.ignoreAllLogs(true);

export default function App() {
  let [fontsLoaded] = useFonts({
    NunitoSans_400Regular,
    NunitoSans_600SemiBold,
    NunitoSans_700Bold,
    NunitoSans_800ExtraBold,
    NunitoSans_900Black,
  });

  if (!fontsLoaded) {
    return <SplashScreen />;
  }
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <UiProvider>
          <AuthProvider>
            <CustomBottomSheetProvider>
              <NetworkProvider>
                <AppNavigator />
              </NetworkProvider>
            </CustomBottomSheetProvider>
          </AuthProvider>
        </UiProvider>
        <StatusBar style="dark" translucent backgroundColor="transparent" />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
