

import React from "react";
import { Platform, StyleSheet, Pressable } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Dashboard from "@screens/in-app/bottom-tabs/Dashboard";
import Profile from "@screens/in-app/bottom-tabs/Profile";
import Analytics from "@screens/in-app/bottom-tabs/Analytics";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useUI } from "@context/UiProvider";
import { getFontName } from "@utils/utils";
import { SafeAreaView } from "react-native-safe-area-context";

export type BottomStackParamList = {
  DASHBOARD: undefined;
  ANALYTICS: undefined;
  PROFILE: undefined;
};

const BottomTabs = createBottomTabNavigator<BottomStackParamList>();

const getBottomTabsIcon = (
  routeName: keyof BottomStackParamList,
  focused: boolean,
  color: string,
) => {
  const size = focused ? 26 : 24;

  switch (routeName) {
    case "DASHBOARD":
      return (
        <MaterialCommunityIcons
          name={focused ? "home" : "home-outline"}
          size={size}
          color={color}
        />
      );
    case "ANALYTICS":
      return (
        <MaterialCommunityIcons
          name={focused ? "chart-line-variant" : "chart-line"}
          size={size}
          color={color}
        />
      );
    case "PROFILE":
      return (
        <MaterialCommunityIcons
          name={focused ? "account" : "account-outline"}
          size={size}
          color={color}
        />
      );
    default:
      return (
        <MaterialCommunityIcons name="home-outline" size={size} color={color} />
      );
  }
};

const BottomTabsNavigator = () => {
  const { theme } = useUI();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={["top"]}
    >
      <BottomTabs.Navigator
        initialRouteName="DASHBOARD"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color }) =>
            getBottomTabsIcon(route.name, focused, color),
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.inactiveIcon,
          animation: "none",
          headerStyle: { backgroundColor: theme.headerBackground },
          headerTitleStyle: {
            color: theme.headerTextColor,
            fontFamily: getFontName("Bold"),
            fontSize: 18,
          },
          tabBarStyle: {
            backgroundColor: theme.tabBarBackground,
            borderTopColor: theme.border,
            borderTopWidth: 0.5,
            paddingTop: 6,
            paddingBottom: Platform.OS === "ios" ? 24 : 10,
            height: Platform.OS === "ios" ? 84 : 60,
            elevation: 0,
          },
          tabBarLabelStyle: {
            fontFamily: getFontName("Medium"),
            fontSize: 10,
            marginTop: 2,
          },
          tabBarItemStyle: {
            paddingVertical: 2,
          },
          tabBarHideOnKeyboard: true,
          tabBarButton: ({ style, children, onPress }) => (
            <Pressable
              style={style}
              onPress={onPress}
              android_ripple={{ color: "transparent", borderless: true }}
            >
              {children}
            </Pressable>
          ),
          headerShown: false,
        })}
      >
        <BottomTabs.Screen
          name="DASHBOARD"
          component={Dashboard}
          options={{ tabBarLabel: "Home" }}
        />
        <BottomTabs.Screen
          name="ANALYTICS"
          component={Analytics}
          options={{ tabBarLabel: "Analytics" }}
        />
        <BottomTabs.Screen
          name="PROFILE"
          component={Profile}
          options={{ tabBarLabel: "Profile" }}
        />
      </BottomTabs.Navigator>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default BottomTabsNavigator;
