import { rf } from "./responsive";

export const fonts = {
  regular: "NunitoSans-Regular",
  medium: "NunitoSans-Medium",
  semiBold: "NunitoSans-SemiBold",
  bold: "NunitoSans-Bold",
};

export const typography = {
  display: {
    fontSize: rf(32),
    lineHeight: rf(38),
    fontFamily: fonts.bold,
  },

  heading1: {
    fontSize: rf(28),
    lineHeight: rf(34),
    fontFamily: fonts.bold,
  },

  heading2: {
    fontSize: rf(22),
    lineHeight: rf(28),
    fontFamily: fonts.bold,
  },

  heading3: {
    fontSize: rf(18),
    lineHeight: rf(24),
    fontFamily: fonts.bold,
  },

  body: {
    fontSize: rf(16),
    lineHeight: rf(24),
    fontFamily: fonts.regular,
  },

  bodyMedium: {
    fontSize: rf(16),
    lineHeight: rf(24),
    fontFamily: fonts.medium,
  },

  small: {
    fontSize: rf(14),
    lineHeight: rf(20),
    fontFamily: fonts.regular,
  },

  caption: {
    fontSize: rf(12),
    lineHeight: rf(16),
    fontFamily: fonts.semiBold,
  },
};