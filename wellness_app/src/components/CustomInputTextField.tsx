
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import React, { FC, useState } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";
import { RFValue } from "react-native-responsive-fontsize";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useUI } from "@context/UiProvider";
import { getFontName } from "@utils/utils";
import { RADIUS, SHADOWS } from "@utils/colors";
import ErrorMessage from "./ErrorMessage";
import CustomText from "./CustomText";

interface InputTextFieldProps extends TextInputProps {
  placeholder?: string;
  value: React.ComponentState;
  onChangeText: (text: string) => void;
  inputContainerStyle?: ViewStyle;
  required?: boolean;
  label?: string;
  secureEntry?: boolean;
  disableColor?: string;
  labelColor?: string;
  inputColor?: string;
  borderColor?: string;
  borderWidth?: number | undefined;
  errorMessage?: string;
  leftIcon?: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
}

const AnimatedView = Animated.createAnimatedComponent(View);

const CustomInputTextField: FC<InputTextFieldProps> = ({
  labelColor,
  inputColor,
  borderColor,
  borderWidth,
  label,
  disableColor,
  inputContainerStyle,
  secureEntry,
  placeholder,
  required,
  value,
  errorMessage,
  onChangeText,
  leftIcon,
  ...rest
}) => {
  const { theme } = useUI();
  const [isPasswordSecure, setIsPasswordSecure] = useState(secureEntry);
  const [isFocused, setIsFocused] = useState(false);

  const focusAnimation = useSharedValue(0);

  const handleFocus = () => {
    setIsFocused(true);
    focusAnimation.value = withTiming(1, { duration: 200 });
  };

  const handleBlur = () => {
    setIsFocused(false);
    focusAnimation.value = withTiming(0, { duration: 200 });
  };

  const animatedContainerStyle = useAnimatedStyle(() => {
    const borderColorAnimated = interpolateColor(
      focusAnimation.value,
      [0, 1],
      [theme.inputBorder, theme.primary],
    );

    return {
      borderColor: errorMessage ? theme.error : borderColorAnimated,
    };
  });

  const getBorderColor = () => {
    if (errorMessage) return theme.error;
    if (isFocused) return theme.primary;
    return borderColor || theme.inputBorder;
  };

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelRow}>
          <CustomText
            font="Medium"
            style={[styles.label, { color: labelColor || theme.text.primary }]}
          >
            {label}
          </CustomText>
          {required && (
            <CustomText
              font="Medium"
              style={[styles.label, { color: theme.error, marginLeft: 4 }]}
            >
              *
            </CustomText>
          )}
        </View>
      )}

      <AnimatedView
        style={[
          styles.inputContainer,
          {
            backgroundColor: disableColor || theme.inputBackground,
            borderWidth: borderWidth || 1.5,
            borderColor: getBorderColor(),
          },
          isFocused && SHADOWS.small,
          inputContainerStyle,
          animatedContainerStyle,
        ]}
      >
        {leftIcon && (
          <MaterialCommunityIcons
            name={leftIcon}
            size={20}
            color={isFocused ? theme.primary : theme.text.tertiary}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          style={[
            styles.input,
            {
              color: inputColor || theme.inputTextColor,
              fontFamily: getFontName("Regular"),
            },
          ]}
          autoCapitalize="none"
          secureTextEntry={isPasswordSecure}
          value={value}
          placeholder={placeholder}
          placeholderTextColor={theme.inputPlaceholderColor}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />

        {secureEntry && (
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => setIsPasswordSecure(!isPasswordSecure)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons
              name={isPasswordSecure ? "eye-off-outline" : "eye-outline"}
              size={22}
              color={theme.text.tertiary}
            />
          </TouchableOpacity>
        )}
      </AnimatedView>

      {errorMessage && <ErrorMessage message={errorMessage} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize: RFValue(13),
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: RADIUS.md,
    height: 52,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontSize: RFValue(14),
    height: "100%",
  },
  leftIcon: {
    marginRight: 12,
  },
  iconContainer: {
    marginLeft: 8,
    padding: 4,
  },
});

export default CustomInputTextField;
