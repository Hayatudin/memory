import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ImageBackground,
  ActionSheetIOS,
  Alert,
  Platform,
  Share,
  Modal,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon, IconName } from "../../components/common/Icon";
import { IOSGlassButton } from "../../components/common/IOSGlassButton";
import { IOSGlassCapsule } from "../../components/common/IOSGlassCapsule";
import { IOSGlassCircle } from "../../components/common/IOSGlassCircle";
import { useMemoryStore } from "../../store/memoryStore";

interface MemoryItem {
  id: string;
  title: string;
  subtitle: string;
  timestamp: string;
  type: "link" | "image" | "text" | "voice";
  typeLabel: string;
  url?: string;
}

interface FilterChip {
  id: string;
  label: string;
  icon: IconName;
  type?: "link" | "image" | "text" | "voice";
}

const FILTER_CHIPS: FilterChip[] = [
  { id: "all", label: "All", icon: "grid" },
  { id: "links", label: "Links", icon: "link", type: "link" },
  { id: "images", label: "Images", icon: "image", type: "image" },
  { id: "text", label: "Text", icon: "document", type: "text" },
  { id: "voice", label: "Voice", icon: "audio-wave", type: "voice" },
];

interface CategoryMemoriesScreenProps {
  navigation: any;
  route?: {
    params?: {
      categoryId?: string;
      categoryName?: string;
      categoryIcon?: IconName;
      count?: number;
    };
  };
}

const getCategoryIcon = (name: string, passedIcon?: IconName): IconName => {
  if (passedIcon) return passedIcon;
  const lower = name.toLowerCase();
  if (lower.includes("tag")) return "tag";
  if (lower.includes("entertain") || lower.includes("video") || lower.includes("movie")) return "video";
  if (lower.includes("idea") || lower.includes("think") || lower.includes("strategy")) return "lightbulb";
  if (lower.includes("research") || lower.includes("book") || lower.includes("study")) return "book";
  if (lower.includes("tech") || lower.includes("code") || lower.includes("dev")) return "tech";
  if (lower.includes("music") || lower.includes("audio") || lower.includes("song")) return "music";
  if (lower.includes("resource") || lower.includes("link") || lower.includes("url")) return "link";
  if (lower.includes("photo") || lower.includes("image")) return "image";
  return "folder";
};

export const CategoryMemoriesScreen: React.FC<CategoryMemoriesScreenProps> = ({
  navigation,
  route,
}) => {
  const insets = useSafeAreaInsets();
  const initialCategoryName = route?.params?.categoryName || "Entertainment";
  const initialCategoryId = route?.params?.categoryId;

  const {
    memories: storeMemories,
    categories: storeCategories,
    fetchMemories,
    updateCategory,
    deleteCategory,
    removeMemoryLocally,
  } = useMemoryStore();

  useEffect(() => {
    fetchMemories().catch(() => {});
  }, [fetchMemories]);

  // Find real category record if exists
  const resolvedCategory = useMemo(() => {
    return storeCategories.find(
      (c) =>
        (initialCategoryId && c.id === initialCategoryId) ||
        c.name.toLowerCase() === initialCategoryName.toLowerCase()
    );
  }, [storeCategories, initialCategoryId, initialCategoryName]);

  const [categoryName, setCategoryName] = useState(
    resolvedCategory?.name || initialCategoryName
  );
  const categoryId = resolvedCategory?.id || initialCategoryId;
  const categoryIcon = getCategoryIcon(
    categoryName,
    route?.params?.categoryIcon || (resolvedCategory?.icon as IconName)
  );

  // Sync categoryName if store changes
  useEffect(() => {
    if (resolvedCategory?.name) {
      setCategoryName(resolvedCategory.name);
    }
  }, [resolvedCategory?.name]);

  // Category Settings Modal state
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editCategoryName, setEditCategoryName] = useState(categoryName);
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);

  // Filter real store memories by category
  const categoryMemories: MemoryItem[] = useMemo(() => {
    const matched = storeMemories.filter((m) => {
      if (categoryId && m.categoryId === categoryId) return true;
      if (m.categoryName && m.categoryName.toLowerCase() === categoryName.toLowerCase()) return true;
      return false;
    });

    return matched.map((mem) => {
      let typeLabel = "Text";
      if (mem.type === "link") typeLabel = "Link";
      else if (mem.type === "image") typeLabel = "Image";
      else if (mem.type === "voice") typeLabel = "Audio";

      let timestamp = "Recently";
      if (mem.createdAt) {
        const createdDate = new Date(mem.createdAt);
        const diffHours = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60);
        if (diffHours < 24) {
          timestamp = "Today";
        } else if (diffHours < 48) {
          timestamp = "Yesterday";
        } else {
          timestamp = `${Math.max(1, Math.floor(diffHours / 24))} days ago`;
        }
      }

      return {
        id: mem.id,
        title: mem.title || "Untitled Memory",
        subtitle: mem.content || mem.sourceUrl || "",
        timestamp,
        type: (mem.type as any) || "text",
        typeLabel,
        url: mem.sourceUrl || undefined,
      };
    });
  }, [storeMemories, categoryId, categoryName]);

  // ── Memory Actions (Matches HomeScreen Native Popups) ──
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
            removeMemoryLocally(id);
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

  const openCategorySettings = () => {
    setEditCategoryName(categoryName);
    setIsEditModalVisible(true);
  };

  const handleSaveCategoryName = async () => {
    const trimmed = editCategoryName.trim();
    if (!trimmed) return;
    setIsSavingCategory(true);
    try {
      if (categoryId) {
        await updateCategory(categoryId, trimmed);
      }
      setCategoryName(trimmed);
      setIsEditModalVisible(false);
    } catch (err) {
      console.warn("Failed to update category name:", err);
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleDeleteCategory = () => {
    Alert.alert(
      "Delete Category",
      `Are you sure you want to delete "${categoryName}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (categoryId) {
              try {
                await deleteCategory(categoryId);
              } catch (err) {
                console.warn("Failed to delete category:", err);
              }
            }
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleSelectMultiple = () => {
    Alert.alert("Select Multiple", "Multi-select mode ready.");
  };

  const handleSort = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: "Sort Memories",
          options: ["Cancel", "Newest First", "Oldest First", "Title (A-Z)"],
          cancelButtonIndex: 0,
        },
        () => {}
      );
    } else {
      Alert.alert("Sort Memories", "Choose sorting order", [
        { text: "Cancel", style: "cancel" },
        { text: "Newest First" },
        { text: "Oldest First" },
        { text: "Title (A-Z)" },
      ]);
    }
  };

  const handleHeaderMenu = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: categoryName,
          options: [
            "Cancel",
            "Select Multiple",
            "Sort...",
            "Edit name",
            "Delete Category",
          ],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 4,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            handleSelectMultiple();
          } else if (buttonIndex === 2) {
            handleSort();
          } else if (buttonIndex === 3) {
            openCategorySettings();
          } else if (buttonIndex === 4) {
            handleDeleteCategory();
          }
        }
      );
    } else {
      Alert.alert(
        categoryName,
        "Options",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Select Multiple", onPress: handleSelectMultiple },
          { text: "Sort...", onPress: handleSort },
          { text: "Edit name", onPress: openCategorySettings },
          { text: "Delete Category", style: "destructive", onPress: handleDeleteCategory },
        ],
        { cancelable: true }
      );
    }
  };

  // ── Filtered Memories List ──
  const activeChip = FILTER_CHIPS.find((c) => c.id === selectedFilter);
  const filteredMemories = categoryMemories.filter((item) => {
    const matchesSearch =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeChip?.type) {
      return item.type === activeChip.type;
    }
    return true;
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Gradient Top Header with Glowing Lime Shoulders & Centered Dome Arch ── */}
        <ImageBackground
          source={require("../../assets/images/category-header-bg.png")}
          style={[
            styles.headerBackground,
            {
              paddingTop: insets.top > 0 ? insets.top + 4 : 14,
              height: insets.top > 0 ? insets.top + 160 : 185,
            },
          ]}
          resizeMode="cover"
        >
          {/* Top Navigation Row: Back button (left) and 3-dot menu (right) */}
          <View style={styles.navRow}>
            {/* iOS Glass Back Button with Specular Gradient Stroke */}
            <IOSGlassButton
              size={42}
              onPress={() => navigation.goBack()}
              fill="rgba(30, 32, 38, 0.75)"
              gradientId="catMemoriesBackBtnGrad"
            >
              <Icon name="chevron-left" size={20} color="#FFFFFF" strokeWidth={2.4} />
            </IOSGlassButton>

            <TouchableOpacity
              style={styles.headerMenuButton}
              activeOpacity={0.6}
              onPress={handleHeaderMenu}
              hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
            >
              <Icon name="more-vertical" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Centered Category Title & Memory Count */}
          <View style={styles.headerTextGroup}>
            <Text style={styles.categoryTitle}>{categoryName}</Text>
            <Text style={styles.categoryCount}>
              {categoryMemories.length} {categoryMemories.length === 1 ? "Memory" : "Memories"}
            </Text>
          </View>
        </ImageBackground>

        {/* ── Capsule Search Bar with iOS Specular Glass Effect ── */}
        <View style={styles.searchBarWrapper}>
          <IOSGlassCapsule
            height={50}
            borderRadius={25}
            strokeWidth={1.4}
            fill="rgba(20, 22, 27, 0.92)"
            gradientId="catMemoriesSearchGrad"
            contentStyle={styles.searchCapsuleContent}
          >
            <Icon name="search" size={18} color="#71717A" />
            <TextInput
              placeholder="Search your memories..."
              placeholderTextColor="#71717A"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </IOSGlassCapsule>
        </View>

        {/* ── Filter Chips Bar: Compact pills matching exact design, no extended widths ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {FILTER_CHIPS.map((chip) => {
            const isSelected = selectedFilter === chip.id;
            return (
              <TouchableOpacity
                key={chip.id}
                activeOpacity={0.8}
                onPress={() => setSelectedFilter(chip.id)}
                style={[
                  styles.filterChip,
                  isSelected ? styles.filterChipActive : styles.filterChipInactive,
                ]}
              >
                <Icon
                  name={chip.icon}
                  size={15}
                  color={isSelected ? "#0A0D02" : "#9CA3AF"}
                  strokeWidth={isSelected ? 2.4 : 1.8}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected ? styles.filterChipTextActive : styles.filterChipTextInactive,
                  ]}
                >
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Section Title: Memories with gap from filter chips ── */}
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Memories</Text>
        </View>

        {/* ── Memories List ── */}
        <View style={styles.memoriesList}>
          {filteredMemories.length > 0 ? (
            filteredMemories.map((item) => {
              const isUrl = Boolean(item.url || item.subtitle.startsWith("http"));
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.memoryItem}
                  activeOpacity={0.7}
                  onPress={() =>
                    navigation.navigate("MemoryDetail", {
                      memoryId: item.id,
                      initialData: item,
                    })
                  }
                >
                  {/* Left Large Circular Badge with Category Icon matching category (e.g. tag for tag) */}
                  <IOSGlassCircle
                    size={54}
                    strokeWidth={1.4}
                    fill="rgba(24, 26, 31, 0.90)"
                    gradientId={`memBadgeGrad-${item.id}`}
                  >
                    <Icon name={categoryIcon} size={24} color="#FFFFFF" strokeWidth={1.8} />
                  </IOSGlassCircle>

                  {/* Content Column */}
                  <View style={styles.memoryContentCol}>
                    <Text style={styles.memoryTitle} numberOfLines={1}>
                      {item.title}
                    </Text>

                    {/* Subtitle with copy icon if it's a URL */}
                    {isUrl ? (
                      <View style={styles.urlRow}>
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

                    {/* Dual Pills: Date pill + Category type pill with iOS glass specular styling */}
                    <View style={styles.pillsRow}>
                      <View style={styles.pillBadge}>
                        <Text style={styles.pillText}>{item.timestamp}</Text>
                      </View>

                      <View style={styles.pillBadge}>
                        <Icon
                          name={
                            item.type === "link"
                              ? "link"
                              : item.type === "image"
                              ? "image"
                              : item.type === "voice"
                              ? "audio-wave"
                              : "document"
                          }
                          size={11}
                          color="#9CA3AF"
                          strokeWidth={1.8}
                        />
                        <Text style={styles.pillText}>{item.typeLabel}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Right: Vertical 3-Dot Menu Icon (White, no background) */}
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
            })
          ) : (
            <View style={styles.emptyContainer}>
              <IOSGlassCircle size={64} fill="rgba(255, 255, 255, 0.04)" strokeWidth={1.2}>
                <Icon name={categoryIcon} size={28} color="#71717A" strokeWidth={1.8} />
              </IOSGlassCircle>
              <Text style={styles.emptyTitle}>No memories yet</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery.trim()
                  ? `No memories matched "${searchQuery}" in ${categoryName}.`
                  : `Memories saved to "${categoryName}" will appear here.`}
              </Text>
            </View>
          )}
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* ── Category Settings (Edit Category Name) Modal ── */}
      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalBackdrop}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalCenteredContainer}>
              <View style={styles.modalCard}>
                {/* Accent Icon Header */}
                <View style={styles.modalIconWrapper}>
                  <IOSGlassCircle
                    size={52}
                    strokeWidth={1.4}
                    fill="rgba(212, 248, 44, 0.12)"
                    gradientId="editCatModalGrad"
                  >
                    <Icon name="edit" size={22} color="#D4F82C" strokeWidth={2} />
                  </IOSGlassCircle>
                </View>

                <Text style={styles.modalTitle}>Edit Name</Text>
                <Text style={styles.modalSubtitle}>Enter a new name for this category</Text>

                {/* Text Input */}
                <View style={styles.modalInputWrapper}>
                  <TextInput
                    placeholder="Category name"
                    placeholderTextColor="#6B7280"
                    value={editCategoryName}
                    onChangeText={setEditCategoryName}
                    style={styles.modalInput}
                    autoFocus={true}
                    returnKeyType="done"
                    onSubmitEditing={handleSaveCategoryName}
                    maxLength={28}
                  />
                </View>

                {/* Modal Buttons */}
                <View style={styles.modalActionsRow}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setIsEditModalVisible(false)}
                    style={styles.modalCancelBtn}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleSaveCategoryName}
                    disabled={!editCategoryName.trim() || isSavingCategory}
                    style={[
                      styles.modalSaveBtn,
                      (!editCategoryName.trim() || isSavingCategory) && styles.modalSaveBtnDisabled,
                    ]}
                  >
                    <Text style={styles.modalSaveText}>
                      {isSavingCategory ? "Saving..." : "Save"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // ── Header Styling ──
  headerBackground: {
    width: "100%",
    justifyContent: "space-between",
    paddingBottom: 8,
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerMenuButton: {
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTextGroup: {
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 22,
  },
  categoryTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.4,
  },
  categoryCount: {
    fontSize: 13,
    fontWeight: "500",
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 2,
  },

  // ── Search Bar ──
  searchBarWrapper: {
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 2,
  },
  searchCapsuleContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    width: "100%",
    height: "100%",
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    marginLeft: 10,
    paddingVertical: 0,
  },

  // ── Filter Chips ──
  chipsRow: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    gap: 6,
    borderWidth: 1,
  },
  filterChipActive: {
    backgroundColor: "#D4F82C",
    borderColor: "#D4F82C",
  },
  filterChipInactive: {
    backgroundColor: "rgba(26, 29, 34, 0.85)",
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderTopColor: "rgba(255, 255, 255, 0.18)",
  },
  filterChipText: {
    fontSize: 13,
  },
  filterChipTextActive: {
    color: "#0A0D02",
    fontWeight: "700",
  },
  filterChipTextInactive: {
    color: "#9CA3AF",
    fontWeight: "500",
  },

  // ── Memories Section Title ──
  sectionTitleRow: {
    paddingHorizontal: 20,
    marginTop: 18,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },

  // ── Memories List ──
  memoriesList: {
    marginTop: 4,
  },
  memoryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  memoryContentCol: {
    flex: 1,
    marginLeft: 14,
    marginRight: 10,
  },
  memoryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 3,
    letterSpacing: -0.2,
  },
  urlRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  memorySubtitle: {
    fontSize: 13,
    color: "#8E8E93",
    marginBottom: 6,
    flexShrink: 1,
  },
  pillsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pillBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(29, 32, 37, 0.85)",
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 999,
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderTopColor: "rgba(255, 255, 255, 0.16)",
  },
  pillText: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  moreMenuBtn: {
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomSpacer: {
    height: 60,
  },
  // ── Empty State ──
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 18,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#71717A",
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 280,
  },

  // ── Edit Modal Styles ──
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.72)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalCenteredContainer: {
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#16191E",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    padding: 24,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 12,
  },
  modalIconWrapper: {
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 18,
  },
  modalInputWrapper: {
    backgroundColor: "#111317",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 20,
  },
  modalInput: {
    fontSize: 15,
    color: "#FFFFFF",
    paddingVertical: 0,
  },
  modalActionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCancelText: {
    color: "#9CA3AF",
    fontSize: 15,
    fontWeight: "600",
  },
  modalSaveBtn: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#D4F82C",
    justifyContent: "center",
    alignItems: "center",
  },
  modalSaveBtnDisabled: {
    opacity: 0.45,
  },
  modalSaveText: {
    color: "#0A0D02",
    fontSize: 15,
    fontWeight: "700",
  },
});
