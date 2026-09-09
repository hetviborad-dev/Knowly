import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Share,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@react-native-vector-icons/ionicons';
import LinearGradient from 'react-native-linear-gradient';

import FontText from '../../components/common/FontText';
import { colors } from '../../constant/colors';
import { rh, rw, rr, rf } from '../../constant/responsive';
import { supabase } from '../../lib/supabase';
import { unsaveFact } from '../../services/factInteractionService';

type SavedFact = {
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

const FALLBACK_GRADIENTS = [
  ['#93B5FF', '#4169B8'],
  ['#F6C16F', '#E68232'],
  ['#B5A0F6', '#6851B7'],
  ['#82D4C7', '#348E88'],
];

const SavedScreen = () => {
  const { width } = useWindowDimensions();
  const [facts, setFacts] = useState<SavedFact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const loadSavedFacts = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setFacts([]);
        return;
      }

      const { data, error } = await supabase
        .from('saved_facts')
        .select(
          `
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
          `,
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const savedFacts = (data ?? [])
        .map(item => item.facts)
        .filter(Boolean) as SavedFact[];

      setFacts(savedFacts);
    } catch (error) {
      console.error('Failed to load saved facts:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSavedFacts();
    }, []),
  );

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadSavedFacts();
    } finally {
      setRefreshing(false);
    }
  };

  const handleUnsave = async (factId: string) => {
    try {
      setRemovingId(factId);
      await unsaveFact(factId);
      setFacts(previous => previous.filter(fact => fact.id !== factId));
    } catch (error) {
      console.error('Failed to unsave fact:', error);
    } finally {
      setRemovingId(null);
    }
  };

  const shareFact = async (fact: SavedFact) => {
    try {
      await Share.share({
        title: fact.title,
        message: `${fact.title}\n\n${fact.content}`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const renderFact = ({ item, index }: { item: SavedFact; index: number }) => {
    const isRemoving = removingId === item.id;
    const gradient = FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length];

    return (
      <View style={styles.cardWrapper}>
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.cardHeader}>
            <View style={styles.categoryRow}>
              <Ionicons
                name="hardware-chip-outline"
                size={rw(17)}
                color="#17233D"
              />
              <FontText variant="small" style={styles.categoryText}>
                {(item.categories?.name || 'GENERAL').toUpperCase()}
              </FontText>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Remove saved fact"
              onPress={() => handleUnsave(item.id)}
              disabled={isRemoving}
              hitSlop={12}
              style={styles.bookmarkButton}
            >
              {isRemoving ? (
                <ActivityIndicator size="small" color="#111827" />
              ) : (
                <Ionicons name="bookmark" size={rw(22)} color="#111827" />
              )}
            </Pressable>
          </View>

          <Pressable onPress={() => shareFact(item)} style={styles.factBody}>
            <FontText
              variant="heading2"
              numberOfLines={4}
              style={styles.factTitle}
            >
              {item.title}
            </FontText>
          </Pressable>
        </LinearGradient>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <FontText variant="small" style={styles.savedLabel}>
          {facts.length} SAVED
        </FontText>
        <FontText variant="heading1" style={styles.headerTitle}>
          Your
        </FontText>
        <FontText variant="heading1" style={styles.headerAccent}>
          library
        </FontText>
      </View>

      {facts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="bookmark-outline"
            size={rw(52)}
            color={colors.textMuted}
          />
          <FontText variant="heading2" style={styles.emptyTitle}>
            No saved facts
          </FontText>
          <FontText variant="body" style={styles.emptyText}>
            Facts you save will appear here.
          </FontText>
        </View>
      ) : (
        <FlatList
          data={facts}
          keyExtractor={item => item.id}
          renderItem={renderFact}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
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
    backgroundColor: '#F8F6EF',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F6EF',
  },
  header: {
    paddingHorizontal: rw(30),
    paddingTop: rh(50),
    paddingBottom: rh(20),
  },
  savedLabel: {
    color: '#898886',
    letterSpacing: rf(4),
    fontSize: rf(13),
    marginBottom: rh(18),
    fontFamily: 'serif',
  },
  headerTitle: {
    color: '#111111',
    fontSize: rf(40),
    lineHeight: rf(40),
    fontFamily: 'inter',
  },
  headerAccent: {
    color: '#E9A03F',
    fontSize: rf(40),
    lineHeight: rf(60),
    fontFamily: 'serif',
  },
  listContent: {
    paddingHorizontal: rw(20),
    paddingBottom: rh(30),
  },
  cardWrapper: {
    borderRadius: rr(27),
    marginBottom: rh(22),
    shadowColor: '#6D7890',
    shadowOffset: { width: 0, height: rh(12) },
    shadowOpacity: 0.22,
    shadowRadius: rr(18),
    elevation: 7,
  },
  card: {
    borderRadius: rr(27),
    paddingHorizontal: rw(20),
    paddingTop: rh(15),
    paddingBottom: rh(15),
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rw(10),
  },
  categoryText: {
    color: '#17233D',
    fontSize: rf(13),
    letterSpacing: rf(2.4),
    fontFamily: 'Inter-SemiBold',
  },
  bookmarkButton: {
    width: rw(48),
    height: rw(48),
    borderRadius: rw(24),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(21, 47, 101, 0.18)',
  },
  factBody: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: rh(15),
  },
  factTitle: {
    color: '#10182D',
    fontSize: rf(16),
    lineHeight: rf(20),
    fontFamily: 'serif',
  },
  factContent: {
    color: '#17233D',
    opacity: 0.9,
    marginTop: rh(11),
    lineHeight: rf(24),
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: rw(40),
  },
  emptyTitle: {
    color: colors.text,
    marginTop: rh(15),
    fontFamily: 'serif',
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: rh(8),
  },
});

export default SavedScreen;
