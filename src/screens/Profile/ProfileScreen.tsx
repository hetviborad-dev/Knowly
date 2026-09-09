import React, {
  useCallback,
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

import type {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import {
  useFocusEffect,
} from "@react-navigation/native";

import {
  clearOnboardingData,
} from "../../services/storageService";

import {
  supabase,
} from "../../lib/supabase";

import FontText from "../../components/common/FontText";

import {
  colors,
} from "../../constant/colors";

import {
  rf,
  rw,
  rh,
  rr,
} from "../../constant/responsive";

import type {
  RootStackParamList,
} from "../../types/navigation";


type ProfileNavigationProp =
  NativeStackNavigationProp<
    RootStackParamList
  >;

type ProfileScreenProps = {
  navigation: ProfileNavigationProp;
};

type Profile = {
  username: string | null;
  email: string | null;
};

type NotificationPreferences = {
  notifications_enabled: boolean;
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
};


const ProfileScreen = ({
  navigation,
}: ProfileScreenProps) => {
  const [
    profile,
    setProfile,
  ] = useState<Profile | null>(
    null,
  );

  const [
    notificationPreferences,
    setNotificationPreferences,
  ] = useState<NotificationPreferences | null>(
    null,
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    loggingOut,
    setLoggingOut,
  ] = useState(false);

  const fadeAnimation =
    useRef(
      new Animated.Value(0),
    ).current;

  const slideAnimation =
    useRef(
      new Animated.Value(18),
    ).current;


  useEffect(() => {
    loadProfile();
  }, []);


  /*
   * Reload notification settings
   * every time Profile becomes active.
   *
   * This means:
   *
   * Profile
   * ↓
   * Daily facts
   * ↓
   * Save
   * ↓
   * Profile
   *
   * The summary will immediately update.
   */

  useFocusEffect(
    useCallback(() => {
      loadNotificationPreferences();
    }, []),
  );


  const loadProfile = async () => {
    try {
      setLoading(true);

      const {
        data: {
          user,
        },
        error: userError,
      } =
        await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        setLoading(false);
        return;
      }

      const {
        data,
        error,
      } = await supabase
        .from("profiles")
        .select(
          "username, email",
        )
        .eq(
          "id",
          user.id,
        )
        .single();

      if (error) {
        throw error;
      }

      setProfile({
        username:
          data?.username ??
          "Knowledge Explorer",

        email:
          data?.email ??
          user.email ??
          "",
      });

      await loadNotificationPreferences();

      Animated.parallel([
        Animated.timing(
          fadeAnimation,
          {
            toValue: 1,
            duration: 450,
            useNativeDriver: true,
          },
        ),

        Animated.timing(
          slideAnimation,
          {
            toValue: 0,
            duration: 450,
            useNativeDriver: true,
          },
        ),
      ]).start();

    } catch (error) {
      console.error(
        "Failed to load profile:",
        error,
      );

      setProfile({
        username:
          "Knowledge Explorer",

        email: "",
      });

      Animated.timing(
        fadeAnimation,
        {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        },
      ).start();

    } finally {
      setLoading(false);
    }
  };


  const loadNotificationPreferences =
    async () => {
      try {
        const {
          data: {
            user,
          },
        } =
          await supabase.auth.getUser();

        if (!user) {
          return;
        }

        const {
          data,
          error,
        } = await supabase
          .from("notification_preferences")
          .select(
            "notifications_enabled, morning, afternoon, evening",
          )
          .eq(
            "user_id",
            user.id,
          )
          .maybeSingle();

        if (error) {
          console.error(
            "Failed to load notification preferences:",
            error,
          );

          return;
        }

        if (!data) {
          setNotificationPreferences(
            null,
          );

          return;
        }

        setNotificationPreferences({
          notifications_enabled:
            data.notifications_enabled,

          morning:
            data.morning,

          afternoon:
            data.afternoon,

          evening:
            data.evening,
        });

      } catch (error) {
        console.error(
          "Notification preferences error:",
          error,
        );
      }
    };


  const getNotificationSummary =
    () => {
      if (
        !notificationPreferences ||
        !notificationPreferences
          .notifications_enabled
      ) {
        return "Notifications off";
      }

      const times: string[] = [];

      if (
        notificationPreferences.morning
      ) {
        times.push("Morning");
      }

      if (
        notificationPreferences.afternoon
      ) {
        times.push("Afternoon");
      }

      if (
        notificationPreferences.evening
      ) {
        times.push("Evening");
      }

      if (times.length === 0) {
        return "Notifications off";
      }

      return times.join(" · ");
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

      const {
        error,
      } =
        await supabase.auth.signOut();

      if (error) {
        Alert.alert(
          "Logout failed",
          error.message,
        );

        return;
      }

      await clearOnboardingData();

      navigation.replace(
        "Welcome",
      );

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
      <View
        style={
          styles.loadingContainer
        }
      >
        <View
          style={
            styles.loadingIcon
          }
        >
          <Ionicons
            name="sparkles"
            size={rw(22)}
            color={colors.primary}
          />
        </View>

        <ActivityIndicator
          size="small"
          color={colors.primary}
          style={
            styles.loadingIndicator
          }
        />
      </View>
    );
  }


  const username =
    profile?.username?.trim() ||
    "Knowledge Explorer";

  const email =
    profile?.email?.trim() ||
    "";

  const avatarLetter =
    username
      .charAt(0)
      .toUpperCase();

  const notificationSummary =
    getNotificationSummary();


  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.content
      }
      showsVerticalScrollIndicator={
        false
      }
    >
      <Animated.View
        style={[
          styles.animatedContent,
          {
            opacity:
              fadeAnimation,

            transform: [
              {
                translateY:
                  slideAnimation,
              },
            ],
          },
        ]}
      >

        {/* =========================
            TOP HEADER
        ========================== */}

        <View
          style={styles.topHeader}
        >
          <View>
            <FontText
              variant="caption"
              style={
                styles.headerEyebrow
              }
            >
              KNOWLY
            </FontText>

            <FontText
              variant="heading1"
              style={
                styles.headerTitle
              }
            >
              Profile
            </FontText>
          </View>

          <View
            style={
              styles.headerSparkle
            }
          >
            <Ionicons
              name="sparkles"
              size={rw(20)}
              color={colors.primary}
            />
          </View>
        </View>


        {/* =========================
            PROFILE CARD
        ========================== */}

        <View
          style={styles.profileCard}
        >
          <View
            style={
              styles.profileCardGlow
            }
          />

          <View
            style={styles.avatar}
          >
            <FontText
              style={
                styles.avatarText
              }
            >
              {avatarLetter}
            </FontText>
          </View>

          <View
            style={styles.profileInfo}
          >
            <FontText
              variant="caption"
              style={
                styles.profileLabel
              }
            >
              YOUR KNOWLY PROFILE
            </FontText>

            <FontText
              variant="heading2"
              style={
                styles.profileName
              }
              numberOfLines={1}
            >
              {username}
            </FontText>

            {email ? (
              <FontText
                variant="small"
                style={
                  styles.profileEmail
                }
                numberOfLines={1}
              >
                {email}
              </FontText>
            ) : null}
          </View>
        </View>


        {/* =========================
            PERSONALIZE
        ========================== */}

        <View
          style={styles.section}
        >
          <View
            style={
              styles.sectionHeader
            }
          >
            <View>
              <FontText
                variant="heading2"
                style={
                  styles.sectionTitle
                }
              >
                Personalize
              </FontText>

              <FontText
                variant="small"
                style={
                  styles.sectionSubtitle
                }
              >
                Make Knowly more you
              </FontText>
            </View>
          </View>


          <View
            style={styles.settingsCard}
          >

            {/* CATEGORIES */}

            <Pressable
              onPress={() =>
                navigation.navigate(
                  "SelectCategories",
                  {
                    fromSettings: true,
                  },
                )
              }
              style={({
                pressed,
              }) => [
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
                  name="grid-outline"
                  size={rw(21)}
                  color={
                    colors.primary
                  }
                />
              </View>

              <View
                style={
                  styles.settingInfo
                }
              >
                <FontText
                  variant="bodyMedium"
                  style={
                    styles.settingTitle
                  }
                >
                  Your interests
                </FontText>

                <FontText
                  variant="small"
                  style={
                    styles.settingDescription
                  }
                >
                  Choose what you want to
                  discover
                </FontText>
              </View>

              <View
                style={
                  styles.chevronContainer
                }
              >
                <Ionicons
                  name="chevron-forward"
                  size={rw(18)}
                  color={
                    colors.textMuted
                  }
                />
              </View>
            </Pressable>


            <View
              style={
                styles.rowDivider
              }
            />


            {/* NOTIFICATIONS */}

            <Pressable
              onPress={() =>
                navigation.navigate(
                  "NotificationSettings",
                )
              }
              style={({
                pressed,
              }) => [
                styles.settingRow,
                pressed &&
                  styles.settingPressed,
              ]}
            >
              <View
                style={[
                  styles.settingIcon,
                  styles.notificationIcon,
                ]}
              >
                <Ionicons
                  name="notifications-outline"
                  size={rw(21)}
                  color={
                    colors.primary
                  }
                />
              </View>

              <View
                style={
                  styles.settingInfo
                }
              >
                <FontText
                  variant="bodyMedium"
                  style={
                    styles.settingTitle
                  }
                >
                  Daily facts
                </FontText>

                <FontText
                  variant="small"
                  style={
                    styles.settingDescription
                  }
                  numberOfLines={1}
                >
                  {notificationSummary}
                </FontText>
              </View>

              <View
                style={
                  styles.chevronContainer
                }
              >
                <Ionicons
                  name="chevron-forward"
                  size={rw(18)}
                  color={
                    colors.textMuted
                  }
                />
              </View>
            </Pressable>


            <View
              style={
                styles.rowDivider
              }
            />


            {/* LANGUAGE */}

            {/* <Pressable
              style={({
                pressed,
              }) => [
                styles.settingRow,
                pressed &&
                  styles.settingPressed,
              ]}
            >
              <View
                style={[
                  styles.settingIcon,
                  styles.languageIcon,
                ]}
              >
                <Ionicons
                  name="language-outline"
                  size={rw(21)}
                  color={
                    colors.primary
                  }
                />
              </View>

              <View
                style={
                  styles.settingInfo
                }
              >
                <FontText
                  variant="bodyMedium"
                  style={
                    styles.settingTitle
                  }
                >
                  Language
                </FontText>

                <FontText
                  variant="small"
                  style={
                    styles.settingDescription
                  }
                >
                  Choose your preferred language
                </FontText>
              </View>

              <View
                style={
                  styles.languageValue
                }
              >
                <FontText
                  variant="small"
                  style={
                    styles.languageValueText
                  }
                >
                  English
                </FontText>

                <Ionicons
                  name="chevron-forward"
                  size={rw(17)}
                  color={
                    colors.textMuted
                  }
                />
              </View>
            </Pressable> */}

          </View>
        </View>


        {/* =========================
            KNOWLY MESSAGE
        ========================== */}

        <View
          style={
            styles.knowledgeCard
          }
        >
          <View
            style={
              styles.knowledgeIcon
            }
          >
            <Ionicons
              name="bulb-outline"
              size={rw(22)}
              color={
                colors.primary
              }
            />
          </View>

          <View
            style={
              styles.knowledgeContent
            }
          >
            <FontText
              variant="bodyMedium"
              style={
                styles.knowledgeTitle
              }
            >
              Stay curious.
            </FontText>

            <FontText
              variant="small"
              style={
                styles.knowledgeText
              }
            >
              There is always something
              new worth knowing.
            </FontText>
          </View>
        </View>


        {/* =========================
            ACCOUNT
        ========================== */}

        <View
          style={styles.accountSection}
        >
          <FontText
            variant="caption"
            style={
              styles.accountLabel
            }
          >
            ACCOUNT
          </FontText>

          <Pressable
            onPress={
              handleLogout
            }
            disabled={
              loggingOut
            }
            style={({
              pressed,
            }) => [
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
                color={
                  colors.error
                }
              />
            ) : (
              <>
                <View
                  style={
                    styles.logoutIcon
                  }
                >
                  <Ionicons
                    name="log-out-outline"
                    size={rw(19)}
                    color={
                      colors.error
                    }
                  />
                </View>

                <FontText
                  variant="bodyMedium"
                  style={
                    styles.logoutText
                  }
                >
                  Log out
                </FontText>
              </>
            )}
          </Pressable>
        </View>


        {/* =========================
            FOOTER
        ========================== */}

        <View
          style={styles.footer}
        >
          <Ionicons
            name="sparkles"
            size={rw(13)}
            color={
              colors.textMuted
            }
          />

          <FontText
            variant="caption"
            style={
              styles.footerText
            }
          >
            KNOWLY · KEEP LEARNING
          </FontText>
        </View>

      </Animated.View>
    </ScrollView>
  );
};


export default ProfileScreen;


const styles = StyleSheet.create({

  /* =========================
     CONTAINER
  ========================== */

  container: {
    flex: 1,
    backgroundColor:
      colors.background,
  },

  content: {
    paddingHorizontal:
      rw(20),

    paddingTop:
      rh(20),

    paddingBottom:
      rh(44),
  },

  animatedContent: {
    width: "100%",
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      colors.background,
  },

  loadingIcon: {
    width: rw(48),
    height: rw(48),
    borderRadius: rr(16),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "#EAF5FF",
  },

  loadingIndicator: {
    marginTop: rh(12),
  },


  /* =========================
     TOP HEADER
  ========================== */

  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: rh(22),
  },

  headerEyebrow: {
    fontSize: rf(10),
    letterSpacing: 1.6,
    color:
      colors.primary,
    marginBottom: rh(3),
  },

  headerTitle: {
    color:
      colors.text,
    fontSize: rf(29),
  },

  headerSparkle: {
    width: rw(44),
    height: rw(44),
    borderRadius: rr(15),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "#EAF5FF",
  },


  /* =========================
     PROFILE CARD
  ========================== */

  profileCard: {
    minHeight: rh(116),
    borderRadius: rr(26),
    backgroundColor:
      colors.surface,
    padding: rw(18),
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",

    borderWidth: 1,
    borderColor:
      "rgba(0,0,0,0.035)",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.035,
    shadowRadius: 14,
    elevation: 2,

    marginBottom: rh(30),
  },

  profileCardGlow: {
    position: "absolute",
    width: rw(120),
    height: rw(120),
    borderRadius: rw(60),
    right: rw(-45),
    top: rh(-45),
    backgroundColor:
      "#EAF5FF",
    opacity: 0.8,
  },

  avatar: {
    width: rw(70),
    height: rw(70),
    borderRadius: rr(23),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      colors.primary,
    marginRight: rw(15),
  },

  avatarText: {
    fontSize: rf(28),
    color:
      colors.white,
  },

  profileInfo: {
    flex: 1,
    zIndex: 1,
  },

  profileLabel: {
    fontSize: rf(9),
    letterSpacing: 1.2,
    color:
      colors.primary,
    marginBottom: rh(5),
  },

  profileName: {
    color:
      colors.text,
  },

  profileEmail: {
    color:
      colors.textSecondary,
    marginTop: rh(4),
  },


  /* =========================
     SECTION
  ========================== */

  section: {
    marginBottom: rh(28),
  },

  sectionHeader: {
    marginBottom: rh(13),
  },

  sectionTitle: {
    color:
      colors.text,
  },

  sectionSubtitle: {
    color:
      colors.textSecondary,
    marginTop: rh(2),
  },


  /* =========================
     SETTINGS CARD
  ========================== */

  settingsCard: {
    backgroundColor:
      colors.surface,

    borderRadius:
      rr(22),

    overflow: "hidden",

    borderWidth: 1,
    borderColor:
      "rgba(0,0,0,0.035)",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.025,
    shadowRadius: 12,
    elevation: 1,
  },

  settingRow: {
    minHeight: rh(78),
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal:
      rw(15),
    paddingVertical:
      rh(12),
  },

  settingPressed: {
    opacity: 0.62,
  },

  settingIcon: {
    width: rw(44),
    height: rw(44),
    borderRadius: rr(14),
    alignItems: "center",
    justifyContent: "center",
    marginRight: rw(13),
  },

  categoryIcon: {
    backgroundColor:
      "#EAF5FF",
  },

  notificationIcon: {
    backgroundColor:
      "#F0EDFF",
  },

  languageIcon: {
    backgroundColor:
      "#EAF9F1",
  },

  settingInfo: {
    flex: 1,
  },

  settingTitle: {
    color:
      colors.text,
  },

  settingDescription: {
    color:
      colors.textSecondary,
    marginTop: rh(3),
    lineHeight: rf(16),
  },

  chevronContainer: {
    width: rw(30),
    alignItems: "flex-end",
    justifyContent: "center",
  },

  rowDivider: {
    height: 1,
    backgroundColor:
      "#F0F1F3",
    marginLeft:
      rw(72),
  },

  languageValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: rw(4),
  },

  languageValueText: {
    color:
      colors.textSecondary,
  },


  /* =========================
     KNOWLEDGE CARD
  ========================== */

  knowledgeCard: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor:
      "#F5FAFF",

    borderRadius:
      rr(20),

    paddingHorizontal:
      rw(15),

    paddingVertical:
      rh(15),

    marginBottom:
      rh(30),

    borderWidth: 1,
    borderColor:
      "#E5F1FA",
  },

  knowledgeIcon: {
    width: rw(44),
    height: rw(44),
    borderRadius: rr(14),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "#EAF5FF",
    marginRight:
      rw(12),
  },

  knowledgeContent: {
    flex: 1,
  },

  knowledgeTitle: {
    color:
      colors.text,
  },

  knowledgeText: {
    color:
      colors.textSecondary,
    marginTop:
      rh(2),
  },


  /* =========================
     ACCOUNT
  ========================== */

  accountSection: {
    marginBottom:
      rh(28),
  },

  accountLabel: {
    fontSize: rf(10),
    letterSpacing: 1.3,
    color:
      colors.textMuted,
    marginBottom:
      rh(10),
  },

  logoutButton: {
    height:
      rh(52),

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    borderRadius:
      rr(17),

    borderWidth: 1,
    borderColor:
      "#FECACA",

    backgroundColor:
      "#FFF7F7",
  },

  logoutIcon: {
    width: rw(30),
    height: rw(30),
    borderRadius: rr(10),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "#FEECEC",
  },

  logoutText: {
    color:
      colors.error,
    marginLeft:
      rw(9),
  },

  logoutPressed: {
    opacity: 0.6,
  },

  logoutDisabled: {
    opacity: 0.5,
  },


  /* =========================
     FOOTER
  ========================== */

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rw(6),
    paddingTop: rh(4),
  },

  footerText: {
    fontSize: rf(8),
    letterSpacing: 1.1,
    color:
      colors.textMuted,
  },
});