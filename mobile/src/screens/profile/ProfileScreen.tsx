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

  const displayName = profile?.displayName || user?.name || "Orhan_hy";

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
        { id: "notifications", label: "Notifications", icon: "bell" },
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
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.background} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.screenTitle}>Profile</Text>

        {/* User Avatar & Name */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            {profile?.avatarUrl ? (
              <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            {/* Camera Badge */}
            <TouchableOpacity style={styles.cameraBadge} activeOpacity={0.8}>
              <Icon name="camera" size={14} color={Theme.colors.black} strokeWidth={2.4} />
            </TouchableOpacity>
          </View>

          <Text style={styles.profileName}>{displayName}</Text>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text style={styles.statNumber}>248</Text>
              <Text style={styles.statLabel}>Memories</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statNumber}>18</Text>
              <Text style={styles.statLabel}>Categories</Text>
            </View>
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
                    <View style={styles.settingIconWrapper}>
                      <Icon
                        name={item.icon}
                        size={18}
                        color={Theme.colors.textSecondary}
                      />
                    </View>
                    <Text style={styles.settingItemLabel}>{item.label}</Text>
                  </View>
                  <Icon
                    name="chevron-right"
                    size={16}
                    color={Theme.colors.textMuted}
                  />
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
    backgroundColor: Theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: Theme.colors.textPrimary,
    marginBottom: 20,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 28,
  },
  avatarWrapper: {
    position: "relative",
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 14,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Theme.colors.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  avatarInitial: {
    fontSize: 36,
    fontWeight: "700",
    color: Theme.colors.primary,
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Theme.colors.background,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
    color: Theme.colors.textPrimary,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 16,
  },
  statCol: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: Theme.colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeaderTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: Theme.colors.textMuted,
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  sectionCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    overflow: "hidden",
  },
  settingItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  settingItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingIconWrapper: {
    width: 28,
    alignItems: "center",
    marginRight: 10,
  },
  settingItemLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Theme.colors.textPrimary,
  },
  footerSection: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  versionText: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    marginBottom: 14,
  },
  logoutButton: {
    width: "100%",
    height: 50,
    backgroundColor: Theme.colors.dangerDark,
    borderRadius: Theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Theme.colors.dangerBorder,
  },
  logoutButtonText: {
    color: Theme.colors.dangerText,
    fontSize: 15,
    fontWeight: "600",
  },
  bottomSpacer: {
    height: 100,
  },
});
