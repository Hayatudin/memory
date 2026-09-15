import { apiClient } from "./apiClient";
import { API_CONFIG } from "../config/api";
import { Storage } from "./storage";

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Profile {
  id: string;
  userId: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  timezone: string;
  preferences: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthSession {
  id: string;
  expiresAt: string;
  userAgent?: string;
}

export interface SignUpRequest {
  name: string;
  email: string;
  password: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface MeResponse {
  success: boolean;
  data: {
    user: User;
    session: AuthSession;
    profile: Profile;
  };
}

export const AuthService = {
  async signUp(payload: SignUpRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_CONFIG.AUTH_ENDPOINTS.SIGN_UP,
      payload
    );

    if (response.data.token) {
      await Storage.setToken(response.data.token);
      await Storage.setUserData(response.data.user);
    }

    return response.data;
  },

  async signIn(payload: SignInRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_CONFIG.AUTH_ENDPOINTS.SIGN_IN,
      payload
    );

    if (response.data.token) {
      await Storage.setToken(response.data.token);
      await Storage.setUserData(response.data.user);
    }

    return response.data;
  },

  async getMe(): Promise<MeResponse["data"]> {
    const response = await apiClient.get<MeResponse>(API_CONFIG.AUTH_ENDPOINTS.ME);
    if (response.data.success && response.data.data) {
      await Storage.setUserData(response.data.data.user);
      return response.data.data;
    }
    throw new Error("Failed to load user profile");
  },

  async signOut(): Promise<void> {
    try {
      await apiClient.post(API_CONFIG.AUTH_ENDPOINTS.SIGN_OUT);
    } catch {
      // Ignore network errors during signout; local session clearance is paramount
    } finally {
      await Storage.clearAllAuth();
    }
  },

  async checkHealth(): Promise<{ status: string; database: string }> {
    const response = await apiClient.get(API_CONFIG.AUTH_ENDPOINTS.HEALTH);
    return response.data;
  },
};
