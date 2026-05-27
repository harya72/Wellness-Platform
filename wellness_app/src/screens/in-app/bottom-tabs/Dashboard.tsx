

import React, { FC, useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from "react-native-reanimated";
import { useAuth } from "@context/AuthProvider";
import { useUI } from "@context/UiProvider";
import CustomText from "@components/CustomText";
import { RFValue } from "react-native-responsive-fontsize";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import CalorieRing from "@components/CalorieRing";
import MealCard from "@components/MealCard";
import MacroBar from "@components/MacroBar";
import mealApi, { Meal, MealType } from "src/services/mealApi";
import { useMealRealtime } from "src/hooks/useMealRealtime";
import { RADIUS, SHADOWS } from "@utils/colors";
import { SkeletonDashboard } from "@components/SkeletonLoader";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const QUICK_ACTIONS: {
  type: MealType;
  name: string;
  icon: string;
  color: string;
}[] = [
    {
      type: "breakfast",
      name: "Breakfast",
      icon: "weather-sunset-up",
      color: "#FF9F43",
    },
    { type: "lunch", name: "Lunch", icon: "weather-sunny", color: "#00D2D3" },
    { type: "dinner", name: "Dinner", icon: "weather-night", color: "#5F27CD" },
    { type: "snack", name: "Snack", icon: "cookie", color: "#EE5253" },
  ];

const Dashboard: FC = () => {
  const { token, profile } = useAuth();
  const { theme, showToast } = useUI();
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [animationKey, setAnimationKey] = useState(0); // Key to re-trigger animations
  const [meals, setMeals] = useState<Meal[]>([]);
  const [summary, setSummary] = useState({
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0,
    mealsCount: 0,
  });
  const [goal, setGoal] = useState(profile?.dailyCalorieGoal || 2000);

  console.log("token", token);

  const fabScale = useSharedValue(1);
  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  const fetchTodaysMeals = async () => {
    if (!token) return;

    try {
      const response = await mealApi.getTodaysMeals(token);
      if (response.success) {
        const data = response.data;
        setMeals(data?.meals || []);
        setSummary({
          totalCalories: data?.totals?.totalCalories || 0,
          totalProtein: data?.totals?.totalProtein || 0,
          totalCarbs: data?.totals?.totalCarbs || 0,
          totalFats: data?.totals?.totalFats || 0,
          mealsCount: data?.mealsCount || 0,
        });
        setGoal(data?.goal || profile?.dailyCalorieGoal || 2000);
      }
    } catch (error: any) {
      showToast({
        message: error.message || "Failed to load meals",
        success: false,
        title: "Error",
        visible: true,
        duration: 3000,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTodaysMeals();
    }, [token]),
  );

  useMealRealtime(
    (newComment) => {
      console.log('New comment on today\'s meal:', newComment);
    },
    (updatedMeal) => {
      setMeals((currentMeals) =>
        currentMeals.map((meal) =>
          meal.id === updatedMeal.id ? { ...meal, ...updatedMeal } : meal
        )
      );
    }
  );

  const onRefresh = () => {
    setRefreshing(true);
    setAnimationKey((prev) => prev + 1); // Increment to re-trigger animations
    fetchTodaysMeals();
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 5) return "Good Night";
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    if (hour < 21) return "Good Evening";
    return "Good Night";
  };

  const handleQuickAction = (type: MealType) => {
    navigation.navigate("ADD_MEAL", { mealType: type });
  };

  const renderQuickAction = (
    action: (typeof QUICK_ACTIONS)[0],
    index: number,
  ) => (
    <Animated.View
      key={action.type}
      entering={FadeInDown.delay(100 * index).springify()}
    >
      <Pressable
        style={[
          styles.quickAction,
          { backgroundColor: theme.cardBackground },
          SHADOWS.small,
        ]}
        onPress={() => handleQuickAction(action.type)}
      >
        <View
          style={[
            styles.quickActionIcon,
            { backgroundColor: `${action.color}15` },
          ]}
        >
          <MaterialCommunityIcons
            name={action.icon as any}
            size={24}
            color={action.color}
          />
        </View>
        <CustomText
          font="Medium"
          style={[styles.quickActionText, { color: theme.text.primary }]}
        >
          {action.name}
        </CustomText>
      </Pressable>
    </Animated.View>
  );

  if (loading) {
    return <SkeletonDashboard />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      >
        <Animated.View
          key={`header-${animationKey}`}
          style={styles.header}
          entering={FadeInDown.delay(50).springify()}
        >
          <View>
            <CustomText
              font="Regular"
              style={[styles.greeting, { color: theme.text.secondary }]}
            >
              {greeting()} 👋
            </CustomText>
            <CustomText
              font="Bold"
              style={[styles.userName, { color: theme.text.primary }]}
            >
              {profile?.name || "User"}
            </CustomText>
          </View>
          <Pressable
            style={[
              styles.historyButton,
              { backgroundColor: theme.surface },
              SHADOWS.small,
            ]}
            onPress={() => navigation.navigate("MEAL_HISTORY")}
          >
            <MaterialCommunityIcons
              name="history"
              size={22}
              color={theme.text.primary}
            />
          </Pressable>
        </Animated.View>

        <Animated.View
          key={`progress-${animationKey}`}
          style={[
            styles.progressCard,
            { backgroundColor: theme.cardBackground },
            SHADOWS.medium,
          ]}
          entering={FadeInDown.delay(100).springify()}
        >
          <View style={styles.progressHeader}>
            <CustomText
              font="SemiBold"
              style={[styles.progressTitle, { color: theme.text.primary }]}
            >
              Today's Progress
            </CustomText>
            <View
              style={[
                styles.goalBadge,
                { backgroundColor: theme.primaryLight },
              ]}
            >
              <CustomText
                font="Medium"
                style={[styles.goalBadgeText, { color: theme.primary }]}
              >
                {goal} kcal
              </CustomText>
            </View>
          </View>

          <View style={styles.ringContainer}>
            <CalorieRing
              consumed={summary.totalCalories}
              goal={goal}
              size={160}
            />
          </View>

          <View
            style={[styles.statsRow, { borderTopColor: theme.dividerColor }]}
          >
            <View style={styles.statItem}>
              <CustomText
                font="Bold"
                style={[styles.statValue, { color: theme.primary }]}
              >
                {summary.totalCalories}
              </CustomText>
              <CustomText
                font="Regular"
                style={[styles.statLabel, { color: theme.text.secondary }]}
              >
                Consumed
              </CustomText>
            </View>
            <View
              style={[
                styles.statDivider,
                { backgroundColor: theme.dividerColor },
              ]}
            />
            <View style={styles.statItem}>
              <CustomText
                font="Bold"
                style={[styles.statValue, { color: theme.success }]}
              >
                {Math.max(0, goal - summary.totalCalories)}
              </CustomText>
              <CustomText
                font="Regular"
                style={[styles.statLabel, { color: theme.text.secondary }]}
              >
                Remaining
              </CustomText>
            </View>
            <View
              style={[
                styles.statDivider,
                { backgroundColor: theme.dividerColor },
              ]}
            />
            <View style={styles.statItem}>
              <CustomText
                font="Bold"
                style={[styles.statValue, { color: theme.text.primary }]}
              >
                {summary.mealsCount}
              </CustomText>
              <CustomText
                font="Regular"
                style={[styles.statLabel, { color: theme.text.secondary }]}
              >
                Meals
              </CustomText>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          key={`quick-${animationKey}`}
          entering={FadeInDown.delay(150).springify()}
        >
          <CustomText
            font="SemiBold"
            style={[styles.sectionTitle, { color: theme.text.primary }]}
          >
            Quick Add
          </CustomText>
          <View style={styles.quickActionsRow}>
            {QUICK_ACTIONS.map((action, index) =>
              renderQuickAction(action, index),
            )}
          </View>
        </Animated.View>

        <Animated.View
          key={`macros-${animationKey}`}
          style={[
            styles.macrosCard,
            { backgroundColor: theme.cardBackground },
            SHADOWS.small,
          ]}
          entering={FadeInDown.delay(200).springify()}
        >
          <CustomText
            font="SemiBold"
            style={[styles.cardTitle, { color: theme.text.primary }]}
          >
            Today's Macros
          </CustomText>
          <MacroBar
            protein={summary.totalProtein}
            carbs={summary.totalCarbs}
            fats={summary.totalFats}
          />
        </Animated.View>

        <Animated.View
          key={`meals-${animationKey}`}
          style={styles.mealsSection}
          entering={FadeInDown.delay(250).springify()}
        >
          <View style={styles.sectionHeader}>
            <CustomText
              font="SemiBold"
              style={[styles.sectionTitle, { color: theme.text.primary }]}
            >
              Today's Meals
            </CustomText>
            <CustomText
              font="Medium"
              style={[styles.mealCount, { color: theme.text.tertiary }]}
            >
              {summary.mealsCount} {summary.mealsCount === 1 ? "meal" : "meals"}
            </CustomText>
          </View>

          {meals.length === 0 ? (
            <View
              style={[styles.emptyState, { backgroundColor: theme.surface }]}
            >
              <View
                style={[
                  styles.emptyIconContainer,
                  { backgroundColor: theme.primaryLight },
                ]}
              >
                <MaterialCommunityIcons
                  name="food-variant"
                  size={40}
                  color={theme.primary}
                />
              </View>
              <CustomText
                font="SemiBold"
                style={[styles.emptyText, { color: theme.text.primary }]}
              >
                No meals logged today
              </CustomText>
              <CustomText
                font="Regular"
                style={[styles.emptySubtext, { color: theme.text.secondary }]}
              >
                Use the quick actions above or tap the + button to add your
                first meal
              </CustomText>
            </View>
          ) : (
            meals.map((meal, index) => (
              <Animated.View
                key={meal.id}
                entering={FadeInDown.delay(300 + index * 50).springify()}
              >
                <MealCard
                  meal={meal}
                  onPress={() =>
                    navigation.navigate("MEAL_DETAIL", { mealId: meal.id })
                  }
                />
              </Animated.View>
            ))
          )}
        </Animated.View>
      </ScrollView>

      <AnimatedPressable
        style={[
          styles.fab,
          { backgroundColor: theme.primary },
          SHADOWS.large,
          fabAnimatedStyle,
        ]}
        onPress={() => navigation.navigate("ADD_MEAL")}
        onPressIn={() => {
          fabScale.value = withSpring(0.9);
        }}
        onPressOut={() => {
          fabScale.value = withSpring(1);
        }}
      >
        <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
      </AnimatedPressable>
    </View>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: {
    fontSize: RFValue(13),
    marginBottom: 2,
  },
  userName: {
    fontSize: RFValue(22),
  },
  historyButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
  },
  progressCard: {
    borderRadius: RADIUS.xl,
    padding: 20,
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: RFValue(16),
  },
  goalBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  goalBadgeText: {
    fontSize: RFValue(12),
  },
  ringContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 16,
    borderTopWidth: 1,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: RFValue(18),
    marginBottom: 2,
  },
  statLabel: {
    fontSize: RFValue(11),
  },
  statDivider: {
    width: 1,
    height: 30,
    alignSelf: "center",
  },
  quickActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  quickAction: {
    alignItems: "center",
    padding: 12,
    borderRadius: RADIUS.lg,
    width: 78,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: RFValue(10),
  },
  macrosCard: {
    borderRadius: RADIUS.lg,
    padding: 16,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: RFValue(14),
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: RFValue(15),
    marginBottom: 12,
  },
  mealsSection: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  mealCount: {
    fontSize: RFValue(12),
  },
  emptyState: {
    padding: 32,
    borderRadius: RADIUS.lg,
    alignItems: "center",
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyText: {
    fontSize: RFValue(15),
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: RFValue(12),
    textAlign: "center",
    lineHeight: RFValue(18),
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});
