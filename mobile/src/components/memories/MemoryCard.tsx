import React from "react";
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Image,
} from "react-native";
import { Memory } from "../../types/models";
import { Theme } from "../../theme/index";
import { Badge } from "../common/Badge";

interface MemoryCardProps {
  memory: Memory;
  onPress: () => void;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({ memory, onPress }) => {
  const firstImage = memory.assets?.find((a) =>
    a.mimeType.startsWith("image/")
  );

  const formattedDate = new Date(memory.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <Badge
            label={memory.sourceType.toUpperCase()}
            color={
              memory.sourceType === "web"
                ? "#0284C7"
                : memory.sourceType === "image"
                ? "#7C3AED"
                : Theme.colors.surfaceElevated
            }
          />
          {memory.isFavorite && <Text style={styles.favIcon}>★</Text>}
        </View>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {memory.title}
      </Text>

      {memory.content ? (
        <Text style={styles.content} numberOfLines={3}>
          {memory.content}
        </Text>
      ) : null}

      {firstImage ? (
        <Image
          source={{ uri: firstImage.fileUrl }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
      ) : null}

      {memory.tags && memory.tags.length > 0 ? (
        <View style={styles.tagsRow}>
          {memory.tags.slice(0, 3).map((tag) => (
            <Text key={tag.id} style={styles.tagText}>
              #{tag.name}
            </Text>
          ))}
          {memory.tags.length > 3 && (
            <Text style={styles.tagText}>+{memory.tags.length - 3}</Text>
          )}
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing.xs,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  favIcon: {
    color: "#FBBF24",
    fontSize: 16,
  },
  date: {
    ...Theme.typography.caption,
  },
  title: {
    ...Theme.typography.h3,
    marginBottom: 4,
  },
  content: {
    ...Theme.typography.body,
    marginBottom: Theme.spacing.xs,
  },
  thumbnail: {
    width: "100%",
    height: 140,
    borderRadius: Theme.borderRadius.md,
    marginVertical: Theme.spacing.sm,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: Theme.spacing.xs,
  },
  tagText: {
    ...Theme.typography.caption,
    color: Theme.colors.primaryLight,
  },
});
