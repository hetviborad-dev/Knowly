import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@react-native-vector-icons/ionicons";

import { supabase } from "../lib/supabase";

import AuthScreen from "../screens/Auth/AuthScreen";
import HomeScreen from "../screens/Home/HomeScreen";
import CategoryScreen from "../screens/Category/CategoryScreen";
import TopicScreen from "../screens/Topic/TopicScreen";
import ProfileScreen from "../screens/Profile/ProfileScreen";

import {
  RootStackParamList,
  BottomTabParamList,
} from "../types/navigation";

import { colors } from "../constant/colors";
import { rf, rh, rw } from "../constant/responsive";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,

        tabBarStyle: {
          height: rh(68),
          paddingTop: rh(7),
          paddingBottom: rh(8),
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.white,
          elevation: 0,
        },

        tabBarLabelStyle: {
          fontSize: rf(12),
          fontFamily: "Inter-SemiBold",
        },

        tabBarIcon: ({ color, focused }) => {
          let iconName:
            | "home"
            | "home-outline"
            | "compass"
            | "compass-outline"
            | "person"
            | "person-outline";

          if (route.name === "Home") {
            iconName = focused
              ? "home"
              : "home-outline";
          } else if (route.name === "Explore") {
            iconName = focused
              ? "compass"
              : "compass-outline";
          } else {
            iconName = focused
              ? "person"
              : "person-outline";
          }

          return (
            <Ionicons
              name={iconName}
              size={rf(23)}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
      />

      <Tab.Screen
        name="Explore"
        component={CategoryScreen}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="small"
          color={colors.primary}
        />
      </View>
    );
  }

  if (!session) {
    return <AuthScreen />;
  }

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="Topic"
        component={TopicScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});

export default AppNavigator;
