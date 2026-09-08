import { StyleSheet } from "react-native";
import { colors } from "./colors";
import { rf, rh, rr, rw } from "./responsive";
import { spacing } from "./spacing";

export const commonStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  screenPadding: {
    paddingHorizontal: rw(20),
  },

  screenContent: {
    paddingHorizontal: rw(20),
    paddingTop: rh(24),
    paddingBottom: rh(40),
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },

  centerPadded: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rw(32),
    backgroundColor: colors.background,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: rr(22),
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  flex: {
    flex: 1,
  },

  pressed: {
    opacity: 0.65,
  },

  disabled: {
    opacity: 0.5,
  },

  section: {
    marginBottom: rh(30),
  },

  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: rr(16),
  },

  smallIconContainer: {
    width: rw(30),
    height: rw(30),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: rr(10),
  },

  mediumIconContainer: {
    width: rw(44),
    height: rw(44),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: rr(14),
  },

  largeIconContainer: {
    width: rw(54),
    height: rw(54),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: rr(17),
  },

  primaryText: {
    color: colors.primary,
  },

  secondaryText: {
    color: colors.textSecondary,
  },

  mutedText: {
    color: colors.textMuted,
  },

  whiteText: {
    color: colors.white,
  },

  centerText: {
    textAlign: "center",
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
  },

  roundedButton: {
    borderRadius: rr(17),
  },

  input: {
    height: rh(54),
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: rr(16),
    backgroundColor: colors.surface,
    color: colors.text,
    fontFamily: "Inter-Regular",
    fontSize: rf(16),
  },
});

export const paletteStyles = StyleSheet.create({
  blueLight: {
    backgroundColor: "#EAF5FF",
  },

  turquoiseLight: {
    backgroundColor: "#E6F8F7",
  },

  yellowLight: {
    backgroundColor: "#FFF8E8",
  },

  errorLight: {
    backgroundColor: "#FFF7F7",
  },

  errorBorder: {
    borderColor: "#FECACA",
  },

  transparentWhite: {
    backgroundColor: "rgba(255,255,255,0.13)",
  },

  transparentWhiteLight: {
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  transparentWhiteMedium: {
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  transparentWhiteStrong: {
    backgroundColor: "rgba(255,255,255,0.17)",
  },
});

export const commonDimensions = {
  inputHeight: rh(54),

  iconSmall: rw(30),
  iconMedium: rw(44),
  iconLarge: rw(54),

  buttonHeight: rh(52),

  radiusSmall: rr(14),
  radiusMedium: rr(17),
  radiusLarge: rr(22),
  radiusXL: rr(28),

  screenHorizontal: rw(20),
};