import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "@screens/no-auth/Login";
import { NavigationContainer } from "@react-navigation/native";
import Register from "@screens/no-auth/Register";
import Onboarding from "@screens/no-auth/Onboarding";
import { useAuth } from "@context/AuthProvider";
import { getFontName, navigationRef } from "@utils/utils";
import NetworkLogsTracker from "@components/NetworkLogsTracker";
import { BUILD_FOR_PRODUCTION } from "src/constants/constants";
import BottomTabsNavigator, {
  BottomStackParamList,
} from "./BottomTabsNavigator";
import SplashScreen from "@components/SplashScreen";
import Notification from "@screens/in-app/general/Notification";
import AddMeal from "@screens/in-app/general/AddMeal";
import MealHistory from "@screens/in-app/general/MealHistory";
import MealDetail from "@screens/in-app/general/MealDetail";
import { useUI } from "@context/UiProvider";
import { useNotifications } from "@hooks/useNotifications";

export type RootStackParamList = {
  LOGIN: undefined;
  REGISTER: undefined;
  ONBOARDING: undefined;
  PROFILE: undefined;
  SETTING: undefined;
  MAIN_TABS: BottomStackParamList;
  NOTIFICATION: undefined;
  ADD_MEAL: { mealType?: string } | undefined;
  MEAL_HISTORY: undefined;
  MEAL_DETAIL: { mealId: string };
  EDIT_PROFILE: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { token, loading, isOnboarded } = useAuth();
  const { theme } = useUI();

  useNotifications();

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <>
      <NavigationContainer ref={navigationRef}>
        <RootStack.Navigator
          screenOptions={{
            animation: "slide_from_right",
            headerStyle: { backgroundColor: theme.background },
            headerTintColor: theme.text.primary,
            headerTitleStyle: {
              fontFamily: getFontName("SemiBold"),
              color: theme.text.primary,
            },
          }}
        >
          {token ? (
            isOnboarded ? (
              <RootStack.Group>
                <RootStack.Screen
                  name="MAIN_TABS"
                  component={BottomTabsNavigator}
                  options={{ headerShown: false }}
                />
                <RootStack.Screen
                  name="NOTIFICATION"
                  component={Notification}
                  options={{ headerTitle: "Notification" }}
                />
                <RootStack.Screen
                  name="ADD_MEAL"
                  component={AddMeal}
                  options={{ headerTitle: "Add Meal" }}
                />
                <RootStack.Screen
                  name="MEAL_HISTORY"
                  component={MealHistory}
                  options={{ headerTitle: "Meal History" }}
                />
                <RootStack.Screen
                  name="MEAL_DETAIL"
                  component={MealDetail}
                  options={{ headerTitle: "Meal Details" }}
                />
                <RootStack.Screen
                  name="EDIT_PROFILE"
                  getComponent={() =>
                    require("@screens/in-app/general/EditProfile").default
                  }
                  options={{ headerTitle: "Edit Profile" }}
                />
              </RootStack.Group>
            ) : (
              <RootStack.Group screenOptions={{ headerShown: false }}>
                <RootStack.Screen name="ONBOARDING" component={Onboarding} />
              </RootStack.Group>
            )
          ) : (
            <RootStack.Group screenOptions={{ headerShown: false }}>
              <RootStack.Screen name="LOGIN" component={Login} />
              <RootStack.Screen name="REGISTER" component={Register} />
            </RootStack.Group>
          )}
        </RootStack.Navigator>
      </NavigationContainer>
      {/* {!BUILD_FOR_PRODUCTION && <NetworkLogsTracker />} */}
    </>
  );
};

export default AppNavigator;
