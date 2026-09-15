import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, {
  Path,
  Circle,
  Defs,
  RadialGradient,
  Stop,
  G,
} from "react-native-svg";
import { Theme } from "../../theme/index";

interface BrainGraphicProps {
  size?: number;
}

export const BrainGraphic: React.FC<BrainGraphicProps> = ({ size = 120 }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <RadialGradient
            id="brainGlow"
            cx="50%"
            cy="50%"
            r="50%"
            fx="50%"
            fy="50%"
          >
            <Stop offset="0%" stopColor={Theme.colors.primary} stopOpacity="0.4" />
            <Stop offset="60%" stopColor={Theme.colors.primary} stopOpacity="0.1" />
            <Stop offset="100%" stopColor={Theme.colors.primary} stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Ambient Glow */}
        <Circle cx="50" cy="50" r="46" fill="url(#brainGlow)" />

        {/* Brain Silhouette & Synapse Filaments */}
        <G stroke={Theme.colors.primary} strokeWidth="1.2" fill="none" opacity="0.85">
          {/* Outer brain contours */}
          <Path
            d="M50 20 C42 16, 30 20, 26 28 C20 32, 18 42, 22 50 C18 56, 20 66, 26 72 C32 78, 42 80, 50 78"
            strokeLinecap="round"
          />
          <Path
            d="M50 20 C58 16, 70 20, 74 28 C80 32, 82 42, 78 50 C82 56, 80 66, 74 72 C68 78, 58 80, 50 78"
            strokeLinecap="round"
          />

          {/* Central fissure & Lobes */}
          <Path
            d="M50 20 C49 32, 51 45, 50 60 C49 68, 51 72, 50 78"
            strokeDasharray="2 2"
          />

          {/* Left Hemisphere Neural Waves */}
          <Path d="M30 35 C38 32, 44 42, 36 48 C28 54, 40 60, 48 58" />
          <Path d="M26 48 C34 46, 38 58, 30 64" />
          <Path d="M38 26 C44 30, 46 36, 42 42" />

          {/* Right Hemisphere Neural Waves */}
          <Path d="M70 35 C62 32, 56 42, 64 48 C72 54, 60 60, 52 58" />
          <Path d="M74 48 C66 46, 62 58, 70 64" />
          <Path d="M62 26 C56 30, 54 36, 58 42" />

          {/* Brainstem / Lower connections */}
          <Path d="M46 76 C48 82, 49 86, 50 88 C51 86, 52 82, 54 76" />
        </G>

        {/* Glowing Neural Synapse Nodes */}
        <G fill={Theme.colors.primary}>
          <Circle cx="32" cy="30" r="2.2" />
          <Circle cx="44" cy="24" r="1.8" />
          <Circle cx="68" cy="30" r="2.2" />
          <Circle cx="56" cy="24" r="1.8" />
          <Circle cx="24" cy="46" r="2" />
          <Circle cx="76" cy="46" r="2" />
          <Circle cx="36" cy="50" r="2.5" />
          <Circle cx="64" cy="50" r="2.5" />
          <Circle cx="28" cy="66" r="2" />
          <Circle cx="72" cy="66" r="2" />
          <Circle cx="46" cy="70" r="2.2" />
          <Circle cx="54" cy="70" r="2.2" />
          <Circle cx="50" cy="38" r="3" fill="#FFFFFF" />
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
});
