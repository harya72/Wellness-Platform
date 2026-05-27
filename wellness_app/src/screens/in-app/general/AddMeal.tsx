import React, { FC, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useAuth } from "@context/AuthProvider";
import { useUI } from "@context/UiProvider";
import CustomText from "@components/CustomText";
import CustomButton from "@components/CustomButton";
import CustomInputTextField from "@components/CustomInputTextField";
import { RFValue } from "react-native-responsive-fontsize";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import mealApi, {
  AnalysisResult,
  FoodItem,
  MealType,
} from "src/services/mealApi";

const MEAL_TYPES: {
  type: MealType;
  label: string;
  icon: string;
  color: string;
}[] = [
    {
      type: "breakfast",
      label: "Breakfast",
      icon: "weather-sunset-up",
      color: "#FF9F43",
    },
    { type: "lunch", label: "Lunch", icon: "weather-sunny", color: "#00D2D3" },
    { type: "dinner", label: "Dinner", icon: "weather-night", color: "#5F27CD" },
    { type: "snack", label: "Snack", icon: "cookie", color: "#EE5253" },
  ];

const AddMeal: FC = () => {
  const { token } = useAuth();
  const { theme, showToast } = useUI();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const [selectedMealType, setSelectedMealType] = useState<MealType>(
    route.params?.mealType || "breakfast",
  );
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null,
  );

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setAnalysisResult(null);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Please allow access to your camera.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setAnalysisResult(null);
    }
  };

  const analyzeFood = async () => {
    if (!imageUri && !description.trim()) {
      showToast({
        message: "Please upload an image or enter a description",
        success: false,
        title: "Missing Input",
        visible: true,
        duration: 3000,
      });
      return;
    }

    setAnalyzing(true);
    try {
      const result = await mealApi.analyzeFood(
        token!,
        imageUri || undefined,
        description.trim() || undefined,
      );

      if (result.success) {
        setAnalysisResult(result);
        showToast({
          message: "Food analyzed successfully!",
          success: true,
          title: "Analysis Complete",
          visible: true,
          duration: 2000,
        });
      }
    } catch (error: any) {
      showToast({
        message: error.message || "Failed to analyze food",
        success: false,
        title: "Analysis Failed",
        visible: true,
        duration: 3000,
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const quickLog = async () => {
    if (!analysisResult) return;

    setSaving(true);
    try {
      const result = await mealApi.quickLogMeal(
        token!,
        selectedMealType,
        analysisResult,
        analysisResult.imageUrl || imageUri || undefined,
      );

      if (result.success) {
        showToast({
          message: "Meal logged successfully!",
          success: true,
          title: "Success",
          visible: true,
          duration: 2000,
        });
        navigation.goBack();
      }
    } catch (error: any) {
      showToast({
        message: error.message || "Failed to log meal",
        success: false,
        title: "Error",
        visible: true,
        duration: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <CustomText
          font="SemiBold"
          style={[styles.sectionTitle, { color: theme.text.primary }]}
        >
          Meal Type
        </CustomText>
        <View style={styles.mealTypeContainer}>
          {MEAL_TYPES.map((meal) => (
            <TouchableOpacity
              key={meal.type}
              style={[
                styles.mealTypeButton,
                {
                  backgroundColor:
                    selectedMealType === meal.type
                      ? `${meal.color}20`
                      : theme.cardBackground,
                  borderColor:
                    selectedMealType === meal.type ? meal.color : "transparent",
                },
              ]}
              onPress={() => setSelectedMealType(meal.type)}
            >
              <MaterialCommunityIcons
                name={meal.icon as any}
                size={24}
                color={
                  selectedMealType === meal.type
                    ? meal.color
                    : theme.text.secondary
                }
              />
              <CustomText
                font="Regular"
                style={{
                  color:
                    selectedMealType === meal.type
                      ? meal.color
                      : theme.text.secondary,
                  fontSize: RFValue(11),
                  marginTop: 4,
                }}
              >
                {meal.label}
              </CustomText>
            </TouchableOpacity>
          ))}
        </View>

        <CustomText
          font="SemiBold"
          style={[
            styles.sectionTitle,
            { color: theme.text.primary, marginTop: 24 },
          ]}
        >
          Food Image
        </CustomText>
        <View style={styles.imageSection}>
          {imageUri ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              <TouchableOpacity
                style={[
                  styles.removeImageButton,
                  { backgroundColor: theme.red },
                ]}
                onPress={() => {
                  setImageUri(null);
                  setAnalysisResult(null);
                }}
              >
                <MaterialCommunityIcons name="close" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.uploadButtons}>
              <TouchableOpacity
                style={[
                  styles.uploadButton,
                  { backgroundColor: theme.cardBackground },
                ]}
                onPress={takePhoto}
              >
                <MaterialCommunityIcons
                  name="camera"
                  size={32}
                  color={theme.primary}
                />
                <CustomText
                  font="Regular"
                  style={[styles.uploadText, { color: theme.text.secondary }]}
                >
                  Take Photo
                </CustomText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.uploadButton,
                  { backgroundColor: theme.cardBackground },
                ]}
                onPress={pickImage}
              >
                <MaterialCommunityIcons
                  name="image"
                  size={32}
                  color={theme.primary}
                />
                <CustomText
                  font="Regular"
                  style={[styles.uploadText, { color: theme.text.secondary }]}
                >
                  Gallery
                </CustomText>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={{ marginTop: 24 }}>
          <CustomInputTextField
            label="Description (Optional)"
            placeholder="e.g., Chicken salad with olive oil dressing"
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </View>

        {!analysisResult && (
          <CustomButton
            title={analyzing ? "Analyzing..." : "Analyze Food with AI"}
            onPress={analyzeFood}
            loading={analyzing}
            icon="brain"
            iconColor="#fff"
            iconSize={20}
            style={{ marginTop: 24 }}
          />
        )}

        {analysisResult && (
          <View
            style={[
              styles.resultCard,
              { backgroundColor: theme.cardBackground },
            ]}
          >
            <View style={styles.resultHeader}>
              <MaterialCommunityIcons
                name="check-circle"
                size={24}
                color={theme.green}
              />
              <CustomText
                font="SemiBold"
                style={[styles.resultTitle, { color: theme.text.primary }]}
              >
                Analysis Result
              </CustomText>
            </View>

            <CustomText
              font="Regular"
              style={[
                styles.resultDescription,
                { color: theme.text.secondary },
              ]}
            >
              {analysisResult?.mealDescription || "No description available"}
            </CustomText>

            <View style={styles.foodItemsContainer}>
              {(analysisResult?.foodItems || []).map((item, index) => (
                <View key={index} style={styles.foodItem}>
                  <View style={styles.foodItemInfo}>
                    <CustomText
                      font="SemiBold"
                      style={{
                        color: theme.text.primary,
                        fontSize: RFValue(13),
                      }}
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

            <View
              style={[styles.totalRow, { borderTopColor: theme.dividerColor }]}
            >
              <CustomText
                font="Bold"
                style={{ color: theme.text.primary, fontSize: RFValue(14) }}
              >
                Total
              </CustomText>
              <CustomText
                font="Bold"
                style={{ color: theme.primary, fontSize: RFValue(14) }}
              >
                {analysisResult?.totalNutrition?.calories || 0} kcal
              </CustomText>
            </View>

            <View style={styles.macroSummary}>
              <View style={styles.macroItem}>
                <CustomText
                  font="Regular"
                  style={{ color: theme.text.secondary, fontSize: RFValue(11) }}
                >
                  Protein
                </CustomText>
                <CustomText
                  font="SemiBold"
                  style={{ color: theme.text.primary, fontSize: RFValue(12) }}
                >
                  {analysisResult?.totalNutrition?.protein || 0}g
                </CustomText>
              </View>
              <View style={styles.macroItem}>
                <CustomText
                  font="Regular"
                  style={{ color: theme.text.secondary, fontSize: RFValue(11) }}
                >
                  Carbs
                </CustomText>
                <CustomText
                  font="SemiBold"
                  style={{ color: theme.text.primary, fontSize: RFValue(12) }}
                >
                  {analysisResult?.totalNutrition?.carbs || 0}g
                </CustomText>
              </View>
              <View style={styles.macroItem}>
                <CustomText
                  font="Regular"
                  style={{ color: theme.text.secondary, fontSize: RFValue(11) }}
                >
                  Fats
                </CustomText>
                <CustomText
                  font="SemiBold"
                  style={{ color: theme.text.primary, fontSize: RFValue(12) }}
                >
                  {analysisResult?.totalNutrition?.fats || 0}g
                </CustomText>
              </View>
            </View>

            <CustomButton
              title={saving ? "Saving..." : "Quick Log Meal"}
              onPress={quickLog}
              loading={saving}
              style={{ marginTop: 16 }}
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddMeal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: RFValue(14),
    marginBottom: 12,
  },
  mealTypeContainer: {
    flexDirection: "row",
    gap: 8,
  },
  mealTypeButton: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
  },
  imageSection: {
    width: "100%",
  },
  uploadButtons: {
    flexDirection: "row",
    gap: 12,
  },
  uploadButton: {
    flex: 1,
    alignItems: "center",
    padding: 24,
    borderRadius: 12,
  },
  uploadText: {
    fontSize: RFValue(12),
    marginTop: 8,
  },
  imagePreviewContainer: {
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  resultCard: {
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: RFValue(16),
  },
  resultDescription: {
    fontSize: RFValue(13),
    marginBottom: 16,
  },
  foodItemsContainer: {
    gap: 8,
  },
  foodItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  foodItemInfo: {
    flex: 1,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
  },
  macroSummary: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
    paddingTop: 12,
  },
  macroItem: {
    alignItems: "center",
  },
});
