import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@react-native-vector-icons/ionicons";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { clearOnboardingData } from "../../services/storageService";
import { supabase } from "../../lib/supabase";

import FontText from "../../components/common/FontText";

import { colors } from "../../constant/colors";
import { spacing } from "../../constant/spacing";
import {
  rf,
  rw,
  rh,
  rr,
} from "../../constant/responsive";

import type { RootStackParamList } from "../../types/navigation";

type ProfileNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

type ProfileScreenProps = {
  navigation: ProfileNavigationProp;
};

type Profile = {
  username: string | null;
  email: string | null;
};

const ProfileScreen = ({
  navigation,
}: ProfileScreenProps) => {
  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const fadeAnimation = useRef(
    new Animated.Value(0),
  ).current;

  const slideAnimation = useRef(
    new Animated.Value(20),
  ).current;

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } =
        await supabase
          .from("profiles")
          .select("username, email")
          .eq("id", user.id)
          .single();

      if (error) {
        throw error;
      }

      setProfile({
        username:
          data?.username ?? "Knowledge Explorer",
        email:
          data?.email ?? user.email ?? "",
      });

      Animated.parallel([
        Animated.timing(fadeAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),

        Animated.timing(slideAnimation, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      console.error(
        "Failed to load profile:",
        error,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Log out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log out",
          style: "destructive",
          onPress: logout,
        },
      ],
    );
  };

  const logout = async () => {
    try {
      setLoggingOut(true);

      const { error } =
        await supabase.auth.signOut();

      if (error) {
        Alert.alert(
          "Logout failed",
          error.message,
        );
        return;
      }
    await clearOnboardingData();

      navigation.replace("Welcome");
    } catch (error) {
      console.error(
        "Logout error:",
        error,
      );

      Alert.alert(
        "Logout failed",
        "Something went wrong. Please try again.",
      );
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="small"
          color={colors.primary}
        />
      </View>
    );
  }

  const username =
    profile?.username?.trim() ||
    "Knowledge Explorer";

  const email = profile?.email ?? "";

  const avatarLetter = username
    .charAt(0)
    .toUpperCase();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View
        style={[
          styles.animatedContent,
          {
            opacity: fadeAnimation,
            transform: [
              {
                translateY: slideAnimation,
              },
            ],
          },
        ]}
      >
        {/* Header */}

        <View style={styles.header}>
          <View style={styles.avatar}>
            <FontText
              style={styles.avatarText}
            >
              {avatarLetter}
            </FontText>
          </View>

          <View style={styles.userInfo}>
            <FontText
              variant="caption"
              style={styles.eyebrow}
            >
              YOUR KNOWLY
            </FontText>

            <FontText
              variant="heading2"
              style={styles.name}
            >
              {username}
            </FontText>

            <FontText
              variant="small"
              style={styles.email}
            >
              {email}
            </FontText>
          </View>
        </View>

        {/* Preferences */}

        <View style={styles.section}>
          <FontText
            variant="heading2"
            style={styles.sectionTitle}
          >
            Preferences
          </FontText>

          <View style={styles.settingsCard}>
            <Pressable
              onPress={() =>
                navigation.navigate("SelectCategories", {
  fromSettings: true,
})
              }
              style={({ pressed }) => [
                styles.settingRow,
                pressed &&
                  styles.settingPressed,
              ]}
            >
              <View
                style={[
                  styles.settingIcon,
                  styles.categoryIcon,
                ]}
              >
                <Ionicons
                  name="options-outline"
                  size={rw(21)}
                  color={colors.primary}
                />
              </View>

              <View style={styles.settingInfo}>
                <FontText
                  variant="bodyMedium"
                  style={styles.settingTitle}
                >
                  Your categories
                </FontText>

                <FontText
                  variant="small"
                  style={styles.settingDescription}
                >
                  Change the topics you want to
                  discover
                </FontText>
              </View>

              <Ionicons
                name="chevron-forward"
                size={rw(20)}
                color={colors.textMuted}
              />
            </Pressable>
          </View>
        </View>

        {/* Logout */}

        <Pressable
          onPress={handleLogout}
          disabled={loggingOut}
          style={({ pressed }) => [
            styles.logoutButton,
            pressed &&
              styles.logoutPressed,
            loggingOut &&
              styles.logoutDisabled,
          ]}
        >
          {loggingOut ? (
            <ActivityIndicator
              size="small"
              color={colors.error}
            />
          ) : (
            <>
              <Ionicons
                name="log-out-outline"
                size={rw(21)}
                color={colors.error}
              />

              <FontText
                variant="bodyMedium"
                style={styles.logoutText}
              >
                Log out
              </FontText>
            </>
          )}
        </Pressable>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    paddingHorizontal: rw(20),
    paddingTop: rh(26),
    paddingBottom: rh(40),
  },

  animatedContent: {
    width: "100%",
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: rh(34),
  },

  avatar: {
    width: rw(72),
    height: rw(72),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderRadius: rr(24),
    marginRight: rw(16),
  },

  avatarText: {
    fontFamily: "Inter-Bold",
    fontSize: rf(28),
    color: colors.white,
  },

  userInfo: {
    flex: 1,
  },

  eyebrow: {
    fontSize: rf(10),
    letterSpacing: 1.1,
    color: colors.primary,
    marginBottom: spacing.xs,
  },

  name: {
    color: colors.text,
  },

  email: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  section: {
    marginBottom: rh(28),
  },

  sectionTitle: {
    color: colors.text,
    marginBottom: rh(14),
  },

  settingsCard: {
    backgroundColor: colors.surface,
    borderRadius: rr(20),
    overflow: "hidden",
  },

  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: rw(16),
  },

  settingPressed: {
    opacity: 0.65,
  },

  settingIcon: {
    width: rw(44),
    height: rw(44),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: rr(14),
    marginRight: rw(13),
  },

  categoryIcon: {
    backgroundColor: "#EAF5FF",
  },

  settingInfo: {
    flex: 1,
  },

  settingTitle: {
    color: colors.text,
  },

  settingDescription: {
    color: colors.textSecondary,
    marginTop: rh(3),
  },

  logoutButton: {
    height: rh(52),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FECACA",
    backgroundColor: "#FFF7F7",
    borderRadius: rr(17),
  },

  logoutPressed: {
    opacity: 0.65,
  },

  logoutDisabled: {
    opacity: 0.5,
  },

  logoutText: {
    color: colors.error,
    marginLeft: rw(8),
  },
});

export default ProfileScreen;