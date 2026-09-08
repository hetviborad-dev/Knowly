import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Share,
  StyleSheet,
  View,
} from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";

import AnimatedScreen from "../../components/common/AnimatedScreen";
import FontText from "../../components/common/FontText";

import { colors } from "../../constant/colors";
import { spacing } from "../../constant/spacing";
import { rh, rw } from "../../constant/responsive";

import { getUserName } from "../../services/storageService";
import { getTodaysFact } from "../../services/factService";

type Fact = {
  id: string;
  title: string;
  content: string;
  image_url?: string | null;
  source?: string | null;
  created_at: string;
  categories?: {
    id: string;
    name: string;
  } | null;
};

type HomeScreenProps = {
  navigation: any;
};

const HomeScreen = ({
  navigation,
}: HomeScreenProps) => {
  const [username, setUsername] = useState("there");
  const [fact, setFact] = useState<Fact | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadHome = async () => {
      try {
        const [name, todaysFact] = await Promise.all([
          getUserName(),
          getTodaysFact(),
        ]);

        if (name) {
          setUsername(name);
        }

        setFact(todaysFact);
      } catch (error) {
        console.error(
          "Failed to load home:",
          error,
        );
      } finally {
        setLoading(false);
      }
    };

    loadHome();
  }, []);

  const handleShare = async () => {
    if (!fact) {
      return;
    }

    try {
      await Share.share({
        message: fact.content,
      });
    } catch (error) {
      console.error(
        "Failed to share fact:",
        error,
      );
    }
  };

  const handleSave = () => {
    setSaved((current) => !current);

    // We will connect this to Supabase
    // saved facts later.
  };

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

  if (!fact) {
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
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <FontText
            variant="heading2"
            style={styles.greeting}
          >
            Hello, {username}
          </FontText>

          <Pressable
            onPress={() =>
              navigation.navigate("SelectCategories", {
  fromSettings: true,
})
            }
            style={styles.categoryButton}
            hitSlop={10}
          >
            <Ionicons
              name="options-outline"
              size={rw(23)}
              color={colors.text}
            />
          </Pressable>
        </View>

        {/* Today's Fact */}
        <FontText
          variant="heading2"
          style={styles.sectionTitle}
        >
          Today's Fact
        </FontText>

        {/* Fact Card */}
        <View style={styles.factCard}>

          {/* Category */}
          <View style={styles.categoryBadge}>
            <FontText
              variant="caption"
              style={styles.categoryText}
            >
              {fact.categories?.name ?? "Fact"}
            </FontText>
          </View>

          {/* Fact */}
          <FontText
            variant="body"
            style={styles.factText}
          >
            {fact.content}
          </FontText>

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable
              onPress={handleSave}
              style={styles.actionButton}
              hitSlop={8}
            >
              <Ionicons
                name={
                  saved
                    ? "bookmark"
                    : "bookmark-outline"
                }
                size={rw(23)}
                color={
                  saved
                    ? colors.primary
                    : colors.textSecondary
                }
              />
            </Pressable>

            <Pressable
              onPress={handleShare}
              style={styles.actionButton}
              hitSlop={8}
            >
              <Ionicons
                name="share-outline"
                size={rw(23)}
                color={colors.textSecondary}
              />
            </Pressable>
          </View>

        </View>
      </View>
    </AnimatedScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: rw(20),
    paddingTop: rh(20),
    backgroundColor: colors.background,
  },

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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  greeting: {
    color: colors.text,
  },

  categoryButton: {
    width: rw(42),
    height: rw(42),
    borderRadius: rw(21),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },

  sectionTitle: {
    marginTop: rh(32),
    marginBottom: rh(16),
  },

  factCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: rw(20),
    padding: rw(20),
    backgroundColor: colors.white,
  },

  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: rw(12),
    paddingVertical: rh(6),
    borderRadius: rw(20),
    backgroundColor: "#EAF5FF",
  },

  categoryText: {
    color: colors.primary,
    fontFamily: "Inter-SemiBold",
  },

  factText: {
    color: colors.text,
    lineHeight: rh(27),
    marginTop: rh(20),
  },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: rh(28),
    gap: rw(18),
  },

  actionButton: {
    width: rw(36),
    height: rw(36),
    alignItems: "center",
    justifyContent: "center",
  },
});

export default HomeScreen;