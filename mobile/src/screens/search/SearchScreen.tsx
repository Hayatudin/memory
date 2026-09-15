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
import { Icon, IconName } from "../../components/common/Icon";
import { IOSGlassCapsule } from "../../components/common/IOSGlassCapsule";
import { NotchedCategoryCard } from "../../components/common/NotchedCategoryCard";

interface CategoryItem {
  id: string;
  name: string;
  count: number;
  icon: IconName;
}

const INITIAL_CATEGORIES: CategoryItem[] = [
  { id: "1", name: "Entertainment", count: 0, icon: "video" },
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
              />
            </IOSGlassCapsule>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {}}
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

        {/* 2-Column Grid of Custom Notched Category Cards */}
        <View style={styles.categoryGrid}>
          {filteredCategories.map((item) => (
            <NotchedCategoryCard
              key={item.id}
              id={item.id}
              name={item.name}
              count={item.count}
              icon={item.icon}
              onPress={() => {}}
            />
          ))}
        </View>

        {/* Bottom Spacer for floating bottom navigation bar */}
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
    fontSize: 30,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 20,
    letterSpacing: -0.4,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
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
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  bottomSpacer: {
    height: 110,
  },
});
