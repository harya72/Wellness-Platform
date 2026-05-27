import React, { FC } from "react";
import { View, StyleSheet } from "react-native";
import {
  Canvas,
  Circle,
  Path,
  Skia,
  Text,
  useFont,
} from "@shopify/react-native-skia";
import { useUI } from "@context/UiProvider";
import CustomText from "./CustomText";
import { RFValue } from "react-native-responsive-fontsize";

interface CalorieRingProps {
  consumed: number;
  goal: number;
  size?: number;
}

const CalorieRing: FC<CalorieRingProps> = ({ consumed, goal, size = 200 }) => {
  const { theme } = useUI();

  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  const percentage = Math.min((consumed / goal) * 100, 100);
  const remaining = goal - consumed;

  const startAngle = -90;
  const sweepAngle = (percentage / 100) * 360;
  const endAngle = startAngle + sweepAngle;

  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;

  const path = Skia.Path.Make();
  path.addArc(
    {
      x: center - radius,
      y: center - radius,
      width: radius * 2,
      height: radius * 2,
    },
    startAngle,
    sweepAngle,
  );

  const getProgressColor = () => {
    if (percentage >= 100) return theme.red;
    if (percentage >= 90) return theme.orange;
    return theme.green;
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Canvas style={{ width: size, height: size }}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          style="stroke"
          strokeWidth={strokeWidth}
          color={theme.inputTextFieldBorderColor}
        />
        <Path
          path={path}
          style="stroke"
          strokeWidth={strokeWidth}
          strokeCap="round"
          color={getProgressColor()}
        />
      </Canvas>

      <View style={styles.centerContent}>
        <CustomText
          font="Bold"
          style={[styles.consumedText, { color: theme.text.primary }]}
        >
          {consumed}
        </CustomText>
        <CustomText
          font="Regular"
          style={[styles.labelText, { color: theme.text.secondary }]}
        >
          kcal eaten
        </CustomText>
        <View
          style={[
            styles.divider,
            { backgroundColor: theme.inputTextFieldBorderColor },
          ]}
        />
        <CustomText
          font="SemiBold"
          style={[
            styles.remainingText,
            { color: remaining >= 0 ? theme.green : theme.red },
          ]}
        >
          {remaining >= 0 ? remaining : Math.abs(remaining)}
        </CustomText>
        <CustomText
          font="Regular"
          style={[styles.labelText, { color: theme.text.secondary }]}
        >
          {remaining >= 0 ? "remaining" : "over"}
        </CustomText>
      </View>
    </View>
  );
};

export default CalorieRing;

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  centerContent: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  consumedText: {
    fontSize: RFValue(32),
  },
  labelText: {
    fontSize: RFValue(12),
  },
  divider: {
    width: 60,
    height: 1,
    marginVertical: 8,
  },
  remainingText: {
    fontSize: RFValue(18),
  },
});
