import { create } from "zustand";
import { User, Profile } from "../services/authService";
import { Storage } from "../services/storage";

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
      const token = await Storage.getToken();
      if (token === MOCK_TOKEN) {
        // Restore mock session
        const mockUser = MOCK_USERS[0];
        set({
          user: mockUser.user,
          profile: mockUser.profile,
          token: MOCK_TOKEN,
          isAuthenticated: true,
          isLoading: false,
        });
        return;
      }
      set({ isAuthenticated: false, user: null, profile: null, token: null, isLoading: false });
    } catch {
      set({ isAuthenticated: false, user: null, profile: null, token: null, isLoading: false });
    }
  },

  login: async (payload) => {
    set({ isSubmitting: true, error: null });

    // Simulate network delay
    await new Promise((resolve) => setTimeout(() => resolve(undefined), 600));

    const match = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === payload.email.toLowerCase() && u.password === payload.password
    );

    if (!match) {
      set({ error: "Invalid email or password. Please try again.", isSubmitting: false });
      return false;
    }

    await Storage.setToken(MOCK_TOKEN);
    set({
      user: match.user,
      profile: match.profile,
      token: MOCK_TOKEN,
      isAuthenticated: true,
      isSubmitting: false,
      error: null,
    });
    return true;
  },

  register: async (payload) => {
    set({ isSubmitting: true, error: null });

    // Simulate network delay
    await new Promise((resolve) => setTimeout(() => resolve(undefined), 800));

    // Check if email already exists
    const exists = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === payload.email.toLowerCase()
    );
    if (exists) {
      set({ error: "An account with this email already exists.", isSubmitting: false });
      return false;
    }

    // Create a new mock user for any other email
    const newUser: User = {
      id: `mock-user-${Date.now()}`,
      name: payload.name,
      email: payload.email,
      emailVerified: false,
      image: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const newProfile: Profile = {
      id: `mock-profile-${Date.now()}`,
      userId: newUser.id,
      displayName: payload.name,
      bio: null,
      avatarUrl: null,
      timezone: "UTC",
      preferences: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

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
    await Storage.clearAllAuth();
    set({
      user: null,
      profile: null,
      token: null,
      isAuthenticated: false,
      isSubmitting: false,
      error: null,
    });
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

