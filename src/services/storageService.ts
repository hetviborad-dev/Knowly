import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  NAME: "knowly_user_name",
  CATEGORIES: "knowly_selected_categories",
};

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

export const clearOnboardingData =
  async () => {
    await AsyncStorage.removeItem(
      STORAGE_KEYS.NAME,
    );

    await AsyncStorage.removeItem(
      STORAGE_KEYS.CATEGORIES,
    );
  };