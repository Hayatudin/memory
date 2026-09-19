import { apiClient } from "./client";
import { Memory, ApiResponse, MemorySourceType, MemoryType, LinkPreviewData } from "../types/models";

export interface CreateMemoryPayload {
  title: string;
  content?: string;
  type?: MemoryType;
  categoryId?: string | null;
  sourceUrl?: string | null;
  mediaUrl?: string | null;
  mediaMetadata?: any | null;
  sourceType?: MemorySourceType;
  isFavorite?: boolean;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateMemoryPayload extends Partial<CreateMemoryPayload> {
  isArchived?: boolean;
}

export interface ListMemoriesParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  type?: MemoryType;
  sourceType?: MemorySourceType;
  isFavorite?: boolean;
  isArchived?: boolean;
  tag?: string;
  search?: string;
}

export class MemoriesApi {
  static async list(params: ListMemoriesParams = {}): Promise<ApiResponse<Memory[]>> {
    const res = await apiClient.get<ApiResponse<Memory[]>>("/api/v1/memories", {
      params,
    });
    return res.data;
  }

  static async getById(id: string): Promise<ApiResponse<Memory>> {
    const res = await apiClient.get<ApiResponse<Memory>>(`/api/v1/memories/${id}`);
    return res.data;
  }

  static async create(payload: CreateMemoryPayload): Promise<ApiResponse<Memory>> {
    const res = await apiClient.post<ApiResponse<Memory>>("/api/v1/memories", payload);
    return res.data;
  }

  static async update(id: string, payload: UpdateMemoryPayload): Promise<ApiResponse<Memory>> {
    const res = await apiClient.put<ApiResponse<Memory>>(`/api/v1/memories/${id}`, payload);
    return res.data;
  }

  static async delete(id: string): Promise<ApiResponse<{ id: string; deleted: boolean }>> {
    const res = await apiClient.delete<ApiResponse<{ id: string; deleted: boolean }>>(
      `/api/v1/memories/${id}`
    );
    return res.data;
  }

  static async getLinkPreview(url: string): Promise<ApiResponse<LinkPreviewData>> {
    const res = await apiClient.get<ApiResponse<LinkPreviewData>>(
      "/api/v1/memories/link-preview",
      { params: { url } }
    );
    return res.data;
  }

  static async search(q: string, page = 1, limit = 20): Promise<ApiResponse<Memory[]>> {
    const res = await apiClient.get<ApiResponse<Memory[]>>("/api/v1/search", {
      params: { q, page, limit },
    });
    return res.data;
  }
}
