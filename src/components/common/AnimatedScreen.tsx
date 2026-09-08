import React, {
  ReactNode,
  useEffect,
  useRef,
} from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { colors } from "../../constant/colors";
import { spacing } from "../../constant/spacing";

type AnimatedScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  keyboardAvoiding?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

const AnimatedScreen = ({
  children,
  scroll = true,
  keyboardAvoiding = false,
  style,
  contentContainerStyle,
}: AnimatedScreenProps) => {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, slide]);

  const content = (
    <Animated.View
      style={[
        styles.content,
        {
          opacity: fade,
          transform: [{ translateY: slide }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );

  if (keyboardAvoiding) {
    return (
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        {scroll ? (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              styles.scrollContent,
              contentContainerStyle,
            ]}
          >
            {content}
          </ScrollView>
        ) : (
          content
        )}
      </KeyboardAvoidingView>
    );
  }

  if (scroll) {
    return (
      <ScrollView
        style={styles.flex}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scrollContent,
          contentContainerStyle,
        ]}
      >
        {content}
      </ScrollView>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xxxl - spacing.sm,
    paddingVertical: spacing.xxxl,
  },

  content: {
    flexGrow: 1,
  },
});

export default AnimatedScreen;