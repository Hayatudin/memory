import { Platform } from "react-native";

export const APP_CONSTANTS = {
  APP_NAME: "Memory",
  VERSION: "1.0.0",
  DEFAULT_PAGE_SIZE: 20,
  API_BASE_URL: Platform.select({
    android: "http://10.0.2.2:4000",
    ios: "http://localhost:4000",
    default: "http://localhost:4000",
  }),
  STORAGE_KEYS: {
    AUTH_TOKEN: "memory_auth_token",
    USER_DATA: "memory_user_data",
  },
};
