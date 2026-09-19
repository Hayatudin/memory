import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  ActivityIndicator,
} from "react-native";
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop } from "react-native-svg";
import { Icon } from "../common/Icon";

// ==========================================
// 1. Image Options Sheet
// ==========================================
interface ImageOptionsSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectGallery: () => void;
  onSelectCamera: () => void;
}

export const ImageOptionsSheet: React.FC<ImageOptionsSheetProps> = ({
  visible,
  onClose,
  onSelectGallery,
  onSelectCamera,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={modalStyles.overlay}>
          <TouchableWithoutFeedback>
            <View style={modalStyles.sheetContent}>
              {/* Sheet Title */}
              <Text style={modalStyles.sheetTitle}>Image Options</Text>

              {/* Options Box */}
              <View style={modalStyles.optionsBox}>
                <TouchableOpacity
                  style={modalStyles.optionRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    onClose();
                    onSelectGallery();
                  }}
                >
                  <View style={modalStyles.greenIconBadge}>
                    <Icon name="image" size={18} color="#8AE026" strokeWidth={2.2} />
                  </View>
                  <Text style={modalStyles.optionLabel}>Choose from gallery</Text>
                  <Icon name="chevron-right" size={16} color="#6B7280" />
                </TouchableOpacity>

                <View style={modalStyles.optionDivider} />

                <TouchableOpacity
                  style={modalStyles.optionRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    onClose();
                    onSelectCamera();
                  }}
                >
                  <View style={modalStyles.greenIconBadge}>
                    <Icon name="camera" size={18} color="#8AE026" strokeWidth={2.2} />
                  </View>
                  <Text style={modalStyles.optionLabel}>Take photo</Text>
                  <Icon name="chevron-right" size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Cancel Button */}
              <TouchableOpacity
                style={modalStyles.cancelBtn}
                activeOpacity={0.8}
                onPress={onClose}
              >
                <Text style={modalStyles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// ==========================================
// 2. Link Preview Loading Modal
// ==========================================
interface LinkPreviewLoadingModalProps {
  visible: boolean;
}

export const LinkPreviewLoadingModal: React.FC<LinkPreviewLoadingModalProps> = ({
  visible,
}) => {
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      const loop = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1100,
          useNativeDriver: true,
        })
      );
      loop.start();
      return () => loop.stop();
    } else {
      spinAnim.setValue(0);
    }
  }, [visible, spinAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={modalStyles.centerOverlay}>
        <View style={modalStyles.dialogBox}>
          <Text style={modalStyles.dialogTopTitle}>Link Preview Loading</Text>

          {/* Animated Glowing Ring Spinner */}
          <View style={modalStyles.spinnerWrapper}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Svg width={46} height={46} viewBox="0 0 46 46">
                <Defs>
                  <LinearGradient id="spinnerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#8AE026" stopOpacity={1} />
                    <Stop offset="60%" stopColor="#55AA11" stopOpacity={0.7} />
                    <Stop offset="100%" stopColor="#8AE026" stopOpacity={0} />
                  </LinearGradient>
                </Defs>
                <Circle
                  cx="23"
                  cy="23"
                  r="19"
                  stroke="#1F2432"
                  strokeWidth="3.5"
                  fill="none"
                />
                <Circle
                  cx="23"
                  cy="23"
                  r="19"
                  stroke="url(#spinnerGrad)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray="90 40"
                  fill="none"
                />
              </Svg>
            </Animated.View>
          </View>

          <Text style={modalStyles.dialogHeadline}>Fetching link preview...</Text>
          <Text style={modalStyles.dialogSubtitle}>
            This will only take a moment.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

// ==========================================
// 3. Voice Processing Modal
// ==========================================
interface VoiceProcessingModalProps {
  visible: boolean;
}

export const VoiceProcessingModal: React.FC<VoiceProcessingModalProps> = ({
  visible,
}) => {
  const bars = useRef([
    new Animated.Value(10),
    new Animated.Value(18),
    new Animated.Value(28),
    new Animated.Value(20),
    new Animated.Value(12),
  ]).current;

  useEffect(() => {
    if (visible) {
      const anims = bars.map((b, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(b, {
              toValue: 26 + (i % 2) * 6,
              duration: 250 + i * 50,
              useNativeDriver: false,
            }),
            Animated.timing(b, {
              toValue: 8 + (i % 2) * 4,
              duration: 250 + i * 50,
              useNativeDriver: false,
            }),
          ])
        )
      );
      anims.forEach((a) => a.start());
      return () => anims.forEach((a) => a.stop());
    }
  }, [visible, bars]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={modalStyles.centerOverlay}>
        <View style={modalStyles.dialogBox}>
          <Text style={modalStyles.dialogTopTitle}>Voice Processing</Text>

          {/* Animated Wave Bars */}
          <View style={modalStyles.waveContainer}>
            {bars.map((animVal, idx) => (
              <Animated.View
                key={idx}
                style={[
                  modalStyles.voiceBar,
                  { height: animVal },
                ]}
              />
            ))}
          </View>

          <Text style={modalStyles.dialogHeadline}>Processing audio...</Text>
          <Text style={modalStyles.dialogSubtitle}>
            Please wait while we prepare your memory.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

// ==========================================
// 4. Failed To Save Memory Modal
// ==========================================
interface SaveErrorModalProps {
  visible: boolean;
  onTryAgain: () => void;
  onClose: () => void;
  message?: string;
}

export const SaveErrorModal: React.FC<SaveErrorModalProps> = ({
  visible,
  onTryAgain,
  onClose,
  message = "Please check your connection and try again.",
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={modalStyles.centerOverlay}>
        <View style={modalStyles.dialogBox}>
          {/* Top-right Cancel Icon (Only icon, no word) */}
          <TouchableOpacity
            style={modalStyles.modalCloseIconBtn}
            activeOpacity={0.7}
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path
                d="M18 6L6 18M6 6l12 12"
                stroke="#8E95A5"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>

          {/* Glowing Red Warning Badge */}
          <View style={modalStyles.errorIconBadge}>
            <Icon name="alert-triangle" size={24} color="#FF4D4D" strokeWidth={2.4} />
          </View>

          <Text style={modalStyles.dialogHeadline}>Failed to save memory</Text>
          <Text style={modalStyles.dialogSubtitle}>{message}</Text>

          <TouchableOpacity
            style={modalStyles.primaryGreenBtn}
            activeOpacity={0.85}
            onPress={onTryAgain}
          >
            <Text style={modalStyles.primaryGreenBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ==========================================
// 5. Unsaved Changes Modal
// ==========================================
interface UnsavedChangesModalProps {
  visible: boolean;
  onStay: () => void;
  onDiscard: () => void;
}

export const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  visible,
  onStay,
  onDiscard,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onStay}
    >
      <View style={modalStyles.centerOverlay}>
        <View style={modalStyles.dialogBox}>
          {/* Info Icon Badge */}
          <View style={modalStyles.infoIconBadge}>
            <Icon name="info" size={22} color="#9CA3AF" strokeWidth={2.2} />
          </View>

          <Text style={modalStyles.dialogHeadline}>You have unsaved changes</Text>
          <Text style={modalStyles.dialogSubtitle}>
            Are you sure you want to leave?
          </Text>

          {/* Action Buttons: Stay / Discard */}
          <View style={modalStyles.dualButtonsRow}>
            <TouchableOpacity
              style={modalStyles.darkActionBtn}
              activeOpacity={0.8}
              onPress={onStay}
            >
              <Text style={modalStyles.darkActionBtnText}>Stay</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={modalStyles.limeActionBtn}
              activeOpacity={0.85}
              onPress={onDiscard}
            >
              <Text style={modalStyles.limeActionBtnText}>Discard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ==========================================
// Styles
// ==========================================
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.78)",
    justifyContent: "flex-end",
  },
  centerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  sheetContent: {
    backgroundColor: "#0F1218",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderColor: "#1E2432",
  },
  sheetTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  optionsBox: {
    backgroundColor: "#131722",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1E2432",
    overflow: "hidden",
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  greenIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(138, 224, 38, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(138, 224, 38, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  optionLabel: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  optionDivider: {
    height: 1,
    backgroundColor: "#1C212E",
    marginLeft: 66,
  },
  cancelBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: "#131722",
    borderWidth: 1,
    borderColor: "#1E2432",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  dialogBox: {
    width: "100%",
    maxWidth: 326,
    backgroundColor: "#0F1218",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#1E2432",
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  modalCloseIconBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  dialogTopTitle: {
    color: "#8E95A5",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 16,
  },
  spinnerWrapper: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 8,
  },
  dialogHeadline: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 10,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  dialogSubtitle: {
    color: "#8E95A5",
    fontSize: 13,
    fontWeight: "400",
    marginTop: 6,
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 18,
  },
  waveContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    gap: 5,
    marginVertical: 6,
  },
  voiceBar: {
    width: 4,
    backgroundColor: "#8AE026",
    borderRadius: 2,
  },
  errorIconBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255, 77, 77, 0.12)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 77, 77, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  infoIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.07)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  primaryGreenBtn: {
    width: "100%",
    height: 50,
    borderRadius: 25,
    backgroundColor: "#8AE026",
    justifyContent: "center",
    alignItems: "center",
  },
  primaryGreenBtnText: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "800",
  },
  dualButtonsRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  darkActionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#161A24",
    borderWidth: 1,
    borderColor: "#222735",
    justifyContent: "center",
    alignItems: "center",
  },
  darkActionBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  limeActionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#8AE026",
    justifyContent: "center",
    alignItems: "center",
  },
  limeActionBtnText: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "800",
  },
});
