export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  createdAt: string;
}

export type MemorySourceType =
  | "note"
  | "web"
  | "image"
  | "document"
  | "audio"
  | "other";

export interface MemoryAsset {
  id: string;
  memoryId: string;
  storageKey: string;
  fileUrl: string;
  fileName: string;
  mimeType: string;
  fileSizeBytes?: number | null;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color?: string | null;
}

export interface Memory {
  id: string;
  userId: string;
  title: string;
  content?: string | null;
  sourceUrl?: string | null;
  sourceType: MemorySourceType;
  isFavorite: boolean;
  isArchived: boolean;
  metadata?: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
  assets?: MemoryAsset[];
  tags?: Tag[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  pagination?: PaginationMeta;
  error?: {
    code: string;
    message: string;
    details?: any[];
  };
}
