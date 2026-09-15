import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  AUTH_TOKEN: "@memory/auth_token",
  USER_DATA: "@memory/user_data",
  PROFILE_DATA: "@memory/profile_data",
  THEME_PREFERENCE: "@memory/theme_preference",
};

// In-memory fallback for test environments or bridge unavailabilities
const inMemoryStore: Record<string, string> = {};

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

export const Storage = {
  async setToken(token: string): Promise<void> {
    try {
      if (AsyncStorage?.setItem) {
        await withTimeout(AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token), 1000, undefined);
      } else {
        inMemoryStore[STORAGE_KEYS.AUTH_TOKEN] = token;
      }
    } catch {
      inMemoryStore[STORAGE_KEYS.AUTH_TOKEN] = token;
    }
  },

  async getToken(): Promise<string | null> {
    try {
      if (AsyncStorage?.getItem) {
        const val = await withTimeout(
          AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
          800,
          null
        );
        return val || inMemoryStore[STORAGE_KEYS.AUTH_TOKEN] || null;
      }
      return inMemoryStore[STORAGE_KEYS.AUTH_TOKEN] || null;
    } catch {
      return inMemoryStore[STORAGE_KEYS.AUTH_TOKEN] || null;
    }
  },

  async removeToken(): Promise<void> {
    try {
      if (AsyncStorage?.removeItem) {
        await withTimeout(AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN), 1000, undefined);
      }
      delete inMemoryStore[STORAGE_KEYS.AUTH_TOKEN];
    } catch {
      delete inMemoryStore[STORAGE_KEYS.AUTH_TOKEN];
    }
  },

  async setUserData(user: unknown): Promise<void> {
    const serialized = JSON.stringify(user);
    try {
      if (AsyncStorage?.setItem) {
        await withTimeout(AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, serialized), 1000, undefined);
      } else {
        inMemoryStore[STORAGE_KEYS.USER_DATA] = serialized;
      }
    } catch {
      inMemoryStore[STORAGE_KEYS.USER_DATA] = serialized;
    }
  },

  async getUserData<T>(): Promise<T | null> {
    try {
      let data: string | null = null;
      if (AsyncStorage?.getItem) {
        data = await withTimeout(AsyncStorage.getItem(STORAGE_KEYS.USER_DATA), 800, null);
      }
      if (!data) {
        data = inMemoryStore[STORAGE_KEYS.USER_DATA] || null;
      }
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  async clearAllAuth(): Promise<void> {
    try {
      if (AsyncStorage?.multiRemove) {
        await withTimeout(
          AsyncStorage.multiRemove([
            STORAGE_KEYS.AUTH_TOKEN,
            STORAGE_KEYS.USER_DATA,
            STORAGE_KEYS.PROFILE_DATA,
          ]),
          1000,
          undefined
        );
      }
    } catch {
      // ignore
    }
    delete inMemoryStore[STORAGE_KEYS.AUTH_TOKEN];
    delete inMemoryStore[STORAGE_KEYS.USER_DATA];
    delete inMemoryStore[STORAGE_KEYS.PROFILE_DATA];
  },
};

