
import React, { FC } from "react";
import { View, StyleSheet, Image, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useUI } from "@context/UiProvider";
import CustomText from "./CustomText";
import { RFValue } from "react-native-responsive-fontsize";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Meal, MealType } from "src/services/mealApi";
import { RADIUS, SHADOWS } from "@utils/colors";

interface MealCardProps {
  meal: Meal;
  onPress?: () => void;
}

const getMealIcon = (
  mealType: MealType,
): React.ComponentProps<typeof MaterialCommunityIcons>["name"] => {
  switch (mealType) {
    case "breakfast":
      return "weather-sunset-up";
    case "lunch":
      return "weather-sunny";
    case "dinner":
      return "weather-night";
    case "snack":
      return "cookie";
    default:
      return "food";
  }
};

const getMealColor = (mealType: MealType): string => {
  switch (mealType) {
    case "breakfast":
      return "#FF9F43";
    case "lunch":
      return "#00D2D3";
    case "dinner":
      return "#5F27CD";
    case "snack":
      return "#EE5253";
    default:
      return "#FC8019";
  }
};

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const getStatusColor = (status?: string): string => {
  if (status === 'approved') return '#2ecc71';
  if (status === 'flagged') return '#e74c3c';
  return '#f1c40f'; // pending
};

const getStatusText = (status?: string): string => {
  if (status === 'approved') return 'Approved';
  if (status === 'flagged') return 'Flagged';
  return 'Pending';
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const MealCard: FC<MealCardProps> = ({ meal, onPress }) => {
  const { theme } = useUI();
  const mealColor = getMealColor(meal.mealType);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <AnimatedPressable
      style={[
        styles.container,
        { backgroundColor: theme.cardBackground },
        SHADOWS.small,
        animatedStyle,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <View
        style={[
          styles.imageContainer,
          { backgroundColor: meal.imageUrl ? theme.surface : `${mealColor}15` },
        ]}
      >
        {meal.imageUrl ? (
          <Image source={{ uri: meal.imageUrl }} style={styles.mealImage} />
        ) : (
          <MaterialCommunityIcons
            name={getMealIcon(meal.mealType)}
            size={32}
            color={mealColor}
          />
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <CustomText
            font="SemiBold"
            style={[styles.mealType, { color: theme.text.primary }]}
            numberOfLines={1}
          >
            {meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}
          </CustomText>
          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
            <View
              style={[
                styles.mealTypeBadge,
                { backgroundColor: `${getStatusColor(meal.status)}15` },
              ]}
            >
              <CustomText
                font="Medium"
                style={[styles.mealTypeBadgeText, { color: getStatusColor(meal.status) }]}
              >
                {getStatusText(meal.status)}
              </CustomText>
            </View>
            <View
              style={[
                styles.mealTypeBadge,
                { backgroundColor: `${mealColor}15` },
              ]}
            >
              <CustomText
                font="Medium"
                style={[styles.mealTypeBadgeText, { color: mealColor }]}
              >
                {formatTime(meal.createdAt)}
              </CustomText>
            </View>
          </View>
        </View>

        {meal.description && (
          <CustomText
            font="Regular"
            style={[styles.description, { color: theme.text.secondary }]}
            numberOfLines={2}
          >
            {meal.description}
          </CustomText>
        )}

        <View style={styles.nutritionRow}>
          <View
            style={[styles.caloriesBadge, { backgroundColor: theme.primary }]}
          >
            <MaterialCommunityIcons name="fire" size={12} color="#FFFFFF" />
            <CustomText font="SemiBold" style={styles.caloriesText}>
              {meal.totalCalories} kcal
            </CustomText>
          </View>

          <View style={styles.macrosContainer}>
            {meal.protein !== undefined && meal.protein !== null && (
              <View
                style={[
                  styles.macroPill,
                  { backgroundColor: `${theme.protein}15` },
                ]}
              >
                <CustomText
                  font="Medium"
                  style={[styles.macroText, { color: theme.protein }]}
                >
                  P {Math.round(meal.protein)}g
                </CustomText>
              </View>
            )}

            {meal.carbs !== undefined && meal.carbs !== null && (
              <View
                style={[
                  styles.macroPill,
                  { backgroundColor: `${theme.carbs}15` },
                ]}
              >
                <CustomText
                  font="Medium"
                  style={[styles.macroText, { color: theme.carbs }]}
                >
                  C {Math.round(meal.carbs)}g
                </CustomText>
              </View>
            )}

            {meal.fats !== undefined && meal.fats !== null && (
              <View
                style={[
                  styles.macroPill,
                  { backgroundColor: `${theme.fats}15` },
                ]}
              >
                <CustomText
                  font="Medium"
                  style={[styles.macroText, { color: "#D4A017" }]}
                >
                  F {Math.round(meal.fats)}g
                </CustomText>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.chevronContainer}>
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={theme.text.tertiary}
        />
      </View>
    </AnimatedPressable>
  );
};

export default MealCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: RADIUS.lg,
    marginBottom: 12,
  },
  imageContainer: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  mealImage: {
    width: "100%",
    height: "100%",
  },
  content: {
    flex: 1,
    marginLeft: 14,
    paddingRight: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  mealType: {
    fontSize: RFValue(15),
    flex: 1,
  },
  mealTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  mealTypeBadgeText: {
    fontSize: RFValue(10),
  },
  description: {
    fontSize: RFValue(12),
    marginBottom: 8,
    lineHeight: RFValue(16),
  },
  nutritionRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  caloriesBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  caloriesText: {
    fontSize: RFValue(11),
    color: "#FFFFFF",
  },
  macrosContainer: {
    flexDirection: "row",
    gap: 4,
  },
  macroPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  macroText: {
    fontSize: RFValue(10),
  },
  chevronContainer: {
    padding: 4,
  },
});
