import React from "react";
import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";
import Svg, { Defs, LinearGradient, Stop, Circle } from "react-native-svg";

interface IOSGlassCircleProps {
  size?: number;
  strokeWidth?: number;
  fill?: string;
  gradientId?: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export const IOSGlassCircle: React.FC<IOSGlassCircleProps> = ({
  size = 46,
  strokeWidth = 1.4,
  fill = "rgba(26, 28, 33, 0.85)",
  gradientId,
  style,
  children,
}) => {
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const id = gradientId || `glassCircle-${size}-${Math.floor(Math.random() * 100000)}`;

  return (
    <View
      style={[
        styles.container,
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
          <LinearGradient id={id} x1="0%" y1="0%" x2="0%" y2="100%">
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
          stroke={`url(#${id})`}
          strokeWidth={strokeWidth}
        />
      </Svg>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
});
