import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Share,
  StyleSheet,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontText from '../../components/common/FontText';
import { colors } from '../../constant/colors';
import { rh, rw, rr, rf } from '../../constant/responsive';
import { supabase } from '../../lib/supabase';
import {
  getFactInteractions,
  likeFact,
  unlikeFact,
  saveFact,
  unsaveFact,
} from '../../services/factInteractionService';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

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
  categories: { id: string; name: string } | null;
};

const MIX_CATEGORY = 'mix';

const CategoryScreen = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(MIX_CATEGORY);
  const [facts, setFacts] = useState<Fact[]>([]);
  const [likedFacts, setLikedFacts] = useState<string[]>([]);
  const [savedFacts, setSavedFacts] = useState<string[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [factsLoading, setFactsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, icon')
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    setCategories(data ?? []);
  };

  const getFacts = async (categoryId?: string) => {
    let query = supabase
      .from('facts')
      .select(`
        id,
        title,
        content,
        image_url,
        source,
        created_at,
        categories ( id, name )
      `)
      .order('created_at', { ascending: false });

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return (data as Fact[]) ?? [];
  };

  const loadInitialData = async () => {
    try {
      setInitialLoading(true);

      const [loadedCategories, loadedFacts, interactions] = await Promise.all([
        supabase
          .from('categories')
          .select('id, name, slug, icon')
          .order('name', { ascending: true }),
        getFacts(),
        getFactInteractions(),
      ]);

      if (loadedCategories.error) {
        throw loadedCategories.error;
      }

      setCategories(loadedCategories.data ?? []);
      setFacts(loadedFacts);
      setLikedFacts(interactions.likedFactIds);
      setSavedFacts(interactions.savedFactIds);
    } catch (error) {
      console.error('Failed to load Explore:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const loadFactsForCategory = async (categoryId: string) => {
    try {
      setFactsLoading(true);

      const loadedFacts = await getFacts(
        categoryId === MIX_CATEGORY ? undefined : categoryId,
      );

      setFacts(loadedFacts);
    } catch (error) {
      console.error('Failed to load category facts:', error);
      setFacts([]);
    } finally {
      setFactsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadInitialData();
    }, []),
  );

  const handleCategorySelect = (categoryId: string) => {
    if (categoryId === selectedCategory || factsLoading) {
      return;
    }

    setSelectedCategory(categoryId);
    loadFactsForCategory(categoryId);
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      const [loadedFacts, interactions] = await Promise.all([
        getFacts(selectedCategory === MIX_CATEGORY ? undefined : selectedCategory),
        getFactInteractions(),
        loadCategories(),
      ]);

      setFacts(loadedFacts);
      setLikedFacts(interactions.likedFactIds);
      setSavedFacts(interactions.savedFactIds);
    } catch (error) {
      console.error('Failed to refresh Explore:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const toggleLike = async (factId: string) => {
    const isLiked = likedFacts.includes(factId);

    setLikedFacts(previous =>
      isLiked ? previous.filter(id => id !== factId) : [...previous, factId],
    );

    try {
      if (isLiked) {
        await unlikeFact(factId);
      } else {
        await likeFact(factId);
      }
    } catch (error) {
      console.error('Failed to update like:', error);

      setLikedFacts(previous =>
        isLiked ? [...previous, factId] : previous.filter(id => id !== factId),
      );
    }
  };

  const toggleSave = async (factId: string) => {
    const isSaved = savedFacts.includes(factId);

    setSavedFacts(previous =>
      isSaved ? previous.filter(id => id !== factId) : [...previous, factId],
    );

    try {
      if (isSaved) {
        await unsaveFact(factId);
      } else {
        await saveFact(factId);
      }
    } catch (error) {
      console.error('Failed to update save:', error);

      setSavedFacts(previous =>
        isSaved ? [...previous, factId] : previous.filter(id => id !== factId),
      );
    }
  };

  const shareFact = async (fact: Fact) => {
    try {
      await Share.share({
        message: `${fact.title}\n\n${fact.content}`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const renderFact = ({ item }: { item: Fact }) => {
    const isLiked = likedFacts.includes(item.id);
    const isSaved = savedFacts.includes(item.id);

    return (
      <View style={styles.factCard}>
        <View style={styles.factVisual}>
          <View style={styles.factTextArea}>
            <FontText variant="heading2" style={styles.title} numberOfLines={2}>
              {item.title}
            </FontText>

            <FontText variant="body" style={styles.content} numberOfLines={2}>
              {item.content}
            </FontText>
          </View>

          <Pressable
            onPress={() => toggleSave(item.id)}
            hitSlop={12}
            style={styles.bookmarkButton}
          >
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={rw(22)}
              color={isSaved ? colors.primary : '#9B9B9B'}
            />
          </Pressable>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={() => toggleLike(item.id)}
            style={styles.actionButton}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={rw(20)}
              color={isLiked ? colors.error : colors.text}
            />
            <FontText variant="small" style={styles.actionText}>
              Like
            </FontText>
          </Pressable>

          <Pressable
            onPress={() => shareFact(item)}
            style={styles.actionButton}
          >
            <Ionicons name="share-outline" size={rw(20)} color={colors.text} />
            <FontText variant="small" style={styles.actionText}>
              Share
            </FontText>
          </Pressable>
        </View>
      </View>
    );
  };

  const tabData: Category[] = [
    { id: MIX_CATEGORY, name: 'Mix', slug: MIX_CATEGORY, icon: null },
    ...categories,
  ];

  const renderCategoryTab = ({ item }: { item: Category }) => {
    const isSelected = selectedCategory === item.id;
    const iconName: IoniconName =
      item.id === MIX_CATEGORY
        ? 'shuffle-outline'
        : ((item.icon || 'compass-outline') as IoniconName);

    return (
      <Pressable
        onPress={() => handleCategorySelect(item.id)}
        disabled={factsLoading}
        style={[
          styles.tab,
          isSelected && styles.selectedTab,
          factsLoading && styles.disabledTab,
        ]}
      >
        <Ionicons
          name={iconName}
          size={rw(20)}
          color={isSelected ? '#171717' : '#555555'}
          style={styles.tabIcon}
        />

        <FontText
          variant="small"
          style={[styles.tabText, isSelected && styles.selectedTabText]}
        >
          {item.name}
        </FontText>
      </Pressable>
    );
  };

  const renderFactsArea = () => {
    if (factsLoading) {
      return (
        <View style={styles.categoryLoadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <FontText variant="body" style={styles.categoryLoadingText}>
            Finding curious facts...
          </FontText>
        </View>
      );
    }

    if (facts.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="bulb-outline"
            size={rw(45)}
            color={colors.textMuted}
          />
          <FontText variant="heading2" style={styles.emptyTitle}>
            No facts found
          </FontText>
          <FontText variant="body" style={styles.emptyText}>
            There are no facts in this category yet.
          </FontText>
        </View>
      );
    }

    return (
      <FlatList
        data={facts}
        keyExtractor={item => item.id}
        renderItem={renderFact}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.factsListContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      />
    );
  };

  if (initialLoading) {
    return (
      <SafeAreaView edges={['top']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <FontText variant="small" style={styles.eyebrow}>
          EXPLORE
        </FontText>

        <FontText variant="heading1" style={styles.headerTitle}>
          What are you{'\n'}
          <FontText variant="heading1" style={styles.accentTitle}>
            curious
          </FontText>{' '}
          about?
        </FontText>
      </View>

      <View style={styles.tabsWrapper}>
        <FlatList
          horizontal
          data={tabData}
          keyExtractor={item => item.id}
          renderItem={renderCategoryTab}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
          style={styles.tabsList}
        />
      </View>

      <View style={styles.factsArea}>{renderFactsArea()}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F5EF',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F5EF',
  },
  header: {
    paddingHorizontal: rw(20),
    paddingTop: rh(35),
    paddingBottom: rh(20),
  },
  eyebrow: {
    color: '#858585',
    letterSpacing: rw(5),
    fontFamily: 'Inter-SemiBold',
    marginBottom: rh(18),
  },
  headerTitle: {
    color: '#111111',
    fontSize: rf(38),
    lineHeight: rf(45),
    fontFamily: 'PlayfairDisplay-Regular',
  },
  accentTitle: {
    color: '#E9A03A',
    fontStyle: 'italic',
    fontFamily: 'PlayfairDisplay-Italic',
  },
  tabsWrapper: {
    height: rh(58),
    flexGrow: 0,
    flexShrink: 0,
  },
  tabsList: {
    flexGrow: 0,
    flexShrink: 0,
  },
  tabsContent: {
    alignItems: 'center',
    paddingHorizontal: rw(20),
    gap: rw(10),
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    paddingHorizontal: rw(18),
    paddingVertical: rh(11),
    borderRadius: rr(25),
    backgroundColor: '#E9E7E1',
    borderWidth: 1,
    borderColor: '#D4D1CA',
  },
  selectedTab: {
    backgroundColor: '#F2A23B',
    borderColor: '#F2A23B',
  },
  disabledTab: {
    opacity: 0.7,
  },
  tabIcon: {
    marginRight: rw(7),
  },
  tabText: {
    color: '#555555',
    fontFamily: 'Inter-SemiBold',
    fontSize: rf(14),
  },
  selectedTabText: {
    color: '#171717',
  },
  factsArea: {
    flex: 1,
  },
  factsListContent: {
    paddingTop: rh(4),
    paddingBottom: rh(35),
  },
  categoryLoadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: rh(80),
  },
  categoryLoadingText: {
    color: '#858585',
    marginTop: rh(12),
  },
  factCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: rr(24),
    marginHorizontal: rw(20),
    marginBottom: rh(16),
    padding: rw(16),
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  factVisual: {
    flexDirection: 'row',
    minHeight: rh(115),
    position: 'relative',
  },
  factTextArea: {
    flex: 1,
    paddingTop: rh(5),
    paddingRight: rw(24),
  },
  title: {
    color: '#171717',
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: rf(21),
    lineHeight: rf(27),
    marginBottom: rh(8),
  },
  content: {
    color: '#858585',
    fontSize: rf(15),
    lineHeight: rf(21),
  },
  bookmarkButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: rw(4),
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: rw(18),
    marginTop: rh(13),
    paddingTop: rh(12),
    borderTopWidth: 1,
    borderTopColor: '#EFEDE8',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rw(5),
    paddingHorizontal: rw(5),
  },
  actionText: {
    color: '#666666',
    fontSize: rf(12),
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: rw(20),
    paddingBottom: rh(80),
  },
  emptyTitle: {
    color: '#171717',
    marginTop: rh(15),
  },
  emptyText: {
    color: '#858585',
    textAlign: 'center',
    marginTop: rh(8),
  },
});

export default CategoryScreen;
