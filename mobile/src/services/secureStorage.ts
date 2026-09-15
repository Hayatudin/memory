import AsyncStorage from "@react-native-async-storage/async-storage";
import { Config } from "../config/env";

/**
 * Storage service for auth tokens and cached user sessions.
 */
export class SecureStorageService {
  static async getToken(): Promise<string | null> {
    try {
      const res = await Promise.race([
        AsyncStorage.getItem(Config.AUTH_TOKEN_KEY),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 800)),
      ]);
      return res;
    } catch (e) {
      console.error("Failed to retrieve auth token:", e);
      return null;
    }
  }

  static async setToken(token: string): Promise<void> {
    try {
      await Promise.race([
        AsyncStorage.setItem(Config.AUTH_TOKEN_KEY, token),
        new Promise<void>((resolve) => setTimeout(() => resolve(), 800)),
      ]);
    } catch (e) {
      console.error("Failed to persist auth token:", e);
    }
  }

  static async removeToken(): Promise<void> {
    try {
      await Promise.race([
        AsyncStorage.removeItem(Config.AUTH_TOKEN_KEY),
        new Promise<void>((resolve) => setTimeout(() => resolve(), 800)),
      ]);
    } catch (e) {
      console.error("Failed to remove auth token:", e);
    }
  }

  static async clearAll(): Promise<void> {
    try {
      await Promise.race([
        AsyncStorage.multiRemove([Config.AUTH_TOKEN_KEY, Config.USER_DATA_KEY]),
        new Promise<void>((resolve) => setTimeout(() => resolve(), 800)),
      ]);
    } catch (e) {
      console.error("Failed to clear auth storage:", e);
    }
  }
}
