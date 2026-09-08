import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  Animated,
} from "react-native";

import { supabase } from "../../lib/supabase";

import { colors } from "../../constant/colors";
import { spacing } from "../../constant/spacing";
import {
  rf,
  rw,
  rh,
  rr,
} from "../../constant/responsive";

import FontText from "../../components/common/FontText";

type Profile = {
  username: string | null;
  avatar_url: string | null;
};

const ProfileScreen = () => {
  const [email, setEmail] = useState("");
  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [loading, setLoading] = useState(true);
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
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      setEmail(user.email ?? "");

      const { data, error } =
        await supabase
          .from("profiles")
          .select("username, avatar_url")
          .eq("id", user.id)
          .single();

      if (error) {
        console.error(
          "Error loading profile:",
          error,
        );
        return;
      }

      setProfile(data);

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
        "Error loading profile:",
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
    setLoggingOut(true);

    const { error } =
      await supabase.auth.signOut();

    setLoggingOut(false);

    if (error) {
      Alert.alert(
        "Logout failed",
        error.message,
      );
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
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <FontText
                style={styles.avatarText}
              >
                {avatarLetter}
              </FontText>
            </View>

            <View style={styles.avatarStatus} />
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

        {/* Logout */}
        <Pressable
          onPress={handleLogout}
          disabled={loggingOut}
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.logoutPressed,
            loggingOut && styles.logoutDisabled,
          ]}
        >
          {loggingOut ? (
            <ActivityIndicator
              size="small"
              color={colors.error}
            />
          ) : (
            <>
              <FontText
                style={styles.logoutIcon}
              >
                ↪
              </FontText>

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

  /* Header */

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: rh(28),
  },

  avatarContainer: {
    position: "relative",
    marginRight: rw(16),
  },

  avatar: {
    width: rw(68),
    height: rw(68),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderRadius: rr(24),
  },

  avatarText: {
    fontFamily: "Inter-Bold",
    fontSize: rf(27),
    color: colors.white,
  },

  avatarStatus: {
    position: "absolute",
    right: rw(-2),
    bottom: rw(-2),
    width: rw(17),
    height: rw(17),
    backgroundColor: colors.secondary,
    borderWidth: rw(3),
    borderColor: colors.background,
    borderRadius: rr(10),
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

  /* Stats */

  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: rh(18),
    backgroundColor: colors.surface,
    borderRadius: rr(24),
    marginBottom: rh(30),
  },

  stat: {
    flex: 1,
    alignItems: "center",
  },

  statIconBlue: {
    width: rw(30),
    height: rw(30),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF5FF",
    borderRadius: rr(10),
    marginBottom: spacing.xs,
  },

  statIconTurquoise: {
    width: rw(30),
    height: rw(30),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E6F8F7",
    borderRadius: rr(10),
    marginBottom: spacing.xs,
  },

  statIconYellow: {
    width: rw(30),
    height: rw(30),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF8E8",
    borderRadius: rr(10),
    marginBottom: spacing.xs,
  },

  statIconText: {
    fontFamily: "Inter-Bold",
    fontSize: rf(14),
    color: colors.text,
  },

  statNumber: {
    fontSize: rf(21),
    lineHeight: rf(26),
    color: colors.text,
  },

  statLabel: {
    color: colors.textSecondary,
    marginTop: rh(2),
  },

  statDivider: {
    width: 1,
    height: rh(58),
    backgroundColor: colors.border,
  },

  /* Sections */

  section: {
    marginBottom: rh(30),
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },

  sectionEyebrow: {
    fontSize: rf(10),
    letterSpacing: 1.1,
    color: colors.primary,
    marginBottom: spacing.xs,
  },

  sectionTitle: {
    color: colors.text,
  },

  progressPercent: {
    color: colors.primary,
    marginBottom: rh(2),
  },

  /* Progress */

  progressCard: {
    padding: rw(20),
    backgroundColor: colors.primary,
    borderRadius: rr(24),
  },

  progressTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  progressIconContainer: {
    width: rw(52),
    height: rw(52),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderRadius: rr(17),
    marginRight: rw(14),
  },

  progressIcon: {
    fontSize: rf(26),
  },

  progressInfo: {
    flex: 1,
  },

  progressTitle: {
    color: colors.white,
  },

  progressText: {
    color: "rgba(255,255,255,0.82)",
    marginTop: spacing.xs,
  },

  progressTrack: {
    height: rh(7),
    overflow: "hidden",
    backgroundColor:
      "rgba(255,255,255,0.2)",
    borderRadius: rr(10),
    marginTop: rh(22),
  },

  progressFill: {
    width: "0%",
    height: "100%",
    backgroundColor: colors.white,
    borderRadius: rr(10),
  },

  progressHint: {
    color: "rgba(255,255,255,0.65)",
    marginTop: spacing.sm,
  },

  /* Settings */

  settingsCard: {
    backgroundColor: colors.surface,
    borderRadius: rr(22),
    overflow: "hidden",
  },

  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: rw(15),
  },

  settingPressed: {
    opacity: 0.65,
  },

  settingIconContainer: {
    width: rw(44),
    height: rw(44),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: rr(14),
    marginRight: rw(13),
  },

  notificationIcon: {
    backgroundColor: "#EAF5FF",
  },

  aboutIcon: {
    backgroundColor: "#E6F8F7",
  },

  settingIcon: {
    fontSize: rf(20),
  },

  settingInfo: {
    flex: 1,
  },

  settingText: {
    color: colors.text,
  },

  settingDescription: {
    fontFamily: "Inter-Regular",
    color: colors.textSecondary,
    marginTop: rh(2),
  },

  arrow: {
    fontSize: rf(20),
    fontFamily: "Inter-SemiBold",
    color: colors.primary,
    marginLeft: rw(8),
  },

  rowDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: rw(72),
  },

  /* Logout */

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

  logoutIcon: {
    fontSize: rf(19),
    fontFamily: "Inter-SemiBold",
    color: colors.error,
    marginRight: rw(8),
  },

  logoutText: {
    color: colors.error,
  },

  version: {
    fontFamily: "Inter-Regular",
    color: colors.textMuted,
    textAlign: "center",
    marginTop: rh(20),
  },
});

export default ProfileScreen;