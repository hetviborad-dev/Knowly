// src/services/storageService.ts

import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  NAME: "knowly_user_name",
  CATEGORIES: "knowly_selected_categories",
  ONBOARDING_STEP: "knowly_onboarding_step",
};

export type OnboardingStep =
  | "WELCOME"
  | "NAME"
  | "CATEGORIES"
  | "AUTH"
  | "NOTIFICATIONS";


// -----------------------------
// NAME
// -----------------------------

export const saveUserName = async (name: string) => {
  await AsyncStorage.setItem(
    STORAGE_KEYS.NAME,
    name.trim(),
  );
};

export const getUserName = async () => {
  return AsyncStorage.getItem(
    STORAGE_KEYS.NAME,
  );
};


// -----------------------------
// CATEGORIES
// -----------------------------

export const saveSelectedCategories = async (
  categories: string[],
) => {
  await AsyncStorage.setItem(
    STORAGE_KEYS.CATEGORIES,
    JSON.stringify(categories),
  );
};

export const getSelectedCategories =
  async (): Promise<string[]> => {
    const value =
      await AsyncStorage.getItem(
        STORAGE_KEYS.CATEGORIES,
      );

    if (!value) {
      return [];
    }

    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  };


// -----------------------------
// ONBOARDING STEP
// -----------------------------

export const saveOnboardingStep = async (
  step: OnboardingStep,
) => {
  await AsyncStorage.setItem(
    STORAGE_KEYS.ONBOARDING_STEP,
    step,
  );
};

export const getOnboardingStep =
  async (): Promise<OnboardingStep> => {
    const step =
      await AsyncStorage.getItem(
        STORAGE_KEYS.ONBOARDING_STEP,
      );

    if (
      step === "NAME" ||
      step === "CATEGORIES" ||
      step === "AUTH" ||
      step === "NOTIFICATIONS"
    ) {
      return step;
    }

    return "WELCOME";
  };


// -----------------------------
// CLEAR ON LOGOUT
// -----------------------------

export const clearOnboardingData =
  async () => {
    await AsyncStorage.removeItem(
      STORAGE_KEYS.NAME,
    );

    await AsyncStorage.removeItem(
      STORAGE_KEYS.CATEGORIES,
    );

    await AsyncStorage.removeItem(
      STORAGE_KEYS.ONBOARDING_STEP,
    );
  };