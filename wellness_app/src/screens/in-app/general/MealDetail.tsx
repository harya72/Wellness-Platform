import React, { FC, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "@context/AuthProvider";
import { useUI } from "@context/UiProvider";
import CustomText from "@components/CustomText";
import CustomButton from "@components/CustomButton";
import ConfirmationModal from "@components/ConfirmationModal";
import { RFValue } from "react-native-responsive-fontsize";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import mealApi, { Meal } from "src/services/mealApi";
import { useMealRealtime } from "src/hooks/useMealRealtime";

const getMealColor = (mealType: string): string => {
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
      return "#006FAE";
  }
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

const MealDetail: FC = () => {
  const { token } = useAuth();
  const { theme, showToast } = useUI();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { mealId } = route.params;

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [meal, setMeal] = useState<Meal | null>(null);

  useEffect(() => {
    fetchMeal();
  }, [mealId]);

  const fetchMeal = async () => {
    if (!token || !mealId) return;

    try {
      const response = await mealApi.getMealById(token, mealId);
      if (response.success) {
        setMeal(response.data.meal);
      }
    } catch (error: any) {
      showToast({
        message: error.message || "Failed to load meal",
        success: false,
        title: "Error",
        visible: true,
        duration: 3000,
      });
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useMealRealtime(
    (newComment) => {
      if (meal && newComment.mealId === meal.id) {
        setMeal((current) => current ? {
          ...current,
          comments: [...(current.comments || []), newComment]
        } : null);
      }
    },
    (updatedMeal) => {
      if (meal && updatedMeal.id === meal.id) {
        setMeal((current) => current ? { ...current, ...updatedMeal } : null);
      }
    }
  );

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const confirmDelete = async () => {
    if (!token || !mealId) return;

    setDeleting(true);
    try {
      const response = await mealApi.deleteMeal(token, mealId);
      if (response.success) {
        setShowDeleteModal(false);
        showToast({
          message: "Meal deleted successfully",
          success: true,
          title: "Deleted",
          visible: true,
          duration: 2000,
        });
        navigation.goBack();
      }
    } catch (error: any) {
      showToast({
        message: error.message || "Failed to delete meal",
        success: false,
        title: "Error",
        visible: true,
        duration: 3000,
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: "#fff" },
        ]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!meal) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: theme.background },
        ]}
      >
        <CustomText font="Regular" style={{ color: theme.text.secondary }}>
          Meal not found
        </CustomText>
      </View>
    );
  }

  const mealColor = getMealColor(meal.mealType);
  const formattedDate = new Date(meal.mealDate).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = new Date(meal.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {meal.imageUrl && (
          <Image source={{ uri: meal.imageUrl }} style={styles.heroImage} />
        )}

        <View style={styles.header}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={[styles.mealTypeBadge, { backgroundColor: mealColor }]}>
              <CustomText font="SemiBold" style={styles.mealTypeText}>
                {meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}
              </CustomText>
            </View>
            <View style={[styles.mealTypeBadge, { backgroundColor: getStatusColor(meal.status) }]}>
              <CustomText font="SemiBold" style={styles.mealTypeText}>
                {getStatusText(meal.status)}
              </CustomText>
            </View>
          </View>
          <CustomText
            font="Regular"
            style={[styles.dateText, { color: theme.text.secondary }]}
          >
            {formattedDate} at {formattedTime}
          </CustomText>
        </View>

        {meal.description && (
          <View
            style={[styles.section, { backgroundColor: theme.cardBackground }]}
          >
            <CustomText
              font="SemiBold"
              style={[styles.sectionTitle, { color: theme.text.primary }]}
            >
              Description
            </CustomText>
            <CustomText
              font="Regular"
              style={[styles.description, { color: theme.text.secondary }]}
            >
              {meal.description}
            </CustomText>
          </View>
        )}

        <View style={[styles.caloriesCard, { backgroundColor: mealColor }]}>
          <MaterialCommunityIcons name="fire" size={32} color="#fff" />
          <View style={styles.caloriesContent}>
            <CustomText font="Bold" style={styles.caloriesValue}>
              {meal.totalCalories}
            </CustomText>
            <CustomText font="Regular" style={styles.caloriesLabel}>
              Calories
            </CustomText>
          </View>
        </View>

        <View
          style={[styles.section, { backgroundColor: theme.cardBackground }]}
        >
          <CustomText
            font="SemiBold"
            style={[styles.sectionTitle, { color: theme.text.primary }]}
          >
            Nutrition Info
          </CustomText>
          <View style={styles.macrosGrid}>
            <View style={styles.macroItem}>
              <CustomText
                font="Bold"
                style={{ color: "#FF6B6B", fontSize: RFValue(18) }}
              >
                {meal.protein?.toFixed(1) || 0}g
              </CustomText>
              <CustomText
                font="Regular"
                style={{ color: theme.text.secondary, fontSize: RFValue(12) }}
              >
                Protein
              </CustomText>
            </View>
            <View style={styles.macroItem}>
              <CustomText
                font="Bold"
                style={{ color: "#4ECDC4", fontSize: RFValue(18) }}
              >
                {meal.carbs?.toFixed(1) || 0}g
              </CustomText>
              <CustomText
                font="Regular"
                style={{ color: theme.text.secondary, fontSize: RFValue(12) }}
              >
                Carbs
              </CustomText>
            </View>
            <View style={styles.macroItem}>
              <CustomText
                font="Bold"
                style={{ color: "#FFE66D", fontSize: RFValue(18) }}
              >
                {meal.fats?.toFixed(1) || 0}g
              </CustomText>
              <CustomText
                font="Regular"
                style={{ color: theme.text.secondary, fontSize: RFValue(12) }}
              >
                Fats
              </CustomText>
            </View>
            {meal.fiber !== undefined && meal.fiber !== null && (
              <View style={styles.macroItem}>
                <CustomText
                  font="Bold"
                  style={{ color: theme.green, fontSize: RFValue(18) }}
                >
                  {meal.fiber.toFixed(1)}g
                </CustomText>
                <CustomText
                  font="Regular"
                  style={{ color: theme.text.secondary, fontSize: RFValue(12) }}
                >
                  Fiber
                </CustomText>
              </View>
            )}
          </View>
        </View>

        {meal.foodItems && meal.foodItems.length > 0 && (
          <View
            style={[styles.section, { backgroundColor: theme.cardBackground }]}
          >
            <CustomText
              font="SemiBold"
              style={[styles.sectionTitle, { color: theme.text.primary }]}
            >
              Food Items
            </CustomText>
            {meal.foodItems.map((item, index) => (
              <View
                key={item.id || index}
                style={[
                  styles.foodItem,
                  index < meal.foodItems.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: theme.dividerColor,
                  },
                ]}
              >
                <View style={styles.foodItemInfo}>
                  <CustomText
                    font="SemiBold"
                    style={{ color: theme.text.primary, fontSize: RFValue(13) }}
                  >
                    {item.foodName}
                  </CustomText>
                  <CustomText
                    font="Regular"
                    style={{
                      color: theme.text.secondary,
                      fontSize: RFValue(11),
                    }}
                  >
                    {item.quantity} {item.unit}
                  </CustomText>
                </View>
                <CustomText
                  font="SemiBold"
                  style={{ color: theme.primary, fontSize: RFValue(13) }}
                >
                  {item.calories} kcal
                </CustomText>
              </View>
            ))}
          </View>
        )}

        {meal.comments && meal.comments.length > 0 && (
          <View
            style={[styles.section, { backgroundColor: theme.cardBackground }]}
          >
            <CustomText
              font="SemiBold"
              style={[styles.sectionTitle, { color: theme.text.primary }]}
            >
              Admin Comments ({meal.comments.length})
            </CustomText>
            {meal.comments.map((comment, index) => (
              <View
                key={comment.id || index}
                style={[
                  styles.commentItem,
                  index < meal.comments!.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: theme.dividerColor,
                  },
                ]}
              >
                <View style={styles.commentHeader}>
                  <CustomText font="SemiBold" style={{ color: theme.primary, fontSize: RFValue(13) }}>
                    {comment.authorName || 'Admin'}
                  </CustomText>
                  <CustomText font="Regular" style={{ color: theme.text.secondary, fontSize: RFValue(11) }}>
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </CustomText>
                </View>
                <CustomText font="Regular" style={{ color: theme.text.primary, fontSize: RFValue(13), marginTop: 4 }}>
                  {comment.body}
                </CustomText>
              </View>
            ))}
          </View>
        )}

        <CustomButton
          title="Delete Meal"
          onPress={handleDelete}
          variant="outline"
          icon="delete"
          style={{ marginTop: 24, marginBottom: 40 }}
        />
      </ScrollView>

      <ConfirmationModal
        visible={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Delete Meal"
        message="Are you sure you want to delete this meal? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={deleting}
      />
    </>
  );
};

export default MealDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 16,
  },
  heroImage: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    marginBottom: 16,
  },
  header: {
    marginBottom: 16,
  },
  mealTypeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 8,
  },
  mealTypeText: {
    color: "#fff",
    fontSize: RFValue(12),
  },
  dateText: {
    fontSize: RFValue(13),
  },
  section: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: RFValue(14),
    marginBottom: 12,
  },
  description: {
    fontSize: RFValue(13),
    lineHeight: 20,
  },
  caloriesCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    gap: 16,
  },
  caloriesContent: {
    flex: 1,
  },
  caloriesValue: {
    fontSize: RFValue(28),
    color: "#fff",
  },
  caloriesLabel: {
    fontSize: RFValue(14),
    color: "rgba(255,255,255,0.8)",
  },
  macrosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  macroItem: {
    alignItems: "center",
    minWidth: 70,
  },
  foodItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  foodItemInfo: {
    flex: 1,
  },
  commentItem: {
    paddingVertical: 12,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
