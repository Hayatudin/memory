import { Platform } from "react-native";
import { apiClient } from "./client";
import { ApiResponse, MemoryAsset } from "../types/models";

export interface PresignedUrlResponse {
  uploadUrl: string;
  storageKey: string;
  fileUrl: string;
  expiresInSeconds: number;
}

export interface UploadFileResult {
  url: string;
  publicId?: string;
  format?: string;
  bytes?: number;
  mimeType?: string;
  originalName?: string;
}

import { Config } from "../config/env";
import { SecureStorageService } from "../services/secureStorage";

export class StorageApi {
  /**
   * Uploads an image or audio file directly to Cloudinary via the Express backend.
   */
  static async uploadFile(
    fileUri: string,
    fileName: string,
    mimeType: string
  ): Promise<UploadFileResult> {
    const formData = new FormData();

    // In React Native:
    // On iOS, RCTNetworking requires the "file://" prefix to read files from disk.
    // Ensure the URI has "file://" on iOS if it is a local path.
    let nativeUri = fileUri;
    if (Platform.OS === "ios" && !nativeUri.startsWith("file://") && !nativeUri.startsWith("ph://")) {
      nativeUri = `file://${nativeUri}`;
    }

    formData.append("file", {
      uri: nativeUri,
      type: mimeType || "image/jpeg",
      name: fileName || `image_${Date.now()}.jpg`,
    } as any);

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
    const uploadUrl = `${Config.API_BASE_URL}/api/v1/storage/upload`;

    // 15-second timeout for upload
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);

    try {
      // Use native fetch instead of Axios for FormData file uploads.
      // Do NOT specify "Content-Type" manually: React Native's native network layer
      // automatically populates "Content-Type: multipart/form-data; boundary=..." with the correct boundary!
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${finalToken}`,
          Accept: "application/json",
        },
        body: formData,
        signal: controller.signal,
      });

      const json = await response.json();
      if (!response.ok || !json.data?.url) {
        throw new Error(
          json.error?.message || json.message || `Upload failed with status ${response.status}`
        );
      }
      return json.data;
    } catch (err: any) {
      if (err.name === "AbortError") {
        throw new Error("Upload request timed out. Please check your network connection.");
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }
  /**
   * Request a presigned PUT URL from the backend.
   */
  static async getPresignedUrl(
    fileName: string,
    mimeType: string,
    fileSizeBytes?: number
  ): Promise<PresignedUrlResponse> {
    const res = await apiClient.post<ApiResponse<PresignedUrlResponse>>(
      "/api/v1/storage/presigned-url",
      { fileName, mimeType, fileSizeBytes }
    );
    if (!res.data.data) {
      throw new Error("Failed to get presigned upload URL");
    }
    return res.data.data;
  }

  /**
   * Uploads file binary data directly to external storage (S3 / R2) via presigned PUT.
   */
  static async uploadDirectToStorage(
    uploadUrl: string,
    fileBlobOrUri: any,
    mimeType: string
  ): Promise<void> {
    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": mimeType,
      },
      body: fileBlobOrUri,
    });

    if (!response.ok) {
      throw new Error(`Direct upload failed with status ${response.status}`);
    }
  }

  /**
   * Links uploaded asset key with memory record.
   */
  static async attachAsset(payload: {
    memoryId: string;
    storageKey: string;
    fileUrl: string;
    fileName: string;
    mimeType: string;
    fileSizeBytes?: number;
  }): Promise<MemoryAsset> {
    const res = await apiClient.post<ApiResponse<MemoryAsset>>(
      "/api/v1/storage/attach",
      payload
    );
    if (!res.data.data) {
      throw new Error("Failed to attach asset to memory");
    }
    return res.data.data;
  }
}
