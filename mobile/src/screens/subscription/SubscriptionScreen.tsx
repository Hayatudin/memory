import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "../../components/common/Icon";
import { IOSGlassButton } from "../../components/common/IOSGlassButton";
import { useAuthStore } from "../../store/authStore";

interface SubscriptionScreenProps {
  navigation: any;
}

type PlanType = "monthly" | "yearly";

interface FeatureItem {
  id: string;
  title: string;
}

const FEATURES: FeatureItem[] = [
  { id: "1", title: "Unlimited Memories" },
  { id: "2", title: "AI Memory Assistant" },
  { id: "3", title: "Smart AI Search" },
  { id: "4", title: "Instant Capture Anywhere" },
  { id: "5", title: "Smart Memory Insights" },
];

export const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("yearly");
  const { isAuthenticated } = useAuthStore();

  const handleCancel = () => {
    // When Cancel is clicked:
    // If onboarding before Auth, directly move to Authentication page as requested
    // If inside the app, return back to the app
    if (!isAuthenticated) {
      navigation.navigate("Auth");
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("MainTabs");
    }
  };

  const handleGetItNow = () => {
    const price = selectedPlan === "yearly" ? "$99.99" : "$9.99";
    navigation.navigate("Payment", {
      plan: selectedPlan,
      price,
    });
  };

  const handleRestorePurchases = () => {
    Alert.alert(
      "Restore Purchases",
      "Checking your Apple ID / Google Play account for an active subscription...",
      [{ text: "OK" }]
    );
  };

  const handleTerms = () => {
    Alert.alert(
      "Terms of Service",
      "Subscriptions automatically renew unless auto-renew is turned off at least 24 hours before the end of the current period. Manage subscriptions in Account Settings.",
      [{ text: "Close" }]
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      "Privacy Policy",
      "Your memories and personal data are encrypted and strictly private. We never share your data with third parties.",
      [{ text: "Close" }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Top Header Row with Cancel / Close Button (X) */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top > 0 ? insets.top - 12 : 8, 8) }]}>
        <View style={{ flex: 1 }} />
        {/* Cancel (X) button with circular iOS specular glass styling */}
        <IOSGlassButton
          size={42}
          onPress={handleCancel}
          fill="rgba(30, 32, 38, 0.75)"
          gradientId="subCancelBtnGrad"
        >
          <Icon name="close" size={17} color="#FFFFFF" strokeWidth={2.4} />
        </IOSGlassButton>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Glowing Neural Brain Graphic */}
        <View style={styles.brainContainer}>
          <Image
            source={require("../../assets/images/subscription-brain.png")}
            style={styles.brainImage}
            resizeMode="contain"
          />
        </View>

        {/* Hero Title and Subtitle */}
        <View style={styles.heroTextContainer}>
          <Text style={styles.heroTitle}>Join Premium</Text>
          <Text style={styles.heroSubtitle}>Enjoy Unlimited Features!</Text>
        </View>

        {/* Features Checklist with Lime Green Checkmarks */}
        <View style={styles.featuresList}>
          {FEATURES.map((feature) => (
            <View key={feature.id} style={styles.featureRow}>
              <View style={styles.checkIconWrapper}>
                <Icon name="check" size={17} color="#D4F82C" strokeWidth={2.8} />
              </View>
              <Text style={styles.featureTitle}>{feature.title}</Text>
            </View>
          ))}
        </View>

        {/* 2 Plan Containers (Monthly & Yearly) with iOS Specular Glass Effect */}
        <View style={styles.plansRow}>
          {/* Monthly Plan Card */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setSelectedPlan("monthly")}
            style={styles.planCardWrapper}
          >
            <View
              style={[
                styles.planCard,
                selectedPlan === "monthly" ? styles.planCardSelected : styles.planCardUnselected,
              ]}
            >
              {/* Plan Card Header: Label + Radio */}
              <View style={styles.planHeader}>
                <Text style={styles.planName}>Monthly</Text>
                {selectedPlan === "monthly" ? (
                  <View style={styles.radioSelected}>
                    <Icon name="check" size={13} color="#0A0D02" strokeWidth={3} />
                  </View>
                ) : (
                  <View style={styles.radioUnselected} />
                )}
              </View>

              {/* Price */}
              <Text style={styles.planPrice}>$9.99</Text>
            </View>
          </TouchableOpacity>

          {/* Yearly Plan Card */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setSelectedPlan("yearly")}
            style={styles.planCardWrapper}
          >
            <View
              style={[
                styles.planCard,
                selectedPlan === "yearly" ? styles.planCardSelected : styles.planCardUnselected,
              ]}
            >
              {/* Plan Card Header: Label + Radio */}
              <View style={styles.planHeader}>
                <Text style={styles.planName}>Yearly</Text>
                {selectedPlan === "yearly" ? (
                  <View style={styles.radioSelected}>
                    <Icon name="check" size={13} color="#0A0D02" strokeWidth={3} />
                  </View>
                ) : (
                  <View style={styles.radioUnselected} />
                )}
              </View>

              {/* Price */}
              <Text style={styles.planPrice}>$99.99</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* "Get it Now" Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleGetItNow}
          style={styles.getItNowBtn}
        >
          <Text style={styles.getItNowText}>Get it Now</Text>
        </TouchableOpacity>

        {/* CANCEL ANYTIME Subtitle */}
        <Text style={styles.cancelAnytimeText}>CANCEL ANYTIME</Text>

        {/* Footer Legal Links */}
        <View style={styles.footerLinksRow}>
          <TouchableOpacity activeOpacity={0.7} onPress={handleRestorePurchases}>
            <Text style={styles.footerLinkText}>Restore Purchases</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} onPress={handleTerms}>
            <Text style={styles.footerLinkText}>Terms</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} onPress={handlePrivacy}>
            <Text style={styles.footerLinkText}>Privacy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    zIndex: 10,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  brainContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    marginBottom: 16,
  },
  brainImage: {
    width: 175,
    height: 155,
  },
  heroTextContainer: {
    alignItems: "flex-start",
    marginBottom: 28,
  },
  heroTitle: {
    fontSize: 29,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 27,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.4,
  },
  featuresList: {
    gap: 15,
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkIconWrapper: {
    width: 26,
    alignItems: "flex-start",
  },
  featureTitle: {
    fontSize: 15.5,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  plansRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  planCardWrapper: {
    flex: 1,
  },
  planCard: {
    height: 108,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: "space-between",
    borderWidth: 1.5,
  },
  planCardSelected: {
    backgroundColor: "rgba(22, 24, 29, 0.95)",
    borderColor: "#D4F82C",
    shadowColor: "#D4F82C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  planCardUnselected: {
    backgroundColor: "rgba(18, 20, 24, 0.85)",
    borderColor: "rgba(255, 255, 255, 0.12)",
    borderTopColor: "rgba(255, 255, 255, 0.24)",
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  planName: {
    fontSize: 14.5,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  radioSelected: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#D4F82C",
    justifyContent: "center",
    alignItems: "center",
  },
  radioUnselected: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#6B7280",
  },
  planPrice: {
    fontSize: 27,
    fontWeight: "700",
    color: "#D4F82C",
    letterSpacing: -0.5,
  },
  getItNowBtn: {
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
  getItNowText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0A0D02",
    letterSpacing: -0.3,
  },
  cancelAnytimeText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#8E8E93",
    textAlign: "center",
    letterSpacing: 0.8,
    marginBottom: 22,
  },
  footerLinksRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  footerLinkText: {
    fontSize: 12.5,
    fontWeight: "500",
    color: "#6B7280",
  },
});
