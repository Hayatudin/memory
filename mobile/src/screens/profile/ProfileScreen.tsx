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
  Alert,
} from "react-native";
import { useAuthStore } from "../../store/authStore";
import { Theme } from "../../theme/index";
import { Icon, IconName } from "../../components/common/Icon";
import { IOSGlassCircle } from "../../components/common/IOSGlassCircle";
import { IOSGlassButton } from "../../components/common/IOSGlassButton";

interface SettingItem {
  id: string;
  label: string;
  icon: IconName;
  onPress?: () => void;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

export const ProfileScreen: React.FC = () => {
  const { user, profile, logout, isSubmitting } = useAuthStore();

  const displayName = profile?.displayName || user?.name || "Orhan hy!";

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out of your account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const SECTIONS: SettingSection[] = [
    {
      title: "ACCOUNT",
      items: [
        { id: "personal", label: "Personal information", icon: "user" },
        { id: "security", label: "Password & security", icon: "lock" },
      ],
    },
    {
      title: "PREFERENCES",
      items: [
        { id: "notifications", label: "Notifications", icon: "bell-fill" },
        { id: "appearance", label: "Appearance", icon: "moon" },
      ],
    },
    {
      title: "DATA & PRIVACY",
      items: [
        { id: "backup", label: "Backup & sync", icon: "refresh" },
        { id: "export", label: "Export memories", icon: "upload" },
        { id: "privacy", label: "Privacy & Data", icon: "shield" },
      ],
    },
    {
      title: "SUPPORT",
      items: [
        { id: "help", label: "Help & feedback", icon: "message" },
        { id: "about", label: "About", icon: "info" },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.screenTitle}>Profile</Text>

        {/* User Avatar & Name */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            <IOSGlassCircle size={100} strokeWidth={1.8} fill="#18191E">
              {profile?.avatarUrl ? (
                <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
              ) : (
                <Image
                  source={require("../../assets/images/user-avatar.png")}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              )}
            </IOSGlassCircle>
            {/* Camera Badge with iOS specular button styling */}
            <TouchableOpacity style={styles.cameraBadge} activeOpacity={0.8}>
              <Icon name="camera" size={13} color="#0A0D02" strokeWidth={2.4} />
            </TouchableOpacity>
          </View>

          <Text style={styles.profileName}>{displayName}</Text>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text style={styles.statNumber}>248</Text>
              <Text style={styles.statLabel}>Memories</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statNumber}>18</Text>
              <Text style={styles.statLabel}>Categories</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statNumber}>42</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
          </View>
        </View>

        {/* Settings Sections */}
        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.sectionContainer}>
            <Text style={styles.sectionHeaderTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.settingItemRow,
                    index !== section.items.length - 1 && styles.settingItemBorder,
                  ]}
                  activeOpacity={0.7}
                  onPress={item.onPress || (() => {})}
                >
                  <View style={styles.settingItemLeft}>
                    {/* iOS Glass Circle around each icon */}
                    <IOSGlassCircle size={36} strokeWidth={1.2} fill="rgba(30, 33, 40, 0.9)">
                      <Icon
                        name={item.icon}
                        size={17}
                        color="#E5E7EB"
                        strokeWidth={2}
                      />
                    </IOSGlassCircle>
                    <Text style={styles.settingItemLabel}>{item.label}</Text>
                  </View>
                  <IOSGlassButton size={28} onPress={item.onPress}>
                    <Icon
                      name="chevron-right"
                      size={13}
                      color="#8E8E93"
                      strokeWidth={2.4}
                    />
                  </IOSGlassButton>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Version & Logout Button */}
        <View style={styles.footerSection}>
          <Text style={styles.versionText}>Version 1.0.0</Text>

          <TouchableOpacity
            style={styles.logoutButton}
            activeOpacity={0.8}
            onPress={handleLogout}
            disabled={isSubmitting}
          >
            <Text style={styles.logoutButtonText}>
              {isSubmitting ? "Logging out..." : "Log out"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacer for floating bottom navigation */}
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
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 20,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarWrapper: {
    position: "relative",
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 92,
    height: 92,
    borderRadius: 46,
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#D4F82C",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#000000",
  },
  profileName: {
    fontSize: 21,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 18,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    backgroundColor: "#14161C",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  statCol: {
    alignItems: "center",
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  statNumber: {
    fontSize: 19,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#8E8E93",
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeaderTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8E8E93",
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.6,
  },
  sectionCard: {
    backgroundColor: "#14161C",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    overflow: "hidden",
  },
  settingItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.06)",
  },
  settingItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingItemLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#FFFFFF",
    marginLeft: 12,
  },
  footerSection: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  versionText: {
    fontSize: 12,
    color: "#8E8E93",
    marginBottom: 14,
  },
  logoutButton: {
    width: "100%",
    height: 52,
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  logoutButtonText: {
    color: "#F87171",
    fontSize: 15,
    fontWeight: "600",
  },
  bottomSpacer: {
    height: 100,
  },
});
