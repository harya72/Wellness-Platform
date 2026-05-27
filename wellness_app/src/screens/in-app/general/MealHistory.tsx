import React, { FC, useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "@context/AuthProvider";
import { useUI } from "@context/UiProvider";
import CustomText from "@components/CustomText";
import { RFValue } from "react-native-responsive-fontsize";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import MealCard from "@components/MealCard";
import mealApi, { Meal, MealType } from "src/services/mealApi";
import { useMealRealtime } from "src/hooks/useMealRealtime";

const FILTERS: { type: MealType | "all"; label: string }[] = [
  { type: "all", label: "All" },
  { type: "breakfast", label: "Breakfast" },
  { type: "lunch", label: "Lunch" },
  { type: "dinner", label: "Dinner" },
  { type: "snack", label: "Snack" },
];

const MealHistory: FC = () => {
  const { token } = useAuth();
  const { theme, showToast } = useUI();
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<MealType | "all">("all");

  const fetchMeals = async (pageNum: number = 1, refresh: boolean = false) => {
    if (!token) return;

    try {
      const params: any = { page: pageNum, limit: 20 };
      if (selectedFilter !== "all") {
        params.mealType = selectedFilter;
      }

      const response = await mealApi.getMeals(token, params);

      if (response.success) {
        const newMeals = response.data || [];
        if (refresh || pageNum === 1) {
          setMeals(newMeals);
        } else {
          setMeals((prev) => [...prev, ...newMeals]);
        }
        const currentPage = response.pagination?.page || pageNum;
        const totalPages = response.pagination?.totalPages || 1;
        setHasMore(currentPage < totalPages);
        setPage(pageNum);
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
      setLoading(true);
      fetchMeals(1, true);
    }, [token, selectedFilter]),
  );

  useMealRealtime(
    (newComment) => {
      console.log('New comment received:', newComment);
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
    fetchMeals(1, true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchMeals(page + 1);
    }
  };

  const handleFilterChange = (type: MealType | "all") => {
    if (type !== selectedFilter) {
      setLoading(true);
      setMeals([]);
      setSelectedFilter(type);
    }
  };

  const renderFilter = ({ item }: { item: (typeof FILTERS)[0] }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        {
          backgroundColor:
            selectedFilter === item.type ? theme.primary : theme.cardBackground,
        },
      ]}
      onPress={() => handleFilterChange(item.type)}
    >
      <CustomText
        font="SemiBold"
        style={{
          color: selectedFilter === item.type ? "#fff" : theme.text.secondary,
          fontSize: RFValue(12),
        }}
      >
        {item.label}
      </CustomText>
    </TouchableOpacity>
  );

  const renderMeal = ({ item }: { item: Meal }) => (
    <MealCard
      meal={item}
      onPress={() => navigation.navigate("MEAL_DETAIL", { mealId: item.id })}
    />
  );

  const renderEmpty = () => (
    <View
      style={[styles.emptyState, { backgroundColor: theme.cardBackground }]}
    >
      <MaterialCommunityIcons
        name="food-off"
        size={48}
        color={theme.text.secondary}
      />
      <CustomText
        font="Regular"
        style={[styles.emptyText, { color: theme.text.secondary }]}
      >
        No meals found
      </CustomText>
      <CustomText
        font="Regular"
        style={[styles.emptySubtext, { color: theme.text.secondary }]}
      >
        {selectedFilter !== "all"
          ? `No ${selectedFilter} meals recorded`
          : "Start tracking your meals today"}
      </CustomText>
    </View>
  );

  const renderLoader = () => (
    <View style={styles.loaderContainer}>
      <ActivityIndicator size="large" color={theme.primary} />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        horizontal
        data={FILTERS}
        renderItem={renderFilter}
        keyExtractor={(item) => item.type}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
        style={styles.filterList}
        removeClippedSubviews
      />

      {loading ? (
        renderLoader()
      ) : (
        <FlatList
          data={meals}
          renderItem={renderMeal}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.primary}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={renderEmpty}
        />
      )}
    </View>
  );
};

export default MealHistory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterList: {
    flexGrow: 0,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  emptyState: {
    padding: 32,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 40,
  },
  emptyText: {
    fontSize: RFValue(14),
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: RFValue(12),
    marginTop: 4,
    textAlign: "center",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
