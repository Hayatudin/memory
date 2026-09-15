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
} from "react-native";
import { useAuthStore } from "../../store/authStore";
import { Theme } from "../../theme/index";
import { Icon } from "../../components/common/Icon";
import { BrainGraphic } from "../../components/common/BrainGraphic";
import Svg, { Path, Circle, Defs, RadialGradient, Stop } from "react-native-svg";

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user, profile } = useAuthStore();
  const displayName = profile?.displayName || user?.name || "Orhan hy!";

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.background} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header: Avatar, Welcome text, and Notification Bell */}
        <View style={styles.headerRow}>
          <View style={styles.userProfileGroup}>
            <View style={styles.avatarGlowingRing}>
              {profile?.avatarUrl ? (
                <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>
                    {displayName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.welcomeTextGroup}>
              <Text style={styles.welcomeSubtitle}>Welcome</Text>
              <Text style={styles.welcomeName}>{displayName}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.bellButton}
            activeOpacity={0.8}
            onPress={() => {}}
          >
            <Icon name="bell" size={20} color={Theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Hero Section: What do you want to Remember? + Brain Graphic */}
        <View style={styles.heroRow}>
          <View style={styles.heroTextCol}>
            <Text style={styles.heroSub}>What do you want</Text>
            <Text style={styles.heroMain}>to Remember?</Text>
          </View>
          <View style={styles.heroGraphicCol}>
            <BrainGraphic size={110} />
          </View>
        </View>

        {/* Search Pill */}
        <TouchableOpacity
          style={styles.searchBar}
          activeOpacity={0.9}
          onPress={() => navigation.navigate("Search")}
        >
          <Icon name="search" size={18} color={Theme.colors.textMuted} />
          <Text style={styles.searchPlaceholder}>Search your memories...</Text>
          <Icon name="sparkles" size={16} color={Theme.colors.textMuted} />
        </TouchableOpacity>

        {/* Dual Primary Action Buttons */}
        <View style={styles.ctaRow}>
          {/* Add Memory Button */}
          <TouchableOpacity
            style={styles.addMemoryBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("AddMemoryModal")}
          >
            <View style={styles.addMemoryDarkCircle}>
              <Icon name="plus" size={14} color={Theme.colors.primary} strokeWidth={2.5} />
            </View>
            <Text style={styles.addMemoryText}>Add Memory</Text>
          </TouchableOpacity>

          {/* Ask AI Button */}
          <TouchableOpacity
            style={styles.askAiBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("AIAssistant")}
          >
            <Icon name="sparkles" size={18} color={Theme.colors.primary} />
            <Text style={styles.askAiText}>Ask AI</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Memories Section */}
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
              <View style={styles.memoryIconCircle}>
                <Icon name="link" size={18} color={Theme.colors.textPrimary} />
              </View>
              <View style={styles.timestampBadge}>
                <Text style={styles.timestampBadgeText}>Today</Text>
              </View>
            </View>

            <View style={styles.memoryTextContent}>
              <Text style={styles.memoryTitle}>AI Video Generator</Text>
              <Text style={styles.memorySubtitle} numberOfLines={1}>
                Check the AI video generator I saw on Instagram
              </Text>
            </View>

            <View style={styles.memoryRightIndicator} />
          </TouchableOpacity>

          {/* Item 2: Video/Clapper Memory */}
          <TouchableOpacity
            style={styles.memoryItem}
            activeOpacity={0.8}
            onPress={() => {}}
          >
            <View style={styles.memoryIconBadgeCol}>
              <View style={styles.memoryIconCircle}>
                <Icon name="video" size={18} color={Theme.colors.textPrimary} />
              </View>
              <View style={styles.timestampBadge}>
                <Text style={styles.timestampBadgeText}>2 days ago</Text>
              </View>
            </View>

            <View style={styles.memoryTextContent}>
              <Text style={styles.memoryTitle}>Playing Chess Online</Text>
              <View style={styles.memoryLinkRow}>
                <Text style={styles.memorySubtitle} numberOfLines={1}>
                  https://www.chess.com/play/online
                </Text>
                <Icon name="copy" size={12} color={Theme.colors.textMuted} />
              </View>
            </View>

            <View style={styles.memoryRightIndicator} />
          </TouchableOpacity>

          {/* Item 3: Idea / Marketing Memory */}
          <TouchableOpacity
            style={styles.memoryItem}
            activeOpacity={0.8}
            onPress={() => {}}
          >
            <View style={styles.memoryIconBadgeCol}>
              <View style={styles.memoryIconCircle}>
                <Icon name="lightbulb" size={18} color={Theme.colors.textPrimary} />
              </View>
              <View style={styles.timestampBadge}>
                <Text style={styles.timestampBadgeText}>3 days ago</Text>
              </View>
            </View>

            <View style={styles.memoryTextContent}>
              <Text style={styles.memoryTitle}>Marketing Strategy</Text>
              <Text style={styles.memorySubtitle} numberOfLines={1}>
                How to Use SEO for App Marketing
              </Text>
            </View>

            <View style={styles.memoryRightIndicator} />
          </TouchableOpacity>
        </View>

        {/* Your Categories Section */}
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
            style={styles.categoryCard}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("Search")}
          >
            <View style={styles.categoryCardTop}>
              <Icon name="tv" size={30} color={Theme.colors.primary} strokeWidth={2.2} />
              {/* Neon Wave illustration */}
              <Svg width={70} height={24} viewBox="0 0 70 24" fill="none">
                <Path
                  d="M2 14 C10 8, 16 20, 24 10 C32 2, 40 18, 48 8 C56 0, 62 16, 68 12"
                  stroke={Theme.colors.primary}
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity={0.7}
                />
              </Svg>
            </View>

            <View style={styles.categoryCardBottom}>
              <View style={styles.categoryMediaStack}>
                <View style={[styles.miniMediaIcon, { zIndex: 3 }]}>
                  <Icon name="video" size={10} color={Theme.colors.textPrimary} />
                </View>
                <View style={[styles.miniMediaIcon, { marginLeft: -6, zIndex: 2 }]}>
                  <Icon name="link" size={10} color={Theme.colors.textPrimary} />
                </View>
                <View style={[styles.miniMediaIcon, { marginLeft: -6, zIndex: 1 }]}>
                  <Icon name="lightbulb" size={10} color={Theme.colors.textPrimary} />
                </View>
              </View>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>8</Text>
              </View>
            </View>
            <Text style={styles.categoryCardTitle}>Entertainment</Text>
          </TouchableOpacity>

          {/* Category Card 2: Ideas */}
          <TouchableOpacity
            style={styles.categoryCard}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("Search")}
          >
            <View style={styles.categoryCardTop}>
              <View style={styles.dualCategoryIcons}>
                <Icon name="lightbulb" size={28} color={Theme.colors.primary} strokeWidth={2.2} />
                <View style={styles.diamondOffset}>
                  <Icon name="diamond" size={16} color={Theme.colors.cyan} />
                </View>
              </View>
              {/* Neon Wave */}
              <Svg width={70} height={24} viewBox="0 0 70 24" fill="none">
                <Path
                  d="M2 12 C10 18, 18 6, 26 16 C34 22, 42 4, 50 14 C58 20, 64 6, 68 10"
                  stroke={Theme.colors.primary}
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity={0.7}
                />
              </Svg>
            </View>

            <View style={styles.categoryCardBottom}>
              <View style={styles.categoryMediaStack}>
                <View style={[styles.miniMediaIcon, { zIndex: 2 }]}>
                  <Icon name="lightbulb" size={10} color={Theme.colors.textPrimary} />
                </View>
                <View style={[styles.miniMediaIcon, { marginLeft: -6, zIndex: 1 }]}>
                  <Icon name="diamond" size={10} color={Theme.colors.textPrimary} />
                </View>
              </View>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>3</Text>
              </View>
            </View>
            <Text style={styles.categoryCardTitle}>Ideas</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* AI Insight Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>AI Insight</Text>
        </View>

        <TouchableOpacity
          style={styles.insightCard}
          activeOpacity={0.9}
          onPress={() => navigation.navigate("AIAssistant")}
        >
          <View style={styles.insightTextCol}>
            <Text style={styles.insightTitle}>Smart Suggestion</Text>
            <Text style={styles.insightDesc}>
              You have 5 ideas on marketing saved. Want a summary?
            </Text>
          </View>

          {/* 3D Glass Glowing Orb */}
          <View style={styles.insightOrbCol}>
            <Svg width={64} height={64} viewBox="0 0 64 64">
              <Defs>
                <RadialGradient id="orbGrad" cx="35%" cy="30%" r="70%">
                  <Stop offset="0%" stopColor="#4A4F59" stopOpacity="0.9" />
                  <Stop offset="45%" stopColor="#25282F" stopOpacity="0.8" />
                  <Stop offset="100%" stopColor="#141518" stopOpacity="1" />
                </RadialGradient>
                <RadialGradient id="orbGlow" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor={Theme.colors.primary} stopOpacity="0.25" />
                  <Stop offset="100%" stopColor={Theme.colors.primary} stopOpacity="0" />
                </RadialGradient>
              </Defs>
              <Circle cx="32" cy="32" r="30" fill="url(#orbGlow)" />
              <Circle cx="32" cy="32" r="26" fill="url(#orbGrad)" stroke="#3A3F4A" strokeWidth="1" />
              {/* Specular highlight */}
              <Circle cx="24" cy="22" r="5" fill="#FFFFFF" opacity={0.3} />
            </Svg>
          </View>
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
    backgroundColor: Theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  userProfileGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarGlowingRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Theme.colors.primary,
    padding: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.surfaceHighlight,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    color: Theme.colors.primary,
    fontSize: 18,
    fontWeight: "700",
  },
  welcomeTextGroup: {
    marginLeft: 12,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    fontWeight: "400",
  },
  welcomeName: {
    fontSize: 18,
    fontWeight: "700",
    color: Theme.colors.textPrimary,
  },
  bellButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Theme.colors.surfacePill,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  heroTextCol: {
    flex: 1,
  },
  heroSub: {
    fontSize: 22,
    color: "#D1D5DB",
    fontWeight: "400",
  },
  heroMain: {
    fontSize: 28,
    fontWeight: "800",
    color: Theme.colors.textPrimary,
    marginTop: 2,
    letterSpacing: -0.5,
  },
  heroGraphicCol: {
    width: 110,
    height: 110,
    justifyContent: "center",
    alignItems: "center",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.surface,
    height: 48,
    borderRadius: Theme.borderRadius.full,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: 16,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: Theme.colors.textMuted,
    marginLeft: 10,
  },
  ctaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  addMemoryBtn: {
    flex: 1.1,
    height: 52,
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.full,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginRight: 10,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  addMemoryDarkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#0B0E02",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  addMemoryText: {
    fontSize: 15,
    fontWeight: "700",
    color: Theme.colors.textOnPrimary,
  },
  askAiBtn: {
    flex: 1,
    height: 52,
    backgroundColor: Theme.colors.surfacePill,
    borderRadius: Theme.borderRadius.full,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  askAiText: {
    fontSize: 15,
    fontWeight: "600",
    color: Theme.colors.textPrimary,
    marginLeft: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Theme.colors.textPrimary,
  },
  seeAllButton: {
    paddingVertical: 4,
  },
  seeAllText: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    fontWeight: "500",
  },
  memoriesList: {
    marginBottom: 24,
  },
  memoryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  memoryIconBadgeCol: {
    alignItems: "center",
    marginRight: 14,
  },
  memoryIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Theme.colors.surfacePill,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  timestampBadge: {
    marginTop: 4,
    backgroundColor: "#191B1F",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  timestampBadgeText: {
    fontSize: 9,
    color: Theme.colors.textMuted,
    fontWeight: "600",
  },
  memoryTextContent: {
    flex: 1,
  },
  memoryTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Theme.colors.textPrimary,
    marginBottom: 2,
  },
  memorySubtitle: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
  },
  memoryLinkRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  memoryRightIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#202328",
    marginLeft: 8,
  },
  categoriesScrollRow: {
    paddingRight: 20,
    marginBottom: 24,
  },
  categoryCard: {
    width: 150,
    height: 140,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: 14,
    marginRight: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    justifyContent: "space-between",
  },
  categoryCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dualCategoryIcons: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  diamondOffset: {
    marginLeft: -6,
    marginBottom: -4,
  },
  categoryCardBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryMediaStack: {
    flexDirection: "row",
    alignItems: "center",
  },
  miniMediaIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#22252A",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#161719",
  },
  countBadge: {
    backgroundColor: "#262930",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: Theme.colors.textPrimary,
  },
  categoryCardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Theme.colors.textPrimary,
  },
  insightCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  insightTextCol: {
    flex: 1,
    paddingRight: 12,
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Theme.colors.textPrimary,
    marginBottom: 4,
  },
  insightDesc: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    lineHeight: 18,
  },
  insightOrbCol: {
    width: 64,
    height: 64,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomSpacer: {
    height: 100,
  },
});
