import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";

import AnimatedScreen from "../../components/common/AnimatedScreen";
import FontText from "../../components/common/FontText";
import TopicCard from "../../components/home/TopicCard";
import { colors } from "../../constant/colors";
import { spacing } from "../../constant/spacing";
import { rh } from "../../constant/responsive";
import { getFirstTopic } from "../../services/topicService";

type Topic = {
  id: string;
  category_id: string;
  title: string;
  explanation: string;
  interesting_fact?: string;
};

type HomeScreenProps = {
  navigation: any;
};

const HomeScreen = ({
  navigation,
}: HomeScreenProps) => {
  const [todaysTopic, setTodaysTopic] =
    useState<Topic | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadTopic = async () => {
      try {
        const topic = await getFirstTopic();
        setTodaysTopic(topic);
      } catch (error) {
        console.error("Failed to load topic:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTopic();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="small"
          color={colors.primary}
        />
      </View>
    );
  }

  if (!todaysTopic) {
    return (
      <View style={styles.center}>
        <FontText variant="heading2">
          Nothing to discover yet.
        </FontText>

        <FontText
          variant="body"
          style={styles.emptyText}
        >
          Check back soon for something worth knowing.
        </FontText>
      </View>
    );
  }

  return (
    <AnimatedScreen>

      <View style={styles.section}>

        <TopicCard
          topic={todaysTopic}
          onPress={() =>
            navigation.navigate("Topic", {
              categoryId:
                todaysTopic.category_id,
            })
          }
        />
      </View>
    </AnimatedScreen>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xxxl,
    backgroundColor: colors.background,
  },

  emptyText: {
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.sm,
  },

  header: {
    marginBottom: rh(32),
  },

  subtitle: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  section: {
    marginBottom: rh(30),
  },

  cardSpacing: {
    height: spacing.md,
  },
});

export default HomeScreen;