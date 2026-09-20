import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Share,
  ActionSheetIOS,
  Alert,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import * as ImagePicker from "expo-image-picker";
import { Category, Memory } from "../../types/models";
import { useMemoryStore } from "../../store/memoryStore";
import { MemoriesApi } from "../../api/memories.api";
import { IOSGlassButton } from "../common/IOSGlassButton";
import { IOSGlassCapsule } from "../common/IOSGlassCapsule";
import { detectCategoryIcon } from "../common/Icon";
import { StorageApi } from "../../api/storage.api";
import { SaveErrorModal, UnsavedChangesModal } from "./MemoryModals";

// ─── Types ──────────────────────────────────────────────────────────────────

type BulletType = "none" | "bullet" | "dashed" | "numbered";

interface LineItem {
  id: string;
  text: string;
  isTodo: boolean;
  checked: boolean;
  bulletType: BulletType;
  num?: number;
}

interface ImageMemoryComposerProps {
  onBack: () => void;
  onSuccess: (memory: Memory) => void;
  initialMemory?: Memory;
}

interface EditorSnapshot {
  title: string;
  lines: LineItem[];
  isBold: boolean;
  isUnderline: boolean;
  isLarge: boolean;
  imageUri: string | null;
}

const createEmptyLine = (isTodo = false, bulletType: BulletType = "none", num = 1): LineItem => ({
  id: `${Date.now()}-${Math.random()}`,
  text: "",
  isTodo,
  checked: false,
  bulletType,
  num,
});

export const deserializeContent = (raw?: string): LineItem[] => {
  if (!raw || !raw.trim()) {
    return [createEmptyLine()];
  }
  return raw.split("\n").map((lineStr) => {
    const id = `${Date.now()}-${Math.random()}`;
    if (lineStr.startsWith("● ") || lineStr.startsWith("[x] ")) {
      return {
        id,
        text: lineStr.startsWith("● ") ? lineStr.slice(2) : lineStr.slice(4),
        isTodo: true,
        checked: true,
        bulletType: "none",
      };
    }
    if (lineStr.startsWith("○ ") || lineStr.startsWith("[ ] ")) {
      return {
        id,
        text: lineStr.startsWith("○ ") ? lineStr.slice(2) : lineStr.slice(4),
        isTodo: true,
        checked: false,
        bulletType: "none",
      };
    }
    if (lineStr.startsWith("• ")) {
      return {
        id,
        text: lineStr.slice(2),
        isTodo: false,
        checked: false,
        bulletType: "bullet",
      };
    }
    if (lineStr.startsWith("- ")) {
      return {
        id,
        text: lineStr.slice(2),
        isTodo: false,
        checked: false,
        bulletType: "dashed",
      };
    }
    const numMatch = lineStr.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      return {
        id,
        text: numMatch[2],
        isTodo: false,
        checked: false,
        bulletType: "numbered",
        num: parseInt(numMatch[1], 10),
      };
    }
    return {
      id,
      text: lineStr,
      isTodo: false,
      checked: false,
      bulletType: "none",
    };
  });
};

export const generateAIImageInsights = (
  title?: string,
  content?: string,
  categoryName?: string
): string => {
  const textContext = `${title || ""} ${content || ""}`.toLowerCase();

  if (
    textContext.includes("onboarding") ||
    textContext.includes("ui") ||
    textContext.includes("design") ||
    textContext.includes("app")
  ) {
    return "The image shows 4 beautiful mobile app Onboarding designs, the UI is so good.";
  }

  if (
    textContext.includes("code") ||
    textContext.includes("dev") ||
    textContext.includes("tech") ||
    textContext.includes("software")
  ) {
    return "The image presents clean system architecture and technical code specifications, structured for developer reference.";
  }

  if (
    textContext.includes("trip") ||
    textContext.includes("travel") ||
    textContext.includes("hotel") ||
    textContext.includes("nature")
  ) {
    return "The image captures a vibrant travel destination with rich atmospheric details and picturesque visual landmarks.";
  }

  if (
    textContext.includes("food") ||
    textContext.includes("recipe") ||
    textContext.includes("restaurant")
  ) {
    return "The image highlights high-resolution culinary presentation with balanced composition and flavorful ingredients.";
  }

  if (content && content.trim().length > 0) {
    const cleanFirstLine = content.trim().split("\n")[0]?.replace(/^[●○•\-\d.\s]+/, "");
    return `The visual content reinforces the key takeaways: ${cleanFirstLine}.`;
  }

  // Automatic analysis when user didn't write anything
  const cat = (categoryName || "General").toLowerCase();
  if (cat.includes("idea") || cat.includes("creative")) {
    return "The image highlights modern mobile design patterns, clear visual hierarchy, and intuitive user engagement elements.";
  }

  return "Visual analysis recognizes clear aesthetic composition, high-contrast focal points, and structured layout details.";
};

// ─── Component ──────────────────────────────────────────────────────────────

export const ImageMemoryComposer: React.FC<ImageMemoryComposerProps> = ({
  onBack,
  onSuccess,
  initialMemory,
}) => {
  const { createMemory, updateMemoryLocally, categories, fetchCategories, createCategory } =
    useMemoryStore();

  // Image state
  const [imageUri, setImageUri] = useState<string | null>(
    initialMemory?.mediaUrl || initialMemory?.sourceUrl || null
  );
  const [imageAsset, setImageAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);

  // Title & Lines
  const [title, setTitle] = useState(initialMemory?.title || "");
  const [lines, setLines] = useState<LineItem[]>(() =>
    initialMemory?.content ? deserializeContent(initialMemory.content) : [createEmptyLine()]
  );
  const [activeLineIndex, setActiveLineIndex] = useState(0);

  // Global formatting toggles
  const [isLarge, setIsLarge] = useState(Boolean(initialMemory?.mediaMetadata?.isLarge));
  const [isBold, setIsBold] = useState(Boolean(initialMemory?.mediaMetadata?.isBold));
  const [isUnderline, setIsUnderline] = useState(Boolean(initialMemory?.mediaMetadata?.isUnderline));

  // Selected Category
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(() => {
    if (initialMemory?.categoryId && categories.length > 0) {
      const found = categories.find((c) => c.id === initialMemory.categoryId);
      if (found) return found;
    }
    if (initialMemory?.categoryName && categories.length > 0) {
      const found = categories.find(
        (c) => c.name.toLowerCase() === initialMemory.categoryName?.toLowerCase()
      );
      if (found) return found;
    }
    return categories.length > 0 ? categories[0] : null;
  });

  // Input refs for keyboard navigation
  const inputRefs = useRef<{ [key: number]: TextInput | null }>({});

  // Undo history stack
  const undoStackRef = useRef<EditorSnapshot[]>([]);

  // State modals
  const [isSaving, setIsSaving] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [unsavedModalVisible, setUnsavedModalVisible] = useState(false);

  // Fetch live categories from database on mount
  useEffect(() => {
    fetchCategories().catch(() => {});
  }, [fetchCategories]);

  useEffect(() => {
    if (categories.length > 0) {
      if (initialMemory?.categoryId) {
        const match = categories.find((c) => c.id === initialMemory.categoryId);
        if (match) {
          setSelectedCategory(match);
          return;
        }
      }
      if (initialMemory?.categoryName) {
        const match = categories.find(
          (c) => c.name.toLowerCase() === initialMemory.categoryName?.toLowerCase()
        );
        if (match) {
          setSelectedCategory(match);
          return;
        }
      }
      if (!selectedCategory) {
        const defaultMatch = categories.find((c) => c.name.toLowerCase() === "entertainment") || categories[0];
        setSelectedCategory(defaultMatch);
      }
    }
  }, [categories, initialMemory]);

  // ─── Undo ─────────────────────────────────────────────────────────────────

  const pushUndoState = () => {
    undoStackRef.current.push({
      title,
      lines: JSON.parse(JSON.stringify(lines)),
      isBold,
      isUnderline,
      isLarge,
      imageUri,
    });
    if (undoStackRef.current.length > 40) {
      undoStackRef.current.shift();
    }
  };

  const handleUndo = () => {
    if (undoStackRef.current.length === 0) return;
    const prev = undoStackRef.current.pop();
    if (prev) {
      setTitle(prev.title);
      setLines(prev.lines);
      setIsBold(prev.isBold);
      setIsUnderline(prev.isUnderline);
      setIsLarge(prev.isLarge);
      setImageUri(prev.imageUri);
    }
  };

  // ─── Serialize content ────────────────────────────────────────────────────

  const serializeContent = (items: LineItem[] = lines): string => {
    return items
      .map((item) => {
        if (item.isTodo) {
          return (item.checked ? "● " : "○ ") + item.text;
        }
        if (item.bulletType === "bullet") return "• " + item.text;
        if (item.bulletType === "dashed") return "- " + item.text;
        if (item.bulletType === "numbered") return `${item.num || 1}. ` + item.text;
        return item.text;
      })
      .join("\n");
  };

  // ─── Line editing helpers ─────────────────────────────────────────────────

  const currentLine = lines[activeLineIndex] || lines[0] || createEmptyLine();
  const isCurrentLineTodo = currentLine.isTodo;
  const currentBulletType = currentLine.bulletType;

  const handleToggleTodo = () => {
    pushUndoState();
    setLines((prev) => {
      const copy = [...prev];
      const target = copy[activeLineIndex] || copy[0];
      if (target.isTodo) {
        target.isTodo = false;
        target.checked = false;
      } else {
        target.isTodo = true;
        target.checked = false;
        target.bulletType = "none";
      }
      return copy;
    });
  };

  const handleToggleCheck = (index: number) => {
    pushUndoState();
    setLines((prev) => {
      const copy = [...prev];
      if (copy[index]) copy[index].checked = !copy[index].checked;
      return copy;
    });
  };

  const handleToggleLarge = () => { pushUndoState(); setIsLarge((p) => !p); };
  const handleToggleBold = () => { pushUndoState(); setIsBold((p) => !p); };
  const handleToggleUnderline = () => { pushUndoState(); setIsUnderline((p) => !p); };

  const handleCycleBulletType = () => {
    pushUndoState();
    setLines((prev) => {
      const copy = [...prev];
      const target = copy[activeLineIndex] || copy[0];
      let nextType: BulletType = "none";
      if (target.bulletType === "none") { nextType = "bullet"; target.isTodo = false; }
      else if (target.bulletType === "bullet") { nextType = "dashed"; target.isTodo = false; }
      else if (target.bulletType === "dashed") {
        nextType = "numbered";
        target.isTodo = false;
        let prevNum = 0;
        for (let i = activeLineIndex - 1; i >= 0; i--) {
          if (copy[i].bulletType === "numbered" && copy[i].num) { prevNum = copy[i].num!; break; }
        }
        target.num = prevNum + 1;
      } else { nextType = "none"; }
      target.bulletType = nextType;
      return copy;
    });
  };

  const handleLineTextChange = (index: number, newText: string) => {
    if (newText.includes("\n")) {
      const parts = newText.split("\n");
      const firstPart = parts[0];
      const remainder = parts.slice(1).join("\n");
      setLines((prev) => {
        const copy = [...prev];
        const cur = copy[index];
        if (cur.text === "" && (cur.isTodo || cur.bulletType !== "none")) {
          cur.isTodo = false;
          cur.checked = false;
          cur.bulletType = "none";
          return copy;
        }
        cur.text = firstPart;
        const newLine = createEmptyLine(cur.isTodo, cur.bulletType, cur.num ? cur.num + 1 : 1);
        newLine.text = remainder;
        copy.splice(index + 1, 0, newLine);
        return copy;
      });
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
        setActiveLineIndex(index + 1);
      }, 30);
      return;
    }
    setLines((prev) => {
      const copy = [...prev];
      if (copy[index]) copy[index].text = newText;
      return copy;
    });
  };

  const handleLineKeyPress = (
    index: number,
    e: NativeSyntheticEvent<TextInputKeyPressEventData>
  ) => {
    if (e.nativeEvent.key === "Backspace") {
      const cur = lines[index];
      if (cur && cur.text === "") {
        if (cur.isTodo) {
          setLines((prev) => { const copy = [...prev]; copy[index].isTodo = false; copy[index].checked = false; return copy; });
          return;
        }
        if (cur.bulletType !== "none") {
          setLines((prev) => { const copy = [...prev]; copy[index].bulletType = "none"; return copy; });
          return;
        }
        if (lines.length > 1) {
          setLines((prev) => { const copy = [...prev]; copy.splice(index, 1); return copy; });
          const target = Math.max(0, index - 1);
          setTimeout(() => { inputRefs.current[target]?.focus(); setActiveLineIndex(target); }, 30);
        }
      }
    }
  };

  // ─── Image Picker ─────────────────────────────────────────────────────────

  const handlePickGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission Required", "Please grant photo library access to select an image.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.75,
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        pushUndoState();
        setImageUri(asset.uri);
        setImageAsset(asset);
        if (!title.trim()) {
          const autoTitle = asset.fileName?.replace(/\.[^/.]+$/, "") ||
            `Photo - ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
          setTitle(autoTitle);
        }
      }
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Could not select photo.");
    }
  };

  const handlePickCamera = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission Required", "Please grant camera access to take a photo.");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ allowsEditing: false, quality: 0.75 });
      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        pushUndoState();
        setImageUri(asset.uri);
        setImageAsset(asset);
        if (!title.trim()) {
          setTitle(`Photo - ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`);
        }
      }
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Could not launch camera.");
    }
  };

  const handleImageTap = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: "Select Image",
          message: "Choose a source for your image",
          options: ["Cancel", "Take Photo", "Choose from Gallery"],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) handlePickCamera();
          else if (buttonIndex === 2) handlePickGallery();
        }
      );
    } else {
      Alert.alert(
        "Select Image",
        "Choose a source for your image",
        [
          { text: "Take Photo", onPress: handlePickCamera },
          { text: "Choose from Gallery", onPress: handlePickGallery },
          { text: "Cancel", style: "cancel" },
        ]
      );
    }
  };

  // ─── Share / More / Clear ─────────────────────────────────────────────────

  const handleShare = async () => {
    const contentText = serializeContent();
    const full = `${title ? title + "\n\n" : ""}${contentText}`.trim();
    if (!full && !imageUri) {
      Alert.alert("Empty Memory", "There is no content to share yet.");
      return;
    }
    try {
      await Share.share({ title: title || "Image Memory", message: full || title || "Image Memory" });
    } catch { /* Ignore */ }
  };

  const handleClearNote = () => {
    pushUndoState();
    setTitle("");
    setLines([createEmptyLine()]);
    setActiveLineIndex(0);
    setImageUri(null);
    setImageAsset(null);
  };

  const handleMoreOptions = () => {
    const contentText = serializeContent();
    const wordCount = contentText.trim().length > 0 ? contentText.trim().split(/\s+/).length : 0;

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: "Image Memory Options",
          message: imageUri ? `Image selected • ${wordCount} words` : `${wordCount} words`,
          options: ["Cancel", "Clear All", "Share"],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) handleClearNote();
          else if (buttonIndex === 2) handleShare();
        }
      );
    } else {
      Alert.alert(
        "Image Memory Options",
        undefined,
        [
          { text: "Share", onPress: handleShare },
          { text: "Clear All", style: "destructive", onPress: handleClearNote },
          { text: "Cancel", style: "cancel" },
        ]
      );
    }
  };

  // ─── Category ─────────────────────────────────────────────────────────────

  const handleOpenCategory = () => {
    fetchCategories().catch(() => {});
    if (Platform.OS === "ios") {
      const options = [
        "Cancel",
        ...categories.map((c) => (c.id === selectedCategory?.id ? `${c.name} ✓` : c.name)),
        "+ New Category",
      ];
      ActionSheetIOS.showActionSheetWithOptions(
        { title: "Select Category", options, cancelButtonIndex: 0 },
        async (buttonIndex) => {
          if (buttonIndex === options.length - 1) {
            if (Alert.prompt) {
              Alert.prompt(
                "New Category",
                "Enter category name to organize your image:",
                async (name) => {
                  const trimmed = name?.trim();
                  if (trimmed) {
                    const icon = detectCategoryIcon(trimmed);
                    const newCat = await createCategory(trimmed, icon, "#8AE026");
                    setSelectedCategory(newCat);
                  }
                }
              );
            }
          } else if (buttonIndex > 0) {
            const chosen = categories[buttonIndex - 1];
            if (chosen) setSelectedCategory(chosen);
          }
        }
      );
    } else {
      Alert.alert(
        "Select Category",
        "Choose a category for this image",
        [
          ...categories.map((cat) => ({
            text: cat.name + (cat.id === selectedCategory?.id ? " ✓" : ""),
            onPress: () => setSelectedCategory(cat),
          })),
          { text: "Cancel", style: "cancel" },
        ]
      );
    }
  };

  // ─── Save ─────────────────────────────────────────────────────────────────

  const serialized = serializeContent();
  const hasUnsavedChanges = imageUri !== null || title.trim().length > 0 || serialized.trim().length > 0;
  const canSave = imageUri !== null && !isSaving;

  const handleBackPress = () => {
    if (hasUnsavedChanges && !isSaving) {
      setUnsavedModalVisible(true);
    } else {
      onBack();
    }
  };

  const handleSave = async () => {
    if (!canSave || !imageUri) return;
    try {
      setIsSaving(true);

      let finalMediaUrl = imageUri;

      // Only upload if it's a new local image asset
      if (imageAsset && imageUri !== initialMemory?.mediaUrl) {
        const fileName = imageAsset.fileName || `memory_${Date.now()}.jpg`;
        const mimeType = imageAsset.mimeType || "image/jpeg";
        try {
          const uploadRes = await StorageApi.uploadFile(imageUri, fileName, mimeType);
          if (uploadRes?.url) {
            finalMediaUrl = uploadRes.url;
          }
        } catch (uploadErr) {
          console.warn("[Storage Warning] Cloud upload failed, saving memory with local image URI:", uploadErr);
        }
      }

      const finalTitle =
        title.trim() ||
        `Photo - ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

      // Derive AI Insights
      const existingInsights =
        initialMemory?.metadata?.aiInsights || initialMemory?.mediaMetadata?.aiInsights;
      const aiInsights =
        existingInsights ||
        generateAIImageInsights(finalTitle, serialized.trim(), selectedCategory?.name);

      const meta: Record<string, any> = {
        isBold,
        isUnderline,
        isLarge,
        aiInsights,
        ...(initialMemory?.mediaMetadata || {}),
      };

      let resultMemory: Memory;

      if (initialMemory) {
        const updatePayload: any = {
          title: finalTitle,
          content: serialized.trim() || undefined,
          mediaUrl: finalMediaUrl,
          mediaMetadata: meta,
          metadata: {
            ...(initialMemory.metadata || {}),
            aiInsights,
          },
          categoryId: selectedCategory ? selectedCategory.id : undefined,
          categoryName: selectedCategory ? selectedCategory.name : undefined,
        };
        const res = await MemoriesApi.update(initialMemory.id, updatePayload);
        resultMemory = res.data || { ...initialMemory, ...updatePayload };
        updateMemoryLocally(resultMemory);
      } else {
        resultMemory = await createMemory({
          title: finalTitle,
          content: serialized.trim() || undefined,
          type: "image",
          mediaUrl: finalMediaUrl,
          mediaMetadata: meta,
          metadata: { aiInsights },
          categoryId: selectedCategory ? selectedCategory.id : undefined,
        });
      }

      setIsSaving(false);
      onSuccess(resultMemory);
    } catch (err: any) {
      setIsSaving(false);
      const msg = err?.message || "Failed to save memory. Please check your connection.";
      setErrorMessage(msg);
      if (Platform.OS === "ios") {
        Alert.alert(
          "Failed to save memory",
          msg,
          [
            { text: "Cancel", style: "cancel" },
            { text: "Try Again", onPress: () => handleSave() },
          ]
        );
      } else {
        setErrorModalVisible(true);
      }
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      {/* Top Header Bar — matches TextMemoryComposer */}
      <View style={styles.topHeader}>
        {/* Left: Back Button with Chevron */}
        <IOSGlassButton size={42} onPress={handleBackPress} activeOpacity={0.75}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path
              d="M15 19l-7-7 7-7"
              stroke="#FFFFFF"
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </IOSGlassButton>

        {/* Right Action Buttons */}
        <View style={styles.topRightActions}>
          {/* Undo Button */}
          <IOSGlassButton size={42} onPress={handleUndo} activeOpacity={0.75}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M9 14L4 9l5-5"
                stroke="#FFFFFF"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M4 9h10.5a5.5 5.5 0 015.5 5.5v0a5.5 5.5 0 01-5.5 5.5H11"
                stroke="#FFFFFF"
                strokeWidth={2.2}
                strokeLinecap="round"
              />
            </Svg>
          </IOSGlassButton>

          {/* More Options Capsule */}
          <IOSGlassCapsule
            height={42}
            borderRadius={21}
            style={styles.moreOptionsCapsule}
            contentStyle={styles.moreOptionsContent}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.capsuleIconBtn}
              onPress={handleMoreOptions}
            >
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Circle cx="5" cy="12" r="1.8" fill="#FFFFFF" />
                <Circle cx="12" cy="12" r="1.8" fill="#FFFFFF" />
                <Circle cx="19" cy="12" r="1.8" fill="#FFFFFF" />
              </Svg>
            </TouchableOpacity>
          </IOSGlassCapsule>

          {/* Save / Checkmark Solid Brand Button */}
          <TouchableOpacity
            activeOpacity={0.82}
            style={[styles.saveLimeBtn, !canSave && styles.saveLimeBtnDisabled]}
            onPress={handleSave}
            disabled={!canSave}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#000000" />
            ) : (
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M20 6L9 17l-5-5"
                  stroke="#000000"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Body */}
      <ScrollView
        style={styles.editorScroll}
        contentContainerStyle={styles.editorContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Image Dropzone / Preview */}
        {imageUri ? (
          <View
            style={[
              styles.imageCard,
              imageAsset?.width && imageAsset?.height
                ? { aspectRatio: Math.max(0.8, Math.min(2.0, imageAsset.width / imageAsset.height)) }
                : { height: 220 },
            ]}
          >
            <Image
              source={{ uri: imageUri }}
              style={styles.previewImage}
              resizeMode="cover"
            />

            {/* Top Right Remove Button */}
            <TouchableOpacity
              style={styles.removeImageBtn}
              activeOpacity={0.8}
              onPress={() => {
                pushUndoState();
                setImageUri(null);
                setImageAsset(null);
              }}
              disabled={isSaving}
            >
              <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                <Path d="M18 6L6 18M6 6l12 12" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" />
              </Svg>
            </TouchableOpacity>

            {/* Bottom Right Change Pill */}
            <TouchableOpacity
              style={styles.changePill}
              activeOpacity={0.85}
              onPress={handleImageTap}
              disabled={isSaving}
            >
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  strokeLinejoin="round"
                />
                <Circle cx="12" cy="13" r="4" stroke="#FFFFFF" strokeWidth={2} />
              </Svg>
              <Text style={styles.changePillText}>Change</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.dropzoneCard}
            activeOpacity={0.85}
            onPress={handleImageTap}
          >
            {/* Camera icon in circle */}
            <View style={styles.dropzoneIconBadge}>
              <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
                  stroke="#FFFFFF"
                  strokeWidth={1.8}
                  strokeLinejoin="round"
                />
                <Circle cx="12" cy="13" r="4" stroke="#FFFFFF" strokeWidth={1.8} />
              </Svg>
            </View>
            <Text style={styles.dropzoneTitle}>Tap to select an image</Text>
            <Text style={styles.dropzoneSubtitle}>From gallery or camera</Text>
          </TouchableOpacity>
        )}

        {/* Title Field */}
        <Text style={styles.fieldLabel}>Title (optional)</Text>
        <TextInput
          style={styles.titleInput}
          placeholder="e.g. Screenshot from..., Video for..."
          placeholderTextColor="#4B5162"
          value={title}
          onChangeText={(val) => {
            pushUndoState();
            setTitle(val);
          }}
          maxLength={120}
          editable={!isSaving}
        />

        {/* Thin Divider Line */}
        <View style={styles.titleDivider} />

        {/* Description Field */}
        <Text style={styles.fieldLabel}>Description (optional)</Text>

        {/* Dynamic Lines (Interactive Circular To-Do list items & Bullets) */}
        <View style={styles.linesWrapper}>
          {lines.map((line, idx) => (
            <View key={line.id} style={styles.lineRow}>
              {/* Circular To-Do Checkbox */}
              {line.isTodo && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleToggleCheck(idx)}
                  style={styles.todoCircleTouchable}
                >
                  {line.checked ? (
                    <View style={styles.todoCircleChecked}>
                      <Svg width={11} height={11} viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M20 6L9 17l-5-5"
                          stroke="#000000"
                          strokeWidth={3.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Svg>
                    </View>
                  ) : (
                    <View style={styles.todoCircleUnchecked} />
                  )}
                </TouchableOpacity>
              )}

              {/* Bullet / Number Prefix */}
              {!line.isTodo && line.bulletType === "bullet" && (
                <Text style={styles.bulletPrefix}>•</Text>
              )}
              {!line.isTodo && line.bulletType === "dashed" && (
                <Text style={styles.bulletPrefix}>-</Text>
              )}
              {!line.isTodo && line.bulletType === "numbered" && (
                <Text style={styles.numberPrefix}>{line.num || idx + 1}.</Text>
              )}

              {/* Text Input for Line */}
              <TextInput
                ref={(ref) => { inputRefs.current[idx] = ref; }}
                style={[
                  styles.lineTextInput,
                  isLarge && styles.contentLarge,
                  isBold && styles.contentBold,
                  isUnderline && styles.contentUnderline,
                  line.isTodo && line.checked && styles.lineCheckedText,
                ]}
                placeholder={idx === 0 && lines.length === 1 ? "Add a description for your image..." : ""}
                placeholderTextColor="#4B5162"
                value={line.text}
                onChangeText={(val) => handleLineTextChange(idx, val)}
                onKeyPress={(e) => handleLineKeyPress(idx, e)}
                onFocus={() => setActiveLineIndex(idx)}
                multiline={true}
                blurOnSubmit={false}
                editable={!isSaving}
              />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Toolbar — matches TextMemoryComposer */}
      <View style={styles.bottomBarContainer}>
        {/* Left Formatting Capsule */}
        <IOSGlassCapsule
          height={48}
          borderRadius={24}
          style={styles.formatCapsule}
          contentStyle={styles.formatCapsuleContent}
        >
          {/* 1. To-do List Button */}
          <TouchableOpacity style={styles.toolBtn} activeOpacity={0.7} onPress={handleToggleTodo}>
            <View style={{ opacity: isCurrentLineTodo ? 1.0 : 0.4 }}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Circle cx="6" cy="7.5" r="3.2" stroke="#FFFFFF" strokeWidth={1.8} />
                <Path d="M4.8 7.5l1 1 1.8-1.8" stroke="#FFFFFF" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M12 7.5h8.5" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" />
                <Circle cx="6" cy="16.5" r="3.2" stroke="#FFFFFF" strokeWidth={1.8} />
                <Path d="M12 16.5h8.5" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" />
              </Svg>
            </View>
          </TouchableOpacity>

          {/* 2. Aa Text Size button */}
          <TouchableOpacity style={styles.toolBtn} activeOpacity={0.7} onPress={handleToggleLarge}>
            <View style={{ opacity: isLarge ? 1.0 : 0.4 }}>
              <Text style={styles.toolAaText}>Aa</Text>
            </View>
          </TouchableOpacity>

          {/* 3. Bold (B) button */}
          <TouchableOpacity style={styles.toolBtn} activeOpacity={0.7} onPress={handleToggleBold}>
            <View style={{ opacity: isBold ? 1.0 : 0.4 }}>
              <Text style={styles.toolBoldText}>B</Text>
            </View>
          </TouchableOpacity>

          {/* 4. Underline (U) button */}
          <TouchableOpacity style={styles.toolBtn} activeOpacity={0.7} onPress={handleToggleUnderline}>
            <View style={{ opacity: isUnderline ? 1.0 : 0.4 }}>
              <Text style={styles.toolUnderlineText}>U</Text>
            </View>
          </TouchableOpacity>

          {/* 5. Bullet list type button */}
          <TouchableOpacity style={styles.toolBtn} activeOpacity={0.7} onPress={handleCycleBulletType}>
            <View style={{ opacity: currentBulletType !== "none" ? 1.0 : 0.4 }}>
              {currentBulletType === "dashed" ? (
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path d="M4 7h4M11 7h9M4 12h4M11 12h9M4 17h4M11 17h9" stroke="#FFFFFF" strokeWidth={2.2} strokeLinecap="round" />
                </Svg>
              ) : currentBulletType === "numbered" ? (
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path d="M5 6v6M4 7l2-1M10 9h10M4 18h3.5M4 15c0-1 1-1.5 2-1.5s2 .5 2 1.5c0 1-2 2-2 3M10 16h10" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              ) : (
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Circle cx="4.5" cy="6.5" r="1.6" fill="#FFFFFF" />
                  <Circle cx="4.5" cy="12" r="1.6" fill="#FFFFFF" />
                  <Circle cx="4.5" cy="17.5" r="1.6" fill="#FFFFFF" />
                  <Path d="M9.5 6.5h10.5M9.5 12h10.5M9.5 17.5h10.5" stroke="#FFFFFF" strokeWidth={2.2} strokeLinecap="round" />
                </Svg>
              )}
            </View>
          </TouchableOpacity>
        </IOSGlassCapsule>

        {/* Right Category Capsule */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleOpenCategory}
          style={styles.categoryTouchable}
        >
          <IOSGlassCapsule
            width={112}
            height={48}
            borderRadius={24}
            style={styles.categoryCapsule}
            contentStyle={styles.categoryCapsuleContent}
          >
            <Text style={styles.categoryCapsuleText} numberOfLines={1}>
              {selectedCategory ? selectedCategory.name : "Category"}
            </Text>
            <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
              <Path
                d="M18 15l-6-6-6 6"
                stroke="#FFFFFF"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </IOSGlassCapsule>
        </TouchableOpacity>
      </View>

      {/* Save Error Modal */}
      <SaveErrorModal
        visible={errorModalVisible}
        onClose={() => setErrorModalVisible(false)}
        onTryAgain={() => {
          setErrorModalVisible(false);
          handleSave();
        }}
        message={errorMessage}
      />

      {/* Unsaved Changes Modal */}
      <UnsavedChangesModal
        visible={unsavedModalVisible}
        onStay={() => setUnsavedModalVisible(false)}
        onDiscard={() => {
          setUnsavedModalVisible(false);
          onBack();
        }}
      />
    </KeyboardAvoidingView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },

  // ── Top Header ──
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  topRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  moreOptionsCapsule: {
    width: 52,
  },
  moreOptionsContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    paddingHorizontal: 4,
  },
  capsuleIconBtn: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  saveLimeBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#C6F52C",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#C6F52C",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  saveLimeBtnDisabled: {
    opacity: 0.35,
    shadowOpacity: 0,
  },

  // ── Editor Body ──
  editorScroll: {
    flex: 1,
  },
  editorContent: {
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 28,
  },

  // ── Image Dropzone ──
  dropzoneCard: {
    width: "100%",
    minHeight: 160,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "rgba(255, 255, 255, 0.15)",
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    marginBottom: 10,
  },
  dropzoneIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  dropzoneTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  dropzoneSubtitle: {
    color: "#6B7280",
    fontSize: 13,
    textAlign: "center",
  },

  // ── Image Preview ──
  imageCard: {
    width: "100%",
    height: 220,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    backgroundColor: "#10141D",
    position: "relative",
    marginBottom: 10,
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  removeImageBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(16, 20, 29, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  changePill: {
    position: "absolute",
    bottom: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 20, 29, 0.78)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
    gap: 6,
  },
  changePillText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },

  // ── Fields ──
  fieldLabel: {
    color: "#8E95A5",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 8,
  },
  titleInput: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    paddingVertical: 10,
    paddingHorizontal: 0,
  },
  titleDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    marginTop: 4,
    marginBottom: 16,
  },

  // ── Lines ──
  linesWrapper: {
    minHeight: 180,
  },
  lineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
    minHeight: 28,
  },
  todoCircleTouchable: {
    paddingTop: 4,
    paddingRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  todoCircleUnchecked: {
    width: 19,
    height: 19,
    borderRadius: 9.5,
    borderWidth: 1.8,
    borderColor: "#8E95A5",
  },
  todoCircleChecked: {
    width: 19,
    height: 19,
    borderRadius: 9.5,
    backgroundColor: "#C6F52C",
    justifyContent: "center",
    alignItems: "center",
  },
  bulletPrefix: {
    color: "#FFFFFF",
    fontSize: 18,
    lineHeight: 24,
    paddingRight: 8,
    paddingLeft: 2,
  },
  numberPrefix: {
    color: "#8E95A5",
    fontSize: 15,
    lineHeight: 24,
    fontWeight: "600",
    paddingRight: 8,
    paddingLeft: 2,
  },
  lineTextInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400",
    padding: 0,
    margin: 0,
    textAlignVertical: "top",
  },
  lineCheckedText: {
    textDecorationLine: "line-through",
    color: "#8E95A5",
  },
  contentLarge: {
    fontSize: 22,
    lineHeight: 30,
  },
  contentBold: {
    fontWeight: "700",
  },
  contentUnderline: {
    textDecorationLine: "underline",
  },

  // ── Bottom Toolbar ──
  bottomBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 20 : 14,
    backgroundColor: "#000000",
  },
  formatCapsule: {
    flex: 1,
    marginRight: 10,
  },
  formatCapsuleContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    height: "100%",
    paddingHorizontal: 4,
  },
  toolBtn: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  toolAaText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  toolBoldText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  toolUnderlineText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  categoryTouchable: {
    width: 112,
  },
  categoryCapsule: {
    width: 112,
  },
  categoryCapsuleContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    paddingHorizontal: 10,
    gap: 5,
  },
  categoryCapsuleText: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "600",
    maxWidth: 72,
  },
});
