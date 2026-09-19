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
  Switch,
  Alert,
  ActionSheetIOS,
  SafeAreaView,
  StatusBar,
} from "react-native";
import Svg, { Path, Rect, Circle } from "react-native-svg";
import * as Clipboard from "expo-clipboard";
import { Category, Memory, LinkPreviewData } from "../../types/models";
import { useMemoryStore } from "../../store/memoryStore";
import { MemoriesApi } from "../../api/memories.api";
import { IOSGlassButton } from "../common/IOSGlassButton";
import { IOSGlassCapsule } from "../common/IOSGlassCapsule";
import { detectCategoryIcon } from "../common/Icon";
import { SaveErrorModal, UnsavedChangesModal } from "./MemoryModals";

interface LinkMemoryComposerProps {
  onBack: () => void;
  onSuccess: (memory: Memory) => void;
  initialMemory?: Memory | null;
}

export const LinkMemoryComposer: React.FC<LinkMemoryComposerProps> = ({
  onBack,
  onSuccess,
  initialMemory,
}) => {
  const { createMemory, updateMemory, categories, fetchCategories, createCategory } = useMemoryStore();

  const [url, setUrl] = useState(initialMemory?.sourceUrl || "");
  const [title, setTitle] = useState(initialMemory?.title || "");
  const [content, setContent] = useState(initialMemory?.content || "");
  
  // Auto-fetch preview is OFF by default per user request
  const [autoFetchEnabled, setAutoFetchEnabled] = useState(false);
  const [preview, setPreview] = useState<LinkPreviewData | null>(
    initialMemory?.metadata?.url
      ? {
          url: initialMemory.metadata.url,
          title: initialMemory.metadata.title || initialMemory.title,
          description: initialMemory.metadata.description || initialMemory.content || "",
          image: initialMemory.metadata.image || null,
          siteName: initialMemory.metadata.siteName || "",
        }
      : null
  );
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  // Load real categories from database on mount
  useEffect(() => {
    fetchCategories().catch(() => {});
  }, [fetchCategories]);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(() => {
    if (initialMemory?.categoryId) {
      const match = categories.find((c) => c.id === initialMemory.categoryId);
      if (match) return match;
    }
    return categories.length > 0 ? categories[0] : null;
  });

  useEffect(() => {
    if (!selectedCategory && categories.length > 0) {
      const match =
        categories.find((c) => c.name.toLowerCase().includes("tech")) ||
        categories.find((c) => c.name.toLowerCase().includes("resource")) ||
        categories[0];
      setSelectedCategory(match);
    }
  }, [categories, selectedCategory]);

  const [isSaving, setIsSaving] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [unsavedModalVisible, setUnsavedModalVisible] = useState(false);

  const debounceTimer = useRef<any>(null);

  const isValidUrl = (testUrl: string): boolean => {
    const trimmed = testUrl.trim();
    if (trimmed.length < 3) return false;
    try {
      const formatted = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
      const parsed = new URL(formatted);
      return parsed.hostname.includes(".") && parsed.hostname.length > 3;
    } catch {
      return false;
    }
  };

  const getCleanHostname = (testUrl: string): string => {
    try {
      const formatted = testUrl.startsWith("http") ? testUrl : `https://${testUrl}`;
      const parsed = new URL(formatted);
      return parsed.hostname.replace(/^www\./, "");
    } catch {
      return testUrl;
    }
  };

  const fetchPreview = async (inputUrl: string) => {
    const trimmed = inputUrl.trim();
    if (!isValidUrl(trimmed)) {
      setIsLoadingPreview(false);
      return;
    }

    try {
      setIsLoadingPreview(true);
      setImageFailed(false);
      const formatted = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
      const fallbackHost = getCleanHostname(formatted);
      const fallbackTitle = fallbackHost.charAt(0).toUpperCase() + fallbackHost.slice(1);
      const defaultIconUrl = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(formatted)}&size=128`;

      let fetchedData: LinkPreviewData | null = null;

      // 1. Try server preview endpoint with short 3s timeout
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        const res = await MemoriesApi.getLinkPreview(formatted);
        clearTimeout(timeout);
        if (res?.data && (res.data.image || res.data.title)) {
          fetchedData = res.data;
        }
      } catch {
        // Server call timed out or offline
      }

      // 2. Direct client HTML fetch if server preview didn't return image
      if (!fetchedData?.image) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 3500);
          const response = await fetch(formatted, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
              Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            },
            signal: controller.signal,
          });
          clearTimeout(timeout);
          if (response.ok) {
            const html = await response.text();
            const imgMatch1 = html.match(
              /<meta[^>]+(?:property|name)=["'](?:og:image|og:image:secure_url|twitter:image|twitter:image:src|image)["'][^>]+content=["']([^"']+)["']/i
            );
            const imgMatch2 = html.match(
              /<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:image|og:image:secure_url|twitter:image|twitter:image:src|image)["']/i
            );
            const iconMatch = html.match(
              /<link[^>]+rel=["'](?:apple-touch-icon|icon|shortcut icon)["'][^>]+href=["']([^"']+)["']/i
            );

            let extractedImg = imgMatch1?.[1] || imgMatch2?.[1] || iconMatch?.[1] || null;
            if (extractedImg && !extractedImg.startsWith("http")) {
              try {
                extractedImg = new URL(extractedImg, formatted).href;
              } catch {
                extractedImg = null;
              }
            }

            const titleMatch =
              html.match(
                /<meta[^>]+(?:property|name)=["'](?:og:title|twitter:title)["'][^>]+content=["']([^"']+)["']/i
              ) || html.match(/<title[^>]*>([^<]+)<\/title>/i);
            const descMatch = html.match(
              /<meta[^>]+(?:property|name)=["'](?:og:description|description|twitter:description)["'][^>]+content=["']([^"']+)["']/i
            );

            const clientTitle = titleMatch
              ? (titleMatch[1] || "").replace(/&amp;/g, "&").trim()
              : null;
            const clientDesc = descMatch
              ? (descMatch[1] || "").replace(/&amp;/g, "&").trim()
              : null;

            fetchedData = {
              url: formatted,
              title: clientTitle || fetchedData?.title || fallbackTitle,
              description: clientDesc || fetchedData?.description || `Web link from ${fallbackHost}`,
              siteName: fallbackHost,
              image: extractedImg || fetchedData?.image || defaultIconUrl,
            };
          }
        } catch {
          // Direct fetch failed
        }
      }

      const finalPreview: LinkPreviewData = {
        url: formatted,
        title: fetchedData?.title || fallbackTitle,
        description: fetchedData?.description || `Web link from ${fallbackHost}`,
        siteName: fetchedData?.siteName || fallbackHost,
        image: fetchedData?.image || defaultIconUrl,
      };

      setPreview(finalPreview);
      setIsLoadingPreview(false);

      if (finalPreview.title) {
        setTitle(finalPreview.title);
      }
      if (finalPreview.description) {
        setContent(finalPreview.description);
      }
    } catch {
      setIsLoadingPreview(false);
    }
  };

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (autoFetchEnabled && isValidUrl(newUrl)) {
      debounceTimer.current = setTimeout(() => {
        fetchPreview(newUrl);
      }, 700);
    }
  };

  // Switch toggle: When turned ON, fetches preview and populates title/content.
  // When turned OFF, title and description remain empty/cleared per user instructions.
  const handleToggleAutoFetch = (enabled: boolean) => {
    setAutoFetchEnabled(enabled);
    if (enabled) {
      if (url.trim().length > 0 && isValidUrl(url)) {
        fetchPreview(url);
      }
    } else {
      setPreview(null);
      setTitle("");
      setContent("");
    }
  };

  // Paste from clipboard button
  const handlePasteFromClipboard = async () => {
    try {
      const hasString = await Clipboard.hasStringAsync();
      if (!hasString) {
        Alert.alert("Clipboard Empty", "No text or URL found in clipboard.");
        return;
      }
      const text = await Clipboard.getStringAsync();
      if (text && text.trim()) {
        const clean = text.trim();
        setUrl(clean);
        if (autoFetchEnabled && isValidUrl(clean)) {
          fetchPreview(clean);
        }
      }
    } catch {
      Alert.alert("Clipboard Error", "Could not read from clipboard.");
    }
  };

  // iOS Default Popup for Category Selection (Matches Text Memory Composer)
  const handleOpenCategory = () => {
    fetchCategories().catch(() => {});
    if (Platform.OS === "ios") {
      const options = [
        "Cancel",
        ...categories.map((c) => (c.id === selectedCategory?.id ? `${c.name} ✓` : c.name)),
        "+ New Category",
      ];
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: "Select Category",
          options,
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === options.length - 1) {
            if (Alert.prompt) {
              Alert.prompt(
                "New Category",
                "Enter category name to organize your link:",
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
        "Choose a category for this link",
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

  // 3-Dot Options Button
  const handleMoreOptions = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: "Link Options",
          options: ["Cancel", "Clear Form", "Paste from Clipboard"],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 0,
        },
        (idx) => {
          if (idx === 1) {
            setUrl("");
            setTitle("");
            setContent("");
            setPreview(null);
          } else if (idx === 2) {
            handlePasteFromClipboard();
          }
        }
      );
    } else {
      Alert.alert("Link Options", undefined, [
        {
          text: "Clear Form",
          style: "destructive",
          onPress: () => {
            setUrl("");
            setTitle("");
            setContent("");
            setPreview(null);
          },
        },
        { text: "Paste from Clipboard", onPress: handlePasteFromClipboard },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  const hasUnsavedChanges =
    url.trim().length > 0 || title.trim().length > 0 || content.trim().length > 0;
  const canSave = (url.trim().length > 0 || title.trim().length > 0) && !isSaving;

  const handleBackPress = () => {
    if (hasUnsavedChanges && !isSaving && !initialMemory) {
      setUnsavedModalVisible(true);
    } else {
      onBack();
    }
  };

  const handleSave = async () => {
    if (!canSave) {
      Alert.alert("Missing URL", "Please paste or enter a URL before saving.");
      return;
    }

    try {
      setIsSaving(true);
      const rawUrl = url.trim();
      const formattedUrl =
        rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
          ? rawUrl
          : rawUrl
          ? `https://${rawUrl}`
          : "";

      const finalTitle =
        title.trim() ||
        preview?.title ||
        (formattedUrl ? getCleanHostname(formattedUrl) : "Web Link");

      const payload = {
        title: finalTitle,
        content: content.trim() || preview?.description || undefined,
        type: "link" as const,
        sourceType: "web" as const,
        sourceUrl: formattedUrl || undefined,
        categoryId: selectedCategory ? selectedCategory.id : undefined,
        metadata: preview
          ? { ...preview }
          : formattedUrl
          ? { url: formattedUrl, title: finalTitle }
          : undefined,
      };

      let result: Memory;
      if (initialMemory?.id) {
        result = await updateMemory(initialMemory.id, payload);
      } else {
        result = await createMemory(payload);
      }

      setIsSaving(false);
      onSuccess(result);
      onBack();
    } catch (err: any) {
      setIsSaving(false);
      const msg = err?.message || "Failed to save link memory. Please try again.";
      setErrorMessage(msg);

      if (Platform.OS === "ios") {
        Alert.alert("Save Error", msg, [
          { text: "Cancel", style: "cancel" },
          { text: "Try Again", onPress: handleSave },
        ]);
      } else {
        setErrorModalVisible(true);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
        {/* ── Top Bar ── */}
        <View style={styles.topBar}>
          {/* Circular iOS Glass Back Button */}
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

          {/* Right Action Buttons: 3-dots glass button & vibrant lime check button */}
          <View style={styles.topRightActions}>
            {/* 3-dots Circular iOS Glass Button */}
            <IOSGlassButton size={42} onPress={handleMoreOptions} activeOpacity={0.75}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Circle cx="5" cy="12" r="1.8" fill="#FFFFFF" />
                <Circle cx="12" cy="12" r="1.8" fill="#FFFFFF" />
                <Circle cx="19" cy="12" r="1.8" fill="#FFFFFF" />
              </Svg>
            </IOSGlassButton>

            {/* Circular Lime Check Button with black checkmark */}
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

        {/* ── Main Scroll Content ── */}
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* URL Input Box with Paste Icon */}
          <View style={styles.urlInputBox}>
            <TextInput
              style={styles.urlInput}
              placeholder="Paste or enter a URL..."
              placeholderTextColor="#5A606E"
              value={url}
              onChangeText={handleUrlChange}
              autoCapitalize="none"
              keyboardType="url"
              autoCorrect={false}
              editable={!isSaving}
            />

            {/* Paste Button Icon */}
            <TouchableOpacity
              style={styles.pasteIconBtn}
              activeOpacity={0.7}
              onPress={handlePasteFromClipboard}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              {/* Overlapping sheets clipboard icon */}
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M8 4v12a2 2 0 002 2h8a2 2 0 002-2V7.242a2 2 0 00-.602-1.43L16.08 2.5a2 2 0 00-1.43-.5H10a2 2 0 00-2 2z"
                  stroke="#9CA3AF"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M16 18v2a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h2"
                  stroke="#9CA3AF"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
          </View>

          {/* Auto fetch preview row with Switcher */}
          <View style={styles.autoFetchRow}>
            <View style={styles.autoFetchLeft}>
              {/* Overlapping window cards icon */}
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Rect x="3" y="6" width="13" height="14" rx="2" stroke="#9CA3AF" strokeWidth={1.8} />
                <Path
                  d="M8 6V4a2 2 0 012-2h9a2 2 0 012 2v10a2 2 0 01-2 2h-2"
                  stroke="#9CA3AF"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                />
              </Svg>
              <Text style={styles.autoFetchLabel}>Auto fetch preview</Text>
            </View>

            <Switch
              value={autoFetchEnabled}
              onValueChange={handleToggleAutoFetch}
              trackColor={{ false: "#2A2D35", true: "#C6F52C" }}
              thumbColor={autoFetchEnabled ? "#FFFFFF" : "#E5E7EB"}
              ios_backgroundColor="#2A2D35"
              style={styles.switchControl}
            />
          </View>

          {/* Preview Box (Visible when Auto-fetch is ON) */}
          {autoFetchEnabled && (
            <View style={styles.previewBoxContainer}>
              {preview?.image ? (
                // Fetched preview with image
                <View style={styles.previewLoadedRow}>
                  <View style={styles.previewLoadedImageWrap}>
                    <Image
                      source={{
                        uri: imageFailed
                          ? `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(preview.url)}&size=128`
                          : preview.image,
                      }}
                      style={styles.previewLoadedImage}
                      resizeMode="cover"
                      onError={() => setImageFailed(true)}
                    />
                  </View>
                  <View style={styles.previewTextCol}>
                    <Text style={styles.previewTitle} numberOfLines={1}>
                      {preview.title || "Website Preview"}
                    </Text>
                    <Text style={styles.previewSubtitle} numberOfLines={2}>
                      {preview.siteName || preview.description || preview.url}
                    </Text>
                  </View>
                </View>
              ) : preview?.title ? (
                // Fetched preview without image
                <View style={styles.previewLoadedRow}>
                  <View style={styles.previewLoadedImageWrap}>
                    <Image
                      source={{
                        uri: `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(preview.url)}&size=128`,
                      }}
                      style={styles.previewLoadedImage}
                      resizeMode="cover"
                    />
                  </View>
                  <View style={styles.previewTextCol}>
                    <Text style={styles.previewTitle} numberOfLines={1}>
                      {preview.title}
                    </Text>
                    <Text style={styles.previewSubtitle} numberOfLines={2}>
                      {preview.siteName || preview.description || preview.url}
                    </Text>
                  </View>
                </View>
              ) : (
                // No link entered yet / Default placeholder graphic
                <View style={styles.previewPlaceholderRow}>
                  <View style={styles.placeholderThumb}>
                    {isLoadingPreview ? (
                      <ActivityIndicator size="small" color="#9CA3AF" />
                    ) : (
                      /* Stylized Landscape (Sun + Mountains) silhouette matching design */
                      <Svg width={118} height={70} viewBox="0 0 118 70" fill="none">
                        <Circle cx="32" cy="24" r="8" fill="#585D6B" />
                        <Path
                          d="M-2 70 L28 44 L54 60 L84 36 L120 70 Z"
                          fill="#585D6B"
                        />
                      </Svg>
                    )}
                  </View>

                  <View style={styles.placeholderTextCol}>
                    <Text style={styles.noLinkTitle}>
                      {isLoadingPreview ? "Fetching preview..." : "No Link entered"}
                    </Text>
                    <Text style={styles.noLinkSubtitle}>
                      {isLoadingPreview
                        ? "Reading metadata from URL"
                        : "Paste a URL to see a preview"}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Title (optional) Label & Underline Input */}
          <Text style={styles.fieldLabel}>Title (optional)</Text>
          <TextInput
            style={styles.underlineInput}
            placeholder="e.g. Marketing Strategy Idea"
            placeholderTextColor="#3E4350"
            value={title}
            onChangeText={setTitle}
            editable={!isSaving}
          />

          {/* Content Label & Multiline Input */}
          <Text style={[styles.fieldLabel, styles.contentLabel]}>Content</Text>
          <TextInput
            style={styles.contentInput}
            placeholder="Write your note, Idea or quote..."
            placeholderTextColor="#3E4350"
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            editable={!isSaving}
          />
        </ScrollView>

        {/* ── Bottom Bar: iOS Glass Category Capsule at Bottom Right ── */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleOpenCategory}
            style={styles.categoryTouchable}
          >
            <IOSGlassCapsule
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
                  stroke="#9CA3AF"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </IOSGlassCapsule>
          </TouchableOpacity>
        </View>

        {/* Save Error Modal with cancel X icon */}
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000000",
  },
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 14,
  },
  topRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  saveLimeBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#C6F52C",
    justifyContent: "center",
    alignItems: "center",
  },
  saveLimeBtnDisabled: {
    opacity: 0.35,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 40,
  },
  // URL Input Capsule
  urlInputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#15171C",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    height: 56,
    paddingHorizontal: 18,
    marginTop: 6,
  },
  urlInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    paddingVertical: 0,
    letterSpacing: -0.2,
  },
  pasteIconBtn: {
    padding: 6,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  // Auto-fetch Preview Row
  autoFetchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
    paddingHorizontal: 2,
  },
  autoFetchLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  autoFetchLabel: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: -0.2,
  },
  switchControl: {
    transform: Platform.OS === "ios" ? [{ scaleX: 0.9 }, { scaleY: 0.9 }] : [],
  },
  // Preview Box Area
  previewBoxContainer: {
    marginTop: 18,
    marginBottom: 4,
  },
  previewPlaceholderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  placeholderThumb: {
    width: 120,
    height: 74,
    borderRadius: 15,
    backgroundColor: "#1C1F26",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.07)",
    overflow: "hidden",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  placeholderTextCol: {
    flex: 1,
    marginLeft: 16,
    justifyContent: "center",
  },
  noLinkTitle: {
    color: "#E5E7EB",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  noLinkSubtitle: {
    color: "#6B7280",
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  // Loaded Preview
  previewLoadedRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  previewLoadedImageWrap: {
    width: 120,
    height: 74,
    borderRadius: 15,
    backgroundColor: "#1C1F26",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  previewLoadedImage: {
    width: "100%",
    height: "100%",
  },
  previewTextCol: {
    flex: 1,
    marginLeft: 16,
    justifyContent: "center",
  },
  previewTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  previewSubtitle: {
    color: "#6B7280",
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  // Form Labels & Inputs
  fieldLabel: {
    color: "#8E95A5",
    fontSize: 13,
    fontWeight: "500",
    marginTop: 26,
    marginBottom: 6,
    letterSpacing: -0.1,
  },
  contentLabel: {
    marginTop: 24,
  },
  underlineInput: {
    color: "#FFFFFF",
    fontSize: 15,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#22252F",
    letterSpacing: -0.2,
  },
  contentInput: {
    color: "#D1D5DB",
    fontSize: 15,
    paddingVertical: 8,
    minHeight: 100,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  // Bottom Bar with Category Capsule
  bottomBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingBottom: 22,
    paddingTop: 8,
  },
  categoryTouchable: {
    alignSelf: "flex-end",
  },
  categoryCapsule: {
    minWidth: 116,
    paddingHorizontal: 16,
  },
  categoryCapsuleContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: "100%",
  },
  categoryCapsuleText: {
    color: "#9CA3AF",
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: -0.2,
    maxWidth: 130,
  },
});
