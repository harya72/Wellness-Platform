import { View } from "react-native";
import React, { FC } from "react";
import CustomButton from "@components/CustomButton";
import { useAuth } from "@context/AuthProvider";
import { useUI } from "@context/UiProvider";
import CustomText from "@components/CustomText";

const Setting: FC = () => {
  const { theme } = useUI();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.background,
        padding: 16,
      }}
    >
      <CustomText>Settings</CustomText>
    </View>
  );
};

export default Setting;
