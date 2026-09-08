import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@react-native-vector-icons/ionicons";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { supabase } from "../../lib/supabase";

import FontText from "../../components/common/FontText";

import { colors } from "../../constant/colors";
import { spacing } from "../../constant/spacing";

import {
  rf,
  rw,
  rh,
  rr,
} from "../../constant/responsive";

import {
  getSelectedCategories,
  saveSelectedCategories,
} from "../../services/storageService";

import type { RootStackParamList } from "../../types/navigation";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "SelectCategories"
>;

type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
};

const SelectCategoriesScreen = ({
  navigation,
  route,
}: Props) => {
  const isFromSettings =
    route.params?.fromSettings === true;

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [selectedCategories, setSelectedCategories] =
    useState<string[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);

      // Get all categories
      const {
        data,
        error,
      } = await supabase
        .from("categories")
        .select(
          "id, name, slug, icon, description",
        )
        .order("name");

      if (error) {
        throw error;
      }

      setCategories(data ?? []);

      // --------------------------------
      // SETTINGS / RESELECTION MODE
      // --------------------------------

      if (isFromSettings) {
        const {
          data: {
            user,
          },
        } = await supabase.auth.getUser();

        if (!user) {
          return;
        }

        const {
          data: userCategories,
          error: userCategoriesError,
        } = await supabase
          .from("user_categories")
          .select("category_id")
          .eq("user_id", user.id);

        if (userCategoriesError) {
          throw userCategoriesError;
        }

        const selectedIds =
          userCategories?.map(
            item => item.category_id,
          ) ?? [];

        setSelectedCategories(selectedIds);

        // Keep AsyncStorage synchronized
        await saveSelectedCategories(
          selectedIds,
        );
      }

      // --------------------------------
      // ONBOARDING MODE
      // --------------------------------

      else {
        const savedCategories =
          await getSelectedCategories();

        setSelectedCategories(
          savedCategories,
        );
      }
    } catch (error) {
      console.error(
        "Failed to load categories:",
        error,
      );

      Alert.alert(
        "Something went wrong",
        "Unable to load categories. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (
    categoryId: string,
  ) => {
    setSelectedCategories(previous => {
      if (
        previous.includes(categoryId)
      ) {
        return previous.filter(
          id => id !== categoryId,
        );
      }

      return [
        ...previous,
        categoryId,
      ];
    });
  };

  const saveCategoriesToSupabase = async () => {
    const {
      data: {
        user,
      },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error(
        "User is not logged in.",
      );
    }

    // Remove old selections
    const {
      error: deleteError,
    } = await supabase
      .from("user_categories")
      .delete()
      .eq("user_id", user.id);

    if (deleteError) {
      throw deleteError;
    }

    // Insert new selections
    if (
      selectedCategories.length > 0
    ) {
      const rows =
        selectedCategories.map(
          categoryId => ({
            user_id: user.id,
            category_id: categoryId,
          }),
        );

      const {
        error: insertError,
      } = await supabase
        .from("user_categories")
        .insert(rows);

      if (insertError) {
        throw insertError;
      }
    }

    // Also update local storage
    await saveSelectedCategories(
      selectedCategories,
    );
  };

  const handleContinue = async () => {
    // At least 2 categories required
    if (
      selectedCategories.length < 2
    ) {
      Alert.alert(
        "Select at least 2",
        "Choose at least 2 categories to personalize your facts.",
      );

      return;
    }

    try {
      setSaving(true);

      // --------------------------------
      // RESELECTION FROM HOME / PROFILE
      // --------------------------------

      if (isFromSettings) {
        await saveCategoriesToSupabase();

        // Go back to the previous screen
        navigation.goBack();

        return;
      }

      // --------------------------------
      // ONBOARDING
      // --------------------------------

      await saveSelectedCategories(
        selectedCategories,
      );

      navigation.navigate("Auth");
    } catch (error) {
      console.error(
        "Failed to save categories:",
        error,
      );

      Alert.alert(
        "Save failed",
        "We couldn't save your categories. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}

        <View style={styles.header}>
          <FontText
            variant="heading1"
            style={styles.title}
          >
            {isFromSettings
              ? "Your categories"
              : "What are you interested in?"}
          </FontText>

          <FontText
            variant="body"
            style={styles.subtitle}
          >
            {isFromSettings
              ? "Choose the topics you want to discover."
              : "Pick at least 2 topics to personalize your facts."}
          </FontText>
        </View>

        {/* Selected count */}

        <View style={styles.selectedContainer}>
          <FontText
            variant="small"
            style={styles.selectedText}
          >
            {selectedCategories.length} selected
          </FontText>

          {selectedCategories.length < 2 && (
            <FontText
              variant="small"
              style={styles.minimumText}
            >
              • Select at least 2
            </FontText>
          )}
        </View>

        {/* Categories */}

        <View style={styles.grid}>
          {categories.map(category => {
            const isSelected =
              selectedCategories.includes(
                category.id,
              );

            return (
              <Pressable
                key={category.id}
                onPress={() =>
                  toggleCategory(
                    category.id,
                  )
                }
                style={({ pressed }) => [
                  styles.categoryCard,
                  isSelected &&
                    styles.categoryCardSelected,
                  pressed &&
                    styles.categoryCardPressed,
                ]}
              >
                {/* Icon */}

                <View
                  style={[
                    styles.iconContainer,
                    isSelected &&
                      styles.iconContainerSelected,
                  ]}
                >
                  <FontText
                    style={styles.categoryIcon}
                  >
                    {category.icon || "✨"}
                  </FontText>
                </View>

                {/* Name */}

                <FontText
                  variant="bodyMedium"
                  style={[
                    styles.categoryName,
                    isSelected &&
                      styles.categoryNameSelected,
                  ]}
                  numberOfLines={2}
                >
                  {category.name}
                </FontText>

                {/* Check */}

                <View
                  style={[
                    styles.checkContainer,
                    isSelected &&
                      styles.checkContainerSelected,
                  ]}
                >
                  {isSelected && (
                    <Ionicons
                      name="checkmark"
                      size={rw(15)}
                      color={colors.white}
                    />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Button */}

      <View style={styles.bottomContainer}>
        <Pressable
          onPress={handleContinue}
          disabled={
            saving ||
            selectedCategories.length < 2
          }
          style={({ pressed }) => [
            styles.continueButton,
            selectedCategories.length <
              2 &&
              styles.continueButtonDisabled,
            saving &&
              styles.continueButtonDisabled,
            pressed &&
              selectedCategories.length >=
                2 &&
              styles.continueButtonPressed,
          ]}
        >
          {saving ? (
            <ActivityIndicator
              size="small"
              color={colors.white}
            />
          ) : (
            <>
              <FontText
                variant="bodyMedium"
                style={styles.continueText}
              >
                {isFromSettings
                  ? "Save changes"
                  : "Continue"}
              </FontText>

              <Ionicons
                name={
                  isFromSettings
                    ? "checkmark"
                    : "arrow-forward"
                }
                size={rw(20)}
                color={colors.white}
              />
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      colors.background,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      colors.background,
  },

  scrollContent: {
    paddingHorizontal: rw(20),
    paddingTop: rh(28),
    paddingBottom: rh(120),
  },

  header: {
    marginBottom: rh(20),
  },

  title: {
    color: colors.text,
    marginBottom: rh(8),
  },

  subtitle: {
    color: colors.textSecondary,
    lineHeight: rf(22),
  },

  selectedContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: rh(16),
  },

  selectedText: {
    color: colors.primary,
    fontFamily: "Inter-SemiBold",
  },

  minimumText: {
    color: colors.textMuted,
    marginLeft: rw(6),
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent:
      "space-between",
  },

  categoryCard: {
    width: "48%",
    minHeight: rh(130),
    backgroundColor:
      colors.surface,
    borderRadius: rr(20),
    padding: rw(15),
    marginBottom: rh(14),
    borderWidth: 1.5,
    borderColor:
      colors.border,
    position: "relative",
  },

  categoryCardSelected: {
    backgroundColor: "#EAF5FF",
    borderColor:
      colors.primary,
  },

  categoryCardPressed: {
    opacity: 0.7,
  },

  iconContainer: {
    width: rw(46),
    height: rw(46),
    borderRadius: rr(15),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      colors.white,
    marginBottom: rh(12),
  },

  iconContainerSelected: {
    backgroundColor:
      colors.white,
  },

  categoryIcon: {
    fontSize: rf(23),
  },

  categoryName: {
    color: colors.text,
    paddingRight: rw(18),
  },

  categoryNameSelected: {
    color: colors.primary,
    fontFamily: "Inter-SemiBold",
  },

  checkContainer: {
    position: "absolute",
    top: rw(13),
    right: rw(13),
    width: rw(23),
    height: rw(23),
    borderRadius: rr(12),
    borderWidth: 1.5,
    borderColor:
      colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      colors.white,
  },

  checkContainerSelected: {
    backgroundColor:
      colors.primary,
    borderColor:
      colors.primary,
  },

  bottomContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: rw(20),
    paddingTop: rh(12),
    paddingBottom: rh(20),
    backgroundColor:
      colors.background,
    borderTopWidth: 1,
    borderTopColor:
      colors.border,
  },

  continueButton: {
    height: rh(54),
    borderRadius: rr(18),
    backgroundColor:
      colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rw(9),
  },

  continueButtonDisabled: {
    opacity: 0.45,
  },

  continueButtonPressed: {
    opacity: 0.75,
  },

  continueText: {
    color: colors.white,
  },
});

export default SelectCategoriesScreen;