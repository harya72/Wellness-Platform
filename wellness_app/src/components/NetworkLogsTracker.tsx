import { View, TouchableOpacity, StyleSheet, BackHandler, useWindowDimensions } from "react-native";
import React, { FC, useEffect } from "react";
import { useNetwork } from "@context/NetworkProvider";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import NetworkLogger from "react-native-network-logger";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";

const NetworkLogs: FC = () => {
  const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = useWindowDimensions();
  const { showNetworkLogs, setShowNetworkLogs } = useNetwork();
  const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
    if (showNetworkLogs) {
      setShowNetworkLogs(false);
      return true;
    }
    return false;
  });
  useEffect(() => {
    return () => {
      backHandler.remove();
    };
  }, [backHandler]);
  return (
    showNetworkLogs && (
      <Animated.View
        style={[styles.modalContainer, { width: SCREEN_WIDTH, height: SCREEN_HEIGHT }]}
        entering={FadeInDown}
        exiting={FadeOutUp}
      >
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setShowNetworkLogs(false)}
        >
          <MaterialCommunityIcons name="close" size={40} color={"#fff"} />
        </TouchableOpacity>
        <View style={[styles.networkLoggerContainer, { width: SCREEN_WIDTH, height: SCREEN_HEIGHT }]}>
          <NetworkLogger />
        </View>
      </Animated.View>
    )
  );
};

const NetworkLogsTracker = () => {
  const { showNetworkLogs, setShowNetworkLogs } = useNetwork();
  return (
    <>
      <TouchableOpacity
        onPress={() => setShowNetworkLogs(!showNetworkLogs)}
        style={{
          position: "absolute",
          bottom: 80,
          right: 40,
          zIndex: 100000,
          backgroundColor: "#006FAE",
          borderRadius: 25,
          width: 50,
          height: 50,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View>
          <MaterialCommunityIcons
            name="access-point-network"
            size={20}
            color={"#fff"}
          />
        </View>
      </TouchableOpacity>
      <NetworkLogs />
    </>
  );
};

export default NetworkLogsTracker;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    position: "absolute",
    justifyContent: "center",
    alignItems: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 99999,
  },
  closeButton: {
    padding: 16,
    marginTop: 16,
  },
  networkLoggerContainer: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
    paddingBottom: 70,
    borderRadius: 8,
    overflow: "hidden",
  },
});
