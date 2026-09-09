import React, {
  useState,
} from "react";

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
  saveOnboardingStep,
} from "../../services/storageService";

import { colors } from "../../constant/colors";

import {
  rh,
  rw,
} from "../../constant/responsive";

import type { RootStackParamList } from "../../types/navigation";

import useDisableOnboardingBack from "../../hooks/useDisableOnboardingBack";

import Logo from "../../assets/svgs/logo.svg";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "Auth"
>;

type AuthMode =
  | "login"
  | "signup";

const AuthScreen = ({
  navigation,
}: Props) => {
  useDisableOnboardingBack();

  const [mode, setMode] =
    useState<AuthMode>("login");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const isLogin =
    mode === "login";

  /*
   * Switch login / signup
   */
  const switchMode = () => {
    setMode(
      isLogin
        ? "signup"
        : "login",
    );

    setPassword("");
    setConfirmPassword("");

    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  /*
   * LOGIN
   */
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

    try {
      setLoading(true);

      /*
       * Sign in
       */
      const {
        data,
        error,
      } =
        await supabase.auth.signInWithPassword(
          {
            email:
              email.trim(),
            password,
          },
        );

      if (error) {
        Alert.alert(
          "Login failed",
          error.message,
        );
        return;
      }

      /*
       * Make sure user exists
       */
      if (!data.user) {
        Alert.alert(
          "Login failed",
          "We couldn't find your account.",
        );
        return;
      }

      /*
       * Check whether this user
       * has already completed
       * notification setup.
       */
      const {
        data:
          notificationPreferences,
        error:
          notificationError,
      } =
        await supabase
          .from(
            "notification_preferences",
          )
          .select("user_id")
          .eq(
            "user_id",
            data.user.id,
          )
          .maybeSingle();

      if (notificationError) {
        console.error(
          "KNOWLY NOTIFICATION CHECK ERROR:",
          notificationError,
        );

        Alert.alert(
          "Something went wrong",
          "We couldn't check your notification settings.",
        );

        return;
      }

      /*
       * New/existing user without
       * notification preferences
       */
      if (
        !notificationPreferences
      ) {
        console.log(
          "KNOWLY → NOTIFICATIONS",
        );

        navigation.replace(
          "Notifications",
        );

        return;
      }

      /*
       * User already completed
       * notification setup
       */
      console.log(
        "KNOWLY → MAIN TABS",
      );

      navigation.replace(
        "MainTabs",
      );
    } catch (error) {
      console.error(
        "Login error:",
        error,
      );

      Alert.alert(
        "Login failed",
        "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * SIGN UP
   */
  const handleSignUp =
    async () => {
      if (!email.trim()) {
        Alert.alert(
          "Email required",
          "Please enter your email.",
        );
        return;
      }

      if (
        password.length < 6
      ) {
        Alert.alert(
          "Password too short",
          "Password must be at least 6 characters.",
        );
        return;
      }

      if (
        password !==
        confirmPassword
      ) {
        Alert.alert(
          "Passwords don't match",
          "Please make sure both passwords are the same.",
        );
        return;
      }

      try {
        setLoading(true);

        /*
         * Get onboarding data
         */
        const name =
          await getUserName();

        const selectedCategories =
          await getSelectedCategories();

        /*
         * Validate name
         */
        if (!name) {
          Alert.alert(
            "Name missing",
            "Please go back and enter your name.",
          );
          return;
        }

        /*
         * Validate categories
         */
        if (
          selectedCategories.length <
          2
        ) {
          Alert.alert(
            "Categories missing",
            "Please select at least 2 categories.",
          );
          return;
        }

        /*
         * Create account
         */
        const {
          data,
          error,
        } =
          await supabase.auth.signUp(
            {
              email:
                email.trim(),
              password,

              options: {
                data: {
                  username:
                    name,
                },
              },
            },
          );

        console.log(
          "===== KNOWLY SIGNUP =====",
        );

        console.log(
          "USER:",
          data.user,
        );

        console.log(
          "SESSION:",
          data.session,
        );

        console.log(
          "ERROR:",
          error,
        );

        console.log(
          "=========================",
        );

        /*
         * Signup error
         */
        if (error) {
          Alert.alert(
            "Sign up failed",
            error.message,
          );
          return;
        }

        /*
         * User must exist
         */
        if (!data.user) {
          Alert.alert(
            "Signup failed",
            "We couldn't create your account.",
          );
          return;
        }

        /*
         * If email confirmation
         * is enabled, Supabase may
         * create the user without
         * an authenticated session.
         */
        if (!data.session) {
          Alert.alert(
            "Check your email",
            "Your account was created. Please confirm your email, then log in to continue.",
          );

          return;
        }

        /*
         * Save categories
         */
        const categoryRows =
          selectedCategories.map(
            categoryId => ({
              user_id:
                data.user!.id,

              category_id:
                categoryId,
            }),
          );

        const {
          error:
            categoryError,
        } =
          await supabase
            .from(
              "user_categories",
            )
            .insert(
              categoryRows,
            );

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

        /*
         * Save onboarding progress
         */
        await saveOnboardingStep(
          "AUTH",
        );

        console.log(
          "KNOWLY → NOTIFICATIONS",
        );

        navigation.replace(
          "Notifications",
        );
      } catch (error) {
        console.error(
          "KNOWLY SIGNUP ERROR:",
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

  /*
   * SUBMIT
   */
  const handleSubmit = () => {
    if (isLogin) {
      handleLogin();
    } else {
      handleSignUp();
    }
  };

  /*
   * FORGOT PASSWORD
   */
  const handleForgotPassword =
    async () => {
      if (!email.trim()) {
        Alert.alert(
          "Enter your email",
          "Enter your email first so we know where to send the reset link.",
        );
        return;
      }

      try {
        setLoading(true);

        const {
          error,
        } =
          await supabase.auth.resetPasswordForEmail(
            email.trim(),
          );

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
      } catch (error) {
        console.error(
          "Password reset error:",
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

  return (
    <AnimatedScreen
      keyboardAvoiding
      scroll
    >
      <View
        style={styles.container}
      >
        {/* BRAND */}

        <View
          style={styles.brand}
        >
          <View
            style={
              styles.logoContainer
            }
          >
            <Logo
              width={rw(94)}
              height={rw(94)}
            />
          </View>
        </View>

        {/* HEADER */}

        <View
          style={styles.header}
        >
          <FontText
            variant="h1"
            style={styles.title}
          >
            {isLogin
              ? "Welcome back"
              : "Create your account"}
          </FontText>

          <FontText
            variant="body"
            style={
              styles.description
            }
          >
            {isLogin
              ? "Log in to continue discovering fascinating facts."
              : "Start your journey of discovering fascinating facts."}
          </FontText>
        </View>

        {/* FORM */}

        <View
          style={styles.form}
        >
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
            visible={
              showPassword
            }
            onToggleVisibility={() =>
              setShowPassword(
                !showPassword,
              )
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
              value={
                confirmPassword
              }
              onChangeText={
                setConfirmPassword
              }
              placeholder="Enter password again"
              visible={
                showConfirmPassword
              }
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
              onPress={
                handleForgotPassword
              }
              disabled={loading}
              style={
                styles.forgotButton
              }
            >
              <FontText
                variant="small"
                style={
                  styles.forgotText
                }
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
            onPress={
              handleSubmit
            }
          />
        </View>

        {/* BOTTOM SWITCH */}

        <View
          style={
            styles.bottomContainer
          }
        >
          <FontText
            variant="small"
            style={
              styles.bottomText
            }
          >
            {isLogin
              ? "Don't have an account?"
              : "Already have an account?"}
          </FontText>

          <Pressable
            onPress={
              switchMode
            }
            disabled={loading}
            hitSlop={8}
          >
            <FontText
              variant="small"
              style={
                styles.bottomAction
              }
            >
              {isLogin
                ? "Sign up"
                : "Log in"}
            </FontText>
          </Pressable>
        </View>

        {/* FOOTER */}

        <View
          style={styles.footer}
        >
          <FontText
            variant="caption"
            style={
              styles.footerText
            }
          >
            By continuing, you agree to our Terms
            and Privacy Policy.
          </FontText>
        </View>
      </View>
    </AnimatedScreen>
  );
};

export default AuthScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    width: "100%",
    paddingHorizontal: rw(10),
    paddingTop: rh(18),
    paddingBottom: rh(24),
  },

  brand: {
    alignItems: "center",
    marginBottom: rh(26),
  },

  logoContainer: {
    width: rw(64),
    height: rw(64),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: rh(8),
  },

  brandName: {
    color: colors.textPrimary,
    textAlign: "center",
  },

  brandSubtitle: {
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: rh(4),
    maxWidth: rw(280),
  },

  header: {
    width: "100%",
    marginBottom: rh(18),
  },

  title: {
    color: colors.textPrimary,
    fontSize: rw(28),
    lineHeight: rw(34),
  },

  description: {
    color: colors.textSecondary,
    marginTop: rh(7),
    lineHeight: rh(21),
    maxWidth: rw(330),
  },

  modeContainer: {
    width: "100%",
    flexDirection: "row",
    padding: rw(4),
    borderRadius: rw(12),
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: rh(22),
  },

  modeButton: {
    flex: 1,
    minHeight: rh(42),
    borderRadius: rw(9),
    alignItems: "center",
    justifyContent: "center",
  },

  modeButtonActive: {
    backgroundColor: colors.white,
  },

  modeText: {
    color: colors.textMuted,
  },

  modeTextActive: {
    color: colors.primary,
    fontWeight: "700",
  },

  form: {
    width: "100%",
  },

  forgotButton: {
    alignSelf: "flex-end",
    marginTop: rh(-4),
    marginBottom: rh(20),
    paddingVertical: rh(4),
    paddingHorizontal: rw(2),
  },

  forgotText: {
    color: colors.primary,
    fontWeight: "600",
  },

  bottomContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: rh(24),
  },

  bottomText: {
    color: colors.textSecondary,
  },

  bottomAction: {
    color: colors.primary,
    fontWeight: "700",
    marginLeft: rw(5),
  },

  footer: {
    alignItems: "center",
    marginTop: rh(20),
    paddingHorizontal: rw(12),
  },

  footerText: {
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: rh(17),
  },
});