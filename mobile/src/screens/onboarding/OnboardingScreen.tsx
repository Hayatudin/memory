import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Easing,
  Dimensions,
  Platform,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import Svg, {
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
  Rect,
  Path,
  Circle,
  Line,
  Polygon,
  G,
} from "react-native-svg";
import { Theme } from "../../theme/index";
import { IOSGlassButton } from "../../components/common/IOSGlassButton";
import { IOSGlassCapsule } from "../../components/common/IOSGlassCapsule";

interface OnboardingScreenProps {
  navigation: any;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BAR_WIDTH = Math.min(SCREEN_WIDTH - 48, 350);
const ICONS_WIDTH = Math.round(BAR_WIDTH * 0.806);
const ICONS_HEIGHT = Math.round(ICONS_WIDTH * (1230 / 1515));
const ICONS_TOP = -Math.round(BAR_WIDTH * (86 / 529));
const PHONE_WIDTH = Math.min(SCREEN_WIDTH - 48, 326);
const PHONE_HEIGHT = 296;
const PHONE_RADIUS = 38;
const USER_BUBBLE_WIDTH = Math.round(PHONE_WIDTH * 0.90);
const AI_BUBBLE_WIDTH = PHONE_WIDTH - 28 - 34 - 10;

// ==========================================
// STEP 1: Constellation Particle Data
// ==========================================
interface RingSpec {
  count: number;
  rOut: number;
  size: number;
  baseAngleDeg: number;
  color: string;
}

const RING_CONFIGS: RingSpec[] = [
  { count: 10, rOut: 20, size: 5, baseAngleDeg: 7.2, color: "#BFEC3B" },
  { count: 10, rOut: 46.5, size: 6, baseAngleDeg: 25.2, color: "#BFEC3B" },
  { count: 10, rOut: 77, size: 15, baseAngleDeg: 7.2, color: "#BFEC3B" },
  { count: 10, rOut: 103.5, size: 15, baseAngleDeg: 25.2, color: "#BFEC3B" },
];

interface ParticleData {
  id: string;
  xOut: number;
  yOut: number;
  xIn: number;
  yIn: number;
  size: number;
  color: string;
}

const CONTRACTION_FACTOR = 0.44;

const PARTICLES: ParticleData[] = (() => {
  const list: ParticleData[] = [];
  let idCounter = 0;

  RING_CONFIGS.forEach((ring, ringIdx) => {
    const step = 360 / ring.count;
    for (let i = 0; i < ring.count; i++) {
      const deg = ring.baseAngleDeg + i * step;
      const rad = (deg * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);

      list.push({
        id: `p-${ringIdx}-${i}-${idCounter++}`,
        xOut: cos * ring.rOut,
        yOut: sin * ring.rOut,
        xIn: cos * ring.rOut * CONTRACTION_FACTOR,
        yIn: sin * ring.rOut * CONTRACTION_FACTOR,
        size: ring.size,
        color: ring.color,
      });
    }
  });

  return list;
})();

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  // Always default to Step 1 on launch / sign out
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const scrollViewRef = useRef<ScrollView>(null);

  // Animation for Step 1 breathing particles
  const particleAnim = useRef(new Animated.Value(1)).current;

  // Whenever OnboardingScreen receives focus (e.g. upon user logout), ensure it starts on Step 1
  useFocusEffect(
    React.useCallback(() => {
      setStep(1);
      scrollViewRef.current?.scrollTo({ x: 0, animated: false });
    }, [])
  );

  useEffect(() => {
    const breathingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(particleAnim, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(particleAnim, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ])
    );

    breathingAnimation.start();
    return () => {
      breathingAnimation.stop();
    };
  }, [particleAnim]);

  const switchStep = (nextStep: 1 | 2 | 3) => {
    setStep(nextStep);
    scrollViewRef.current?.scrollTo({
      x: (nextStep - 1) * SCREEN_WIDTH,
      animated: true,
    });
  };

  const handleContinue = () => {
    if (step === 1) {
      switchStep(2);
    } else if (step === 2) {
      switchStep(3);
    } else {
      navigation.navigate("Subscription");
    }
  };

  // SVG path for the phone frame (U-stroke: left, bottom, right only; no top line; bottom corners curved; stroke fades up)
  const phoneStrokePath = `M 0.8 0 L 0.8 ${PHONE_HEIGHT - PHONE_RADIUS} A ${PHONE_RADIUS} ${PHONE_RADIUS} 0 0 0 ${PHONE_RADIUS + 0.8} ${PHONE_HEIGHT - 0.8} L ${PHONE_WIDTH - PHONE_RADIUS - 0.8} ${PHONE_HEIGHT - 0.8} A ${PHONE_RADIUS} ${PHONE_RADIUS} 0 0 0 ${PHONE_WIDTH - 0.8} ${PHONE_HEIGHT - PHONE_RADIUS} L ${PHONE_WIDTH - 0.8} 0`;
  const phoneFillPath = `M 0 0 L 0 ${PHONE_HEIGHT - PHONE_RADIUS} A ${PHONE_RADIUS} ${PHONE_RADIUS} 0 0 0 ${PHONE_RADIUS} ${PHONE_HEIGHT} L ${PHONE_WIDTH - PHONE_RADIUS} ${PHONE_HEIGHT} A ${PHONE_RADIUS} ${PHONE_RADIUS} 0 0 0 ${PHONE_WIDTH} ${PHONE_HEIGHT - PHONE_RADIUS} L ${PHONE_WIDTH} 0 Z`;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" translucent />

      {/* Atmospheric bottom ambient blurry glow */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Defs>
            <RadialGradient
              id="ambientBottomGlow"
              cx="35%"
              cy="91%"
              rx="82%"
              ry="38%"
              fx="35%"
              fy="91%"
            >
              <Stop offset="0%" stopColor="#7FA019" stopOpacity="0.65" />
              <Stop offset="22%" stopColor="#6C8715" stopOpacity="0.52" />
              <Stop offset="48%" stopColor="#4A5E0E" stopOpacity="0.36" />
              <Stop offset="70%" stopColor="#283407" stopOpacity="0.18" />
              <Stop offset="88%" stopColor="#101502" stopOpacity="0.06" />
              <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </RadialGradient>

            <RadialGradient
              id="diffuseBlurGlow"
              cx="48%"
              cy="86%"
              rx="60%"
              ry="26%"
              fx="48%"
              fy="86%"
            >
              <Stop offset="0%" stopColor="#95B820" stopOpacity="0.22" />
              <Stop offset="50%" stopColor="#5C7510" stopOpacity="0.10" />
              <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#ambientBottomGlow)" />
          <Rect width="100%" height="100%" fill="url(#diffuseBlurGlow)" />
        </Svg>
      </View>

      {/* Top Navigation Bar: Back Arrow for Steps 2 & 3 */}
      <View
        style={[
          styles.topNavContainer,
          {
            paddingTop: insets.top > 0 ? insets.top : 20,
            height: (insets.top > 0 ? insets.top : 20) + 48,
          },
        ]}
      >
        {step > 1 && (
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => switchStep((step - 1) as 1 | 2)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            testID="onboarding-back-button"
          >
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path
                d="M15 18L9 12L15 6"
                stroke="#FFFFFF"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        )}
      </View>

      {/* Fluid Horizontal Paging Carousel for Native Hand Sweeping in Both Directions */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
          const offsetX = e.nativeEvent.contentOffset.x;
          const nextStep = Math.min(Math.max(Math.round(offsetX / SCREEN_WIDTH) + 1, 1), 3) as 1 | 2 | 3;
          setStep(nextStep);
        }}
        style={styles.sliderScrollView}
        contentContainerStyle={styles.sliderContent}
      >
        {/* ========================================== */}
        {/* PAGE 1: First Onboarding Screen            */}
        {/* ========================================== */}
        <View style={[styles.page, { width: SCREEN_WIDTH }]}>
          <View style={styles.graphicContainer}>
            <Animated.View
              style={[
                styles.particleCluster,
                {
                  transform: [
                    {
                      rotate: particleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["90deg", "0deg"],
                      }),
                    },
                  ],
                },
              ]}
            >
              {PARTICLES.map((p) => {
                const translateX = particleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [p.xIn, p.xOut],
                });

                const translateY = particleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [p.yIn, p.yOut],
                });

                const scale = particleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.82, 1.0],
                });

                const opacity = particleAnim.interpolate({
                  inputRange: [0, 0.4, 1],
                  outputRange: [0.72, 0.88, 1.0],
                });

                return (
                  <Animated.View
                    key={p.id}
                    style={[
                      styles.particleDot,
                      {
                        width: p.size,
                        height: p.size,
                        borderRadius: p.size / 2,
                        backgroundColor: p.color,
                        transform: [{ translateX }, { translateY }, { scale }],
                        opacity,
                      },
                    ]}
                  />
                );
              })}
            </Animated.View>
          </View>

          {/* Typography (Exact unified y-position across all steps) */}
          <View style={styles.unifiedTextContainer}>
            <Text style={styles.headlineWhites}>Don't let</Text>
            <Text style={styles.headlineLimes}>good ideas</Text>
            <Text style={styles.headlineWhites}>disappear</Text>

            <Text style={styles.subtitle}>
              Save anything worth remembering ideas, links, images, and notes in seconds
            </Text>
          </View>
        </View>

        {/* ========================================== */}
        {/* PAGE 2: Second Onboarding Screen           */}
        {/* ========================================== */}
        <View style={[styles.page, { width: SCREEN_WIDTH }]}>
          <View style={styles.graphicContainer}>
            <View style={styles.clusterWrapper}>
              {/* Background Icons Cluster Image */}
              <Image
                source={require("../../assets/images/Icons.png")}
                style={styles.iconsImage}
                resizeMode="contain"
              />

              {/* Floating Liquid Glass Search Bar */}
              <View style={styles.searchBarWrapper}>
                <BlurView
                  intensity={Platform.OS === "ios" ? 45 : 55}
                  tint="dark"
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.searchBarTint} />

                {/* Bleed-through colored glow accents matching the cards */}
                <View style={StyleSheet.absoluteFill} pointerEvents="none">
                  <Svg width="100%" height="100%">
                    <Defs>
                      <RadialGradient
                        id="topCenterBloom"
                        cx="50%"
                        cy="0%"
                        rx="35%"
                        ry="35%"
                        fx="50%"
                        fy="0%"
                      >
                        <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.22" />
                        <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                      </RadialGradient>

                      <RadialGradient
                        id="topRightBloom"
                        cx="82%"
                        cy="0%"
                        rx="32%"
                        ry="35%"
                        fx="82%"
                        fy="0%"
                      >
                        <Stop offset="0%" stopColor="#2835C3" stopOpacity="0.24" />
                        <Stop offset="100%" stopColor="#2835C3" stopOpacity="0" />
                      </RadialGradient>

                      <RadialGradient
                        id="bottomLeftBloom"
                        cx="18%"
                        cy="100%"
                        rx="30%"
                        ry="42%"
                        fx="18%"
                        fy="100%"
                      >
                        <Stop offset="0%" stopColor="#B8F526" stopOpacity="0.24" />
                        <Stop offset="100%" stopColor="#B8F526" stopOpacity="0" />
                      </RadialGradient>

                      <RadialGradient
                        id="bottomMusicBloom"
                        cx="60%"
                        cy="100%"
                        rx="26%"
                        ry="38%"
                        fx="60%"
                        fy="100%"
                      >
                        <Stop offset="0%" stopColor="#8E5140" stopOpacity="0.22" />
                        <Stop offset="100%" stopColor="#8E5140" stopOpacity="0" />
                      </RadialGradient>

                      <RadialGradient
                        id="bottomRightBloom"
                        cx="86%"
                        cy="100%"
                        rx="28%"
                        ry="40%"
                        fx="86%"
                        fy="100%"
                      >
                        <Stop offset="0%" stopColor="#DB4C4C" stopOpacity="0.24" />
                        <Stop offset="100%" stopColor="#DB4C4C" stopOpacity="0" />
                      </RadialGradient>

                      <LinearGradient
                        id="specularRim"
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                      >
                        <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
                        <Stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.16" />
                        <Stop offset="75%" stopColor="#FFFFFF" stopOpacity="0.08" />
                        <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.04" />
                      </LinearGradient>

                      <LinearGradient
                        id="glassTopShine"
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                      >
                        <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.14" />
                        <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                      </LinearGradient>
                    </Defs>

                    <Rect width="100%" height="100%" fill="url(#topCenterBloom)" />
                    <Rect width="100%" height="100%" fill="url(#topRightBloom)" />
                    <Rect width="100%" height="100%" fill="url(#bottomLeftBloom)" />
                    <Rect width="100%" height="100%" fill="url(#bottomMusicBloom)" />
                    <Rect width="100%" height="100%" fill="url(#bottomRightBloom)" />
                    <Rect width="100%" height="24" fill="url(#glassTopShine)" />
                    <Rect
                      x="0.5"
                      y="0.5"
                      width={BAR_WIDTH - 1}
                      height={121}
                      rx="28"
                      ry="28"
                      fill="none"
                      stroke="url(#specularRim)"
                      strokeWidth="1"
                    />
                  </Svg>
                </View>

                {/* Search Bar Content */}
                <View style={styles.searchBarInner}>
                  <Text style={styles.searchPlaceholder}>Search Your Memories...</Text>

                  <View style={styles.searchControlsRow}>
                    <View style={styles.searchLeftGroup}>
                      <View style={styles.plusCircleBtn}>
                        <Svg width={15} height={15} viewBox="0 0 15 15" fill="none">
                          <Path
                            d="M7.5 2.5V12.5M2.5 7.5H12.5"
                            stroke="#8E95A5"
                            strokeWidth={2.2}
                            strokeLinecap="round"
                          />
                        </Svg>
                      </View>

                      <View style={styles.photoActionBtn}>
                        <Svg width={21} height={21} viewBox="0 0 21 21" fill="none">
                          <Rect
                            x="2"
                            y="3"
                            width="13"
                            height="13"
                            rx="3"
                            stroke="#8E95A5"
                            strokeWidth={1.7}
                          />
                          <Circle cx="6" cy="7" r="1.4" fill="#8E95A5" />
                          <Path
                            d="M3 13.5L6.8 9.5L10.5 13.2L12 11.5L14.8 13.8"
                            stroke="#8E95A5"
                            strokeWidth={1.7}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <Path
                            d="M17.5 13.5V19.5M14.5 16.5H20.5"
                            stroke="#8E95A5"
                            strokeWidth={1.9}
                            strokeLinecap="round"
                          />
                        </Svg>
                      </View>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={styles.sendLimeBtn}
                      testID="search-send-button"
                    >
                      <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
                        <Path
                          d="M10 15V5M5 10L10 5L15 10"
                          stroke="#000000"
                          strokeWidth={2.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Svg>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Typography (Exact unified y-position across all steps) */}
          <View style={styles.unifiedTextContainer}>
            <View style={styles.everythingRow}>
              <Text style={styles.headlineLime}>Everything</Text>
              <View style={styles.sparkleIcon}>
                <Svg width={36} height={36} viewBox="0 0 36 36" fill="none">
                  <Path
                    d="M16 2.5C16 10 23 17 30.5 17C23 17 16 24 16 31.5C16 24 9 17 1.5 17C9 17 16 10 16 2.5Z"
                    fill="#C6F52C"
                  />
                  <Path
                    d="M29 2C29 4.8 31.5 7.2 34 7.2C31.5 7.2 29 9.6 29 12.4C29 9.6 26.5 7.2 26.5 7.2C26.5 7.2 29 4.8 29 2Z"
                    fill="#C6F52C"
                  />
                </Svg>
              </View>
            </View>

            <Text style={styles.headlineWhite}>Exactly when</Text>
            <Text style={styles.headlineWhite}>you need it</Text>

            <Text style={styles.subtitle}>
              Search and rediscover the things you've saved
            </Text>
          </View>
        </View>

        {/* ========================================== */}
        {/* PAGE 3: Third Onboarding Screen (AI Chat)  */}
        {/* ========================================== */}
        <View style={[styles.page, { width: SCREEN_WIDTH }]}>
          <View style={styles.graphicContainer}>
            {/* Phone Mockup Frame (No top stroke, stroke fades up, bottom curves only) */}
            <View style={[styles.phoneFrameContainer, { width: PHONE_WIDTH, height: PHONE_HEIGHT }]}>
              {/* Phone Frame SVG Background & Fading U-Stroke */}
              <Svg width={PHONE_WIDTH} height={PHONE_HEIGHT} style={StyleSheet.absoluteFill}>
                <Defs>
                  {/* Vertical gradient stroke fading as it goes up */}
                  <LinearGradient id="phoneStrokeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.0" />
                    <Stop offset="25%" stopColor="#FFFFFF" stopOpacity="0.05" />
                    <Stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.22" />
                    <Stop offset="80%" stopColor="#FFFFFF" stopOpacity="0.50" />
                    <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.70" />
                  </LinearGradient>

                  {/* Dark subtle background fill */}
                  <LinearGradient id="phoneBgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor="#0D0E11" stopOpacity="0.85" />
                    <Stop offset="40%" stopColor="#111216" stopOpacity="0.92" />
                    <Stop offset="100%" stopColor="#141519" stopOpacity="0.96" />
                  </LinearGradient>
                </Defs>

                {/* Filled Phone Screen Area */}
                <Path d={phoneFillPath} fill="url(#phoneBgGrad)" />

                {/* Fading U-Stroke (Left, Bottom, Right only - No Top Stroke!) */}
                <Path
                  d={phoneStrokePath}
                  fill="none"
                  stroke="url(#phoneStrokeGrad)"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                />
              </Svg>

              {/* Floating Tilted User Query Bubble with Authentic Liquid Glass Stack */}
              <View style={[styles.userBubbleCard, { width: USER_BUBBLE_WIDTH }]}>
                {/* 1. Frosted Glass Blur */}
                <BlurView
                  intensity={Platform.OS === "ios" ? 45 : 55}
                  tint="dark"
                  style={StyleSheet.absoluteFill}
                />

                {/* 2. Translucent Liquid Dark Tint (same as onboarding 2) */}
                <View style={styles.glassCardTint} />

                {/* 3. Diffuse Bloom, Specular Shine & Gradient Rim Stroke */}
                <View style={StyleSheet.absoluteFill} pointerEvents="none">
                  <Svg width={USER_BUBBLE_WIDTH} height={104}>
                    <Defs>
                      <RadialGradient id="userPromptBloom" cx="50%" cy="0%" rx="45%" ry="45%" fx="50%" fy="0%">
                        <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.22" />
                        <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                      </RadialGradient>
                      <LinearGradient id="userPromptTopShine" x1="0%" y1="0%" x2="0%" y2="100%">
                        <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.16" />
                        <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                      </LinearGradient>
                      <LinearGradient id="userBubbleRimGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.50" />
                        <Stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.18" />
                        <Stop offset="75%" stopColor="#FFFFFF" stopOpacity="0.08" />
                        <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.04" />
                      </LinearGradient>
                    </Defs>
                    <Rect width="100%" height="100%" fill="url(#userPromptBloom)" />
                    <Rect width="100%" height="24" fill="url(#userPromptTopShine)" />
                    <Rect
                      x={0.6}
                      y={0.6}
                      width={USER_BUBBLE_WIDTH - 1.2}
                      height={104 - 1.2}
                      rx={26}
                      ry={26}
                      fill="none"
                      stroke="url(#userBubbleRimGrad)"
                      strokeWidth={1.2}
                    />
                  </Svg>
                </View>

                {/* Text Content */}
                <Text style={styles.userBubbleText}>
                  What was the marketing idea I saved a few weeks ago?
                </Text>

                {/* Top-Right Neon Lime Button */}
                <View style={styles.userSendBtn}>
                  <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
                    <Path
                      d="M9 13.5V4.5M4.5 9L9 4.5L13.5 9"
                      stroke="#000000"
                      strokeWidth={2.4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
              </View>

              {/* AI Response Section */}
              <View style={styles.aiMessageRow}>
                {/* AI Profile Logo with Liquid Glass Gradient Stroke */}
                <View style={styles.aiAvatarWrapper}>
                  <Svg width={34} height={34} style={StyleSheet.absoluteFill}>
                    <Defs>
                      <LinearGradient id="aiLogoGrad" x1="15%" y1="0%" x2="85%" y2="100%">
                        <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.65" />
                        <Stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.26" />
                        <Stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.08" />
                        <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
                      </LinearGradient>
                    </Defs>
                    <Circle
                      cx={17}
                      cy={17}
                      r={16.3}
                      fill="rgba(32, 34, 40, 0.85)"
                      stroke="url(#aiLogoGrad)"
                      strokeWidth={1.4}
                    />
                  </Svg>
                  <Text style={styles.aiAvatarText}>AI</Text>
                </View>

                {/* AI Result Container with Authentic Liquid Glass Stack */}
                <View style={styles.aiBubbleContainer}>
                  <View style={[styles.aiBubbleCard, { width: AI_BUBBLE_WIDTH, height: 68 }]}>
                    <BlurView
                      intensity={Platform.OS === "ios" ? 45 : 55}
                      tint="dark"
                      style={StyleSheet.absoluteFill}
                    />
                    <View style={styles.glassCardTint} />

                    {/* Specular Rim & Top Shine */}
                    <View style={StyleSheet.absoluteFill} pointerEvents="none">
                      <Svg width={AI_BUBBLE_WIDTH} height={68}>
                        <Defs>
                          <RadialGradient id="aiResultBloom" cx="50%" cy="0%" rx="50%" ry="50%" fx="50%" fy="0%">
                            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.18" />
                            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                          </RadialGradient>
                          <LinearGradient id="aiBubbleRimGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
                            <Stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.16" />
                            <Stop offset="75%" stopColor="#FFFFFF" stopOpacity="0.08" />
                            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.04" />
                          </LinearGradient>
                          <LinearGradient id="aiTopShine" x1="0%" y1="0%" x2="0%" y2="100%">
                            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.14" />
                            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                          </LinearGradient>
                        </Defs>
                        <Rect width="100%" height="100%" fill="url(#aiResultBloom)" />
                        <Rect width="100%" height="18" fill="url(#aiTopShine)" />
                        <Rect
                          x={0.6}
                          y={0.6}
                          width={AI_BUBBLE_WIDTH - 1.2}
                          height={68 - 1.2}
                          rx={20}
                          ry={20}
                          fill="none"
                          stroke="url(#aiBubbleRimGrad)"
                          strokeWidth={1.2}
                        />
                      </Svg>
                    </View>

                    <Text style={styles.aiBubbleText}>
                      You saved 3 marketing ideas.{"\n"}The most relevant one was...
                    </Text>
                  </View>

                  {/* 4 Action Icons Row with Liquid Glass Gradient Stroke */}
                  <View style={styles.actionButtonsRow}>
                    {/* Copy Button */}
                    <TouchableOpacity activeOpacity={0.75} style={styles.liquidActionBtn}>
                      <Svg width={28} height={28} style={StyleSheet.absoluteFill}>
                        <Defs>
                          <LinearGradient id="actCopyGrad" x1="15%" y1="0%" x2="85%" y2="100%">
                            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.65" />
                            <Stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.26" />
                            <Stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.08" />
                            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
                          </LinearGradient>
                        </Defs>
                        <Circle
                          cx={14}
                          cy={14}
                          r={13.3}
                          fill="rgba(32, 34, 40, 0.85)"
                          stroke="url(#actCopyGrad)"
                          strokeWidth={1.3}
                        />
                      </Svg>
                      <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
                        <Rect
                          x="4.5"
                          y="4.5"
                          width="7"
                          height="7"
                          rx="1.8"
                          stroke="#9CA3AF"
                          strokeWidth={1.3}
                        />
                        <Path
                          d="M9.5 2.5H3.5C2.7 2.5 2.2 3 2.2 3.8V9.5"
                          stroke="#9CA3AF"
                          strokeWidth={1.3}
                          strokeLinecap="round"
                        />
                      </Svg>
                    </TouchableOpacity>

                    {/* Share Button */}
                    <TouchableOpacity activeOpacity={0.75} style={styles.liquidActionBtn}>
                      <Svg width={28} height={28} style={StyleSheet.absoluteFill}>
                        <Defs>
                          <LinearGradient id="actShareGrad" x1="15%" y1="0%" x2="85%" y2="100%">
                            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.65" />
                            <Stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.26" />
                            <Stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.08" />
                            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
                          </LinearGradient>
                        </Defs>
                        <Circle
                          cx={14}
                          cy={14}
                          r={13.3}
                          fill="rgba(32, 34, 40, 0.85)"
                          stroke="url(#actShareGrad)"
                          strokeWidth={1.3}
                        />
                      </Svg>
                      <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
                        <Circle cx="10" cy="3.5" r="1.6" fill="#9CA3AF" />
                        <Circle cx="3.5" cy="7" r="1.6" fill="#9CA3AF" />
                        <Circle cx="10" cy="10.5" r="1.6" fill="#9CA3AF" />
                        <Line x1="4.8" y1="6.2" x2="8.6" y2="4.3" stroke="#9CA3AF" strokeWidth={1.2} />
                        <Line x1="4.8" y1="7.8" x2="8.6" y2="9.7" stroke="#9CA3AF" strokeWidth={1.2} />
                      </Svg>
                    </TouchableOpacity>

                    {/* Thumbs Up Button */}
                    <TouchableOpacity activeOpacity={0.75} style={styles.liquidActionBtn}>
                      <Svg width={28} height={28} style={StyleSheet.absoluteFill}>
                        <Defs>
                          <LinearGradient id="actThumbGrad" x1="15%" y1="0%" x2="85%" y2="100%">
                            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.65" />
                            <Stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.26" />
                            <Stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.08" />
                            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
                          </LinearGradient>
                        </Defs>
                        <Circle
                          cx={14}
                          cy={14}
                          r={13.3}
                          fill="rgba(32, 34, 40, 0.85)"
                          stroke="url(#actThumbGrad)"
                          strokeWidth={1.3}
                        />
                      </Svg>
                      <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
                        <Path
                          d="M4 11.5V6.5H2V11.5H4ZM11.5 6.5C11.5 5.8 10.9 5.2 10.2 5.2H7.8L8.2 3.2C8.3 2.8 8.1 2.4 7.8 2.2L7.2 1.5L4 4.8V11.5H9.6C10.1 11.5 10.5 11.2 10.7 10.8L12.2 7.2C12.3 7 12.3 6.8 12.3 6.6V6.5H11.5Z"
                          stroke="#9CA3AF"
                          strokeWidth={1.2}
                          strokeLinejoin="round"
                        />
                      </Svg>
                    </TouchableOpacity>

                    {/* More Button */}
                    <TouchableOpacity activeOpacity={0.75} style={styles.liquidActionBtn}>
                      <Svg width={28} height={28} style={StyleSheet.absoluteFill}>
                        <Defs>
                          <LinearGradient id="actMoreGrad" x1="15%" y1="0%" x2="85%" y2="100%">
                            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.65" />
                            <Stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.26" />
                            <Stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.08" />
                            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
                          </LinearGradient>
                        </Defs>
                        <Circle
                          cx={14}
                          cy={14}
                          r={13.3}
                          fill="rgba(32, 34, 40, 0.85)"
                          stroke="url(#actMoreGrad)"
                          strokeWidth={1.3}
                        />
                      </Svg>
                      <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
                        <Circle cx="7" cy="3.2" r="1.2" fill="#9CA3AF" />
                        <Circle cx="7" cy="7" r="1.2" fill="#9CA3AF" />
                        <Circle cx="7" cy="10.8" r="1.2" fill="#9CA3AF" />
                      </Svg>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Bottom Liquid Glass Search Bar & Audio (Mic) Icon (Exact AI chat page styling) */}
              <View style={styles.mockInputBarRow}>
                {/* Search Bar Capsule with Liquid Glass Gradient Stroke */}
                <View style={{ flex: 1 }}>
                  <IOSGlassCapsule
                    height={44}
                    borderRadius={22}
                    fill="#17181D"
                    gradientId="onboardingSearchCapsuleGrad"
                    contentStyle={styles.searchCapsuleInner}
                  >
                    <View style={styles.mockPlusCircle}>
                      <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
                        <Path
                          d="M7 2.5V11.5M2.5 7H11.5"
                          stroke="#8E95A5"
                          strokeWidth={2}
                          strokeLinecap="round"
                        />
                      </Svg>
                    </View>
                    <Text style={styles.mockInputPlaceholder}>
                      Ask your memory anything...
                    </Text>
                  </IOSGlassCapsule>
                </View>

                {/* Audio (Mic) Button with Liquid Glass Gradient Stroke */}
                <IOSGlassButton
                  size={44}
                  fill="#1A1C22"
                  gradientId="onboardingMicBtnGrad"
                  activeOpacity={0.75}
                >
                  <Svg width={18} height={18} viewBox="0 0 20 20" fill="none">
                    <Path
                      d="M10 2C8.9 2 8 2.9 8 4V10C8 11.1 8.9 12 10 12C11.1 12 12 11.1 12 10V4C12 2.9 11.1 2 10 2Z"
                      fill="#FFFFFF"
                    />
                    <Path
                      d="M5 9V10C5 12.8 7.2 15 10 15C12.8 15 15 12.8 15 10V9M10 15V18M7 18H13"
                      stroke="#FFFFFF"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </IOSGlassButton>
              </View>

              {/* White iOS Home Indicator Bar */}
              <View style={styles.mockHomeBar} />
            </View>
          </View>

          {/* Typography (Exact unified y-position across all steps) */}
          <View style={styles.unifiedTextContainer}>
            <Text style={styles.headlineWhite}>Your memories</Text>
            <Text style={styles.headlineLime}>can answer</Text>
            <Text style={styles.headlineWhite}>back</Text>

            <Text style={styles.subtitle}>
              Ask AI. Find connections. Rediscover what you forgot.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* 3-Dot Interactive Pagination Indicator */}
      <View style={styles.paginationDotsRow}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => switchStep(1)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          testID="onboarding-dot-1"
        >
          <View style={[styles.dot, step === 1 ? styles.dotActive : styles.dotInactive]} />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => switchStep(2)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          testID="onboarding-dot-2"
        >
          <View style={[styles.dot, step === 2 ? styles.dotActive : styles.dotInactive]} />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => switchStep(3)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          testID="onboarding-dot-3"
        >
          <View style={[styles.dot, step === 3 ? styles.dotActive : styles.dotInactive]} />
        </TouchableOpacity>
      </View>

      {/* Bottom Continue Action Button */}
      <View
        style={[
          styles.bottomContainer,
          {
            paddingBottom: Math.max(insets.bottom + 36, 60),
          },
        ]}
      >
        <TouchableOpacity
          style={styles.continueButton}
          activeOpacity={0.88}
          onPress={handleContinue}
          testID="onboarding-continue-button"
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  topNavContainer: {
    paddingHorizontal: 24,
    justifyContent: "center",
    zIndex: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  sliderScrollView: {
    flex: 1,
  },
  sliderContent: {
    width: SCREEN_WIDTH * 3,
  },
  page: {
    flex: 1,
    paddingHorizontal: 28,
  },

  // Standardized upper graphic area for all 3 pages (generous top margin creates clean gap)
  graphicContainer: {
    width: "100%",
    height: 292,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 34,
  },

  // Unified Text Container for Page 1, Page 2, and Page 3 (Exact same Y-axis!)
  unifiedTextContainer: {
    marginTop: 26,
  },
  headlineWhite: {
    fontSize: 48,
    lineHeight: 46,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -1.2,
  },
  headlineWhites: {
    fontSize: 52,
    lineHeight: 52,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -1.2,
  },
  headlineLime: {
    fontSize: 48,
    lineHeight: 46,
    fontWeight: "800",
    color: "#C6F52C",
    letterSpacing: -1.2,
  },
  headlineLimes: {
    fontSize: 52,
    lineHeight: 54,
    fontWeight: "800",
    color: "#C6F52C",
    letterSpacing: -1.2,
  },
  subtitle: {
    marginTop: 14,
    fontSize: 14,
    lineHeight: 20,
    color: "#8E95A5",
    fontWeight: "400",
    maxWidth: 340,
  },
  everythingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sparkleIcon: {
    marginLeft: 10,
    marginTop: 2,
  },

  // ==========================================
  // Step 1: Particle Constellation
  // ==========================================
  particleCluster: {
    width: 250,
    height: 250,
    alignItems: "center",
    justifyContent: "center",
  },
  particleDot: {
    position: "absolute",
    shadowColor: "#D4F82C",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 2,
  },

  // ==========================================
  // Step 2: 7 Cards + Liquid Glass Search Bar
  // ==========================================
  clusterWrapper: {
    width: BAR_WIDTH,
    height: 122,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  iconsImage: {
    position: "absolute",
    width: ICONS_WIDTH,
    height: ICONS_HEIGHT,
    top: ICONS_TOP,
    left: (BAR_WIDTH - ICONS_WIDTH) / 2,
    zIndex: 1,
  },
  searchBarWrapper: {
    width: BAR_WIDTH,
    height: 122,
    borderRadius: 28,
    overflow: "hidden",
    position: "absolute",
    zIndex: 10,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.55,
    shadowRadius: 22,
    elevation: 12,
  },
  searchBarTint: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(22, 22, 26, 0.72)",
  },
  searchBarInner: {
    flex: 1,
    justifyContent: "space-between",
    paddingTop: 18,
    paddingBottom: 14,
    paddingHorizontal: 18,
  },
  searchPlaceholder: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "500",
    color: "#8E95A5",
    letterSpacing: -0.2,
  },
  searchControlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  searchLeftGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  plusCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  photoActionBtn: {
    marginLeft: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  sendLimeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#C6F52C",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#C6F52C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },

  // ==========================================
  // Step 3: Device Frame + AI Chat Mock
  // ==========================================
  phoneFrameContainer: {
    position: "relative",
    paddingHorizontal: 14,
    paddingTop: 94,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.55,
    shadowRadius: 22,
    elevation: 9,
  },
  glassCardTint: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(22, 22, 26, 0.72)",
  },
  userBubbleCard: {
    position: "absolute",
    top: -18,
    left: 14,
    height: 104,
    borderRadius: 26,
    overflow: "hidden",
    transform: [{ rotate: "-3.5deg" }],
    zIndex: 10,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.65,
    shadowRadius: 20,
    elevation: 11,
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  userBubbleText: {
    fontSize: 13.5,
    lineHeight: 19,
    fontWeight: "500",
    color: "#D1D5DB",
    maxWidth: 215,
  },
  userSendBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#C6F52C",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#C6F52C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 3,
  },
  aiMessageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 6,
  },
  aiAvatarWrapper: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  aiAvatarText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#B0B7C3",
  },
  aiBubbleContainer: {
    flex: 1,
    marginLeft: 10,
  },
  aiBubbleCard: {
    borderRadius: 20,
    overflow: "hidden",
    paddingHorizontal: 14,
    paddingVertical: 12,
    position: "relative",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 6,
  },
  aiBubbleText: {
    fontSize: 13,
    lineHeight: 18.5,
    color: "#D1D5DB",
    fontWeight: "400",
  },
  actionButtonsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 8,
  },
  liquidActionBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  mockInputBarRow: {
    position: "absolute",
    bottom: 22,
    left: 14,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchCapsuleInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    width: "100%",
    height: "100%",
  },
  mockPlusCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  mockInputPlaceholder: {
    fontSize: 12.5,
    color: "#8E95A5",
    marginLeft: 8,
  },
  mockHomeBar: {
    position: "absolute",
    bottom: 8,
    width: 108,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
    alignSelf: "center",
  },

  // ==========================================
  // Pagination Indicator Dots (3 Dots)
  // ==========================================
  paginationDotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 22,
    backgroundColor: "#C6F52C",
  },
  dotInactive: {
    width: 6,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },

  // ==========================================
  // Bottom Continue Action Button
  // ==========================================
  bottomContainer: {
    paddingHorizontal: 28,
  },
  continueButton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: "#C6F52C",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#C6F52C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 5,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#000000",
    letterSpacing: -0.2,
  },
});
