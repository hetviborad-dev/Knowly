import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../../types/navigation";
import { colors } from "../../constant/colors";
import { spacing } from "../../constant/spacing";
import { typography } from "../../constant/typography";

import FontText from "../../components/common/FontText";
import AppButton from "../../components/common/AppButton";
import AuthInput from "../../components/auth/AuthInput";

import { saveUserName } from "../../services/storageService";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = NativeStackScreenProps<RootStackParamList, "AskName">;

const AskNameScreen = ({ navigation }: Props) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    try {
      setLoading(true);

      await saveUserName(trimmedName);

      navigation.navigate("SelectCategories");
    } catch (error) {
      console.error("Failed to save name:", error);
    } finally {
      setLoading(false);
    }
  };

  const isValid = name.trim().length > 0;

  return (
    <SafeAreaView style={styles.container}>
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.content}>
        <FontText variant="display" style={styles.title}>
          What do you want
          {"\n"}
          to be called?
        </FontText>

        <FontText variant="body" style={styles.description}>
          Your name is used to personalize your experience
        </FontText>

        <View style={styles.inputContainer}>
          <AuthInput
            placeholder="Your name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={handleContinue}
          />
        </View>
      </View>

      <AppButton
        title="Continue"
        onPress={handleContinue}
        disabled={!isValid}
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
    backgroundColor: '#262626',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },

  content: {
    flex: 1,
  },

  stepContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xxl,
  },

  activeDot: {
    width: 28,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: 6,
  },

  inactiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
    marginRight: 6,
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
});
