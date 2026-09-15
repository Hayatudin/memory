import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
} from "react-native";
import { MemoriesApi } from "../../api/memories.api";
import { useMemoryStore } from "../../store/memoryStore";
import { Memory } from "../../types/models";
import { Theme } from "../../theme/index";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";

export const MemoryDetailScreen = ({ route, navigation }: any) => {
  const { memoryId } = route.params;
  const [memory, setMemory] = useState<Memory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const { removeMemoryLocally, updateMemoryLocally } = useMemoryStore();

  const fetchDetail = async () => {
    try {
      const res = await MemoriesApi.getById(memoryId);
      if (res.data) {
        setMemory(res.data);
      }
    } catch {
      Alert.alert("Error", "Could not load memory details");
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [memoryId]);

  const handleToggleFavorite = async () => {
    if (!memory) return;
    const newFav = !memory.isFavorite;
    try {
      const res = await MemoriesApi.update(memory.id, { isFavorite: newFav });
      if (res.data) {
        setMemory(res.data);
        updateMemoryLocally(res.data);
      }
    } catch {
      Alert.alert("Error", "Could not update favorite status");
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Memory",
      "Are you sure you want to permanently delete this memory?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              await MemoriesApi.delete(memoryId);
              removeMemoryLocally(memoryId);
              navigation.goBack();
            } catch {
              Alert.alert("Error", "Failed to delete memory");
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading || !memory) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  const formattedDate = new Date(memory.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleToggleFavorite} style={styles.favButton}>
          <Text style={[styles.favIcon, memory.isFavorite && styles.favIconActive]}>
            {memory.isFavorite ? "★ Favorited" : "☆ Favorite"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.metaRow}>
        <Badge
          label={memory.sourceType.toUpperCase()}
          color={Theme.colors.surfaceElevated}
        />
        <Text style={styles.date}>{formattedDate}</Text>
      </View>

      <Text style={styles.title}>{memory.title}</Text>

      {memory.sourceUrl ? (
        <TouchableOpacity
          style={styles.sourceBox}
          onPress={() => Linking.openURL(memory.sourceUrl!)}
        >
          <Text style={styles.sourceLabel}>🔗 Source:</Text>
          <Text style={styles.sourceUrl} numberOfLines={1}>
            {memory.sourceUrl}
          </Text>
        </TouchableOpacity>
      ) : null}

      {memory.content ? (
        <View style={styles.bodyBox}>
          <Text style={styles.bodyText}>{memory.content}</Text>
        </View>
      ) : null}

      {/* Asset Attachments */}
      {memory.assets && memory.assets.length > 0 ? (
        <View style={styles.assetsSection}>
          <Text style={styles.sectionHeader}>Attachments</Text>
          {memory.assets.map((asset) => (
            <View key={asset.id} style={styles.assetContainer}>
              {asset.mimeType.startsWith("image/") ? (
                <Image
                  source={{ uri: asset.fileUrl }}
                  style={styles.fullImage}
                  resizeMode="cover"
                />
              ) : (
                <TouchableOpacity
                  style={styles.fileLink}
                  onPress={() => Linking.openURL(asset.fileUrl)}
                >
                  <Text style={styles.fileLinkText}>📎 {asset.fileName}</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      ) : null}

      {/* Tags */}
      {memory.tags && memory.tags.length > 0 ? (
        <View style={styles.tagsSection}>
          <Text style={styles.sectionHeader}>Tags</Text>
          <View style={styles.tagsRow}>
            {memory.tags.map((tag) => (
              <Badge key={tag.id} label={`#${tag.name}`} />
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.actions}>
        <Button
          title="Delete Memory"
          variant="danger"
          isLoading={isDeleting}
          onPress={handleDelete}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  content: {
    padding: Theme.spacing.md,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Theme.colors.background,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing.md,
  },
  backButton: {
    paddingVertical: 4,
  },
  backText: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.primaryLight,
  },
  favButton: {
    paddingVertical: 4,
  },
  favIcon: {
    color: Theme.colors.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },
  favIconActive: {
    color: "#FBBF24",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: Theme.spacing.xs,
  },
  date: {
    ...Theme.typography.caption,
  },
  title: {
    ...Theme.typography.h1,
    marginBottom: Theme.spacing.md,
  },
  sourceBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.md,
    gap: 6,
  },
  sourceLabel: {
    ...Theme.typography.caption,
    fontWeight: "600",
  },
  sourceUrl: {
    ...Theme.typography.caption,
    color: Theme.colors.primaryLight,
    flex: 1,
  },
  bodyBox: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  bodyText: {
    ...Theme.typography.body,
    color: Theme.colors.textPrimary,
    lineHeight: 22,
  },
  sectionHeader: {
    ...Theme.typography.h3,
    marginBottom: Theme.spacing.xs,
  },
  assetsSection: {
    marginBottom: Theme.spacing.lg,
  },
  assetContainer: {
    marginBottom: Theme.spacing.sm,
  },
  fullImage: {
    width: "100%",
    height: 240,
    borderRadius: Theme.borderRadius.lg,
  },
  fileLink: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
  },
  fileLinkText: {
    color: Theme.colors.primaryLight,
  },
  tagsSection: {
    marginBottom: Theme.spacing.xl,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  actions: {
    marginTop: Theme.spacing.md,
  },
});
