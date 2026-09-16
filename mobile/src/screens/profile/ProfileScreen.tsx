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
  Alert,
  ActionSheetIOS,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuthStore } from "../../store/authStore";
import { Icon, IconName } from "../../components/common/Icon";

const DEMO_AVATAR = require("../../assets/avatar_demo.jpg");

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
  const { user, profile, logout, isSubmitting, updateAvatar } = useAuthStore();
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const displayName = profile?.displayName || user?.name || "Orhan_hy";

  // Camera badge responsive image picker
  const handleCameraBadgePress = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Take Photo", "Choose from Library"],
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) {
            await handleLaunchCamera();
          } else if (buttonIndex === 2) {
            await handleLaunchImageLibrary();
          }
        }
      );
    } else {
      Alert.alert("Profile Photo", "Choose an option", [
        { text: "Cancel", style: "cancel" },
        { text: "Take Photo", onPress: handleLaunchCamera },
        { text: "Choose from Library", onPress: handleLaunchImageLibrary },
      ]);
    }
  };

  const handleLaunchCamera = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission Required", "Camera access is needed to capture a photo.");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0].uri) {
        const uri = result.assets[0].uri;
        setAvatarUri(uri);
        updateAvatar(uri);
      }
    } catch (err: any) {
      console.error("Camera error:", err);
      Alert.alert("Camera Error", err?.message || "Could not launch camera.");
    }
  };

  const handleLaunchImageLibrary = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission Required", "Photo library access is needed to choose a photo.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0].uri) {
        const uri = result.assets[0].uri;
        setAvatarUri(uri);
        updateAvatar(uri);
      }
    } catch (err: any) {
      console.error("Library error:", err);
      Alert.alert("Library Error", err?.message || "Could not open photo library.");
    }
  };

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
        { id: "personal", label: "Personal information", icon: "user-circle" },
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
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.screenTitle}>Profile</Text>

        {/* User Avatar & Name */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image
              source={
                avatarUri
                  ? { uri: avatarUri }
                  : profile?.avatarUrl
                  ? { uri: profile.avatarUrl }
                  : DEMO_AVATAR
              }
              style={styles.avatarImage}
              resizeMode="cover"
            />
            {/* Responsive Camera Badge */}
            <TouchableOpacity
              style={styles.cameraBadge}
              activeOpacity={0.8}
              onPress={handleCameraBadgePress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon name="camera" size={13} color="#000000" strokeWidth={2.2} />
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
                <View key={item.id}>
                  <TouchableOpacity
                    style={styles.settingItemRow}
                    activeOpacity={0.7}
                    onPress={item.onPress || (() => {})}
                  >
                    <View style={styles.settingItemLeft}>
                      <Icon
                        name={item.icon}
                        size={19}
                        color="#A1A1AA"
                        strokeWidth={1.8}
                      />
                      <Text style={styles.settingItemLabel}>{item.label}</Text>
                    </View>
                    <Icon
                      name="chevron-right"
                      size={13}
                      color="#71717A"
                      strokeWidth={2}
                    />
                  </TouchableOpacity>
                  {index < section.items.length - 1 && (
                    <View style={styles.rowDivider} />
                  )}
                </View>
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
    paddingTop: 12,
    paddingBottom: 40,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 26,
    letterSpacing: 0.2,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarContainer: {
    position: "relative",
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 12,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#C6F432",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#000000",
  },
  profileName: {
    fontSize: 22,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 24,
    letterSpacing: 0.2,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  statCol: {
    alignItems: "center",
    minWidth: 80,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: "#8E8E93",
    fontWeight: "400",
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionHeaderTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8E8E93",
    letterSpacing: 0.6,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    overflow: "hidden",
  },
  settingItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  settingItemLabel: {
    fontSize: 15,
    fontWeight: "400",
    color: "#D1D5DB",
    letterSpacing: 0.1,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#2C2C2E",
    marginLeft: 49,
  },
  footerSection: {
    marginTop: 26,
    alignItems: "center",
  },
  versionText: {
    fontSize: 13,
    color: "#71717A",
    marginBottom: 14,
  },
  logoutButton: {
    width: "100%",
    backgroundColor: "#2E0A0E",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#E57373",
  },
  bottomSpacer: {
    height: 60,
  },
});
