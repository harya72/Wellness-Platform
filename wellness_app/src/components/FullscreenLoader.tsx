import { View, Modal, ActivityIndicator, StyleSheet } from "react-native";
import React from "react";
import { THEME } from "@utils/colors";
import Animated, { FadeIn, FadeOutDown } from "react-native-reanimated";

const FullscreenLoader = ({
  show,
  theme,
}: {
  show: boolean;
  theme: (typeof THEME)[ThemeMode];
}) => {
  return (
    show && (
      <Animated.View
        entering={FadeIn}
        exiting={FadeOutDown}
        style={StyleSheet.absoluteFill}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.68)",
          }}
        >
          <ActivityIndicator size={"large"} color={theme.primary} />
        </View>
      </Animated.View>
    )
  );
};

export default FullscreenLoader;
