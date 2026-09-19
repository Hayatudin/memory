import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Image,
  Platform,
  Animated,
  PanResponder,
} from "react-native";
import Svg, { Defs, LinearGradient, Stop, Rect, Path } from "react-native-svg";
import { Icon, IconName } from "../../components/common/Icon";
import { MemoryType, Memory } from "../../types/models";
import { useMemoryStore } from "../../store/memoryStore";
import { TextMemoryComposer } from "../../components/memories/TextMemoryComposer";
import { ImageMemoryComposer } from "../../components/memories/ImageMemoryComposer";
import { LinkMemoryComposer } from "../../components/memories/LinkMemoryComposer";
import { VoiceMemoryComposer } from "../../components/memories/VoiceMemoryComposer";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface AddMemoryModalProps {
  navigation: any;
}

interface TypeCardOption {
  type: MemoryType;
  title: string;
  subtitle: string;
  icon: IconName;
}

const TYPE_OPTIONS: TypeCardOption[] = [
  {
    type: "image",
    title: "Image",
    subtitle: "Photos, screenshots,\nanything visual",
    icon: "image",
  },
  {
    type: "link",
    title: "Link",
    subtitle: "Websites, articles,\nvideos and more",
    icon: "link",
  },
  {
    type: "text",
    title: "Text",
    subtitle: "Ideas, notes, quotes,\nthoughts",
    icon: "document",
  },
  {
    type: "voice",
    title: "Voice",
    subtitle: "Quick voice memos\nand ideas",
    icon: "audio-wave",
  },
];

interface StackedTypeIconProps {
  type: MemoryType;
}

/**
 * 3D Stacked Card Icon matching the reference design:
 * Bright chartreuse lime back layer + olive gradient front layer with white vector glyph.
 */
const StackedTypeIcon: React.FC<StackedTypeIconProps> = ({ type }) => {
  return (
    <View style={styles.stackedIconContainer}>
      {/* Back Layer - Flat bright chartreuse lime */}
      <View style={styles.stackedIconBack} />

      {/* Front Layer - Olive-lime gradient with subtle border & white glyph */}
      <View style={styles.stackedIconFront}>
        <Svg width={42} height={42} style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id={`frontGrad-${type}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#96B82F" />
              <Stop offset="100%" stopColor="#55691B" />
            </LinearGradient>
          </Defs>
          <Rect
            x={0.6}
            y={0.6}
            width={40.8}
            height={40.8}
            rx={11}
            ry={11}
            fill={`url(#frontGrad-${type})`}
            stroke="rgba(255, 255, 255, 0.28)"
            strokeWidth={1.2}
          />
        </Svg>
        <View style={styles.stackedIconGlyph}>
          {type === "image" && (
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Rect x="2.5" y="3.5" width="19" height="17" rx="3.5" stroke="#FFFFFF" strokeWidth={2} />
              <Path
                d="M4.5 16.5L9 11.5L13 15.5L16.5 11.5L19.5 16.5"
                stroke="#FFFFFF"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          )}
          {type === "link" && (
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path
                d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"
                stroke="#FFFFFF"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"
                stroke="#FFFFFF"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          )}
          {type === "text" && (
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path
                d="M6 2H13.5L19 7.5V20C19 21.1 18.1 22 17 22H6C4.9 22 4 21.1 4 20V4C4 2.9 4.9 2 6 2Z"
                stroke="#FFFFFF"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M13.5 2V7.5H19"
                stroke="#FFFFFF"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M8 13H15M8 17H13"
                stroke="#FFFFFF"
                strokeWidth={2}
                strokeLinecap="round"
              />
            </Svg>
          )}
          {type === "voice" && (
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path
                d="M4 11V13M8 8V16M12 4V20M16 8V16M20 11V13"
                stroke="#FFFFFF"
                strokeWidth={2.5}
                strokeLinecap="round"
              />
            </Svg>
          )}
        </View>
      </View>
    </View>
  );
};

interface LiquidGlassCardProps {
  option: TypeCardOption;
  onPress: () => void;
}

const LiquidGlassCard: React.FC<LiquidGlassCardProps> = ({ option, onPress }) => {
  const [layout, setLayout] = useState({ width: 0, height: 0 });

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      style={styles.liquidCardTouchable}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        if (width > 0 && Math.abs(width - layout.width) > 1) {
          setLayout({ width, height });
        }
      }}
    >
      {layout.width > 0 && (
        <Svg
          width={layout.width}
          height={layout.height}
          style={StyleSheet.absoluteFill}
        >
          <Defs>
            {/* Card vertical dark gradient fill */}
            <LinearGradient
              id={`cardFill-${option.type}`}
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <Stop offset="0%" stopColor="#08080A" />
              <Stop offset="55%" stopColor="#101114" />
              <Stop offset="100%" stopColor="#1B1C20" />
            </LinearGradient>

            {/* Specular glass reflection stroke from top-left */}
            <LinearGradient
              id={`liquidStroke-${option.type}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.42} />
              <Stop offset="25%" stopColor="#FFFFFF" stopOpacity={0.22} />
              <Stop offset="55%" stopColor="#FFFFFF" stopOpacity={0.06} />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.0} />
            </LinearGradient>
          </Defs>

          {/* Liquid Glass Card Shape */}
          <Rect
            x={0.6}
            y={0.6}
            width={layout.width - 1.2}
            height={layout.height - 1.2}
            rx={26}
            ry={26}
            fill={`url(#cardFill-${option.type})`}
            stroke={`url(#liquidStroke-${option.type})`}
            strokeWidth={1.2}
          />
        </Svg>
      )}

      {/* Card Content */}
      <View style={styles.liquidCardContent}>
        <StackedTypeIcon type={option.type} />
        <View style={styles.cardTextContainer}>
          <Text style={styles.typeCardTitle}>{option.title}</Text>
          <Text style={styles.typeCardSubtitle}>{option.subtitle}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const AddMemoryModal: React.FC<AddMemoryModalProps> = ({ navigation }) => {
  const { fetchMemories, fetchCategories, categories } = useMemoryStore();
  const [activeComposer, setActiveComposer] = useState<MemoryType | null>(null);
  const [savedMemory, setSavedMemory] = useState<Memory | null>(null);

  const SHEET_HEIGHT = Math.round(SCREEN_HEIGHT * 0.74);
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchCategories().catch(() => {});

    // Smooth entrance of sheet and backdrop
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        damping: 24,
        stiffness: 260,
        mass: 0.85,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fetchCategories]);

  const dismissModal = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: SHEET_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.goBack();
    });
  };

  // PanResponder on the grey sheet container to drag down and dismiss smoothly
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only claim downward vertical drag gestures
        return (
          gestureState.dy > 6 &&
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx) * 1.2
        );
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
          const progress = Math.max(0, 1 - gestureState.dy / (SHEET_HEIGHT * 0.8));
          backdropOpacity.setValue(progress);
        } else {
          // Elastic resistance against upward pulling
          translateY.setValue(gestureState.dy * 0.15);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // Easily minimize / cancel if dragged down past 75px or flicked down
        if (gestureState.dy > 75 || gestureState.vy > 0.45) {
          dismissModal();
        } else {
          // Snap back smoothly
          Animated.parallel([
            Animated.spring(translateY, {
              toValue: 0,
              damping: 22,
              stiffness: 260,
              useNativeDriver: true,
            }),
            Animated.timing(backdropOpacity, {
              toValue: 1,
              duration: 150,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.parallel([
          Animated.spring(translateY, {
            toValue: 0,
            damping: 22,
            stiffness: 260,
            useNativeDriver: true,
          }),
          Animated.timing(backdropOpacity, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
      },
    })
  ).current;

  // Dedicated PanResponder on the grab handle for instant touch grabbing
  const handlePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 2;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
          const progress = Math.max(0, 1 - gestureState.dy / (SHEET_HEIGHT * 0.8));
          backdropOpacity.setValue(progress);
        } else {
          translateY.setValue(gestureState.dy * 0.15);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 60 || gestureState.vy > 0.35) {
          dismissModal();
        } else {
          Animated.parallel([
            Animated.spring(translateY, {
              toValue: 0,
              damping: 22,
              stiffness: 260,
              useNativeDriver: true,
            }),
            Animated.timing(backdropOpacity, {
              toValue: 1,
              duration: 150,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.parallel([
          Animated.spring(translateY, {
            toValue: 0,
            damping: 22,
            stiffness: 260,
            useNativeDriver: true,
          }),
          Animated.timing(backdropOpacity, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
      },
    })
  ).current;

  const handleSaveSuccess = (memory: Memory) => {
    // Refresh background store
    fetchMemories().catch(() => {});
    setSavedMemory(memory);
  };

  const handleViewMemory = () => {
    if (savedMemory) {
      navigation.replace("MemoryDetail", { memoryId: savedMemory.id });
    } else {
      navigation.goBack();
    }
  };

  const handleDone = () => {
    navigation.goBack();
  };

  // 1. Success Screen ("Memory saved ✓")
  if (savedMemory) {
    const memoryCategory = categories.find((c) => c.id === savedMemory.categoryId);
    const categoryName = memoryCategory?.name || "Nature";

    return (
      <SafeAreaView style={styles.fullScreenBlack}>
        <StatusBar barStyle="light-content" />
        <View style={styles.successContainer}>
          {/* Glowing Green Particles Header Background */}
          <View style={styles.topGlowEffect}>
            <Svg width={SCREEN_WIDTH} height={180} viewBox={`0 0 ${SCREEN_WIDTH} 180`}>
              <Defs>
                <LinearGradient id="successTopGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor="#8AE026" stopOpacity={0.25} />
                  <Stop offset="50%" stopColor="#8AE026" stopOpacity={0.08} />
                  <Stop offset="100%" stopColor="#8AE026" stopOpacity={0} />
                </LinearGradient>
              </Defs>
              <Rect x="0" y="0" width={SCREEN_WIDTH} height="180" fill="url(#successTopGlow)" />
            </Svg>
          </View>

          {/* Centered Glowing Green Check Badge */}
          <View style={styles.centerBadgeSection}>
            <View style={styles.glowOuterRing}>
              <View style={styles.glowInnerCircle}>
                <Icon name="check" size={34} color="#8AE026" strokeWidth={3.5} />
              </View>
            </View>

            <Text style={styles.successHeadline}>Memory saved ✓</Text>
            <Text style={styles.successSubline}>
              Your memory has been saved successfully.
            </Text>
          </View>

          {/* Saved Memory Card Preview */}
          <View style={styles.previewMemoryCard}>
            {savedMemory.mediaUrl && savedMemory.type === "image" ? (
              <Image source={{ uri: savedMemory.mediaUrl }} style={styles.cardThumbImage} />
            ) : (
              <View style={styles.cardThumbBadge}>
                <Icon
                  name={
                    savedMemory.type === "voice"
                      ? "mic"
                      : savedMemory.type === "link"
                      ? "link"
                      : "document"
                  }
                  size={24}
                  color="#8AE026"
                  strokeWidth={2.2}
                />
              </View>
            )}

            <View style={styles.cardContentCol}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {savedMemory.title}
              </Text>

              <View style={styles.cardBottomMeta}>
                <View style={styles.cardCategoryBadge}>
                  <Icon name="sparkles" size={12} color="#8AE026" />
                  <Text style={styles.cardCategoryText}>{categoryName}</Text>
                </View>
                <Text style={styles.cardTimestamp}>Just now</Text>
              </View>
            </View>
          </View>

          {/* Bottom Action Buttons */}
          <View style={styles.successActionsCol}>
            <TouchableOpacity
              style={styles.viewMemoryBtn}
              activeOpacity={0.85}
              onPress={handleViewMemory}
            >
              <Text style={styles.viewMemoryBtnText}>View Memory</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.doneBtn}
              activeOpacity={0.8}
              onPress={handleDone}
            >
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // 2. Dedicated Composers
  if (activeComposer === "text") {
    return (
      <SafeAreaView style={styles.fullScreenBlack}>
        <StatusBar barStyle="light-content" />
        <TextMemoryComposer
          onBack={() => setActiveComposer(null)}
          onSuccess={handleSaveSuccess}
        />
      </SafeAreaView>
    );
  }

  if (activeComposer === "image") {
    return (
      <SafeAreaView style={styles.fullScreenBlack}>
        <StatusBar barStyle="light-content" />
        <ImageMemoryComposer
          onBack={() => setActiveComposer(null)}
          onSuccess={handleSaveSuccess}
        />
      </SafeAreaView>
    );
  }

  if (activeComposer === "link") {
    return (
      <SafeAreaView style={styles.fullScreenBlack}>
        <StatusBar barStyle="light-content" />
        <LinkMemoryComposer
          onBack={() => setActiveComposer(null)}
          onSuccess={handleSaveSuccess}
        />
      </SafeAreaView>
    );
  }

  if (activeComposer === "voice") {
    return (
      <SafeAreaView style={styles.fullScreenBlack}>
        <StatusBar barStyle="light-content" />
        <VoiceMemoryComposer
          onBack={() => setActiveComposer(null)}
          onSuccess={handleSaveSuccess}
        />
      </SafeAreaView>
    );
  }

  // 3. Main "Add Memory" Bottom Sheet (iOS Style with Smooth Drag-to-Dismiss)
  return (
    <View style={styles.modalRoot}>
      <StatusBar barStyle="light-content" />

      {/* 
        Independent Semi-Transparent Dark Overlay:
        - Applied to the background behind the sheet (NOT on the grey container itself).
        - Not fully black: rgba(0, 0, 0, 0.40) so the top Home screen content stays visible.
        - Tapping it smoothly minimizes and cancels the modal.
      */}
      <Animated.View
        style={[
          styles.backdropDimmer,
          {
            opacity: backdropOpacity,
          },
        ]}
      >
        <TouchableWithoutFeedback onPress={dismissModal}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>
      </Animated.View>

      {/* 
        Independent Grey Container:
        - Contains ONLY the grey section (#1C1C1E) with the 4 types and text.
        - Translates down smoothly on drag gesture and minimizes easily.
      */}
      <Animated.View
        style={[
          styles.twoThirdsSheet,
          {
            transform: [{ translateY }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {/* iOS Grab Handle with dedicated touch responder */}
        <View style={styles.grabHandleRow} {...handlePanResponder.panHandlers}>
          <View style={styles.grabHandle} />
        </View>

        {/* Header Row: Title & Circular Close Button */}
        <View style={styles.sheetHeader}>
          <View>
            <Text style={styles.sheetTitle}>Add Memory</Text>
            <Text style={styles.sheetSubtitle}>What do you want to remember?</Text>
          </View>

          <TouchableOpacity
            style={styles.closeCircleBtn}
            activeOpacity={0.75}
            onPress={dismissModal}
          >
            <Icon name="close" size={14} color="#FFFFFF" strokeWidth={2.4} />
          </TouchableOpacity>
        </View>

        {/* 2x2 Grid of Liquid Glass Cards */}
        <View style={styles.gridContainer}>
          {/* Row 1: Image & Link */}
          <View style={styles.gridRow}>
            <LiquidGlassCard
              option={TYPE_OPTIONS[0]}
              onPress={() => setActiveComposer("image")}
            />
            <LiquidGlassCard
              option={TYPE_OPTIONS[1]}
              onPress={() => setActiveComposer("link")}
            />
          </View>

          {/* Row 2: Text & Voice */}
          <View style={styles.gridRow}>
            <LiquidGlassCard
              option={TYPE_OPTIONS[2]}
              onPress={() => setActiveComposer("text")}
            />
            <LiquidGlassCard
              option={TYPE_OPTIONS[3]}
              onPress={() => setActiveComposer("voice")}
            />
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "transparent",
  },
  backdropDimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.40)",
  },
  twoThirdsSheet: {
    height: Math.round(SCREEN_HEIGHT * 0.74),
    backgroundColor: "#1C1C1E",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 44 : 28,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  grabHandleRow: {
    alignItems: "center",
    paddingVertical: 8,
  },
  grabHandle: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginTop: 6,
    marginBottom: 24,
  },
  sheetTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  sheetSubtitle: {
    fontSize: 15,
    color: "#8E93A0",
    marginTop: 4,
  },
  closeCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.10)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
    justifyContent: "center",
    alignItems: "center",
  },
  gridContainer: {
    gap: 16,
  },
  gridRow: {
    flexDirection: "row",
    gap: 16,
  },
  liquidCardTouchable: {
    flex: 1,
    minHeight: 180,
    borderRadius: 26,
    overflow: "hidden",
    position: "relative",
  },
  liquidCardContent: {
    flex: 1,
    padding: 18,
    justifyContent: "space-between",
    zIndex: 2,
  },
  stackedIconContainer: {
    width: 50,
    height: 48,
    position: "relative",
  },
  stackedIconBack: {
    position: "absolute",
    top: 0,
    left: 8,
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#A0D923",
  },
  stackedIconFront: {
    position: "absolute",
    top: 6,
    left: 0,
    width: 42,
    height: 42,
    borderRadius: 11,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.45,
    shadowRadius: 5,
    elevation: 4,
  },
  stackedIconGlyph: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTextContainer: {
    marginTop: "auto",
  },
  typeCardTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.3,
    marginBottom: 5,
  },
  typeCardSubtitle: {
    color: "#8B909D",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "400",
  },

  // Full Screen Styles (for Composers and Success)
  fullScreenBlack: {
    flex: 1,
    backgroundColor: "#000000",
  },
  successContainer: {
    flex: 1,
    backgroundColor: "#000000",
    paddingHorizontal: 20,
    justifyContent: "space-between",
    paddingBottom: Platform.OS === "ios" ? 36 : 24,
  },
  topGlowEffect: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  centerBadgeSection: {
    alignItems: "center",
    marginTop: 60,
  },
  glowOuterRing: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 2,
    borderColor: "rgba(138, 224, 38, 0.35)",
    backgroundColor: "rgba(138, 224, 38, 0.06)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#8AE026",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.65,
    shadowRadius: 18,
    marginBottom: 20,
  },
  glowInnerCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 2,
    borderColor: "#8AE026",
    backgroundColor: "#080B0F",
    justifyContent: "center",
    alignItems: "center",
  },
  successHeadline: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  successSubline: {
    fontSize: 14,
    color: "#8E95A5",
    textAlign: "center",
  },
  previewMemoryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10141D",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1C2230",
    padding: 16,
    marginVertical: 20,
  },
  cardThumbImage: {
    width: 64,
    height: 64,
    borderRadius: 14,
    resizeMode: "cover",
    marginRight: 14,
  },
  cardThumbBadge: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: "rgba(138, 224, 38, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(138, 224, 38, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  cardContentCol: {
    flex: 1,
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
  },
  cardBottomMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardCategoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(138, 224, 38, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(138, 224, 38, 0.25)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  cardCategoryText: {
    color: "#8AE026",
    fontSize: 11,
    fontWeight: "600",
  },
  cardTimestamp: {
    color: "#6B7280",
    fontSize: 12,
  },
  successActionsCol: {
    gap: 12,
  },
  viewMemoryBtn: {
    height: 56,
    borderRadius: 28,
    backgroundColor: "#8AE026",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#8AE026",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  viewMemoryBtnText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  doneBtn: {
    height: 56,
    borderRadius: 28,
    backgroundColor: "#10141D",
    borderWidth: 1,
    borderColor: "#1C2230",
    justifyContent: "center",
    alignItems: "center",
  },
  doneBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
