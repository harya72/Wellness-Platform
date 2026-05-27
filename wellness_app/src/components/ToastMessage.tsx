import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React, { FC, useEffect } from "react";
import { CheckCircle, CircleAlert, Cross } from "lucide-react-native";
import { RFValue } from "react-native-responsive-fontsize";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOutDown,
  FadeOutUp,
} from "react-native-reanimated";

const ToastMessage: FC<ToastMessageProps> = ({
  visible = true,
  theme,
  success,
  title,
  message,
  duration = 1200,
  onClose,
  canClose = false,
}) => {
  useEffect(() => {
    if (visible && !canClose) {
      const timer = setTimeout(() => onClose(), duration);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  return (
    visible && (
      <Animated.View
        style={StyleSheet.absoluteFill}
        entering={FadeIn}
        exiting={FadeOutDown}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.68)",
          }}
        >
          <TouchableOpacity
            style={{}}
            onPress={canClose ? onClose : null}
            activeOpacity={canClose ? 0.7 : 1}
          >
            <View
              style={{
                width: 340,
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: theme?.background,
                paddingVertical: 12,
                paddingHorizontal: 12,
                borderRadius: 5,
                marginHorizontal: 40,
                marginBottom: 40,
                borderLeftWidth: 6,
                borderLeftColor: "#2980b9",
              }}
            >
              {canClose && (
                <Cross
                  size={12}
                  style={{ position: "absolute", right: 10, top: 10 }}
                  onPress={onClose}
                />
              )}
              <View
                style={{
                  height: 40,
                  width: 40,
                  borderRadius: 40,
                  backgroundColor: theme?.primary,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {success ? (
                  <CheckCircle size={16} />
                ) : (
                  <CircleAlert size={16} color={theme?.red} />
                )}
              </View>
              <View
                style={{
                  paddingLeft: 12,
                  width: 240,
                }}
              >
                <View>
                  <Text
                    style={{
                      color: theme?.text.primary,
                      fontFamily: "NunitoSans_400Regular",
                      fontSize: RFValue(14),
                      marginBottom: 4,
                    }}
                  >
                    {title}
                  </Text>
                </View>
                <View>
                  <Text
                    style={{
                      color: theme?.text.secondary,
                      fontFamily: "NunitoSans_300Light",
                      fontSize: RFValue(12),
                    }}
                  >
                    {message}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>
    )
  );
};

export default ToastMessage;
