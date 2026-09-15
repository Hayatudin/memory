import React, { useEffect } from "react";
import { View, StyleSheet, StatusBar, ActivityIndicator, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuthStore } from "../store/authStore";
import { Theme } from "../theme/index";
import { BrainGraphic } from "../components/common/BrainGraphic";
import { FloatingTabBar } from "../components/navigation/FloatingTabBar";

// Screens
import { SignInScreen } from "../screens/auth/SignInScreen";
import { SignUpScreen } from "../screens/auth/SignUpScreen";
import { HomeScreen } from "../screens/home/HomeScreen";
import { SearchScreen } from "../screens/search/SearchScreen";
import { ProfileScreen } from "../screens/profile/ProfileScreen";
import { AIAssistantScreen } from "../screens/ai/AIAssistantScreen";
import { AddMemoryModal } from "../screens/memories/AddMemoryModal";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const AuthStack = createNativeStackNavigator();

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Theme.colors.background },
      }}
    >
      <AuthStack.Screen name="SignIn" component={SignInScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    </AuthStack.Navigator>
  );
}

function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "transparent",
          elevation: 0,
          borderTopWidth: 0,
        },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.background} />
      <BrainGraphic size={120} />
      <Text style={styles.loadingTitle}>Memory</Text>
      <ActivityIndicator size="small" color={Theme.colors.primary} style={styles.spinner} />
    </View>
  );
}

export function RootNavigator() {
  const { isAuthenticated, isLoading, initializeAuth } = useAuthStore();
  const [forceReady, setForceReady] = React.useState(false);

  useEffect(() => {
    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Absolute safety fallback: never stay stuck on loading screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setForceReady(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading && !forceReady) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Theme.colors.background },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen
              name="AIAssistant"
              component={AIAssistantScreen}
              options={{
                animation: "slide_from_bottom",
              }}
            />
            <Stack.Screen
              name="AddMemoryModal"
              component={AddMemoryModal}
              options={{
                presentation: "modal",
                animation: "slide_from_bottom",
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: Theme.colors.textPrimary,
    marginTop: 16,
    letterSpacing: -0.5,
  },
  spinner: {
    marginTop: 24,
  },
});
