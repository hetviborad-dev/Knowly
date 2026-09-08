import React, { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Ionicons from "@react-native-vector-icons/ionicons";

import AnimatedScreen from "../../components/common/AnimatedScreen";
import AppButton from "../../components/common/AppButton";
import FontText from "../../components/common/FontText";

import { colors } from "../../constant/colors";
import { rh, rw } from "../../constant/responsive";

import type { RootStackParamList } from "../../types/navigation";

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
  const [selectedTimes, setSelectedTimes] =
    useState<string[]>(["morning"]);

  const toggleTime = (id: string) => {
    setSelectedTimes((current) => {
      if (current.includes(id)) {
        return current.filter(
          (item) => item !== id,
        );
      }

      return [...current, id];
    });
  };

  const handleContinue = () => {
    if (selectedTimes.length === 0) {
      Alert.alert(
        "Choose a time",
        "Select at least one time to receive facts.",
      );
      return;
    }

    console.log(
      "KNOWLY NOTIFICATION TIMES:",
      selectedTimes,
    );

    navigation.replace("MainTabs");
  };

  const handleSkip = () => {
    console.log(
      "KNOWLY NOTIFICATIONS: SKIPPED",
    );

    navigation.replace("MainTabs");
  };

  return (
    <AnimatedScreen
      keyboardAvoiding
      scroll
    >
      <View style={styles.container}>
        {/* Notification icon */}
        <View style={styles.iconContainer}>
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
          Get interesting facts throughout the day
        </FontText>

        {/* Description */}
        <FontText
          variant="body"
          style={styles.description}
        >
          Let Knowly send you fascinating facts at
          the times that work best for you.
        </FontText>

        {/* Time selection */}
        <View style={styles.timesContainer}>
          {TIMES.map((item) => {
            const selected =
              selectedTimes.includes(item.id);

            return (
              <Pressable
                key={item.id}
                onPress={() =>
                  toggleTime(item.id)
                }
                style={[
                  styles.timeCard,
                  selected &&
                    styles.timeCardSelected,
                ]}
              >
                {/* Icon */}
                <View
                  style={[
                    styles.timeIcon,
                    selected &&
                      styles.timeIconSelected,
                  ]}
                >
                  <Ionicons
                    name={item.icon}
                    size={rw(22)}
                    color={
                      selected
                        ? colors.white
                        : colors.primary
                    }
                  />
                </View>

                {/* Text */}
                <View style={styles.timeContent}>
                  <FontText
                    variant="body"
                    style={styles.timeLabel}
                  >
                    {item.label}
                  </FontText>

                  <FontText
                    variant="caption"
                    style={styles.timeValue}
                  >
                    {item.time}
                  </FontText>
                </View>

                {/* Checkbox */}
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
                      color={colors.white}
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
          onPress={handleContinue}
        />

        {/* Skip */}
        <Pressable
          onPress={handleSkip}
          style={styles.skipButton}
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
    fontFamily: "Inter-SemiBold",
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

export default NotificationsScreen;
