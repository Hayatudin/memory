import { apiClient } from "./client";
import { ApiResponse, MemoryAsset } from "../types/models";

export interface PresignedUrlResponse {
  uploadUrl: string;
  storageKey: string;
  fileUrl: string;
  expiresInSeconds: number;
}

export class StorageApi {
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
