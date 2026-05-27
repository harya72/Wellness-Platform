import React, { FC, useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  Dimensions,
} from "react-native";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { useAuth } from "@context/AuthProvider";
import { useUI } from "@context/UiProvider";
import CustomText from "@components/CustomText";
import { RFValue } from "react-native-responsive-fontsize";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import analyticsApi, {
  DailyAnalytics,
  WeeklyAnalytics,
  MonthlyAnalytics,
} from "src/services/analyticsApi";
import { RADIUS, SHADOWS } from "@utils/colors";
import SkeletonLoader from "@components/SkeletonLoader";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BAR_WIDTH = (SCREEN_WIDTH - 80) / 7;

type TabType = "daily" | "weekly" | "monthly";

const Analytics: FC = () => {
  const { token } = useAuth();
  const { theme, showToast } = useUI();

  const [activeTab, setActiveTab] = useState<TabType>("daily");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [dailyData, setDailyData] = useState<DailyAnalytics | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyAnalytics | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyAnalytics | null>(null);

  const fetchAnalytics = async () => {
    if (!token) return;

    try {
      const [daily, weekly, monthly] = await Promise.all([
        analyticsApi.getDaily(token),
        analyticsApi.getWeekly(token),
        analyticsApi.getMonthly(token),
      ]);

      if (daily.success) setDailyData(daily.data);
      if (weekly.success) setWeeklyData(weekly.data);
      if (monthly.success) setMonthlyData(monthly.data);
    } catch (error: any) {
      showToast({
        message: error.message || "Failed to load analytics",
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
      fetchAnalytics();
    }, [token]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    setAnimationKey((prev) => prev + 1);
    fetchAnalytics();
  };

  const renderTab = (tab: TabType, label: string) => (
    <Pressable
      key={tab}
      style={[
        styles.tab,
        {
          backgroundColor: activeTab === tab ? theme.primary : theme.surface,
          borderColor: activeTab === tab ? theme.primary : theme.inputBorder,
        },
        activeTab === tab && SHADOWS.small,
      ]}
      onPress={() => setActiveTab(tab)}
    >
      <CustomText
        font="SemiBold"
        style={{
          color: activeTab === tab ? "#fff" : theme.text.secondary,
          fontSize: RFValue(12),
        }}
      >
        {label}
      </CustomText>
    </Pressable>
  );

  const getStatusColor = (status?: string): string => {
    switch (status) {
      case "under":
        return theme.green;
      case "over":
        return theme.red;
      case "on_track":
        return theme.primary;
      default:
        return theme.text.secondary;
    }
  };

  const renderDailyView = () => {
    if (!dailyData) return null;

    return (
      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.cardHeader}>
            <CustomText
              font="SemiBold"
              style={[styles.cardTitle, { color: theme.text.primary }]}
            >
              Today's Progress
            </CustomText>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: `${getStatusColor(dailyData.status)}20` },
              ]}
            >
              <CustomText
                font="SemiBold"
                style={{
                  color: getStatusColor(dailyData.status),
                  fontSize: RFValue(10),
                }}
              >
                {dailyData.status === "on_track"
                  ? "On Track"
                  : dailyData.status === "under"
                    ? "Under Goal"
                    : "Over Goal"}
              </CustomText>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBar,
                { backgroundColor: theme.inputTextFieldBorderColor },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(dailyData.percentConsumed, 100)}%`,
                    backgroundColor: getStatusColor(dailyData.status),
                  },
                ]}
              />
            </View>
            <CustomText
              font="SemiBold"
              style={{ color: theme.text.primary, fontSize: RFValue(14) }}
            >
              {dailyData.percentConsumed.toFixed(0)}%
            </CustomText>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <CustomText
                font="Bold"
                style={{ color: theme.primary, fontSize: RFValue(20) }}
              >
                {dailyData.consumed}
              </CustomText>
              <CustomText
                font="Regular"
                style={{ color: theme.text.secondary, fontSize: RFValue(11) }}
              >
                Consumed
              </CustomText>
            </View>
            <View style={styles.statItem}>
              <CustomText
                font="Bold"
                style={{ color: theme.text.primary, fontSize: RFValue(20) }}
              >
                {dailyData.calorieGoal}
              </CustomText>
              <CustomText
                font="Regular"
                style={{ color: theme.text.secondary, fontSize: RFValue(11) }}
              >
                Goal
              </CustomText>
            </View>
            <View style={styles.statItem}>
              <CustomText
                font="Bold"
                style={{
                  color: dailyData.remaining >= 0 ? theme.green : theme.red,
                  fontSize: RFValue(20),
                }}
              >
                {Math.abs(dailyData.remaining)}
              </CustomText>
              <CustomText
                font="Regular"
                style={{ color: theme.text.secondary, fontSize: RFValue(11) }}
              >
                {dailyData.remaining >= 0 ? "Remaining" : "Over"}
              </CustomText>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <CustomText
            font="SemiBold"
            style={[styles.cardTitle, { color: theme.text.primary }]}
          >
            Macros Breakdown
          </CustomText>
          <View style={styles.macrosContainer}>
            <View style={styles.macroCircle}>
              <View
                style={[styles.macroCircleInner, { borderColor: "#FF6B6B" }]}
              >
                <CustomText
                  font="Bold"
                  style={{ color: theme.text.primary, fontSize: RFValue(16) }}
                >
                  {dailyData.macros.protein}g
                </CustomText>
              </View>
              <CustomText
                font="Regular"
                style={{
                  color: theme.text.secondary,
                  fontSize: RFValue(11),
                  marginTop: 8,
                }}
              >
                Protein
              </CustomText>
            </View>
            <View style={styles.macroCircle}>
              <View
                style={[styles.macroCircleInner, { borderColor: "#4ECDC4" }]}
              >
                <CustomText
                  font="Bold"
                  style={{ color: theme.text.primary, fontSize: RFValue(16) }}
                >
                  {dailyData.macros.carbs}g
                </CustomText>
              </View>
              <CustomText
                font="Regular"
                style={{
                  color: theme.text.secondary,
                  fontSize: RFValue(11),
                  marginTop: 8,
                }}
              >
                Carbs
              </CustomText>
            </View>
            <View style={styles.macroCircle}>
              <View
                style={[styles.macroCircleInner, { borderColor: "#FFE66D" }]}
              >
                <CustomText
                  font="Bold"
                  style={{ color: theme.text.primary, fontSize: RFValue(16) }}
                >
                  {dailyData.macros.fats}g
                </CustomText>
              </View>
              <CustomText
                font="Regular"
                style={{
                  color: theme.text.secondary,
                  fontSize: RFValue(11),
                  marginTop: 8,
                }}
              >
                Fats
              </CustomText>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.messageCard,
            { backgroundColor: `${getStatusColor(dailyData.status)}15` },
          ]}
        >
          <MaterialCommunityIcons
            name="lightbulb-outline"
            size={24}
            color={getStatusColor(dailyData.status)}
          />
          <CustomText
            font="Regular"
            style={{
              color: theme.text.primary,
              fontSize: RFValue(13),
              flex: 1,
              marginLeft: 12,
            }}
          >
            {dailyData.message}
          </CustomText>
        </View>
      </View>
    );
  };

  const renderWeeklyView = () => {
    if (!weeklyData) return null;

    const maxCalories = Math.max(
      ...(weeklyData.dailyBreakdown || []).map((d) => d.totalCalories),
      1,
    );

    return (
      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <CustomText
            font="SemiBold"
            style={[styles.cardTitle, { color: theme.text.primary }]}
          >
            Weekly Calories
          </CustomText>
          <View style={styles.chartContainer}>
            {(weeklyData.dailyBreakdown || []).map((day, index) => (
              <View key={index} style={styles.barWrapper}>
                <View
                  style={[
                    styles.barBackground,
                    { backgroundColor: theme.inputTextFieldBorderColor },
                  ]}
                >
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${(day.totalCalories / maxCalories) * 100}%`,
                        backgroundColor: theme.primary,
                      },
                    ]}
                  />
                </View>
                <CustomText
                  font="Regular"
                  style={{
                    color: theme.text.secondary,
                    fontSize: RFValue(10),
                    marginTop: 4,
                  }}
                >
                  {new Date(day.date)
                    .toLocaleDateString(undefined, { weekday: "short" })
                    .charAt(0)}
                </CustomText>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <CustomText
            font="SemiBold"
            style={[styles.cardTitle, { color: theme.text.primary }]}
          >
            This Week
          </CustomText>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <CustomText
                font="Bold"
                style={{ color: theme.primary, fontSize: RFValue(22) }}
              >
                {weeklyData.averageCalories.toFixed(0)}
              </CustomText>
              <CustomText
                font="Regular"
                style={{ color: theme.text.secondary, fontSize: RFValue(11) }}
              >
                Avg Calories
              </CustomText>
            </View>
            <View style={styles.statBox}>
              <CustomText
                font="Bold"
                style={{ color: theme.text.primary, fontSize: RFValue(22) }}
              >
                {weeklyData.totals.mealsCount}
              </CustomText>
              <CustomText
                font="Regular"
                style={{ color: theme.text.secondary, fontSize: RFValue(11) }}
              >
                Total Meals
              </CustomText>
            </View>
            <View style={styles.statBox}>
              <CustomText
                font="Bold"
                style={{ color: theme.green, fontSize: RFValue(22) }}
              >
                {weeklyData.daysTracked}
              </CustomText>
              <CustomText
                font="Regular"
                style={{ color: theme.text.secondary, fontSize: RFValue(11) }}
              >
                Days Tracked
              </CustomText>
            </View>
            <View style={styles.statBox}>
              <CustomText
                font="Bold"
                style={{ color: theme.orange, fontSize: RFValue(22) }}
              >
                {weeklyData.weeklyProgress.toFixed(0)}%
              </CustomText>
              <CustomText
                font="Regular"
                style={{ color: theme.text.secondary, fontSize: RFValue(11) }}
              >
                Week Progress
              </CustomText>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <CustomText
            font="SemiBold"
            style={[styles.cardTitle, { color: theme.text.primary }]}
          >
            Macro Distribution
          </CustomText>
          <View style={styles.macroBreakdown}>
            <View style={styles.macroRow}>
              <View style={styles.macroLabel}>
                <View
                  style={[styles.macroDot, { backgroundColor: "#FF6B6B" }]}
                />
                <CustomText
                  font="Regular"
                  style={{ color: theme.text.secondary, fontSize: RFValue(12) }}
                >
                  Protein
                </CustomText>
              </View>
              <CustomText
                font="SemiBold"
                style={{ color: theme.text.primary, fontSize: RFValue(12) }}
              >
                {weeklyData.macroBreakdown.proteinPercentage.toFixed(0)}%
              </CustomText>
            </View>
            <View style={styles.macroRow}>
              <View style={styles.macroLabel}>
                <View
                  style={[styles.macroDot, { backgroundColor: "#4ECDC4" }]}
                />
                <CustomText
                  font="Regular"
                  style={{ color: theme.text.secondary, fontSize: RFValue(12) }}
                >
                  Carbs
                </CustomText>
              </View>
              <CustomText
                font="SemiBold"
                style={{ color: theme.text.primary, fontSize: RFValue(12) }}
              >
                {weeklyData.macroBreakdown.carbsPercentage.toFixed(0)}%
              </CustomText>
            </View>
            <View style={styles.macroRow}>
              <View style={styles.macroLabel}>
                <View
                  style={[styles.macroDot, { backgroundColor: "#FFE66D" }]}
                />
                <CustomText
                  font="Regular"
                  style={{ color: theme.text.secondary, fontSize: RFValue(12) }}
                >
                  Fats
                </CustomText>
              </View>
              <CustomText
                font="SemiBold"
                style={{ color: theme.text.primary, fontSize: RFValue(12) }}
              >
                {weeklyData.macroBreakdown.fatsPercentage.toFixed(0)}%
              </CustomText>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderMonthlyView = () => {
    if (!monthlyData) return null;

    return (
      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <CustomText
            font="SemiBold"
            style={[styles.cardTitle, { color: theme.text.primary }]}
          >
            Monthly Overview
          </CustomText>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <CustomText
                font="Bold"
                style={{ color: theme.primary, fontSize: RFValue(22) }}
              >
                {monthlyData.averageCalories.toFixed(0)}
              </CustomText>
              <CustomText
                font="Regular"
                style={{ color: theme.text.secondary, fontSize: RFValue(11) }}
              >
                Avg Calories
              </CustomText>
            </View>
            <View style={styles.statBox}>
              <CustomText
                font="Bold"
                style={{ color: theme.text.primary, fontSize: RFValue(22) }}
              >
                {monthlyData.totals.mealsCount}
              </CustomText>
              <CustomText
                font="Regular"
                style={{ color: theme.text.secondary, fontSize: RFValue(11) }}
              >
                Total Meals
              </CustomText>
            </View>
            <View style={styles.statBox}>
              <CustomText
                font="Bold"
                style={{ color: theme.green, fontSize: RFValue(22) }}
              >
                {monthlyData.daysTracked}/{monthlyData.daysInMonth}
              </CustomText>
              <CustomText
                font="Regular"
                style={{ color: theme.text.secondary, fontSize: RFValue(11) }}
              >
                Days Tracked
              </CustomText>
            </View>
            <View style={styles.statBox}>
              <CustomText
                font="Bold"
                style={{ color: theme.orange, fontSize: RFValue(22) }}
              >
                {monthlyData.consistencyScore}%
              </CustomText>
              <CustomText
                font="Regular"
                style={{ color: theme.text.secondary, fontSize: RFValue(11) }}
              >
                Consistency
              </CustomText>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <CustomText
            font="SemiBold"
            style={[styles.cardTitle, { color: theme.text.primary }]}
          >
            Weekly Trends
          </CustomText>
          {(monthlyData.weeklyTrends || []).map((week, index) => (
            <View key={index} style={styles.weekRow}>
              <CustomText
                font="Regular"
                style={{ color: theme.text.secondary, fontSize: RFValue(12) }}
              >
                Week {week.week}
              </CustomText>
              <View style={styles.weekStats}>
                <CustomText
                  font="SemiBold"
                  style={{ color: theme.primary, fontSize: RFValue(12) }}
                >
                  {week.averageCalories.toFixed(0)} cal/day
                </CustomText>
                <CustomText
                  font="Regular"
                  style={{ color: theme.text.secondary, fontSize: RFValue(11) }}
                >
                  {week.mealsCount} meals
                </CustomText>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <CustomText
            font="SemiBold"
            style={[styles.cardTitle, { color: theme.text.primary }]}
          >
            Average Daily Macros
          </CustomText>
          <View style={styles.avgMacros}>
            <View style={styles.avgMacroItem}>
              <CustomText
                font="Bold"
                style={{ color: "#FF6B6B", fontSize: RFValue(18) }}
              >
                {monthlyData.averageMacros.protein.toFixed(0)}g
              </CustomText>
              <CustomText
                font="Regular"
                style={{ color: theme.text.secondary, fontSize: RFValue(11) }}
              >
                Protein
              </CustomText>
            </View>
            <View style={styles.avgMacroItem}>
              <CustomText
                font="Bold"
                style={{ color: "#4ECDC4", fontSize: RFValue(18) }}
              >
                {monthlyData.averageMacros.carbs.toFixed(0)}g
              </CustomText>
              <CustomText
                font="Regular"
                style={{ color: theme.text.secondary, fontSize: RFValue(11) }}
              >
                Carbs
              </CustomText>
            </View>
            <View style={styles.avgMacroItem}>
              <CustomText
                font="Bold"
                style={{ color: "#FFE66D", fontSize: RFValue(18) }}
              >
                {monthlyData.averageMacros.fats.toFixed(0)}g
              </CustomText>
              <CustomText
                font="Regular"
                style={{ color: theme.text.secondary, fontSize: RFValue(11) }}
              >
                Fats
              </CustomText>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.tabContainer}>
        {renderTab("daily", "Daily")}
        {renderTab("weekly", "Weekly")}
        {renderTab("monthly", "Monthly")}
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <View style={styles.skeletonContent}>
            <SkeletonLoader
              width={"100%"}
              height={180}
              borderRadius={RADIUS.lg}
            />
            <View style={{ height: 16 }} />
            <SkeletonLoader
              width={"100%"}
              height={140}
              borderRadius={RADIUS.lg}
            />
            <View style={{ height: 16 }} />
            <SkeletonLoader
              width={"100%"}
              height={200}
              borderRadius={RADIUS.lg}
            />
          </View>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.primary}
            />
          }
        >
          {activeTab === "daily" && renderDailyView()}
          {activeTab === "weekly" && renderWeeklyView()}
          {activeTab === "monthly" && renderMonthlyView()}
        </ScrollView>
      )}
    </View>
  );
};

export default Analytics;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 16,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: RFValue(14),
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  macrosContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  macroCircle: {
    alignItems: "center",
  },
  macroCircleInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  messageCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 150,
    paddingTop: 16,
  },
  barWrapper: {
    alignItems: "center",
  },
  barBackground: {
    width: BAR_WIDTH - 8,
    height: 120,
    borderRadius: 6,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  barFill: {
    width: "100%",
    borderRadius: 6,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statBox: {
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
    paddingVertical: 12,
  },
  macroBreakdown: {
    gap: 12,
  },
  macroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  macroLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  macroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  weekStats: {
    alignItems: "flex-end",
  },
  avgMacros: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  avgMacroItem: {
    alignItems: "center",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  skeletonContent: {
    width: "100%",
    padding: 16,
  },
});
