import React from 'react';

import { NavigationContainer } from '@react-navigation/native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Ionicons from '@react-native-vector-icons/ionicons';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import SplashScreen from '../screens/Splash/SplashScreen';
import WelcomeScreen from '../screens/Welcome/WelcomeScreen';
import AskNameScreen from '../screens/AskName/AskNameScreen';
import AuthScreen from '../screens/Auth/AuthScreen';

import HomeScreen from '../screens/Home/HomeScreen';
import CategoryScreen from '../screens/Category/CategoryScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import SelectCategoriesScreen from '../screens/SelectCategories/SelectCategoriesScreen';
import NotificationsScreen from '../screens/Notifications/NotificationsScreen';
import FactsScreen from '../screens/Facts/FactsScreen';
import SavedScreen from '../screens/Saved/SavedScreen';
import TopicScreen from '../screens/Topic/TopicScreen';

import { RootStackParamList, BottomTabParamList } from '../types/navigation';

import { colors } from '../constant/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();

const Tab = createBottomTabNavigator<BottomTabParamList>();

const MainTabs = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarActiveTintColor: colors.primary,

        tabBarInactiveTintColor: colors.textMuted,

        tabBarStyle: {
          height: 64 + insets.bottom,

          paddingBottom: insets.bottom + 8,

          paddingTop: 6,

          borderTopWidth: 1,

          borderTopColor: colors.border,

          backgroundColor: colors.white,
        },

        tabBarIcon: ({ color, size }) => {
          let iconName: string = 'ellipse';

          if (route.name === 'Home') {
            iconName = 'home-outline';
          }

          if (route.name === 'Facts') {
            iconName = 'bulb-outline';
          }

          if (route.name === 'Explore') {
            iconName = 'compass-outline';
          }

          if (route.name === 'Saved') {
            iconName = 'bookmark-outline';
          }

          if (route.name === 'Profile') {
            iconName = 'person-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />

      <Tab.Screen name="Facts" component={FactsScreen} />

      <Tab.Screen name="Explore" component={CategoryScreen} />

      <Tab.Screen name="Saved" component={SavedScreen} />

      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />

        <Stack.Screen name="Welcome" component={WelcomeScreen} />

        <Stack.Screen name="AskName" component={AskNameScreen} />

        <Stack.Screen
          name="SelectCategories"
          component={SelectCategoriesScreen}
        />

        <Stack.Screen name="Auth" component={AuthScreen} />

        <Stack.Screen name="Notifications" component={NotificationsScreen} />

        <Stack.Screen name="MainTabs" component={MainTabs} />

        <Stack.Screen name="Topic" component={TopicScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
