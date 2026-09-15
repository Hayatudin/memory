import React from "react";
import { TouchableOpacity, StyleSheet, ViewStyle, StyleProp } from "react-native";
import Svg, { Defs, LinearGradient, Stop, Circle } from "react-native-svg";

interface IOSGlassButtonProps {
  size?: number;
  fill?: string;
  gradientId?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  activeOpacity?: number;
  children: React.ReactNode;
}

export const IOSGlassButton: React.FC<IOSGlassButtonProps> = ({
  size = 44,
  fill = "rgba(30, 32, 38, 0.75)",
  gradientId,
  onPress,
  style,
  activeOpacity = 0.75,
  children,
}) => {
  const strokeWidth = 1.4;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const gradId = gradientId || `glassBtnBorder-${size}-${Math.floor(Math.random() * 100000)}`;

  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      onPress={onPress}
      style={[
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
    >
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.60" />
            <Stop offset="30%" stopColor="#FFFFFF" stopOpacity="0.25" />
            <Stop offset="75%" stopColor="#FFFFFF" stopOpacity="0.08" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.02" />
          </LinearGradient>
        </Defs>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill={fill}
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
        />
      </Svg>
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
});
