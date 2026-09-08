import React, { useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { colors } from "../../constant/colors";
import { spacing } from "../../constant/spacing";
import { rr, rw } from "../../constant/responsive";
import FontText from "./FontText";

type AppButtonProps = {
  title: string;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
};

const AppButton = ({
  title,
  loading = false,
  disabled = false,
  onPress,
}: AppButtonProps) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[
          styles.button,
          disabled && styles.disabled,
        ]}
      >
        <View style={styles.content}>
          <FontText
            variant="bodyMedium"
            style={styles.text}
          >
            {loading ? "Please wait..." : title}
          </FontText>

          {!loading && (
            <FontText style={styles.arrow}>
              →
            </FontText>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    height: rw(55),
    borderRadius: rr(17),
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  disabled: {
    opacity: 0.6,
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  text: {
    color: colors.white,
  },

  arrow: {
    color: colors.white,
    fontSize: rw(20),
  },
});

export default AppButton;