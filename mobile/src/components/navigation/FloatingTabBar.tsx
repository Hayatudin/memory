import React from "react";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Theme } from "../../theme/index";
import { Icon, IconName } from "../common/Icon";

interface FloatingTabBarProps extends BottomTabBarProps {
  onAIPress?: () => void;
}

export const FloatingTabBar: React.FC<FloatingTabBarProps> = ({
  state,
  descriptors,
  navigation,
  onAIPress,
}) => {
  const getTabIcon = (routeName: string): IconName => {
    switch (routeName) {
      case "Home":
        return "home";
      case "Search":
        return "search";
      case "Profile":
        return "user";
      default:
        return "home";
    }
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Main Floating Pill Bar */}
      <View style={styles.pillBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const iconName = getTabIcon(route.name);

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              activeOpacity={0.8}
              style={styles.tabItem}
            >
              {isFocused ? (
                <View style={styles.activePillBadge}>
                  <Icon name={iconName} size={22} color={Theme.colors.black} strokeWidth={2.4} />
                </View>
              ) : (
                <View style={styles.inactiveTabIcon}>
                  <Icon name={iconName} size={22} color={Theme.colors.textSecondary} strokeWidth={1.8} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Floating Action Button (AI Sparkles) */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          if (onAIPress) {
            onAIPress();
          } else {
            navigation.navigate("AIAssistant");
          }
        }}
        style={styles.fabOuterGlow}
      >
        <View style={styles.fabInnerCircle}>
          <Icon name="sparkles" size={24} color={Theme.colors.textOnPrimary} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 28 : 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pillBar: {
    flex: 1,
    height: 64,
    backgroundColor: "rgba(23, 26, 30, 0.95)",
    borderRadius: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "rgba(45, 49, 57, 0.8)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 8,
    marginRight: 14,
  },
  tabItem: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  activePillBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  inactiveTabIcon: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  fabOuterGlow: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "rgba(212, 248, 44, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 8,
  },
  fabInnerCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
});
