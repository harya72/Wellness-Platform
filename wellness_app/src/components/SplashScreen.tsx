import { Image } from "react-native";
import React from "react";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

const SplashScreen = () => {
  return (
    <Animated.View
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      exiting={FadeOut}
      entering={FadeIn}
      key={"splash-screen"}
    >
      <Image
        source={require("@assets/splash-icon.png")}
        style={{ width: 200, height: 200, borderRadius: 100 }}
      />
    </Animated.View>
  );
};

export default SplashScreen;
