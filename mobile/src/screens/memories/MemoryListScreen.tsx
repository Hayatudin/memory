import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useMemoryStore } from "../../store/memoryStore";
import { MemoryCard } from "../../components/memories/MemoryCard";
import { Theme } from "../../theme/index";
import { MemorySourceType } from "../../types/models";

const FILTERS: { label: string; value?: MemorySourceType }[] = [
  { label: "All" },
  { label: "Notes", value: "note" },
  { label: "Web", value: "web" },
  { label: "Images", value: "image" },
  { label: "Docs", value: "document" },
];

export const MemoryListScreen = ({ navigation }: any) => {
  const { memories, isLoading, isRefreshing, fetchMemories, refreshMemories, loadMore } =
    useMemoryStore();
  const [selectedType, setSelectedType] = useState<MemorySourceType | undefined>();

  useEffect(() => {
    fetchMemories({ sourceType: selectedType });
  }, [selectedType]);

  const renderFilterItem = ({ item }: { item: typeof FILTERS[0] }) => {
    const isSelected = selectedType === item.value;
    return (
      <TouchableOpacity
        style={[
          styles.filterChip,
          isSelected && styles.filterChipSelected,
        ]}
        onPress={() => setSelectedType(item.value)}
      >
        <Text
          style={[
            styles.filterText,
            isSelected && styles.filterTextSelected,
          ]}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Memories</Text>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => navigation.navigate("SearchTab")}
        >
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Chips Bar */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTERS}
          keyExtractor={(item) => item.label}
          renderItem={renderFilterItem}
          contentContainerStyle={styles.filterList}
        />
      </View>

      {/* Main List */}
      {isLoading && memories.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={memories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MemoryCard
              memory={item}
              onPress={() =>
                navigation.navigate("MemoryDetail", { memoryId: item.id })
              }
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refreshMemories}
              tintColor={Theme.colors.primary}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📦</Text>
              <Text style={styles.emptyTitle}>No memories yet</Text>
              <Text style={styles.emptySubtitle}>
                Tap the + button below to save your first memory.
              </Text>
            </View>
          }
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("CreateTab")}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Theme.spacing.md,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.xs,
  },
  headerTitle: {
    ...Theme.typography.h1,
  },
  searchButton: {
    padding: Theme.spacing.xs,
  },
  searchIcon: {
    fontSize: 20,
  },
  filterContainer: {
    paddingVertical: Theme.spacing.sm,
  },
  filterList: {
    paddingHorizontal: Theme.spacing.md,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  filterChipSelected: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  filterText: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    fontWeight: "600",
  },
  filterTextSelected: {
    color: Theme.colors.white,
  },
  listContent: {
    padding: Theme.spacing.md,
    paddingBottom: 80,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: Theme.spacing.sm,
  },
  emptyTitle: {
    ...Theme.typography.h3,
    marginBottom: 4,
  },
  emptySubtitle: {
    ...Theme.typography.body,
    textAlign: "center",
    maxWidth: 240,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.5,
  },
  fabText: {
    fontSize: 32,
    color: Theme.colors.white,
    lineHeight: 34,
  },
});
