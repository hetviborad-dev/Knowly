import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  Pressable,
  ActivityIndicator,
} from "react-native";

import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../../types/navigation";
import { getTopicsByCategory } from "../../services/topicService";

import { colors } from "../../constant/colors";
import { spacing } from "../../constant/spacing";
import {
  rf,
  rw,
  rh,
  rr,
} from "../../constant/responsive";

import FontText from "../../components/common/FontText";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "Topic"
>;

type Topic = {
  id: string;
  category_id: string;
  title: string;
  explanation: string;
  interesting_fact: string | null;
};

const TopicScreen = ({
  route,
  navigation,
}: Props) => {
  const { categoryId } = route.params;

  const [topics, setTopics] = useState<Topic[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const position = useRef(
    new Animated.ValueXY(),
  ).current;

  const cardScale = position.x.interpolate({
    inputRange: [-400, 0, 400],
    outputRange: [0.94, 1, 0.94],
    extrapolate: "clamp",
  });

  const rotation = position.x.interpolate({
    inputRange: [-300, 0, 300],
    outputRange: ["-7deg", "0deg", "7deg"],
    extrapolate: "clamp",
  });

  useEffect(() => {
    const loadTopics = async () => {
      try {
        const data =
          await getTopicsByCategory(categoryId);

        setTopics(data ?? []);
      } catch (error) {
        console.error(
          "Error loading topics:",
          error,
        );
      } finally {
        setLoading(false);
      }
    };

    loadTopics();
  }, [categoryId]);

  const resetCardPosition = () => {
    Animated.spring(position, {
      toValue: {
        x: 0,
        y: 0,
      },
      useNativeDriver: true,
      tension: 80,
      friction: 8,
    }).start();
  };

  const goToNextTopic = () => {
    if (currentIndex < topics.length - 1) {
      position.setValue({
        x: 0,
        y: 0,
      });

      setCurrentIndex(
        previousIndex => previousIndex + 1,
      );
    } else {
      navigation.goBack();
    }
  };

  const goToPreviousTopic = () => {
    if (currentIndex > 0) {
      position.setValue({
        x: 0,
        y: 0,
      });

      setCurrentIndex(
        previousIndex => previousIndex - 1,
      );
    }
  };

  const handleSwipe = (
    direction: "left" | "right",
  ) => {
    const targetX =
      direction === "left" ? -500 : 500;

    Animated.timing(position, {
      toValue: {
        x: targetX,
        y: 0,
      },
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      if (direction === "left") {
        goToNextTopic();
      } else {
        goToPreviousTopic();
      }
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,

      onMoveShouldSetPanResponder: (
        _,
        gesture,
      ) =>
        Math.abs(gesture.dx) > 10 ||
        Math.abs(gesture.dy) > 10,

      onPanResponderMove: (_, gesture) => {
        position.setValue({
          x: gesture.dx,
          y: gesture.dy * 0.25,
        });
      },

      onPanResponderRelease: (_, gesture) => {
        const swipeDistance = 120;

        if (Math.abs(gesture.dx) > swipeDistance) {
          if (
            gesture.dx < 0 &&
            currentIndex === topics.length - 1
          ) {
            handleSwipe("left");
            return;
          }

          if (
            gesture.dx > 0 &&
            currentIndex === 0
          ) {
            resetCardPosition();
            return;
          }

          handleSwipe(
            gesture.dx < 0
              ? "left"
              : "right",
          );
        } else {
          resetCardPosition();
        }
      },
    }),
  ).current;

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

  if (topics.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <FontText style={styles.emptyIconText}>
            💡
          </FontText>
        </View>

        <FontText
          variant="heading2"
          style={styles.emptyTitle}
        >
          Nothing to discover yet.
        </FontText>

        <FontText
          variant="body"
          style={styles.emptyText}
        >
          This category doesn't have any topics yet.
        </FontText>

        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.backToExploreButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <FontText
            variant="bodyMedium"
            style={styles.backToExploreText}
          >
            Go back
          </FontText>
        </Pressable>
      </View>
    );
  }

  const currentTopic = topics[currentIndex];

  const progress =
    ((currentIndex + 1) / topics.length) * 100;

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.iconButtonPressed,
          ]}
        >
          <FontText style={styles.backText}>
            ‹
          </FontText>
        </Pressable>

        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: `${progress}%`,
                },
              ]}
            />
          </View>

          <FontText
            variant="caption"
            style={styles.progressText}
          >
            {currentIndex + 1}/{topics.length}
          </FontText>
        </View>
      </View>

      {/* Topic Card */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.card,
          {
            transform: [
              {
                translateX: position.x,
              },
              {
                translateY: position.y,
              },
              {
                rotate: rotation,
              },
              {
                scale: cardScale,
              },
            ],
          },
        ]}
      >
        {/* Decorative Circle */}
        <View style={styles.decorativeCircle} />

        {/* Category */}
        <View style={styles.cardHeader}>
          <View style={styles.categoryBadge}>
            <View style={styles.categoryDot} />

            <FontText
              variant="caption"
              style={styles.categoryText}
            >
              KNOWLY
            </FontText>
          </View>

          <FontText
            variant="caption"
            style={styles.topicNumber}
          >
            #{currentIndex + 1}
          </FontText>
        </View>

        {/* Topic */}
        <View style={styles.topicContent}>
          <FontText
            variant="heading1"
            style={styles.title}
          >
            {currentTopic.title}
          </FontText>

          <View style={styles.divider} />

          <FontText
            variant="body"
            style={styles.explanation}
          >
            {currentTopic.explanation}
          </FontText>
        </View>

        {/* Interesting Fact */}
        {currentTopic.interesting_fact && (
          <View style={styles.factContainer}>
            <View style={styles.factIconContainer}>
              <FontText style={styles.factIcon}>
                💡
              </FontText>
            </View>

            <View style={styles.factContent}>
              <FontText
                variant="bodyMedium"
                style={styles.factTitle}
              >
                Interesting fact
              </FontText>

              <FontText
                variant="small"
                style={styles.fact}
              >
                {currentTopic.interesting_fact}
              </FontText>
            </View>
          </View>
        )}

        {/* Swipe Hint */}
        <View style={styles.swipeHintContainer}>
          <FontText
            variant="caption"
            style={styles.swipeHint}
          >
            SWIPE TO DISCOVER
          </FontText>
        </View>
      </Animated.View>

      {/* Controls */}
      <View style={styles.controls}>
        <Pressable
          onPress={goToPreviousTopic}
          disabled={currentIndex === 0}
          style={({ pressed }) => [
            styles.controlButton,
            currentIndex === 0 &&
              styles.controlButtonDisabled,
            pressed &&
              currentIndex !== 0 &&
              styles.controlButtonPressed,
          ]}
        >
          <FontText
            style={[
              styles.controlText,
              currentIndex === 0 &&
                styles.controlTextDisabled,
            ]}
          >
            ←
          </FontText>
        </Pressable>

        <View style={styles.controlCenter}>
          <View style={styles.controlDot} />

          <FontText
            variant="caption"
            style={styles.controlHint}
          >
            Keep exploring
          </FontText>
        </View>

        <Pressable
          onPress={goToNextTopic}
          style={({ pressed }) => [
            styles.controlButton,
            pressed &&
              styles.controlButtonPressed,
          ]}
        >
          <FontText style={styles.controlText}>
            →
          </FontText>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: rw(20),
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },

  /* Empty */

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rw(32),
    backgroundColor: colors.background,
  },

  emptyIcon: {
    width: rw(64),
    height: rw(64),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF5FF",
    borderRadius: rr(22),
    marginBottom: spacing.lg,
  },

  emptyIconText: {
    fontSize: rf(30),
  },

  emptyTitle: {
    color: colors.text,
    textAlign: "center",
  },

  emptyText: {
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.sm,
  },

  backToExploreButton: {
    marginTop: spacing.xl,
    paddingHorizontal: rw(22),
    paddingVertical: rh(12),
    backgroundColor: colors.surface,
    borderRadius: rr(18),
  },

  backToExploreText: {
    color: colors.text,
  },

  buttonPressed: {
    opacity: 0.7,
  },

  /* Top Bar */

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: rh(12),
    marginBottom: rh(16),
  },

  backButton: {
    width: rw(42),
    height: rw(42),
    alignItems: "center",
    justifyContent: "center",
    marginRight: rw(10),
    backgroundColor: colors.surface,
    borderRadius: rr(14),
  },

  backText: {
    fontSize: rf(32),
    lineHeight: rf(34),
    fontFamily: "Inter-Regular",
    color: colors.text,
    marginTop: rh(-3),
  },

  iconButtonPressed: {
    opacity: 0.6,
  },

  progressContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  progressBackground: {
    flex: 1,
    height: rh(6),
    overflow: "hidden",
    backgroundColor: colors.border,
    borderRadius: rr(10),
  },

  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: rr(10),
  },

  progressText: {
    width: rw(44),
    marginLeft: rw(10),
    textAlign: "right",
    color: colors.textSecondary,
  },

  /* Card */

  card: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
    padding: rw(24),
    backgroundColor: colors.primary,
    borderRadius: rr(30),
  },

  decorativeCircle: {
    position: "absolute",
    width: rw(230),
    height: rw(230),
    borderRadius: rw(115),
    right: rw(-100),
    top: rh(-100),
    backgroundColor:
      "rgba(255,255,255,0.10)",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: rw(11),
    paddingVertical: rh(7),
    backgroundColor:
      "rgba(255,255,255,0.17)",
    borderRadius: rr(20),
  },

  categoryDot: {
    width: rw(6),
    height: rw(6),
    borderRadius: rr(3),
    marginRight: rw(7),
    backgroundColor: colors.white,
  },

  categoryText: {
    color: colors.white,
    fontSize: rf(10),
    letterSpacing: 1.2,
  },

  topicNumber: {
    color: "rgba(255,255,255,0.65)",
  },

  topicContent: {
    marginTop: rh(38),
  },

  title: {
    color: colors.white,
    fontSize: rf(29),
    lineHeight: rf(36),
    letterSpacing: -0.5,
  },

  divider: {
    width: rw(40),
    height: rh(3),
    marginTop: rh(22),
    marginBottom: rh(20),
    backgroundColor: colors.accent,
    borderRadius: rr(3),
  },

  explanation: {
    fontSize: rf(17),
    lineHeight: rf(27),
    color: "rgba(255,255,255,0.9)",
  },

  /* Fact */

  factContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: rh(28),
    padding: rw(16),
    backgroundColor:
      "rgba(255,255,255,0.13)",
    borderRadius: rr(20),
  },

  factIconContainer: {
    width: rw(38),
    height: rw(38),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderRadius: rr(13),
    marginRight: rw(12),
  },

  factIcon: {
    fontSize: rf(18),
  },

  factContent: {
    flex: 1,
  },

  factTitle: {
    fontSize: rf(14),
    color: colors.white,
    marginBottom: spacing.xs,
  },

  fact: {
    color: "rgba(255,255,255,0.82)",
    lineHeight: rf(20),
  },

  /* Swipe Hint */

  swipeHintContainer: {
    marginTop: "auto",
    alignItems: "center",
  },

  swipeHint: {
    fontSize: rf(9),
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 1.4,
  },

  /* Controls */

  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: rh(14),
  },

  controlButton: {
    width: rw(50),
    height: rw(50),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderRadius: rr(18),
  },

  controlButtonPressed: {
    transform: [
      {
        scale: 0.94,
      },
    ],
  },

  controlButtonDisabled: {
    backgroundColor: "#FAFAFA",
  },

  controlText: {
    fontSize: rf(22),
    fontFamily: "Inter-SemiBold",
    color: colors.text,
  },

  controlTextDisabled: {
    color: colors.textMuted,
  },

  controlCenter: {
    flexDirection: "row",
    alignItems: "center",
  },

  controlDot: {
    width: rw(6),
    height: rw(6),
    borderRadius: rr(3),
    backgroundColor: colors.secondary,
    marginRight: rw(7),
  },

  controlHint: {
    color: colors.textMuted,
  },
});

export default TopicScreen;