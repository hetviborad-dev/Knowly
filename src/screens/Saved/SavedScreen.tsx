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
  unsaveFact,
} from "../../services/factInteractionService";


type SavedFact = {
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


const SavedScreen = () => {

  const [facts, setFacts] =
    useState<SavedFact[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [removingId, setRemovingId] =
    useState<string | null>(null);


  // ============================================
  // LOAD SAVED FACTS
  // ============================================

  const loadSavedFacts = async () => {

    try {

      setLoading(true);


      const {
        data: {
          user,
        },
      } = await supabase.auth.getUser();


      if (!user) {
        setFacts([]);
        return;
      }


      const {
        data,
        error,
      } = await supabase

        .from("saved_facts")

        .select(`
          fact_id,
          created_at,
          facts (
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
          )
        `)

        .eq("user_id", user.id)

        .order("created_at", {
          ascending: false,
        });


      if (error) {
        throw error;
      }


      const savedFacts =
        (data ?? [])
          .map(item => item.facts)
          .filter(Boolean) as SavedFact[];


      setFacts(savedFacts);

    } catch (error) {

      console.error(
        "Failed to load saved facts:",
        error,
      );

    } finally {

      setLoading(false);

    }

  };


  // ============================================
  // LOAD WHEN TAB OPENS
  // ============================================

  useFocusEffect(
    useCallback(() => {

      loadSavedFacts();

    }, []),
  );


  // ============================================
  // PULL TO REFRESH
  // ============================================

  const handleRefresh = async () => {

    try {

      setRefreshing(true);

      await loadSavedFacts();

    } finally {

      setRefreshing(false);

    }

  };


  // ============================================
  // UNSAVE
  // ============================================

  const handleUnsave = async (
    factId: string,
  ) => {

    try {

      setRemovingId(factId);


      await unsaveFact(factId);


      setFacts(previous =>
        previous.filter(
          fact => fact.id !== factId,
        ),
      );

    } catch (error) {

      console.error(
        "Failed to unsave fact:",
        error,
      );

    } finally {

      setRemovingId(null);

    }

  };


  // ============================================
  // SHARE
  // ============================================

  const shareFact = async (
    fact: SavedFact,
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
  // CARD
  // ============================================

  const renderFact = ({
    item,
  }: {
    item: SavedFact;
  }) => {

    const isRemoving =
      removingId === item.id;


    return (

      <View
        style={styles.card}
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

          {/* UNSAVE */}

          <Pressable
            onPress={() =>
              handleUnsave(item.id)
            }
            disabled={isRemoving}
            style={
              styles.actionButton
            }
          >

            {isRemoving ? (

              <ActivityIndicator
                size="small"
                color={
                  colors.primary
                }
              />

            ) : (

              <Ionicons
                name="bookmark"
                size={rw(23)}
                color={
                  colors.primary
                }
              />

            )}

            <FontText
              variant="small"
              style={
                styles.actionText
              }
            >
              Unsave
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
              size={rw(23)}
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
          name="bookmark-outline"
          size={rw(52)}
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
          No saved facts
        </FontText>

        <FontText
          variant="body"
          style={
            styles.emptyText
          }
        >
          Facts you save will appear
          here.
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

      <View
        style={styles.header}
      >

        <FontText
          variant="heading1"
          style={styles.headerTitle}
        >
          Saved
        </FontText>

        <FontText
          variant="small"
          style={styles.count}
        >
          {facts.length}{" "}
          {facts.length === 1
            ? "fact"
            : "facts"}
        </FontText>

      </View>


      <FlatList
        data={facts}
        keyExtractor={item =>
          item.id
        }
        renderItem={
          renderFact
        }
        contentContainerStyle={
          styles.listContent
        }
        showsVerticalScrollIndicator={
          false
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
    paddingBottom: rh(12),
  },


  headerTitle: {
    color: colors.text,
  },


  count: {
    color: colors.textMuted,
    marginTop: rh(4),
  },


  listContent: {
    paddingHorizontal: rw(16),
    paddingBottom: rh(30),
  },


  card: {
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
    color: colors.primary,
    fontFamily:
      "Inter-SemiBold",
  },


  title: {
    color: colors.text,
    marginBottom: rh(10),
  },


  content: {
    color:
      colors.textSecondary,
    lineHeight: rf(24),
  },


  source: {
    color:
      colors.textMuted,
    marginTop: rh(12),
  },


  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: rh(18),
    gap: rw(20),
  },


  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: rw(6),
    minWidth: rw(70),
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
    backgroundColor:
      colors.background,
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


export default SavedScreen;