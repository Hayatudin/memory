import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  LayoutChangeEvent,
} from "react-native";
import Svg, { Defs, LinearGradient, Stop, Path, Rect } from "react-native-svg";
import { Icon, IconName } from "./Icon";

interface NotchedCategoryCardProps {
  id: string;
  name: string;
  count?: number;
  icon: IconName;
  onPress?: () => void;
}

export const NotchedCategoryCard: React.FC<NotchedCategoryCardProps> = ({
  id,
  name,
  count = 0,
  icon,
  onPress,
}) => {
  const windowWidth = Dimensions.get("window").width || 390;
  const initialWidth = Math.floor((windowWidth - 40 - 14) / 2);
  const initialHeight = Math.floor(initialWidth * 1.02);

  const [cardWidth, setCardWidth] = useState<number>(initialWidth);
  const [cardHeight, setCardHeight] = useState<number>(initialHeight);

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width: w, height: h } = e.nativeEvent.layout;
    if (w > 0 && Math.abs(w - cardWidth) > 1) {
      setCardWidth(Math.floor(w));
      setCardHeight(Math.floor(h > 0 ? h : w * 1.02));
    }
  };

  const w = cardWidth;
  const h = cardHeight;
  const r = 24; // Outer corner radius
  const wn = 48; // Notch width
  const hn = 48; // Notch height
  const rn = 14; // Notch fillet radius

  // Smooth filleted notch path
  const notchedPath = `
    M ${r} 0
    L ${w - r} 0
    A ${r} ${r} 0 0 1 ${w} ${r}
    L ${w} ${h - hn - rn}
    A ${rn} ${rn} 0 0 1 ${w - rn} ${h - hn}
    L ${w - wn + rn} ${h - hn}
    A ${rn} ${rn} 0 0 0 ${w - wn} ${h - hn + rn}
    L ${w - wn} ${h - rn}
    A ${rn} ${rn} 0 0 1 ${w - wn - rn} ${h}
    L ${r} ${h}
    A ${r} ${r} 0 0 1 0 ${h - r}
    L 0 ${r}
    A ${r} ${r} 0 0 1 ${r} 0
    Z
  `;

  const fillGradId = `notchedFill-${id}`;
  const strokeGradId = `notchedStroke-${id}`;
  const iconGradId = `iconGrad-${id}`;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={styles.cardContainer}
      onLayout={handleLayout}
    >
      {/* Background SVG with exact notched shape and linear gradients */}
      {w > 0 && h > 0 && (
        <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
          <Defs>
            {/* Card Fill Gradient: Design colors #161918 to #232524 */}
            <LinearGradient id={fillGradId} x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#161918" />
              <Stop offset="100%" stopColor="#232524" />
            </LinearGradient>

            {/* Specular Gradient Stroke: High contrast white highlight at top */}
            <LinearGradient id={strokeGradId} x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
              <Stop offset="30%" stopColor="#FFFFFF" stopOpacity="0.14" />
              <Stop offset="75%" stopColor="#FFFFFF" stopOpacity="0.05" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.02" />
            </LinearGradient>
          </Defs>

          <Path
            d={notchedPath}
            fill={`url(#${fillGradId})`}
            stroke={`url(#${strokeGradId})`}
            strokeWidth={1.2}
          />
        </Svg>
      )}

      {/* Card Content Overlay */}
      <View style={styles.cardContent}>
        {/* Layered Double Card Icon */}
        <View style={styles.iconWrapper}>
          {/* Back Lime Card */}
          <View style={styles.iconBackCard} />

          {/* Front Gradient Card */}
          <View style={styles.iconFrontCard}>
            <Svg width={44} height={44} style={StyleSheet.absoluteFill}>
              <Defs>
                <LinearGradient id={iconGradId} x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor="#A3E635" />
                  <Stop offset="100%" stopColor="#4D7C0F" />
                </LinearGradient>
              </Defs>
              <Rect width={44} height={44} rx={11} fill={`url(#${iconGradId})`} />
            </Svg>
            <Icon name={icon} size={22} color="#FFFFFF" strokeWidth={2.2} />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.categoryTitle} numberOfLines={1}>
          {name}
        </Text>

        {/* Memories Count */}
        <Text style={styles.categoryCount}>
          {count} Memories
        </Text>
      </View>

      {/* Diagonal Arrow in the bottom-right corner notch */}
      <View style={styles.notchArrowContainer}>
        <Icon name="arrow-up-right" size={19} color="#FFFFFF" strokeWidth={2.4} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: "48%",
    aspectRatio: 0.98,
    position: "relative",
    marginBottom: 14,
  },
  cardContent: {
    flex: 1,
    paddingTop: 18,
    paddingLeft: 18,
    paddingRight: 14,
    paddingBottom: 16,
  },
  iconWrapper: {
    width: 50,
    height: 50,
    position: "relative",
  },
  iconBackCard: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 44,
    height: 44,
    borderRadius: 11,
    backgroundColor: "#A3E635",
  },
  iconFrontCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 44,
    height: 44,
    borderRadius: 11,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 22,
    letterSpacing: -0.3,
  },
  categoryCount: {
    fontSize: 13,
    fontWeight: "400",
    color: "#8E8E93",
    marginTop: 12,
  },
  notchArrowContainer: {
    position: "absolute",
    bottom: 3,
    right: 3,
    width: 46,
    height: 46,
    justifyContent: "center",
    alignItems: "center",
  },
});
