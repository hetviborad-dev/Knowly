import React, { useEffect, useRef } from 'react';

import { StyleSheet, View } from 'react-native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import LottieView from 'lottie-react-native';

import { supabase } from '../../lib/supabase';

import type { RootStackParamList } from '../../types/navigation';

import { getOnboardingStep } from '../../services/storageService';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const SplashScreen = ({ navigation }: Props) => {
  const hasNavigated = useRef(false);

  const animationRef = useRef<LottieView>(null);

  /*
   * This prevents the session check from
   * running more than once.
   */
  const hasCheckedSession = useRef(false);

  useEffect(() => {
    /*
     * Start animation immediately.
     *
     * No setTimeout here.
     * No manual play() needed because
     * autoPlay is enabled.
     */
  }, []);

  /*
   * -----------------------------------------
   * CHECK SESSION
   * -----------------------------------------
   */

  const checkSession = async () => {
    if (hasCheckedSession.current) {
      return;
    }

    hasCheckedSession.current = true;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      console.log('KNOWLY SPLASH SESSION:', session);

      /*
       * USER ALREADY LOGGED IN
       */

      if (session) {
        navigateOnce('MainTabs');
        return;
      }

      /*
       * USER NOT LOGGED IN
       * CHECK ONBOARDING
       */

      const onboardingStep = await getOnboardingStep();

      console.log('KNOWLY ONBOARDING STEP:', onboardingStep);

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
      console.error('Failed to check Knowly session:', error);

      navigateOnce('Welcome');
    }
  };

  /*
   * -----------------------------------------
   * ANIMATION FINISHED
   * -----------------------------------------
   */

  const handleAnimationFinish = () => {
    console.log('KNOWLY SPLASH ANIMATION FINISHED');

    /*
     * ONLY AFTER THE COMPLETE ANIMATION
     * DO WE CHECK SESSION.
     */

    checkSession();
  };

  /*
   * -----------------------------------------
   * NAVIGATION
   * -----------------------------------------
   */

  const navigateOnce = (screen: keyof RootStackParamList) => {
    if (hasNavigated.current) {
      return;
    }

    hasNavigated.current = true;

    navigation.replace(screen as never);
  };

  return (
    console.log('KNOWLY SPLASH RENDER'),
    <View style={styles.container}>
      <LottieView
        ref={animationRef}
        source={require('../../assets/svgs/Animation.json')}
        autoPlay={true}
        loop={false}
        onAnimationFinish={handleAnimationFinish}
        onLayout={() => {
          animationRef.current?.play(30, 999);
        }}
        resizeMode="contain"
        style={styles.animation}
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

  animation: {
    width: 300,

    height: 300,
  },
});
