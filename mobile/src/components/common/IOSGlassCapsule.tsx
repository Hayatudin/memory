import React, { useState } from "react";
import { View, StyleSheet, ViewStyle, StyleProp, LayoutChangeEvent, Dimensions } from "react-native";
import Svg, { Defs, LinearGradient, Stop, Rect } from "react-native-svg";

interface IOSGlassCapsuleProps {
  width?: number;
  height?: number;
  borderRadius?: number;
  strokeWidth?: number;
  fill?: string;
  gradientId?: string;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export const IOSGlassCapsule: React.FC<IOSGlassCapsuleProps> = ({
  width,
  height = 52,
  borderRadius = 26,
  strokeWidth = 1.4,
  fill = "#141519",
  gradientId,
  style,
  contentStyle,
  children,
}) => {
  const [layoutWidth, setLayoutWidth] = useState<number>(typeof width === "number" ? width : 0);

  const handleLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && Math.abs(w - layoutWidth) > 0.5) {
      setLayoutWidth(w);
    }
  };

  const halfStroke = strokeWidth / 2;
  const effectiveId = gradientId || `capsuleGrad-${height}-${Math.floor(Math.random() * 100000)}`;

  return (
    <View
      style={[
        styles.container,
        {
          ...(typeof width === "number" ? { width } : {}),
          height,
          borderRadius,
          backgroundColor: fill,
        },
        style,
      ]}
      onLayout={handleLayout}
    >
      {layoutWidth > 0 && (
        <Svg width={layoutWidth} height={height} style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id={effectiveId} x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.60" />
              <Stop offset="25%" stopColor="#FFFFFF" stopOpacity="0.30" />
              <Stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.08" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.02" />
            </LinearGradient>
          </Defs>
          <Rect
            x={halfStroke}
            y={halfStroke}
            width={layoutWidth - strokeWidth}
            height={height - strokeWidth}
            rx={borderRadius - halfStroke}
            ry={borderRadius - halfStroke}
            fill={fill}
            stroke={`url(#${effectiveId})`}
            strokeWidth={strokeWidth}
          />
        </Svg>
      )}
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    position: "relative",
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
});
