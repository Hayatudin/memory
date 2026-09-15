export const Theme = {
  colors: {
    // Core Brand / Neon Lime
    primary: "#D4F82C", // Vibrant electric lime from design
    primaryDark: "#A8CC16",
    primaryLight: "#E4FF63",
    primaryGlow: "rgba(212, 248, 44, 0.25)",
    primaryGlowSoft: "rgba(212, 248, 44, 0.12)",

    // Backgrounds & Surfaces
    background: "#000000",
    backgroundSecondary: "#0A0B0D",
    surface: "#161719", // Dark charcoal card background
    surfaceElevated: "#1E2024", // Floating cards and inputs
    surfacePill: "#23252A", // Dark action pills
    surfaceHighlight: "#2A2D34",

    // Borders
    border: "#23262C",
    borderLight: "#2D3139",
    borderFocus: "#D4F82C",

    // Text & Content
    textPrimary: "#FFFFFF",
    textSecondary: "#9CA3AF",
    textMuted: "#6B7280",
    textOnPrimary: "#0B0E02", // Deep dark text for contrast on lime

    // Status & Utility
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    dangerDark: "#270D10", // Burgundy background for logout button
    dangerBorder: "#3D1318",
    dangerText: "#F87171",

    // Functional & Media Accents
    cyan: "#38BDF8",
    purple: "#A855F7",
    white: "#FFFFFF",
    black: "#000000",
    transparent: "transparent",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 48,
  },
  borderRadius: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 20,
    xl: 28,
    full: 9999,
  },
  typography: {
    hero: { fontSize: 32, fontWeight: "700" as const, color: "#FFFFFF", letterSpacing: -0.5 },
    h1: { fontSize: 28, fontWeight: "700" as const, color: "#FFFFFF", letterSpacing: -0.4 },
    h2: { fontSize: 22, fontWeight: "600" as const, color: "#FFFFFF", letterSpacing: -0.3 },
    h3: { fontSize: 18, fontWeight: "600" as const, color: "#FFFFFF" },
    subtitle: { fontSize: 15, fontWeight: "500" as const, color: "#9CA3AF" },
    body: { fontSize: 14, fontWeight: "400" as const, color: "#9CA3AF" },
    bodyBold: { fontSize: 14, fontWeight: "600" as const, color: "#FFFFFF" },
    caption: { fontSize: 12, fontWeight: "400" as const, color: "#6B7280" },
    captionBold: { fontSize: 12, fontWeight: "600" as const, color: "#9CA3AF" },
    badge: { fontSize: 10, fontWeight: "700" as const, color: "#FFFFFF" },
  },
};
