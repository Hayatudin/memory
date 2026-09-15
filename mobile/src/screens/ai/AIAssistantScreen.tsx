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
} from "react-native";
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { Icon } from "../../components/common/Icon";
import { IOSGlassButton } from "../../components/common/IOSGlassButton";
import { IOSGlassCapsule } from "../../components/common/IOSGlassCapsule";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SIDEBAR_WIDTH = Math.min(SCREEN_WIDTH * 0.86, 350);

interface HistoryItem {
  id: string;
  query: string;
  timestamp: string;
  category?: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

interface AIAssistantScreenProps {
  navigation: any;
}

export const AIAssistantScreen: React.FC<AIAssistantScreenProps> = ({ navigation }) => {
  const [prompt, setPrompt] = useState("");
  const [searchHistoryFilter, setSearchHistoryFilter] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  // History state
  const [history, setHistory] = useState<HistoryItem[]>([
    { id: "1", query: "What did I save about coding?", timestamp: "10m ago", category: "Coding" },
    { id: "2", query: "Summarize my ideas", timestamp: "2h ago", category: "Ideas" },
    { id: "3", query: "Find the website I saved about React", timestamp: "Yesterday", category: "Coding" },
    { id: "4", query: "Best website to Watch Anime", timestamp: "2 days ago", category: "Anime" },
    { id: "5", query: "Give me best business Idea", timestamp: "3 days ago", category: "Business" },
    { id: "6", query: "Summary of project milestones", timestamp: "5 days ago", category: "Work" },
  ]);

  const inputRef = useRef<TextInput>(null);
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
    });
  };

  const handleChipPress = (text: string) => {
    setPrompt(text);
    inputRef.current?.focus();
  };

  const handleSend = () => {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    // Add to history
    setHistory((prev) => [
      { id: String(Date.now()), query: trimmed, timestamp: "Just now", category: "Recent" },
      ...prev.filter((item) => item.query.toLowerCase() !== trimmed.toLowerCase()),
    ]);

    // Append user message
    const userMsg: ChatMessage = { id: String(Date.now()), role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setPrompt("");
    setIsThinking(true);

    // Simulate AI memory retrieval answer
    setTimeout(() => {
      setIsThinking(false);
      const assistantMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: "assistant",
        text: `Here is what I found in your saved memories for "${trimmed}":\n\n• Found 3 related items saved in Tech & Ideas.\n• Most recent note highlights optimal configurations and bookmark resources.\n• You can ask me to expand or export these memory insights!`,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      chatScrollRef.current?.scrollToEnd({ animated: true });
    }, 1000);
  };

  const handleHistorySelect = (query: string) => {
    setPrompt(query);
    closeSidebar();
    inputRef.current?.focus();
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAllHistory = () => {
    setHistory([]);
  };

  const handleNewChat = () => {
    setMessages([]);
    setPrompt("");
    closeSidebar();
  };

  const filteredHistory = history.filter((item) =>
    item.query.toLowerCase().includes(searchHistoryFilter.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardAvoid}
      >
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
            <IOSGlassButton size={44} onPress={openSidebar}>
              <Icon name="menu" size={20} color="#FFFFFF" />
            </IOSGlassButton>
          </View>
        </View>

        {/* Main Content: Suggestions Home OR Active Chat Conversation */}
        {messages.length === 0 ? (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
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

        {/* Bottom Bar: Search Pill with Plus, Input, Dynamic Send Icon + Mic */}
        <View style={styles.bottomBar}>
          <View style={styles.inputCapsuleWrapper}>
            <IOSGlassCapsule
              height={54}
              borderRadius={27}
              fill="#17181D"
              gradientId="aiInputCapsuleGrad"
              contentStyle={styles.inputCapsuleContent}
            >
              {/* Plus button inside pill on the left */}
              <TouchableOpacity
                style={styles.plusCircleBtn}
                activeOpacity={0.7}
                onPress={() => {}}
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

              {/* Send Button: Appears on the far right when typing */}
              {prompt.trim().length > 0 && (
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

          {/* External Circular Microphone Button */}
          <IOSGlassButton
            size={54}
            fill="#17181D"
            gradientId="aiMicButtonGrad"
            onPress={() => {}}
          >
            <Icon name="mic" size={22} color="#FFFFFF" />
          </IOSGlassButton>
        </View>

        {/* Native iOS 16+ Style Sliding History Sidebar */}
        {isSidebarVisible && (
          <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            {/* Dark Backdrop Overlay */}
            <TouchableWithoutFeedback onPress={closeSidebar}>
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

            {/* Sliding Drawer Container with generous padding */}
            <Animated.View
              style={[
                styles.sidebarDrawer,
                {
                  transform: [{ translateX: slideAnim }],
                },
              ]}
            >
              <SafeAreaView style={styles.sidebarSafe}>
                {/* 1. iOS Navigation Header */}
                <View style={styles.sidebarNavHeader}>
                  <Text style={styles.sidebarNavTitle}>History</Text>
                  <IOSGlassButton size={34} onPress={closeSidebar}>
                    <Icon name="close" size={15} color="#FFFFFF" strokeWidth={2.4} />
                  </IOSGlassButton>
                </View>

                {/* 2. iOS 16 Search Bar */}
                <View style={styles.sidebarSearchBar}>
                  <Icon name="search" size={15} color="#8E8E93" />
                  <TextInput
                    placeholder="Search history..."
                    placeholderTextColor="#8E8E93"
                    value={searchHistoryFilter}
                    onChangeText={setSearchHistoryFilter}
                    style={styles.sidebarSearchInput}
                  />
                  {searchHistoryFilter.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchHistoryFilter("")}>
                      <Icon name="close" size={14} color="#8E8E93" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* 3. iOS 16 Primary Action Button */}
                <TouchableOpacity
                  style={styles.newSearchActionBtn}
                  activeOpacity={0.75}
                  onPress={handleNewChat}
                >
                  <Icon name="plus" size={17} color="#A3E635" strokeWidth={2.4} />
                  <Text style={styles.newSearchActionText}>New Chat</Text>
                </TouchableOpacity>

                <ScrollView
                  style={styles.sidebarScroll}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.sidebarScrollContent}
                >
                  {/* 4. iOS 16 Inset Grouped Section: Recent Queries */}
                  <Text style={styles.iosSectionHeader}>Recent Queries</Text>
                  <View style={styles.iosInsetGroupedCard}>
                    {filteredHistory.length > 0 ? (
                      filteredHistory.map((item, index) => (
                        <React.Fragment key={item.id}>
                          <TouchableOpacity
                            style={styles.iosListRow}
                            activeOpacity={0.65}
                            onPress={() => handleHistorySelect(item.query)}
                          >
                            {/* iOS Icon Badge */}
                            <View style={styles.iosRowIconBadge}>
                              <Icon name="sparkles" size={14} color="#A3E635" />
                            </View>

                            {/* Row Text Content */}
                            <View style={styles.iosRowTextContainer}>
                              <Text style={styles.iosRowTitle} numberOfLines={1}>
                                {item.query}
                              </Text>
                              <Text style={styles.iosRowSubtitle}>{item.timestamp}</Text>
                            </View>

                            {/* Delete Action */}
                            <TouchableOpacity
                              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                              onPress={() => handleDeleteHistoryItem(item.id)}
                            >
                              <Icon name="close" size={13} color="#636366" />
                            </TouchableOpacity>
                          </TouchableOpacity>

                          {/* iOS Hairline Separator */}
                          {index < filteredHistory.length - 1 && (
                            <View style={styles.iosSeparator} />
                          )}
                        </React.Fragment>
                      ))
                    ) : (
                      <View style={styles.emptyCardContent}>
                        <Text style={styles.emptyCardText}>No matching queries</Text>
                      </View>
                    )}
                  </View>

                  {/* 5. iOS 16 Inset Grouped Section: Saved Topics */}
                  <Text style={styles.iosSectionHeader}>Saved Topics</Text>
                  <View style={styles.iosInsetGroupedCard}>
                    {[
                      { title: "Coding & Architecture", icon: "tech" as const, count: "12" },
                      { title: "Business & Startup Ideas", icon: "lightbulb" as const, count: "5" },
                      { title: "Anime & Media", icon: "video" as const, count: "8" },
                    ].map((topic, idx, arr) => (
                      <React.Fragment key={topic.title}>
                        <TouchableOpacity
                          style={styles.iosListRow}
                          activeOpacity={0.65}
                          onPress={() => handleHistorySelect(topic.title)}
                        >
                          <View style={styles.iosTopicIconBadge}>
                            <Icon name={topic.icon} size={14} color="#D1D5DB" />
                          </View>

                          <View style={styles.iosRowTextContainer}>
                            <Text style={styles.iosRowTitle} numberOfLines={1}>
                              {topic.title}
                            </Text>
                            <Text style={styles.iosRowSubtitle}>{topic.count} memories</Text>
                          </View>

                          <Icon name="chevron-right" size={14} color="#48484A" />
                        </TouchableOpacity>

                        {idx < arr.length - 1 && <View style={styles.iosSeparator} />}
                      </React.Fragment>
                    ))}
                  </View>

                  {/* 6. Clear History Action */}
                  {history.length > 0 && (
                    <TouchableOpacity
                      style={styles.clearHistoryButton}
                      activeOpacity={0.7}
                      onPress={handleClearAllHistory}
                    >
                      <Text style={styles.clearHistoryText}>Clear All History</Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>
              </SafeAreaView>
            </Animated.View>
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
    backgroundColor: "#111215",
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000000",
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 20,
  },
  sidebarSafe: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 20 : 8,
    paddingBottom: 20,
  },
  sidebarNavHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    marginBottom: 8,
  },
  sidebarNavTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.4,
  },
  sidebarSearchBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 38,
    backgroundColor: "#1C1C1E",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  sidebarSearchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#FFFFFF",
    paddingVertical: 0,
  },
  newSearchActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#202228",
    borderWidth: 1,
    borderColor: "rgba(163, 230, 53, 0.35)",
    marginBottom: 20,
  },
  newSearchActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#A3E635",
  },
  sidebarScroll: {
    flex: 1,
  },
  sidebarScrollContent: {
    paddingBottom: 24,
  },
  iosSectionHeader: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8E8E93",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingLeft: 4,
  },
  iosInsetGroupedCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  iosListRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  iosRowIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: "#232D0C",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iosTopicIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: "#2C2C2E",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iosRowTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  iosRowTitle: {
    fontSize: 14.5,
    fontWeight: "400",
    color: "#FFFFFF",
  },
  iosRowSubtitle: {
    fontSize: 11.5,
    color: "#8E8E93",
    marginTop: 2,
  },
  iosSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    marginLeft: 54,
  },
  emptyCardContent: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyCardText: {
    fontSize: 13,
    color: "#636366",
  },
  clearHistoryButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  clearHistoryText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#FF453A",
  },
});
