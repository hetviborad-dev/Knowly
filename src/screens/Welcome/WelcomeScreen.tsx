import React from 'react';

import { Pressable, StyleSheet, View } from 'react-native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../types/navigation';

import FontText from '../../components/common/FontText';

import useDisableOnboardingBack from '../../hooks/useDisableOnboardingBack';

import { rw, rh, rf, rr, rs } from '../../constant/responsive';
import Ionicons from '@react-native-vector-icons/ionicons';
import Logo from '../../assets/svgs/logo.svg';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

const WelcomeScreen = ({ navigation }: Props) => {
  useDisableOnboardingBack();

  const handleContinue = () => {
    navigation.replace('AskName');
  };

  return (
    <View style={styles.container}>
      <View style={styles.topPinkShape} />

      <View style={styles.yellowCircle}>
        <Logo
              width={rw(94)}
              height={rw(94)}
            />
      </View>

      <View style={styles.content}>
        <FontText variant="heading1" style={styles.title}>
          Explore
        </FontText>

        <FontText variant="body" style={styles.description}>
          Explore the incredible and{'\n'}
          wonderful world of Knowly
        </FontText>
      </View>

      <View style={styles.bottomArtwork}>
        <View style={styles.outerYellowRing} />

        <View style={styles.middlePurpleRing} />

        <View style={styles.innerPinkCircle} />
      </View>

      <Pressable
        onPress={handleContinue}
        style={({ pressed }) => [
          styles.nextButton,
          pressed && styles.nextButtonPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Continue to name setup"
      >
        <Ionicons name="arrow-forward" size={rf(42)} color="#43418C" />
      </Pressable>
    </View>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,

    overflow: 'hidden',

    backgroundColor: '#43418C',

    position: 'relative',
  },

  topPinkShape: {
    position: 'absolute',

    top: -rh(45),

    right: -rw(55),

    width: rw(315),

    height: rh(175),

    backgroundColor: '#40C9C2',

    borderBottomLeftRadius: rr(135),

    borderBottomRightRadius: rr(40),

    borderTopLeftRadius: rr(95),

    borderTopRightRadius: rr(42),

    transform: [
      {
        rotate: '8deg',
      },
    ],
  },

  yellowCircle: {
    position: 'absolute',

    top: rh(115),

    left: rw(35),

    width: rw(95),

    height: rw(95),

    borderRadius: rw(48),

    backgroundColor: '#FFFFFF',
  },

  content: {
    position: 'absolute',

    top: rh(252),

    left: rw(30),

    right: rw(24),
  },

  title: {
    color: '#FFFFFF',

    fontSize: rf(43),

    lineHeight: rf(52),

    fontWeight: '700',
  },

  description: {
    marginTop: rs(20),

    color: '#FFFFFF',

    fontSize: rf(22),

    lineHeight: rf(39),

    fontWeight: '400',
  },

  bottomArtwork: {
    position: 'absolute',

    left: -rw(158),

    bottom: -rh(154),

    width: rw(450),

    height: rw(450),

    alignItems: 'center',

    justifyContent: 'center',
  },

  outerYellowRing: {
    position: 'absolute',

    width: rw(345),

    height: rw(345),

    borderRadius: rw(223),

    borderWidth: rw(60),

    borderColor: '#FFAC04',
  },

  middlePurpleRing: {
    position: 'absolute',

    width: rw(160),

    height: rw(160),

    borderRadius: rw(141),

    backgroundColor: '#2198FE',
  },

  innerPinkCircle: {
    position: 'absolute',

    width: rw(190),

    height: rw(190),

    borderRadius: rw(95),

    backgroundColor: '#E4C9E1',

    left: rw(8),

    bottom: -rh(10),
  },

  nextButton: {
    position: 'absolute',

    right: rw(44),

    bottom: rh(158),

    width: rw(102),

    height: rw(102),

    borderRadius: rw(51),

    backgroundColor: '#FFFFFF',

    alignItems: 'center',

    justifyContent: 'center',

    elevation: 5,

    shadowColor: '#1D1B55',

    shadowOffset: {
      width: 0,
      height: rh(5),
    },

    shadowOpacity: 0.2,

    shadowRadius: rw(10),
  },

  nextButtonPressed: {
    opacity: 0.82,

    transform: [
      {
        scale: 0.96,
      },
    ],
  },
  arrow: {
    color: '#43418C',
    fontSize: rf(56),
    lineHeight: rf(62),
    marginTop: -rh(7),
    fontWeight: '500',
  },
});
