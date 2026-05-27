import React, { ReactNode, useEffect, useState } from "react";
import {
  Linking,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DeviceInfo from "react-native-device-info";
import { getAppVersion, isUpdateRequired, checkForUpdate } from "./versionUtil";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useUI } from "@context/UiProvider";

const playStoreUrl = `market://details?id=${DeviceInfo.getBundleId()}`;
const playStoreWebUrl = `https://play.google.com/store/apps/details?id=${DeviceInfo.getBundleId()}`;
const appStoreUrl = `itms-apps://apps.apple.com/app/id6737405628`;

const UpdateChecker = ({ children }: { children: ReactNode }) => {
  const [checked, setChecked] = useState(false);
  const [updateRequired, setUpdateRequired] = useState(false);
  const { theme } = useUI();
  const [showAlert, setShowAlert] = useState(false);
  const [latestAppVersion, setLatestAppVersion] = useState<{
    latest: string;
  } | null>(null);

  useEffect(() => {
    const checkUpdate = async () => {
      try {
        const currentVersion = getAppVersion();
        console.log("Current Version:", currentVersion);

        const updateInfo = await checkForUpdate(currentVersion);
        console.log("Update Info:", updateInfo);
        setLatestAppVersion({ latest: updateInfo?.latestVersion });

        if (updateInfo?.updateType === "MANDATORY") {
          setUpdateRequired(true);
        } else if (updateInfo?.updateType === "OPTIONAL") {
          setShowAlert(true);
        }
      } catch (error) {
        console.error("Error checking for updates:", error);
      } finally {
        setChecked(true);
      }
    };

    checkUpdate();
  }, []);

  const showUpdateAlert = (isMandatory: boolean) => {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        onRequestClose={() => (!isMandatory ? setShowAlert(false) : null)}
        visible={true}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.68)",
          }}
        >
          <View
            style={{
              width: 340,
              backgroundColor: "#ffffff",
              borderRadius: 20,
              marginHorizontal: 40,
              marginBottom: 40,
              paddingTop: 60,
              ...Platform.select({
                ios: {
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 0,
                  },
                  shadowOpacity: 0.12,
                  shadowRadius: 4,
                },
                android: {
                  elevation: 10,
                },
              }),
            }}
          >
            {!isMandatory && (
              <TouchableOpacity
                onPress={() => setShowAlert(false)}
                style={{
                  position: "absolute",
                  alignSelf: "flex-end",
                  right: 14,
                  top: 8,
                  zIndex: 300,
                }}
              >
                <MaterialCommunityIcons
                  name="close"
                  color={theme.headerBackground}
                  size={28}
                />
              </TouchableOpacity>
            )}
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: "center",
                alignItems: "center",
                height: 80,
                marginTop: -40,
              }}
            >
              <View
                style={{
                  height: 80,
                  width: 80,
                  borderRadius: 80,
                  backgroundColor: "#EAF8F4",
                  justifyContent: "center",
                  alignItems: "center",
                  overflow: "hidden",
                }}
              >
                <MaterialIcons
                  name="system-update"
                  size={24}
                  color={theme.red}
                />
              </View>
            </View>
            <View style={{ padding: 16, paddingTop: 0 }}>
              <Text
                style={{
                  fontFamily: "NunitoSans_600SemiBold",
                  fontSize: 16,
                  color: theme.text.primary,
                }}
              >
                A new version of the app {latestAppVersion?.latest} is
                available. Please update to experience the new features
              </Text>
            </View>
            <TouchableOpacity onPress={handleUpdatePress}>
              <View
                style={{
                  backgroundColor: theme.text.primary,
                  top: 2,
                  paddingHorizontal: 16,
                  paddingVertical: 20,
                  borderBottomLeftRadius: 20,
                  borderBottomRightRadius: 20,
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontFamily: "NunitoSans_800ExtraBold",
                    fontSize: 16,
                    textAlign: "center",
                    textTransform: "uppercase",
                  }}
                >
                  {"Update App"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const handleUpdatePress = async () => {
    if (Platform.OS === "android") {
      const canOpen = await Linking.canOpenURL(playStoreUrl);
      if (canOpen) {
        await Linking.openURL(playStoreUrl);
      } else {
        await Linking.openURL(playStoreWebUrl);
      }
    } else {
      await Linking.openURL(appStoreUrl);
    }
  };

  if (!checked) {
    return null;
  }

  return (
    <>
      {checked ? children : null}
      {showAlert && showUpdateAlert(false)}
      {updateRequired && showUpdateAlert(true)}
    </>
  );
};

export default UpdateChecker;
