import { apiClient } from "./client";
import { User } from "../types/models";

export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignUpPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthSessionResponse {
  user: User;
  session: {
    id: string;
    token: string;
    expiresAt: string;
  };
  token?: string;
}

export class AuthApi {
  static async signIn(payload: SignInPayload): Promise<{ user: User; token: string }> {
    const res = await apiClient.post<AuthSessionResponse>(
      "/api/auth/sign-in/email",
      payload
    );

    // Better Auth with Bearer plugin returns session.token or token header
    const token = res.data.token || res.data.session?.token;
    return {
      user: res.data.user,
      token,
    };
  }

  static async signUp(payload: SignUpPayload): Promise<{ user: User; token: string }> {
    const res = await apiClient.post<AuthSessionResponse>(
      "/api/auth/sign-up/email",
      payload
    );

    const token = res.data.token || res.data.session?.token;
    return {
      user: res.data.user,
      token,
    };
  }

  static async getSession(): Promise<{ user: User; token: string } | null> {
    try {
      const res = await apiClient.get<AuthSessionResponse>("/api/auth/get-session");
      if (res.data?.user) {
        return {
          user: res.data.user,
          token: res.data.token || res.data.session?.token,
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  static async signOut(): Promise<void> {
    try {
      await apiClient.post("/api/auth/sign-out");
    } catch {
      // Ignore network errors on logout
    }
  }
}
