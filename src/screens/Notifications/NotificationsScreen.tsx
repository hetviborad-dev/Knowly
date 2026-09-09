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

import type {
  NativeStackScreenProps,
} from "@react-navigation/native-stack";

import AnimatedScreen from "../../components/common/AnimatedScreen";
import AppButton from "../../components/common/AppButton";
import FontText from "../../components/common/FontText";

import {
  colors,
} from "../../constant/colors";

import {
  rh,
  rw,
} from "../../constant/responsive";

import type {
  RootStackParamList,
} from "../../types/navigation";

import useDisableOnboardingBack from "../../hooks/useDisableOnboardingBack";
import {
  saveOnboardingStep,
} from "../../services/storageService";

import {
  supabase,
} from "../../lib/supabase";

type Props = NativeStackScreenProps<
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
  useDisableOnboardingBack();

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
        if (
          current.includes(id)
        ) {
          return current.filter(
            item =>
              item !== id,
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
        selectedTimes.length ===
        0
      ) {
        Alert.alert(
          "Choose a time",
          "Select at least one time to receive facts.",
        );

        return;
      }

      try {
        setLoading(true);

        /*
         * Get currently logged-in user
         */
        const {
          data: {
            user,
          },
          error: userError,
        } =
          await supabase.auth.getUser();

        if (userError) {
          console.error(
            "KNOWLY USER ERROR:",
            userError,
          );

          Alert.alert(
            "Something went wrong",
            "We couldn't verify your account.",
          );

          return;
        }

        if (!user) {
          Alert.alert(
            "Authentication required",
            "Please log in before setting notifications.",
          );

          return;
        }

        /*
         * Save notification preferences
         */
        const {
          error,
        } = await supabase
          .from(
            "notification_preferences",
          )
          .upsert(
            {
              user_id: user.id,

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
          console.error(
            "KNOWLY NOTIFICATION SAVE ERROR:",
            error,
          );

          Alert.alert(
            "Couldn't save settings",
            "We couldn't save your notification preferences. Please try again.",
          );

          return;
        }

        console.log(
          "KNOWLY NOTIFICATIONS SAVED:",
          {
            user_id: user.id,
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
          },
        );

        await saveOnboardingStep(
          "NOTIFICATIONS",
        );

        navigation.replace(
          "MainTabs",
        );
      } catch (error) {
        console.error(
          "KNOWLY NOTIFICATION ERROR:",
          error,
        );

        Alert.alert(
          "Something went wrong",
          "Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

  const handleSkip = async () => {
    try {
      setLoading(true);

      /*
       * Get currently logged-in user
       */
      const {
        data: {
          user,
        },
      } =
        await supabase.auth.getUser();

      if (!user) {
        Alert.alert(
          "Authentication required",
          "Please log in before continuing.",
        );

        return;
      }

      /*
       * Save notifications as OFF
       */
      const {
        error,
      } = await supabase
        .from(
          "notification_preferences",
        )
        .upsert(
          {
            user_id: user.id,

            notifications_enabled:
              false,

            morning: false,
            afternoon: false,
            evening: false,

            updated_at:
              new Date().toISOString(),
          },
          {
            onConflict:
              "user_id",
          },
        );

      if (error) {
        console.error(
          "KNOWLY NOTIFICATION SKIP ERROR:",
          error,
        );

        Alert.alert(
          "Couldn't save settings",
          "We couldn't save your notification preference. Please try again.",
        );

        return;
      }

      console.log(
        "KNOWLY NOTIFICATIONS: SKIPPED",
      );

      await saveOnboardingStep(
        "NOTIFICATIONS",
      );

      navigation.replace(
        "MainTabs",
      );
    } catch (error) {
      console.error(
        "KNOWLY NOTIFICATION SKIP ERROR:",
        error,
      );

      Alert.alert(
        "Something went wrong",
        "Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedScreen
      keyboardAvoiding
      scroll
    >
      <View style={styles.container}>
        {/* Notification icon */}

        <View
          style={
            styles.iconContainer
          }
        >
          <Ionicons
            name="notifications-outline"
            size={rw(34)}
            color={colors.primary}
          />
        </View>

        {/* Title */}

        <FontText
          variant="display"
          style={styles.title}
        >
          Get interesting facts
          throughout the day
        </FontText>

        {/* Description */}

        <FontText
          variant="body"
          style={styles.description}
        >
          Let Knowly send you fascinating
          facts at the times that work
          best for you.
        </FontText>

        {/* Time selection */}

        <View
          style={
            styles.timesContainer
          }
        >
          {TIMES.map(item => {
            const selected =
              selectedTimes.includes(
                item.id,
              );

            return (
              <Pressable
                key={item.id}
                onPress={() =>
                  toggleTime(
                    item.id,
                  )
                }
                disabled={loading}
                style={[
                  styles.timeCard,

                  selected &&
                    styles.timeCardSelected,
                ]}
              >
                <View
                  style={[
                    styles.timeIcon,

                    selected &&
                      styles.timeIconSelected,
                  ]}
                >
                  <Ionicons
                    name={
                      item.icon as any
                    }
                    size={rw(22)}
                    color={
                      selected
                        ? colors.white
                        : colors.primary
                    }
                  />
                </View>

                <View
                  style={
                    styles.timeContent
                  }
                >
                  <FontText
                    variant="body"
                    style={
                      styles.timeLabel
                    }
                  >
                    {item.label}
                  </FontText>

                  <FontText
                    variant="caption"
                    style={
                      styles.timeValue
                    }
                  >
                    {item.time}
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
                      size={rw(16)}
                      color={
                        colors.white
                      }
                    />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Continue */}

        <AppButton
          title="Turn on notifications"
          loading={loading}
          onPress={
            handleContinue
          }
        />

        {/* Skip */}

        <Pressable
          onPress={handleSkip}
          disabled={loading}
          style={
            styles.skipButton
          }
        >
          <FontText
            variant="small"
            style={styles.skipText}
          >
            Maybe later
          </FontText>
        </Pressable>
      </View>
    </AnimatedScreen>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingTop: rh(20),
    paddingBottom: rh(30),
  },

  iconContainer: {
    width: rw(72),
    height: rw(72),
    borderRadius: rw(36),
    backgroundColor: "#EAF5FF",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: rh(24),
  },

  title: {
    textAlign: "center",
    marginBottom: rh(12),
  },

  description: {
    textAlign: "center",
    color: colors.textSecondary,
    lineHeight: rh(24),
  },

  timesContainer: {
    marginTop: rh(32),
    gap: rh(12),
  },

  timeCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: rw(14),
    borderRadius: rw(16),
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },

  timeCardSelected: {
    borderColor: colors.primary,
    backgroundColor: "#F5FAFF",
  },

  timeIcon: {
    width: rw(44),
    height: rw(44),
    borderRadius: rw(22),
    backgroundColor: "#EAF5FF",
    alignItems: "center",
    justifyContent: "center",
  },

  timeIconSelected: {
    backgroundColor: colors.primary,
  },

  timeContent: {
    flex: 1,
    marginLeft: rw(12),
  },

  timeLabel: {
    color: colors.text,
  },

  timeValue: {
    marginTop: rh(2),
    color: colors.textSecondary,
  },

  checkbox: {
    width: rw(24),
    height: rw(24),
    borderRadius: rw(7),
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  checkboxSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  skipButton: {
    alignSelf: "center",
    marginTop: rh(20),
    paddingVertical: rh(8),
  },

  skipText: {
    color: colors.textSecondary,
  },
});