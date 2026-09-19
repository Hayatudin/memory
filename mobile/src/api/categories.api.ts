import { apiClient } from "./client";
import { ApiResponse, Category } from "../types/models";

export interface CreateCategoryPayload {
  name: string;
  icon?: string;
  color?: string;
  description?: string;
}

export interface UpdateCategoryPayload {
  name?: string;
  icon?: string;
  color?: string;
  description?: string;
}

export class CategoriesApi {
  /**
   * List all categories for the authenticated user (seeds default categories if empty).
   */
  static async list(): Promise<ApiResponse<Category[]>> {
    const res = await apiClient.get<ApiResponse<Category[]>>("/api/v1/categories");
    return res.data;
  }

  /**
   * Create a new custom category.
   */
  static async create(payload: CreateCategoryPayload): Promise<ApiResponse<Category>> {
    const res = await apiClient.post<ApiResponse<Category>>("/api/v1/categories", payload);
    return res.data;
  }

  /**
   * Update an existing category by ID.
   */
  static async update(
    id: string,
    payload: UpdateCategoryPayload
  ): Promise<ApiResponse<Category>> {
    const res = await apiClient.put<ApiResponse<Category>>(`/api/v1/categories/${id}`, payload);
    return res.data;
  }

  /**
   * Delete a category by ID.
   */
  static async delete(id: string): Promise<ApiResponse<{ id: string; deleted: boolean }>> {
    const res = await apiClient.delete<ApiResponse<{ id: string; deleted: boolean }>>(
      `/api/v1/categories/${id}`
    );
    return res.data;
  }
}
