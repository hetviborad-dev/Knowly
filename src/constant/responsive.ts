import { Dimensions, PixelRatio } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
  Dimensions.get("window");

const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

const scale = SCREEN_WIDTH / BASE_WIDTH;
const verticalScale = SCREEN_HEIGHT / BASE_HEIGHT;

const clamp = (
  value: number,
  min: number,
  max: number,
) => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Responsive width
 */
export const rw = (value: number) => {
  return value * scale;
};

/**
 * Responsive height
 */
export const rh = (value: number) => {
  return value * verticalScale;
};

/**
 * Responsive font size
 *
 * Prevents text from becoming excessively large
 * on tablets and very large screens.
 */
export const rf = (value: number) => {
  const scaledSize = value * scale;

  return PixelRatio.roundToNearestPixel(
    clamp(scaledSize, value * 0.9, value * 1.25),
  );
};

/**
 * Responsive spacing
 *
 * Keeps spacing within sensible limits.
 */
export const rs = (value: number) => {
  return clamp(value * scale, value * 0.85, value * 1.3);
};

/**
 * Responsive border radius
 */
export const rr = (value: number) => {
  return clamp(value * scale, value * 0.9, value * 1.25);
};

/**
 * Screen dimensions
 */
export const screen = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
};