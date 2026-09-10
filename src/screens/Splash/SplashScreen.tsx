import React, { useEffect, useRef } from 'react';

import {
  StyleSheet,
  View,
} from 'react-native';

import type {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import { supabase } from '../../lib/supabase';

import type {
  RootStackParamList,
} from '../../types/navigation';

import {
  getOnboardingStep,
} from '../../services/storageService';

import Logo from '../../assets/svgs/logo.svg';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'Splash'
>;

const SplashScreen = ({ navigation }: Props) => {
  const hasNavigated = useRef(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        console.log(
          'KNOWLY SPLASH SESSION:',
          session,
        );

        /*
         * USER ALREADY LOGGED IN
         */

        if (session) {
          navigateOnce('MainTabs');
          return;
        }

        /*
         * USER NOT LOGGED IN
         * RESUME ONBOARDING
         */

        const onboardingStep =
          await getOnboardingStep();

        console.log(
          'KNOWLY ONBOARDING STEP:',
          onboardingStep,
        );

        switch (onboardingStep) {
          case 'NAME':
            navigateOnce('AskName');
            break;

          case 'CATEGORIES':
            navigateOnce('SelectCategories');
            break;

          case 'AUTH':
            navigateOnce('Auth');
            break;

          case 'NOTIFICATIONS':
            navigateOnce('Notifications');
            break;

          case 'WELCOME':
          default:
            navigateOnce('Welcome');
            break;
        }
      } catch (error) {
        console.error(
          'Failed to check Knowly session:',
          error,
        );

        navigateOnce('Welcome');
      }
    };

    /*
     * Small delay so the native splash
     * can smoothly hand over to React Native.
     */

    const timer = setTimeout(() => {
      checkSession();
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [navigation]);

  const navigateOnce = (
    screen: keyof RootStackParamList,
  ) => {
    if (hasNavigated.current) {
      return;
    }

    hasNavigated.current = true;

    navigation.replace(screen as never);
  };

  return (
    <View style={styles.container}>
      <Logo
        width={120}
        height={120}
      />
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: '#FFFFFF',

    alignItems: 'center',

    justifyContent: 'center',
  },
});