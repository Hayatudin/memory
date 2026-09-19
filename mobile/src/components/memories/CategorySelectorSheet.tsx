import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import { Icon, IconName, detectCategoryIcon } from "../common/Icon";
import { Category } from "../../types/models";
import { useMemoryStore } from "../../store/memoryStore";

interface CategorySelectorSheetProps {
  visible: boolean;
  onClose: () => void;
  selectedCategoryId: string | null;
  onSelectCategory: (category: Category) => void;
}

export const CategorySelectorSheet: React.FC<CategorySelectorSheetProps> = ({
  visible,
  onClose,
  selectedCategoryId,
  onSelectCategory,
}) => {
  const { categories, fetchCategories, createCategory, isLoadingCategories } =
    useMemoryStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [isSavingNew, setIsSavingNew] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchCategories();
      setIsCreating(false);
      setNewCatName("");
      setSearchQuery("");
    }
  }, [visible, fetchCategories]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase().trim();
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, searchQuery]);

  const handleCreateCategory = async () => {
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    try {
      setIsSavingNew(true);
      const icon = detectCategoryIcon(trimmed);
      const newCat = await createCategory(trimmed, icon, "#8AE026");
      setIsSavingNew(false);
      setIsCreating(false);
      setNewCatName("");
      onSelectCategory(newCat);
      onClose();
    } catch {
      setIsSavingNew(false);
    }
  };

  const getCategoryIcon = (cat: Category): IconName => {
    if (cat.icon) return cat.icon as IconName;
    return detectCategoryIcon(cat.name);
  };

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
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={styles.sheetContainer}
            >
              {/* iOS Pull Handle */}
              <View style={styles.handleContainer}>
                <View style={styles.handleBar} />
              </View>

              {/* Header Title */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Select Category</Text>
              </View>

              {/* Search Bar */}
              <View style={styles.searchBar}>
                <Icon name="search" size={18} color="#7E8494" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search categories..."
                  placeholderTextColor="#6B7280"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  clearButtonMode="while-editing"
                />
              </View>

              {/* Inline Create Category Form (if active) */}
              {isCreating && (
                <View style={styles.createBox}>
                  <Text style={styles.createTitle}>New Category</Text>
                  <View style={styles.createInputRow}>
                    <TextInput
                      style={styles.createInput}
                      placeholder="Category name (e.g. Travel)"
                      placeholderTextColor="#6B7280"
                      value={newCatName}
                      onChangeText={setNewCatName}
                      autoFocus
                    />
                    <TouchableOpacity
                      style={[
                        styles.createConfirmBtn,
                        !newCatName.trim() && styles.disabledBtn,
                      ]}
                      onPress={handleCreateCategory}
                      disabled={!newCatName.trim() || isSavingNew}
                    >
                      {isSavingNew ? (
                        <ActivityIndicator size="small" color="#000000" />
                      ) : (
                        <Text style={styles.createConfirmText}>Add</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={styles.createCancelBtn}
                    onPress={() => setIsCreating(false)}
                  >
                    <Text style={styles.createCancelText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Grouped Category Card Container */}
              <ScrollView
                style={styles.listScroll}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              >
                {isLoadingCategories && categories.length === 0 ? (
                  <View style={styles.loadingBox}>
                    <ActivityIndicator size="small" color="#8AE026" />
                    <Text style={styles.loadingText}>Loading categories...</Text>
                  </View>
                ) : (
                  <View style={styles.categoriesCardBox}>
                    {filteredCategories.map((cat, index) => {
                      const isSelected = selectedCategoryId === cat.id;
                      const isLast = index === filteredCategories.length - 1;
                      const iconName = getCategoryIcon(cat);

                      return (
                        <React.Fragment key={cat.id}>
                          <TouchableOpacity
                            style={styles.categoryRow}
                            activeOpacity={0.7}
                            onPress={() => {
                              onSelectCategory(cat);
                              onClose();
                            }}
                          >
                            {/* Circular Green Icon Badge */}
                            <View style={styles.circleIconBadge}>
                              <Icon
                                name={iconName}
                                size={19}
                                color="#8AE026"
                                strokeWidth={2.2}
                              />
                            </View>

                            {/* Category Name */}
                            <Text style={styles.categoryName} numberOfLines={1}>
                              {cat.name}
                            </Text>

                            {/* Selection Checkmark */}
                            {isSelected && (
                              <View style={styles.checkCircle}>
                                <Icon
                                  name="check"
                                  size={13}
                                  color="#000000"
                                  strokeWidth={3}
                                />
                              </View>
                            )}
                          </TouchableOpacity>

                          {!isLast && <View style={styles.rowDivider} />}
                        </React.Fragment>
                      );
                    })}

                    {filteredCategories.length === 0 && (
                      <View style={styles.emptyBox}>
                        <Text style={styles.emptyText}>No categories found</Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Create New Category Link */}
                {!isCreating && (
                  <TouchableOpacity
                    style={styles.createNewRow}
                    activeOpacity={0.75}
                    onPress={() => setIsCreating(true)}
                  >
                    <Icon name="plus" size={16} color="#8AE026" strokeWidth={2.4} />
                    <Text style={styles.createNewText}>Create new category</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>

              {/* Bottom Cancel Pill */}
              <TouchableOpacity
                style={styles.cancelButton}
                activeOpacity={0.8}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.78)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: "#0B0E14",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: "88%",
    minHeight: 460,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 36 : 24,
    borderTopWidth: 1,
    borderColor: "#1E2432",
  },
  handleContainer: {
    alignItems: "center",
    paddingVertical: 8,
  },
  handleBar: {
    width: 38,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: "#2B303E",
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#11151F",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1C212E",
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 16,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    padding: 0,
  },
  listScroll: {
    maxHeight: 380,
  },
  listContent: {
    paddingBottom: 14,
  },
  categoriesCardBox: {
    backgroundColor: "#10141D",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#1C2230",
    overflow: "hidden",
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  circleIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(138, 224, 38, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(138, 224, 38, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  categoryName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#8AE026",
    justifyContent: "center",
    alignItems: "center",
  },
  rowDivider: {
    height: 1,
    backgroundColor: "#191E2B",
    marginLeft: 70,
  },
  emptyBox: {
    paddingVertical: 24,
    alignItems: "center",
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 14,
  },
  loadingBox: {
    paddingVertical: 30,
    alignItems: "center",
    gap: 10,
  },
  loadingText: {
    color: "#8E95A5",
    fontSize: 14,
  },
  createNewRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginTop: 8,
    gap: 8,
  },
  createNewText: {
    color: "#8AE026",
    fontSize: 15,
    fontWeight: "600",
  },
  createBox: {
    backgroundColor: "#121622",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#222738",
    padding: 14,
    marginBottom: 14,
  },
  createTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  createInputRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
  createInput: {
    flex: 1,
    backgroundColor: "#0B0E14",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#242938",
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: "#FFFFFF",
    fontSize: 14,
  },
  createConfirmBtn: {
    backgroundColor: "#8AE026",
    borderRadius: 12,
    paddingHorizontal: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  createConfirmText: {
    color: "#000000",
    fontWeight: "700",
    fontSize: 14,
  },
  disabledBtn: {
    opacity: 0.45,
  },
  createCancelBtn: {
    alignSelf: "flex-end",
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  createCancelText: {
    color: "#8E95A5",
    fontSize: 13,
  },
  cancelButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: "#11151F",
    borderWidth: 1,
    borderColor: "#1E2432",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  cancelButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
