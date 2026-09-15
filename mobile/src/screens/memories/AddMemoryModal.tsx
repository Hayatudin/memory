import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Theme } from "../../theme/index";
import { Icon, IconName } from "../../components/common/Icon";
import { Button } from "../../components/common/Button";

interface AddMemoryModalProps {
  navigation: any;
}

type MemoryType = "text" | "link" | "image" | "voice";

interface TypeOption {
  type: MemoryType;
  label: string;
  icon: IconName;
}

export const AddMemoryModal: React.FC<AddMemoryModalProps> = ({ navigation }) => {
  const [selectedType, setSelectedType] = useState<MemoryType>("text");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const TYPE_OPTIONS: TypeOption[] = [
    { type: "text", label: "Note", icon: "book" },
    { type: "link", label: "Link", icon: "link" },
    { type: "image", label: "Media", icon: "camera" },
    { type: "voice", label: "Voice", icon: "mic" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.content}
      >
        {/* Top Handle / Close */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>New Memory</Text>
          <TouchableOpacity
            style={styles.closeBtn}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <Icon name="close" size={18} color={Theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Memory Type Selector Pills */}
        <View style={styles.typeSelectorRow}>
          {TYPE_OPTIONS.map((opt) => {
            const isSelected = selectedType === opt.type;
            return (
              <TouchableOpacity
                key={opt.type}
                style={[
                  styles.typePill,
                  isSelected && styles.typePillSelected,
                ]}
                activeOpacity={0.8}
                onPress={() => setSelectedType(opt.type)}
              >
                <Icon
                  name={opt.icon}
                  size={16}
                  color={isSelected ? Theme.colors.black : Theme.colors.textSecondary}
                />
                <Text
                  style={[
                    styles.typePillText,
                    isSelected && styles.typePillTextSelected,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Inputs */}
        <View style={styles.formContainer}>
          <TextInput
            placeholder="Memory Title..."
            placeholderTextColor={Theme.colors.textMuted}
            value={title}
            onChangeText={setTitle}
            style={styles.titleInput}
          />

          <TextInput
            placeholder={
              selectedType === "link"
                ? "Paste URL (e.g. https://...)"
                : selectedType === "image"
                ? "Add image caption or notes..."
                : selectedType === "voice"
                ? "Tap mic to record audio thought..."
                : "Type your memory content..."
            }
            placeholderTextColor={Theme.colors.textMuted}
            value={content}
            onChangeText={setContent}
            multiline
            style={styles.contentInput}
          />
        </View>

        {/* Submit */}
        <Button
          title="Save Memory"
          onPress={() => {
            // Memory CRUD will be implemented in Phase 4
            navigation.goBack();
          }}
          variant="primary"
          style={styles.submitBtn}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Theme.colors.textPrimary,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Theme.colors.surfacePill,
    justifyContent: "center",
    alignItems: "center",
  },
  typeSelectorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  typePill: {
    flex: 1,
    height: 42,
    backgroundColor: Theme.colors.surfacePill,
    borderRadius: Theme.borderRadius.full,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  typePillSelected: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  typePillText: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    marginLeft: 6,
    fontWeight: "500",
  },
  typePillTextSelected: {
    color: Theme.colors.black,
    fontWeight: "700",
  },
  formContainer: {
    flex: 1,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: "600",
    color: Theme.colors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    paddingVertical: 12,
    marginBottom: 16,
  },
  contentInput: {
    flex: 1,
    fontSize: 15,
    color: Theme.colors.textPrimary,
    textAlignVertical: "top",
  },
  submitBtn: {
    marginTop: 16,
  },
});
