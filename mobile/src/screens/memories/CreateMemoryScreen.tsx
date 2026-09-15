import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import { MemoriesApi } from "../../api/memories.api";
import { StorageApi } from "../../api/storage.api";
import { useMemoryStore } from "../../store/memoryStore";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { Theme } from "../../theme/index";
import { MemorySourceType } from "../../types/models";

export const CreateMemoryScreen = ({ navigation }: any) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceType, setSourceType] = useState<MemorySourceType>("note");
  const [tagsInput, setTagsInput] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addMemoryLocally } = useMemoryStore();

  const handlePickImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: "photo",
        quality: 0.8,
      });

      if (result.assets && result.assets.length > 0) {
        setSelectedAsset(result.assets[0]);
        setSourceType("image");
      }
    } catch (e) {
      console.error("Failed to pick image:", e);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please provide a title for your memory.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Parse tags
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      // 2. Create memory record in MySQL
      const response = await MemoriesApi.create({
        title: title.trim(),
        content: content.trim() || undefined,
        sourceUrl: sourceUrl.trim() || undefined,
        sourceType,
        tags: tags.length > 0 ? tags : undefined,
      });

      const newMemory = response.data;
      if (!newMemory) {
        throw new Error("Failed to create memory");
      }

      // 3. If an image was selected, execute presigned upload to external storage
      if (selectedAsset && selectedAsset.uri) {
        try {
          const fileName = selectedAsset.fileName || `photo_${Date.now()}.jpg`;
          const mimeType = selectedAsset.type || "image/jpeg";

          // Step A: Request presigned URL from backend
          const presigned = await StorageApi.getPresignedUrl(fileName, mimeType, selectedAsset.fileSize);

          // Step B: Upload file binary directly to external storage (S3/R2)
          const blobResponse = await fetch(selectedAsset.uri);
          const blob = await blobResponse.blob();
          await StorageApi.uploadDirectToStorage(presigned.uploadUrl, blob, mimeType);

          // Step C: Attach asset reference to the created memory
          await StorageApi.attachAsset({
            memoryId: newMemory.id,
            storageKey: presigned.storageKey,
            fileUrl: presigned.fileUrl,
            fileName,
            mimeType,
            fileSizeBytes: selectedAsset.fileSize,
          });
        } catch (uploadError) {
          console.warn("Image upload failed, memory saved without attachment:", uploadError);
        }
      }

      addMemoryLocally(newMemory);

      // Reset form
      setTitle("");
      setContent("");
      setSourceUrl("");
      setTagsInput("");
      setSelectedAsset(null);

      navigation.navigate("MemoriesTab");
    } catch (error: any) {
      Alert.alert(
        "Save Failed",
        error.response?.data?.error?.message || error.message || "Failed to save memory"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.headerTitle}>New Memory</Text>

        <Input
          label="Title *"
          placeholder="What would you like to remember?"
          value={title}
          onChangeText={setTitle}
        />

        <Input
          label="Notes / Summary"
          placeholder="Details, thoughts, key points..."
          multiline
          numberOfLines={4}
          style={styles.textArea}
          value={content}
          onChangeText={setContent}
        />

        <Input
          label="Source URL (Optional)"
          placeholder="https://..."
          keyboardType="url"
          autoCapitalize="none"
          value={sourceUrl}
          onChangeText={setSourceUrl}
        />

        <Input
          label="Tags (Comma-separated)"
          placeholder="work, ideas, recipes"
          autoCapitalize="none"
          value={tagsInput}
          onChangeText={setTagsInput}
        />

        {/* Source Type Selector */}
        <Text style={styles.sectionLabel}>Source Type</Text>
        <View style={styles.typeRow}>
          {(["note", "web", "image", "document"] as MemorySourceType[]).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeChip,
                sourceType === type && styles.typeChipSelected,
              ]}
              onPress={() => setSourceType(type)}
            >
              <Text
                style={[
                  styles.typeChipText,
                  sourceType === type && styles.typeChipTextSelected,
                ]}
              >
                {type.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Media Attachment */}
        <Text style={styles.sectionLabel}>Attachment</Text>
        {selectedAsset ? (
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{ uri: selectedAsset.uri }}
              style={styles.imagePreview}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => setSelectedAsset(null)}
            >
              <Text style={styles.removeImageText}>✕ Remove</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.uploadBox} onPress={handlePickImage}>
            <Text style={styles.uploadIcon}>📷</Text>
            <Text style={styles.uploadText}>Attach an image or photo</Text>
          </TouchableOpacity>
        )}

        <Button
          title="Save Memory"
          onPress={handleSave}
          isLoading={isSubmitting}
          style={styles.saveButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  container: {
    padding: Theme.spacing.md,
    paddingBottom: 40,
  },
  headerTitle: {
    ...Theme.typography.h1,
    marginBottom: Theme.spacing.lg,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: Theme.spacing.sm,
  },
  sectionLabel: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.xs,
    fontWeight: "600",
  },
  typeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: Theme.spacing.md,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  typeChipSelected: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: Theme.colors.textSecondary,
  },
  typeChipTextSelected: {
    color: Theme.colors.white,
  },
  uploadBox: {
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderStyle: "dashed",
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Theme.colors.surface,
    marginBottom: Theme.spacing.lg,
  },
  uploadIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  uploadText: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
  },
  imagePreviewContainer: {
    marginBottom: Theme.spacing.lg,
  },
  imagePreview: {
    width: "100%",
    height: 180,
    borderRadius: Theme.borderRadius.lg,
  },
  removeImageButton: {
    marginTop: Theme.spacing.xs,
    alignSelf: "flex-end",
  },
  removeImageText: {
    color: Theme.colors.danger,
    fontSize: 13,
  },
  saveButton: {
    marginTop: Theme.spacing.sm,
  },
});
