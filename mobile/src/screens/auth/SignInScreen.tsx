import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useAuthStore } from "../../store/authStore";

interface SignInScreenProps {
  navigation: any;
}

// ─── Icon Components (SVG-free inline icons) ──────────────────────────────────
const EmailIcon = () => (
  <Text style={iconStyle}>✉</Text>
);

const LockIcon = () => (
  <Text style={iconStyle}>🔒</Text>
);

const AppleLogo = () => (
  <Text style={{ fontSize: 18, color: "#000", marginRight: 8, lineHeight: 22 }}></Text>
);

const GoogleLogo = () => (
  <View style={gLogoContainer}>
    <Text style={gLogoText}>G</Text>
  </View>
);

const iconStyle = { fontSize: 16, color: "#666", marginRight: 10 };
const gLogoContainer = {
  width: 20,
  height: 20,
  borderRadius: 10,
  backgroundColor: "#fff",
  justifyContent: "center" as const,
  alignItems: "center" as const,
  marginRight: 10,
};
const gLogoText = {
  fontSize: 13,
  fontWeight: "700" as const,
  color: "#4285F4",
  lineHeight: 18,
};

export const SignInScreen: React.FC<SignInScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { login, isSubmitting, error, clearError } = useAuthStore();

  const validate = () => {
    const e: { email?: string; password?: string } = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    return e;
  };

  const handleSignIn = async () => {
    clearError();
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    await login({ email: email.trim(), password });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <View style={styles.titleBlock}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Let's get you in to Memory</Text>
          </View>

          {/* Error Banner */}
          {(error) ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Email Input */}
          <View style={[styles.inputWrap, emailFocused && styles.inputFocused, errors.email && styles.inputError]}>
            <EmailIcon />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#555"
              value={email}
              onChangeText={(v) => { setEmail(v); setErrors((p) => ({ ...p, email: undefined })); }}
              autoCapitalize="none"
              keyboardType="email-address"
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />
          </View>
          {errors.email ? <Text style={styles.fieldError}>{errors.email}</Text> : null}

          {/* Password Input */}
          <View style={[styles.inputWrap, passwordFocused && styles.inputFocused, errors.password && styles.inputError]}>
            <LockIcon />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#555"
              value={password}
              onChangeText={(v) => { setPassword(v); setErrors((p) => ({ ...p, password: undefined })); }}
              secureTextEntry
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />
          </View>
          {errors.password ? <Text style={styles.fieldError}>{errors.password}</Text> : null}

          {/* Forgot Password */}
          <TouchableOpacity style={styles.forgotWrap}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.primaryBtn, isSubmitting && { opacity: 0.7 }]}
            onPress={handleSignIn}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.primaryBtnText}>Sign in</Text>
            )}
          </TouchableOpacity>

          {/* OR Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Apple Button */}
          <TouchableOpacity style={styles.appleBtn} activeOpacity={0.85}>
            <AppleLogo />
            <Text style={styles.appleBtnText}>Sign In With Apple</Text>
          </TouchableOpacity>

          {/* Google Button */}
          <TouchableOpacity style={styles.googleBtn} activeOpacity={0.85}>
            <GoogleLogo />
            <Text style={styles.googleBtnText}>Sign In With Google</Text>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <TouchableOpacity
            style={styles.bottomLink}
            onPress={() => navigation.navigate("SignUp")}
          >
            <Text style={styles.bottomLinkText}>Don't have an account?</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  titleBlock: {
    marginBottom: 36,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#888",
    fontWeight: "400",
  },
  errorBanner: {
    backgroundColor: "#2A0A0A",
    borderColor: "#FF4444",
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 13,
    textAlign: "center",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#141414",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 12,
    height: 56,
  },
  inputFocused: {
    borderColor: "#C8F026",
  },
  inputError: {
    borderColor: "#FF4444",
  },
  input: {
    flex: 1,
    color: "#FFF",
    fontSize: 15,
    height: 56,
  },
  fieldError: {
    color: "#FF6B6B",
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 4,
  },
  forgotWrap: {
    alignSelf: "center",
    marginVertical: 16,
  },
  forgotText: {
    color: "#888",
    fontSize: 14,
  },
  primaryBtn: {
    backgroundColor: "#C8F026",
    borderRadius: 50,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  primaryBtnText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#2A2A2A",
  },
  dividerText: {
    color: "#888",
    fontSize: 13,
    marginHorizontal: 12,
  },
  appleBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 50,
    height: 56,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  appleBtnText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "600",
  },
  googleBtn: {
    backgroundColor: "#1A1A1A",
    borderRadius: 50,
    height: 56,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  googleBtnText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
  },
  bottomLink: {
    alignSelf: "center",
  },
  bottomLinkText: {
    color: "#888",
    fontSize: 14,
  },
});
