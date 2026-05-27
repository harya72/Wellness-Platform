

import React, { FC, useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Pressable,
  ScrollView,
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
import { RADIUS, SHADOWS } from "@utils/colors";

const Register: FC = () => {
  const { storeToken, setProfile } = useAuth();
  const navigation = useNavigation<any>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast, theme } = useUI();
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password =
        "Password must contain uppercase, lowercase, and number";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    Keyboard.dismiss();

    if (!validate()) return;

    setLoading(true);
    try {
      const response = await authApi.register({
        email: email.toLowerCase().trim(),
        password,
        name: name.trim(),
      });

      if (response.success && response.data.token) {
        setProfile(response.data.user);
        await storeToken(response.data.token);

        showToast({
          message: "Account created successfully!",
          success: true,
          title: "Welcome!",
          visible: true,
          duration: 3000,
        });
      }
    } catch (error: any) {
      showToast({
        message: error.message || "Registration failed",
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
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={styles.headerContainer}
          entering={FadeInUp.delay(100).springify()}
        >
          <View
            style={[styles.iconCircle, { backgroundColor: theme.primaryLight }]}
          >
            <MaterialCommunityIcons
              name="account-plus"
              size={48}
              color={theme.primary}
            />
          </View>
          <CustomText
            font="Bold"
            style={[styles.title, { color: theme.text.primary }]}
          >
            Create Account
          </CustomText>
          <CustomText
            font="Regular"
            style={[styles.subtitle, { color: theme.text.secondary }]}
          >
            Start your health journey today
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
          <CustomInputTextField
            label="Full Name"
            placeholder="Enter your full name"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errors.name) setErrors({ ...errors, name: undefined });
            }}
            autoCapitalize="words"
            errorMessage={errors.name}
            leftIcon="account-outline"
          />

          <View style={{ height: 16 }} />

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

          <View style={{ height: 16 }} />

          <CustomInputTextField
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.confirmPassword)
                setErrors({ ...errors, confirmPassword: undefined });
            }}
            secureEntry
            errorMessage={errors.confirmPassword}
            leftIcon="lock-check-outline"
          />

          <View style={{ height: 24 }} />

          <CustomButton
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            icon="account-plus"
          />
        </Animated.View>

        <Animated.View
          style={styles.loginContainer}
          entering={FadeInDown.delay(300).springify()}
        >
          <Pressable
            onPress={() => navigation.navigate("LOGIN")}
            style={styles.loginButton}
          >
            <CustomText
              font="Regular"
              style={[styles.loginText, { color: theme.text.secondary }]}
            >
              Already have an account?{" "}
            </CustomText>
            <CustomText
              font="SemiBold"
              style={[styles.loginLink, { color: theme.primary }]}
            >
              Login
            </CustomText>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: RFValue(24),
    marginBottom: 4,
  },
  subtitle: {
    fontSize: RFValue(13),
  },
  card: {
    borderRadius: RADIUS.xl,
    padding: 24,
    marginBottom: 24,
  },
  loginContainer: {
    alignItems: "center",
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  loginText: {
    fontSize: RFValue(13),
  },
  loginLink: {
    fontSize: RFValue(13),
  },
});
