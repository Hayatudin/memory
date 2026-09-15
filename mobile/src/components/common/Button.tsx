import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from "react-native";
import { Theme } from "../../theme/index";
import { Icon, IconName } from "./Icon";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: IconName;
  iconPosition?: "left" | "right";
  iconColor?: string;
  loading?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  hasDot?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  iconColor,
  loading = false,
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  hasDot = false,
}) => {
  const isBusy = loading || isLoading;
  const getContainerStyle = () => {
    switch (variant) {
      case "primary":
        return styles.primaryContainer;
      case "secondary":
        return styles.secondaryContainer;
      case "danger":
        return styles.dangerContainer;
      case "ghost":
        return styles.ghostContainer;
      default:
        return styles.primaryContainer;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case "primary":
        return styles.primaryText;
      case "secondary":
        return styles.secondaryText;
      case "danger":
        return styles.dangerText;
      case "ghost":
        return styles.ghostText;
      default:
        return styles.primaryText;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case "sm":
        return styles.sizeSm;
      case "lg":
        return styles.sizeLg;
      default:
        return styles.sizeMd;
    }
  };

  const resolvedIconColor =
    iconColor ||
    (variant === "primary"
      ? Theme.colors.textOnPrimary
      : variant === "danger"
      ? Theme.colors.dangerText
      : Theme.colors.textPrimary);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isBusy}
      activeOpacity={0.8}
      style={[
        styles.baseContainer,
        getContainerStyle(),
        getSizeStyle(),
        disabled && styles.disabled,
        style,
      ]}
    >
      {isBusy ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" ? Theme.colors.black : Theme.colors.primary}
        />
      ) : (
        <View style={styles.contentRow}>
          {hasDot && <View style={styles.darkDot} />}
          {icon && iconPosition === "left" && (
            <View style={styles.iconLeft}>
              <Icon name={icon} size={size === "sm" ? 16 : 20} color={resolvedIconColor} />
            </View>
          )}
          <Text style={[styles.baseText, getTextStyle(), textStyle]}>
            {title}
          </Text>
          {icon && iconPosition === "right" && (
            <View style={styles.iconRight}>
              <Icon name={icon} size={size === "sm" ? 16 : 20} color={resolvedIconColor} />
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    borderRadius: Theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryContainer: {
    backgroundColor: Theme.colors.primary,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  secondaryContainer: {
    backgroundColor: Theme.colors.surfacePill,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  dangerContainer: {
    backgroundColor: Theme.colors.dangerDark,
    borderWidth: 1,
    borderColor: Theme.colors.dangerBorder,
  },
  ghostContainer: {
    backgroundColor: "transparent",
  },
  sizeSm: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  sizeMd: {
    paddingVertical: 14,
    paddingHorizontal: 22,
  },
  sizeLg: {
    paddingVertical: 18,
    paddingHorizontal: 28,
  },
  baseText: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  primaryText: {
    color: Theme.colors.textOnPrimary,
    fontWeight: "700",
  },
  secondaryText: {
    color: Theme.colors.textPrimary,
  },
  dangerText: {
    color: Theme.colors.dangerText,
    fontWeight: "600",
  },
  ghostText: {
    color: Theme.colors.textSecondary,
  },
  disabled: {
    opacity: 0.5,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  darkDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#0F1206",
    marginRight: 10,
  },
});
