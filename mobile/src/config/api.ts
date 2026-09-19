// Use the same dynamic host detection as env.ts so physical iPhone testing works.
// On Android emulator: 10.0.2.2 → host machine localhost
// On physical iOS device: derive host from the Metro bundle URL (same IP the QR code pointed to)
import { Platform, NativeModules } from "react-native";

function getApiHost(): string {
  if (Platform.OS === "android") {
    return "http://10.0.2.2:4000";
  }
  // Detect host from Metro's scriptURL so physical devices resolve correctly
  try {
    const scriptURL: string | undefined = NativeModules?.SourceCode?.scriptURL;
    if (scriptURL) {
      const address = scriptURL.split("://")[1]?.split("/")[0]?.split(":")[0];
      if (address && address !== "localhost" && address !== "127.0.0.1") {
        return `http://${address}:4000`;
      }
    }
  } catch {
    // ignore
  }
  return "http://10.178.76.87:4000";
}

export const API_CONFIG = {
  BASE_URL: getApiHost(),
  API_PREFIX: "/api",
  TIMEOUT_MS: 5000,
  AUTH_ENDPOINTS: {
    SIGN_UP: "/api/auth/sign-up/email",
    SIGN_IN: "/api/auth/sign-in/email",
    SIGN_OUT: "/api/auth/sign-out",
    SESSION: "/api/auth/get-session",
    ME: "/api/me",
    HEALTH: "/api/health",
  },
};
