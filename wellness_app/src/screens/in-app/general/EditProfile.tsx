import React, { FC, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAuth } from "@context/AuthProvider";
import { useUI } from "@context/UiProvider";
import CustomText from "@components/CustomText";
import CustomButton from "@components/CustomButton";
import CustomInputTextField from "@components/CustomInputTextField";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RFValue } from "react-native-responsive-fontsize";
import userApi, { UpdateProfilePayload } from "src/services/userApi";
import { RADIUS, SHADOWS } from "@utils/colors";
import { useNavigation } from "@react-navigation/native";

const ACTIVITY_LEVELS = [
  { value: 1.2, label: "Sedentary", description: "Little or no exercise" },
  { value: 1.375, label: "Light", description: "Light exercise 1-3 days/week" },
  {
    value: 1.55,
    label: "Moderate",
    description: "Moderate exercise 3-5 days/week",
  },
  { value: 1.725, label: "Active", description: "Hard exercise 6-7 days/week" },
  {
    value: 1.9,
    label: "Very Active",
    description: "Very hard exercise, physical job",
  },
];

const EditProfile: FC = () => {
  const { token, profile, setProfile } = useAuth();
  const { theme, showToast } = useUI();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    name: profile?.name || "",
    age: profile?.age?.toString() || "",
    weight: profile?.weight?.toString() || "",
    height: profile?.height?.toString() || "",
    gender: (profile?.gender as "male" | "female") || null,
    activityLevel: profile?.activityLevel || null,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof typeof data, string>>
  >({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!data.name.trim()) newErrors.name = "Name is required";
    if (!data.age) newErrors.age = "Age is required";
    if (!data.weight) newErrors.weight = "Weight is required";
    if (!data.height) newErrors.height = "Height is required";
    if (!data.gender) newErrors.gender = "Gender is required";
    if (!data.activityLevel)
      newErrors.activityLevel = "Activity level is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !token) return;

    setLoading(true);
    try {
      const payload: UpdateProfilePayload = {
        name: data.name.trim(),
        age: parseInt(data.age),
        weight: parseFloat(data.weight),
        height: parseFloat(data.height),
        gender: data.gender!,
        activityLevel: data.activityLevel!,
      };

      const response = await userApi.updateProfile(token, payload);

      if (response.success) {
        setProfile(response.data);
        showToast({
          message: "Profile updated successfully",
          success: true,
          title: "Success",
          visible: true,
          duration: 3000,
        });
        navigation.goBack();
      }
    } catch (error: any) {
      showToast({
        message: error.message || "Failed to update profile",
        success: false,
        title: "Error",
        visible: true,
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.card,
            { backgroundColor: theme.cardBackground },
            SHADOWS.small,
          ]}
        >
          <CustomText
            font="SemiBold"
            style={[styles.sectionTitle, { color: theme.text.primary }]}
          >
            General Information
          </CustomText>

          <CustomInputTextField
            label="Name"
            placeholder="Your name"
            value={data.name}
            onChangeText={(text) => setData({ ...data, name: text })}
            errorMessage={errors.name}
          />

          <View style={{ height: 16 }} />

          <CustomInputTextField
            label="Age"
            placeholder="Your age"
            value={data.age}
            onChangeText={(text) =>
              setData({ ...data, age: text.replace(/[^0-9]/g, "") })
            }
            keyboardType="number-pad"
            errorMessage={errors.age}
          />
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: theme.cardBackground },
            SHADOWS.small,
          ]}
        >
          <CustomText
            font="SemiBold"
            style={[styles.sectionTitle, { color: theme.text.primary }]}
          >
            Metrics
          </CustomText>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <CustomInputTextField
                label="Weight (kg)"
                placeholder="0"
                value={data.weight}
                onChangeText={(text) =>
                  setData({ ...data, weight: text.replace(/[^0-9.]/g, "") })
                }
                keyboardType="decimal-pad"
                errorMessage={errors.weight}
              />
            </View>
            <View style={{ width: 16 }} />
            <View style={{ flex: 1 }}>
              <CustomInputTextField
                label="Height (cm)"
                placeholder="0"
                value={data.height}
                onChangeText={(text) =>
                  setData({ ...data, height: text.replace(/[^0-9.]/g, "") })
                }
                keyboardType="decimal-pad"
                errorMessage={errors.height}
              />
            </View>
          </View>

          <View style={{ height: 20 }} />

          <CustomText
            font="Medium"
            style={[styles.label, { color: theme.text.secondary }]}
          >
            Gender
          </CustomText>
          <View style={styles.genderRow}>
            {(["male", "female"] as const).map((g) => (
              <TouchableOpacity
                key={g}
                style={[
                  styles.genderChip,
                  {
                    backgroundColor:
                      data.gender === g ? theme.primary : `${theme.primary}10`,
                    borderColor:
                      data.gender === g
                        ? theme.primary
                        : theme.inputTextFieldBorderColor,
                  },
                ]}
                onPress={() => setData({ ...data, gender: g })}
              >
                <MaterialCommunityIcons
                  name={g === "male" ? "gender-male" : "gender-female"}
                  size={20}
                  color={data.gender === g ? "#fff" : theme.primary}
                />
                <CustomText
                  font="Medium"
                  style={{
                    color: data.gender === g ? "#fff" : theme.text.primary,
                    marginLeft: 8,
                  }}
                >
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </CustomText>
              </TouchableOpacity>
            ))}
          </View>
          {errors.gender && (
            <CustomText
              font="Regular"
              style={[styles.errorText, { color: theme.error }]}
            >
              {errors.gender}
            </CustomText>
          )}
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: theme.cardBackground },
            SHADOWS.small,
          ]}
        >
          <CustomText
            font="SemiBold"
            style={[styles.sectionTitle, { color: theme.text.primary }]}
          >
            Activity Level
          </CustomText>

          {ACTIVITY_LEVELS.map((level) => (
            <TouchableOpacity
              key={level.value}
              style={[
                styles.activityItem,
                {
                  borderColor:
                    data.activityLevel === level.value
                      ? theme.primary
                      : theme.inputTextFieldBorderColor,
                  backgroundColor:
                    data.activityLevel === level.value
                      ? `${theme.primary}10`
                      : "transparent",
                },
              ]}
              onPress={() => setData({ ...data, activityLevel: level.value })}
            >
              <View style={{ flex: 1 }}>
                <CustomText
                  font="SemiBold"
                  style={{
                    color:
                      data.activityLevel === level.value
                        ? theme.primary
                        : theme.text.primary,
                  }}
                >
                  {level.label}
                </CustomText>
                <CustomText
                  font="Regular"
                  style={{ color: theme.text.secondary, fontSize: RFValue(11) }}
                >
                  {level.description}
                </CustomText>
              </View>
              {data.activityLevel === level.value && (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={24}
                  color={theme.primary}
                />
              )}
            </TouchableOpacity>
          ))}
          {errors.activityLevel && (
            <CustomText
              font="Regular"
              style={[styles.errorText, { color: theme.error }]}
            >
              {errors.activityLevel}
            </CustomText>
          )}
        </View>

        <CustomButton
          title="Save Changes"
          onPress={handleSave}
          loading={loading}
          style={styles.saveButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    padding: 16,
    borderRadius: RADIUS.lg,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: RFValue(16),
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
  },
  label: {
    fontSize: RFValue(12),
    marginBottom: 10,
  },
  genderRow: {
    flexDirection: "row",
    gap: 12,
  },
  genderChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  saveButton: {
    marginTop: 8,
  },
  errorText: {
    fontSize: RFValue(11),
    marginTop: 6,
  },
});
