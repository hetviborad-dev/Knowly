import React, { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  Share,
  StyleSheet,
  View,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';

import Ionicons from '@react-native-vector-icons/ionicons';

import FontText from '../../components/common/FontText';

import { colors } from '../../constant/colors';

import { rh, rw, rr, rf } from '../../constant/responsive';

import { getSelectedCategories } from '../../services/storageService';

import {
  getFactInteractions,
  likeFact,
  unlikeFact,
  saveFact,
  unsaveFact,
} from '../../services/factInteractionService';

import { supabase } from '../../lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';

type Fact = {
  id: string;

  title: string;

  content: string;

  image_url: string | null;

  source: string | null;

  created_at: string;

  categories: {
    id: string;
    name: string;
  } | null;
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const FactsScreen = () => {
  const [facts, setFacts] = useState<Fact[]>([]);

  const [loading, setLoading] = useState(true);

  const [likedFacts, setLikedFacts] = useState<string[]>([]);

  const [savedFacts, setSavedFacts] = useState<string[]>([]);

  useEffect(() => {
    loadFacts();
  }, []);

  const loadFacts = async () => {
    try {
      setLoading(true);

      const selectedCategories = await getSelectedCategories();

      let query = supabase
        .from('facts')
        .select(
          `
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
        `,
        )
        .order('created_at', {
          ascending: false,
        });

      if (selectedCategories.length > 0) {
        query = query.in('category_id', selectedCategories);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setFacts((data as Fact[]) ?? []);

      const interactions = await getFactInteractions();

      setLikedFacts(interactions.likedFactIds);

      setSavedFacts(interactions.savedFactIds);
    } catch (error) {
      console.error('Failed to load facts:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (factId: string) => {
    const isLiked = likedFacts.includes(factId);

    setLikedFacts(previous => {
      if (isLiked) {
        return previous.filter(id => id !== factId);
      }

      return [...previous, factId];
    });

    try {
      if (isLiked) {
        await unlikeFact(factId);
      } else {
        await likeFact(factId);
      }
    } catch (error) {
      console.error('Failed to update like:', error);

      setLikedFacts(previous => {
        if (isLiked) {
          return [...previous, factId];
        }

        return previous.filter(id => id !== factId);
      });
    }
  };

  const toggleSave = async (factId: string) => {
    const isSaved = savedFacts.includes(factId);

    setSavedFacts(previous => {
      if (isSaved) {
        return previous.filter(id => id !== factId);
      }

      return [...previous, factId];
    });

    try {
      if (isSaved) {
        await unsaveFact(factId);
      } else {
        await saveFact(factId);
      }
    } catch (error) {
      console.error('Failed to update save:', error);

      setSavedFacts(previous => {
        if (isSaved) {
          return [...previous, factId];
        }

        return previous.filter(id => id !== factId);
      });
    }
  };

  const shareFact = async (fact: Fact) => {
    try {
      await Share.share({
        message: fact.content,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const renderFact = ({ item }: { item: Fact }) => {
    const isLiked = likedFacts.includes(item.id);

    const isSaved = savedFacts.includes(item.id);

    return (
      <LinearGradient
        colors={['#6C6A3A', '#4F5030', '#303127', '#171816', '#090A0A']}
        locations={[0, 0.22, 0.48, 0.72, 1]}
        start={{ x: 0.95, y: 0 }}
        end={{ x: 0.25, y: 1 }}
        style={styles.factContainer}
      >
        <View style={styles.factContent}>
          {item.categories?.name && (
            <View style={styles.categoryBadge}>
              <FontText variant="small" style={styles.categoryText}>
                {item.categories.name}
              </FontText>
            </View>
          )}

          <FontText variant="heading1" style={styles.title}>
            {item.title}
          </FontText>

          <FontText variant="body" style={styles.content}>
            {item.content}
          </FontText>

          {item.source && (
            <FontText variant="small" style={styles.source}>
              Source: {item.source}
            </FontText>
          )}
        </View>


        <View style={styles.actions}>

          <Pressable
            onPress={() => toggleLike(item.id)}
            style={styles.actionButton}
          >
            <View style={styles.actionIconCircle}>
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={rw(30)}
                color={isLiked ? colors.error : '#F5F3EC'}
              />
            </View>

            <FontText variant="small" style={styles.actionText}>
              Like
            </FontText>
          </Pressable>


          <Pressable
            onPress={() => toggleSave(item.id)}
            style={styles.actionButton}
          >
            <View style={styles.actionIconCircle}>
              <Ionicons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={rw(30)}
                color={isSaved ? '#F5A63D' : '#F5F3EC'}
              />
            </View>

            <FontText variant="small" style={styles.actionText}>
              Save
            </FontText>
          </Pressable>


          <Pressable
            onPress={() => shareFact(item)}
            style={styles.actionButton}
          >
            <View style={styles.actionIconCircle}>
              <Ionicons name="share-outline" size={rw(30)} color="#F5F3EC" />
            </View>

            <FontText variant="small" style={styles.actionText}>
              Share
            </FontText>
          </Pressable>
        </View>
      </LinearGradient>
    );
  };


  if (loading) {
    return (
      <LinearGradient
        colors={['#5F603B', '#262820', '#090A0A']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color="#F5A63D" />
      </LinearGradient>
    );
  }


  if (facts.length === 0) {
    return (
      <LinearGradient
        colors={['#5F603B', '#262820', '#090A0A']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.emptyContainer}
      >
        <Ionicons name="bulb-outline" size={rw(48)} color="#CBC9C1" />

        <FontText variant="heading2" style={styles.emptyTitle}>
          No facts yet
        </FontText>

        <FontText variant="body" style={styles.emptyText}>
          We couldn't find facts for your selected categories.
        </FontText>
      </LinearGradient>
    );
  }

  // ============================================
  // SCREEN
  // ============================================

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <FlatList
        data={facts}
        keyExtractor={item => item.id}
        renderItem={renderFact}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        snapToAlignment="start"
        bounces={false}
        removeClippedSubviews
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ============================================
  // CONTAINER
  // ============================================

  container: {
    flex: 1,
    backgroundColor: '#090A0A',
  },

  // ============================================
  // LOADING
  // ============================================

  loadingContainer: {
    flex: 1,

    alignItems: 'center',

    justifyContent: 'center',
  },

  // ============================================
  // FACT
  // ============================================

  factContainer: {
    height: SCREEN_HEIGHT,

    paddingHorizontal: rw(22),

    paddingTop: rh(30),

    paddingBottom: rh(35),

    position: 'relative',
  },

  factContent: {
    flex: 1,

    paddingRight: rw(65),
  },

  // ============================================
  // CATEGORY
  // ============================================

  categoryBadge: {
    alignSelf: 'flex-start',

    paddingHorizontal: rw(12),

    paddingVertical: rh(6),

    backgroundColor: 'rgba(30, 31, 29, 0.45)',

    borderRadius: rr(20),

    marginBottom: rh(20),

    borderWidth: 1,

    borderColor: 'rgba(255, 255, 255, 0.08)',
  },

  categoryText: {
    color: '#F5F3EC',

    fontFamily: 'Inter-SemiBold',
  },

  // ============================================
  // TITLE
  // ============================================

  title: {
    color: '#F7F5EF',

    marginBottom: rh(18),
  },

  // ============================================
  // CONTENT
  // ============================================

  content: {
    color: '#F0EEE8',

    lineHeight: rf(27),
  },

  // ============================================
  // SOURCE
  // ============================================

  source: {
    color: '#D0CEC8',

    marginTop: rh(18),

    opacity: 0.8,
  },

  // ============================================
  // ACTIONS
  // ============================================

  actions: {
    position: 'absolute',

    right: rw(14),

    bottom: rh(150),

    alignItems: 'center',

    justifyContent: 'flex-end',

    gap: rh(25),
  },

  actionButton: {
    alignItems: 'center',

    justifyContent: 'center',

    width: rw(52),
  },

  actionIconCircle: {
    width: rw(52),

    height: rw(52),

    borderRadius: rr(26),

    alignItems: 'center',

    justifyContent: 'center',

    backgroundColor: 'rgba(34, 35, 34, 0.70)',

    borderWidth: 1,

    borderColor: 'rgba(255, 255, 255, 0.14)',
  },

  actionText: {
    color: '#F0EEE8',

    fontSize: rf(11),

    marginTop: rh(4),
  },

  // ============================================
  // EMPTY
  // ============================================

  emptyContainer: {
    flex: 1,

    alignItems: 'center',

    justifyContent: 'center',

    paddingHorizontal: rw(40),
  },

  emptyTitle: {
    color: '#F7F5EF',

    marginTop: rh(15),
  },

  emptyText: {
    color: '#D0CEC8',

    textAlign: 'center',

    marginTop: rh(8),
  },
});

export default FactsScreen;
