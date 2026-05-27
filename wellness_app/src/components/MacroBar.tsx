import React, { FC } from "react";
import { View, StyleSheet } from "react-native";
import { useUI } from "@context/UiProvider";
import CustomText from "./CustomText";
import { RFValue } from "react-native-responsive-fontsize";

interface MacroBarProps {
  protein: number;
  carbs: number;
  fats: number;
  showLabels?: boolean;
}

const MacroBar: FC<MacroBarProps> = ({
  protein,
  carbs,
  fats,
  showLabels = true,
}) => {
  const { theme } = useUI();

  const total = protein + carbs + fats;
  const proteinPercent = total > 0 ? (protein / total) * 100 : 33.33;
  const carbsPercent = total > 0 ? (carbs / total) * 100 : 33.33;
  const fatsPercent = total > 0 ? (fats / total) * 100 : 33.33;

  const COLORS = {
    protein: "#FF6B6B",
    carbs: "#4ECDC4",
    fats: "#FFE66D",
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.barContainer,
          { backgroundColor: theme.inputTextFieldBorderColor },
        ]}
      >
        <View
          style={[
            styles.barSegment,
            { width: `${proteinPercent}%`, backgroundColor: COLORS.protein },
          ]}
        />
        <View
          style={[
            styles.barSegment,
            { width: `${carbsPercent}%`, backgroundColor: COLORS.carbs },
          ]}
        />
        <View
          style={[
            styles.barSegment,
            { width: `${fatsPercent}%`, backgroundColor: COLORS.fats },
          ]}
        />
      </View>

      {showLabels && (
        <View style={styles.labelsContainer}>
          <View style={styles.labelItem}>
            <View style={[styles.dot, { backgroundColor: COLORS.protein }]} />
            <CustomText
              font="Regular"
              style={[styles.labelText, { color: theme.text.secondary }]}
            >
              Protein
            </CustomText>
            <CustomText
              font="SemiBold"
              style={[styles.valueText, { color: theme.text.primary }]}
            >
              {Math.round(protein)}g
            </CustomText>
          </View>

          <View style={styles.labelItem}>
            <View style={[styles.dot, { backgroundColor: COLORS.carbs }]} />
            <CustomText
              font="Regular"
              style={[styles.labelText, { color: theme.text.secondary }]}
            >
              Carbs
            </CustomText>
            <CustomText
              font="SemiBold"
              style={[styles.valueText, { color: theme.text.primary }]}
            >
              {Math.round(carbs)}g
            </CustomText>
          </View>

          <View style={styles.labelItem}>
            <View style={[styles.dot, { backgroundColor: COLORS.fats }]} />
            <CustomText
              font="Regular"
              style={[styles.labelText, { color: theme.text.secondary }]}
            >
              Fats
            </CustomText>
            <CustomText
              font="SemiBold"
              style={[styles.valueText, { color: theme.text.primary }]}
            >
              {Math.round(fats)}g
            </CustomText>
          </View>
        </View>
      )}
    </View>
  );
};

export default MacroBar;

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  barContainer: {
    height: 8,
    borderRadius: 4,
    flexDirection: "row",
    overflow: "hidden",
  },
  barSegment: {
    height: "100%",
  },
  labelsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  labelItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  labelText: {
    fontSize: RFValue(11),
  },
  valueText: {
    fontSize: RFValue(11),
  },
});
