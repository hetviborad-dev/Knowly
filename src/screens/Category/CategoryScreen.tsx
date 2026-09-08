import React, {
  useCallback,
  useState,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Share,
  StyleSheet,
  View,
} from "react-native";

import {
  useFocusEffect,
} from "@react-navigation/native";

import Ionicons from "@react-native-vector-icons/ionicons";

import FontText from "../../components/common/FontText";

import { colors } from "../../constant/colors";

import {
  rh,
  rw,
  rr,
  rf,
} from "../../constant/responsive";

import { supabase } from "../../lib/supabase";

import {
  getFactInteractions,
  likeFact,
  unlikeFact,
  saveFact,
  unsaveFact,
} from "../../services/factInteractionService";


type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
};


type Fact = {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  source: string | null;
  created_at: string;

  categories:
    | {
        id: string;
        name: string;
      }
    | null;
};


const CategoryScreen = () => {

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [selectedCategory, setSelectedCategory] =
    useState("mix");

  const [facts, setFacts] =
    useState<Fact[]>([]);

  const [likedFacts, setLikedFacts] =
    useState<string[]>([]);

  const [savedFacts, setSavedFacts] =
    useState<string[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);


  // ============================================
  // LOAD CATEGORIES
  // ============================================

  const loadCategories = async () => {

    const {
      data,
      error,
    } = await supabase
      .from("categories")
      .select(`
        id,
        name,
        slug,
        icon
      `)
      .order("name", {
        ascending: true,
      });


    if (error) {
      throw error;
    }


    setCategories(
      data ?? [],
    );

  };


  // ============================================
  // LOAD FACTS
  // ============================================

  const loadFacts = async (
    categoryId?: string,
  ) => {

    let query = supabase
      .from("facts")
      .select(`
        id,
        title,
        content,
        image_url,
        source,
        created_at,
        categories (
          id,
          name
        )
      `)
      .order("created_at", {
        ascending: false,
      });


    // Specific category

    if (categoryId) {

      query = query.eq(
        "category_id",
        categoryId,
      );

    }


    const {
      data,
      error,
    } = await query;


    if (error) {
      throw error;
    }


    setFacts(
      (data as Fact[]) ?? [],
    );

  };


  // ============================================
  // LOAD EVERYTHING
  // ============================================

  const loadExplore = async () => {

    try {

      setLoading(true);


      await loadCategories();


      if (
        selectedCategory === "mix"
      ) {

        await loadFacts();

      } else {

        await loadFacts(
          selectedCategory,
        );

      }


      const interactions =
        await getFactInteractions();


      setLikedFacts(
        interactions.likedFactIds,
      );

      setSavedFacts(
        interactions.savedFactIds,
      );

    } catch (error) {

      console.error(
        "Failed to load Explore:",
        error,
      );

    } finally {

      setLoading(false);

    }

  };


  // ============================================
  // LOAD WHEN SCREEN OPENS
  // ============================================

  useFocusEffect(
    useCallback(() => {

      loadExplore();

    }, [selectedCategory]),
  );


  // ============================================
  // CATEGORY SELECT
  // ============================================

  const handleCategorySelect = (
    categoryId: string,
  ) => {

    if (
      categoryId ===
      selectedCategory
    ) {
      return;
    }


    setSelectedCategory(
      categoryId,
    );

  };


  // ============================================
  // REFRESH
  // ============================================

  const handleRefresh = async () => {

    try {

      setRefreshing(true);

      await loadExplore();

    } finally {

      setRefreshing(false);

    }

  };


  // ============================================
  // LIKE
  // ============================================

  const toggleLike = async (
    factId: string,
  ) => {

    const isLiked =
      likedFacts.includes(
        factId,
      );


    setLikedFacts(
      previous => {

        if (isLiked) {

          return previous.filter(
            id => id !== factId,
          );

        }

        return [
          ...previous,
          factId,
        ];

      },
    );


    try {

      if (isLiked) {

        await unlikeFact(
          factId,
        );

      } else {

        await likeFact(
          factId,
        );

      }

    } catch (error) {

      console.error(
        "Failed to update like:",
        error,
      );


      // Rollback

      setLikedFacts(
        previous => {

          if (isLiked) {

            return [
              ...previous,
              factId,
            ];

          }

          return previous.filter(
            id => id !== factId,
          );

        },
      );

    }

  };


  // ============================================
  // SAVE
  // ============================================

  const toggleSave = async (
    factId: string,
  ) => {

    const isSaved =
      savedFacts.includes(
        factId,
      );


    setSavedFacts(
      previous => {

        if (isSaved) {

          return previous.filter(
            id => id !== factId,
          );

        }

        return [
          ...previous,
          factId,
        ];

      },
    );


    try {

      if (isSaved) {

        await unsaveFact(
          factId,
        );

      } else {

        await saveFact(
          factId,
        );

      }

    } catch (error) {

      console.error(
        "Failed to update save:",
        error,
      );


      // Rollback

      setSavedFacts(
        previous => {

          if (isSaved) {

            return [
              ...previous,
              factId,
            ];

          }

          return previous.filter(
            id => id !== factId,
          );

        },
      );

    }

  };


  // ============================================
  // SHARE
  // ============================================

  const shareFact = async (
    fact: Fact,
  ) => {

    try {

      await Share.share({
        message: fact.content,
      });

    } catch (error) {

      console.error(
        "Share error:",
        error,
      );

    }

  };


  // ============================================
  // FACT CARD
  // ============================================

  const renderFact = ({
    item,
  }: {
    item: Fact;
  }) => {

    const isLiked =
      likedFacts.includes(
        item.id,
      );

    const isSaved =
      savedFacts.includes(
        item.id,
      );


    return (

      <View
        style={styles.factCard}
      >

        {/* CATEGORY */}

        {item.categories?.name && (

          <View
            style={
              styles.categoryBadge
            }
          >

            <FontText
              variant="small"
              style={
                styles.categoryText
              }
            >
              {item.categories.name}
            </FontText>

          </View>

        )}


        {/* TITLE */}

        <FontText
          variant="heading2"
          style={styles.title}
        >
          {item.title}
        </FontText>


        {/* CONTENT */}

        <FontText
          variant="body"
          style={styles.content}
          numberOfLines={4}
        >
          {item.content}
        </FontText>


        {/* SOURCE */}

        {item.source && (

          <FontText
            variant="small"
            style={styles.source}
          >
            Source: {item.source}
          </FontText>

        )}


        {/* ACTIONS */}

        <View
          style={styles.actions}
        >

          {/* LIKE */}

          <Pressable
            onPress={() =>
              toggleLike(item.id)
            }
            style={
              styles.actionButton
            }
          >

            <Ionicons
              name={
                isLiked
                  ? "heart"
                  : "heart-outline"
              }
              size={rw(22)}
              color={
                isLiked
                  ? colors.error
                  : colors.text
              }
            />

            <FontText
              variant="small"
              style={
                styles.actionText
              }
            >
              Like
            </FontText>

          </Pressable>


          {/* SAVE */}

          <Pressable
            onPress={() =>
              toggleSave(item.id)
            }
            style={
              styles.actionButton
            }
          >

            <Ionicons
              name={
                isSaved
                  ? "bookmark"
                  : "bookmark-outline"
              }
              size={rw(22)}
              color={
                isSaved
                  ? colors.primary
                  : colors.text
              }
            />

            <FontText
              variant="small"
              style={
                styles.actionText
              }
            >
              Save
            </FontText>

          </Pressable>


          {/* SHARE */}

          <Pressable
            onPress={() =>
              shareFact(item)
            }
            style={
              styles.actionButton
            }
          >

            <Ionicons
              name="share-outline"
              size={rw(22)}
              color={
                colors.text
              }
            />

            <FontText
              variant="small"
              style={
                styles.actionText
              }
            >
              Share
            </FontText>

          </Pressable>

        </View>

      </View>

    );

  };


  // ============================================
  // LOADING
  // ============================================

  if (loading) {

    return (

      <View
        style={
          styles.loadingContainer
        }
      >

        <ActivityIndicator
          size="large"
          color={
            colors.primary
          }
        />

      </View>

    );

  }


  // ============================================
  // SCREEN
  // ============================================

  return (

    <View
      style={styles.container}
    >

      {/* HEADER */}

      <View
        style={styles.header}
      >

        <FontText
          variant="heading1"
          style={styles.headerTitle}
        >
          Explore
        </FontText>

      </View>


      {/* CATEGORY TABS */}

      <FlatList
        horizontal
        data={[
          {
            id: "mix",
            name: "Mix",
            slug: "mix",
            icon: null,
          },
          ...categories,
        ]}
        keyExtractor={item =>
          item.id
        }
        showsHorizontalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.tabsContent
        }
        renderItem={({
          item,
        }) => {

          const isSelected =
            selectedCategory ===
            item.id;


          return (

            <Pressable
              onPress={() =>
                handleCategorySelect(
                  item.id,
                )
              }
              style={[
                styles.tab,
                isSelected &&
                  styles.selectedTab,
              ]}
            >

              {item.icon && (

                <FontText
                  variant="body"
                  style={
                    styles.tabIcon
                  }
                >
                  {item.icon}
                </FontText>

              )}

              <FontText
                variant="small"
                style={[
                  styles.tabText,
                  isSelected &&
                    styles.selectedTabText,
                ]}
              >
                {item.name}
              </FontText>

            </Pressable>

          );

        }}
      />


      {/* FACTS */}

      {facts.length === 0 ? (

        <View
          style={
            styles.emptyContainer
          }
        >

          <Ionicons
            name="bulb-outline"
            size={rw(45)}
            color={
              colors.textMuted
            }
          />

          <FontText
            variant="heading2"
            style={
              styles.emptyTitle
            }
          >
            No facts found
          </FontText>

          <FontText
            variant="body"
            style={
              styles.emptyText
            }
          >
            There are no facts in
            this category yet.
          </FontText>

        </View>

      ) : (

        <FlatList
          data={facts}
          keyExtractor={item =>
            item.id
          }
          renderItem={
            renderFact
          }
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.listContent
          }
          refreshControl={
            <RefreshControl
              refreshing={
                refreshing
              }
              onRefresh={
                handleRefresh
              }
              tintColor={
                colors.primary
              }
            />
          }
        />

      )}

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


  header: {
    paddingHorizontal: rw(20),
    paddingTop: rh(20),
    paddingBottom: rh(8),
  },


  headerTitle: {
    color: colors.text,
  },


  tabsContent: {
    paddingHorizontal: rw(16),
    paddingVertical: rh(10),
    gap: rw(8),
  },


  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: rw(15),
    paddingVertical: rh(9),
    borderRadius: rr(22),
    backgroundColor:
      colors.white,
    borderWidth: 1,
    borderColor:
      colors.border,
  },


  selectedTab: {
    backgroundColor:
      colors.primary,
    borderColor:
      colors.primary,
  },


  tabIcon: {
    marginRight: rw(5),
  },


  tabText: {
    color:
      colors.textSecondary,
    fontFamily:
      "Inter-SemiBold",
  },


  selectedTabText: {
    color: colors.white,
  },


  listContent: {
    paddingHorizontal: rw(16),
    paddingTop: rh(8),
    paddingBottom: rh(30),
  },


  factCard: {
    backgroundColor:
      colors.white,
    borderRadius: rr(18),
    padding: rw(18),
    marginBottom: rh(14),
    borderWidth: 1,
    borderColor:
      colors.border,
  },


  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: rw(10),
    paddingVertical: rh(5),
    backgroundColor:
      "#EAF5FF",
    borderRadius: rr(20),
    marginBottom: rh(12),
  },


  categoryText: {
    color:
      colors.primary,
    fontFamily:
      "Inter-SemiBold",
  },


  title: {
    color: colors.text,
    marginBottom: rh(9),
  },


  content: {
    color:
      colors.textSecondary,
    lineHeight: rf(23),
  },


  source: {
    color:
      colors.textMuted,
    marginTop: rh(10),
  },


  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: rw(20),
    marginTop: rh(16),
    paddingTop: rh(12),
    borderTopWidth: 1,
    borderTopColor:
      colors.border,
  },


  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: rw(5),
    minWidth: rw(65),
    justifyContent: "center",
  },


  actionText: {
    color:
      colors.textSecondary,
    fontSize: rf(12),
  },


  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rw(40),
  },


  emptyTitle: {
    color: colors.text,
    marginTop: rh(15),
  },


  emptyText: {
    color:
      colors.textSecondary,
    textAlign: "center",
    marginTop: rh(8),
  },

});


export default CategoryScreen;