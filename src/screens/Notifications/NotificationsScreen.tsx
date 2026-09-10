import React, {
  useState,
} from "react";

import {
  Alert,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@react-native-vector-icons/ionicons";
import {
  getScheduledKnowlyNotifications,
  showTestNotification,
} from "../../services/notificationService";
import type {
  NativeStackScreenProps,
} from "@react-navigation/native-stack";

import AnimatedScreen from "../../components/common/AnimatedScreen";
import AppButton from "../../components/common/AppButton";
import FontText from "../../components/common/FontText";

import { colors } from "../../constant/colors";

import {
  rw,
  rh,
  rr,
} from "../../constant/responsive";

import {
  saveOnboardingStep,
} from "../../services/storageService";

import {
  setupKnowlyNotifications,
} from "../../services/notificationService";

import {
  supabase,
} from "../../lib/supabase";

import type {
  RootStackParamList,
} from "../../types/navigation";

type Props =
  NativeStackScreenProps<
    RootStackParamList,
    "Notifications"
  >;

const TIMES = [
  {
    id: "morning",
    label: "Morning",
    time: "9:00 AM",
    icon: "sunny-outline",
  },
  {
    id: "afternoon",
    label: "Afternoon",
    time: "2:00 PM",
    icon: "partly-sunny-outline",
  },
  {
    id: "evening",
    label: "Evening",
    time: "7:00 PM",
    icon: "moon-outline",
  },
];

const NotificationsScreen = ({
  navigation,
}: Props) => {
  const [
    selectedTimes,
    setSelectedTimes,
  ] = useState<string[]>([
    "morning",
  ]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const toggleTime = (
    id: string,
  ) => {
    setSelectedTimes(
      current => {
        if (current.includes(id)) {
          return current.filter(
            item => item !== id,
          );
        }

        return [
          ...current,
          id,
        ];
      },
    );
  };

  const handleContinue =
    async () => {
      if (
        selectedTimes.length === 0
      ) {
        Alert.alert(
          "Select a time",
          "Please select at least one time to receive your daily facts.",
        );

        return;
      }

      try {
        setLoading(true);

        const {
          data: {
            user,
          },
          error: userError,
        } =
          await supabase.auth.getUser();

        if (
          userError ||
          !user
        ) {
          Alert.alert(
            "Error",
            "We could not find your account. Please log in again.",
          );

          return;
        }

        /*
         * ------------------------------------------------
         * 1. Save notification preferences to Supabase
         * ------------------------------------------------
         */

        const {
          error,
        } = await supabase
          .from(
            "notification_preferences",
          )
          .upsert(
            {
              user_id:
                user.id,

              notifications_enabled:
                true,

              morning:
                selectedTimes.includes(
                  "morning",
                ),

              afternoon:
                selectedTimes.includes(
                  "afternoon",
                ),

              evening:
                selectedTimes.includes(
                  "evening",
                ),

              updated_at:
                new Date().toISOString(),
            },
            {
              onConflict:
                "user_id",
            },
          );

        if (error) {
          throw error;
        }

        /*
         * ------------------------------------------------
         * 2. Ask OS notification permission
         * ------------------------------------------------
         *
         * 3. Schedule selected notifications
         * ------------------------------------------------
         */
await showTestNotification();

        const notificationSetup =
          await setupKnowlyNotifications(
            {
              morning:
                selectedTimes.includes(
                  "morning",
                ),

              afternoon:
                selectedTimes.includes(
                  "afternoon",
                ),

              evening:
                selectedTimes.includes(
                  "evening",
                ),
            },
          );

          await getScheduledKnowlyNotifications();

        /*
         * Permission can be denied while the
         * Supabase preference is still saved.
         */

        if (
          !notificationSetup
        ) {
          Alert.alert(
            "Notifications disabled",
            "Your preferences were saved, but notification permission was not allowed.",
          );
        }

        /*
         * ------------------------------------------------
         * 4. Mark onboarding as completed
         * ------------------------------------------------
         */

        await saveOnboardingStep(
          "NOTIFICATIONS",
        );

        /*
         * ------------------------------------------------
         * 5. Go to main app
         * ------------------------------------------------
         */

        navigation.replace(
          "MainTabs",
        );
      } catch (error) {
        console.error(
          "Notification setup error:",
          error,
        );

        Alert.alert(
          "Something went wrong",
          "We could not save your notification settings. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

  const handleSkip =
    async () => {
      try {
        setLoading(true);

        const {
          data: {
            user,
          },
          error: userError,
        } =
          await supabase.auth.getUser();

        if (
          userError ||
          !user
        ) {
          Alert.alert(
            "Error",
            "We could not find your account. Please log in again.",
          );

          return;
        }

        /*
         * Save notifications as disabled.
         */

        const {
          error,
        } = await supabase
          .from(
            "notification_preferences",
          )
          .upsert(
            {
              user_id:
                user.id,

              notifications_enabled:
                false,

              morning:
                false,

              afternoon:
                false,

              evening:
                false,

              updated_at:
                new Date().toISOString(),
            },
            {
              onConflict:
                "user_id",
            },
          );

        if (error) {
          throw error;
        }

        /*
         * No notification permission is requested
         * when the user chooses Maybe later.
         */

        await saveOnboardingStep(
          "NOTIFICATIONS",
        );

        navigation.replace(
          "MainTabs",
        );
      } catch (error) {
        console.error(
          "Skip notification error:",
          error,
        );

        Alert.alert(
          "Something went wrong",
          "We could not save your preference. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <AnimatedScreen
      style={
        styles.container
      }
    >
      <View
        style={
          styles.content
        }
      >
        <View
          style={
            styles.iconContainer
          }
        >
          <Ionicons
            name="notifications-outline"
            size={rw(34)}
            color={
              colors.primary
            }
          />
        </View>

        <FontText
          variant="h1"
          style={
            styles.title
          }
        >
          Get interesting facts
          throughout the day
        </FontText>

        <FontText
          variant="body"
          style={
            styles.subtitle
          }
        >
          Choose when you want
          Knowly to send you
          something interesting.
        </FontText>

        <View
          style={
            styles.timesContainer
          }
        >
          {TIMES.map(
            item => {
              const selected =
                selectedTimes.includes(
                  item.id,
                );

              return (
                <Pressable
                  key={
                    item.id
                  }
                  disabled={
                    loading
                  }
                  onPress={() =>
                    toggleTime(
                      item.id,
                    )
                  }
                  style={[
                    styles.timeCard,

                    selected &&
                      styles.timeCardSelected,

                    loading &&
                      styles.disabled,
                  ]}
                >
                  <View
                    style={[
                      styles.timeIconContainer,

                      selected &&
                        styles.timeIconContainerSelected,
                    ]}
                  >
                    <Ionicons
                      name={
                        item.icon as any
                      }
                      size={rw(
                        24,
                      )}
                      color={
                        selected
                          ? colors.white
                          : colors.primary
                      }
                    />
                  </View>

                  <View
                    style={
                      styles.timeInfo
                    }
                  >
                    <FontText
                      variant="body"
                      style={
                        styles.timeLabel
                      }
                    >
                      {
                        item.label
                      }
                    </FontText>

                    <FontText
                      variant="small"
                      style={
                        styles.timeValue
                      }
                    >
                      {
                        item.time
                      }
                    </FontText>
                  </View>

                  <View
                    style={[
                      styles.checkbox,

                      selected &&
                        styles.checkboxSelected,
                    ]}
                  >
                    {selected && (
                      <Ionicons
                        name="checkmark"
                        size={rw(
                          16,
                        )}
                        color={
                          colors.white
                        }
                      />
                    )}
                  </View>
                </Pressable>
              );
            },
          )}
        </View>

        <View
          style={
            styles.bottomContainer
          }
        >
          <AppButton
            title="Continue"
            onPress={
              handleContinue
            }
            loading={
              loading
            }
          />

          <Pressable
            disabled={
              loading
            }
            onPress={
              handleSkip
            }
            style={({ pressed }) => [
              styles.skipButton,

              pressed &&
                styles.skipPressed,

              loading &&
                styles.disabled,
            ]}
          >
            <FontText
              variant="body"
              style={
                styles.skipText
              }
            >
              Maybe later
            </FontText>
          </Pressable>
        </View>
      </View>
    </AnimatedScreen>
  );
};

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        colors.white,
    },

    content: {
      flex: 1,
      paddingHorizontal:
        rw(24),
      paddingTop:
        rh(70),
      paddingBottom:
        rh(30),
    },

    iconContainer: {
      width: rw(68),
      height: rw(68),
      borderRadius:
        rr(34),
      backgroundColor:
        colors.primaryLight,
      alignItems:
        "center",
      justifyContent:
        "center",
      alignSelf:
        "center",
      marginBottom:
        rh(24),
    },

    title: {
      textAlign:
        "center",
      color:
        colors.text,
      marginBottom:
        rh(12),
    },

    subtitle: {
      textAlign:
        "center",
      color:
        colors.textMuted,
      lineHeight:
        rh(22),
      marginBottom:
        rh(32),
    },

    timesContainer: {
      gap: rh(12),
    },

    timeCard: {
      flexDirection:
        "row",
      alignItems:
        "center",
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        rr(16),
      padding:
        rw(14),
      backgroundColor:
        colors.white,
    },

    timeCardSelected: {
      borderColor:
        colors.primary,
      backgroundColor:
        colors.primaryLight,
    },

    timeIconContainer: {
      width: rw(46),
      height: rw(46),
      borderRadius:
        rr(23),
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        colors.primaryLight,
    },

    timeIconContainerSelected: {
      backgroundColor:
        colors.primary,
    },

    timeInfo: {
      flex: 1,
      marginLeft:
        rw(14),
    },

    timeLabel: {
      color:
        colors.text,
      marginBottom:
        rh(2),
    },

    timeValue: {
      color:
        colors.textMuted,
    },

    checkbox: {
      width: rw(24),
      height: rw(24),
      borderRadius:
        rr(12),
      borderWidth: 1.5,
      borderColor:
        colors.border,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    checkboxSelected: {
      borderColor:
        colors.primary,
      backgroundColor:
        colors.primary,
    },

    bottomContainer: {
      marginTop:
        "auto",
    },

    skipButton: {
      alignItems:
        "center",
      justifyContent:
        "center",
      paddingVertical:
        rh(14),
      marginTop:
        rh(8),
    },

    skipPressed: {
      opacity: 0.6,
    },

    skipText: {
      color:
        colors.textMuted,
    },

    disabled: {
      opacity: 0.6,
    },
  });

export default NotificationsScreen;
