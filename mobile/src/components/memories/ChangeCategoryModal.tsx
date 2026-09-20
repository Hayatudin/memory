import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon, IconName, detectCategoryIcon } from "../common/Icon";
import { IOSGlassCircle } from "../common/IOSGlassCircle";
import { useMemoryStore } from "../../store/memoryStore";
import { Category } from "../../types/models";

interface ChangeCategoryModalProps {
  visible: boolean;
  onClose: () => void;
  memoryTitle?: string;
  currentCategoryId?: string | null;
  onSelectCategory: (category: Category) => void;
}

export const ChangeCategoryModal: React.FC<ChangeCategoryModalProps> = ({
  visible,
  onClose,
  memoryTitle,
  currentCategoryId,
  onSelectCategory,
}) => {
  const insets = useSafeAreaInsets();
  const { categories, memories } = useMemoryStore();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.sheetContent,
                { paddingBottom: Math.max(24, insets.bottom + 16) },
              ]}
            >
              {/* iOS Sheet Handle Bar */}
              <View style={styles.dragHandle} />

              {/* Sheet Header */}
              <View style={styles.headerRow}>
                <View style={styles.headerTextCol}>
                  <Text style={styles.sheetTitle}>Change Category</Text>
                  <Text style={styles.sheetSubtitle} numberOfLines={1}>
                    {memoryTitle
                      ? `Move "${memoryTitle}" to:`
                      : "Select a new category for this memory:"}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.closeBtn}
                  activeOpacity={0.7}
                  onPress={onClose}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Icon name="close" size={16} color="#8E8E93" strokeWidth={2.4} />
                </TouchableOpacity>
              </View>

              {/* Scrollable Categories List */}
              <ScrollView
                style={styles.categoriesScrollView}
                contentContainerStyle={styles.categoriesListContent}
                showsVerticalScrollIndicator={false}
              >
                {categories.map((cat) => {
                  const isCurrent = Boolean(
                    currentCategoryId &&
                      (cat.id === currentCategoryId ||
                        cat.name.toLowerCase() === currentCategoryId.toLowerCase())
                  );

                  let iconName: IconName = "folder";
                  if (cat.icon) {
                    iconName = cat.icon as IconName;
                  } else {
                    iconName = detectCategoryIcon(cat.name);
                  }

                  const memoryCount = memories.filter((m) => {
                    if (m.categoryId && m.categoryId === cat.id) return true;
                    if (
                      m.categoryName &&
                      m.categoryName.toLowerCase() === cat.name.toLowerCase()
                    ) {
                      return true;
                    }
                    return false;
                  }).length;

                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryRow,
                        isCurrent && styles.categoryRowCurrent,
                      ]}
                      activeOpacity={0.75}
                      onPress={() => {
                        onSelectCategory(cat);
                        onClose();
                      }}
                    >
                      {/* Category Icon Badge */}
                      <IOSGlassCircle
                        size={42}
                        strokeWidth={1.2}
                        fill={isCurrent ? "rgba(212, 248, 44, 0.16)" : "#1B1E26"}
                      >
                        <Icon
                          name={iconName}
                          size={18}
                          color={isCurrent ? "#D4F82C" : cat.color || "#D4F82C"}
                          strokeWidth={2}
                        />
                      </IOSGlassCircle>

                      {/* Category Details */}
                      <View style={styles.categoryInfoCol}>
                        <Text
                          style={[
                            styles.categoryNameText,
                            isCurrent && styles.categoryNameCurrent,
                          ]}
                          numberOfLines={1}
                        >
                          {cat.name}
                        </Text>
                        <Text style={styles.categoryCountText}>
                          {memoryCount} {memoryCount === 1 ? "memory" : "memories"}
                        </Text>
                      </View>

                      {/* Right Indicator: Active Check or Current Badge */}
                      {isCurrent ? (
                        <View style={styles.currentBadge}>
                          <Icon name="check" size={12} color="#000000" strokeWidth={3} />
                          <Text style={styles.currentBadgeText}>Current</Text>
                        </View>
                      ) : (
                        <View style={styles.selectArrow}>
                          <Icon name="chevron-right" size={16} color="#6B7280" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Cancel Button */}
              <TouchableOpacity
                style={styles.cancelBtn}
                activeOpacity={0.8}
                onPress={onClose}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.72)",
    justifyContent: "flex-end",
  },
  sheetContent: {
    backgroundColor: "#111318",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: "80%",
    borderTopWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 24,
  },
  dragHandle: {
    width: 38,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignSelf: "center",
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerTextCol: {
    flex: 1,
    marginRight: 12,
  },
  sheetTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  sheetSubtitle: {
    color: "#8E8E93",
    fontSize: 13,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  categoriesScrollView: {
    marginBottom: 16,
  },
  categoriesListContent: {
    gap: 8,
    paddingVertical: 4,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  categoryRowCurrent: {
    backgroundColor: "rgba(212, 248, 44, 0.08)",
    borderColor: "rgba(212, 248, 44, 0.35)",
  },
  categoryInfoCol: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  categoryNameText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  categoryNameCurrent: {
    color: "#D4F82C",
    fontWeight: "700",
  },
  categoryCountText: {
    color: "#8E8E93",
    fontSize: 12,
  },
  currentBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D4F82C",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  currentBadgeText: {
    color: "#000000",
    fontSize: 11,
    fontWeight: "700",
  },
  selectArrow: {
    padding: 4,
  },
  cancelBtn: {
    height: 48,
    borderRadius: 24,
    backgroundColor: "#1B1D24",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
