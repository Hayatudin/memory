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
import Svg, { Path } from "react-native-svg";
import { useAuthStore } from "../../store/authStore";
import { Icon } from "../../components/common/Icon";

interface SignUpScreenProps {
  navigation: any;
}

// Apple logo SVG
const AppleLogo = () => (
  <Svg width={18} height={18} viewBox="0 0 814 1000" fill="#000">
    <Path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 405.6 0 278.3 0 157.2c0-111.5 46-225.3 161.9-302.1 76-48.3 166.5-57.8 212.5-57.8 99.8 0 169.8 57.2 233.3 57.2 57.2 0 141.6-63.5 246.2-63.5 39.5 0 141.9 4.5 214.7 76.9zm-168.3-99.8c-43.4 0-109.1-29.4-144.6-77.4-32.6-42.8-56.8-102.5-56.8-162.2 0-8.3.6-16.7 2.6-24.4 79.4 3.2 142.3 51.9 181.7 103.2C636 92.5 657 157.5 657 218.8c0 8.3-1.3 16.7-2.6 22z" />
  </Svg>
);

// Google logo SVG
const GoogleLogo = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </Svg>
);

export const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string; email?: string; password?: string; confirmPassword?: string;
  }>({});

  const { register, isSubmitting, error, clearError } = useAuthStore();

  const validate = () => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = "Full name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 8) e.password = "At least 8 characters";
    if (!confirmPassword) e.confirmPassword = "Please confirm your password";
    else if (confirmPassword !== password) e.confirmPassword = "Passwords do not match";
    return e;
  };

  const handleSignUp = async () => {
    clearError();
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    const success = await register({ name: name.trim(), email: email.trim(), password });
    if (success) {
      navigation.reset({
        index: 0,
        routes: [{ name: "MainTabs" }],
      });
    }
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
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Start capturing your memories</Text>
          </View>

          {/* Error Banner */}
          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Full Name */}
          <View style={[styles.inputWrap, nameFocused && styles.inputFocused, errors.name ? styles.inputError : null]}>
            <View style={styles.iconWrap}><Icon name="user" size={18} color="#666" /></View>
            <TextInput
              style={styles.input}
              placeholder="Full name"
              placeholderTextColor="#555"
              value={name}
              onChangeText={(v) => { setName(v); setErrors((p) => ({ ...p, name: undefined })); }}
              autoCapitalize="words"
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
            />
          </View>
          {errors.name ? <Text style={styles.fieldError}>{errors.name}</Text> : null}

          {/* Email */}
          <View style={[styles.inputWrap, emailFocused && styles.inputFocused, errors.email ? styles.inputError : null]}>
            <View style={styles.iconWrap}><Icon name="user" size={18} color="#666" /></View>
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

          {/* Password */}
          <View style={[styles.inputWrap, passwordFocused && styles.inputFocused, errors.password ? styles.inputError : null]}>
            <View style={styles.iconWrap}><Icon name="lock" size={18} color="#666" /></View>
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

          {/* Confirm Password */}
          <View style={[styles.inputWrap, confirmFocused && styles.inputFocused, errors.confirmPassword ? styles.inputError : null]}>
            <View style={styles.iconWrap}><Icon name="shield" size={18} color="#666" /></View>
            <TextInput
              style={styles.input}
              placeholder="Confirm password"
              placeholderTextColor="#555"
              value={confirmPassword}
              onChangeText={(v) => { setConfirmPassword(v); setErrors((p) => ({ ...p, confirmPassword: undefined })); }}
              secureTextEntry
              onFocus={() => setConfirmFocused(true)}
              onBlur={() => setConfirmFocused(false)}
            />
          </View>
          {errors.confirmPassword ? <Text style={styles.fieldError}>{errors.confirmPassword}</Text> : null}

          {/* Create Account Button */}
          <TouchableOpacity
            style={[styles.primaryBtn, isSubmitting ? { opacity: 0.7 } : null]}
            onPress={handleSignUp}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting
              ? <ActivityIndicator color="#000" />
              : <Text style={styles.primaryBtnText}>Create account</Text>
            }
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
            <Text style={styles.appleBtnText}>  Sign Up With Apple</Text>
          </TouchableOpacity>

          {/* Google Button */}
          <TouchableOpacity style={styles.googleBtn} activeOpacity={0.85}>
            <GoogleLogo />
            <Text style={styles.googleBtnText}>  Sign Up With Google</Text>
          </TouchableOpacity>

          {/* Sign In Link */}
          <TouchableOpacity style={styles.bottomLink} onPress={() => navigation.navigate("SignIn")}>
            <Text style={styles.bottomLinkText}>Already have an account?</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 64, paddingBottom: 40 },
  titleBlock: { marginBottom: 32 },
  title: { fontSize: 32, fontWeight: "700", color: "#FFF", letterSpacing: -0.5, marginBottom: 8 },
  subtitle: { fontSize: 15, color: "#888" },
  errorBanner: {
    backgroundColor: "#2A0A0A", borderColor: "#FF4444", borderWidth: 1,
    borderRadius: 14, padding: 12, marginBottom: 16,
  },
  errorText: { color: "#FF6B6B", fontSize: 13, textAlign: "center" },
  inputWrap: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#141414",
    borderRadius: 14, borderWidth: 1, borderColor: "#2A2A2A",
    paddingHorizontal: 16, marginBottom: 12, height: 56,
  },
  inputFocused: { borderColor: "#C8F026" },
  inputError: { borderColor: "#FF4444" },
  iconWrap: { marginRight: 12 },
  input: { flex: 1, color: "#FFF", fontSize: 15, height: 56 },
  fieldError: { color: "#FF6B6B", fontSize: 12, marginTop: -8, marginBottom: 8, marginLeft: 4 },
  primaryBtn: {
    backgroundColor: "#C8F026", borderRadius: 50, height: 56,
    justifyContent: "center", alignItems: "center", marginTop: 8, marginBottom: 20,
  },
  primaryBtnText: { color: "#000", fontSize: 16, fontWeight: "700" },
  divider: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#2A2A2A" },
  dividerText: { color: "#888", fontSize: 13, marginHorizontal: 12 },
  appleBtn: {
    backgroundColor: "#FFF", borderRadius: 50, height: 56,
    flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 12,
  },
  appleBtnText: { color: "#000", fontSize: 15, fontWeight: "600" },
  googleBtn: {
    backgroundColor: "#1A1A1A", borderRadius: 50, height: 56,
    flexDirection: "row", justifyContent: "center", alignItems: "center",
    marginBottom: 28, borderWidth: 1, borderColor: "#2A2A2A",
  },
  googleBtnText: { color: "#FFF", fontSize: 15, fontWeight: "600" },
  bottomLink: { alignSelf: "center" },
  bottomLinkText: { color: "#888", fontSize: 14 },
});
