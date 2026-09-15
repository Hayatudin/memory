import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
} from "react-native";
import { Theme } from "../../theme/index";
import { Icon, IconName } from "../../components/common/Icon";

interface CategoryItem {
  id: string;
  name: string;
  count: number;
  icon: IconName;
}

const INITIAL_CATEGORIES: CategoryItem[] = [
  { id: "1", name: "Entertainment", count: 0, icon: "tv" },
  { id: "2", name: "Ideas", count: 0, icon: "lightbulb" },
  { id: "3", name: "Music", count: 0, icon: "music" },
  { id: "4", name: "Tech", count: 0, icon: "tech" },
  { id: "5", name: "Books", count: 0, icon: "book" },
  { id: "6", name: "Resources", count: 0, icon: "link" },
];

export const SearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = INITIAL_CATEGORIES.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.background} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.screenTitle}>Search</Text>

        {/* Search and Add Category Row */}
        <View style={styles.searchRow}>
          <View style={styles.searchInputWrapper}>
            <Icon name="search" size={16} color={Theme.colors.textMuted} />
            <TextInput
              placeholder="Search your memories..."
              placeholderTextColor={Theme.colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />
          </View>

          <TouchableOpacity
            style={styles.addCategoryBtn}
            activeOpacity={0.8}
            onPress={() => {}}
          >
            <Text style={styles.addCategoryText}>+ Add Category</Text>
          </TouchableOpacity>
        </View>

        {/* 2-Column Grid of Category Cards */}
        <View style={styles.categoryGrid}>
          {filteredCategories.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.categoryCard}
              activeOpacity={0.85}
              onPress={() => {}}
            >
              {/* Layered 3D Folder Icon */}
              <View style={styles.folderIconContainer}>
                {/* Back Layer */}
                <View style={styles.folderBackLayer} />
                {/* Front Layer */}
                <View style={styles.folderFrontLayer}>
                  <Icon name={item.icon} size={18} color="#FFFFFF" strokeWidth={2.2} />
                </View>
              </View>

              {/* Title and Count */}
              <View style={styles.cardInfo}>
                <Text style={styles.categoryTitle}>{item.name}</Text>
                <Text style={styles.categoryCount}>{item.count} Items</Text>
              </View>

              {/* Corner Notch with Diagonal Arrow */}
              <View style={styles.cornerNotchContainer}>
                <View style={styles.notchCutout}>
                  <View style={styles.arrowButton}>
                    <Icon
                      name="arrow-up-right"
                      size={14}
                      color={Theme.colors.textPrimary}
                      strokeWidth={2.4}
                    />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom Spacer for floating bottom bar */}
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
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  searchInputWrapper: {
    flex: 1,
    height: 44,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.full,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: Theme.colors.textPrimary,
    fontSize: 13,
    paddingVertical: 0,
  },
  addCategoryBtn: {
    height: 44,
    backgroundColor: Theme.colors.surfacePill,
    borderRadius: Theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  addCategoryText: {
    color: Theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: "500",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryCard: {
    width: "48%",
    height: 180,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    position: "relative",
    justifyContent: "space-between",
  },
  folderIconContainer: {
    width: 48,
    height: 48,
    position: "relative",
  },
  folderBackLayer: {
    position: "absolute",
    top: 0,
    left: 8,
    width: 40,
    height: 38,
    borderRadius: 8,
    backgroundColor: "#739912",
  },
  folderFrontLayer: {
    position: "absolute",
    top: 4,
    left: 0,
    width: 42,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#8EB818",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  cardInfo: {
    marginTop: 16,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Theme.colors.textPrimary,
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
  },
  cornerNotchContainer: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 44,
    height: 44,
  },
  notchCutout: {
    width: "100%",
    height: "100%",
    backgroundColor: Theme.colors.background,
    borderTopLeftRadius: 16,
    borderBottomRightRadius: Theme.borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Theme.colors.surfacePill,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomSpacer: {
    height: 100,
  },
});
