import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextInputProps,
} from "react-native";
import { Theme } from "../../theme/index";
import { Icon, IconName } from "./Icon";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: IconName;
  rightIcon?: IconName;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  isPill?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  isPill = false,
  secureTextEntry,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = secureTextEntry;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isPill && styles.pillContainer,
          isFocused && styles.focusedContainer,
          error ? styles.errorContainer : null,
        ]}
      >
        {leftIcon && (
          <View style={styles.leftIcon}>
            <Icon
              name={leftIcon}
              size={18}
              color={isFocused ? Theme.colors.primary : Theme.colors.textMuted}
            />
          </View>
        )}

        <TextInput
          placeholderTextColor={Theme.colors.textMuted}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[styles.input, style]}
          {...props}
        />

        {isPassword ? (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.rightIcon}
          >
            <Icon
              name={showPassword ? "moon" : "lock"}
              size={18}
              color={Theme.colors.textMuted}
            />
          </TouchableOpacity>
        ) : rightIcon ? (
          <TouchableOpacity
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            style={styles.rightIcon}
          >
            <Icon
              name={rightIcon}
              size={18}
              color={Theme.colors.textMuted}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: Theme.colors.textSecondary,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: 14,
    height: 50,
  },
  pillContainer: {
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Theme.colors.surface,
    height: 48,
    paddingHorizontal: 16,
  },
  focusedContainer: {
    borderColor: Theme.colors.primary,
  },
  errorContainer: {
    borderColor: Theme.colors.danger,
  },
  input: {
    flex: 1,
    color: Theme.colors.textPrimary,
    fontSize: 14,
    paddingVertical: 0,
  },
  leftIcon: {
    marginRight: 10,
  },
  rightIcon: {
    marginLeft: 10,
  },
  errorText: {
    fontSize: 12,
    color: Theme.colors.danger,
    marginTop: 6,
    marginLeft: 4,
  },
});
