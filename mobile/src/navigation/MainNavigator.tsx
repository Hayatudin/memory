import React from "react";
import { Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MemoryListScreen } from "../screens/memories/MemoryListScreen";
import { CreateMemoryScreen } from "../screens/memories/CreateMemoryScreen";
import { MemoryDetailScreen } from "../screens/memories/MemoryDetailScreen";
import { SearchScreen } from "../screens/search/SearchScreen";
import { ProfileScreen } from "../screens/profile/ProfileScreen";
import { Theme } from "../theme/index";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Theme.colors.surface,
          borderTopColor: Theme.colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Theme.colors.primary,
        tabBarInactiveTintColor: Theme.colors.textMuted,
      }}
    >
      <Tab.Screen
        name="MemoriesTab"
        component={MemoryListScreen}
        options={{
          tabBarLabel: "Memories",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>📚</Text>,
        }}
      />
      <Tab.Screen
        name="CreateTab"
        component={CreateMemoryScreen}
        options={{
          tabBarLabel: "Capture",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>✏️</Text>,
        }}
      />
      <Tab.Screen
        name="SearchTab"
        component={SearchScreen}
        options={{
          tabBarLabel: "Search",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🔍</Text>,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

export const MainNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Theme.colors.background },
      }}
    >
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen
        name="MemoryDetail"
        component={MemoryDetailScreen}
        options={{ presentation: "card" }}
      />
    </Stack.Navigator>
  );
};
