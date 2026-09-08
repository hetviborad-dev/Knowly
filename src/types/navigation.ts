export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  AskName: undefined;

  SelectCategories: {
    fromSettings?: boolean;
  };

  Auth: undefined;
  Notifications: undefined;
  MainTabs: undefined;

  Topic: {
    categoryId: string;
  };
};

export type BottomTabParamList = {
  Home: undefined;
  Facts: undefined;
  Explore: undefined;
  Saved: undefined;
  Profile: undefined;
};