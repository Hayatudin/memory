import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from "react-native";
import { useAuthStore } from "../../store/authStore";
import { Theme } from "../../theme/index";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { BrainGraphic } from "../../components/common/BrainGraphic";

interface SignUpScreenProps {
  navigation: any;
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});

  const { register, isSubmitting, error, clearError } = useAuthStore();

  const handleSignUp = async () => {
    clearError();
    const errors: { name?: string; email?: string; password?: string } = {};

    if (!name.trim()) {
      errors.name = "Full name is required";
    }

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    await register({ name: name.trim(), email: email.trim(), password });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <BrainGraphic size={88} />
            <Text style={styles.brandTitle}>Create Account</Text>
            <Text style={styles.subtitle}>Start capturing and indexing your memories</Text>
          </View>

          {/* Form */}
          <View style={styles.formCard}>
            {error ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{error}</Text>
              </View>
            ) : null}

            <Input
              label="Full Name"
              placeholder="e.g. Alex Morgan"
              value={name}
              onChangeText={(val) => {
                setName(val);
                if (validationErrors.name) setValidationErrors((prev) => ({ ...prev, name: undefined }));
              }}
              autoCapitalize="words"
              leftIcon="user"
              error={validationErrors.name}
              containerStyle={styles.inputSpacing}
            />

            <Input
              label="Email Address"
              placeholder="you@example.com"
              value={email}
              onChangeText={(val) => {
                setEmail(val);
                if (validationErrors.email) setValidationErrors((prev) => ({ ...prev, email: undefined }));
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              leftIcon="user"
              error={validationErrors.email}
              containerStyle={styles.inputSpacing}
            />

            <Input
              label="Password (min 8 chars)"
              placeholder="••••••••"
              value={password}
              onChangeText={(val) => {
                setPassword(val);
                if (validationErrors.password) setValidationErrors((prev) => ({ ...prev, password: undefined }));
              }}
              secureTextEntry
              leftIcon="lock"
              error={validationErrors.password}
              containerStyle={styles.inputSpacing}
            />

            <Button
              title="Create Account"
              onPress={handleSignUp}
              loading={isSubmitting}
              style={styles.submitButton}
            />

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
                <Text style={styles.footerLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: Theme.colors.textPrimary,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: 20,
  },
  formCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  inputSpacing: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 8,
  },
  errorBanner: {
    backgroundColor: Theme.colors.dangerDark,
    borderColor: Theme.colors.dangerBorder,
    borderWidth: 1,
    borderRadius: Theme.borderRadius.md,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    color: Theme.colors.dangerText,
    fontSize: 13,
    textAlign: "center",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: "600",
    color: Theme.colors.primary,
  },
});
