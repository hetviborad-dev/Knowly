import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  BackHandler,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@react-native-vector-icons/ionicons";

import type {
  NativeStackScreenProps,
} from "@react-navigation/native-stack";

import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

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

import {
  saveOnboardingStep,
  saveSelectedCategories,
  getSelectedCategories
} from "../../services/storageService";

import type {
  RootStackParamList,
} from "../../types/navigation";

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

const REQUIRED_COUNT = 2;

const SelectCategoriesScreen = ({
  navigation,
  route,
}: Props) => {
  const insets =
    useSafeAreaInsets();

  const isFromSettings =
    route.params?.fromSettings === true;

  const [
    categories,
    setCategories,
  ] = useState<Category[]>([]);

  const [
    selectedCategories,
    setSelectedCategories,
  ] = useState<string[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  /*
   * Disable Android back
   * ONLY during onboarding.
   */
  useEffect(() => {
    if (isFromSettings) {
      return;
    }

    const subscription =
      BackHandler.addEventListener(
        "hardwareBackPress",
        () => true,
      );

    return () => {
      subscription.remove();
    };
  }, [isFromSettings]);

  /*
   * Load categories
   */
  const loadCategories =
    useCallback(async () => {
      try {
        setLoading(true);

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

        setCategories(
          data ?? [],
        );

        /*
         * SETTINGS MODE
         */
        if (isFromSettings) {
          const {
            data: {
              user,
            },
          } =
            await supabase.auth.getUser();

          if (!user) {
            throw new Error(
              "User is not logged in.",
            );
          }

          const {
            data: userCategories,
            error:
              userCategoriesError,
          } = await supabase
            .from("user_categories")
            .select(
              "category_id",
            )
            .eq(
              "user_id",
              user.id,
            );

          if (
            userCategoriesError
          ) {
            throw userCategoriesError;
          }

          const selectedIds =
            userCategories?.map(
              item =>
                item.category_id,
            ) ?? [];

          setSelectedCategories(
            selectedIds,
          );

          await saveSelectedCategories(
            selectedIds,
          );

          return;
        }

        /*
         * ONBOARDING MODE
         */
        const savedCategories =
          await getSelectedCategories();

        setSelectedCategories(
          savedCategories.slice(
            0,
            REQUIRED_COUNT,
          ),
        );
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
    }, [
      isFromSettings,
    ]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  /*
   * Toggle category
   */
  const toggleCategory = (
    categoryId: string,
  ) => {
    setSelectedCategories(
      previous => {
        /*
         * Selected → remove
         */
        if (
          previous.includes(
            categoryId,
          )
        ) {
          return previous.filter(
            id =>
              id !== categoryId,
          );
        }

        /*
         * ONBOARDING:
         * Maximum exactly 2.
         */
        if (
          !isFromSettings &&
          previous.length >=
            REQUIRED_COUNT
        ) {
          return previous;
        }

        /*
         * SETTINGS:
         * Unlimited.
         */
        return [
          ...previous,
          categoryId,
        ];
      },
    );
  };

  /*
   * Save to Supabase
   */
  const saveCategoriesToSupabase =
    async () => {
      const {
        data: {
          user,
        },
      } =
        await supabase.auth.getUser();

      if (!user) {
        throw new Error(
          "User is not logged in.",
        );
      }

      /*
       * Delete old selections
       */
      const {
        error: deleteError,
      } = await supabase
        .from("user_categories")
        .delete()
        .eq(
          "user_id",
          user.id,
        );

      if (deleteError) {
        throw deleteError;
      }

      /*
       * Insert new selections
       */
      if (
        selectedCategories.length >
        0
      ) {
        const rows =
          selectedCategories.map(
            categoryId => ({
              user_id: user.id,
              category_id:
                categoryId,
            }),
          );

        const {
          error: insertError,
        } =
          await supabase
            .from(
              "user_categories",
            )
            .insert(rows);

        if (insertError) {
          throw insertError;
        }
      }

      /*
       * Keep AsyncStorage synced
       */
      await saveSelectedCategories(
        selectedCategories,
      );
    };

  /*
   * Continue / Save
   */
  const handleContinue =
    async () => {
      /*
       * Minimum 2
       */
      if (
        selectedCategories.length <
        REQUIRED_COUNT
      ) {
        return;
      }

      try {
        setSaving(true);

        /*
         * SETTINGS
         */
        if (isFromSettings) {
          await saveCategoriesToSupabase();

          navigation.goBack();

          return;
        }

        /*
         * ONBOARDING
         */
        await saveSelectedCategories(
          selectedCategories,
        );
await saveOnboardingStep("CATEGORIES");

        navigation.replace(
          "Auth",
        );
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

  const remaining =
    Math.max(
      REQUIRED_COUNT -
        selectedCategories.length,
      0,
    );

  const isComplete =
    selectedCategories.length >=
    REQUIRED_COUNT;

  const progress =
    Math.min(
      selectedCategories.length,
      REQUIRED_COUNT,
    ) / REQUIRED_COUNT;

  /*
   * Category card
   */
  const renderCategory = ({
    item,
  }: {
    item: Category;
  }) => {
    const isSelected =
      selectedCategories.includes(
        item.id,
      );

    /*
     * During onboarding:
     * once 2 are selected,
     * disable unselected cards.
     */
    const isDisabled =
      !isFromSettings &&
      !isSelected &&
      selectedCategories.length >=
        REQUIRED_COUNT;

    return (
      <Pressable
        onPress={() =>
          toggleCategory(item.id)
        }
        disabled={isDisabled}
        style={({ pressed }) => [
          styles.categoryCard,

          isSelected &&
            styles.categoryCardSelected,

          isDisabled &&
            styles.categoryCardDisabled,

          pressed &&
            styles.categoryCardPressed,
        ]}
      >
        <View
          style={
            styles.iconContainer
          }
        >
          <Ionicons
            name={
              (item.icon ||
                "sparkles-outline") as any
            }
            size={rf(25)}
            color={
              isSelected
                ? colors.accent
                : colors.white
            }
          />
        </View>

        <FontText
          variant="bodyMedium"
          style={[
            styles.categoryName,

            isSelected &&
              styles.categoryNameSelected,
          ]}
          numberOfLines={2}
        >
          {item.name}
        </FontText>

        {isSelected && (
          <View
            style={
              styles.checkContainer
            }
          >
            <Ionicons
              name="checkmark"
              size={rf(13)}
              color="#141414"
            />
          </View>
        )}
      </Pressable>
    );
  };

  /*
   * Loading
   */
  if (loading) {
    return (
      <SafeAreaView
        style={
          styles.loadingContainer
        }
        edges={[
          "top",
          "bottom",
        ]}
      >
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={[
        "top",
        "bottom",
      ]}
    >
      {/* TOP BAR */}

      <View style={styles.topBar}>
        {isFromSettings ? (
          <Pressable
            onPress={() =>
              navigation.goBack()
            }
            style={({
              pressed,
            }) => [
              styles.backButton,

              pressed &&
                styles.iconButtonPressed,
            ]}
            hitSlop={10}
          >
            <Ionicons
              name="chevron-back"
              size={rw(20)}
              color={colors.white}
            />
          </Pressable>
        ) : (
          /*
           * Empty space keeps
           * progress aligned.
           */
          <View
            style={
              styles.backButtonPlaceholder
            }
          />
        )}

        {!isFromSettings ? (
          <>
            <View
              style={
                styles.progressContainer
              }
            >
              <View
                style={
                  styles.progressBackground
                }
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${
                        progress * 100
                      }%`,
                    },
                  ]}
                />
              </View>
            </View>

            <FontText
              variant="small"
              style={
                styles.progressLabel
              }
            >
              {
                selectedCategories.length
              }
              /{REQUIRED_COUNT}
            </FontText>
          </>
        ) : (
          <View
            style={
              styles.settingsTopTitle
            }
          >
            <FontText
              variant="bodyMedium"
              style={
                styles.settingsTitle
              }
            >
              Categories
            </FontText>
          </View>
        )}
      </View>

      {/* HEADER */}

      <View style={styles.header}>
        <FontText
          variant="caption"
          style={styles.eyebrow}
        >
          {isFromSettings
            ? "YOUR INTERESTS"
            : "STEP 1 OF 3 · TASTE"}
        </FontText>

        <FontText
          variant="display"
          style={styles.title}
        >
          {isFromSettings ? (
            "Choose what you want to discover."
          ) : (
            <>
              Pick two things you'll
              never stop{" "}
              <FontText
                variant="display"
                style={
                  styles.titleAccent
                }
              >
                wondering
              </FontText>{" "}
              about.
            </>
          )}
        </FontText>

        <FontText
          variant="body"
          style={styles.subtitle}
        >
          {isFromSettings
            ? "Select 2 or more categories. You can change your interests anytime."
            : "Choose exactly 2 categories to personalize your facts."}
        </FontText>
      </View>

      {/* CATEGORIES */}

      <FlatList
        data={categories}
        renderItem={
          renderCategory
        }
        keyExtractor={item =>
          item.id
        }
        numColumns={3}
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={[
          styles.listContent,
          {
            paddingBottom:
              rh(110) +
              insets.bottom,
          },
        ]}
        columnWrapperStyle={
          styles.columnWrapper
        }
        initialNumToRender={12}
        removeClippedSubviews
      />

      {/* BOTTOM BUTTON */}

      <View
        style={[
          styles.bottomContainer,
          {
            paddingBottom:
              insets.bottom +
              rh(14),
          },
        ]}
      >
        <Pressable
          onPress={
            handleContinue
          }
          disabled={
            saving ||
            !isComplete
          }
          style={({
            pressed,
          }) => [
            styles.continueButton,

            !isComplete &&
              styles.continueButtonDisabled,

            saving &&
              styles.continueButtonDisabled,

            pressed &&
              isComplete &&
              styles.continueButtonPressed,
          ]}
        >
          {saving ? (
            <ActivityIndicator
              size="small"
              color={colors.white}
            />
          ) : (
            <FontText
              variant="bodyMedium"
              style={[
                styles.continueText,

                isComplete &&
                  styles.continueTextActive,
              ]}
            >
              {isComplete
                ? isFromSettings
                  ? "Save changes"
                  : "Continue"
                : `Pick ${remaining} more`}
            </FontText>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default SelectCategoriesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#141414",
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#141414",
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: rw(20),
    paddingTop: rh(10),
    paddingBottom: rh(10),
    gap: rw(14),
  },

  backButton: {
    width: rw(40),
    height: rw(40),
    borderRadius: rr(20),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(255,255,255,0.08)",
  },

  backButtonPlaceholder: {
    width: rw(40),
    height: rw(40),
  },

  iconButtonPressed: {
    opacity: 0.65,
  },

  progressContainer: {
    flex: 1,
  },

  progressBackground: {
    height: rh(4),
    borderRadius: rr(4),
    backgroundColor:
      "rgba(255,255,255,0.15)",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor:
      "rgba(255,255,255,0.6)",
    borderRadius: rr(4),
  },

  progressLabel: {
    color:
      "rgba(255,255,255,0.5)",
    fontSize: rf(13),
  },

  settingsTopTitle: {
    flex: 1,
  },

  settingsTitle: {
    color: colors.white,
    fontSize: rf(17),
  },

  header: {
    paddingHorizontal: rw(20),
    paddingTop: rh(10),
    paddingBottom: rh(18),
  },

  eyebrow: {
    color: colors.accent,
    letterSpacing: 1.4,
    fontSize: rf(12),
    marginBottom: rh(16),
  },

  title: {
    color: colors.white,
    fontSize: rf(32),
    lineHeight: rf(39),
  },

  titleAccent: {
    color: colors.accent,
    fontStyle: "italic",
    fontSize: rf(32),
    lineHeight: rf(39),
  },

  subtitle: {
    color:
      "rgba(255,255,255,0.55)",
    lineHeight: rf(22),
    marginTop: rh(12),
  },

  listContent: {
    paddingHorizontal: rw(20),
    paddingTop: rh(4),
  },

  columnWrapper: {
    justifyContent:
      "space-between",
    marginBottom: rh(12),
  },

  categoryCard: {
    width: "31.5%",
    minHeight: rh(112),
    backgroundColor:
      "rgba(255,255,255,0.06)",
    borderRadius: rr(18),
    padding: rw(13),
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.10)",
    justifyContent:
      "space-between",
    position: "relative",
  },

  categoryCardSelected: {
    backgroundColor:
      "rgba(255,172,4,0.14)",
    borderColor:
      colors.accent,
  },

  categoryCardDisabled: {
    opacity: 0.35,
  },

  categoryCardPressed: {
    opacity: 0.7,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  iconContainer: {
    width: rw(38),
    height: rw(38),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: rr(12),
    backgroundColor:
      "rgba(255,255,255,0.06)",
  },

  categoryName: {
    color: colors.white,
    fontSize: rf(14),
    marginTop: rh(10),
    paddingRight: rw(4),
  },

  categoryNameSelected: {
    color: colors.accent,
  },

  checkContainer: {
    position: "absolute",
    top: rw(10),
    right: rw(10),
    width: rw(22),
    height: rw(22),
    borderRadius: rr(11),
    backgroundColor:
      colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },

  bottomContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: rw(20),
    paddingTop: rh(14),
    backgroundColor:
      "rgba(20,20,20,0.96)",
  },

  continueButton: {
    height: rh(56),
    borderRadius: rr(30),
    backgroundColor:
      "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },

  continueButtonDisabled: {
    backgroundColor:
      "rgba(255,255,255,0.08)",
  },

  continueButtonPressed: {
    backgroundColor:
      "rgba(255,255,255,0.16)",
  },

  continueText: {
    color:
      "rgba(255,255,255,0.40)",
  },

  continueTextActive: {
    color: colors.white,
  },
});