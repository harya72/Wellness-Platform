
import {
  ActivityIndicator,
  StyleProp,
  TextStyle,
  ViewStyle,
  Pressable,
  StyleSheet,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { RFValue } from "react-native-responsive-fontsize";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { FC } from "react";
import { useUI } from "@context/UiProvider";
import { getFontName } from "@utils/utils";
import { RADIUS, SHADOWS } from "@utils/colors";
import CustomText from "./CustomText";

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  color?: string;
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  style?: StyleProp<ViewStyle>;
  iconColor?: string;
  loading?: boolean;
  iconSize?: number;
  textSize?: number;
  textColor?: string;
  textStyle?: StyleProp<TextStyle>;
  variant?: "primary" | "secondary" | "outline";
  disabled?: boolean;
  fullWidth?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const CustomButton: FC<CustomButtonProps> = ({
  title,
  onPress,
  color,
  style,
  icon,
  textColor,
  textSize,
  iconColor,
  loading,
  iconSize,
  textStyle,
  variant = "primary",
  disabled = false,
  fullWidth = true,
}) => {
  const { theme } = useUI();
  const scale = useSharedValue(1);

  const isDisabled = loading || disabled;

  const getBackgroundColor = () => {
    if (isDisabled) return theme.buttonDisabled;
    if (color) return color;
    switch (variant) {
      case "primary":
        return theme.primary;
      case "secondary":
        return theme.buttonSecondary;
      case "outline":
        return "transparent";
      default:
        return theme.primary;
    }
  };

  const getTextColor = () => {
    if (isDisabled) return theme.buttonDisabledText;
    if (textColor) return textColor;
    switch (variant) {
      case "primary":
        return theme.buttonText;
      case "secondary":
        return theme.buttonSecondaryText;
      case "outline":
        return theme.primary;
      default:
        return theme.buttonText;
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!isDisabled) {
      scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          width: fullWidth ? "100%" : "auto",
          borderWidth: variant === "outline" ? 1.5 : 0,
          borderColor: variant === "outline" ? theme.primary : "transparent",
        },
        !isDisabled && variant === "primary" && SHADOWS.small,
        animatedStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size={22} color={getTextColor()} />
      ) : (
        <>
          {icon && (
            <MaterialCommunityIcons
              name={icon}
              color={iconColor || getTextColor()}
              size={iconSize || 20}
              style={styles.icon}
            />
          )}
          <CustomText
            font="SemiBold"
            style={[
              styles.text,
              {
                fontSize: RFValue(textSize || 14),
                color: getTextColor(),
              },
              textStyle,
            ]}
          >
            {title}
          </CustomText>
        </>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    minHeight: 52,
  },
  text: {
    textAlign: "center",
  },
  icon: {
    marginRight: 4,
  },
});

export default CustomButton;
