import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path, Rect } from "react-native-svg";
import { Icon } from "../../components/common/Icon";
import { IOSGlassButton } from "../../components/common/IOSGlassButton";
import { IOSGlassCircle } from "../../components/common/IOSGlassCircle";
import { useAuthStore } from "../../store/authStore";

interface PaymentScreenProps {
  route: {
    params?: {
      plan?: "monthly" | "yearly";
      price?: string;
    };
  };
  navigation: any;
}

// Apple Logo SVG
const AppleLogo = () => (
  <Svg width={16} height={16} viewBox="0 0 814 1000" fill="#FFFFFF">
    <Path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 405.6 0 278.3 0 157.2c0-111.5 46-225.3 161.9-302.1 76-48.3 166.5-57.8 212.5-57.8 99.8 0 169.8 57.2 233.3 57.2 57.2 0 141.6-63.5 246.2-63.5 39.5 0 141.9 4.5 214.7 76.9zm-168.3-99.8c-43.4 0-109.1-29.4-144.6-77.4-32.6-42.8-56.8-102.5-56.8-162.2 0-8.3.6-16.7 2.6-24.4 79.4 3.2 142.3 51.9 181.7 103.2C636 92.5 657 157.5 657 218.8c0 8.3-1.3 16.7-2.6 22z" />
  </Svg>
);

export const PaymentScreen: React.FC<PaymentScreenProps> = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const plan = route.params?.plan || "yearly";
  const price = route.params?.price || (plan === "yearly" ? "$99.99" : "$9.99");
  const billingPeriod = plan === "yearly" ? "year" : "month";

  // Card Form State
  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [saveCard, setSaveCard] = useState(true);

  // Flow State
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

  // Format Card Number (adds space every 4 digits)
  const handleCardNumberChange = (text: string) => {
    const cleaned = text.replace(/\D/g, "").slice(0, 16);
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
    setCardNumber(formatted);
  };

  // Format Expiry (MM/YY)
  const handleExpiryChange = (text: string) => {
    const cleaned = text.replace(/\D/g, "").slice(0, 4);
    if (cleaned.length >= 3) {
      setExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`);
    } else {
      setExpiry(cleaned);
    }
  };

  // Detect card brand icon
  const getCardBrand = () => {
    const clean = cardNumber.replace(/\s/g, "");
    if (clean.startsWith("4")) return "VISA";
    if (/^5[1-5]/.test(clean)) return "MC";
    if (/^3[47]/.test(clean)) return "AMEX";
    return null;
  };

  const handlePay = () => {
    setIsProcessing(true);

    // Simulate Stripe payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccessModalVisible(true);
    }, 1400);
  };

  const { isAuthenticated } = useAuthStore();

  const handleFinishPayment = () => {
    setIsSuccessModalVisible(false);
    // Proceed to Main app if authenticated, otherwise to Auth to sign in
    if (isAuthenticated) {
      navigation.navigate("MainTabs");
    } else {
      navigation.navigate("Auth");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* iOS Navigation Bar */}
      <View style={[styles.navBar, { paddingTop: Math.max(insets.top > 0 ? insets.top - 10 : 8, 8) }]}>
        <IOSGlassButton
          size={42}
          onPress={() => navigation.goBack()}
          fill="rgba(30, 32, 38, 0.75)"
          gradientId="payBackBtnGrad"
        >
          <Icon name="chevron-left" size={20} color="#FFFFFF" strokeWidth={2.4} />
        </IOSGlassButton>

        <Text style={styles.navTitle}>Checkout</Text>

        <View style={styles.navRightSecurity}>
          <Icon name="lock" size={17} color="#71717A" strokeWidth={2} />
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Order Summary Glass Card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View style={styles.planBadge}>
                <Text style={styles.planBadgeText}>PREMIUM</Text>
              </View>
              <Text style={styles.summaryPrice}>
                {price}
                <Text style={styles.summaryPeriod}> / {billingPeriod}</Text>
              </Text>
            </View>

            <Text style={styles.summaryTitle}>
              {plan === "yearly" ? "Yearly Membership" : "Monthly Membership"}
            </Text>
            <Text style={styles.summarySubtitle}>
              {plan === "yearly"
                ? "Auto-renews at $99.99/year. Save 17% compared to monthly."
                : "Auto-renews at $9.99/month. Cancel anytime."}
            </Text>

            <View style={styles.summaryDivider} />

            <View style={styles.guaranteeRow}>
              <Icon name="check" size={14} color="#D4F82C" strokeWidth={2.6} />
              <Text style={styles.guaranteeText}>Unlimited memories, AI search & instant capture</Text>
            </View>
            <View style={styles.guaranteeRow}>
              <Icon name="check" size={14} color="#D4F82C" strokeWidth={2.6} />
              <Text style={styles.guaranteeText}>Cancel anytime with a single tap in settings</Text>
            </View>
          </View>

          {/* Express Checkout Button (Apple Pay style) */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handlePay}
            style={styles.applePayBtn}
          >
            <AppleLogo />
            <Text style={styles.applePayText}>Pay with Apple Pay</Text>
          </TouchableOpacity>

          {/* Or Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR PAY WITH CARD</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Credit Card Form (Stripe integration ready) */}
          <View style={styles.formContainer}>
            {/* Cardholder Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>CARDHOLDER NAME</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. John Appleseed"
                  placeholderTextColor="#6B7280"
                  value={cardholderName}
                  onChangeText={setCardholderName}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Card Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>CARD NUMBER</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.input, { letterSpacing: 1.2 }]}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor="#6B7280"
                  value={cardNumber}
                  onChangeText={handleCardNumberChange}
                  keyboardType="numeric"
                  maxLength={19}
                />
                {getCardBrand() ? (
                  <View style={styles.brandBadge}>
                    <Text style={styles.brandBadgeText}>{getCardBrand()}</Text>
                  </View>
                ) : (
                  <Icon name="credit-card" size={18} color="#71717A" />
                )}
              </View>
            </View>

            {/* Expiry & CVC Row */}
            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>EXPIRATION</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="MM/YY"
                    placeholderTextColor="#6B7280"
                    value={expiry}
                    onChangeText={handleExpiryChange}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>CVC / CVV</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="123"
                    placeholderTextColor="#6B7280"
                    value={cvc}
                    onChangeText={(t) => setCvc(t.replace(/\D/g, "").slice(0, 4))}
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                  />
                  <Icon name="lock" size={14} color="#6B7280" />
                </View>
              </View>
            </View>

            {/* Postal / Zip Code */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ZIP / POSTAL CODE</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 90210"
                  placeholderTextColor="#6B7280"
                  value={zipCode}
                  onChangeText={setZipCode}
                  autoCapitalize="characters"
                  maxLength={10}
                />
              </View>
            </View>

            {/* Save Card Toggle */}
            <View style={styles.saveCardRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.saveCardTitle}>Save card details</Text>
                <Text style={styles.saveCardSubtitle}>Securely save for future renewals</Text>
              </View>
              <Switch
                value={saveCard}
                onValueChange={setSaveCard}
                trackColor={{ false: "#27272A", true: "#D4F82C" }}
                thumbColor={saveCard ? "#0A0D02" : "#A1A1AA"}
                ios_backgroundColor="#27272A"
              />
            </View>
          </View>

          {/* Security Guarantee Badge */}
          <View style={styles.securityBadgeRow}>
            <Icon name="shield-check" size={16} color="#D4F82C" />
            <Text style={styles.securityBadgeText}>
              256-bit SSL encrypted. Stripe checkout ready.
            </Text>
          </View>

          {/* Primary Pay Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handlePay}
            disabled={isProcessing}
            style={styles.payBtn}
          >
            {isProcessing ? (
              <ActivityIndicator color="#0A0D02" size="small" />
            ) : (
              <Text style={styles.payBtnText}>Pay {price}</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.termsNoticeText}>
            By confirming, you agree to our Terms of Service. You can cancel at any time in Account Settings.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Confirmation Modal */}
      <Modal
        visible={isSuccessModalVisible}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <IOSGlassCircle
              size={64}
              strokeWidth={1.5}
              fill="rgba(212, 248, 44, 0.15)"
              gradientId="successModalBadge"
              style={{ marginBottom: 16 }}
            >
              <Icon name="check" size={28} color="#D4F82C" strokeWidth={3} />
            </IOSGlassCircle>

            <Text style={styles.modalSuccessTitle}>Payment Successful!</Text>
            <Text style={styles.modalSuccessSubtitle}>
              Welcome to Memory Premium! Your unlimited features and AI assistant are now active.
            </Text>

            <View style={styles.modalPlanSummaryBox}>
              <Text style={styles.modalSummaryPlanName}>
                {plan === "yearly" ? "Yearly Premium" : "Monthly Premium"}
              </Text>
              <Text style={styles.modalSummaryPrice}>{price}</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleFinishPayment}
              style={styles.modalContinueBtn}
            >
              <Text style={styles.modalContinueText}>Continue to App</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  navRightSecurity: {
    width: 42,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: "rgba(22, 24, 29, 0.90)",
    borderRadius: 20,
    padding: 18,
    marginTop: 8,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderTopColor: "rgba(255, 255, 255, 0.22)",
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  planBadge: {
    backgroundColor: "rgba(212, 248, 44, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  planBadgeText: {
    color: "#D4F82C",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  summaryPrice: {
    fontSize: 22,
    fontWeight: "700",
    color: "#D4F82C",
    letterSpacing: -0.4,
  },
  summaryPeriod: {
    fontSize: 13,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  summarySubtitle: {
    fontSize: 13,
    color: "#8E8E93",
    lineHeight: 18,
    marginBottom: 12,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    marginBottom: 12,
  },
  guaranteeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  guaranteeText: {
    fontSize: 13,
    color: "#D4D4D8",
  },

  // Express Apple Pay Button
  applePayBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  applePayText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.2,
  },

  // Divider
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  dividerText: {
    color: "#71717A",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
  },

  // Card Form
  formContainer: {
    gap: 14,
    marginBottom: 20,
  },
  inputGroup: {
    gap: 6,
  },
  rowInputs: {
    flexDirection: "row",
    gap: 12,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#A1A1AA",
    letterSpacing: 0.6,
  },
  inputWrapper: {
    backgroundColor: "rgba(24, 27, 33, 0.85)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderTopColor: "rgba(255, 255, 255, 0.18)",
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#FFFFFF",
    paddingVertical: 0,
  },
  brandBadge: {
    backgroundColor: "#27272A",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  brandBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  saveCardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
    marginTop: 4,
  },
  saveCardTitle: {
    fontSize: 14.5,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  saveCardSubtitle: {
    fontSize: 12,
    color: "#71717A",
    marginTop: 2,
  },

  // Security Badge
  securityBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginBottom: 20,
  },
  securityBadgeText: {
    fontSize: 12.5,
    color: "#A1A1AA",
    fontWeight: "500",
  },

  // Action Button
  payBtn: {
    height: 56,
    borderRadius: 28,
    backgroundColor: "#D4F82C",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    shadowColor: "#D4F82C",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },
  payBtnText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0A0D02",
    letterSpacing: -0.3,
  },
  termsNoticeText: {
    fontSize: 11.5,
    color: "#71717A",
    textAlign: "center",
    lineHeight: 16,
    paddingHorizontal: 10,
  },

  // Success Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#181A20",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
  },
  modalSuccessTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.3,
    marginBottom: 8,
    textAlign: "center",
  },
  modalSuccessSubtitle: {
    fontSize: 13.5,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 20,
  },
  modalPlanSummaryBox: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  modalSummaryPlanName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  modalSummaryPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#D4F82C",
  },
  modalContinueBtn: {
    width: "100%",
    height: 50,
    borderRadius: 25,
    backgroundColor: "#D4F82C",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContinueText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0A0D02",
  },
});
