import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';

import AnimatedScreen from '../../components/common/AnimatedScreen';
import FontText from '../../components/common/FontText';

import { colors } from '../../constant/colors';
import { spacing } from '../../constant/spacing';
import { rh, rw } from '../../constant/responsive';

import { getUserName } from '../../services/storageService';
import { getTodaysFact } from '../../services/factService';
import Logo from '../../assets/svgs/logo.svg';
import { SafeAreaView } from 'react-native-safe-area-context';

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

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const [username, setUsername] = useState('there');
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
        console.error('Failed to load home:', error);
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
        title: fact.title || "Today's fact",
        message: `${fact.content}${
          fact.source ? `\n\nSource: ${fact.source}` : ''
        }`,
      });
    } catch (error) {
      console.error('Failed to share fact:', error);
    }
  };

  const handleSave = () => {
    setSaved(current => !current);
  };

  const handleCategorySelection = () => {
    navigation.navigate('SelectCategories', {
      fromSettings: true,
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  if (!fact) {
    return (
      <View style={styles.center}>
        <View style={styles.emptyIcon}>
          <Ionicons
            name="sparkles-outline"
            size={rw(30)}
            color={colors.primary}
          />
        </View>

        <FontText variant="heading2" style={styles.emptyTitle}>
          Nothing to discover yet.
        </FontText>

        <FontText variant="body" style={styles.emptyText}>
          Check back soon for something worth knowing.
        </FontText>

        <Pressable
          onPress={handleCategorySelection}
          style={styles.emptyCategoryButton}
        >
          <Ionicons name="options-outline" size={rw(19)} color={colors.white} />

          <FontText variant="body" style={styles.emptyCategoryButtonText}>
            Choose interests
          </FontText>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView
    edges={['top']}
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      <View style={styles.header}>
        <View style={styles.brandGroup}>
          <View style={styles.logoMark}>
            {/* <Ionicons
                name="bulb-outline"
                size={rw(21)}
                color={colors.primary}
              /> */}
            <Logo width={rw(44)} height={rw(44)} />
          </View>

          <View>
            <FontText variant="caption" style={styles.eyebrow}>
              DISCOVER SOMETHING NEW
            </FontText>

            <FontText variant="heading2" style={styles.greeting}>
              Hello, {username}
            </FontText>
          </View>
        </View>

        <Pressable
          onPress={handleCategorySelection}
          style={styles.categoryButton}
          hitSlop={10}
        >
          <Ionicons name="options-outline" size={rw(22)} color={colors.text} />
        </Pressable>
      </View>
      {/* <AnimatedScreen> */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
        {/* Header: app mark + greeting on left, category selector on right */}

        {/* Screen section title */}
        <View style={styles.titleRow}>
          <FontText variant="heading2" style={styles.sectionTitle}>
            Today&apos;s{' '}
            <FontText variant="heading2" style={styles.sectionTitleAccent}>
              fact
            </FontText>
          </FontText>
        </View>

        {/* Main fact card */}
        <View style={styles.factCard}>
          {/* Visual gradient-like decorative circles */}
          <View style={styles.glowLarge} />
          <View style={styles.glowSmall} />
          <View style={styles.cardOverlay} />

          <View style={styles.cardContent}>
            <View style={styles.cardTopRow}>
              <View style={styles.categoryBadge}>
                <FontText variant="caption" style={styles.categoryText}>
                  {(fact.categories?.name ?? 'Fact').toUpperCase()}
                </FontText>
              </View>
            </View>

            <View style={styles.factMainContent}>
              {fact.title ? (
                <FontText variant="body" style={styles.factTitle}>
                  {fact.title}
                </FontText>
              ) : null}

              <FontText variant="body" style={styles.factText}>
                {fact.content}
              </FontText>
            </View>

            {/* No "Read more" action, as requested */}
            <View style={styles.cardFooter}>
              <View style={styles.actions}>
                <Pressable
                  onPress={handleSave}
                  style={[
                    styles.actionButton,
                    saved && styles.savedActionButton,
                  ]}
                  hitSlop={8}
                >
                  <Ionicons
                    name={saved ? 'bookmark' : 'bookmark-outline'}
                    size={rw(21)}
                    color={saved ? colors.primary : colors.white}
                  />
                </Pressable>

                <Pressable
                  onPress={handleShare}
                  style={styles.actionButton}
                  hitSlop={8}
                >
                  <Ionicons
                    name="share-outline"
                    size={rw(21)}
                    color={colors.white}
                  />
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* Small support message below the card */}
        <View style={styles.discoveryNote}>
          <View style={styles.discoveryIcon}>
            <Ionicons name="sparkles" size={rw(17)} color={colors.primary} />
          </View>

          <FontText variant="caption" style={styles.discoveryText}>
            A new fact is waiting for you every day.
          </FontText>
        </View>
      </ScrollView>
      {/* </AnimatedScreen> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xxxl - spacing.sm,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
    backgroundColor: colors.background,
  },

  emptyIcon: {
    width: rw(62),
    height: rw(62),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: rw(31),
    backgroundColor: '#FFF1D9',
    marginBottom: rh(18),
  },

  emptyTitle: {
    color: colors.text,
    textAlign: 'center',
  },

  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: rh(22),
    marginTop: spacing.sm,
  },

  emptyCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: rw(8),
    minHeight: rh(46),
    borderRadius: rw(24),
    paddingHorizontal: rw(18),
    marginTop: rh(24),
    backgroundColor: colors.primary,
  },

  emptyCategoryButtonText: {
    color: colors.white,
    fontFamily: 'Inter-SemiBold',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxxl - spacing.sm,
  },

  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: rw(12),
  },

  logoMark: {
    width: rw(45),
    height: rw(45),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: rw(15),
    marginRight: rw(11),
    backgroundColor: '#FFF0D5',
  },

  eyebrow: {
    color: colors.textSecondary,
    fontSize: rw(9),
    letterSpacing: rw(1),
    marginBottom: rh(2),
  },

  greeting: {
    color: colors.text,
    fontSize: rw(20),
    lineHeight: rh(25),
  },

  categoryButton: {
    width: rw(44),
    height: rw(44),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: rw(22),
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },

  titleRow: {
    marginTop: rh(34),
    marginBottom: rh(16),
  },

  sectionTitle: {
    color: colors.text,
    fontSize: rw(31),
    lineHeight: rh(39),
  },

  sectionTitleAccent: {
    color: colors.primary,
    fontSize: rw(31),
    fontStyle: 'italic',
    fontFamily: 'serif',
  },

  factCard: {
    // minHeight: rh(420),
    flexGrow: 1,
    overflow: 'hidden',
    borderRadius: rw(28),
    backgroundColor: '#1E1E1B',
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: rw(20),
    shadowOffset: {
      width: 0,
      height: rh(12),
    },
    elevation: 8,
  },

  glowLarge: {
    position: 'absolute',
    width: rw(330),
    height: rw(330),
    borderRadius: rw(165),
    top: rh(-130),
    right: rw(-115),
    opacity: 0.82,
    backgroundColor: '#A88F30',
  },

  glowSmall: {
    position: 'absolute',
    width: rw(245),
    height: rw(245),
    borderRadius: rw(123),
    top: rh(24),
    left: rw(-165),
    opacity: 0.18,
    backgroundColor: '#EFE6A2',
  },

  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.24)',
  },

  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
    padding: rw(22),
  },

  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  categoryBadge: {
    alignSelf: 'flex-start',
    borderRadius: rw(16),
    paddingHorizontal: rw(13),
    paddingVertical: rh(7),
    backgroundColor: 'rgba(255,255,255,0.17)',
  },

  categoryText: {
    color: colors.white,
    fontFamily: 'Inter-SemiBold',
    fontSize: rw(10),
    letterSpacing: rw(1.1),
  },

  readTimeText: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: rw(12),
  },

  factMainContent: {
    marginTop: rh(28),
  },

  factNumber: {
    color: '#F2A537',
    fontSize: rw(78),
    lineHeight: rh(86),
    fontWeight: '400',
    fontStyle: 'italic',
    fontFamily: 'serif',
    letterSpacing: rw(-2),
  },

  factTitle: {
    color: 'rgba(255,255,255,0.78)',
    fontFamily: 'Inter-SemiBold',
    lineHeight: rh(22),
    marginTop: rh(10),
  },

  factText: {
    color: colors.white,
    fontSize: rw(22),
    lineHeight: rh(32),
    fontFamily: 'serif',
    marginTop: rh(16),
  },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: rh(22),
  },

  sourceWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: rw(6),
    paddingRight: rw(10),
  },

  sourceText: {
    color: 'rgba(255,255,255,0.58)',
    fontSize: rw(11),
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rw(10),
  },

  actionButton: {
    width: rw(43),
    height: rw(43),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: rw(22),
    backgroundColor: 'rgba(255,255,255,0.17)',
  },

  savedActionButton: {
    backgroundColor: 'rgba(255,255,255,0.92)',
  },

  discoveryNote: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: rh(22),
  },

  discoveryIcon: {
    width: rw(28),
    height: rw(28),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: rw(14),
    marginRight: rw(8),
    backgroundColor: '#FFF0D5',
  },

  discoveryText: {
    color: colors.textSecondary,
    fontSize: rw(12),
  },
});

export default HomeScreen;
