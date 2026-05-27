import React, { FC, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAuth } from "@context/AuthProvider";
import CustomButton from "@components/CustomButton";
import CustomText from "@components/CustomText";
import { useUI } from "@context/UiProvider";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RFValue } from "react-native-responsive-fontsize";
import CustomInputTextField from "@components/CustomInputTextField";
import userApi from "src/services/userApi";
import notificationService from "src/services/notificationService";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface OnboardingData {
  age: string;
  weight: string;
  height: string;
  gender: "male" | "female" | null;
  activityLevel: number | null;
  goal: "lose" | "gain" | "maintain" | null;
}

const GOALS = [
  { value: "lose", label: "Lose Weight", icon: "trending-down" },
  { value: "maintain", label: "Maintain Weight", icon: "scale-balance" },
  { value: "gain", label: "Gain Weight", icon: "trending-up" },
];

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

const Onboarding: FC = () => {
  const { token, setProfile } = useAuth();
  const { showToast, theme } = useUI();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const [data, setData] = useState<OnboardingData>({
    age: "",
    weight: "",
    height: "",
    gender: null,
    activityLevel: null,
    goal: null,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof OnboardingData, string>>
  >({});

  const totalSteps = 5;

  const animateSlide = (toStep: number) => {
    Animated.spring(slideAnim, {
      toValue: -toStep * SCREEN_WIDTH,
      useNativeDriver: true,
      tension: 50,
      friction: 10,
    }).start();
  };

  const validateStep = (step: number): boolean => {
    const newErrors: typeof errors = {};

    switch (step) {
      case 0:
        if (!data.age) newErrors.age = "Age is required";
        else if (parseInt(data.age) < 13 || parseInt(data.age) > 120)
          newErrors.age = "Age must be between 13-120";
        break;
      case 1:
        if (!data.weight) newErrors.weight = "Weight is required";
        else if (parseFloat(data.weight) < 20 || parseFloat(data.weight) > 500)
          newErrors.weight = "Weight must be between 20-500 kg";
        if (!data.height) newErrors.height = "Height is required";
        else if (parseFloat(data.height) < 50 || parseFloat(data.height) > 300)
          newErrors.height = "Height must be between 50-300 cm";
        break;
      case 2:
        if (!data.gender) newErrors.gender = "Please select your gender";
        break;
      case 3:
        if (!data.activityLevel)
          newErrors.activityLevel = "Please select your activity level";
        break;
      case 4:
        if (!data.goal) newErrors.goal = "Please select your goal";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;

    if (currentStep < totalSteps - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      animateSlide(nextStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      animateSlide(prevStep);
    }
  };

  const handleComplete = async () => {
    if (!validateStep(currentStep)) return;

    setLoading(true);
    try {
      const response = await userApi.completeOnboarding(token as string, {
        age: parseInt(data.age),
        weight: parseFloat(data.weight),
        height: parseFloat(data.height),
        gender: data.gender!,
        activityLevel: data.activityLevel!,
        goal: data.goal!,
      });

      if (response.success) {
        setProfile(response.data.user);

        notificationService.initializeNotifications(token as string, true);
        showToast({
          message: `Your daily goal is ${response.data.healthMetrics.dailyCalorieGoal} calories`,
          success: true,
          title: "Profile Complete!",
          visible: true,
          duration: 4000,
        });
      }
    } catch (error: any) {
      showToast({
        message: error.message || "Failed to complete onboarding",
        success: false,
        title: "Error",
        visible: true,
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      {Array.from({ length: totalSteps }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.progressDot,
            {
              backgroundColor:
                i <= currentStep
                  ? theme.primary
                  : theme.inputTextFieldBorderColor,
              flex: 1,
            },
          ]}
        />
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: `${theme.primary}20` },
        ]}
      >
        <MaterialCommunityIcons
          name="account"
          size={48}
          color={theme.primary}
        />
      </View>
      <CustomText
        font="Bold"
        style={[styles.stepTitle, { color: theme.text.primary }]}
      >
        Let's get to know you
      </CustomText>
      <CustomText
        font="Regular"
        style={[styles.stepSubtitle, { color: theme.text.secondary }]}
      >
        We'll use this to personalize your experience
      </CustomText>

      <View style={styles.formSection}>
        <CustomInputTextField
          label="Your Age"
          placeholder="Enter your age"
          value={data.age}
          onChangeText={(text) => {
            setData({ ...data, age: text.replace(/[^0-9]/g, "") });
            if (errors.age) setErrors({ ...errors, age: undefined });
          }}
          keyboardType="number-pad"
          errorMessage={errors.age}
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: `${theme.primary}20` },
        ]}
      >
        <MaterialCommunityIcons
          name="scale-bathroom"
          size={48}
          color={theme.primary}
        />
      </View>
      <CustomText
        font="Bold"
        style={[styles.stepTitle, { color: theme.text.primary }]}
      >
        Your body metrics
      </CustomText>
      <CustomText
        font="Regular"
        style={[styles.stepSubtitle, { color: theme.text.secondary }]}
      >
        We'll calculate your calorie needs
      </CustomText>

      <View style={styles.formSection}>
        <CustomInputTextField
          label="Weight (kg)"
          placeholder="Enter your weight"
          value={data.weight}
          onChangeText={(text) => {
            setData({ ...data, weight: text.replace(/[^0-9.]/g, "") });
            if (errors.weight) setErrors({ ...errors, weight: undefined });
          }}
          keyboardType="decimal-pad"
          errorMessage={errors.weight}
        />

        <View style={{ height: 16 }} />

        <CustomInputTextField
          label="Height (cm)"
          placeholder="Enter your height"
          value={data.height}
          onChangeText={(text) => {
            setData({ ...data, height: text.replace(/[^0-9.]/g, "") });
            if (errors.height) setErrors({ ...errors, height: undefined });
          }}
          keyboardType="decimal-pad"
          errorMessage={errors.height}
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: `${theme.primary}20` },
        ]}
      >
        <MaterialCommunityIcons
          name="gender-male-female"
          size={48}
          color={theme.primary}
        />
      </View>
      <CustomText
        font="Bold"
        style={[styles.stepTitle, { color: theme.text.primary }]}
      >
        Select your gender
      </CustomText>
      <CustomText
        font="Regular"
        style={[styles.stepSubtitle, { color: theme.text.secondary }]}
      >
        This helps us calculate your BMR accurately
      </CustomText>

      <View style={styles.genderContainer}>
        <TouchableOpacity
          style={[
            styles.genderCard,
            {
              borderColor:
                data.gender === "male"
                  ? theme.primary
                  : theme.inputTextFieldBorderColor,
              backgroundColor:
                data.gender === "male" ? `${theme.primary}10` : "transparent",
            },
          ]}
          onPress={() => {
            setData({ ...data, gender: "male" });
            if (errors.gender) setErrors({ ...errors, gender: undefined });
          }}
        >
          <MaterialCommunityIcons
            name="gender-male"
            size={48}
            color={
              data.gender === "male" ? theme.primary : theme.text.secondary
            }
          />
          <CustomText
            font="SemiBold"
            style={{
              color:
                data.gender === "male" ? theme.primary : theme.text.primary,
              marginTop: 8,
            }}
          >
            Male
          </CustomText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.genderCard,
            {
              borderColor:
                data.gender === "female"
                  ? theme.primary
                  : theme.inputTextFieldBorderColor,
              backgroundColor:
                data.gender === "female" ? `${theme.primary}10` : "transparent",
            },
          ]}
          onPress={() => {
            setData({ ...data, gender: "female" });
            if (errors.gender) setErrors({ ...errors, gender: undefined });
          }}
        >
          <MaterialCommunityIcons
            name="gender-female"
            size={48}
            color={
              data.gender === "female" ? theme.primary : theme.text.secondary
            }
          />
          <CustomText
            font="SemiBold"
            style={{
              color:
                data.gender === "female" ? theme.primary : theme.text.primary,
              marginTop: 8,
            }}
          >
            Female
          </CustomText>
        </TouchableOpacity>
      </View>
      {errors.gender && (
        <CustomText
          font="Regular"
          style={[styles.errorText, { color: theme.red }]}
        >
          {errors.gender}
        </CustomText>
      )}
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: `${theme.primary}20` },
        ]}
      >
        <MaterialCommunityIcons
          name="run-fast"
          size={48}
          color={theme.primary}
        />
      </View>
      <CustomText
        font="Bold"
        style={[styles.stepTitle, { color: theme.text.primary }]}
      >
        Activity Level
      </CustomText>
      <CustomText
        font="Regular"
        style={[styles.stepSubtitle, { color: theme.text.secondary }]}
      >
        How active are you on a typical week?
      </CustomText>

      <ScrollView
        style={styles.activityList}
        showsVerticalScrollIndicator={false}
      >
        {ACTIVITY_LEVELS.map((level) => (
          <TouchableOpacity
            key={level.value}
            style={[
              styles.activityCard,
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
            onPress={() => {
              setData({ ...data, activityLevel: level.value });
              if (errors.activityLevel)
                setErrors({ ...errors, activityLevel: undefined });
            }}
          >
            <View style={styles.activityContent}>
              <CustomText
                font="SemiBold"
                style={{
                  color:
                    data.activityLevel === level.value
                      ? theme.primary
                      : theme.text.primary,
                  fontSize: RFValue(14),
                }}
              >
                {level.label}
              </CustomText>
              <CustomText
                font="Regular"
                style={{
                  color: theme.text.secondary,
                  fontSize: RFValue(12),
                  marginTop: 2,
                }}
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
      </ScrollView>
      {errors.activityLevel && (
        <CustomText
          font="Regular"
          style={[styles.errorText, { color: theme.red }]}
        >
          {errors.activityLevel}
        </CustomText>
      )}
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContent}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: `${theme.primary}20` },
        ]}
      >
        <MaterialCommunityIcons
          name="bullseye-arrow"
          size={48}
          color={theme.primary}
        />
      </View>
      <CustomText
        font="Bold"
        style={[styles.stepTitle, { color: theme.text.primary }]}
      >
        What's your goal?
      </CustomText>
      <CustomText
        font="Regular"
        style={[styles.stepSubtitle, { color: theme.text.secondary }]}
      >
        Select your primary fitness objective
      </CustomText>

      <View style={styles.activityList}>
        {GOALS.map((goalOption) => (
          <TouchableOpacity
            key={goalOption.value}
            style={[
              styles.activityCard,
              {
                backgroundColor: theme.surface,
                borderColor:
                  data.goal === goalOption.value
                    ? theme.primary
                    : theme.cardBackground,
              },
            ]}
            onPress={() => {
              setData({ ...data, goal: goalOption.value as any });
              if (errors.goal)
                setErrors({ ...errors, goal: undefined });
            }}
          >
            <MaterialCommunityIcons
              name={goalOption.icon as any}
              size={24}
              color={
                data.goal === goalOption.value
                  ? theme.primary
                  : theme.text.secondary
              }
              style={{ marginRight: 16 }}
            />
            <View >
              <CustomText
                font="SemiBold"
                style={{
                  color: theme.text.primary,
                  fontSize: RFValue(14),
                }}
              >
                {goalOption.label}
              </CustomText>
            </View>
            {data.goal === goalOption.value && (
              <MaterialCommunityIcons
                name="check-circle"
                size={24}
                color={theme.primary}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>
      {errors.goal && (
        <CustomText
          font="Regular"
          style={[styles.errorText, { color: theme.red }]}
        >
          {errors.goal}
        </CustomText>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {renderProgressBar()}

      <View style={styles.stepsWrapper}>
        <Animated.View
          style={[
            styles.stepsContainer,
            {
              transform: [{ translateX: slideAnim }],
              width: SCREEN_WIDTH * totalSteps,
            },
          ]}
        >
          <View style={{ width: SCREEN_WIDTH }}>{renderStep1()}</View>
          <View style={{ width: SCREEN_WIDTH }}>{renderStep2()}</View>
          <View style={{ width: SCREEN_WIDTH }}>{renderStep3()}</View>
          <View style={{ width: SCREEN_WIDTH }}>{renderStep4()}</View>
          <View style={{ width: SCREEN_WIDTH }}>{renderStep5()}</View>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <View style={styles.buttonRow}>
          {currentStep > 0 && (
            <CustomButton
              title="Back"
              onPress={handleBack}
              color={theme.buttonSecondary}
              style={[styles.backButton]}
              textColor={theme.text.primary}
            />
          )}
          <CustomButton
            title={
              loading
                ? "Setting up..."
                : currentStep === totalSteps - 1
                  ? "Complete"
                  : "Next"
            }
            onPress={
              currentStep === totalSteps - 1 ? handleComplete : handleNext
            }
            loading={loading}
            style={[styles.nextButton, currentStep === 0 && { flex: 1 }]}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Onboarding;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingTop: 60,
    gap: 8,
  },
  progressDot: {
    height: 4,
    borderRadius: 2,
  },
  stepsWrapper: {
    flex: 1,
    overflow: "hidden",
  },
  stepsContainer: {
    flexDirection: "row",
    flex: 1,
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: RFValue(22),
    textAlign: "center",
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: RFValue(14),
    textAlign: "center",
    marginBottom: 32,
  },
  formSection: {
    width: "100%",
  },
  genderContainer: {
    flexDirection: "row",
    gap: 16,
    justifyContent: "center",
  },
  genderCard: {
    width: 120,
    height: 120,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  activityList: {
    flex: 1,
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
  },
  activityContent: {
    flex: 1,
  },
  errorText: {
    fontSize: RFValue(12),
    textAlign: "center",
    marginTop: 8,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  backButton: {
    flex: 1,
    height: 52,
  },
  nextButton: {
    flex: 2,
    height: 52,
  },
});
