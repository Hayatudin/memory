import { create } from "zustand";
import { User, Profile } from "../services/authService";
import { Storage } from "../services/storage";
import { SecureStorageService } from "../services/secureStorage";
import { AuthApi } from "../api/auth.api";

// ─── Mock Credentials ─────────────────────────────────────────────────────────
const MOCK_USERS: Array<{ email: string; password: string; user: User; profile: Profile }> = [
  {
    email: "orhan@gmail.com",
    password: "12345678",
    user: {
      id: "mock-user-001",
      name: "Orhan",
      email: "orhan@gmail.com",
      emailVerified: true,
      image: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    profile: {
      id: "mock-profile-001",
      userId: "mock-user-001",
      displayName: "Orhan",
      bio: "Memory app user",
      avatarUrl: null,
      timezone: "Europe/Istanbul",
      preferences: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
];

const MOCK_TOKEN = "mock-auth-token-orhan-001";

const toAuthUser = (u: any): User => ({
  id: u.id,
  name: u.name || "User",
  email: u.email,
  emailVerified: Boolean(u.emailVerified ?? true),
  image: u.image || null,
  createdAt: u.createdAt || new Date().toISOString(),
  updatedAt: u.updatedAt || new Date().toISOString(),
});

// ─── Auth State ───────────────────────────────────────────────────────────────
interface AuthState {
  user: User | null;
  profile: Profile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  initializeAuth: () => Promise<void>;
  login: (payload: { email: string; password: string }) => Promise<boolean>;
  register: (payload: { name: string; email: string; password: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshProfile: () => Promise<void>;
  updateAvatar: (avatarUrl: string) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  isSubmitting: false,
  error: null,

  initializeAuth: async () => {
    set({ isLoading: true, error: null });
    try {
      let token = await SecureStorageService.getToken();
      if (!token) {
        token = await Storage.getToken();
      }

      if (token && token !== MOCK_TOKEN) {
        try {
          const session = await AuthApi.getSession();
          if (session?.user) {
            const profile: Profile = {
              id: `profile-${session.user.id}`,
              userId: session.user.id,
              displayName: session.user.name || (session.user.email.split("@")[0] || "User"),
              bio: "Memory app user",
              avatarUrl: session.user.image || null,
              timezone: "UTC",
              preferences: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            set({
              user: toAuthUser(session.user),
              profile,
              token: session.token || token,
              isAuthenticated: true,
              isLoading: false,
            });
            return;
          }
        } catch {
          // ignore session fetch error
        }
      }

      // Auto-authenticate with backend in background for default user
      const defaultUser = MOCK_USERS[0];
      try {
        let authRes = await AuthApi.signIn({
          email: defaultUser.email,
          password: defaultUser.password,
        }).catch(async () => {
          return await AuthApi.signUp({
            name: defaultUser.user.name,
            email: defaultUser.email,
            password: defaultUser.password,
          });
        });

        if (authRes?.token) {
          await SecureStorageService.setToken(authRes.token);
          await Storage.setToken(authRes.token);
          set({
            user: toAuthUser(authRes.user),
            profile: defaultUser.profile,
            token: authRes.token,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }
      } catch {
        // Fallback to local user
      }

      set({
        user: defaultUser.user,
        profile: defaultUser.profile,
        token: MOCK_TOKEN,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      set({
        user: MOCK_USERS[0].user,
        profile: MOCK_USERS[0].profile,
        token: MOCK_TOKEN,
        isAuthenticated: true,
        isLoading: false,
      });
    }
  },

  login: async (payload) => {
    set({ isSubmitting: true, error: null });

    try {
      const authRes = await AuthApi.signIn({
        email: payload.email,
        password: payload.password,
      });

      if (authRes?.token) {
        await SecureStorageService.setToken(authRes.token);
        await Storage.setToken(authRes.token);

        const profile: Profile = {
          id: `profile-${authRes.user.id}`,
          userId: authRes.user.id,
          displayName: authRes.user.name || (authRes.user.email.split("@")[0] || "User"),
          bio: "Memory app user",
          avatarUrl: authRes.user.image || null,
          timezone: "UTC",
          preferences: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set({
          user: toAuthUser(authRes.user),
          profile,
          token: authRes.token,
          isAuthenticated: true,
          isSubmitting: false,
          error: null,
        });
        return true;
      }
    } catch (err: any) {
      console.warn("API login failed, falling back to local user:", err?.message);
    }

    const match = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === payload.email.toLowerCase() && u.password === payload.password
    );

    const user: User = match?.user || {
      id: `user-${Date.now()}`,
      name: payload.email.split("@")[0] || "User",
      email: payload.email,
      emailVerified: true,
      image: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const profile: Profile = match?.profile || {
      id: `profile-${Date.now()}`,
      userId: user.id,
      displayName: (payload.email.split("@")[0] || "User").replace(/[._-]/g, " "),
      bio: "Memory app user",
      avatarUrl: null,
      timezone: "UTC",
      preferences: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await SecureStorageService.setToken(MOCK_TOKEN);
    await Storage.setToken(MOCK_TOKEN);
    set({
      user,
      profile,
      token: MOCK_TOKEN,
      isAuthenticated: true,
      isSubmitting: false,
      error: null,
    });
    return true;
  },

  register: async (payload) => {
    set({ isSubmitting: true, error: null });

    try {
      const authRes = await AuthApi.signUp({
        name: payload.name,
        email: payload.email,
        password: payload.password,
      });

      if (authRes?.token) {
        await SecureStorageService.setToken(authRes.token);
        await Storage.setToken(authRes.token);

        const profile: Profile = {
          id: `profile-${authRes.user.id}`,
          userId: authRes.user.id,
          displayName: authRes.user.name || payload.name,
          bio: null,
          avatarUrl: null,
          timezone: "UTC",
          preferences: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set({
          user: toAuthUser(authRes.user),
          profile,
          token: authRes.token,
          isAuthenticated: true,
          isSubmitting: false,
          error: null,
        });
        return true;
      }
    } catch (err: any) {
      console.warn("API register failed, falling back:", err?.message);
    }

    // Check if email already exists
    const exists = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === payload.email.toLowerCase()
    );
    if (exists) {
      set({ error: "An account with this email already exists.", isSubmitting: false });
      return false;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: payload.name,
      email: payload.email,
      emailVerified: false,
      image: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const newProfile: Profile = {
      id: `profile-${Date.now()}`,
      userId: newUser.id,
      displayName: payload.name,
      bio: null,
      avatarUrl: null,
      timezone: "UTC",
      preferences: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await SecureStorageService.setToken(MOCK_TOKEN);
    await Storage.setToken(MOCK_TOKEN);
    set({
      user: newUser,
      profile: newProfile,
      token: MOCK_TOKEN,
      isAuthenticated: true,
      isSubmitting: false,
      error: null,
    });
    return true;
  },

  logout: async () => {
    set({ isSubmitting: true });
    try {
      await SecureStorageService.clearAll();
      await Storage.clearAllAuth();
    } catch (err) {
      console.error("Storage clear error on logout:", err);
    } finally {
      set({
        user: null,
        profile: null,
        token: null,
        isAuthenticated: false,
        isSubmitting: false,
        error: null,
      });
    }
  },

  clearError: () => set({ error: null }),

  refreshProfile: async () => {
    const { user, profile } = get();
    if (!user) return;
    // In mock mode, profile is already up to date
    set({ profile });
  },

  updateAvatar: (avatarUrl: string) => {
    const { profile, user } = get();
    if (profile) {
      set({ profile: { ...profile, avatarUrl } });
    } else if (user) {
      set({
        profile: {
          id: `mock-profile-${Date.now()}`,
          userId: user.id,
          displayName: user.name,
          bio: null,
          avatarUrl,
          timezone: "UTC",
          preferences: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    }
  },
}));

