import React from "react";
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
} from "react-native";
import { useAuthStore } from "../../store/authStore";
import { Theme } from "../../theme/index";
import { Icon } from "../../components/common/Icon";
import { IOSGlassButton } from "../../components/common/IOSGlassButton";
import { IOSGlassCapsule } from "../../components/common/IOSGlassCapsule";
import { IOSGlassCircle } from "../../components/common/IOSGlassCircle";
import Svg, { Path } from "react-native-svg";

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user, profile } = useAuthStore();
  const displayName = profile?.displayName || user?.name || "Orhan hy!";

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Top Header: Avatar, Welcome text, and iOS Glass Notification Bell ── */}
        <View style={styles.headerRow}>
          <View style={styles.userProfileGroup}>
            <IOSGlassCircle size={48} strokeWidth={1.4} fill="#18191E">
              <Image
                source={require("../../assets/images/user-avatar.png")}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            </IOSGlassCircle>
            <View style={styles.welcomeTextGroup}>
              <Text style={styles.welcomeSubtitle}>Welcome</Text>
              <Text style={styles.welcomeName}>{displayName}</Text>
            </View>
          </View>

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

          {/* Ask AI Button (Left-aligned with circular background for AI icon) */}
          <TouchableOpacity
            style={styles.askAiBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("AIAssistant")}
          >
            <IOSGlassCircle size={38} strokeWidth={1.2} fill="#25272F">
              <Icon name="sparkles" size={16} color="#D4F82C" />
            </IOSGlassCircle>
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
          {/* Item 1: Link Memory */}
          <TouchableOpacity
            style={styles.memoryItem}
            activeOpacity={0.8}
            onPress={() => {}}
          >
            <View style={styles.memoryIconBadgeCol}>
              <IOSGlassCircle size={46} strokeWidth={1.4} fill="rgba(24, 25, 30, 0.9)">
                <Icon name="link" size={19} color="#FFFFFF" strokeWidth={2.2} />
              </IOSGlassCircle>
              <View style={styles.timestampBadge}>
                <Text style={styles.timestampBadgeText} numberOfLines={1}>Today</Text>
              </View>
            </View>

            <View style={styles.memoryTextContent}>
              <Text style={styles.memoryTitle}>AI Video Generator</Text>
              <Text style={styles.memorySubtitle} numberOfLines={1}>
                Check the AI video generator I saw on Instagram
              </Text>
            </View>

            <IOSGlassButton size={26} onPress={() => {}}>
              <Icon name="chevron-right" size={12} color="#8E8E93" strokeWidth={2.4} />
            </IOSGlassButton>
          </TouchableOpacity>

          {/* Item 2: Video/Film Memory */}
          <TouchableOpacity
            style={styles.memoryItem}
            activeOpacity={0.8}
            onPress={() => {}}
          >
            <View style={styles.memoryIconBadgeCol}>
              <IOSGlassCircle size={46} strokeWidth={1.4} fill="rgba(24, 25, 30, 0.9)">
                <Icon name="video" size={18} color="#FFFFFF" />
              </IOSGlassCircle>
              <View style={styles.timestampBadge}>
                <Text style={styles.timestampBadgeText} numberOfLines={1}>2 days ago</Text>
              </View>
            </View>

            <View style={styles.memoryTextContent}>
              <Text style={styles.memoryTitle}>Playing Chess Online</Text>
              <View style={styles.memoryLinkRow}>
                <Text style={styles.memorySubtitle} numberOfLines={1}>
                  https://www.chess.com/play/online
                </Text>
                <Icon name="copy" size={12} color="#6B7280" />
              </View>
            </View>

            <IOSGlassButton size={26} onPress={() => {}}>
              <Icon name="chevron-right" size={12} color="#8E8E93" strokeWidth={2.4} />
            </IOSGlassButton>
          </TouchableOpacity>

          {/* Item 3: Marketing / Idea Memory */}
          <TouchableOpacity
            style={styles.memoryItem}
            activeOpacity={0.8}
            onPress={() => {}}
          >
            <View style={styles.memoryIconBadgeCol}>
              <IOSGlassCircle size={46} strokeWidth={1.4} fill="rgba(24, 25, 30, 0.9)">
                <Icon name="lightbulb" size={19} color="#FFFFFF" strokeWidth={2} />
              </IOSGlassCircle>
              <View style={styles.timestampBadge}>
                <Text style={styles.timestampBadgeText} numberOfLines={1}>2 days ago</Text>
              </View>
            </View>

            <View style={styles.memoryTextContent}>
              <Text style={styles.memoryTitle}>Marketing Strategy</Text>
              <Text style={styles.memorySubtitle} numberOfLines={1}>
                How to Use SEO for App Marketing
              </Text>
            </View>

            <IOSGlassButton size={26} onPress={() => {}}>
              <Icon name="chevron-right" size={12} color="#8E8E93" strokeWidth={2.4} />
            </IOSGlassButton>
          </TouchableOpacity>
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
        </ScrollView>

        {/* ── AI Insight Section with circular particle background and Ask AI button ── */}
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

              {/* Ask AI Pill Button as in the design */}
              <TouchableOpacity
                style={styles.insightAskAiBtn}
                activeOpacity={0.85}
                onPress={() => navigation.navigate("AIAssistant")}
              >
                <Text style={styles.insightAskAiText}>Ask AI</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        {/* Bottom spacer for floating navigation bar */}
        <View style={styles.bottomSpacer} />
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
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
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
    marginBottom: 16,
    minHeight: 165,
    overflow: "visible",
  },
  heroTextCol: {
    flex: 1,
    paddingRight: 6,
    zIndex: 2,
  },
  heroSub: {
    fontSize: 23,
    color: "#D1D5DB",
    fontWeight: "400",
    lineHeight: 28,
  },
  heroMain: {
    fontSize: 29,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 2,
    letterSpacing: -0.5,
  },
  heroGraphicCol: {
    width: 175,
    height: 165,
    justifyContent: "center",
    alignItems: "center",
    marginRight: -6,
  },
  brainImage: {
    width: 175,
    height: 165,
  },
  searchBarWrapper: {
    marginBottom: 20,
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
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
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
    paddingVertical: 12,
  },
  memoryIconBadgeCol: {
    width: 58,
    height: 56,
    alignItems: "center",
    marginRight: 14,
    position: "relative",
  },
  timestampBadge: {
    position: "absolute",
    bottom: -4,
    backgroundColor: "#111317",
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 44,
  },
  timestampBadgeText: {
    fontSize: 7.5,
    color: "#9CA3AF",
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: -0.2,
  },
  memoryTextContent: {
    flex: 1,
  },
  memoryTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 3,
  },
  memorySubtitle: {
    fontSize: 12,
    color: "#8E8E93",
  },
  memoryLinkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
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
  categoryGraphImage: {
    width: 76,
    height: 32,
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
    marginBottom: 20,
    borderRadius: 24,
    overflow: "hidden",
  },
  insightCard: {
    width: "100%",
    minHeight: 138,
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
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
    marginBottom: 10,
  },
  insightAskAiBtn: {
    backgroundColor: "#D4F82C",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 8,
    alignSelf: "flex-start",
  },
  insightAskAiText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0A0D02",
  },
  bottomSpacer: {
    height: 110,
  },
});


