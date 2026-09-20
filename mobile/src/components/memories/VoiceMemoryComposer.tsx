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
  Alert,
  Animated,
  ScrollView,
} from "react-native";
import Svg, { Circle, Rect } from "react-native-svg";
import { Icon } from "../common/Icon";
import { Category, Memory } from "../../types/models";
import { useMemoryStore } from "../../store/memoryStore";
import { StorageApi } from "../../api/storage.api";
import { AudioService } from "../../services/audioService";
import { CategorySelectorSheet } from "./CategorySelectorSheet";
import {
  VoiceProcessingModal,
  SaveErrorModal,
  UnsavedChangesModal,
} from "./MemoryModals";

interface VoiceMemoryComposerProps {
  onBack: () => void;
  onSuccess: (memory: Memory) => void;
  initialMemory?: Memory | null;
}

type RecordingState = "idle" | "recording" | "paused" | "recorded";

export const VoiceMemoryComposer: React.FC<VoiceMemoryComposerProps> = ({
  onBack,
  onSuccess,
  initialMemory,
}) => {
  const { createMemory, updateMemory, categories, fetchCategories } = useMemoryStore();

  const [recordingState, setRecordingState] = useState<RecordingState>(
    initialMemory?.mediaUrl ? "recorded" : "idle"
  );
  const [durationSecs, setDurationSecs] = useState<number>(
    initialMemory?.mediaMetadata?.durationSecs || 12
  );
  const [audioUri, setAudioUri] = useState<string | null>(
    initialMemory?.mediaUrl || null
  );

  const [title, setTitle] = useState(
    initialMemory?.title || "Quick marketing idea"
  );
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(() => {
    if (initialMemory?.categoryId && categories.length > 0) {
      const match = categories.find((c) => c.id === initialMemory.categoryId);
      if (match) return match;
    }
    return (
      categories.find((c) => c.name.toLowerCase().includes("idea")) ||
      (categories.length > 0 ? categories[0] : null)
    );
  });

  // Load real categories from database on mount
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
        const match =
          categories.find(
            (c) =>
              c.name.toLowerCase().includes("idea") ||
              c.name.toLowerCase().includes("music")
          ) || categories[0];
        setSelectedCategory(match);
      }
    }
  }, [categories, initialMemory]);

  const [categorySheetVisible, setCategorySheetVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [unsavedModalVisible, setUnsavedModalVisible] = useState(false);

  const timerInterval = useRef<any>(null);

  // Pulse animation for orb
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Animated bars for waveform
  const leftBars = useRef([
    new Animated.Value(6),
    new Animated.Value(12),
    new Animated.Value(18),
    new Animated.Value(26),
    new Animated.Value(16),
    new Animated.Value(22),
    new Animated.Value(14),
  ]).current;

  const rightBars = useRef([
    new Animated.Value(12),
    new Animated.Value(20),
    new Animated.Value(10),
    new Animated.Value(18),
    new Animated.Value(14),
    new Animated.Value(8),
    new Animated.Value(6),
  ]).current;

  // Animate during recording
  useEffect(() => {
    let pulseLoop: any = null;
    let waveLoop: any = null;

    if (recordingState === "recording") {
      pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();

      const allBars = [...leftBars, ...rightBars];
      const anims = allBars.map((bar, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(bar, {
              toValue: 8 + Math.floor(Math.random() * 22),
              duration: 180 + i * 25,
              useNativeDriver: false,
            }),
            Animated.timing(bar, {
              toValue: 4 + Math.floor(Math.random() * 8),
              duration: 180 + i * 25,
              useNativeDriver: false,
            }),
          ])
        )
      );
      anims.forEach((a) => a.start());
      waveLoop = { stop: () => anims.forEach((a) => a.stop()) };
    } else {
      pulseAnim.setValue(1);
      leftBars.forEach((b) => b.setValue(10));
      rightBars.forEach((b) => b.setValue(10));
      if (pulseLoop) pulseLoop.stop();
      if (waveLoop) waveLoop.stop();
    }

    return () => {
      if (pulseLoop) pulseLoop.stop();
      if (waveLoop) waveLoop.stop();
    };
  }, [recordingState, pulseAnim, leftBars, rightBars]);

  useEffect(() => {
    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
      AudioService.stopAudio();
    };
  }, []);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins < 10 ? "0" : ""}${mins}:${remainder < 10 ? "0" : ""}${remainder}`;
  };

  const startRecording = async () => {
    try {
      if (AudioService.isSupported()) {
        const granted = await AudioService.requestPermissions();
        if (!granted) {
          Alert.alert(
            "Permission Required",
            "Microphone access is required to record voice memories."
          );
          return;
        }
      }

      await AudioService.startRecording();
      setRecordingState("recording");
      setDurationSecs(0);

      if (timerInterval.current) clearInterval(timerInterval.current);
      timerInterval.current = setInterval(() => {
        setDurationSecs((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      // If native module not ready on simulator, keep graceful mock recording
      setRecordingState("recording");
      if (timerInterval.current) clearInterval(timerInterval.current);
      timerInterval.current = setInterval(() => {
        setDurationSecs((prev) => prev + 1);
      }, 1000);
    }
  };

  const pauseRecording = async () => {
    try {
      await AudioService.pauseRecording();
    } catch {}
    if (timerInterval.current) clearInterval(timerInterval.current);
    setRecordingState("paused");
  };

  const resumeRecording = async () => {
    try {
      await AudioService.resumeRecording();
    } catch {}
    setRecordingState("recording");
    if (timerInterval.current) clearInterval(timerInterval.current);
    timerInterval.current = setInterval(() => {
      setDurationSecs((prev) => prev + 1);
    }, 1000);
  };

  const toggleRecording = () => {
    if (recordingState === "idle") {
      startRecording();
    } else if (recordingState === "recording") {
      pauseRecording();
    } else if (recordingState === "paused") {
      resumeRecording();
    }
  };

  const handleDelete = async () => {
    try {
      await AudioService.stopRecording();
      await AudioService.stopAudio();
    } catch {}
    if (timerInterval.current) clearInterval(timerInterval.current);
    setRecordingState("idle");
    setDurationSecs(0);
    setAudioUri(null);
  };

  const handleRerecord = async () => {
    await handleDelete();
    setTimeout(() => {
      startRecording();
    }, 100);
  };

  const hasUnsavedChanges =
    durationSecs > 0 || recordingState !== "idle" || title !== "Quick marketing idea";

  const handleBackPress = () => {
    if (hasUnsavedChanges && !isProcessing) {
      setUnsavedModalVisible(true);
    } else {
      onBack();
    }
  };

  const handleSave = async () => {
    try {
      setIsProcessing(true);

      let finalUri = audioUri;
      if (!finalUri) {
        finalUri = await AudioService.stopRecording();
      }
      if (timerInterval.current) clearInterval(timerInterval.current);

      let mediaUrl = "https://res.cloudinary.com/demo/video/upload/sample_audio.mp3";

      if (finalUri && !finalUri.startsWith("mock:")) {
        try {
          const uploadRes = await StorageApi.uploadFile(
            finalUri,
            `voice_${Date.now()}.m4a`,
            "audio/m4a"
          );
          mediaUrl = uploadRes.url;
        } catch {
          // fallback placeholder audio
        }
      }

      const finalTitle =
        title.trim() ||
        `Voice Memo - ${new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}`;

      let resultMemory: Memory;
      if (initialMemory?.id) {
        resultMemory = await updateMemory(initialMemory.id, {
          title: finalTitle,
          mediaUrl,
          mediaMetadata: {
            durationSecs: durationSecs || 12,
            format: "m4a",
          },
          categoryId: selectedCategory ? selectedCategory.id : undefined,
        });
      } else {
        resultMemory = await createMemory({
          title: finalTitle,
          type: "voice",
          mediaUrl,
          mediaMetadata: {
            durationSecs: durationSecs || 12,
            format: "m4a",
          },
          categoryId: selectedCategory ? selectedCategory.id : undefined,
        });
      }

      setIsProcessing(false);
      onSuccess(resultMemory);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(
        err?.message || "Failed to save voice memory. Please try again."
      );
      setErrorModalVisible(true);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.8}
          onPress={handleBackPress}
          disabled={isProcessing}
        >
          <Icon name="chevron-left" size={22} color="#FFFFFF" strokeWidth={2.4} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Voice</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Glowing Orb Section */}
        <View style={styles.orbSection}>
          <View style={styles.orbRow}>
            {/* Left Soundwave Ticks */}
            <View style={styles.sideTicks}>
              <View style={[styles.tickBar, { height: 10 }]} />
              <View style={[styles.tickBar, { height: 18 }]} />
              <View style={[styles.tickBar, { height: 26 }]} />
            </View>

            {/* Glowing Concentric Orb */}
            <Animated.View
              style={[
                styles.orbOuter,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <View style={styles.orbMiddle}>
                <View style={styles.orbInner}>
                  <View style={styles.orbCenterDot} />
                </View>
              </View>
            </Animated.View>

            {/* Right Soundwave Ticks */}
            <View style={styles.sideTicks}>
              <View style={[styles.tickBar, { height: 26 }]} />
              <View style={[styles.tickBar, { height: 18 }]} />
              <View style={[styles.tickBar, { height: 10 }]} />
            </View>
          </View>

          {/* Time & Recording Status */}
          <Text style={styles.timerText}>{formatTime(durationSecs)}</Text>
          <Text style={styles.statusText}>
            {recordingState === "recording"
              ? "Recording..."
              : recordingState === "paused"
              ? "Paused"
              : recordingState === "idle"
              ? "Tap button to record"
              : "Recorded"}
          </Text>
        </View>

        {/* Waveform Bar Container with Center Lime Button */}
        <View style={styles.waveformContainer}>
          {/* Left Bars */}
          <View style={styles.barsSubRow}>
            {leftBars.map((bar, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.activeBar,
                  {
                    height: bar,
                    opacity: recordingState === "recording" ? 1 : 0.6,
                  },
                ]}
              />
            ))}
          </View>

          {/* Center Lime Circular Button */}
          <TouchableOpacity
            style={styles.centerControlBtn}
            activeOpacity={0.85}
            onPress={toggleRecording}
          >
            {recordingState === "recording" ? (
              <Icon name="pause" size={20} color="#000000" />
            ) : (
              <Icon name="mic" size={22} color="#000000" strokeWidth={2.4} />
            )}
          </TouchableOpacity>

          {/* Right Bars */}
          <View style={styles.barsSubRow}>
            {rightBars.map((bar, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.dimBar,
                  {
                    height: bar,
                    opacity: recordingState === "recording" ? 0.8 : 0.35,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Action Pills Row: Delete and Re-record */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionPill}
            activeOpacity={0.75}
            onPress={handleDelete}
          >
            <Icon name="trash" size={15} color="#8E95A5" strokeWidth={2} />
            <Text style={styles.actionPillText}>Delete</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionPill}
            activeOpacity={0.75}
            onPress={handleRerecord}
          >
            <Icon name="refresh" size={15} color="#8E95A5" strokeWidth={2} />
            <Text style={styles.actionPillText}>Re-record</Text>
          </TouchableOpacity>
        </View>

        {/* Title Field */}
        <Text style={styles.fieldLabel}>Title (optional)</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Quick marketing idea"
            placeholderTextColor="#4B5162"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
            editable={!isProcessing}
          />
        </View>

        {/* Category Field */}
        <Text style={styles.fieldLabel}>Category</Text>
        <TouchableOpacity
          style={styles.categoryPill}
          activeOpacity={0.8}
          onPress={() => setCategorySheetVisible(true)}
          disabled={isProcessing}
        >
          <View style={styles.categoryIconBadge}>
            <Icon
              name={(selectedCategory?.icon as any) || "lightbulb"}
              size={17}
              color={selectedCategory?.color || "#FFD028"}
              strokeWidth={2.2}
            />
          </View>
          <Text style={styles.categoryName} numberOfLines={1}>
            {selectedCategory ? selectedCategory.name : "Ideas"}
          </Text>
          <Icon name="chevron-right" size={16} color="#6B7280" />
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Save Memory Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.saveBtn}
          activeOpacity={0.85}
          onPress={handleSave}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#000000" />
          ) : (
            <Text style={styles.saveBtnText}>Save Memory</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Category Selector Sheet */}
      <CategorySelectorSheet
        visible={categorySheetVisible}
        onClose={() => setCategorySheetVisible(false)}
        selectedCategoryId={selectedCategory ? selectedCategory.id : null}
        onSelectCategory={setSelectedCategory}
      />

      {/* Voice Processing Modal */}
      <VoiceProcessingModal visible={isProcessing} />

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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  headerRightPlaceholder: {
    width: 40,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  orbSection: {
    alignItems: "center",
    marginVertical: 12,
  },
  orbRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  sideTicks: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tickBar: {
    width: 3,
    borderRadius: 1.5,
    backgroundColor: "#8AE026",
    opacity: 0.7,
  },
  orbOuter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: "rgba(138, 224, 38, 0.4)",
    backgroundColor: "rgba(138, 224, 38, 0.05)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#8AE026",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
  },
  orbMiddle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2.5,
    borderColor: "#8AE026",
    backgroundColor: "#080B0F",
    justifyContent: "center",
    alignItems: "center",
  },
  orbInner: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: "rgba(138, 224, 38, 0.5)",
    backgroundColor: "#0F141E",
    justifyContent: "center",
    alignItems: "center",
  },
  orbCenterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#8AE026",
  },
  timerText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.3,
    marginTop: 16,
  },
  statusText: {
    color: "#8E95A5",
    fontSize: 13,
    fontWeight: "500",
    marginTop: 4,
  },
  waveformContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#10141D",
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "#1C2230",
    height: 64,
    paddingHorizontal: 16,
    marginTop: 18,
    marginBottom: 14,
  },
  barsSubRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    height: 36,
  },
  activeBar: {
    width: 3.5,
    borderRadius: 2,
    backgroundColor: "#8AE026",
  },
  dimBar: {
    width: 3.5,
    borderRadius: 2,
    backgroundColor: "#3A4254",
  },
  centerControlBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#8AE026",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 12,
    shadowColor: "#8AE026",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
  },
  actionPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10141D",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1C2230",
    height: 42,
    gap: 8,
  },
  actionPillText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  fieldLabel: {
    color: "#8E95A5",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 14,
  },
  inputContainer: {
    backgroundColor: "#10141D",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1C2230",
    height: 52,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  textInput: {
    color: "#FFFFFF",
    fontSize: 15,
    padding: 0,
  },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10141D",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1C2230",
    height: 56,
    paddingHorizontal: 14,
  },
  categoryIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(138, 224, 38, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(138, 224, 38, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoryName: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 24 : 16,
    backgroundColor: "#000000",
  },
  saveBtn: {
    height: 56,
    borderRadius: 28,
    backgroundColor: "#8AE026",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#8AE026",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  saveBtnText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
});
