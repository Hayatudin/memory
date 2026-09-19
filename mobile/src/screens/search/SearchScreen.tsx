import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Share,
  Alert,
  ActionSheetIOS,
  PanResponder,
  Animated,
  LayoutAnimation,
  UIManager,
} from "react-native";
import { Icon, IconName, detectCategoryIcon } from "../../components/common/Icon";
import { IOSGlassCapsule } from "../../components/common/IOSGlassCapsule";
import { IOSGlassCircle } from "../../components/common/IOSGlassCircle";
import { NotchedCategoryCard } from "../../components/common/NotchedCategoryCard";
import { useMemoryStore } from "../../store/memoryStore";
import { Category, Memory } from "../../types/models";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface CategoryItem {
  id: string;
  name: string;
  count: number;
  icon: IconName;
}

interface MemoryItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  timestamp: string;
  type: "link" | "text" | "image" | "voice" | "document";
  typeLabel: string;
  url?: string;
  icon: IconName;
}

// Row height constant for the drag calculation
const ROW_HEIGHT = 72;

interface CategoryRowItemProps {
  cat: Category;
  index: number;
  isFavorite: boolean;
  isItemDragging: boolean;
  panY: Animated.Value;
  shiftY: Animated.Value;
  memoriesCount: number;
  onStartDrag: (index: number) => void;
  onMoveDrag: (dy: number) => void;
  onEndDrag: () => void;
  onToggleFavorite: (id: string) => void;
}

const CategoryRowItem: React.FC<CategoryRowItemProps> = React.memo(
  ({
    cat,
    index,
    isFavorite,
    isItemDragging,
    panY,
    shiftY,
    memoriesCount,
    onStartDrag,
    onMoveDrag,
    onEndDrag,
    onToggleFavorite,
  }) => {
    let catIcon: IconName = "folder";
    if (cat.icon) {
      catIcon = cat.icon as IconName;
    } else {
      catIcon = detectCategoryIcon(cat.name);
    }

    // PanResponder on the hamburger grip handle for instant, free vertical drag
    const gripPanResponder = useMemo(
      () =>
        PanResponder.create({
          onStartShouldSetPanResponder: () => true,
          onStartShouldSetPanResponderCapture: () => true,
          onMoveShouldSetPanResponder: () => true,
          onMoveShouldSetPanResponderCapture: () => true,
          onPanResponderGrant: () => {
            onStartDrag(index);
          },
          onPanResponderMove: (_, gs) => {
            onMoveDrag(gs.dy);
          },
          onPanResponderRelease: () => {
            onEndDrag();
          },
          onPanResponderTerminate: () => {
            onEndDrag();
          },
        }),
      [index, onStartDrag, onMoveDrag, onEndDrag]
    );

    return (
      <Animated.View
        style={[
          styles.manageItemRow,
          isItemDragging && styles.manageItemRowDragging,
          {
            transform: [{ translateY: isItemDragging ? panY : shiftY }],
            zIndex: isItemDragging ? 9999 : 1,
            elevation: isItemDragging ? 20 : 1,
          },
        ]}
      >
        {/* iOS Grip Handle (3 horizontal bars) — touching here starts dragging immediately */}
        <View
          {...gripPanResponder.panHandlers}
          style={styles.dragGripContainer}
          hitSlop={{ top: 18, bottom: 18, left: 18, right: 30 }}
        >
          <View style={[styles.dragGripBar, isItemDragging && styles.dragGripBarActive]} />
          <View style={[styles.dragGripBar, isItemDragging && styles.dragGripBarActive]} />
          <View style={[styles.dragGripBar, isItemDragging && styles.dragGripBarActive]} />
        </View>

        {/* Category Icon and Details */}
        <View style={styles.manageCategoryInfo}>
          <View
            style={[
              styles.manageCategoryIconContainer,
              isItemDragging && styles.manageCategoryIconContainerActive,
            ]}
          >
            <Icon name={catIcon} size={18} color="#D4F82C" strokeWidth={2} />
          </View>
          <View style={styles.manageCategoryTextCol}>
            <Text style={styles.manageCategoryName} numberOfLines={1}>
              {cat.name}
            </Text>
            <Text style={styles.manageCategoryCountText}>
              {memoriesCount} {memoriesCount === 1 ? "memory" : "memories"}
            </Text>
          </View>
        </View>

        {/* Favorite Star Button — features category under 'Your Categories' on Home */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onToggleFavorite(cat.id)}
          style={[
            styles.favoriteStarBtn,
            isFavorite && styles.favoriteStarBtnActive,
          ]}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Icon
            name={isFavorite ? "star-fill" : "star"}
            size={17}
            color={isFavorite ? "#000000" : "#8E8E93"}
            strokeWidth={2}
          />
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

export const SearchScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const {
    categories: storeCategories,
    fetchCategories,
    createCategory,
    reorderCategories,
    favoriteCategoryIds,
    toggleFavoriteCategory,
    memories: storeMemories,
    fetchMemories,
    removeMemoryLocally,
  } = useMemoryStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);

  // Add Category modal state
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  // Reorder modal state
  const [isManageModalVisible, setIsManageModalVisible] = useState(false);
  const [orderedCategories, setOrderedCategories] = useState<Category[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Animated displacement for active card and sibling cards
  const panY = useRef(new Animated.Value(0)).current;
  const shiftAnims = useRef<Animated.Value[]>([]).current;
  while (shiftAnims.length < orderedCategories.length) {
    shiftAnims.push(new Animated.Value(0));
  }

  // Refs for tracking during PanResponder gesture without causing re-renders
  const draggedIndexRef = useRef<number | null>(null);
  const targetSlotRef = useRef<number>(0);
  const isDraggingRef = useRef(false);

  // Track favorite toggling with max 5 cap for 'Your Categories' on Home
  const handleToggleFavorite = useCallback(
    (catId: string) => {
      const isFav = favoriteCategoryIds.includes(catId);
      if (!isFav && favoriteCategoryIds.length >= 5) {
        Alert.alert(
          "Favorite Limit Reached",
          "You can select up to 5 favorite categories to display under 'Your Categories' on the Home screen."
        );
        return;
      }
      toggleFavoriteCategory(catId);
    },
    [favoriteCategoryIds, toggleFavoriteCategory]
  );

  // --- Drag handlers for grip-based and hold-based reordering ---
  const handleStartDrag = useCallback(
    (index: number) => {
      isDraggingRef.current = true;
      draggedIndexRef.current = index;
      targetSlotRef.current = index;
      panY.setValue(0);
      shiftAnims.forEach((anim) => anim.setValue(0));
      setDraggedIndex(index);
    },
    [panY, shiftAnims]
  );

  const handleMoveDrag = useCallback(
    (dy: number) => {
      if (!isDraggingRef.current || draggedIndexRef.current === null) return;
      const D = draggedIndexRef.current;
      const total = orderedCategories.length;
      if (total <= 1) return;

      // Card follows finger freely up and down
      panY.setValue(dy);

      // Determine the slot the card is hovering over
      const rawSlot = D + Math.round(dy / ROW_HEIGHT);
      const targetSlot = Math.max(0, Math.min(total - 1, rawSlot));

      if (targetSlot !== targetSlotRef.current) {
        targetSlotRef.current = targetSlot;

        // Smoothly shift sibling cards out of the way
        for (let i = 0; i < total; i++) {
          if (i === D) continue;

          let toValue = 0;
          if (D < targetSlot) {
            // Dragging downward: items between D+1 and targetSlot shift upward (-ROW_HEIGHT)
            if (i > D && i <= targetSlot) {
              toValue = -ROW_HEIGHT;
            }
          } else if (D > targetSlot) {
            // Dragging upward: items between targetSlot and D-1 shift downward (+ROW_HEIGHT)
            if (i >= targetSlot && i < D) {
              toValue = ROW_HEIGHT;
            }
          }

          Animated.spring(shiftAnims[i], {
            toValue,
            useNativeDriver: true,
            tension: 260,
            friction: 20,
          }).start();
        }
      }
    },
    [orderedCategories.length, panY, shiftAnims]
  );

  const handleEndDrag = useCallback(() => {
    if (!isDraggingRef.current || draggedIndexRef.current === null) return;
    isDraggingRef.current = false;
    const D = draggedIndexRef.current;
    const K = targetSlotRef.current;
    const total = orderedCategories.length;

    if (D === K || total <= 1) {
      // Snap card back to home position
      Animated.spring(panY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 280,
        friction: 22,
      }).start(() => {
        shiftAnims.forEach((anim) => anim.setValue(0));
        draggedIndexRef.current = null;
        setDraggedIndex(null);
      });
      return;
    }

    // Snap card smoothly into the target slot
    const snapOffset = (K - D) * ROW_HEIGHT;
    Animated.spring(panY, {
      toValue: snapOffset,
      useNativeDriver: true,
      tension: 280,
      friction: 22,
    }).start(() => {
      // Reorder categories array
      const nextList = [...orderedCategories];
      const [moved] = nextList.splice(D, 1);
      nextList.splice(K, 0, moved);

      // Reset animated offsets simultaneously
      panY.setValue(0);
      shiftAnims.forEach((anim) => anim.setValue(0));
      draggedIndexRef.current = null;
      setDraggedIndex(null);

      // Update state and persist to store / AsyncStorage
      setOrderedCategories(nextList);
      reorderCategories(nextList);
    });
  }, [orderedCategories, panY, shiftAnims, reorderCategories]);

  // Fetch real categories and memories on mount
  useEffect(() => {
    fetchCategories().catch(() => {});
    fetchMemories().catch(() => {});
  }, [fetchCategories, fetchMemories]);

  // Dynamic categories with live memory counts and their persisted icons
  const categories: CategoryItem[] = useMemo(() => {
    return storeCategories.map((cat: Category) => {
      const count = storeMemories.filter((m: Memory) => {
        if (m.categoryId && m.categoryId === cat.id) return true;
        if (m.categoryName && m.categoryName.toLowerCase() === cat.name.toLowerCase()) return true;
        return false;
      }).length;

      let icon: IconName = "folder";
      if (cat.icon) {
        icon = cat.icon as IconName;
      } else {
        icon = detectCategoryIcon(cat.name);
      }

      return {
        id: cat.id,
        name: cat.name,
        count,
        icon,
      };
    });
  }, [storeCategories, storeMemories]);

  // Dynamic real memories mapped to MemoryItem format for search
  const memories: MemoryItem[] = useMemo(() => {
    return storeMemories.map((mem: Memory) => {
      let icon: IconName = "document";
      let typeLabel = "Text";
      if (mem.type === "link") {
        icon = "link";
        typeLabel = "Link";
      } else if (mem.type === "image") {
        icon = "image";
        typeLabel = "Image";
      } else if (mem.type === "voice") {
        icon = "audio-wave";
        typeLabel = "Audio";
      }

      const matchedCat = storeCategories.find(
        (c: Category) => c.id === mem.categoryId || c.name.toLowerCase() === mem.categoryName?.toLowerCase()
      );
      const categoryName = matchedCat?.name || mem.categoryName || "General";

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
        category: categoryName,
        timestamp,
        type: (mem.type as any) || "text",
        typeLabel,
        url: mem.sourceUrl || undefined,
        icon,
      };
    });
  }, [storeMemories, storeCategories]);

  // Search memories across title, subtitle, category, type and tags
  const matchingMemories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    const terms = query.split(/\s+/).filter(Boolean);
    return memories.filter((mem) => {
      const searchTarget = `${mem.title} ${mem.subtitle} ${mem.category} ${mem.typeLabel} ${mem.type}`.toLowerCase();
      return terms.every((term) => searchTarget.includes(term));
    });
  }, [searchQuery, memories]);

  const handleCreateCategory = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed || isCreatingCategory) return;

    try {
      setIsCreatingCategory(true);
      const icon = detectCategoryIcon(trimmed);
      await createCategory(trimmed, icon, "#8AE026");
      setNewCategoryName("");
      setIsAddModalVisible(false);
    } catch (err: any) {
      Alert.alert("Category Error", err?.message || "Could not save category to database");
    } finally {
      setIsCreatingCategory(false);
    }
  };

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

  const isSearching = searchQuery.trim().length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.screenTitle}>Search</Text>

        {/* Search Bar and Add Category Row with iOS Specular Glass styling */}
        <View style={styles.searchRow}>
          <View style={styles.searchInputContainer}>
            <IOSGlassCapsule
              height={48}
              borderRadius={24}
              strokeWidth={1.2}
              fill="#16181D"
              gradientId="searchScreenInputGrad"
              style={styles.searchCapsule}
              contentStyle={styles.searchCapsuleContent}
            >
              <Icon name="search" size={17} color="#8E8E93" />
              <TextInput
                placeholder="Search your memories..."
                placeholderTextColor="#8E8E93"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.trim().length > 0 && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setSearchQuery("")}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  style={styles.clearSearchBtn}
                >
                  <Icon name="close" size={14} color="#8E8E93" strokeWidth={2.4} />
                </TouchableOpacity>
              )}
            </IOSGlassCapsule>
          </View>

          {/* Add Category Button: Triggers popup dialog */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setIsAddModalVisible(true)}
            style={styles.addCategoryBtnWrapper}
          >
            <IOSGlassCapsule
              height={48}
              borderRadius={24}
              strokeWidth={1.2}
              fill="#191B22"
              gradientId="searchAddCategoryGrad"
              style={styles.addCategoryCapsule}
              contentStyle={styles.addCategoryContent}
            >
              <Text style={styles.addCategoryPlus}>+ </Text>
              <Text style={styles.addCategoryLabel}>Add Category</Text>
            </IOSGlassCapsule>
          </TouchableOpacity>
        </View>

        {/* ── Memory Search Results Section (Appears when searching memories) ── */}
        {isSearching && (
          <View style={styles.resultsSection}>
            <View style={styles.resultsHeader}>
              <Text style={styles.sectionHeaderTitle}>Matching Memories</Text>
              <View style={styles.resultsCountBadge}>
                <Text style={styles.resultsCountText}>
                  {matchingMemories.length} {matchingMemories.length === 1 ? "memory" : "memories"}
                </Text>
              </View>
            </View>

            {matchingMemories.length > 0 ? (
              <View style={styles.memoriesList}>
                {matchingMemories.map((item) => {
                  const isUrl = Boolean(item.url || item.subtitle.startsWith("http"));
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.memoryItem}
                      activeOpacity={0.7}
                      onPress={() =>
                        navigation?.navigate("MemoryDetail", {
                          memoryId: item.id,
                          initialData: item,
                        })
                      }
                    >
                      {/* Left Circular iOS Glass Icon Badge */}
                      <IOSGlassCircle
                        size={52}
                        strokeWidth={1.4}
                        fill="rgba(24, 26, 31, 0.90)"
                        gradientId={`searchMemBadge-${item.id}`}
                      >
                        <Icon name={item.icon || "document"} size={22} color="#FFFFFF" strokeWidth={1.8} />
                      </IOSGlassCircle>

                      {/* Content Column */}
                      <View style={styles.memoryContentCol}>
                        <Text style={styles.memoryTitle} numberOfLines={1}>
                          {item.title}
                        </Text>

                        {isUrl ? (
                          <View style={styles.urlRow}>
                            <Text style={styles.memorySubtitle} numberOfLines={1} ellipsizeMode="tail">
                              {item.subtitle}
                            </Text>
                            <Icon name="copy" size={12} color="#6B7280" />
                          </View>
                        ) : (
                          <Text style={styles.memorySubtitle} numberOfLines={1} ellipsizeMode="tail">
                            {item.subtitle}
                          </Text>
                        )}

                        {/* Dual Pills: Timestamp + Type */}
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
                            <Text style={styles.pillText}>{item.typeLabel || item.category}</Text>
                          </View>
                        </View>
                      </View>

                      {/* 3-Dot Vertical Menu */}
                      <TouchableOpacity
                        style={styles.moreMenuBtn}
                        activeOpacity={0.6}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        onPress={() => handleMemoryMenu(item)}
                      >
                        <Icon name="more-vertical" size={20} color="#FFFFFF" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyStateContainer}>
                <IOSGlassCircle size={58} fill="rgba(255, 255, 255, 0.04)" strokeWidth={1.2}>
                  <Icon name="search" size={22} color="#71717A" strokeWidth={1.8} />
                </IOSGlassCircle>
                <Text style={styles.emptyStateTitle}>No memories found</Text>
                <Text style={styles.emptyStateSubtitle}>
                  No memories matched "{searchQuery}". Try keywords like "AI", "video", "chess", "SEO", or "music".
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ── Categories Section (Shows all categories, including newly created ones) ── */}
        <View style={styles.categoriesHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>Categories</Text>
          <Text style={styles.categoriesCountText}>
            {categories.length} {categories.length === 1 ? "category" : "categories"}
          </Text>
        </View>

        {/* 2-Column Grid of Custom Notched Category Cards */}
        <View style={styles.categoryGrid}>
          {categories.map((item) => (
            <NotchedCategoryCard
              key={item.id}
              id={item.id}
              name={item.name}
              count={item.count}
              icon={item.icon}
              isFavorite={favoriteCategoryIds.includes(item.id)}
              onToggleFavorite={() => handleToggleFavorite(item.id)}
              onPress={() =>
                navigation?.navigate("CategoryMemories", {
                  categoryId: item.id,
                  categoryName: item.name,
                  categoryIcon: item.icon,
                  count: item.count || 0,
                })
              }
            />
          ))}
        </View>

        {/* Bottom Spacer for floating bottom navigation bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* ── Add Category Modal Dialog ── */}
      <Modal
        visible={isAddModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAddModalVisible(false)}
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
                    gradientId="modalFolderGrad"
                  >
                    <Icon name="folder" size={24} color="#D4F82C" strokeWidth={2} />
                  </IOSGlassCircle>
                </View>

                <Text style={styles.modalTitle}>New Category</Text>
                <Text style={styles.modalSubtitle}>
                  Enter a category name to organize your memories
                </Text>

                {/* Text Input */}
                <View style={styles.modalInputWrapper}>
                  <TextInput
                    placeholder="Category name (e.g. Travel, Fitness...)"
                    placeholderTextColor="#6B7280"
                    value={newCategoryName}
                    onChangeText={setNewCategoryName}
                    style={styles.modalInput}
                    autoFocus={true}
                    returnKeyType="done"
                    onSubmitEditing={handleCreateCategory}
                    maxLength={28}
                  />
                </View>

                {/* Modal Buttons: Cancel and Create */}
                <View style={styles.modalActionsRow}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      setIsAddModalVisible(false);
                      setNewCategoryName("");
                    }}
                    style={styles.modalCancelBtn}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleCreateCategory}
                    disabled={!newCategoryName.trim()}
                    style={[
                      styles.modalCreateBtn,
                      !newCategoryName.trim() && styles.modalCreateBtnDisabled,
                    ]}
                  >
                    <Text style={styles.modalCreateText}>Create</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Floating Action Button: Reorder & Favorite Categories ── */}
      <TouchableOpacity
        activeOpacity={0.82}
        onPress={() => {
          setOrderedCategories([...storeCategories]);
          setIsManageModalVisible(true);
        }}
        style={styles.floatingReorderBtn}
      >
        <IOSGlassCircle
          size={56}
          strokeWidth={1.5}
          fill="rgba(24, 27, 32, 0.92)"
          gradientId="fabManageGrad"
        >
          <View style={styles.floatingReorderIconWrapper}>
            <Icon name="sliders" size={22} color="#D4F82C" strokeWidth={2.2} />
          </View>
        </IOSGlassCircle>
      </TouchableOpacity>

      {/* ── Reorder & Favorite Categories Modal (iOS Liquid Glass) ── */}
      <Modal
        visible={isManageModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setDraggedIndex(null);
          isDraggingRef.current = false;
          setIsManageModalVisible(false);
        }}
      >
        <View style={styles.manageModalBackdrop}>
          <View style={styles.manageModalCard}>
            {/* iOS Sheet Handle Indicator */}
            <View style={styles.modalSheetHandle} />

            {/* Modal Header */}
            <View style={styles.manageModalHeader}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={styles.manageModalTitle}>Manage Categories</Text>
                <Text style={styles.manageModalSubtitle}>
                  Drag cards to reorder. Star up to 5 categories to feature under "Your Categories" on Home.
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setDraggedIndex(null);
                  isDraggingRef.current = false;
                  setIsManageModalVisible(false);
                }}
                style={styles.manageModalCloseBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="close" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Category Reorder List with Smooth Physical Drag & Displacement */}
            <ScrollView
              style={styles.manageCategoriesList}
              showsVerticalScrollIndicator={false}
              scrollEnabled={draggedIndex === null}
            >
              {orderedCategories.map((cat, index) => {
                const isItemDragging = draggedIndex === index;
                const shiftY = shiftAnims[index] || new Animated.Value(0);

                const catMemoriesCount = storeMemories.filter((m) => {
                  if (m.categoryId && m.categoryId === cat.id) return true;
                  if (m.categoryName && m.categoryName.toLowerCase() === cat.name.toLowerCase()) return true;
                  return false;
                }).length;

                return (
                  <CategoryRowItem
                    key={cat.id}
                    cat={cat}
                    index={index}
                    isFavorite={favoriteCategoryIds.includes(cat.id)}
                    isItemDragging={isItemDragging}
                    panY={panY}
                    shiftY={shiftY}
                    memoriesCount={catMemoriesCount}
                    onStartDrag={handleStartDrag}
                    onMoveDrag={handleMoveDrag}
                    onEndDrag={handleEndDrag}
                    onToggleFavorite={handleToggleFavorite}
                  />
                );
              })}
            </ScrollView>

            {/* Done Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                reorderCategories(orderedCategories);
                setDraggedIndex(null);
                isDraggingRef.current = false;
                setIsManageModalVisible(false);
              }}
              style={styles.manageDoneBtn}
            >
              <Text style={styles.manageDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    fontSize: 30,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 20,
    letterSpacing: -0.4,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
    width: "100%",
  },
  searchInputContainer: {
    flex: 1,
  },
  searchCapsule: {
    width: "100%",
  },
  searchCapsuleContent: {
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: "#FFFFFF",
    fontSize: 14,
    paddingVertical: 0,
  },
  clearSearchBtn: {
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  addCategoryBtnWrapper: {
    width: 128,
    flexShrink: 0,
  },
  addCategoryCapsule: {
    width: 128,
  },
  addCategoryContent: {
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  addCategoryPlus: {
    color: "#D4F82C",
    fontSize: 15,
    fontWeight: "600",
  },
  addCategoryLabel: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "600",
  },

  // ── Memory Results Section ──
  resultsSection: {
    marginBottom: 26,
  },
  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  resultsCountBadge: {
    backgroundColor: "rgba(212, 248, 44, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  resultsCountText: {
    color: "#D4F82C",
    fontSize: 12,
    fontWeight: "600",
  },
  memoriesList: {
    backgroundColor: "rgba(18, 20, 25, 0.6)",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  memoryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  memoryContentCol: {
    flex: 1,
    marginLeft: 13,
    marginRight: 10,
  },
  memoryTitle: {
    fontSize: 15.5,
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
    paddingHorizontal: 8.5,
    paddingVertical: 3,
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
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 28,
    paddingHorizontal: 20,
    backgroundColor: "rgba(18, 20, 25, 0.4)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 12,
    marginBottom: 6,
  },
  emptyStateSubtitle: {
    fontSize: 13,
    color: "#71717A",
    textAlign: "center",
    lineHeight: 18,
  },

  // ── Categories Section ──
  categoriesHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  categoriesCountText: {
    fontSize: 13,
    color: "#71717A",
    fontWeight: "500",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  bottomSpacer: {
    height: 110,
  },

  // ── Add Category Modal Styles ──
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.72)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCenteredContainer: {
    width: "100%",
    paddingHorizontal: 24,
    alignItems: "center",
  },
  modalCard: {
    width: "100%",
    maxWidth: 350,
    backgroundColor: "#181A20",
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },
  modalIconWrapper: {
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#8E8E93",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 18,
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
  modalCreateBtn: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#D4F82C",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCreateBtnDisabled: {
    opacity: 0.45,
  },
  modalCreateText: {
    color: "#0A0D02",
    fontSize: 15,
    fontWeight: "700",
  },
  floatingReorderBtn: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 104 : 92,
    right: 20,
    zIndex: 99,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  floatingReorderIconWrapper: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  manageModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "flex-end",
  },
  manageModalCard: {
    backgroundColor: "rgba(18, 22, 28, 0.96)",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    borderTopColor: "rgba(255, 255, 255, 0.28)",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 38 : 26,
    maxHeight: "85%",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 16,
  },
  modalSheetHandle: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    alignSelf: "center",
    marginBottom: 14,
  },
  manageModalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  manageModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  manageModalSubtitle: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 4,
    lineHeight: 18,
  },
  manageModalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  manageCategoriesList: {
    marginVertical: 4,
  },
  manageItemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderTopColor: "rgba(255, 255, 255, 0.18)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  manageItemRowDragging: {
    backgroundColor: "rgba(32, 38, 48, 0.98)",
    borderColor: "rgba(212, 248, 44, 0.7)",
    borderWidth: 1.5,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 16,
  },
  dragGripContainer: {
    paddingRight: 14,
    paddingLeft: 2,
    justifyContent: "center",
    alignItems: "center",
    gap: 3.5,
  },
  dragGripBar: {
    width: 20,
    height: 2.5,
    borderRadius: 1.5,
    backgroundColor: "rgba(255, 255, 255, 0.35)",
  },
  dragGripBarActive: {
    backgroundColor: "#D4F82C",
  },
  manageCategoryInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  manageCategoryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(212, 248, 44, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(212, 248, 44, 0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  manageCategoryIconContainerActive: {
    backgroundColor: "rgba(212, 248, 44, 0.22)",
    borderColor: "#D4F82C",
  },
  manageCategoryTextCol: {
    flex: 1,
  },
  manageCategoryName: {
    fontSize: 15.5,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  manageCategoryCountText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
    fontWeight: "500",
  },
  favoriteStarBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteStarBtnActive: {
    backgroundColor: "#D4F82C",
    borderColor: "#D4F82C",
  },
  manageDoneBtn: {
    height: 50,
    borderRadius: 25,
    backgroundColor: "#D4F82C",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
    shadowColor: "#D4F82C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  manageDoneText: {
    color: "#0A0D02",
    fontSize: 16,
    fontWeight: "700",
  },
});
