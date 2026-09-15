import React, { useState } from "react";
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
} from "react-native";
import { Theme } from "../../theme/index";
import { Icon } from "../../components/common/Icon";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";

interface AIAssistantScreenProps {
  navigation: any;
}

export const AIAssistantScreen: React.FC<AIAssistantScreenProps> = ({ navigation }) => {
  const [prompt, setPrompt] = useState("");

  const SUGGESTION_CHIPS = [
    "What did I save about coding?",
    "Summarize my ideas",
    "Find the website I saved about...",
    "Best website to Watch Anime",
    "Give me best business Idea",
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardAvoid}
      >
        {/* Top Header: Back & Menu buttons */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.headerIconButton}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-left" size={20} color={Theme.colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerIconButton}
            activeOpacity={0.8}
            onPress={() => {}}
          >
            <Icon name="menu" size={20} color={Theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Central Glowing AI Sparkles Badge */}
          <View style={styles.centralGraphicWrapper}>
            <Svg width={140} height={140} viewBox="0 0 140 140">
              <Defs>
                <RadialGradient id="aiHalo" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#4D6611" stopOpacity="0.8" />
                  <Stop offset="70%" stopColor="#253308" stopOpacity="0.4" />
                  <Stop offset="100%" stopColor="#0E1403" stopOpacity="0" />
                </RadialGradient>
              </Defs>
              <Circle cx="70" cy="70" r="68" fill="url(#aiHalo)" />
              <Circle cx="70" cy="70" r="44" fill="#3D4D10" stroke="#5A7016" strokeWidth="1" />
            </Svg>
            <View style={styles.centerSparklesOverlay}>
              <Icon name="sparkles" size={36} color="#FFFFFF" />
            </View>
          </View>

          {/* Titles */}
          <Text style={styles.assistantTitle}>Your AI Memory assistant</Text>
          <Text style={styles.assistantSubtitle}>Ask anything you've saved.</Text>

          {/* Prompt Suggestion Chips */}
          <View style={styles.chipsCloud}>
            {SUGGESTION_CHIPS.map((chipText) => (
              <TouchableOpacity
                key={chipText}
                style={styles.chipPill}
                activeOpacity={0.8}
                onPress={() => setPrompt(chipText)}
              >
                <Text style={styles.chipText}>{chipText}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Bottom Input Pill & Microphone */}
        <View style={styles.bottomBar}>
          <View style={styles.inputPill}>
            <TouchableOpacity style={styles.plusButton} activeOpacity={0.8}>
              <Icon name="plus" size={16} color={Theme.colors.textSecondary} />
            </TouchableOpacity>

            <TextInput
              placeholder="Ask your memory anything..."
              placeholderTextColor={Theme.colors.textMuted}
              value={prompt}
              onChangeText={setPrompt}
              style={styles.textInput}
            />
          </View>

          <TouchableOpacity style={styles.micButton} activeOpacity={0.8}>
            <Icon name="mic" size={20} color={Theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
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
    paddingBottom: 8,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Theme.colors.surfacePill,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 36,
  },
  centralGraphicWrapper: {
    position: "relative",
    width: 140,
    height: 140,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  centerSparklesOverlay: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  assistantTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Theme.colors.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  assistantSubtitle: {
    fontSize: 15,
    color: Theme.colors.textSecondary,
    marginBottom: 36,
    textAlign: "center",
  },
  chipsCloud: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    width: "100%",
    gap: 10,
  },
  chipPill: {
    backgroundColor: Theme.colors.surfacePill,
    borderRadius: Theme.borderRadius.full,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: 4,
  },
  chipText: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(35, 38, 44, 0.4)",
  },
  inputPill: {
    flex: 1,
    height: 52,
    backgroundColor: Theme.colors.surfacePill,
    borderRadius: 26,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginRight: 12,
  },
  plusButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2B2E35",
    justifyContent: "center",
    alignItems: "center",
  },
  textInput: {
    flex: 1,
    marginLeft: 10,
    color: Theme.colors.textPrimary,
    fontSize: 14,
    paddingVertical: 0,
  },
  micButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Theme.colors.surfacePill,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
});
