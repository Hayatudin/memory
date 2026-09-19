import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { Config } from "../config/env";
import { SecureStorageService } from "../services/secureStorage";

export const apiClient: AxiosInstance = axios.create({
  baseURL: Config.API_BASE_URL,
  timeout: Config.TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor: Inject Bearer token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    let token = await SecureStorageService.getToken();
    if (!token) {
      try {
        const { Storage } = await import("../services/storage");
        token = await Storage.getToken();
      } catch {
        // ignore
      }
    }
    const finalToken = token || "mock-auth-token-orhan-001";
    if (config.headers) {
      config.headers.Authorization = `Bearer ${finalToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Global 401 handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      await SecureStorageService.removeToken();
    }
    return Promise.reject(error);
  }
);
