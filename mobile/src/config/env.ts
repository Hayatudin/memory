import { Platform, NativeModules } from "react-native";

/**
 * Mobile environment configuration.
 * Note: Never store backend secrets, database credentials, or AI API keys in this file.
 */

function getDevHost(): string {
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
  // Current LAN / Hotspot IP for physical iPhone testing
  return "http://172.20.10.4:4000";
}

const DEFAULT_DEV_URL =
  Platform.OS === "android" ? "http://10.0.2.2:4000" : getDevHost();


export const Config = {
  API_BASE_URL: DEFAULT_DEV_URL,
  API_VERSION_PREFIX: "/api/v1",
  TIMEOUT_MS: 15000,
  AUTH_TOKEN_KEY: "memory_auth_token",
  USER_DATA_KEY: "memory_user_data",
};
