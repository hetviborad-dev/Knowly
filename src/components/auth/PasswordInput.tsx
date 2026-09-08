import React from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { colors } from "../../constant/colors";
import { spacing } from "../../constant/spacing";
import { rr } from "../../constant/responsive";
import FontText from "../common/FontText";

type PasswordInputProps = {
  label: string;
  value: string;
  placeholder: string;
  visible: boolean;
  onChangeText: (text: string) => void;
  onToggleVisibility: () => void;
  autoComplete?: "password" | "new-password";
};

const PasswordInput = ({
  label,
  value,
  placeholder,
  visible,
  onChangeText,
  onToggleVisibility,
  autoComplete,
}: PasswordInputProps) => {
  return (
    <View style={styles.container}>
      <FontText
        variant="caption"
        style={styles.label}
      >
        {label}
      </FontText>

      <View style={styles.inputContainer}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={!visible}
          autoComplete={autoComplete}
          style={styles.input}
        />

        <Pressable
          onPress={onToggleVisibility}
          hitSlop={10}
        >
          <FontText
            variant="small"
            style={styles.action}
          >
            {visible ? "Hide" : "Show"}
          </FontText>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },

  label: {
    color: colors.text,
    marginBottom: spacing.sm,
  },

  inputContainer: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: spacing.lg,
    paddingRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: rr(16),
    backgroundColor: colors.surface,
  },

  input: {
    flex: 1,
    color: colors.text,
    fontFamily: "Inter-Regular",
    fontSize: 16,
  },

  action: {
    color: colors.primary,
  },
});

export default PasswordInput;