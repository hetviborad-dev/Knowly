import React, {
  useState,
} from "react";

import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";

import type {
  NativeStackScreenProps,
} from "@react-navigation/native-stack";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import type {
  RootStackParamList,
} from "../../types/navigation";

import { colors } from "../../constant/colors";
import { spacing } from "../../constant/spacing";

import FontText from "../../components/common/FontText";
import AppButton from "../../components/common/AppButton";
import AuthInput from "../../components/auth/AuthInput";

import {
  saveOnboardingStep,
  saveUserName,
} from "../../services/storageService";
import useDisableOnboardingBack from "../../hooks/useDisableOnboardingBack";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "AskName"
>;

const AskNameScreen = ({
  navigation,
}: Props) => {
  useDisableOnboardingBack();

  const [name, setName] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleNameChange = (
    text: string,
  ) => {
    setName(text);

    if (text.trim()) {
      setError("");
    }
  };

  const handleContinue = async () => {
    const trimmedName =
      name.trim();

    if (!trimmedName) {
      setError(
        "Please enter your name",
      );
      return;
    }

    try {
      setLoading(true);

      await saveUserName(
        trimmedName,
      );

      await saveOnboardingStep("NAME");

      navigation.replace(
        "SelectCategories",
      );
    } catch (error) {
      console.error(
        "Failed to save name:",
        error,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <View style={styles.content}>
          <FontText
            variant="display"
            style={styles.title}
          >
            What do you want
            {"\n"}
            to be called?
          </FontText>

          <FontText
            variant="body"
            style={styles.description}
          >
            Your name is used to personalize
            your experience
          </FontText>

          <View
            style={styles.inputContainer}
          >
            <AuthInput
            backgroundColor={'#404040'}
              placeholder="Your name"
              value={name}
              onChangeText={
                handleNameChange
              }
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={
                handleContinue
              }
            />

            {error ? (
              <FontText
                variant="body"
                style={styles.errorText}
              >
                {error}
              </FontText>
            ) : null}
          </View>
        </View>

        <AppButton
          title="Continue"
          onPress={
            handleContinue
          }
          loading={loading}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AskNameScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#262626",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },

  content: {
    flex: 1,
  },

  title: {
    fontSize: 34,
    lineHeight: 42,
    color: colors.white,
    textAlign: "center",
  },

  description: {
    marginTop: spacing.md,
    color: colors.white,
    lineHeight: 24,
    textAlign: "center",
  },

  inputContainer: {
    marginTop: spacing.xxl,
  },

  errorText: {
    marginTop: spacing.sm,
    color: "#FF4D4F",
    fontSize: 14,
  },
});