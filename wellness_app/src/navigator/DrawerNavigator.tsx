import { TouchableOpacity, View } from "react-native";
import React, { useCallback } from "react";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from "@react-navigation/drawer";
import BottomTabsNavigator from "./BottomTabsNavigator";

import { useUI } from "@context/UiProvider";
import { Bell, Moon, Sun } from "lucide-react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { useAuth } from "@context/AuthProvider";
import { getFontName } from "@utils/utils";
import { useCustomBottomSheet } from "@context/CustomBottomSheetProvider";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import CustomButton from "@components/CustomButton";
import CustomText from "@components/CustomText";

const LogoutModal = ({ onPress, onCancel }: any) => {
  const { theme } = useUI();
  return (
    <BottomSheetView style={{ padding: 20 }}>
      <CustomText
        font="Bold"
        style={{
          fontSize: 18,
          textAlign: "center",
          marginBottom: 10,
          color: theme.text.primary,
        }}
      >
        Logout
      </CustomText>

      <CustomText
        style={{
          textAlign: "center",
          marginBottom: 30,
          color: theme.text.primary,
        }}
      >
        Are you sure you want to log out?
      </CustomText>

      <View style={{ flexDirection: "row", gap: 15 }}>
        <CustomButton
          title="Cancel"
          onPress={onCancel}
          style={{
            flex: 1,
            backgroundColor: theme.background,
            borderColor: theme.buttonBorder,
            borderWidth: 1,
          }}
          textColor={theme.text.primary}
        />

        <CustomButton
          title="Logout"
          onPress={onPress}
          style={{
            flex: 1,
            backgroundColor: "red",
          }}
          textColor="white"
        />
      </View>
    </BottomSheetView>
  );
};

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props: any) => {
  const { theme } = useUI();
  const { clearToken } = useAuth();
  const { showBottomSheet, hideBottomSheet } = useCustomBottomSheet();

  const handleLogoutModal = useCallback(() => {
    showBottomSheet({
      view: (
        <LogoutModal
          onPress={() => {
            hideBottomSheet();
            clearToken();
          }}
          onCancel={hideBottomSheet}
        />
      ),
    });
  }, []);

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{
        flexGrow: 1,
        paddingVertical: 0,
      }}
    >
      <DrawerItem
        label={"Dashboard"}
        labelStyle={{ fontFamily: getFontName("SemiBold") }}
        focused
        onPress={() => null}
        icon={() => (
          <MaterialCommunityIcons
            name="view-dashboard-outline"
            size={24}
            color={theme.primary}
          />
        )}
      />
      <DrawerItem
        label={"Logout"}
        onPress={handleLogoutModal}
        labelStyle={{ fontFamily: getFontName("SemiBold") }}
        icon={() => (
          <MaterialCommunityIcons
            name="logout"
            size={24}
            color={theme.text.primary}
          />
        )}
      />
    </DrawerContentScrollView>
  );
};

const DrawerNavigator = () => {
  const { theme, toggleTheme, appTheme } = useUI();
  const navigation = useNavigation<any>();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerStyle: {
          backgroundColor: theme.background,
          width: 250,
        },
        drawerActiveTintColor: theme.green,
        drawerInactiveTintColor: theme.red,
        drawerLabelStyle: { color: theme.text.primary },
        drawerIcon: ({ focused, size }) => {
          const iconColor = theme.text.primary;
          return (
            <MaterialCommunityIcons
              name="account"
              size={size}
              color={iconColor}
            />
          );
        },
        headerTitle: "",
        headerTintColor: theme.text.primary,
        headerRight: () => (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <TouchableOpacity
              onPress={() => navigation.navigate("NOTIFICATION")}
              style={{ marginRight: 15 }}
            >
              <Bell size={24} color="#000" />
            </TouchableOpacity>
          </View>
        ),
        headerStyle: { backgroundColor: theme.background },
        headerTitleStyle: { color: theme.text.primary },
      }}
    >
      <Drawer.Group>
        <Drawer.Screen name="Home" component={BottomTabsNavigator} />
      </Drawer.Group>
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
