import React, { useEffect } from "react";
import { View, StyleSheet, StatusBar, ActivityIndicator, Text, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeBottomTabNavigator } from "@react-navigation/bottom-tabs/unstable";
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
import { CategoryMemoriesScreen } from "../screens/memories/CategoryMemoriesScreen";
import { MemoryDetailScreen } from "../screens/memories/MemoryDetailScreen";
import { OnboardingScreen } from "../screens/onboarding/OnboardingScreen";
import { SubscriptionScreen } from "../screens/subscription/SubscriptionScreen";
import { PaymentScreen } from "../screens/payment/PaymentScreen";

const Stack = createNativeStackNavigator();
const AndroidTab = createBottomTabNavigator();
const IOSTab = createNativeBottomTabNavigator();
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

function MainTabNavigatorIOS() {
  return (
    <IOSTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Theme.colors.primary,
        tabBarMinimizeBehavior: "auto",
      }}
    >
      <IOSTab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ focused }) => ({
            type: "sfSymbol",
            name: focused ? "house.fill" : "house",
          }),
        }}
      />
      <IOSTab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: "Search",
          tabBarIcon: () => ({
            type: "sfSymbol",
            name: "magnifyingglass",
          }),
        }}
      />
      <IOSTab.Screen
        name="AI"
        component={AIAssistantScreen}
        options={{
          tabBarLabel: "AI",
          tabBarIcon: () => ({
            type: "sfSymbol",
            name: "sparkles",
          }),
        }}
      />
      <IOSTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ focused }) => ({
            type: "sfSymbol",
            name: focused ? "person.fill" : "person",
          }),
        }}
      />
    </IOSTab.Navigator>
  );
}

function MainTabNavigatorAndroid() {
  return (
    <AndroidTab.Navigator
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
      <AndroidTab.Screen name="Home" component={HomeScreen} />
      <AndroidTab.Screen name="Search" component={SearchScreen} />
      <AndroidTab.Screen name="AI" component={AIAssistantScreen} />
      <AndroidTab.Screen name="Profile" component={ProfileScreen} />
    </AndroidTab.Navigator>
  );
}

function MainTabNavigator() {
  if (Platform.OS === "ios") {
    return <MainTabNavigatorIOS />;
  }
  return <MainTabNavigatorAndroid />;
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
        key={isAuthenticated ? "authenticated" : "guest"}
        initialRouteName={!isAuthenticated ? "Onboarding" : "MainTabs"}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Theme.colors.background },
        }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Subscription" component={SubscriptionScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="Auth" component={AuthNavigator} />
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
            presentation: "transparentModal",
            animation: "fade",
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="CategoryMemories"
          component={CategoryMemoriesScreen}
          options={{
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="MemoryDetail"
          component={MemoryDetailScreen}
          options={{
            animation: "slide_from_right",
          }}
        />
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
