import React from "react";
import {
  StyleSheet,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../../types/navigation";
import { colors } from "../../constant/colors";
import { spacing } from "../../constant/spacing";
import { typography } from "../../constant/typography";
import AppButton from "../../components/common/AppButton";
import FontText from "../../components/common/FontText";

type Props = NativeStackScreenProps<RootStackParamList, "Welcome">;

const WelcomeScreen = ({ navigation }: Props) => {
  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.logoCircle}>
          <FontText
            variant="heading1"
            style={styles.logoText}
          >
            K
          </FontText>
        </View>

        <FontText
          variant="heading1"
          style={styles.logoName}
        >
          Knowly
        </FontText>
      </View>

      <View style={styles.content}>
        <FontText
          variant="display"
          style={styles.title}
        >
          Tailor your fact
          {"\n"}
          recommendations
        </FontText>

        <FontText
          variant="body"
          style={styles.description}
        >
          Tell us what you're curious about and we'll
          bring you interesting facts you'll actually
          want to learn.
        </FontText>
      </View>

      <View style={styles.bottom}>
        <AppButton
          title="Continue"
          onPress={() => navigation.navigate("AskName")}
        />

        <FontText
          variant="caption"
          style={styles.footer}
        >
          Learn something interesting every day.
        </FontText>
      </View>
    </View>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },

  topSection: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  logoText: {
    color: colors.white,
    fontSize: 22,
  },

  logoName: {
    marginLeft: spacing.sm,
    fontSize: 22,
  },

  content: {
    flex: 1,
    justifyContent: "center",
  },

  title: {
    fontSize: 38,
    lineHeight: 45,
    color: colors.text,
  },

  description: {
    marginTop: spacing.lg,
    color: colors.textSecondary,
    lineHeight: 25,
    maxWidth: 330,
  },

  bottom: {
    gap: spacing.md,
  },

  footer: {
    textAlign: "center",
    color: colors.textMuted,
  },
});