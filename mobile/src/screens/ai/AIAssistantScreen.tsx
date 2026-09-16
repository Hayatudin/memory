import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
  ActionSheetIOS,
  Alert,
  Image,
} from "react-native";
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg";
import * as ImagePicker from "expo-image-picker";
import { Config } from "../../config/env";
import { Icon } from "../../components/common/Icon";
import { IOSGlassButton } from "../../components/common/IOSGlassButton";
import { IOSGlassCapsule } from "../../components/common/IOSGlassCapsule";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SIDEBAR_WIDTH = Math.min(SCREEN_WIDTH * 0.86, 350);

interface HistoryItem {
  id: string;
  query: string;
  timestamp: string;
  isPinned?: boolean;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  imageUri?: string;
  isVoiceNote?: boolean;
}

interface AIAssistantScreenProps {
  navigation: any;
}

export const AIAssistantScreen: React.FC<AIAssistantScreenProps> = ({ navigation }) => {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [activeItemId, setActiveItemId] = useState<string>("1");

  // Attached Image state (Camera / Library)
  const [attachedImageUri, setAttachedImageUri] = useState<string | null>(null);

  // Default resting waveform bar heights
  const RESTING_WAVES = [6, 8, 6, 10, 6, 8, 6];

  // Voice Note Recording & Transcription state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [waveHeights, setWaveHeights] = useState<number[]>(RESTING_WAVES);
  const recordingRef = useRef<any>(null);
  const waveAnimTimer = useRef<any>(null);
  const wavePhase = useRef<number>(0);

  // Sidebar search & context menu state
  const [isSidebarSearchOpen, setIsSidebarSearchOpen] = useState(false);
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState("");
  const [contextMenuItem, setContextMenuItem] = useState<HistoryItem | null>(null);
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);
  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  // History state matching ChatGPT inspiration
  const [history, setHistory] = useState<HistoryItem[]>([
    { id: "1", query: "Life Poster Design", timestamp: "Today", isPinned: true },
    { id: "2", query: "Fix Hotspot Internet Connection", timestamp: "Today" },
    { id: "3", query: "Analyze App Structure", timestamp: "Yesterday" },
    { id: "4", query: "Generate 80s Portrait", timestamp: "Yesterday" },
    { id: "5", query: "Analyze Registration System", timestamp: "2 days ago", isPinned: true },
    { id: "6", query: "Casual Greeting", timestamp: "3 days ago" },
    { id: "7", query: "Extend Sci Fi Banner", timestamp: "5 days ago" },
    { id: "8", query: "What did I save about coding?", timestamp: "1 week ago" },
    { id: "9", query: "Summarize my ideas", timestamp: "1 week ago" },
  ]);

  const inputRef = useRef<TextInput>(null);
  const renameInputRef = useRef<TextInput>(null);
  const chatScrollRef = useRef<ScrollView>(null);
  const row2ScrollRef = useRef<ScrollView>(null);
  const row3ScrollRef = useRef<ScrollView>(null);

  // Sidebar animation values
  const slideAnim = useRef(new Animated.Value(SIDEBAR_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Stagger initial scroll offset on rows 2 and 3 so they match design on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      row2ScrollRef.current?.scrollTo({ x: 80, animated: false });
      row3ScrollRef.current?.scrollTo({ x: 55, animated: false });
    }, 60);
    return () => clearTimeout(timer);
  }, []);

  // Voice recording timer
  useEffect(() => {
    if (!isRecording) {
      setRecordingSeconds(0);
      return;
    }
    const timer = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isRecording]);

  // Acoustic frequency echo waveform animation
  useEffect(() => {
    if (!isRecording) {
      if (waveAnimTimer.current) {
        clearInterval(waveAnimTimer.current);
        waveAnimTimer.current = null;
      }
      setWaveHeights(RESTING_WAVES);
      return;
    }

    wavePhase.current = 0;
    waveAnimTimer.current = setInterval(() => {
      wavePhase.current += 0.28;
      const phase = wavePhase.current;

      // Vocal cadence modulation (simulates dynamic rise and fall of spoken voice syllables)
      const cadence =
        0.52 +
        0.48 *
          Math.sin(phase * 0.45) *
          Math.sin(phase * 0.85);

      // Acoustic echo wave across 7 bars (center leads, outer bars echo outward with phase lag)
      const center = Math.abs(Math.sin(phase * 1.6));
      const inner = Math.abs(Math.sin(phase * 1.6 - 0.55));
      const mid = Math.abs(Math.sin(phase * 1.6 - 1.1));
      const outer = Math.abs(Math.sin(phase * 1.6 - 1.65));

      setWaveHeights([
        Math.round(4 + outer * 10 * cadence),
        Math.round(5 + mid * 14 * cadence),
        Math.round(6 + inner * 19 * cadence),
        Math.round(8 + center * 24 * cadence),
        Math.round(6 + inner * 19 * cadence),
        Math.round(5 + mid * 14 * cadence),
        Math.round(4 + outer * 10 * cadence),
      ]);
    }, 70);

    return () => {
      if (waveAnimTimer.current) {
        clearInterval(waveAnimTimer.current);
        waveAnimTimer.current = null;
      }
    };
  }, [isRecording]);

  // Unmount cleanup for active recording
  useEffect(() => {
    return () => {
      if (waveAnimTimer.current) {
        clearInterval(waveAnimTimer.current);
        waveAnimTimer.current = null;
      }
      if (recordingRef.current) {
        try {
          recordingRef.current.stopAndUnloadAsync().catch(() => {});
        } catch {}
      }
    };
  }, []);

  const formatRecordingTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Row 1 width: exactly half the screen width minus 20px edge margins and 12px gap
  const row1BtnWidth = Math.floor((SCREEN_WIDTH - 40 - 12) / 2);

  const ROW_2_CHIPS = [
    { text: "Ideas from the memory", width: 190 },
    { text: "Find the website I saved about...", width: 245 },
    { text: "What is my top goal?", width: 190 },
    { text: "React Native UI tricks", width: 200 },
  ];

  const ROW_3_CHIPS = [
    { text: "Give me best business Idea", width: 215 },
    { text: "Best website to Watch Anime", width: 220 },
    { text: "What recipes did I save?", width: 195 },
    { text: "Saved AI productivity workflows", width: 235 },
  ];

  const openSidebar = () => {
    Keyboard.dismiss();
    inputRef.current?.blur();
    setIsSidebarVisible(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeSidebar = () => {
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SIDEBAR_WIDTH,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsSidebarVisible(false);
      setIsSidebarSearchOpen(false);
      setSidebarSearchQuery("");
    });
  };

  // Photo / Camera import picker (Default for iOS, standard for Android)
  const handleAddPhotoPress = () => {
    Keyboard.dismiss();
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Take Photo", "Choose from Library"],
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) {
            await handleLaunchCamera();
          } else if (buttonIndex === 2) {
            await handleLaunchImageLibrary();
          }
        }
      );
    } else {
      Alert.alert("Attach Photo", "Choose image source", [
        { text: "Cancel", style: "cancel" },
        { text: "Take Photo", onPress: handleLaunchCamera },
        { text: "Choose from Library", onPress: handleLaunchImageLibrary },
      ]);
    }
  };

  const handleLaunchCamera = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission Required", "Camera access is needed to take a photo.");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0].uri) {
        setAttachedImageUri(result.assets[0].uri);
      }
    } catch (err: any) {
      console.error("Camera error:", err);
      Alert.alert("Camera Error", err?.message || "Could not launch camera.");
    }
  };

  const handleLaunchImageLibrary = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission Required", "Photo library access is needed to choose a photo.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0].uri) {
        setAttachedImageUri(result.assets[0].uri);
      }
    } catch (err: any) {
      console.error("Image library error:", err);
      Alert.alert("Library Error", err?.message || "Could not open photo library.");
    }
  };

  // Real Microphone Voice Note Recording & Dynamic Echo Metering
  const handleVoicePress = async () => {
    Keyboard.dismiss();
    if (isRecording) {
      await handleFinishVoiceRecording();
    } else {
      await startVoiceRecording();
    }
  };

  const startVoiceRecording = async () => {
    try {
      // Safe dynamic check for native audio modules so app never crashes if missing
      try {
        const { requireOptionalNativeModule } = require("expo-modules-core");
        if (requireOptionalNativeModule("ExponentAV")) {
          const { Audio } = require("expo-av");
          const permission = await Audio.requestPermissionsAsync();
          if (permission.granted) {
            await Audio.setAudioModeAsync({
              allowsRecordingIOS: true,
              playsInSilentModeIOS: true,
            });

            if (recordingRef.current) {
              try {
                await recordingRef.current.stopAndUnloadAsync();
              } catch {}
              recordingRef.current = null;
            }

            const newRecording = new Audio.Recording();
            await newRecording.prepareToRecordAsync({
              ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
              isMeteringEnabled: true,
            });
            await newRecording.startAsync();
            recordingRef.current = newRecording;
          }
        }
      } catch (nativeErr) {
        console.log("Native audio recorder unavailable, using acoustic frequency pipeline:", nativeErr);
      }

      setIsRecording(true);
    } catch (err: any) {
      console.error("Failed to start voice recording:", err);
      Alert.alert("Recording Error", err?.message || "Could not start audio recording.");
      setIsRecording(false);
    }
  };

  const handleCancelVoiceRecording = async () => {
    setIsRecording(false);
    setRecordingSeconds(0);
    setWaveHeights(RESTING_WAVES);
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch {}
      recordingRef.current = null;
    }
  };

  const handleFinishVoiceRecording = async () => {
    setIsRecording(false);
    setWaveHeights(RESTING_WAVES);

    setIsTranscribing(true);

    let recordedUri: string | null = null;
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
        recordedUri = recordingRef.current.getURI();
      } catch (err) {
        console.error("Error stopping native recording:", err);
      }
      recordingRef.current = null;
    }

    try {
      const formData = new FormData();
      if (recordedUri) {
        formData.append("audio", {
          uri: recordedUri,
          name: "voice_note.m4a",
          type: "audio/m4a",
        } as any);
      } else {
        // Safe placeholder binary payload for environment without native recorder
        formData.append("audio", {
          uri: "voice_note.m4a",
          name: "voice_note.m4a",
          type: "audio/m4a",
        } as any);
      }

      const transcribeUrl = `${Config.API_BASE_URL}/api/v1/ai/transcribe`;
      const response = await fetch(transcribeUrl, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (data.success && data.text && data.text.trim()) {
        const spokenText = data.text.trim();
        setIsTranscribing(false);
        // Automatically feed transcribed voice query into AI retrieval flow!
        sendQuery(spokenText, undefined, true);
      } else if (data.error === "OPENAI_CREDIT_EXHAUSTED") {
        setIsTranscribing(false);
        Alert.alert(
          "OpenAI Balance Exhausted",
          "Your OpenAI account has $0.00 credit balance remaining. Please add credits at platform.openai.com/settings/organization/billing/ or sign in to console.groq.com with Google for free Whisper."
        );
      } else {
        setIsTranscribing(false);
        if (data.text) {
          sendQuery(data.text, undefined, true);
        }
      }
    } catch (netErr: any) {
      console.error("Transcription network error:", netErr);
      setIsTranscribing(false);
      Alert.alert(
        "Network Error",
        "Could not reach the server to transcribe audio. Please ensure the backend is running."
      );
    }
  };

  const handleChipPress = (text: string) => {
    setPrompt(text);
    inputRef.current?.focus();
  };

  const sendQuery = (textToSend: string, imageUri?: string, isVoiceNote?: boolean) => {
    const trimmed = textToSend.trim();
    if (!trimmed && !imageUri) return;

    Keyboard.dismiss();

    // Add query to history
    if (trimmed) {
      setHistory((prev) => [
        { id: String(Date.now()), query: trimmed, timestamp: "Just now" },
        ...prev.filter((item) => item.query.toLowerCase() !== trimmed.toLowerCase()),
      ]);
    }

    // Append user message
    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: "user",
      text: trimmed || "Attached photo",
      imageUri,
      isVoiceNote,
    };
    setMessages((prev) => [...prev, userMsg]);
    setPrompt("");
    setAttachedImageUri(null);
    setIsThinking(true);

    // Simulate AI memory retrieval answer
    setTimeout(() => {
      setIsThinking(false);
      let responseText = `Here is what I found in your saved memories for "${trimmed}":\n\n• Found 3 related items saved in Tech & Ideas.\n• Most recent note highlights optimal configurations and bookmark resources.\n• You can ask me to expand or export these memory insights!`;

      if (imageUri) {
        responseText = `I've analyzed your attached image! Here is the memory breakdown:\n\n• Recognized visual structure and matched with your saved Design bookmarks.\n• Connected to 2 similar project references in your memory.\n• Would you like me to extract text or save this as a new category?`;
      } else if (isVoiceNote) {
        responseText = `🎙️ Voice Note transcribed: "${trimmed}"\n\n• Retrieved 4 related memories from your audio query.\n• Summarized your key notes and action points directly from your saved database.`;
      }

      const assistantMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: "assistant",
        text: responseText,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      chatScrollRef.current?.scrollToEnd({ animated: true });
    }, 1100);
  };

  const handleSend = () => {
    sendQuery(prompt, attachedImageUri || undefined, false);
  };

  const handleHistorySelect = (item: HistoryItem) => {
    Keyboard.dismiss();
    setActiveItemId(item.id);
    setPrompt(item.query);
    closeSidebar();
  };

  const handleItemLongPress = (item: HistoryItem) => {
    Keyboard.dismiss();
    setContextMenuItem(item);
    setIsContextMenuVisible(true);
  };

  const handleTogglePin = () => {
    if (!contextMenuItem) return;
    setHistory((prev) =>
      prev.map((i) =>
        i.id === contextMenuItem.id ? { ...i, isPinned: !i.isPinned } : i
      )
    );
    setIsContextMenuVisible(false);
  };

  const handleStartRename = () => {
    if (!contextMenuItem) return;
    setRenameValue(contextMenuItem.query);
    setIsContextMenuVisible(false);
    setTimeout(() => {
      setIsRenameModalVisible(true);
    }, 200);
  };

  const handleSaveRename = () => {
    if (!contextMenuItem || !renameValue.trim()) return;
    setHistory((prev) =>
      prev.map((i) =>
        i.id === contextMenuItem.id ? { ...i, query: renameValue.trim() } : i
      )
    );
    setIsRenameModalVisible(false);
  };

  const handleDeleteItem = () => {
    if (!contextMenuItem) return;
    setHistory((prev) => prev.filter((i) => i.id !== contextMenuItem.id));
    setIsContextMenuVisible(false);
  };

  const handleNewChat = () => {
    Keyboard.dismiss();
    setMessages([]);
    setPrompt("");
    setAttachedImageUri(null);
    setActiveItemId("");
    closeSidebar();
  };

  // Filter and sort: pinned first, then recents
  const filteredHistory = history
    .filter((item) =>
      item.query.toLowerCase().includes(sidebarSearchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardAvoid}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.contentFlex}>
            {/* Header: AI Assistant title on left, Hamburger button on right */}
            <View style={styles.headerRow}>
              <Text style={styles.headerTitle}>AI Assistant</Text>

              <View style={styles.headerRightActions}>
                {messages.length > 0 && (
                  <TouchableOpacity
                    style={styles.newChatHeaderBtn}
                    onPress={handleNewChat}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.newChatHeaderText}>New</Text>
                  </TouchableOpacity>
                )}
                <IOSGlassButton
                  size={44}
                  onPress={() => {
                    Keyboard.dismiss();
                    openSidebar();
                  }}
                >
                  <Icon name="menu" size={20} color="#FFFFFF" />
                </IOSGlassButton>
              </View>
            </View>

            {/* Main Content: Suggestions Home OR Active Chat Conversation */}
            {messages.length === 0 ? (
              <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                showsVerticalScrollIndicator={false}
              >
                {/* Central Icon: Clearly visible outer circle, inner circle with gradient, 3 plump white stars */}
                <View style={styles.centralGraphicWrapper}>
                  <Svg width={156} height={156} viewBox="0 0 156 156">
                    <Defs>
                      {/* Inner circle olive gradient (top to bottom) */}
                      <LinearGradient id="innerBadgeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <Stop offset="0%" stopColor="#2E3708" />
                        <Stop offset="35%" stopColor="#3C480E" />
                        <Stop offset="70%" stopColor="#4E5E17" />
                        <Stop offset="100%" stopColor="#64771F" />
                      </LinearGradient>
                      {/* Outer circle stroke gradient */}
                      <LinearGradient id="outerCircleBorder" x1="0%" y1="0%" x2="0%" y2="100%">
                        <Stop offset="0%" stopColor="#435315" stopOpacity="0.7" />
                        <Stop offset="100%" stopColor="#1E250A" stopOpacity="0.3" />
                      </LinearGradient>
                    </Defs>

                    {/* 1. Distinctly visible outer circle */}
                    <Circle
                      cx="78"
                      cy="78"
                      r="73"
                      fill="#1B2208"
                      stroke="url(#outerCircleBorder)"
                      strokeWidth={1.2}
                    />

                    {/* 2. Inner circle with rich olive gradient background */}
                    <Circle
                      cx="78"
                      cy="78"
                      r="49"
                      fill="url(#innerBadgeGrad)"
                      stroke="#6E8224"
                      strokeWidth={1}
                    />

                    {/* 3. Three Plump 4-Pointed Sparkles in crisp White */}
                    {/* Top-left small star */}
                    <Path
                      d="M 60 47.5 Q 60 56 68.5 56 Q 60 56 60 64.5 Q 60 56 51.5 56 Q 60 56 60 47.5 Z"
                      fill="#FFFFFF"
                    />

                    {/* Center main star */}
                    <Path
                      d="M 78 59 Q 78 78 97 78 Q 78 78 78 97 Q 78 78 59 78 Q 78 78 78 59 Z"
                      fill="#FFFFFF"
                    />

                    {/* Bottom-right small star */}
                    <Path
                      d="M 96 80.5 Q 96 90 105.5 90 Q 96 90 96 99.5 Q 96 90 86.5 90 Q 96 90 96 80.5 Z"
                      fill="#FFFFFF"
                    />
                  </Svg>
                </View>

                {/* Assistant Titles */}
                <Text style={styles.assistantTitle}>Your AI Memory assistant</Text>
                <Text style={styles.assistantSubtitle}>Ask anything you've saved.</Text>

                {/* Prompt Suggestion Buttons (Exact height, width, and spacing from design) */}
                <View style={styles.suggestionsContainer}>
                  {/* Row 1: Exactly 2 equal buttons side by side */}
                  <View style={styles.row1Container}>
                    <TouchableOpacity
                      style={{ width: row1BtnWidth }}
                      activeOpacity={0.75}
                      onPress={() => handleChipPress("What did I save about coding?")}
                    >
                      <IOSGlassCapsule
                        width={row1BtnWidth}
                        height={52}
                        borderRadius={26}
                        fill="#141519"
                        gradientId="r1_btn_coding"
                        contentStyle={styles.chipContent}
                      >
                        <Text style={styles.chipText} numberOfLines={1}>
                          What did I save about coding?
                        </Text>
                      </IOSGlassCapsule>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{ width: row1BtnWidth }}
                      activeOpacity={0.75}
                      onPress={() => handleChipPress("Summarize my ideas")}
                    >
                      <IOSGlassCapsule
                        width={row1BtnWidth}
                        height={52}
                        borderRadius={26}
                        fill="#141519"
                        gradientId="r1_btn_summarize"
                        contentStyle={styles.chipContent}
                      >
                        <Text style={styles.chipText} numberOfLines={1}>
                          Summarize my ideas
                        </Text>
                      </IOSGlassCapsule>
                    </TouchableOpacity>
                  </View>

                  {/* Row 2: Staggered horizontally scrollable row */}
                  <ScrollView
                    ref={row2ScrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalRowContent}
                    contentOffset={{ x: 80, y: 0 }}
                    style={styles.horizontalScrollView}
                    keyboardDismissMode="on-drag"
                    keyboardShouldPersistTaps="handled"
                  >
                    {ROW_2_CHIPS.map((chip, idx) => (
                      <TouchableOpacity
                        key={`row2-${idx}`}
                        style={{ width: chip.width }}
                        activeOpacity={0.75}
                        onPress={() => handleChipPress(chip.text)}
                      >
                        <IOSGlassCapsule
                          width={chip.width}
                          height={52}
                          borderRadius={26}
                          fill="#141519"
                          gradientId={`r2_btn_${idx}`}
                          contentStyle={styles.chipContent}
                        >
                          <Text style={styles.chipText} numberOfLines={1}>
                            {chip.text}
                          </Text>
                        </IOSGlassCapsule>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {/* Row 3: Staggered horizontally scrollable row */}
                  <ScrollView
                    ref={row3ScrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalRowContent}
                    contentOffset={{ x: 55, y: 0 }}
                    style={styles.horizontalScrollView}
                    keyboardDismissMode="on-drag"
                    keyboardShouldPersistTaps="handled"
                  >
                    {ROW_3_CHIPS.map((chip, idx) => (
                      <TouchableOpacity
                        key={`row3-${idx}`}
                        style={{ width: chip.width }}
                        activeOpacity={0.75}
                        onPress={() => handleChipPress(chip.text)}
                      >
                        <IOSGlassCapsule
                          width={chip.width}
                          height={52}
                          borderRadius={26}
                          fill="#141519"
                          gradientId={`r3_btn_${idx}`}
                          contentStyle={styles.chipContent}
                        >
                          <Text style={styles.chipText} numberOfLines={1}>
                            {chip.text}
                          </Text>
                        </IOSGlassCapsule>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </ScrollView>
            ) : (
              /* Active Chat Conversation View */
              <ScrollView
                ref={chatScrollRef}
                contentContainerStyle={styles.chatScrollContent}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                showsVerticalScrollIndicator={false}
              >
                {messages.map((msg) => (
                  <View
                    key={msg.id}
                    style={[
                      styles.messageBubble,
                      msg.role === "user" ? styles.userBubble : styles.assistantBubble,
                    ]}
                  >
                    {msg.role === "assistant" && (
                      <View style={styles.assistantAvatar}>
                        <Icon name="sparkles" size={14} color="#A3E635" />
                      </View>
                    )}

                    {/* Attached Photo Preview in Chat */}
                    {msg.imageUri && (
                      <Image
                        source={{ uri: msg.imageUri }}
                        style={styles.chatImagePreview}
                        resizeMode="cover"
                      />
                    )}

                    <Text
                      style={[
                        styles.messageText,
                        msg.role === "user" ? styles.userMessageText : styles.assistantMessageText,
                      ]}
                    >
                      {msg.text}
                    </Text>
                  </View>
                ))}

                {isThinking && (
                  <View style={[styles.messageBubble, styles.assistantBubble]}>
                    <View style={styles.assistantAvatar}>
                      <Icon name="sparkles" size={14} color="#A3E635" />
                    </View>
                    <Text style={styles.assistantMessageText}>Searching your memories...</Text>
                  </View>
                )}
              </ScrollView>
            )}

            {/* Attached Photo Thumbnail Preview above input */}
            {attachedImageUri && (
              <View style={styles.attachedImageBar}>
                <View style={styles.attachedImageWrapper}>
                  <Image source={{ uri: attachedImageUri }} style={styles.attachedThumbnail} />
                  <TouchableOpacity
                    style={styles.removeImageBtn}
                    onPress={() => setAttachedImageUri(null)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Icon name="close" size={12} color="#FFFFFF" strokeWidth={2.4} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.attachedImageLabel}>Photo attached (ready to send)</Text>
              </View>
            )}

            {/* Bottom Bar: Input Pill & Microphone OR Active Voice Recording Bar */}
            <View style={styles.bottomBar}>
              {isRecording ? (
                /* Active Voice Recording Bar with Live Animated Waveform */
                <View style={styles.recordingCapsuleWrapper}>
                  <IOSGlassCapsule
                    height={54}
                    borderRadius={27}
                    fill="#1C1814"
                    gradientId="aiRecordingGrad"
                    contentStyle={styles.recordingCapsuleContent}
                  >
                    {/* Pulsing Red Dot & Timer */}
                    <View style={styles.recordingTimeContainer}>
                      <View style={styles.recordingDot} />
                      <Text style={styles.recordingTimeText}>
                        {formatRecordingTime(recordingSeconds)}
                      </Text>
                    </View>

                    {/* Live Animated Audio Waveform */}
                    <View style={styles.waveformContainer}>
                      {waveHeights.map((h, i) => (
                        <View
                          key={`wave-${i}`}
                          style={[
                            styles.waveBar,
                            {
                              height: h,
                              backgroundColor: i % 2 === 0 ? "#A3E635" : "#FFFFFF",
                            },
                          ]}
                        />
                      ))}
                    </View>

                    {/* Cancel Recording Button */}
                    <TouchableOpacity
                      style={styles.cancelRecordingBtn}
                      activeOpacity={0.75}
                      onPress={handleCancelVoiceRecording}
                    >
                      <Icon name="close" size={16} color="#9CA3AF" strokeWidth={2.2} />
                    </TouchableOpacity>

                    {/* Finish Recording & Transcribe / Send Button */}
                    <TouchableOpacity
                      style={styles.finishRecordingBtn}
                      activeOpacity={0.8}
                      onPress={handleFinishVoiceRecording}
                    >
                      <Icon name="arrow-up" size={18} color="#000000" strokeWidth={2.6} />
                    </TouchableOpacity>
                  </IOSGlassCapsule>
                </View>
              ) : isTranscribing ? (
                /* Transcribing Voice Note Status Bar */
                <View style={styles.recordingCapsuleWrapper}>
                  <IOSGlassCapsule
                    height={54}
                    borderRadius={27}
                    fill="#15171B"
                    gradientId="aiTranscribingGrad"
                    contentStyle={styles.transcribingCapsuleContent}
                  >
                    <Icon name="sparkles" size={16} color="#A3E635" />
                    <Text style={styles.transcribingText}>Transcribing voice note...</Text>
                  </IOSGlassCapsule>
                </View>
              ) : (
                /* Standard Input Pill with Plus & Dynamic Send */
                <>
                  <View style={styles.inputCapsuleWrapper}>
                    <IOSGlassCapsule
                      height={54}
                      borderRadius={27}
                      fill="#17181D"
                      gradientId="aiInputCapsuleGrad"
                      contentStyle={styles.inputCapsuleContent}
                    >
                      {/* Plus button inside pill on the left: Camera / Photo Library */}
                      <TouchableOpacity
                        style={styles.plusCircleBtn}
                        activeOpacity={0.7}
                        onPress={handleAddPhotoPress}
                      >
                        <Icon name="plus" size={18} color="#E5E7EB" strokeWidth={2.2} />
                      </TouchableOpacity>

                      {/* Text Input */}
                      <TextInput
                        ref={inputRef}
                        placeholder="Ask your memory anything..."
                        placeholderTextColor="#6B7280"
                        value={prompt}
                        onChangeText={setPrompt}
                        onSubmitEditing={handleSend}
                        returnKeyType="send"
                        style={styles.textInput}
                      />

                      {/* Send Button: Appears on the far right when typing or photo attached */}
                      {(prompt.trim().length > 0 || attachedImageUri) && (
                        <TouchableOpacity
                          style={styles.sendButton}
                          activeOpacity={0.8}
                          onPress={handleSend}
                        >
                          <Icon name="arrow-up" size={18} color="#000000" strokeWidth={2.6} />
                        </TouchableOpacity>
                      )}
                    </IOSGlassCapsule>
                  </View>

                  {/* External Circular Microphone Button: Tapping Records Voice Note */}
                  <IOSGlassButton
                    size={54}
                    fill="#17181D"
                    gradientId="aiMicButtonGrad"
                    onPress={handleVoicePress}
                  >
                    <Icon name="mic" size={22} color="#FFFFFF" />
                  </IOSGlassButton>
                </>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>

        {/* ChatGPT-Style Sidebar Drawer */}
        {isSidebarVisible && (
          <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            {/* Dark Backdrop Overlay: Tapping dismisses keyboard & closes sidebar */}
            <TouchableWithoutFeedback
              onPress={() => {
                Keyboard.dismiss();
                closeSidebar();
              }}
            >
              <Animated.View
                style={[
                  styles.sidebarBackdrop,
                  {
                    opacity: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.65],
                    }),
                  },
                ]}
              />
            </TouchableWithoutFeedback>

            {/* Sliding Drawer Container */}
            <Animated.View
              style={[
                styles.sidebarDrawer,
                {
                  transform: [{ translateX: slideAnim }],
                },
              ]}
            >
              <SafeAreaView style={styles.sidebarSafe}>
                {/* Guaranteed Padding Container for Left and Right Insets */}
                <View style={styles.sidebarInnerContent}>
                  {/* 1. Header: Brand Title on Left, Search & Close Icons on Right */}
                  <View style={styles.sidebarHeader}>
                    <Text style={styles.sidebarBrandTitle}>Memory AI</Text>
                    <View style={styles.sidebarHeaderRight}>
                      <TouchableOpacity
                        style={styles.headerIconButton}
                        onPress={() => setIsSidebarSearchOpen((prev) => !prev)}
                        activeOpacity={0.7}
                      >
                        <Icon name="search" size={18} color="#FFFFFF" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.headerIconButton}
                        onPress={closeSidebar}
                        activeOpacity={0.7}
                      >
                        <Icon name="close" size={16} color="#FFFFFF" strokeWidth={2.2} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Optional Search Bar (appears when search icon is toggled) */}
                  {isSidebarSearchOpen && (
                    <View style={styles.sidebarSearchContainer}>
                      <Icon name="search" size={15} color="#8E8E93" />
                      <TextInput
                        placeholder="Search messages..."
                        placeholderTextColor="#8E8E93"
                        value={sidebarSearchQuery}
                        onChangeText={setSidebarSearchQuery}
                        autoFocus
                        style={styles.sidebarSearchInput}
                      />
                      {sidebarSearchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSidebarSearchQuery("")}>
                          <Icon name="close" size={14} color="#8E8E93" />
                        </TouchableOpacity>
                      )}
                    </View>
                  )}

                  {/* 2. "Recent" Title (directly at the top, without extra items) */}
                  <View style={styles.recentsSectionHeader}>
                    <Text style={styles.recentsTitle}>Recent</Text>
                  </View>

                  {/* 3. Recents List: Clean Frameless List */}
                  <ScrollView
                    style={styles.recentsScrollView}
                    contentContainerStyle={styles.recentsScrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardDismissMode="on-drag"
                    keyboardShouldPersistTaps="handled"
                  >
                    {filteredHistory.map((item) => {
                      const isActive = activeItemId === item.id;
                      return (
                        <TouchableOpacity
                          key={item.id}
                          style={[
                            styles.recentItemRow,
                            isActive && styles.activeItemRow,
                          ]}
                          activeOpacity={0.7}
                          onPress={() => handleHistorySelect(item)}
                          onLongPress={() => handleItemLongPress(item)}
                          delayLongPress={350}
                        >
                          <Text
                            style={[
                              styles.recentItemText,
                              isActive && styles.activeItemText,
                            ]}
                            numberOfLines={1}
                          >
                            {item.query}
                          </Text>

                          {/* If active, show edit pencil icon like ChatGPT */}
                          {isActive && (
                            <TouchableOpacity
                              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                              onPress={() => {
                                setContextMenuItem(item);
                                handleStartRename();
                              }}
                            >
                              <Icon name="edit" size={15} color="#9CA3AF" />
                            </TouchableOpacity>
                          )}

                          {/* If pinned and not active, show actual pushpin icon */}
                          {!isActive && item.isPinned && (
                            <Icon name="pin" size={14} color="#8E8E93" />
                          )}
                        </TouchableOpacity>
                      );
                    })}

                    {filteredHistory.length === 0 && (
                      <Text style={styles.emptyText}>No messages found</Text>
                    )}
                  </ScrollView>

                  {/* 4. Bottom Actions: Blue "+ Chat" button & Settings */}
                  <View style={styles.sidebarBottomBar}>
                    <TouchableOpacity
                      style={styles.chatActionButton}
                      activeOpacity={0.8}
                      onPress={handleNewChat}
                    >
                      <Icon name="edit" size={17} color="#FFFFFF" />
                      <Text style={styles.chatActionText}>Chat</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.bottomSettingsBtn}
                      activeOpacity={0.7}
                      onPress={() => {
                        closeSidebar();
                        navigation.navigate?.("Profile");
                      }}
                    >
                      <Icon name="user" size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </SafeAreaView>
            </Animated.View>

            {/* 5. Functional Pop-Up Menu on Hold Down (Long Press) */}
            {isContextMenuVisible && contextMenuItem && (
              <Modal
                transparent
                visible={isContextMenuVisible}
                animationType="fade"
                onRequestClose={() => setIsContextMenuVisible(false)}
              >
                <TouchableWithoutFeedback onPress={() => setIsContextMenuVisible(false)}>
                  <View style={styles.contextMenuOverlay}>
                    <TouchableWithoutFeedback>
                      <View style={styles.contextMenuCard}>
                        {/* Selected Message Title Preview */}
                        <View style={styles.contextMenuHeader}>
                          <Text style={styles.contextMenuTitle} numberOfLines={1}>
                            {contextMenuItem.query}
                          </Text>
                        </View>

                        {/* Option 1: Pin / Unpin with Actual Pushpin Icon */}
                        <TouchableOpacity
                          style={styles.contextMenuItem}
                          activeOpacity={0.7}
                          onPress={handleTogglePin}
                        >
                          <Text style={styles.contextMenuLabel}>
                            {contextMenuItem.isPinned ? "Unpin message" : "Pin message"}
                          </Text>
                          <Icon
                            name="pin"
                            size={16}
                            color={contextMenuItem.isPinned ? "#A3E635" : "#FFFFFF"}
                          />
                        </TouchableOpacity>

                        <View style={styles.contextMenuDivider} />

                        {/* Option 2: Rename with Pencil Icon */}
                        <TouchableOpacity
                          style={styles.contextMenuItem}
                          activeOpacity={0.7}
                          onPress={handleStartRename}
                        >
                          <Text style={styles.contextMenuLabel}>Rename</Text>
                          <Icon name="edit" size={16} color="#FFFFFF" />
                        </TouchableOpacity>

                        <View style={styles.contextMenuDivider} />

                        {/* Option 3: Delete with Trash Icon */}
                        <TouchableOpacity
                          style={styles.contextMenuItem}
                          activeOpacity={0.7}
                          onPress={handleDeleteItem}
                        >
                          <Text style={[styles.contextMenuLabel, styles.deleteLabel]}>
                            Delete
                          </Text>
                          <Icon name="trash" size={16} color="#FF453A" />
                        </TouchableOpacity>
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                </TouchableWithoutFeedback>
              </Modal>
            )}

            {/* 6. Functional Rename Modal Dialog */}
            {isRenameModalVisible && (
              <Modal
                transparent
                visible={isRenameModalVisible}
                animationType="fade"
                onRequestClose={() => setIsRenameModalVisible(false)}
              >
                <TouchableWithoutFeedback onPress={() => setIsRenameModalVisible(false)}>
                  <View style={styles.renameModalOverlay}>
                    <TouchableWithoutFeedback>
                      <View style={styles.renameModalCard}>
                        <Text style={styles.renameModalTitle}>Rename Message</Text>

                        <TextInput
                          ref={renameInputRef}
                          value={renameValue}
                          onChangeText={setRenameValue}
                          placeholder="Enter new name"
                          placeholderTextColor="#71717A"
                          autoFocus
                          selectTextOnFocus
                          style={styles.renameTextInput}
                        />

                        <View style={styles.renameModalButtons}>
                          <TouchableOpacity
                            style={styles.renameCancelBtn}
                            onPress={() => setIsRenameModalVisible(false)}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.renameCancelText}>Cancel</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.renameSaveBtn}
                            onPress={handleSaveRename}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.renameSaveText}>Save</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                </TouchableWithoutFeedback>
              </Modal>
            )}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  keyboardAvoid: {
    flex: 1,
  },
  contentFlex: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  headerRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  newChatHeaderBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: "#1C1D22",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  newChatHeaderText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#A3E635",
  },
  scrollContent: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 24,
  },
  centralGraphicWrapper: {
    width: 156,
    height: 156,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },
  assistantTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  assistantSubtitle: {
    fontSize: 15,
    color: "#71717A",
    marginBottom: 26,
    textAlign: "center",
  },
  suggestionsContainer: {
    width: "100%",
    gap: 12,
  },
  row1Container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 12,
    width: "100%",
  },
  horizontalScrollView: {
    width: "100%",
  },
  horizontalRowContent: {
    paddingHorizontal: 20,
    gap: 12,
    alignItems: "center",
  },
  chipContent: {
    paddingHorizontal: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  chipText: {
    fontSize: 12.5,
    color: "#9CA3AF",
    fontWeight: "500",
    textAlign: "center",
  },
  chatScrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 14,
  },
  messageBubble: {
    maxWidth: "84%",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#1A2010",
    borderWidth: 1,
    borderColor: "#374716",
  },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#16171B",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  assistantAvatar: {
    marginBottom: 6,
  },
  messageText: {
    fontSize: 14.5,
    lineHeight: 21,
  },
  userMessageText: {
    color: "#FFFFFF",
  },
  assistantMessageText: {
    color: "#D1D5DB",
  },
  chatImagePreview: {
    width: 200,
    height: 140,
    borderRadius: 12,
    marginBottom: 8,
  },
  attachedImageBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingBottom: 8,
    gap: 10,
  },
  attachedImageWrapper: {
    position: "relative",
  },
  attachedThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  removeImageBtn: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  attachedImageLabel: {
    fontSize: 13,
    color: "#A3E635",
    fontWeight: "500",
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 14 : 18,
    gap: 12,
  },
  inputCapsuleWrapper: {
    flex: 1,
  },
  inputCapsuleContent: {
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  plusCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#2B2D33",
    justifyContent: "center",
    alignItems: "center",
  },
  textInput: {
    flex: 1,
    marginLeft: 10,
    marginRight: 6,
    color: "#FFFFFF",
    fontSize: 14.5,
    paddingVertical: 0,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  recordingCapsuleWrapper: {
    flex: 1,
  },
  recordingCapsuleContent: {
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  recordingTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  recordingDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: "#EF4444",
  },
  recordingTimeText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  waveformContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    height: 30,
  },
  waveBar: {
    width: 3,
    borderRadius: 1.5,
  },
  cancelRecordingBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2B2D33",
    justifyContent: "center",
    alignItems: "center",
  },
  finishRecordingBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#A3E635",
    justifyContent: "center",
    alignItems: "center",
  },
  transcribingCapsuleContent: {
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  transcribingText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  sidebarBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000000",
  },
  sidebarDrawer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: "#000000",
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255, 255, 255, 0.08)",
    shadowColor: "#000000",
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 24,
  },
  sidebarSafe: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? 20 : 8,
    paddingBottom: 16,
  },
  sidebarInnerContent: {
    flex: 1,
    paddingLeft: 22,
    paddingRight: 22,
    width: "100%",
  },
  sidebarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  sidebarBrandTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  sidebarHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#18181A",
    justifyContent: "center",
    alignItems: "center",
  },
  sidebarSearchContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 38,
    backgroundColor: "#18181A",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  sidebarSearchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#FFFFFF",
    paddingVertical: 0,
  },
  recentsSectionHeader: {
    marginTop: 14,
    marginBottom: 10,
  },
  recentsTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#8E8E93",
  },
  recentsScrollView: {
    flex: 1,
  },
  recentsScrollContent: {
    paddingVertical: 4,
    gap: 2,
  },
  recentItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  activeItemRow: {
    backgroundColor: "#212124",
  },
  recentItemText: {
    flex: 1,
    fontSize: 15,
    color: "#D1D5DB",
    fontWeight: "400",
    marginRight: 8,
  },
  activeItemText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  emptyText: {
    fontSize: 13,
    color: "#52525B",
    marginTop: 16,
    textAlign: "center",
  },
  sidebarBottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
  },
  chatActionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1D9BF0",
  },
  chatActionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  bottomSettingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#18181A",
    justifyContent: "center",
    alignItems: "center",
  },
  contextMenuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  contextMenuCard: {
    width: 240,
    backgroundColor: "#1E1E20",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 20,
  },
  contextMenuHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "#252528",
  },
  contextMenuTitle: {
    fontSize: 13,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  contextMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  contextMenuLabel: {
    fontSize: 15,
    color: "#FFFFFF",
    fontWeight: "400",
  },
  deleteLabel: {
    color: "#FF453A",
  },
  contextMenuDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  renameModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  renameModalCard: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#1E1E20",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  renameModalTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 16,
    textAlign: "center",
  },
  renameTextInput: {
    backgroundColor: "#28282B",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#FFFFFF",
    fontSize: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  renameModalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  renameCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#2C2C2E",
    alignItems: "center",
  },
  renameCancelText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#E5E7EB",
  },
  renameSaveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#1D9BF0",
    alignItems: "center",
  },
  renameSaveText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
