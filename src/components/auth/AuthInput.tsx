import React from "react";
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

import { colors } from "../../constant/colors";
import { spacing } from "../../constant/spacing";
import { rr } from "../../constant/responsive";
import FontText from "../common/FontText";

type AuthInputProps = TextInputProps & {
  label: string;
};

const AuthInput = ({
  label,
  ...props
}: AuthInputProps) => {
  return (
    <View style={styles.container}>
      <FontText
        variant="caption"
        style={styles.label}
      >
        {label}
      </FontText>

      <TextInput
        {...props}
        style={styles.input}
        placeholderTextColor={colors.textMuted}
      />
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

  input: {
    height: 54,
    paddingHorizontal: spacing.lg,
    borderRadius: rr(100),
    backgroundColor: '#404040',
    color: '#BEBEBE',
    fontFamily: "Inter-Regular",
    fontSize: 16,
  },
});

export default AuthInput;