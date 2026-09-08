import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { supabase } from "../../lib/supabase";

import { RootStackParamList } from "../../types/navigation";
import { colors } from "../../constant/colors";
import { typography } from "../../constant/typography";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "Splash"
>;

const SplashScreen = ({ navigation }: Props) => {
  const opacity = useRef(
    new Animated.Value(0),
  ).current;

  const scale = useRef(
    new Animated.Value(0.8),
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),

      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        console.log(
          "KNOWLY SPLASH SESSION:",
          session,
        );

        if (session) {
          navigation.replace("MainTabs");
        } else {
          navigation.replace("Welcome");
        }
      } catch (error) {
        console.error(
          "Failed to check session:",
          error,
        );

        navigation.replace("Welcome");
      }
    };

    const timer = setTimeout(() => {
      checkSession();
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigation, opacity, scale]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity,
            transform: [{ scale }],
          },
        ]}
      >
        <View style={styles.logoCircle}>
          <Animated.Text style={styles.logoText}>
            K
          </Animated.Text>
        </View>

        <Animated.Text style={styles.appName}>
          Knowly
        </Animated.Text>
      </Animated.View>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  logoContainer: {
    alignItems: "center",
  },

  logoCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },

  logoText: {
    fontSize: 42,
    fontWeight: "800",
    color: colors.primary,
  },

  appName: {
    marginTop: 16,
    fontSize: 32,
    fontWeight: "800",
    color: colors.white,
    fontFamily: typography.heading1.fontFamily,
  },
});