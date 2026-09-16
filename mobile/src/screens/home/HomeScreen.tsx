import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  ImageBackground,
  ActionSheetIOS,
  Alert,
  Platform,
  Share,
} from "react-native";
import { useAuthStore } from "../../store/authStore";
import { Theme } from "../../theme/index";
import { Icon, IconName } from "../../components/common/Icon";
import { IOSGlassButton } from "../../components/common/IOSGlassButton";
import { IOSGlassCapsule } from "../../components/common/IOSGlassCapsule";
import { IOSGlassCircle } from "../../components/common/IOSGlassCircle";
import Svg, { Path, Defs, LinearGradient, Stop, Rect } from "react-native-svg";

const DEMO_AVATAR = require("../../assets/avatar_demo.jpg");

interface MemoryItem {
  id: string;
  title: string;
  subtitle: string;
  icon: IconName;
  timestamp: string;
  url?: string;
}

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user, profile } = useAuthStore();
  const displayName = profile?.displayName || user?.name || "Orhan hy!";
  const avatarSource = profile?.avatarUrl ? { uri: profile.avatarUrl } : DEMO_AVATAR;

  const [memories, setMemories] = useState<MemoryItem[]>([
    {
      id: "1",
      title: "AI Video Generator",
      subtitle: "Check the AI video generator I saw on Instagram",
      icon: "link",
      timestamp: "Today",
      url: "https://instagram.com",
    },
    {
      id: "2",
      title: "Playing Chess Online",
      subtitle: "https://www.chess.com/play/online",
      icon: "video",
      timestamp: "2 days ago",
      url: "https://www.chess.com/play/online",
    },
    {
      id: "3",
      title: "Marketing Strategy",
      subtitle: "How to Use SEO for App Marketing",
      icon: "lightbulb",
      timestamp: "2 days ago",
    },
  ]);

  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [askAiWidth, setAskAiWidth] = useState<number>(0);

  const togglePin = (id: string) => {
    setPinnedIds((prev) => {
      const isPinned = prev.includes(id);
      const next = isPinned ? prev.filter((p) => p !== id) : [...prev, id];
      Alert.alert(
        isPinned ? "Memory Unpinned" : "Memory Pinned",
        isPinned ? "Removed from pinned items." : "Pinned to top."
      );
      return next;
    });
  };

  const handleShare = async (memory: MemoryItem) => {
    try {
      await Share.share({
        title: memory.title,
        message: memory.url
          ? `${memory.title} - ${memory.url}`
          : `${memory.title}: ${memory.subtitle}`,
      });
    } catch (err) {
      console.error("Share error:", err);
    }
  };

  const handleEdit = (memory: MemoryItem) => {
    Alert.alert("Edit Memory", `Edit details for "${memory.title}"`);
  };

  const confirmDelete = (id: string) => {
    Alert.alert(
      "Delete Memory",
      "Are you sure you want to delete this memory?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setMemories((prev) => prev.filter((m) => m.id !== id));
          },
        },
      ]
    );
  };

  const handleMemoryMenu = (memory: MemoryItem) => {
    const isPinned = pinnedIds.includes(memory.id);
    const pinLabel = isPinned ? "Unpin Memory" : "Pin Memory";
    const shareLabel = memory.url ? "Share / Copy Link" : "Share Memory";

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: memory.title,
          message: memory.subtitle,
          options: ["Cancel", pinLabel, shareLabel, "Edit Memory", "Delete Memory"],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 4,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            togglePin(memory.id);
          } else if (buttonIndex === 2) {
            handleShare(memory);
          } else if (buttonIndex === 3) {
            handleEdit(memory);
          } else if (buttonIndex === 4) {
            confirmDelete(memory.id);
          }
        }
      );
    } else {
      Alert.alert(
        memory.title,
        memory.subtitle,
        [
          { text: "Cancel", style: "cancel" },
          { text: pinLabel, onPress: () => togglePin(memory.id) },
          { text: shareLabel, onPress: () => handleShare(memory) },
          { text: "Edit Memory", onPress: () => handleEdit(memory) },
          { text: "Delete", style: "destructive", onPress: () => confirmDelete(memory.id) },
        ],
        { cancelable: true }
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Top Header: Avatar, Welcome text, and iOS Glass Notification Bell ── */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.userProfileGroup}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("Profile")}
          >
            <IOSGlassCircle size={48} strokeWidth={1.4} fill="#18191E">
              <Image
                source={avatarSource}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            </IOSGlassCircle>
            <View style={styles.welcomeTextGroup}>
              <Text style={styles.welcomeSubtitle}>Welcome</Text>
              <Text style={styles.welcomeName}>{displayName}</Text>
            </View>
          </TouchableOpacity>

          {/* iOS Circular Glass Button with Specular Gradient Stroke */}
          <IOSGlassButton
            size={44}
            onPress={() => {}}
            style={styles.notificationBtn}
          >
            <Icon name="bell-fill" size={19} color="#FFFFFF" />
          </IOSGlassButton>
        </View>

        {/* ── Hero Section: "What do you want to Remember?" + Larger Glowing Brain ── */}
        <View style={styles.heroRow}>
          <View style={styles.heroTextCol}>
            <Text style={styles.heroSub}>What do you want</Text>
            <Text style={styles.heroMain}>to Remember?</Text>
          </View>
          <View style={styles.heroGraphicCol}>
            <Image
              source={require("../../assets/images/header-brain.jpg")}
              style={styles.brainImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* ── Search Bar with iOS Specular Gradient Stroke & Glass Voice Button ── */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate("Search")}
          style={styles.searchBarWrapper}
        >
          <IOSGlassCapsule
            height={52}
            borderRadius={26}
            strokeWidth={1.4}
            fill="#141519"
            contentStyle={styles.searchBarContent}
          >
            <Icon name="search" size={18} color="#8E8E93" />
            <Text style={styles.searchPlaceholder}>Search your memories....</Text>
            <IOSGlassButton
              size={34}
              onPress={() => navigation.navigate("Search")}
            >
              <Icon name="sparkles" size={15} color="#D1D5DB" />
            </IOSGlassButton>
          </IOSGlassCapsule>
        </TouchableOpacity>

        {/* ── Dual Action Buttons: Add Memory & Ask AI (both left-aligned with circular badge) ── */}
        <View style={styles.ctaRow}>
          {/* Add Memory Button (Neon Chartreuse) */}
          <TouchableOpacity
            style={styles.addMemoryBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("AddMemoryModal")}
          >
            <View style={styles.addMemoryDarkCircle}>
              <Icon name="plus" size={16} color="#D4F82C" strokeWidth={2.8} />
            </View>
            <Text style={styles.addMemoryText}>Add Memory</Text>
          </TouchableOpacity>

          {/* Ask AI Button with Specular Gradient Stroke */}
          <TouchableOpacity
            style={styles.askAiBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("AIAssistant")}
            onLayout={(e) => setAskAiWidth(e.nativeEvent.layout.width)}
          >
            {askAiWidth > 0 && (
              <Svg
                width={askAiWidth}
                height={54}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
              >
                <Defs>
                  <LinearGradient id="askAiStroke" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
                    <Stop offset="30%" stopColor="#FFFFFF" stopOpacity="0.25" />
                    <Stop offset="75%" stopColor="#FFFFFF" stopOpacity="0.08" />
                    <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.02" />
                  </LinearGradient>
                </Defs>
                <Rect
                  x={0.7}
                  y={0.7}
                  width={askAiWidth - 1.6}
                  height={54 - 1.4}
                  rx={26.3}
                  ry={26.3}
                  fill="#181A20"
                  stroke="url(#askAiStroke)"
                  strokeWidth={1.4}
                />
              </Svg>
            )}
            <View style={styles.askAiDarkCircle}>
              <Icon name="sparkles" size={16} color="#D4F82C" />
            </View>
            <Text style={styles.askAiText}>Ask AI</Text>
          </TouchableOpacity>
        </View>

        {/* ── Recent Memories Section ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Memories</Text>
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={() => navigation.navigate("Search")}
          >
            <Text style={styles.seeAllText}>See all →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.memoriesList}>
          {memories.map((item) => {
            const isPinned = pinnedIds.includes(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.memoryItem}
                activeOpacity={0.8}
                onPress={() => handleMemoryMenu(item)}
              >
                {/* Larger 60px Circular Icon with Specular Glass Rim & Pill Badge */}
                <View style={styles.memoryIconBadgeCol}>
                  <IOSGlassCircle size={60} strokeWidth={1.4} fill="rgba(26, 28, 33, 0.95)">
                    <Icon
                      name={item.icon}
                      size={24}
                      color="#FFFFFF"
                      strokeWidth={item.icon === "link" ? 2.4 : 2}
                    />
                  </IOSGlassCircle>
                  <View style={styles.timestampBadge}>
                    <Text style={styles.timestampBadgeText} numberOfLines={1}>
                      {item.timestamp}
                    </Text>
                  </View>
                </View>

                {/* Text Content - strictly bounded so it never overlaps or wraps under the icon */}
                <View style={styles.memoryTextContent}>
                  <View style={styles.memoryTitleRow}>
                    <Text
                      style={styles.memoryTitle}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.title}
                    </Text>
                    {isPinned && (
                      <View style={styles.pinnedBadge}>
                        <Icon name="pin" size={10} color="#D4F82C" />
                      </View>
                    )}
                  </View>
                  {item.url ? (
                    <View style={styles.memoryLinkRow}>
                      <Text
                        style={styles.memorySubtitle}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {item.subtitle}
                      </Text>
                      <Icon name="copy" size={12} color="#6B7280" />
                    </View>
                  ) : (
                    <Text
                      style={styles.memorySubtitle}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.subtitle}
                    </Text>
                  )}
                </View>

                {/* 3-Dot Vertical White Menu Icon without background */}
                <TouchableOpacity
                  style={styles.moreMenuBtn}
                  activeOpacity={0.6}
                  hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
                  onPress={() => handleMemoryMenu(item)}
                >
                  <Icon name="more-vertical" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Your Categories Section with exact Folder Background ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Categories</Text>
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={() => navigation.navigate("Search")}
          >
            <Text style={styles.seeAllText}>See all →</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScrollRow}
        >
          {/* Category Card 1: Entertainment */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => navigation.navigate("Search")}
            style={styles.categoryCardWrapper}
          >
            <ImageBackground
              source={require("../../assets/images/category-folder-bg.png")}
              style={styles.categoryFolderCard}
              imageStyle={styles.categoryFolderImage}
            >
              {/* Top area inside the tab: Icon on left, Wave Graph on right */}
              <View style={styles.categoryCardTop}>
                <View style={styles.categoryIconContainer}>
                  <Icon name="tv" size={30} color="#D4F82C" strokeWidth={2.2} />
                  {/* Small blue circular play badge */}
                  <View style={styles.bluePlayBadge}>
                    <Svg width={7} height={7} viewBox="0 0 8 8">
                      <Path d="M2 1.5l5 2.5-5 2.5z" fill="#FFFFFF" />
                    </Svg>
                  </View>
                </View>

                <Image
                  source={require("../../assets/images/category-graph.png")}
                  style={styles.categoryGraphImage}
                  resizeMode="contain"
                />
              </View>

              {/* Bottom area: Overlapping thumbnail bubbles & Count badge & Title */}
              <View style={styles.categoryCardBottom}>
                <View style={styles.mediaCountRow}>
                  <View style={styles.mediaClusterStack}>
                    <View style={[styles.clusterCircle, { zIndex: 3 }]}>
                      <Icon name="video" size={11} color="#FFFFFF" />
                    </View>
                    <View style={[styles.clusterCircle, { marginLeft: -7, zIndex: 2 }]}>
                      <Icon name="camera" size={10} color="#FFFFFF" />
                    </View>
                    <View style={[styles.clusterCircle, { marginLeft: -7, zIndex: 1 }]}>
                      <Icon name="link" size={10} color="#FFFFFF" />
                    </View>
                  </View>
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>8</Text>
                  </View>
                </View>
                <Text style={styles.categoryCardTitle}>Entertainment</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>

          {/* Category Card 2: Ideas */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => navigation.navigate("Search")}
            style={styles.categoryCardWrapper}
          >
            <ImageBackground
              source={require("../../assets/images/category-folder-bg.png")}
              style={styles.categoryFolderCard}
              imageStyle={styles.categoryFolderImage}
            >
              {/* Top area inside the tab */}
              <View style={styles.categoryCardTop}>
                <View style={styles.categoryIconContainer}>
                  <Icon name="lightbulb" size={30} color="#D4F82C" strokeWidth={2.2} />
                  {/* Blue diamond badge */}
                  <View style={styles.blueDiamondBadge}>
                    <Icon name="diamond" size={15} color="#60A5FA" />
                  </View>
                </View>

                <Image
                  source={require("../../assets/images/category-graph.png")}
                  style={styles.categoryGraphImage}
                  resizeMode="contain"
                />
              </View>

              {/* Bottom area */}
              <View style={styles.categoryCardBottom}>
                <View style={styles.mediaCountRow}>
                  <View style={styles.mediaClusterStack}>
                    <View style={[styles.clusterCircle, { zIndex: 3 }]}>
                      <Icon name="lightbulb" size={11} color="#FFFFFF" />
                    </View>
                    <View style={[styles.clusterCircle, { marginLeft: -7, zIndex: 2 }]}>
                      <Icon name="diamond" size={10} color="#FFFFFF" />
                    </View>
                    <View style={[styles.clusterCircle, { marginLeft: -7, zIndex: 1 }]}>
                      <Icon name="sparkles" size={10} color="#FFFFFF" />
                    </View>
                  </View>
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>3</Text>
                  </View>
                </View>
                <Text style={styles.categoryCardTitle}>Ideas</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
          {/* Category Card 3: Research */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => navigation.navigate("Search")}
            style={styles.categoryCardWrapper}
          >
            <ImageBackground
              source={require("../../assets/images/category-folder-bg.png")}
              style={styles.categoryFolderCard}
              imageStyle={styles.categoryFolderImage}
            >
              {/* Top area inside the tab */}
              <View style={styles.categoryCardTop}>
                <View style={styles.categoryIconContainer}>
                  <Icon name="book" size={30} color="#D4F82C" strokeWidth={2.2} />
                  {/* Cyan sparkle badge */}
                  <View style={styles.cyanSparkleBadge}>
                    <Icon name="sparkles" size={10} color="#FFFFFF" />
                  </View>
                </View>

                <Image
                  source={require("../../assets/images/category-graph.png")}
                  style={styles.categoryGraphImage}
                  resizeMode="contain"
                />
              </View>

              {/* Bottom area */}
              <View style={styles.categoryCardBottom}>
                <View style={styles.mediaCountRow}>
                  <View style={styles.mediaClusterStack}>
                    <View style={[styles.clusterCircle, { zIndex: 3 }]}>
                      <Icon name="book" size={11} color="#FFFFFF" />
                    </View>
                    <View style={[styles.clusterCircle, { marginLeft: -7, zIndex: 2 }]}>
                      <Icon name="link" size={10} color="#FFFFFF" />
                    </View>
                    <View style={[styles.clusterCircle, { marginLeft: -7, zIndex: 1 }]}>
                      <Icon name="sparkles" size={10} color="#FFFFFF" />
                    </View>
                  </View>
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>7</Text>
                  </View>
                </View>
                <Text style={styles.categoryCardTitle}>Research</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>

          {/* Category Card 4: Technology */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => navigation.navigate("Search")}
            style={styles.categoryCardWrapper}
          >
            <ImageBackground
              source={require("../../assets/images/category-folder-bg.png")}
              style={styles.categoryFolderCard}
              imageStyle={styles.categoryFolderImage}
            >
              {/* Top area inside the tab */}
              <View style={styles.categoryCardTop}>
                <View style={styles.categoryIconContainer}>
                  <Icon name="tech" size={30} color="#D4F82C" strokeWidth={2.2} />
                  {/* Purple diamond badge */}
                  <View style={styles.purpleStarBadge}>
                    <Icon name="diamond" size={10} color="#FFFFFF" />
                  </View>
                </View>

                <Image
                  source={require("../../assets/images/category-graph.png")}
                  style={styles.categoryGraphImage}
                  resizeMode="contain"
                />
              </View>

              {/* Bottom area */}
              <View style={styles.categoryCardBottom}>
                <View style={styles.mediaCountRow}>
                  <View style={styles.mediaClusterStack}>
                    <View style={[styles.clusterCircle, { zIndex: 3 }]}>
                      <Icon name="tech" size={11} color="#FFFFFF" />
                    </View>
                    <View style={[styles.clusterCircle, { marginLeft: -7, zIndex: 2 }]}>
                      <Icon name="video" size={10} color="#FFFFFF" />
                    </View>
                    <View style={[styles.clusterCircle, { marginLeft: -7, zIndex: 1 }]}>
                      <Icon name="link" size={10} color="#FFFFFF" />
                    </View>
                  </View>
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>12</Text>
                  </View>
                </View>
                <Text style={styles.categoryCardTitle}>Technology</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>

          {/* Category Card 5: Audio & Music */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => navigation.navigate("Search")}
            style={styles.categoryCardWrapper}
          >
            <ImageBackground
              source={require("../../assets/images/category-folder-bg.png")}
              style={styles.categoryFolderCard}
              imageStyle={styles.categoryFolderImage}
            >
              {/* Top area inside the tab */}
              <View style={styles.categoryCardTop}>
                <View style={styles.categoryIconContainer}>
                  <Icon name="music" size={30} color="#D4F82C" strokeWidth={2.2} />
                  {/* Orange play badge */}
                  <View style={styles.orangePlayBadge}>
                    <Svg width={7} height={7} viewBox="0 0 8 8">
                      <Path d="M2 1.5l5 2.5-5 2.5z" fill="#FFFFFF" />
                    </Svg>
                  </View>
                </View>

                <Image
                  source={require("../../assets/images/category-graph.png")}
                  style={styles.categoryGraphImage}
                  resizeMode="contain"
                />
              </View>

              {/* Bottom area */}
              <View style={styles.categoryCardBottom}>
                <View style={styles.mediaCountRow}>
                  <View style={styles.mediaClusterStack}>
                    <View style={[styles.clusterCircle, { zIndex: 3 }]}>
                      <Icon name="music" size={11} color="#FFFFFF" />
                    </View>
                    <View style={[styles.clusterCircle, { marginLeft: -7, zIndex: 2 }]}>
                      <Icon name="video" size={10} color="#FFFFFF" />
                    </View>
                    <View style={[styles.clusterCircle, { marginLeft: -7, zIndex: 1 }]}>
                      <Icon name="link" size={10} color="#FFFFFF" />
                    </View>
                  </View>
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>5</Text>
                  </View>
                </View>
                <Text style={styles.categoryCardTitle}>Music & Audio</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        </ScrollView>

        {/* ── AI Insight Section with circular particle background ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>AI Insight</Text>
        </View>

        <TouchableOpacity
          style={styles.insightCardWrapper}
          activeOpacity={0.88}
          onPress={() => navigation.navigate("AIAssistant")}
        >
          <ImageBackground
            source={require("../../assets/images/ai-insight-bg.png")}
            style={styles.insightCard}
            imageStyle={styles.insightCardImage}
          >
            <View style={styles.insightTextCol}>
              <Text style={styles.insightTitle}>Smart Suggestion</Text>
              <Text style={styles.insightDesc}>
                You have 5 ideas on marketing saved. Want a summary?
              </Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 28,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  userProfileGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  welcomeTextGroup: {
    marginLeft: 12,
  },
  welcomeSubtitle: {
    fontSize: 12,
    color: "#8E8E93",
    fontWeight: "400",
    marginBottom: 2,
  },
  welcomeName: {
    fontSize: 19,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  notificationBtn: {},
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    minHeight: 110,
    overflow: "visible",
  },
  heroTextCol: {
    flex: 1,
    paddingRight: 6,
    zIndex: 2,
  },
  heroSub: {
    fontSize: 21,
    color: "#D1D5DB",
    fontWeight: "400",
    lineHeight: 25,
  },
  heroMain: {
    fontSize: 27,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 2,
    letterSpacing: -0.5,
  },
  heroGraphicCol: {
    width: 130,
    height: 110,
    justifyContent: "center",
    alignItems: "center",
    marginRight: -4,
  },
  brainImage: {
    width: 130,
    height: 110,
  },
  searchBarWrapper: {
    marginBottom: 18,
  },
  searchBarContent: {
    paddingLeft: 16,
    paddingRight: 8,
    justifyContent: "space-between",
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: "#8E8E93",
    marginLeft: 10,
  },
  ctaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
    gap: 12,
  },
  addMemoryBtn: {
    flex: 1,
    height: 54,
    backgroundColor: "#D4F82C",
    borderRadius: 27,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingLeft: 8,
    paddingRight: 16,
    shadowColor: "#D4F82C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  addMemoryDarkCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#0A0D02",
    justifyContent: "center",
    alignItems: "center",
  },
  askAiDarkCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#282828",
    justifyContent: "center",
    alignItems: "center",
  },
  addMemoryText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0A0D02",
    marginLeft: 10,
  },
  askAiBtn: {
    flex: 1,
    height: 54,
    backgroundColor: "#181A20",
    borderRadius: 27,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingLeft: 8,
    paddingRight: 16,
    position: "relative",
    overflow: "hidden",
  },
  askAiText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  seeAllButton: {
    paddingVertical: 4,
  },
  seeAllText: {
    fontSize: 13,
    color: "#8E8E93",
    fontWeight: "500",
  },
  memoriesList: {
    marginBottom: 26,
  },
  memoryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  memoryIconBadgeCol: {
    width: 66,
    height: 68,
    alignItems: "center",
    marginRight: 14,
    position: "relative",
  },
  timestampBadge: {
    position: "absolute",
    bottom: -2,
    backgroundColor: "#111317",
    paddingHorizontal: 10,
    paddingVertical: 2.5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.16)",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 46,
  },
  timestampBadgeText: {
    fontSize: 8.5,
    color: "#9CA3AF",
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: -0.2,
  },
  memoryTextContent: {
    flex: 1,
    marginRight: 14,
    justifyContent: "center",
  },
  memoryTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  pinnedBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1.5,
    borderRadius: 4,
    backgroundColor: "rgba(212, 248, 44, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  memoryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  memorySubtitle: {
    fontSize: 13,
    color: "#8E8E93",
    lineHeight: 18,
  },
  memoryLinkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  moreMenuBtn: {
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  categoriesScrollRow: {
    paddingRight: 20,
    marginBottom: 28,
  },
  categoryCardWrapper: {
    marginRight: 14,
  },
  categoryFolderCard: {
    width: 174,
    height: 166,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 14,
    justifyContent: "space-between",
  },
  categoryFolderImage: {
    resizeMode: "stretch",
  },
  categoryCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryIconContainer: {
    position: "relative",
  },
  bluePlayBadge: {
    position: "absolute",
    bottom: -3,
    right: -5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },
  blueDiamondBadge: {
    position: "absolute",
    bottom: -6,
    right: -8,
  },
  cyanSparkleBadge: {
    position: "absolute",
    bottom: -4,
    right: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#06B6D4",
    justifyContent: "center",
    alignItems: "center",
  },
  purpleStarBadge: {
    position: "absolute",
    bottom: -4,
    right: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#8B5CF6",
    justifyContent: "center",
    alignItems: "center",
  },
  orangePlayBadge: {
    position: "absolute",
    bottom: -3,
    right: -5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#F97316",
    justifyContent: "center",
    alignItems: "center",
  },
  categoryGraphImage: {
    width: 76,
    height: 32,
    marginTop: 10,
  },
  categoryCardBottom: {
    marginTop: "auto",
  },
  mediaCountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  mediaClusterStack: {
    flexDirection: "row",
    alignItems: "center",
  },
  clusterCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#22252B",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  countBadge: {
    backgroundColor: "#2A2D35",
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 10,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  categoryCardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 8,
  },
  insightCardWrapper: {
    width: "100%",
    alignSelf: "stretch",
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 0,
  },
  insightCard: {
    width: "100%",
    minHeight: 138,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  insightCardImage: {
    borderRadius: 24,
    resizeMode: "cover",
  },
  insightTextCol: {
    width: "66%",
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 5,
  },
  insightDesc: {
    fontSize: 13,
    color: "#9CA3AF",
    lineHeight: 18,
    fontWeight: "400",
    marginBottom: 0,
  },
});


