
import React, { FC, useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useAuth } from "@context/AuthProvider";
import { useUI } from "@context/UiProvider";
import CustomText from "@components/CustomText";
import CustomButton from "@components/CustomButton";
import ConfirmationModal from "@components/ConfirmationModal";
import { RFValue } from "react-native-responsive-fontsize";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import userApi from "src/services/userApi";
import authApi from "src/services/authApi";
import { RADIUS, SHADOWS } from "@utils/colors";
import SkeletonLoader from "@components/SkeletonLoader";

interface UserStats {
  totalMeals: number;
  daysTracked: number;
  memberSinceDays: number;
  dailyCalorieGoal: number;
  currentBMI: number;
}

const SkeletonProfile = () => {
  const { theme } = useUI();
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.scrollContent}>
        <View
          style={[styles.headerCard, { backgroundColor: theme.primaryLight }]}
        >
          <SkeletonLoader width={96} height={96} borderRadius={48} />
          <View style={{ height: 12 }} />
          <SkeletonLoader width={150} height={24} borderRadius={RADIUS.sm} />
          <View style={{ height: 8 }} />
          <SkeletonLoader width={180} height={16} borderRadius={RADIUS.sm} />
        </View>

        <View style={styles.statsContainer}>
          {[1, 2, 3, 4].map((i) => (
            <View
              key={i}
              style={[
                styles.statCard,
                { backgroundColor: theme.cardBackground },
              ]}
            >
              <SkeletonLoader width={32} height={32} borderRadius={16} />
              <View style={{ height: 8 }} />
              <SkeletonLoader width={50} height={24} borderRadius={RADIUS.sm} />
              <View style={{ height: 4 }} />
              <SkeletonLoader width={60} height={14} borderRadius={RADIUS.sm} />
            </View>
          ))}
        </View>

        <View
          style={[styles.infoCard, { backgroundColor: theme.cardBackground }]}
        >
          <SkeletonLoader width={140} height={20} borderRadius={RADIUS.sm} />
          <View style={{ height: 20 }} />
          {[1, 2, 3].map((i) => (
            <View key={i} style={[styles.infoRow, { marginBottom: 16 }]}>
              <View style={styles.infoItem}>
                <SkeletonLoader
                  width={60}
                  height={14}
                  borderRadius={RADIUS.sm}
                />
                <View style={{ height: 6 }} />
                <SkeletonLoader
                  width={80}
                  height={18}
                  borderRadius={RADIUS.sm}
                />
              </View>
              <View style={styles.infoItem}>
                <SkeletonLoader
                  width={60}
                  height={14}
                  borderRadius={RADIUS.sm}
                />
                <View style={{ height: 6 }} />
                <SkeletonLoader
                  width={80}
                  height={18}
                  borderRadius={RADIUS.sm}
                />
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const Profile: FC = () => {
  const { token, profile, clearToken, setProfile } = useAuth();
  const { theme, showToast } = useUI();
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);

  const fetchData = async () => {
    if (!token) return;

    try {
      const [profileRes, statsRes] = await Promise.all([
        userApi.getProfile(token),
        userApi.getStats(token),
      ]);

      if (profileRes.success) {
        setProfile(profileRes.data);
      }
      if (statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (error: any) {
      showToast({
        message: error.message || "Failed to load profile",
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
      fetchData();
    }, [token]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    setAnimationKey((prev) => prev + 1);
    fetchData();
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const closeLogoutModal = () => {
    setShowLogoutModal(false);
  };

  const confirmLogout = async () => {
    setLoggingOut(true);
    try {
      if (token) {
        await authApi.logout(token);
      }
    } catch (error) {
    } finally {
      await clearToken();
      setLoggingOut(false);
    }
  };

  const getActivityLevelLabel = (level?: number): string => {
    if (!level) return "Not set";
    if (level <= 1.2) return "Sedentary";
    if (level <= 1.375) return "Light";
    if (level <= 1.55) return "Moderate";
    if (level <= 1.725) return "Active";
    return "Very Active";
  };

  const getBMICategory = (bmi?: number): { label: string; color: string } => {
    if (!bmi) return { label: "N/A", color: theme.text.secondary };
    if (bmi < 18.5) return { label: "Underweight", color: theme.warning };
    if (bmi < 25) return { label: "Normal", color: theme.success };
    if (bmi < 30) return { label: "Overweight", color: theme.warning };
    return { label: "Obese", color: theme.error };
  };

  const bmiInfo = getBMICategory(stats?.currentBMI || profile?.bmi);

  if (loading) {
    return <SkeletonProfile />;
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
          style={[
            styles.headerCard,
            { backgroundColor: theme.primary },
            SHADOWS.medium,
          ]}
          entering={FadeInDown.delay(50).springify()}
        >
          <View style={styles.avatarContainer}>
            <MaterialCommunityIcons name="account" size={48} color="#fff" />
          </View>
          <CustomText font="Bold" style={styles.userName}>
            {profile?.name || "User"}
          </CustomText>
          <CustomText font="Regular" style={styles.userEmail}>
            {profile?.email}
          </CustomText>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate("EDIT_PROFILE")}
          >
            <MaterialCommunityIcons name="pencil" size={16} color="#fff" />
            <CustomText font="Medium" style={styles.editButtonText}>
              Edit Profile
            </CustomText>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          key={`stats-${animationKey}`}
          style={styles.statsContainer}
          entering={FadeInDown.delay(100).springify()}
        >
          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.cardBackground },
              SHADOWS.small,
            ]}
          >
            <View
              style={[
                styles.statIconCircle,
                { backgroundColor: theme.primaryLight },
              ]}
            >
              <MaterialCommunityIcons
                name="fire"
                size={24}
                color={theme.primary}
              />
            </View>
            <CustomText
              font="Bold"
              style={[styles.statValue, { color: theme.text.primary }]}
            >
              {stats?.dailyCalorieGoal || profile?.dailyCalorieGoal || 0}
            </CustomText>
            <CustomText
              font="Regular"
              style={[styles.statLabel, { color: theme.text.secondary }]}
            >
              Daily Goal
            </CustomText>
          </View>

          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.cardBackground },
              SHADOWS.small,
            ]}
          >
            <View
              style={[
                styles.statIconCircle,
                { backgroundColor: theme.successLight },
              ]}
            >
              <MaterialCommunityIcons
                name="food-variant"
                size={24}
                color={theme.success}
              />
            </View>
            <CustomText
              font="Bold"
              style={[styles.statValue, { color: theme.text.primary }]}
            >
              {stats?.totalMeals || 0}
            </CustomText>
            <CustomText
              font="Regular"
              style={[styles.statLabel, { color: theme.text.secondary }]}
            >
              Total Meals
            </CustomText>
          </View>

          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.cardBackground },
              SHADOWS.small,
            ]}
          >
            <View
              style={[
                styles.statIconCircle,
                { backgroundColor: theme.infoLight },
              ]}
            >
              <MaterialCommunityIcons
                name="calendar-check"
                size={24}
                color={theme.info}
              />
            </View>
            <CustomText
              font="Bold"
              style={[styles.statValue, { color: theme.text.primary }]}
            >
              {stats?.daysTracked || 0}
            </CustomText>
            <CustomText
              font="Regular"
              style={[styles.statLabel, { color: theme.text.secondary }]}
            >
              Days Tracked
            </CustomText>
          </View>

          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.cardBackground },
              SHADOWS.small,
            ]}
          >
            <View
              style={[styles.statIconCircle, { backgroundColor: "#F3E8FF" }]}
            >
              <MaterialCommunityIcons
                name="account-clock"
                size={24}
                color="#8B5CF6"
              />
            </View>
            <CustomText
              font="Bold"
              style={[styles.statValue, { color: theme.text.primary }]}
            >
              {stats?.memberSinceDays || 0}
            </CustomText>
            <CustomText
              font="Regular"
              style={[styles.statLabel, { color: theme.text.secondary }]}
            >
              Member Days
            </CustomText>
          </View>
        </Animated.View>

        <Animated.View
          key={`info-${animationKey}`}
          style={[
            styles.infoCard,
            { backgroundColor: theme.cardBackground },
            SHADOWS.small,
          ]}
          entering={FadeInDown.delay(150).springify()}
        >
          <CustomText
            font="SemiBold"
            style={[styles.sectionTitle, { color: theme.text.primary }]}
          >
            Body Information
          </CustomText>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <CustomText
                font="Regular"
                style={[styles.infoLabel, { color: theme.text.secondary }]}
              >
                Age
              </CustomText>
              <CustomText
                font="SemiBold"
                style={[styles.infoValue, { color: theme.text.primary }]}
              >
                {profile?.age || "N/A"} years
              </CustomText>
            </View>
            <View style={styles.infoItem}>
              <CustomText
                font="Regular"
                style={[styles.infoLabel, { color: theme.text.secondary }]}
              >
                Gender
              </CustomText>
              <CustomText
                font="SemiBold"
                style={[styles.infoValue, { color: theme.text.primary }]}
              >
                {profile?.gender
                  ? profile.gender.charAt(0).toUpperCase() +
                  profile.gender.slice(1)
                  : "N/A"}
              </CustomText>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <CustomText
                font="Regular"
                style={[styles.infoLabel, { color: theme.text.secondary }]}
              >
                Weight
              </CustomText>
              <CustomText
                font="SemiBold"
                style={[styles.infoValue, { color: theme.text.primary }]}
              >
                {profile?.weight ? `${profile.weight} kg` : "N/A"}
              </CustomText>
            </View>
            <View style={styles.infoItem}>
              <CustomText
                font="Regular"
                style={[styles.infoLabel, { color: theme.text.secondary }]}
              >
                Height
              </CustomText>
              <CustomText
                font="SemiBold"
                style={[styles.infoValue, { color: theme.text.primary }]}
              >
                {profile?.height ? `${profile.height} cm` : "N/A"}
              </CustomText>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <CustomText
                font="Regular"
                style={[styles.infoLabel, { color: theme.text.secondary }]}
              >
                BMI
              </CustomText>
              <View style={styles.bmiContainer}>
                <CustomText
                  font="SemiBold"
                  style={[styles.infoValue, { color: theme.text.primary }]}
                >
                  {(stats?.currentBMI || profile?.bmi)?.toFixed(1) || "N/A"}
                </CustomText>
                <View
                  style={[
                    styles.bmiBadge,
                    { backgroundColor: `${bmiInfo.color}20` },
                  ]}
                >
                  <CustomText
                    font="Medium"
                    style={{ color: bmiInfo.color, fontSize: RFValue(10) }}
                  >
                    {bmiInfo.label}
                  </CustomText>
                </View>
              </View>
            </View>
            <View style={styles.infoItem}>
              <CustomText
                font="Regular"
                style={[styles.infoLabel, { color: theme.text.secondary }]}
              >
                Activity Level
              </CustomText>
              <CustomText
                font="SemiBold"
                style={[styles.infoValue, { color: theme.text.primary }]}
              >
                {getActivityLevelLabel(profile?.activityLevel)}
              </CustomText>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          key={`logout-${animationKey}`}
          entering={FadeInDown.delay(200).springify()}
        >
          <CustomButton
            title="Logout"
            onPress={handleLogout}
            loading={loggingOut}
            variant="outline"
            icon="logout"
            style={styles.logoutButton}
          />
        </Animated.View>
      </ScrollView>

      <ConfirmationModal
        visible={showLogoutModal}
        onClose={closeLogoutModal}
        onConfirm={() => {
          confirmLogout();
        }}
        title="Logout"
        message="Are you sure you want to logout? You'll need to sign in again to access your account."
        confirmText="Logout"
        cancelText="Cancel"
        type="warning"
        loading={loggingOut}
      />
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerCard: {
    borderRadius: RADIUS.xl,
    padding: 28,
    alignItems: "center",
    marginBottom: 20,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  userName: {
    fontSize: RFValue(22),
    color: "#fff",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: RFValue(13),
    color: "rgba(255,255,255,0.85)",
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    padding: 16,
    borderRadius: RADIUS.lg,
    alignItems: "center",
  },
  statIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: RFValue(20),
  },
  statLabel: {
    fontSize: RFValue(11),
    marginTop: 4,
  },
  infoCard: {
    padding: 20,
    borderRadius: RADIUS.lg,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: RFValue(15),
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: RFValue(12),
    marginBottom: 6,
  },
  infoValue: {
    fontSize: RFValue(14),
  },
  bmiContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bmiBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  logoutButton: {
    marginTop: 8,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    marginTop: 16,
    gap: 6,
  },
  editButtonText: {
    color: "#fff",
    fontSize: RFValue(11),
  },
});
