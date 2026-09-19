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
  Platform,
  Share,
  ActionSheetIOS,
  SafeAreaView,
  StatusBar,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import Svg, { Path, Rect, Circle } from "react-native-svg";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import { MemoriesApi } from "../../api/memories.api";
import { useMemoryStore } from "../../store/memoryStore";
import { Memory } from "../../types/models";
import { Theme } from "../../theme/index";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { IOSGlassButton } from "../../components/common/IOSGlassButton";
import { IOSGlassCapsule } from "../../components/common/IOSGlassCapsule";
import { TextMemoryComposer } from "../../components/memories/TextMemoryComposer";
import {
  ImageMemoryComposer,
  generateAIImageInsights,
} from "../../components/memories/ImageMemoryComposer";

export const MemoryDetailScreen = ({ route, navigation }: any) => {
  const { memoryId, initialData } = route.params || {};

  const buildFallbackMemory = (raw: any): Memory => ({
    id: raw?.id || memoryId,
    userId: "local-user",
    title: raw?.title || "Memory Detail",
    content: raw?.content || raw?.subtitle || "",
    type: (raw?.type as any) || (raw?.url ? "link" : "text"),
    sourceType: raw?.url ? "web" : "note",
    sourceUrl: raw?.url || null,
    categoryName: raw?.category || raw?.categoryName || "Ideas",
    isFavorite: false,
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [memory, setMemory] = useState<Memory | null>(() => {
    if (initialData) return buildFallbackMemory(initialData);
    const local = useMemoryStore.getState().memories.find((m) => m.id === memoryId);
    return local || null;
  });
  const [isLoading, setIsLoading] = useState(
    !initialData && !useMemoryStore.getState().memories.find((m) => m.id === memoryId)
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const { removeMemoryLocally, updateMemoryLocally, categories } = useMemoryStore();

  const fetchDetail = async () => {
    try {
      const res = await MemoriesApi.getById(memoryId);
      if (res.data) {
        setMemory(res.data);
      }
    } catch {
      // Look up in Zustand store if API was offline
      const local = useMemoryStore.getState().memories.find((m) => m.id === memoryId);
      if (local) {
        setMemory(local);
      } else if (initialData) {
        setMemory(buildFallbackMemory(initialData));
      } else {
        Alert.alert("Error", "Could not load memory details");
        navigation.goBack();
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [memoryId]);

  // Auto-generate AI insights if missing on an image memory
  useEffect(() => {
    if (memory?.type === "image") {
      const hasInsights = memory.metadata?.aiInsights || memory.mediaMetadata?.aiInsights;
      if (!hasInsights) {
        const generated = generateAIImageInsights(
          memory.title,
          memory.content || "",
          memory.categoryName || "Ideas"
        );
        const updated = {
          ...memory,
          metadata: { ...(memory.metadata || {}), aiInsights: generated },
        };
        setMemory(updated);
        updateMemoryLocally(updated);
        MemoriesApi.update(memory.id, { metadata: updated.metadata }).catch(() => {});
      }
    }
  }, [memory?.id, memory?.type]);

  const handleDownloadImage = async () => {
    const imgUrl = memory?.mediaUrl || memory?.sourceUrl;
    if (!imgUrl) {
      Alert.alert("No Image", "No image found to download.");
      return;
    }
    try {
      setIsDownloading(true);
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant photo library access in Settings to save images to your device."
        );
        return;
      }

      let localUri = imgUrl;
      if (imgUrl.startsWith("http://") || imgUrl.startsWith("https://")) {
        const ext = imgUrl.split(".").pop()?.split("?")[0] || "jpg";
        const dir = (FileSystem as any).cacheDirectory || (FileSystem as any).documentDirectory || "";
        const targetFile = `${dir}memory_${Date.now()}.${ext}`;
        const dlRes = await FileSystem.downloadAsync(imgUrl, targetFile);
        localUri = dlRes.uri;
      }

      await MediaLibrary.saveToLibraryAsync(localUri);
      Alert.alert("Image Saved", "Successfully saved to your Photos!");
    } catch (err: any) {
      console.warn("Download error:", err);
      try {
        await Share.share({ url: imgUrl, message: memory?.title || "Memory Photo" });
      } catch {
        Alert.alert("Download Error", "Could not save image to device.");
      }
    } finally {
      setIsDownloading(false);
    }
  };

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
      // Local fallback
      const updated = { ...memory, isFavorite: newFav };
      setMemory(updated);
      updateMemoryLocally(updated);
    }
  };

  const handleShare = async () => {
    if (!memory) return;
    const shareText = `${memory.title ? memory.title + "\n\n" : ""}${memory.content || ""}`.trim();
    if (!shareText) return;
    try {
      await Share.share({
        title: memory.title,
        message: shareText,
      });
    } catch {
      // Ignore
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
              removeMemoryLocally(memoryId);
              navigation.goBack();
            }
          },
        },
      ]
    );
  };

  const handleMoreOptions = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: "Memory Options",
          options: [
            "Cancel",
            memory?.isFavorite ? "Unfavorite" : "Favorite",
            "Share Memory",
            "Delete Memory",
          ],
          destructiveButtonIndex: 3,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            handleToggleFavorite();
          } else if (buttonIndex === 2) {
            handleShare();
          } else if (buttonIndex === 3) {
            handleDelete();
          }
        }
      );
    } else {
      Alert.alert("Memory Options", undefined, [
        { text: memory?.isFavorite ? "Unfavorite" : "Favorite", onPress: handleToggleFavorite },
        { text: "Share Memory", onPress: handleShare },
        { text: "Delete", style: "destructive", onPress: handleDelete },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  // Toggle todo checkmark from detail view
  const handleToggleTodoCheck = async (lineIdx: number) => {
    if (!memory || !memory.content) return;
    const lines = memory.content.split("\n");
    const target = lines[lineIdx];
    if (!target) return;

    if (target.startsWith("● ")) {
      lines[lineIdx] = "○ " + target.slice(2);
    } else if (target.startsWith("○ ")) {
      lines[lineIdx] = "● " + target.slice(2);
    } else if (target.startsWith("[x] ")) {
      lines[lineIdx] = "[ ] " + target.slice(4);
    } else if (target.startsWith("[ ] ")) {
      lines[lineIdx] = "[x] " + target.slice(4);
    } else {
      return;
    }

    const newContent = lines.join("\n");
    const updated = { ...memory, content: newContent };
    setMemory(updated);
    updateMemoryLocally(updated);
    try {
      await MemoriesApi.update(memory.id, { content: newContent });
    } catch {
      // Ignored, state already updated locally
    }
  };

  if (isLoading || !memory) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#C6F52C" />
      </View>
    );
  }

  // Edit Mode: mount appropriate Composer pre-populated
  if (isEditing) {
    if (memory.type === "image") {
      return (
        <SafeAreaView style={styles.fullBlack}>
          <StatusBar barStyle="light-content" />
          <ImageMemoryComposer
            initialMemory={memory}
            onBack={() => setIsEditing(false)}
            onSuccess={(updated) => {
              setMemory(updated);
              setIsEditing(false);
              updateMemoryLocally(updated);
            }}
          />
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.fullBlack}>
        <StatusBar barStyle="light-content" />
        <TextMemoryComposer
          initialMemory={memory}
          onBack={() => setIsEditing(false)}
          onSuccess={(updated) => {
            setMemory(updated);
            setIsEditing(false);
            updateMemoryLocally(updated);
          }}
        />
      </SafeAreaView>
    );
  }

  // Resolve Category Name
  const resolvedCategory = categories.find((c) => c.id === memory.categoryId);
  const categoryDisplayName =
    memory.categoryName || resolvedCategory?.name || "Ideas";

  // Dedicated Text Memory Design (Matches user sample exactly)
  if (memory.type === "text" || !memory.type) {
    const rawLines = (memory.content || "").split("\n");

    return (
      <SafeAreaView style={styles.fullBlack}>
        <StatusBar barStyle="light-content" />

        {/* Top Navigation Bar */}
        <View style={styles.topHeader}>
          {/* Back Button */}
          <IOSGlassButton size={42} onPress={() => navigation.goBack()} activeOpacity={0.75}>
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
            {/* Share & More Dual Capsule */}
            <IOSGlassCapsule
              height={42}
              borderRadius={21}
              style={styles.shareMoreCapsule}
              contentStyle={styles.shareMoreContent}
            >
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.capsuleIconBtn}
                onPress={handleShare}
              >
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 3v12M12 3l-4 4M12 3l4 4"
                    stroke="#FFFFFF"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Path
                    d="M8 8H6a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2v-9a2 2 0 00-2-2h-2"
                    stroke="#FFFFFF"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </TouchableOpacity>

              <View style={styles.verticalDivider} />

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

            {/* Brand Lime Edit Button */}
            <TouchableOpacity
              activeOpacity={0.82}
              style={styles.editLimeBtn}
              onPress={() => setIsEditing(true)}
            >
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                  stroke="#000000"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                  stroke="#000000"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={styles.editLimeBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Note Scroll Content */}
        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={styles.contentScrollInner}
          showsVerticalScrollIndicator={false}
        >
          {/* Note Title */}
          <Text style={styles.textNoteTitle}>{memory.title}</Text>

          {/* Render lines */}
          <View style={styles.linesContainer}>
            {rawLines.map((line, idx) => {
              const isCheckedTodo = line.startsWith("● ") || line.startsWith("[x] ");
              const isUncheckedTodo = line.startsWith("○ ") || line.startsWith("[ ] ");
              const isBullet = line.startsWith("• ") || line.startsWith("- ");
              const numMatch = line.match(/^(\d+)\.\s+(.*)/);

              if (isCheckedTodo) {
                const itemText = line.startsWith("● ") ? line.slice(2) : line.slice(4);
                return (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={0.7}
                    onPress={() => handleToggleTodoCheck(idx)}
                    style={styles.todoItemRow}
                  >
                    <View style={styles.todoCheckedCircle}>
                      <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M20 6L9 17l-5-5"
                          stroke="#000000"
                          strokeWidth={3.6}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Svg>
                    </View>
                    <Text style={styles.todoItemText}>{itemText}</Text>
                  </TouchableOpacity>
                );
              }

              if (isUncheckedTodo) {
                const itemText = line.startsWith("○ ") ? line.slice(2) : line.slice(4);
                return (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={0.7}
                    onPress={() => handleToggleTodoCheck(idx)}
                    style={styles.todoItemRow}
                  >
                    <View style={styles.todoUncheckedCircle} />
                    <Text style={styles.todoItemText}>{itemText}</Text>
                  </TouchableOpacity>
                );
              }

              if (isBullet) {
                const itemText = line.slice(2);
                return (
                  <View key={idx} style={styles.bulletRow}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.paragraphText}>{itemText}</Text>
                  </View>
                );
              }

              if (numMatch) {
                return (
                  <View key={idx} style={styles.bulletRow}>
                    <Text style={styles.numberPrefixText}>{numMatch[1]}.</Text>
                    <Text style={styles.paragraphText}>{numMatch[2]}</Text>
                  </View>
                );
              }

              // Normal text line
              if (!line.trim()) {
                return <View key={idx} style={styles.emptyLineSpacer} />;
              }

              return (
                <Text key={idx} style={styles.paragraphText}>
                  {line}
                </Text>
              );
            })}
          </View>
        </ScrollView>

        {/* Bottom Category Showcase (Not a button, just showcase for saved category) */}
        <View style={styles.bottomShowcaseContainer} pointerEvents="box-none">
          <IOSGlassCapsule
            height={46}
            borderRadius={23}
            style={styles.categoryShowcaseCapsule}
            contentStyle={styles.categoryShowcaseContent}
          >
            {/* 4-square grid category icon */}
            <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
              <Rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1.5" stroke="#9CA3AF" strokeWidth={2} />
              <Rect x="14" y="3.5" width="6.5" height="6.5" rx="1.5" stroke="#9CA3AF" strokeWidth={2} />
              <Rect x="3.5" y="14" width="6.5" height="6.5" rx="1.5" stroke="#9CA3AF" strokeWidth={2} />
              <Rect x="14" y="14" width="6.5" height="6.5" rx="1.5" stroke="#9CA3AF" strokeWidth={2} />
            </Svg>
            <Text style={styles.categoryShowcaseText} numberOfLines={1}>
              {categoryDisplayName}
            </Text>
          </IOSGlassCapsule>
        </View>
      </SafeAreaView>
    );
  }

  // ── Dedicated Image Memory Design (Matches user sample exactly) ──
  if (memory.type === "image") {
    const rawLines = (memory.content || "").split("\n");
    const aiInsightsText =
      memory.metadata?.aiInsights ||
      memory.mediaMetadata?.aiInsights ||
      generateAIImageInsights(memory.title, memory.content || "", categoryDisplayName);

    return (
      <SafeAreaView style={styles.fullBlack}>
        <StatusBar barStyle="light-content" />

        {/* Top Navigation Bar */}
        <View style={styles.topHeader}>
          {/* Back Button */}
          <IOSGlassButton size={42} onPress={() => navigation.goBack()} activeOpacity={0.75}>
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
            {/* Share & More Dual Capsule */}
            <IOSGlassCapsule
              height={42}
              borderRadius={21}
              style={styles.shareMoreCapsule}
              contentStyle={styles.shareMoreContent}
            >
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.capsuleIconBtn}
                onPress={handleShare}
              >
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 3v12M12 3l-4 4M12 3l4 4"
                    stroke="#FFFFFF"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Path
                    d="M8 8H6a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2v-9a2 2 0 00-2-2h-2"
                    stroke="#FFFFFF"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </TouchableOpacity>

              <View style={styles.verticalDivider} />

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

            {/* Brand Lime Edit Button */}
            <TouchableOpacity
              activeOpacity={0.82}
              style={styles.editLimeBtn}
              onPress={() => setIsEditing(true)}
            >
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                  stroke="#000000"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                  stroke="#000000"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={styles.editLimeBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Note Scroll Content */}
        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={styles.contentScrollInner}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. Inserted Image Container with Glass Overlay Capsule */}
          <View style={styles.imageOverlayContainer}>
            <Image
              source={{ uri: memory.mediaUrl || memory.sourceUrl || undefined }}
              style={styles.imageMainView}
              resizeMode="cover"
            />

            {/* Liquid Glass Overlay Pill: Download + Fullscreen with Shadow */}
            <View style={styles.imageGlassOverlayPill}>
              {/* Download Button */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleDownloadImage}
                style={styles.imageOverlayBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 6 }}
              >
                {isDownloading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M12 4v11m0 0l-4-4m4 4l4-4"
                      stroke="#FFFFFF"
                      strokeWidth={2.2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <Path
                      d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                      stroke="#FFFFFF"
                      strokeWidth={2.2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                )}
              </TouchableOpacity>

              <View style={styles.imageOverlayDivider} />

              {/* Fullscreen Button */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsFullScreen(true)}
                style={styles.imageOverlayBtn}
                hitSlop={{ top: 8, bottom: 8, left: 6, right: 8 }}
              >
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"
                    stroke="#FFFFFF"
                    strokeWidth={2.2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </TouchableOpacity>
            </View>
          </View>

          {/* 2. Text Section: Title + Notes / Checklist */}
          <Text style={styles.imageNoteTitle}>{memory.title}</Text>

          {/* Lines / Notes / Checklist */}
          {memory.content ? (
            <View style={styles.imageLinesContainer}>
              {rawLines.map((line, idx) => {
                const isCheckedTodo = line.startsWith("● ") || line.startsWith("[x] ");
                const isUncheckedTodo = line.startsWith("○ ") || line.startsWith("[ ] ");
                const isBullet = line.startsWith("• ") || line.startsWith("- ");
                const numMatch = line.match(/^(\d+)\.\s+(.*)/);

                if (isCheckedTodo) {
                  const itemText = line.startsWith("● ") ? line.slice(2) : line.slice(4);
                  return (
                    <TouchableOpacity
                      key={idx}
                      activeOpacity={0.7}
                      onPress={() => handleToggleTodoCheck(idx)}
                      style={styles.imageTodoRow}
                    >
                      <View style={styles.imageCheckBadge}>
                        <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
                          <Path
                            d="M20 6L9 17l-5-5"
                            stroke="#000000"
                            strokeWidth={3.8}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </Svg>
                      </View>
                      <Text style={styles.imageTodoText}>{itemText}</Text>
                    </TouchableOpacity>
                  );
                }

                if (isUncheckedTodo) {
                  const itemText = line.startsWith("○ ") ? line.slice(2) : line.slice(4);
                  return (
                    <TouchableOpacity
                      key={idx}
                      activeOpacity={0.7}
                      onPress={() => handleToggleTodoCheck(idx)}
                      style={styles.imageTodoRow}
                    >
                      <View style={styles.imageUncheckBadge} />
                      <Text style={styles.imageTodoText}>{itemText}</Text>
                    </TouchableOpacity>
                  );
                }

                if (isBullet) {
                  const itemText = line.slice(2);
                  return (
                    <View key={idx} style={styles.bulletRow}>
                      <Text style={styles.bulletDot}>•</Text>
                      <Text style={styles.paragraphText}>{itemText}</Text>
                    </View>
                  );
                }

                if (numMatch) {
                  return (
                    <View key={idx} style={styles.bulletRow}>
                      <Text style={styles.numberPrefixText}>{numMatch[1]}.</Text>
                      <Text style={styles.paragraphText}>{numMatch[2]}</Text>
                    </View>
                  );
                }

                if (!line.trim()) {
                  return <View key={idx} style={styles.emptyLineSpacer} />;
                }

                return (
                  <Text key={idx} style={styles.imageSubtitleText}>
                    {line}
                  </Text>
                );
              })}
            </View>
          ) : null}

          {/* 3. AI Insights Section */}
          <TouchableOpacity
            style={styles.aiInsightsCard}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate("MainTabs", {
                screen: "AI",
                params: {
                  initialQuery: aiInsightsText || memory.title || "Tell me more about this memory",
                },
              })
            }
          >
            <View style={styles.aiInsightsHeader}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 2L14.4 7.6L20 10L14.4 12.4L12 18L9.6 12.4L4 10L9.6 7.6L12 2Z"
                  fill="#D4F82C"
                />
                <Path
                  d="M19 15L20.2 17.8L23 19L20.2 20.2L19 23L17.8 20.2L15 19L17.8 17.8L19 15Z"
                  fill="#D4F82C"
                />
              </Svg>
              <Text style={styles.aiInsightsTitle}>AI Insights</Text>
            </View>
            <Text style={styles.aiInsightsBody}>{aiInsightsText}</Text>
          </TouchableOpacity>

          {/* Spacer for bottom showcase capsule */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Bottom Category Showcase */}
        <View style={styles.bottomShowcaseContainer} pointerEvents="box-none">
          <IOSGlassCapsule
            height={46}
            borderRadius={23}
            style={styles.categoryShowcaseCapsule}
            contentStyle={styles.categoryShowcaseContent}
          >
            <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
              <Rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1.5" stroke="#9CA3AF" strokeWidth={2} />
              <Rect x="14" y="3.5" width="6.5" height="6.5" rx="1.5" stroke="#9CA3AF" strokeWidth={2} />
              <Rect x="3.5" y="14" width="6.5" height="6.5" rx="1.5" stroke="#9CA3AF" strokeWidth={2} />
              <Rect x="14" y="14" width="6.5" height="6.5" rx="1.5" stroke="#9CA3AF" strokeWidth={2} />
            </Svg>
            <Text style={styles.categoryShowcaseText} numberOfLines={1}>
              {categoryDisplayName}
            </Text>
          </IOSGlassCapsule>
        </View>

        {/* Full-Screen Image Modal */}
        <Modal
          visible={isFullScreen}
          transparent
          animationType="fade"
          onRequestClose={() => setIsFullScreen(false)}
        >
          <View style={styles.fullScreenBackdrop}>
            <SafeAreaView style={styles.fullScreenHeader}>
              <IOSGlassButton size={42} onPress={() => setIsFullScreen(false)} activeOpacity={0.75}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="#FFFFFF"
                    strokeWidth={2.4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </IOSGlassButton>
            </SafeAreaView>
            <TouchableWithoutFeedback onPress={() => setIsFullScreen(false)}>
              <View style={styles.fullScreenImageWrap}>
                <Image
                  source={{ uri: memory.mediaUrl || memory.sourceUrl || undefined }}
                  style={styles.fullScreenImage}
                  resizeMode="contain"
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // Fallback for non-text memory types (link, voice)
  const formattedDate = new Date(memory.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <IOSGlassButton size={42} onPress={() => navigation.goBack()} activeOpacity={0.75}>
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
        <TouchableOpacity onPress={handleToggleFavorite} style={styles.favButton}>
          <Text style={[styles.favIcon, memory.isFavorite && styles.favIconActive]}>
            {memory.isFavorite ? "★ Favorited" : "☆ Favorite"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.metaRow}>
        <Badge
          label={(memory.type || "memory").toUpperCase()}
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

      {memory.mediaUrl ? (
        <View style={styles.assetContainer}>
          <Image source={{ uri: memory.mediaUrl }} style={styles.fullImage} resizeMode="cover" />
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
  fullBlack: {
    flex: 1,
    backgroundColor: "#000000",
  },
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
  shareMoreCapsule: {
    width: 90,
  },
  shareMoreContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
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
  verticalDivider: {
    width: 1,
    height: 18,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  editLimeBtn: {
    flexDirection: "row",
    alignItems: "center",
    height: 42,
    borderRadius: 21,
    backgroundColor: "#C6F52C",
    paddingHorizontal: 16,
    gap: 6,
    shadowColor: "#C6F52C",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  editLimeBtnText: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "700",
  },
  contentScroll: {
    flex: 1,
  },
  contentScrollInner: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 100,
  },
  textNoteTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.3,
    marginBottom: 16,
  },
  linesContainer: {
    gap: 4,
  },
  paragraphText: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 24,
    fontWeight: "400",
    marginBottom: 4,
  },
  emptyLineSpacer: {
    height: 12,
  },
  todoItemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 5,
    gap: 10,
  },
  todoCheckedCircle: {
    width: 19,
    height: 19,
    borderRadius: 9.5,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  todoUncheckedCircle: {
    width: 19,
    height: 19,
    borderRadius: 9.5,
    borderWidth: 1.8,
    borderColor: "#8E95A5",
    marginTop: 2,
  },
  todoItemText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "400",
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
    gap: 8,
  },
  bulletDot: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 22,
  },
  numberPrefixText: {
    color: "#8E95A5",
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "600",
  },
  bottomShowcaseContainer: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 24 : 16,
    right: 18,
  },
  categoryShowcaseCapsule: {
    minWidth: 116,
    paddingHorizontal: 16,
  },
  categoryShowcaseContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    gap: 8,
  },
  categoryShowcaseText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  // ── Image Memory Specific Styles ──
  imageOverlayContainer: {
    width: "100%",
    height: 260,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#16181D",
    marginBottom: 20,
  },
  imageMainView: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  imageGlassOverlayPill: {
    position: "absolute",
    bottom: 14,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(18, 22, 28, 0.78)",
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: "rgba(255, 255, 255, 0.22)",
    borderTopColor: "rgba(255, 255, 255, 0.45)",
    paddingHorizontal: 6,
    paddingVertical: 4,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 8,
  },
  imageOverlayBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  imageOverlayDivider: {
    width: 1,
    height: 18,
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    marginHorizontal: 2,
  },
  imageNoteTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.3,
    marginBottom: 14,
  },
  imageLinesContainer: {
    marginBottom: 20,
    gap: 8,
  },
  imageSubtitleText: {
    fontSize: 15,
    color: "#D1D5DB",
    lineHeight: 22,
    fontWeight: "400",
  },
  imageTodoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 3,
    gap: 10,
  },
  imageCheckBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  imageUncheckBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.8,
    borderColor: "#8E95A5",
  },
  imageTodoText: {
    flex: 1,
    fontSize: 15,
    color: "#FFFFFF",
    lineHeight: 22,
    fontWeight: "400",
  },
  aiInsightsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 18,
    marginTop: 10,
    marginBottom: 30,
  },
  aiInsightsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  aiInsightsTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#D4F82C",
  },
  aiInsightsBody: {
    fontSize: 14.5,
    color: "#9CA3AF",
    lineHeight: 22,
    marginTop: 12,
  },
  fullScreenBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.96)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenHeader: {
    position: "absolute",
    top: Platform.OS === "ios" ? 54 : 30,
    left: 20,
    zIndex: 10,
  },
  fullScreenImageWrap: {
    width: "100%",
    height: "85%",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenImage: {
    width: "100%",
    height: "100%",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
  },
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  content: {
    padding: Theme.spacing.md,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing.md,
  },
  backButton: {
    padding: Theme.spacing.xs,
  },
  backText: {
    color: Theme.colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  favButton: {
    padding: Theme.spacing.xs,
  },
  favIcon: {
    color: Theme.colors.textSecondary,
    fontSize: 16,
  },
  favIconActive: {
    color: "#FFD028",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Theme.spacing.sm,
  },
  date: {
    color: Theme.colors.textSecondary,
    fontSize: 12,
  },
  title: {
    color: Theme.colors.textPrimary,
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: Theme.spacing.md,
  },
  sourceBox: {
    flexDirection: "row",
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.sm,
    borderRadius: 8,
    marginBottom: Theme.spacing.md,
    alignItems: "center",
  },
  sourceLabel: {
    color: Theme.colors.textSecondary,
    marginRight: 6,
    fontSize: 12,
  },
  sourceUrl: {
    color: Theme.colors.primary,
    fontSize: 12,
    flex: 1,
  },
  bodyBox: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.md,
    borderRadius: 12,
    marginBottom: Theme.spacing.md,
  },
  bodyText: {
    color: Theme.colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
  assetContainer: {
    marginBottom: Theme.spacing.md,
    borderRadius: 12,
    overflow: "hidden",
  },
  fullImage: {
    width: "100%",
    height: 250,
  },
  actions: {
    marginTop: Theme.spacing.lg,
  },
});
