import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Animated,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import FontText from "../../components/common/FontText";
import { colors } from "../../constant/colors";
import { spacing } from "../../constant/spacing";
import { rh, rr, rw } from "../../constant/responsive";
import { getCategories } from "../../services/categoryService";

type Category = {
  id: string;
  name: string;
  icon: string;
};

type CategoryCardProps = {
  category: Category;
  index: number;
};

const CategoryCard = ({
  category,
  index,
}: CategoryCardProps) => {
  const scale = useRef(
    new Animated.Value(1),
  ).current;

  const iconBackgrounds = [
    "#EAF5FF",
    "#E6F8F7",
    "#FFF8E8",
  ];

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          transform: [{ scale }],
        },
      ]}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.card}
      >
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor:
                iconBackgrounds[index % 3],
            },
          ]}
        >
          <FontText style={styles.icon}>
            {category.icon}
          </FontText>
        </View>

        <View style={styles.cardContent}>
          <FontText variant="heading3">
            {category.name}
          </FontText>

          <FontText
            variant="small"
            style={styles.count}
          >
            Explore topics
          </FontText>
        </View>

        <View style={styles.arrowContainer}>
          <FontText style={styles.arrow}>
            →
          </FontText>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const CategoryScreen = () => {
  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loading, setLoading] =
    useState(true);

  const fade = useRef(
    new Animated.Value(0),
  ).current;

  const slide = useRef(
    new Animated.Value(20),
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    const loadCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error(
          "Failed to load categories:",
          error,
        );
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [fade, slide]);

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

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fade,
          transform: [
            {
              translateY: slide,
            },
          ],
        },
      ]}
    >
      <FontText
        variant="caption"
        style={styles.eyebrow}
      >
        KNOWLEDGE UNIVERSE
      </FontText>

      <FontText
        variant="heading1"
        style={styles.title}
      >
        Explore
      </FontText>

      <FontText
        variant="body"
        style={styles.subtitle}
      >
        Choose a world of knowledge to discover.
      </FontText>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <CategoryCard
            category={item}
            index={index}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.listContent
        }
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },

  container: {
    flex: 1,
    paddingHorizontal: rw(20),
    paddingTop: rh(24),
    backgroundColor: colors.background,
  },

  eyebrow: {
    color: colors.primary,
    letterSpacing: 1.2,
  },

  title: {
    marginTop: spacing.xs,
  },

  subtitle: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  listContent: {
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
  },

  cardWrapper: {
    marginBottom: spacing.md,
  },

  card: {
    minHeight: rh(90),
    padding: spacing.lg,
    borderRadius: rr(22),
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
  },

  iconContainer: {
    width: rw(58),
    height: rw(58),
    borderRadius: rr(18),
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.lg,
  },

  icon: {
    fontSize: rw(26),
  },

  cardContent: {
    flex: 1,
  },

  count: {
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  arrowContainer: {
    width: rw(42),
    height: rw(42),
    borderRadius: rr(14),
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },

  arrow: {
    color: colors.primary,
    fontSize: rw(20),
  },
});

export default CategoryScreen;