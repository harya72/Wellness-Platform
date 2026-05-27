

import React, { useEffect } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from "react-native-reanimated";
import { useUI } from "@context/UiProvider";
import { RADIUS } from "@utils/colors";

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = 16,
  borderRadius = RADIUS.sm,
  style,
}) => {
  const { theme } = useUI();
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, {
        duration: 1200,
        easing: Easing.linear,
      }),
      -1, // Infinite loop
      false, // Don't reverse
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(shimmer.value, [0, 1], [-100, 100]);
    return {
      transform: [{ translateX: `${translateX}%` as any }],
    };
  });

  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.skeletonBase,
          overflow: "hidden",
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          { backgroundColor: theme.skeletonHighlight },
          animatedStyle,
        ]}
      />
    </View>
  );
};

export const SkeletonCard: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  const { theme } = useUI();

  return (
    <View
      style={[styles.card, { backgroundColor: theme.cardBackground }, style]}
    >
      <View style={styles.cardRow}>
        <Skeleton width={60} height={60} borderRadius={RADIUS.md} />
        <View style={styles.cardContent}>
          <Skeleton width="70%" height={16} />
          <Skeleton width="50%" height={14} style={{ marginTop: 8 }} />
          <Skeleton width="30%" height={12} style={{ marginTop: 8 }} />
        </View>
      </View>
    </View>
  );
};

export const SkeletonText: React.FC<{
  lines?: number;
  lastWidth?: number | `${number}%`;
  style?: ViewStyle;
}> = ({ lines = 3, lastWidth = "60%", style }) => {
  return (
    <View style={style}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? lastWidth : "100%"}
          height={14}
          style={{ marginBottom: index < lines - 1 ? 8 : 0 }}
        />
      ))}
    </View>
  );
};

export const SkeletonCircle: React.FC<{
  size?: number;
  style?: ViewStyle;
}> = ({ size = 48, style }) => {
  return (
    <Skeleton
      width={size}
      height={size}
      borderRadius={size / 2}
      style={style}
    />
  );
};

export const SkeletonMealCard: React.FC<{ style?: ViewStyle }> = ({
  style,
}) => {
  const { theme } = useUI();

  return (
    <View
      style={[
        styles.mealCard,
        { backgroundColor: theme.cardBackground },
        style,
      ]}
    >
      <Skeleton width={80} height={80} borderRadius={RADIUS.md} />
      <View style={styles.mealContent}>
        <Skeleton width="60%" height={16} />
        <Skeleton width="90%" height={14} style={{ marginTop: 8 }} />
        <Skeleton
          width="40%"
          height={24}
          borderRadius={12}
          style={{ marginTop: 12 }}
        />
      </View>
    </View>
  );
};

export const SkeletonDashboard: React.FC = () => {
  const { theme } = useUI();

  return (
    <View style={[styles.dashboard, { backgroundColor: theme.background }]}>
      <View
        style={[styles.progressCard, { backgroundColor: theme.cardBackground }]}
      >
        <View style={styles.progressHeader}>
          <Skeleton width="40%" height={18} />
          <Skeleton width={60} height={24} borderRadius={12} />
        </View>
        <SkeletonCircle
          size={120}
          style={{ alignSelf: "center", marginVertical: 16 }}
        />
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Skeleton width={50} height={24} />
            <Skeleton width={60} height={12} style={{ marginTop: 4 }} />
          </View>
          <View style={styles.statItem}>
            <Skeleton width={50} height={24} />
            <Skeleton width={60} height={12} style={{ marginTop: 4 }} />
          </View>
          <View style={styles.statItem}>
            <Skeleton width={50} height={24} />
            <Skeleton width={60} height={12} style={{ marginTop: 4 }} />
          </View>
        </View>
      </View>

      <View style={styles.quickActions}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} width={75} height={75} borderRadius={RADIUS.lg} />
        ))}
      </View>

      <Skeleton
        width="40%"
        height={18}
        style={{ marginTop: 24, marginBottom: 12 }}
      />
      <SkeletonMealCard />
      <SkeletonMealCard style={{ marginTop: 12 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    position: "relative",
  },
  shimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "50%",
    opacity: 0.5,
  },
  card: {
    padding: 16,
    borderRadius: RADIUS.lg,
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
  },
  mealCard: {
    flexDirection: "row",
    padding: 12,
    borderRadius: RADIUS.lg,
  },
  mealContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  dashboard: {
    padding: 16,
  },
  progressCard: {
    padding: 16,
    borderRadius: RADIUS.lg,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
  },
  statItem: {
    alignItems: "center",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
});

export default Skeleton;
