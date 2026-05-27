
import React, { FC, useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Pressable,
  ScrollView,
  Image,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useAuth } from "@context/AuthProvider";
import CustomButton from "@components/CustomButton";
import CustomText from "@components/CustomText";
import { useUI } from "@context/UiProvider";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { RFValue } from "react-native-responsive-fontsize";
import CustomInputTextField from "@components/CustomInputTextField";
import authApi from "src/services/authApi";
import notificationService from "src/services/notificationService";
import { RADIUS, SHADOWS } from "@utils/colors";

const Login: FC = () => {
  const { storeToken, setProfile } = useAuth();
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast, theme } = useUI();
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    Keyboard.dismiss();

    if (!validate()) return;

    setLoading(true);
    try {
      const response = await authApi.login({
        email: email.toLowerCase().trim(),
        password,
      });

      if (response.success && response.data.token) {
        setProfile(response.data.user);
        await storeToken(response.data.token);

        notificationService.initializeNotifications(response.data.token, true);

        showToast({
          message: "Welcome back!",
          success: true,
          title: "Login Successful",
          visible: true,
          duration: 3000,
        });
      }
    } catch (error: any) {
      showToast({
        message: error.message || "Invalid credentials",
        success: false,
        title: "Login Failed",
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
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={styles.brandingContainer}
          entering={FadeInUp.delay(100).springify()}
        >
          <View
            style={[styles.logoCircle, { backgroundColor: theme.primaryLight }]}
          >
            <MaterialCommunityIcons
              name="food-apple"
              size={48}
              color={theme.primary}
            />
          </View>
          <CustomText
            font="Bold"
            style={[styles.appName, { color: theme.primary }]}
          >
            CalorieTracker
          </CustomText>
          <CustomText
            font="Regular"
            style={[styles.tagline, { color: theme.text.secondary }]}
          >
            Track your nutrition journey
          </CustomText>
        </Animated.View>

        <Animated.View
          style={[
            styles.card,
            { backgroundColor: theme.cardBackground },
            SHADOWS.medium,
          ]}
          entering={FadeInDown.delay(200).springify()}
        >
          <CustomText
            font="Bold"
            style={[styles.welcomeText, { color: theme.text.primary }]}
          >
            Welcome Back
          </CustomText>
          <CustomText
            font="Regular"
            style={[styles.welcomeSubtext, { color: theme.text.secondary }]}
          >
            Sign in to continue tracking
          </CustomText>

          <View style={styles.formContainer}>
            <CustomInputTextField
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              errorMessage={errors.email}
              leftIcon="email-outline"
            />

            <View style={{ height: 16 }} />

            <CustomInputTextField
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password)
                  setErrors({ ...errors, password: undefined });
              }}
              secureEntry
              errorMessage={errors.password}
              leftIcon="lock-outline"
            />

            <View style={{ height: 24 }} />

            <CustomButton
              title="Login"
              onPress={handleLogin}
              loading={loading}
              icon="login"
            />
          </View>
        </Animated.View>

        <Animated.View
          style={styles.signUpContainer}
          entering={FadeInDown.delay(300).springify()}
        >
          <Pressable
            onPress={() => navigation.navigate("REGISTER")}
            style={styles.signUpButton}
          >
            <CustomText
              font="Regular"
              style={[styles.signUpText, { color: theme.text.secondary }]}
            >
              Don't have an account?{" "}
            </CustomText>
            <CustomText
              font="SemiBold"
              style={[styles.signUpLink, { color: theme.primary }]}
            >
              Sign Up
            </CustomText>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  brandingContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  appName: {
    fontSize: RFValue(26),
    marginBottom: 4,
  },
  tagline: {
    fontSize: RFValue(13),
  },
  card: {
    borderRadius: RADIUS.xl,
    padding: 24,
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: RFValue(22),
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: RFValue(13),
    marginBottom: 24,
  },
  formContainer: {
    width: "100%",
  },
  signUpContainer: {
    alignItems: "center",
  },
  signUpButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  signUpText: {
    fontSize: RFValue(13),
  },
  signUpLink: {
    fontSize: RFValue(13),
  },
});
