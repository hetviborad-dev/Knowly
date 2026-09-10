import React, {
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';

import type {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import FontText from '../../components/common/FontText';

import { colors } from '../../constant/colors';

import {
  rh,
  rw,
  rr,
  rf,
} from '../../constant/responsive';

import { supabase } from '../../lib/supabase';

import type {
  RootStackParamList,
} from '../../types/navigation';

import {
  getAndSaveFCMToken,
} from '../../services/pushNotificationService';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'NotificationSettings'
>;

const TIMES = [
  {
    id: 'morning',
    label: 'Morning',
    time: '9:00 AM',
    icon: 'sunny-outline',
  },
  {
    id: 'afternoon',
    label: 'Afternoon',
    time: '2:00 PM',
    icon: 'partly-sunny-outline',
  },
  {
    id: 'evening',
    label: 'Evening',
    time: '7:00 PM',
    icon: 'moon-outline',
  },
];

const NotificationSettingsScreen = ({
  navigation,
}: Props) => {
  const [
    notificationsEnabled,
    setNotificationsEnabled,
  ] = useState(false);

  const [
    selectedTimes,
    setSelectedTimes,
  ] = useState<string[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);

      const {
        data: {
          user,
        },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert(
          'Error',
          'Unable to find your account.',
        );

        navigation.goBack();

        return;
      }

      const {
        data,
        error,
      } = await supabase
        .from('user_notification_settings')
        .select(
          `
            enabled,
            morning,
            afternoon,
            evening
          `,
        )
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.log(
          'Load notification preferences error:',
          error,
        );

        Alert.alert(
          'Error',
          'Unable to load notification settings.',
        );

        return;
      }

      if (!data) {
        setNotificationsEnabled(false);
        setSelectedTimes([]);

        return;
      }

      setNotificationsEnabled(
        data.enabled,
      );

      const times: string[] = [];

      if (data.morning) {
        times.push('morning');
      }

      if (data.afternoon) {
        times.push('afternoon');
      }

      if (data.evening) {
        times.push('evening');
      }

      setSelectedTimes(times);
    } catch (error) {
      console.log(
        'Notification settings error:',
        error,
      );

      Alert.alert(
        'Error',
        'Something went wrong.',
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleTime = (id: string) => {
    setSelectedTimes(current => {
      if (current.includes(id)) {
        return current.filter(
          time => time !== id,
        );
      }

      return [...current, id];
    });
  };

  const handleToggleNotifications = (
    value: boolean,
  ) => {
    setNotificationsEnabled(value);
  };

  const handleSave = async () => {
    if (
      notificationsEnabled &&
      selectedTimes.length === 0
    ) {
      Alert.alert(
        'Choose a time',
        'Please select at least one time for your daily facts.',
      );

      return;
    }

    try {
      setSaving(true);

      const {
        data: {
          user,
        },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert(
          'Error',
          'Unable to find your account.',
        );

        return;
      }

      /*
       * If notifications are enabled,
       * make sure we have permission and
       * a valid FCM token.
       */
      if (notificationsEnabled) {
        const token =
          await getAndSaveFCMToken();

        if (!token) {
          Alert.alert(
            'Notifications unavailable',
            'Please allow notifications for Knowly and try again.',
          );

          return;
        }
      }

      /*
       * Save notification settings.
       */
      const {
        error,
      } = await supabase
        .from('user_notification_settings')
        .upsert(
          {
            user_id: user.id,

            enabled:
              notificationsEnabled,

            morning:
              notificationsEnabled &&
              selectedTimes.includes(
                'morning',
              ),

            afternoon:
              notificationsEnabled &&
              selectedTimes.includes(
                'afternoon',
              ),

            evening:
              notificationsEnabled &&
              selectedTimes.includes(
                'evening',
              ),

            timezone:
              'Asia/Kolkata',

            notifications_per_day:
              notificationsEnabled
                ? selectedTimes.length
                : 0,

            updated_at:
              new Date().toISOString(),
          },
          {
            onConflict: 'user_id',
          },
        );

      if (error) {
        console.log(
          'Save notification settings error:',
          error,
        );

        Alert.alert(
          'Error',
          'Unable to save your notification settings.',
        );

        return;
      }

      Alert.alert(
        'Saved',
        notificationsEnabled
          ? 'Your daily fact notifications are enabled.'
          : 'Daily fact notifications are turned off.',
        [
          {
            text: 'OK',
            onPress: () =>
              navigation.goBack(),
          },
        ],
      );
    } catch (error) {
      console.log(
        'Save notification settings error:',
        error,
      );

      Alert.alert(
        'Error',
        'Something went wrong while saving.',
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
          styles.contentContainer
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}

        <View style={styles.header}>
          <Pressable
            onPress={() =>
              navigation.goBack()
            }
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={rf(22)}
              color={colors.text}
            />
          </Pressable>

          <View style={styles.headerText}>
            <FontText
              variant="h3"
              style={styles.title}
            >
              Daily facts
            </FontText>

            <FontText
              variant="body"
              style={styles.subtitle}
            >
              Choose when you want Knowly to send
              you fascinating facts.
            </FontText>
          </View>
        </View>

        {/* Notification toggle */}

        <View style={styles.toggleCard}>
          <View style={styles.toggleIcon}>
            <Ionicons
              name="notifications-outline"
              size={rf(24)}
              color={colors.primary}
            />
          </View>

          <View style={styles.toggleContent}>
            <FontText
              variant="bodyMedium"
              style={styles.toggleTitle}
            >
              Daily fact notifications
            </FontText>

            <FontText
              variant="small"
              style={styles.toggleDescription}
            >
              Receive interesting facts throughout
              the day
            </FontText>
          </View>

          <Switch
            value={notificationsEnabled}
            onValueChange={
              handleToggleNotifications
            }
            disabled={saving}
            trackColor={{
              false: colors.border,
              true: colors.primary,
            }}
            thumbColor={colors.white}
          />
        </View>

        {/* Time selection */}

        {notificationsEnabled && (
          <View style={styles.section}>
            <FontText
              variant="bodyMedium"
              style={styles.sectionTitle}
            >
              Notification times
            </FontText>

            <FontText
              variant="small"
              style={styles.sectionDescription}
            >
              Select one or more times.
            </FontText>

            <View style={styles.timesContainer}>
              {TIMES.map(item => {
                const selected =
                  selectedTimes.includes(
                    item.id,
                  );

                return (
                  <Pressable
                    key={item.id}
                    onPress={() =>
                      toggleTime(item.id)
                    }
                    style={[
                      styles.timeCard,
                      selected &&
                        styles.timeCardSelected,
                    ]}
                    disabled={saving}
                  >
                    <View
                      style={[
                        styles.timeIcon,
                        selected &&
                          styles.timeIconSelected,
                      ]}
                    >
                      <Ionicons
                        name={
                          item.icon as any
                        }
                        size={rf(23)}
                        color={
                          selected
                            ? colors.primary
                            : colors.textMuted
                        }
                      />
                    </View>

                    <View
                      style={
                        styles.timeContent
                      }
                    >
                      <FontText
                        variant="bodyMedium"
                        style={[
                          styles.timeLabel,
                          selected &&
                            styles.timeLabelSelected,
                        ]}
                      >
                        {item.label}
                      </FontText>

                      <FontText
                        variant="small"
                        style={
                          styles.timeValue
                        }
                      >
                        {item.time}
                      </FontText>
                    </View>

                    <View
                      style={[
                        styles.checkCircle,
                        selected &&
                          styles.checkCircleSelected,
                      ]}
                    >
                      {selected && (
                        <Ionicons
                          name="checkmark"
                          size={rf(15)}
                          color={colors.white}
                        />
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {!notificationsEnabled && (
          <View style={styles.disabledCard}>
            <Ionicons
              name="notifications-off-outline"
              size={rf(28)}
              color={colors.textMuted}
            />

            <FontText
              variant="body"
              style={styles.disabledText}
            >
              Daily fact notifications are
              currently turned off.
            </FontText>
          </View>
        )}
      </ScrollView>

      {/* Save button */}

      <View style={styles.bottomContainer}>
        <Pressable
          onPress={handleSave}
          disabled={saving}
          style={({ pressed }) => [
            styles.saveButton,
            pressed &&
              !saving &&
              styles.saveButtonPressed,
            saving &&
              styles.saveButtonDisabled,
          ]}
        >
          {saving ? (
            <ActivityIndicator
              color={colors.white}
            />
          ) : (
            <FontText
              variant="bodyMedium"
              style={styles.saveButtonText}
            >
              Save changes
            </FontText>
          )}
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },

  contentContainer: {
    paddingHorizontal: rw(20),
    paddingTop: rh(20),
    paddingBottom: rh(120),
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: rh(28),
  },

  backButton: {
    width: rw(42),
    height: rw(42),
    borderRadius: rr(21),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    marginRight: rw(12),
  },

  headerText: {
    flex: 1,
  },

  title: {
    color: colors.text,
    marginBottom: rh(5),
  },

  subtitle: {
    color: colors.textMuted,
    lineHeight: rf(21),
  },

  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: rr(16),
    padding: rw(16),
    marginBottom: rh(28),
    borderWidth: 1,
    borderColor: colors.border,
  },

  toggleIcon: {
    width: rw(46),
    height: rw(46),
    borderRadius: rr(14),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    marginRight: rw(12),
  },

  toggleContent: {
    flex: 1,
  },

  toggleTitle: {
    color: colors.text,
    marginBottom: rh(3),
  },

  toggleDescription: {
    color: colors.textMuted,
    lineHeight: rf(18),
  },

  section: {
    marginBottom: rh(20),
  },

  sectionTitle: {
    color: colors.text,
    marginBottom: rh(4),
  },

  sectionDescription: {
    color: colors.textMuted,
    marginBottom: rh(14),
  },

  timesContainer: {
    gap: rh(10),
  },

  timeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: rr(16),
    padding: rw(14),
    borderWidth: 1,
    borderColor: colors.border,
  },

  timeCardSelected: {
    borderColor: colors.primary,
  },

  timeIcon: {
    width: rw(46),
    height: rw(46),
    borderRadius: rr(14),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    marginRight: rw(12),
  },

  timeIconSelected: {
    backgroundColor: colors.primaryLight,
  },

  timeContent: {
    flex: 1,
  },

  timeLabel: {
    color: colors.text,
    marginBottom: rh(2),
  },

  timeLabelSelected: {
    color: colors.primary,
  },

  timeValue: {
    color: colors.textMuted,
  },

  checkCircle: {
    width: rw(24),
    height: rw(24),
    borderRadius: rr(12),
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkCircleSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  disabledCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: rr(16),
    paddingHorizontal: rw(24),
    paddingVertical: rh(30),
    borderWidth: 1,
    borderColor: colors.border,
  },

  disabledText: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: rh(10),
    lineHeight: rf(21),
  },

  bottomContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: rw(20),
    paddingTop: rh(12),
    paddingBottom: rh(20),
    backgroundColor: colors.background,
  },

  saveButton: {
    height: rh(54),
    borderRadius: rr(14),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },

  saveButtonPressed: {
    opacity: 0.85,
  },

  saveButtonDisabled: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: colors.white,
  },
});

export default NotificationSettingsScreen;
