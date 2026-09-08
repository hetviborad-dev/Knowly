import React, {
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  Share,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@react-native-vector-icons/ionicons";

import FontText from "../../components/common/FontText";

import { colors } from "../../constant/colors";

import {
  rh,
  rw,
  rr,
  rf,
} from "../../constant/responsive";

import {
  getSelectedCategories,
} from "../../services/storageService";

import {
  getFactInteractions,
  likeFact,
  unlikeFact,
  saveFact,
  unsaveFact,
} from "../../services/factInteractionService";

import { supabase } from "../../lib/supabase";


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


const { height: SCREEN_HEIGHT } =
  Dimensions.get("window");


const FactsScreen = () => {

  const [facts, setFacts] =
    useState<Fact[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [likedFacts, setLikedFacts] =
    useState<string[]>([]);

  const [savedFacts, setSavedFacts] =
    useState<string[]>([]);


  useEffect(() => {
    loadFacts();
  }, []);


  // ============================================
  // LOAD FACTS
  // ============================================

  const loadFacts = async () => {

    try {

      setLoading(true);

      const selectedCategories =
        await getSelectedCategories();


      // Load facts

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


      if (
        selectedCategories.length > 0
      ) {

        query = query.in(
          "category_id",
          selectedCategories,
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


      // Load likes + saves

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
        "Failed to load facts:",
        error,
      );

    } finally {

      setLoading(false);

    }

  };


  // ============================================
  // LIKE / UNLIKE
  // ============================================

  const toggleLike = async (
    factId: string,
  ) => {

    const isLiked =
      likedFacts.includes(factId);


    // Update UI immediately

    setLikedFacts(previous => {

      if (isLiked) {

        return previous.filter(
          id => id !== factId,
        );

      }

      return [
        ...previous,
        factId,
      ];

    });


    try {

      if (isLiked) {

        await unlikeFact(factId);

      } else {

        await likeFact(factId);

      }

    } catch (error) {

      console.error(
        "Failed to update like:",
        error,
      );


      // Rollback UI

      setLikedFacts(previous => {

        if (isLiked) {

          return [
            ...previous,
            factId,
          ];

        }

        return previous.filter(
          id => id !== factId,
        );

      });

    }

  };


  // ============================================
  // SAVE / UNSAVE
  // ============================================

  const toggleSave = async (
    factId: string,
  ) => {

    const isSaved =
      savedFacts.includes(factId);


    // Update UI immediately

    setSavedFacts(previous => {

      if (isSaved) {

        return previous.filter(
          id => id !== factId,
        );

      }

      return [
        ...previous,
        factId,
      ];

    });


    try {

      if (isSaved) {

        await unsaveFact(factId);

      } else {

        await saveFact(factId);

      }

    } catch (error) {

      console.error(
        "Failed to update save:",
        error,
      );


      // Rollback UI

      setSavedFacts(previous => {

        if (isSaved) {

          return [
            ...previous,
            factId,
          ];

        }

        return previous.filter(
          id => id !== factId,
        );

      });

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
      likedFacts.includes(item.id);

    const isSaved =
      savedFacts.includes(item.id);


    return (

      <View
        style={
          styles.factContainer
        }
      >

        {/* FACT CONTENT */}

        <View
          style={
            styles.factContent
          }
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
            variant="heading1"
            style={styles.title}
          >
            {item.title}
          </FontText>


          {/* CONTENT */}

          <FontText
            variant="body"
            style={styles.content}
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

        </View>


        {/* RIGHT ACTIONS */}

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
              size={rw(30)}
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
              size={rw(30)}
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
              size={rw(30)}
              color={colors.text}
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
          color={colors.primary}
        />

      </View>

    );

  }


  // ============================================
  // EMPTY
  // ============================================

  if (facts.length === 0) {

    return (

      <View
        style={
          styles.emptyContainer
        }
      >

        <Ionicons
          name="bulb-outline"
          size={rw(48)}
          color={colors.textMuted}
        />

        <FontText
          variant="heading2"
          style={
            styles.emptyTitle
          }
        >
          No facts yet
        </FontText>

        <FontText
          variant="body"
          style={
            styles.emptyText
          }
        >
          We couldn't find facts for
          your selected categories.
        </FontText>

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

      <FlatList
        data={facts}
        keyExtractor={item => item.id}
        renderItem={renderFact}
        pagingEnabled
        showsVerticalScrollIndicator={
          false
        }
        decelerationRate="fast"
        snapToAlignment="start"
        bounces={false}
      />

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


  factContainer: {
    height: SCREEN_HEIGHT,
    paddingHorizontal: rw(22),
    paddingTop: rh(30),
    paddingBottom: rh(35),
    position: "relative",
  },


  factContent: {
    flex: 1,
    paddingRight: rw(65),
  },


  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: rw(12),
    paddingVertical: rh(6),
    backgroundColor: "#EAF5FF",
    borderRadius: rr(20),
    marginBottom: rh(20),
  },


  categoryText: {
    color: colors.primary,
    fontFamily: "Inter-SemiBold",
  },


  title: {
    color: colors.text,
    marginBottom: rh(18),
  },


  content: {
    color: colors.textSecondary,
    lineHeight: rf(27),
  },


  source: {
    color: colors.textMuted,
    marginTop: rh(18),
  },


  actions: {
    position: "absolute",
    right: rw(14),
    bottom: rh(100),
    alignItems: "center",
    justifyContent: "flex-end",
    gap: rh(25),
  },


  actionButton: {
    alignItems: "center",
    justifyContent: "center",
    width: rw(52),
  },


  actionText: {
    color: colors.textSecondary,
    fontSize: rf(11),
    marginTop: rh(4),
  },


  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rw(40),
    backgroundColor:
      colors.background,
  },


  emptyTitle: {
    color: colors.text,
    marginTop: rh(15),
  },


  emptyText: {
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: rh(8),
  },

});


export default FactsScreen;