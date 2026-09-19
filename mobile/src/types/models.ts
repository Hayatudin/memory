export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  createdAt: string;
}

export type MemoryType = "text" | "image" | "link" | "voice";

export type MemorySourceType =
  | "note"
  | "web"
  | "image"
  | "document"
  | "audio"
  | "other"
  | MemoryType;

export interface Category {
  id: string;
  userId: string;
  name: string;
  slug: string;
  icon?: string | null;
  color?: string | null;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LinkPreviewData {
  url: string;
  title: string;
  description: string;
  image: string | null;
  siteName: string;
}

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
  categoryId?: string | null;
  categoryName?: string | null;
  categoryIcon?: string | null;
  categoryColor?: string | null;
  title: string;
  content?: string | null;
  type: MemoryType;
  sourceType: MemorySourceType;
  sourceUrl?: string | null;
  mediaUrl?: string | null;
  mediaMetadata?: any | null;
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
