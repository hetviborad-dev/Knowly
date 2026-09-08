import React from "react";
import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { colors } from "../../constant/colors";
import { spacing } from "../../constant/spacing";
import { rh, rr, rw } from "../../constant/responsive";
import FontText from "../common/FontText";

type Topic = {
  title: string;
  explanation: string;
};

type TopicCardProps = {
  topic: Topic;
  onPress: () => void;
};

const TopicCard = ({
  topic,
  onPress,
}: TopicCardProps) => {
  return (
    <Pressable
      onPress={onPress}
      style={styles.card}
    >
      <View style={styles.decorativeCircle} />

      <View style={styles.topRow}>
        <View style={styles.badge}>
          <FontText
            variant="caption"
            style={styles.badgeText}
          >
            TODAY'S PICK
          </FontText>
        </View>

        <View style={styles.iconContainer}>
          <FontText style={styles.icon}>
            💡
          </FontText>
        </View>
      </View>

      <View style={styles.content}>
        <FontText
          variant="heading1"
          style={styles.title}
        >
          {topic.title}
        </FontText>

        <FontText
          variant="body"
          style={styles.description}
        >
          {topic.explanation}
        </FontText>
      </View>

      <View style={styles.discoverButton}>
        <FontText
          variant="bodyMedium"
          style={styles.discoverText}
        >
          Discover
        </FontText>

        <FontText style={styles.arrow}>
          →
        </FontText>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    minHeight: rh(390),
    padding: spacing.xxl - 2,
    borderRadius: rr(28),
    backgroundColor: colors.primary,
    overflow: "hidden",
  },

  decorativeCircle: {
    position: "absolute",
    width: rw(180),
    height: rw(180),
    borderRadius: rw(90),
    backgroundColor: "rgba(255,255,255,0.08)",
    right: -60,
    top: -50,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: rr(20),
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  badgeText: {
    color: colors.white,
  },

  iconContainer: {
    width: rw(46),
    height: rw(46),
    borderRadius: rr(15),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },

  icon: {
    fontSize: rw(22),
  },

  content: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: spacing.xxl,
  },

  title: {
    color: colors.white,
    fontSize: rw(27),
    lineHeight: rh(34),
  },

  description: {
    color: "rgba(255,255,255,0.82)",
    marginTop: spacing.md,
  },

  discoverButton: {
    height: rw(50),
    borderRadius: rr(16),
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },

  discoverText: {
    color: colors.primary,
  },

  arrow: {
    color: colors.primary,
    fontSize: rw(20),
  },
});

export default TopicCard;