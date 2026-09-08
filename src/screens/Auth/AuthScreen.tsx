import React, { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import AnimatedScreen from "../../components/common/AnimatedScreen";
import AppButton from "../../components/common/AppButton";
import AuthInput from "../../components/auth/AuthInput";
import PasswordInput from "../../components/auth/PasswordInput";
import FontText from "../../components/common/FontText";

import { supabase } from "../../lib/supabase";
import {
  getSelectedCategories,
  getUserName,
} from "../../services/storageService";

import { colors } from "../../constant/colors";
import { rf, rh, rw } from "../../constant/responsive";

import type { RootStackParamList } from "../../types/navigation";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "Auth"
>;

type AuthMode = "login" | "signup";

const AuthScreen = ({ navigation }: Props) => {
  const [mode, setMode] = useState<AuthMode>("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";

  const switchMode = () => {
    setMode(isLogin ? "signup" : "login");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // ============================================
  // LOGIN
  // ============================================

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert(
        "Email required",
        "Please enter your email.",
      );
      return;
    }

    if (!password) {
      Alert.alert(
        "Password required",
        "Please enter your password.",
      );
      return;
    }

    setLoading(true);

    const { error } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    setLoading(false);

    if (error) {
      Alert.alert(
        "Login failed",
        error.message,
      );
      return;
    }

    // Existing user → Main App
    navigation.replace("MainTabs");
  };

  // ============================================
  // SIGN UP
  // ============================================

const handleSignUp = async () => {
  if (!email.trim()) {
    Alert.alert(
      "Email required",
      "Please enter your email.",
    );
    return;
  }

  if (password.length < 6) {
    Alert.alert(
      "Password too short",
      "Password must be at least 6 characters.",
    );
    return;
  }

  if (password !== confirmPassword) {
    Alert.alert(
      "Passwords don't match",
      "Please make sure both passwords are the same.",
    );
    return;
  }

  setLoading(true);

  try {
    // Get onboarding data saved earlier
    const name = await getUserName();
    const selectedCategories =
      await getSelectedCategories();

    // Make sure onboarding data exists
    if (!name) {
      Alert.alert(
        "Name missing",
        "Please go back and enter your name.",
      );
      return;
    }

    if (selectedCategories.length < 2) {
      Alert.alert(
        "Categories missing",
        "Please select at least 2 categories.",
      );
      return;
    }

    // Create Supabase account
    const { data, error } =
      await supabase.auth.signUp({
        email: email.trim(),
        password,

        options: {
          data: {
            username: name,
          },
        },
      });

    console.log("===== KNOWLY SIGNUP =====");
    console.log("USER:", data.user);
    console.log("SESSION:", data.session);
    console.log("ERROR:", error);
    console.log("=========================");

    if (error) {
      Alert.alert(
        "Sign up failed",
        error.message,
      );
      return;
    }

    // Supabase successfully created the account
    // and returned an active session.
    if (!data.user || !data.session) {
      Alert.alert(
        "Signup failed",
        "Account was created, but no active session was returned.",
      );
      return;
    }

    // ============================================
    // SAVE SELECTED CATEGORIES
    // ============================================

    const categoryRows =
      selectedCategories.map((categoryId) => ({
        user_id: data.user.id,
        category_id: categoryId,
      }));

    const { error: categoryError } =
      await supabase
        .from("user_categories")
        .insert(categoryRows);

    console.log(
      "KNOWLY CATEGORY ERROR:",
      categoryError,
    );

    if (categoryError) {
      Alert.alert(
        "Category setup failed",
        categoryError.message,
      );
      return;
    }

    // ============================================
    // SUCCESS
    // ============================================

    console.log(
      "KNOWLY → NOTIFICATIONS",
    );

    navigation.replace("Notifications");
  } catch (error) {
    console.log(
      "KNOWLY SIGNUP CATCH ERROR:",
      error,
    );

    Alert.alert(
      "Something went wrong",
      "Please try again.",
    );
  } finally {
    setLoading(false);
  }
};

  // ============================================
  // SUBMIT
  // ============================================

  const handleSubmit = () => {
    if (isLogin) {
      handleLogin();
    } else {
      handleSignUp();
    }
  };

  // ============================================
  // FORGOT PASSWORD
  // ============================================

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert(
        "Enter your email",
        "Enter your email first so we know where to send the reset link.",
      );
      return;
    }

    setLoading(true);

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email.trim(),
      );

    setLoading(false);

    if (error) {
      Alert.alert(
        "Something went wrong",
        error.message,
      );
      return;
    }

    Alert.alert(
      "Check your email",
      "We sent you a password reset link.",
    );
  };

  return (
    <AnimatedScreen
      keyboardAvoiding
      scroll
    >
      <View style={styles.form}>
        <AuthInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
        />

        <PasswordInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          visible={showPassword}
          onToggleVisibility={() =>
            setShowPassword(!showPassword)
          }
          autoComplete={
            isLogin
              ? "password"
              : "new-password"
          }
        />

        {!isLogin && (
          <PasswordInput
            label="Confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Enter password again"
            visible={showConfirmPassword}
            onToggleVisibility={() =>
              setShowConfirmPassword(
                !showConfirmPassword,
              )
            }
            autoComplete="new-password"
          />
        )}

        {isLogin && (
          <Pressable
            onPress={handleForgotPassword}
            disabled={loading}
            style={styles.forgotButton}
          >
            <FontText
              variant="caption"
              style={styles.forgotText}
            >
              Forgot password?
            </FontText>
          </Pressable>
        )}

        <AppButton
          title={
            isLogin
              ? "Log in"
              : "Create account"
          }
          loading={loading}
          onPress={handleSubmit}
        />
      </View>

      <View style={styles.switchContainer}>
        <FontText
          variant="small"
          style={styles.switchText}
        >
          {isLogin
            ? "Don't have an account?"
            : "Already have an account?"}
        </FontText>

        <Pressable
          onPress={switchMode}
          disabled={loading}
          style={styles.switchButton}
        >
          <FontText
            variant="small"
            style={styles.switchAction}
          >
            {isLogin ? "Sign up" : "Log in"}
          </FontText>
        </Pressable>
      </View>
    </AnimatedScreen>
  );
};

const styles = StyleSheet.create({
  form: {
    width: "100%",
  },

  forgotButton: {
    alignSelf: "flex-end",
    marginTop: rh(-6),
    marginBottom: rh(20),
  },

  forgotText: {
    color: colors.primary,
  },

  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: rh(24),
  },

  switchText: {
    color: colors.textSecondary,
  },

  switchButton: {
    marginLeft: rw(5),
    paddingVertical: rh(3),
  },

  switchAction: {
    fontFamily: "Inter-SemiBold",
    color: colors.primary,
  },

  trustCard: {
    marginTop: rh(28),
  },

  footer: {
    fontFamily: "Inter-Regular",
    color: colors.textMuted,
    textAlign: "center",
    marginTop: rh(22),
  },
});

export default AuthScreen;