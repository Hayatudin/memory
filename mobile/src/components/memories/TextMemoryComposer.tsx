import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
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
import { Category, Memory } from "../../types/models";
import { useMemoryStore } from "../../store/memoryStore";
import { IOSGlassButton } from "../common/IOSGlassButton";
import { IOSGlassCapsule } from "../common/IOSGlassCapsule";
import { detectCategoryIcon } from "../common/Icon";
import { SaveErrorModal, UnsavedChangesModal } from "./MemoryModals";

type BulletType = "none" | "bullet" | "dashed" | "numbered";

interface LineItem {
  id: string;
  text: string;
  isTodo: boolean;
  checked: boolean;
  bulletType: BulletType;
  num?: number;
}

interface TextMemoryComposerProps {
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
}

const createEmptyLine = (isTodo = false, bulletType: BulletType = "none", num = 1): LineItem => ({
  id: `${Date.now()}-${Math.random()}`,
  text: "",
  isTodo,
  checked: false,
  bulletType,
  num,
});

const deserializeContent = (raw?: string): LineItem[] => {
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

export const TextMemoryComposer: React.FC<TextMemoryComposerProps> = ({
  onBack,
  onSuccess,
  initialMemory,
}) => {
  const { createMemory, updateMemory, categories, fetchCategories, createCategory } = useMemoryStore();

  // Title & Lines
  const [title, setTitle] = useState(initialMemory?.title || "");
  const [lines, setLines] = useState<LineItem[]>(() =>
    initialMemory?.content ? deserializeContent(initialMemory.content) : [createEmptyLine()]
  );
  const [activeLineIndex, setActiveLineIndex] = useState(0);

  // Global formatting toggles
  const [isLarge, setIsLarge] = useState(Boolean(initialMemory?.metadata?.isLarge));
  const [isBold, setIsBold] = useState(Boolean(initialMemory?.metadata?.isBold));
  const [isUnderline, setIsUnderline] = useState(Boolean(initialMemory?.metadata?.isUnderline));

  // Selected Category
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(() => {
    if (initialMemory?.categoryId && categories.length > 0) {
      const match = categories.find((c) => c.id === initialMemory.categoryId);
      if (match) return match;
    }
    if (initialMemory?.categoryName && categories.length > 0) {
      const match = categories.find(
        (c) => c.name.toLowerCase() === initialMemory.categoryName?.toLowerCase()
      );
      if (match) return match;
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
    if (!selectedCategory && categories.length > 0) {
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
      const defaultMatch = categories.find((c) => c.name.toLowerCase() === "ideas") || categories[0];
      setSelectedCategory(defaultMatch);
    }
  }, [categories, selectedCategory, initialMemory]);

  // Snapshot for undo
  const pushUndoState = () => {
    undoStackRef.current.push({
      title,
      lines: JSON.parse(JSON.stringify(lines)),
      isBold,
      isUnderline,
      isLarge,
    });
    if (undoStackRef.current.length > 40) {
      undoStackRef.current.shift();
    }
  };

  // Undo action
  const handleUndo = () => {
    if (undoStackRef.current.length === 0) return;
    const prev = undoStackRef.current.pop();
    if (prev) {
      setTitle(prev.title);
      setLines(prev.lines);
      setIsBold(prev.isBold);
      setIsUnderline(prev.isUnderline);
      setIsLarge(prev.isLarge);
    }
  };

  // Serialize lines to content string
  const serializeContent = (items: LineItem[] = lines): string => {
    return items
      .map((item) => {
        if (item.isTodo) {
          return (item.checked ? "● " : "○ ") + item.text;
        }
        if (item.bulletType === "bullet") {
          return "• " + item.text;
        }
        if (item.bulletType === "dashed") {
          return "- " + item.text;
        }
        if (item.bulletType === "numbered") {
          return `${item.num || 1}. ` + item.text;
        }
        return item.text;
      })
      .join("\n");
  };

  // Active line helpers
  const currentLine = lines[activeLineIndex] || lines[0] || createEmptyLine();
  const isCurrentLineTodo = currentLine.isTodo;
  const currentBulletType = currentLine.bulletType;

  // Toggle To-do on the active line
  const handleToggleTodo = () => {
    pushUndoState();
    setLines((prev) => {
      const copy = [...prev];
      const target = copy[activeLineIndex] || copy[0];
      if (target.isTodo) {
        // Toggle off to-do
        target.isTodo = false;
        target.checked = false;
      } else {
        // Toggle on to-do
        target.isTodo = true;
        target.checked = false;
        target.bulletType = "none";
      }
      return copy;
    });
  };

  // Toggle check/uncheck for a specific to-do line
  const handleToggleCheck = (index: number) => {
    pushUndoState();
    setLines((prev) => {
      const copy = [...prev];
      if (copy[index]) {
        copy[index].checked = !copy[index].checked;
      }
      return copy;
    });
  };

  // Toggle font size (large vs normal)
  const handleToggleLarge = () => {
    pushUndoState();
    setIsLarge((prev) => !prev);
  };

  // Toggle bold
  const handleToggleBold = () => {
    pushUndoState();
    setIsBold((prev) => !prev);
  };

  // Toggle underline
  const handleToggleUnderline = () => {
    pushUndoState();
    setIsUnderline((prev) => !prev);
  };

  // Cycle bullet types for the active line
  const handleCycleBulletType = () => {
    pushUndoState();
    setLines((prev) => {
      const copy = [...prev];
      const target = copy[activeLineIndex] || copy[0];
      let nextType: BulletType = "none";

      if (target.bulletType === "none") {
        nextType = "bullet";
        target.isTodo = false;
      } else if (target.bulletType === "bullet") {
        nextType = "dashed";
        target.isTodo = false;
      } else if (target.bulletType === "dashed") {
        nextType = "numbered";
        target.isTodo = false;
        // Calculate number sequence
        let prevNum = 0;
        for (let i = activeLineIndex - 1; i >= 0; i--) {
          if (copy[i].bulletType === "numbered" && copy[i].num) {
            prevNum = copy[i].num!;
            break;
          }
        }
        target.num = prevNum + 1;
      } else {
        nextType = "none";
      }

      target.bulletType = nextType;
      return copy;
    });
  };

  // Handle typing inside a line
  const handleLineTextChange = (index: number, newText: string) => {
    // If user hit Enter, split line
    if (newText.includes("\n")) {
      const parts = newText.split("\n");
      const firstPart = parts[0];
      const remainder = parts.slice(1).join("\n");

      setLines((prev) => {
        const copy = [...prev];
        const cur = copy[index];

        // If current line was an empty to-do / bullet and user pressed Enter, exit list mode
        if (cur.text === "" && (cur.isTodo || cur.bulletType !== "none")) {
          cur.isTodo = false;
          cur.checked = false;
          cur.bulletType = "none";
          return copy;
        }

        cur.text = firstPart;

        // Determine continuation properties for the new line
        let newIsTodo = cur.isTodo;
        let newBullet = cur.bulletType;
        let newNum = cur.num ? cur.num + 1 : 1;

        const newLine = createEmptyLine(newIsTodo, newBullet, newNum);
        newLine.text = remainder;
        copy.splice(index + 1, 0, newLine);
        return copy;
      });

      // Focus newly inserted line
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
        setActiveLineIndex(index + 1);
      }, 30);
      return;
    }

    // Normal text update
    setLines((prev) => {
      const copy = [...prev];
      if (copy[index]) {
        copy[index].text = newText;
      }
      return copy;
    });
  };

  // Handle Backspace on empty line
  const handleLineKeyPress = (
    index: number,
    e: NativeSyntheticEvent<TextInputKeyPressEventData>
  ) => {
    if (e.nativeEvent.key === "Backspace") {
      const cur = lines[index];
      if (cur && cur.text === "") {
        if (cur.isTodo) {
          // Remove to-do status first
          setLines((prev) => {
            const copy = [...prev];
            copy[index].isTodo = false;
            copy[index].checked = false;
            return copy;
          });
          return;
        }
        if (cur.bulletType !== "none") {
          // Remove bullet status first
          setLines((prev) => {
            const copy = [...prev];
            copy[index].bulletType = "none";
            return copy;
          });
          return;
        }
        if (lines.length > 1) {
          // Delete empty line and focus previous
          setLines((prev) => {
            const copy = [...prev];
            copy.splice(index, 1);
            return copy;
          });
          const target = Math.max(0, index - 1);
          setTimeout(() => {
            inputRefs.current[target]?.focus();
            setActiveLineIndex(target);
          }, 30);
        }
      }
    }
  };

  // Share action
  const handleShare = async () => {
    const contentText = serializeContent();
    const full = `${title ? title + "\n\n" : ""}${contentText}`.trim();
    if (!full) {
      Alert.alert("Empty Note", "There is no content to share yet.");
      return;
    }
    try {
      await Share.share({
        title: title || "Note",
        message: full,
      });
    } catch {
      // Ignore
    }
  };

  // Clear Note action
  const handleClearNote = () => {
    pushUndoState();
    setTitle("");
    setLines([createEmptyLine()]);
    setActiveLineIndex(0);
  };

  // iOS Default ActionSheet for More Options (three dots)
  const handleMoreOptions = () => {
    const contentText = serializeContent();
    const wordCount = contentText.trim().length > 0 ? contentText.trim().split(/\s+/).length : 0;
    const charCount = contentText.length;

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: "Note Options",
          message: `${wordCount} words • ${charCount} characters`,
          options: ["Cancel", "Clear Note", "Share Note"],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            handleClearNote();
          } else if (buttonIndex === 2) {
            handleShare();
          }
        }
      );
    } else {
      Alert.alert(
        "Note Options",
        `${wordCount} words • ${charCount} characters`,
        [
          { text: "Share Note", onPress: handleShare },
          { text: "Clear Note", style: "destructive", onPress: handleClearNote },
          { text: "Cancel", style: "cancel" },
        ]
      );
    }
  };

  // iOS Default ActionSheet for Category Selection
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
                "Enter category name to organize your note:",
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
        "Choose a category for this note",
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

  // Check if anything can be saved
  const serialized = serializeContent();
  const hasUnsavedChanges = title.trim().length > 0 || serialized.trim().length > 0;
  const canSave = hasUnsavedChanges && !isSaving;

  const handleBackPress = () => {
    if (hasUnsavedChanges && !isSaving) {
      setUnsavedModalVisible(true);
    } else {
      onBack();
    }
  };

  // Save to database
  const handleSave = async () => {
    if (!canSave) return;
    try {
      setIsSaving(true);
      const finalTitle = title.trim() || serialized.trim().slice(0, 40) || "Note";
      const meta = {
        isBold,
        isUnderline,
        isLarge,
      };

      let memoryResult: Memory;
      if (initialMemory?.id) {
        memoryResult = await updateMemory(initialMemory.id, {
          title: finalTitle,
          content: serialized.trim() || undefined,
          categoryId: selectedCategory ? selectedCategory.id : undefined,
          metadata: meta,
        });
      } else {
        memoryResult = await createMemory({
          title: finalTitle,
          content: serialized.trim() || undefined,
          type: "text",
          categoryId: selectedCategory ? selectedCategory.id : undefined,
          metadata: meta,
        });
      }

      setIsSaving(false);
      onSuccess(memoryResult);
    } catch (err: any) {
      setIsSaving(false);
      const msg = err?.message || "Failed to save text memory. Please try again.";
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      {/* Top Header Bar */}
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
          {/* Undo / Return Button (Matches iOS return arrow icon) */}
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

      {/* Note Body Area */}
      <ScrollView
        style={styles.editorScroll}
        contentContainerStyle={styles.editorContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Title Field */}
        <Text style={styles.fieldLabel}>Title (optional)</Text>
        <TextInput
          style={styles.titleInput}
          placeholder="e.g. Marketing Strategy Idea"
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

        {/* Content Field */}
        <Text style={styles.fieldLabel}>Content</Text>

        {/* Dynamic Lines (Interactive Circular To-Do list items & Bullets) */}
        <View style={styles.linesWrapper}>
          {lines.map((line, idx) => (
            <View key={line.id} style={styles.lineRow}>
              {/* Circular To-Do Checkbox (Can be checked & unchecked on tap) */}
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
                ref={(ref) => {
                  inputRefs.current[idx] = ref;
                }}
                style={[
                  styles.lineTextInput,
                  isLarge && styles.contentLarge,
                  isBold && styles.contentBold,
                  isUnderline && styles.contentUnderline,
                  line.isTodo && line.checked && styles.lineCheckedText,
                ]}
                placeholder={idx === 0 && lines.length === 1 ? "Write your note, idea or quote..." : ""}
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

      {/* Bottom Toolbars */}
      <View style={styles.bottomBarContainer}>
        {/* Left Formatting Capsule (Increased width, takes all remaining space) */}
        <IOSGlassCapsule
          height={48}
          borderRadius={24}
          style={styles.formatCapsule}
          contentStyle={styles.formatCapsuleContent}
        >
          {/* 1. To-do List Button (Exact icon from reference design) */}
          <TouchableOpacity
            style={styles.toolBtn}
            activeOpacity={0.7}
            onPress={handleToggleTodo}
          >
            <View style={{ opacity: isCurrentLineTodo ? 1.0 : 0.4 }}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                {/* Top item: circle with check + line */}
                <Circle cx="6" cy="7.5" r="3.2" stroke="#FFFFFF" strokeWidth={1.8} />
                <Path
                  d="M4.8 7.5l1 1 1.8-1.8"
                  stroke="#FFFFFF"
                  strokeWidth={1.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path d="M12 7.5h8.5" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" />

                {/* Bottom item: open circle + line */}
                <Circle cx="6" cy="16.5" r="3.2" stroke="#FFFFFF" strokeWidth={1.8} />
                <Path d="M12 16.5h8.5" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" />
              </Svg>
            </View>
          </TouchableOpacity>

          {/* 2. Aa Text Size button */}
          <TouchableOpacity
            style={styles.toolBtn}
            activeOpacity={0.7}
            onPress={handleToggleLarge}
          >
            <View style={{ opacity: isLarge ? 1.0 : 0.4 }}>
              <Text style={styles.toolAaText}>Aa</Text>
            </View>
          </TouchableOpacity>

          {/* 3. Bold (B) button */}
          <TouchableOpacity
            style={styles.toolBtn}
            activeOpacity={0.7}
            onPress={handleToggleBold}
          >
            <View style={{ opacity: isBold ? 1.0 : 0.4 }}>
              <Text style={styles.toolBoldText}>B</Text>
            </View>
          </TouchableOpacity>

          {/* 4. Underline (U) button */}
          <TouchableOpacity
            style={styles.toolBtn}
            activeOpacity={0.7}
            onPress={handleToggleUnderline}
          >
            <View style={{ opacity: isUnderline ? 1.0 : 0.4 }}>
              <Text style={styles.toolUnderlineText}>U</Text>
            </View>
          </TouchableOpacity>

          {/* 5. Bullet list type button */}
          <TouchableOpacity
            style={styles.toolBtn}
            activeOpacity={0.7}
            onPress={handleCycleBulletType}
          >
            <View style={{ opacity: currentBulletType !== "none" ? 1.0 : 0.4 }}>
              {currentBulletType === "dashed" ? (
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M4 7h4M11 7h9M4 12h4M11 12h9M4 17h4M11 17h9"
                    stroke="#FFFFFF"
                    strokeWidth={2.2}
                    strokeLinecap="round"
                  />
                </Svg>
              ) : currentBulletType === "numbered" ? (
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M5 6v6M4 7l2-1M10 9h10M4 18h3.5M4 15c0-1 1-1.5 2-1.5s2 .5 2 1.5c0 1-2 2-2 3M10 16h10"
                    stroke="#FFFFFF"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              ) : (
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Circle cx="4.5" cy="6.5" r="1.6" fill="#FFFFFF" />
                  <Circle cx="4.5" cy="12" r="1.6" fill="#FFFFFF" />
                  <Circle cx="4.5" cy="17.5" r="1.6" fill="#FFFFFF" />
                  <Path
                    d="M9.5 6.5h10.5M9.5 12h10.5M9.5 17.5h10.5"
                    stroke="#FFFFFF"
                    strokeWidth={2.2}
                    strokeLinecap="round"
                  />
                </Svg>
              )}
            </View>
          </TouchableOpacity>
        </IOSGlassCapsule>

        {/* Right Category Capsule (Minimized width: 112px) */}
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

const styles = StyleSheet.create({
  container: {
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
  editorScroll: {
    flex: 1,
  },
  editorContent: {
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 28,
  },
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
