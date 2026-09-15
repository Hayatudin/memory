import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { Theme } from "../../theme/index";

interface BadgeProps {
  label: string;
  color?: string;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ label, color, style }) => {
  const bg = color || Theme.colors.surfaceElevated;
  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.full,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 12,
    fontWeight: "500",
    color: Theme.colors.textPrimary,
  },
});
