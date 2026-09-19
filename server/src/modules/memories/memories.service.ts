import { eq, and, desc, like, or } from "drizzle-orm";
import { db, isDatabaseAvailable } from "../../db/index.js";
import { memories } from "../../db/schema/memories.js";
import { categories } from "../../db/schema/categories.js";
import { CategoriesService } from "../categories/categories.service.js";
import crypto from "crypto";

export interface CreateMemoryDTO {
  title: string;
  content?: string;
  type?: "text" | "image" | "link" | "voice";
  categoryId?: string;
  sourceUrl?: string;
  mediaUrl?: string;
  mediaMetadata?: any;
  isFavorite?: boolean;
  metadata?: any;
}

export interface UpdateMemoryDTO extends Partial<CreateMemoryDTO> {
  isArchived?: boolean;
}

export interface ListMemoriesFilter {
  categoryId?: string;
  type?: "text" | "image" | "link" | "voice";
  isFavorite?: boolean;
  isArchived?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export class MemoriesService {
  static async list(userId: string, filters: ListMemoriesFilter = {}) {
    const isAvail = await isDatabaseAvailable();
    if (!isAvail) {
      const { LocalStore } = await import("../../services/localStore.js");
      return LocalStore.listMemories(userId, filters);
    }
    try {
      const page = Math.max(1, Number(filters.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(filters.limit) || 50));
      const offset = (page - 1) * limit;

      const conditions: any[] = [eq(memories.userId, userId)];

      if (filters.categoryId) {
        conditions.push(eq(memories.categoryId, filters.categoryId));
      }
      if (filters.type) {
        conditions.push(eq(memories.type, filters.type));
      }
      if (filters.isFavorite !== undefined) {
        conditions.push(eq(memories.isFavorite, filters.isFavorite));
      }
      if (filters.isArchived !== undefined) {
        conditions.push(eq(memories.isArchived, filters.isArchived));
      }
      if (filters.search) {
        const q = `%${filters.search.trim()}%`;
        conditions.push(or(like(memories.title, q), like(memories.content, q)));
      }

      const rows = await db
        .select({
          id: memories.id,
          userId: memories.userId,
          categoryId: memories.categoryId,
          categoryName: categories.name,
          categoryIcon: categories.icon,
          categoryColor: categories.color,
          title: memories.title,
          content: memories.content,
          type: memories.type,
          sourceUrl: memories.sourceUrl,
          mediaUrl: memories.mediaUrl,
          mediaMetadata: memories.mediaMetadata,
          isFavorite: memories.isFavorite,
          isArchived: memories.isArchived,
          metadata: memories.metadata,
          createdAt: memories.createdAt,
          updatedAt: memories.updatedAt,
        })
        .from(memories)
        .leftJoin(categories, eq(memories.categoryId, categories.id))
        .where(and(...conditions))
        .orderBy(desc(memories.createdAt))
        .limit(limit)
        .offset(offset);

      return rows;
    } catch (err: any) {
      console.warn("[MEMORIES WARN] DB unavailable for list, using local store:", err?.message);
      const { LocalStore } = await import("../../services/localStore.js");
      return LocalStore.listMemories(userId, filters);
    }
  }

  static async getById(userId: string, id: string) {
    const isAvail = await isDatabaseAvailable();
    if (!isAvail) {
      const { LocalStore } = await import("../../services/localStore.js");
      return LocalStore.getMemoryById(userId, id);
    }
    try {
      const [row] = await db
        .select({
          id: memories.id,
          userId: memories.userId,
          categoryId: memories.categoryId,
          categoryName: categories.name,
          categoryIcon: categories.icon,
          categoryColor: categories.color,
          title: memories.title,
          content: memories.content,
          type: memories.type,
          sourceUrl: memories.sourceUrl,
          mediaUrl: memories.mediaUrl,
          mediaMetadata: memories.mediaMetadata,
          isFavorite: memories.isFavorite,
          isArchived: memories.isArchived,
          metadata: memories.metadata,
          createdAt: memories.createdAt,
          updatedAt: memories.updatedAt,
        })
        .from(memories)
        .leftJoin(categories, eq(memories.categoryId, categories.id))
        .where(and(eq(memories.id, id), eq(memories.userId, userId)));

      return row || null;
    } catch (err: any) {
      const { LocalStore } = await import("../../services/localStore.js");
      return LocalStore.getMemoryById(userId, id);
    }
  }

  static async create(userId: string, data: CreateMemoryDTO) {
    const isAvail = await isDatabaseAvailable();
    if (!isAvail) {
      const { LocalStore } = await import("../../services/localStore.js");
      return LocalStore.createMemory(userId, data);
    }
    try {
      let resolvedCategoryId = data.categoryId || null;
      if (!resolvedCategoryId) {
        try {
          const userCats = await CategoriesService.listByUser(userId);
          if (userCats.length > 0) {
            if (data.type === "image") {
              const match = userCats.find((c: any) => c.name === "Nature" || c.name === "Entertainment");
              resolvedCategoryId = match ? match.id : userCats[0].id;
            } else if (data.type === "voice") {
              const match = userCats.find((c: any) => c.name === "Music");
              resolvedCategoryId = match ? match.id : userCats[0].id;
            } else if (data.type === "link") {
              const match = userCats.find((c: any) => c.name === "Tech" || c.name === "Resources");
              resolvedCategoryId = match ? match.id : userCats[0].id;
            } else {
              const match = userCats.find((c: any) => c.name === "Ideas");
              resolvedCategoryId = match ? match.id : userCats[0].id;
            }
          }
        } catch {
          // ignore
        }
      }

      const id = crypto.randomUUID();
      const newMemory = {
        id,
        userId,
        title: data.title.trim(),
        content: data.content || null,
        type: data.type || "text",
        categoryId: resolvedCategoryId,
        sourceUrl: data.sourceUrl || null,
        mediaUrl: data.mediaUrl || null,
        mediaMetadata: data.mediaMetadata || null,
        isFavorite: Boolean(data.isFavorite),
        isArchived: false,
        metadata: data.metadata || null,
      };

      await db.insert(memories).values(newMemory);
      return await this.getById(userId, id);
    } catch (err: any) {
      console.warn("[MEMORIES WARN] DB unavailable for create, using local store:", err?.message);
      const { LocalStore } = await import("../../services/localStore.js");
      return LocalStore.createMemory(userId, data);
    }
  }

  static async update(userId: string, id: string, data: UpdateMemoryDTO) {
    const isAvail = await isDatabaseAvailable();
    if (!isAvail) {
      const { LocalStore } = await import("../../services/localStore.js");
      return LocalStore.updateMemory(userId, id, data);
    }
    try {
      const existing = await this.getById(userId, id);
      if (!existing) {
        const { LocalStore } = await import("../../services/localStore.js");
        return LocalStore.updateMemory(userId, id, data);
      }

      const updates: Partial<typeof memories.$inferInsert> = {};
      if (data.title !== undefined) updates.title = data.title.trim();
      if (data.content !== undefined) updates.content = data.content;
      if (data.type !== undefined) updates.type = data.type;
      if (data.categoryId !== undefined) updates.categoryId = data.categoryId;
      if (data.sourceUrl !== undefined) updates.sourceUrl = data.sourceUrl;
      if (data.mediaUrl !== undefined) updates.mediaUrl = data.mediaUrl;
      if (data.mediaMetadata !== undefined) updates.mediaMetadata = data.mediaMetadata;
      if (data.isFavorite !== undefined) updates.isFavorite = data.isFavorite;
      if (data.isArchived !== undefined) updates.isArchived = data.isArchived;
      if (data.metadata !== undefined) updates.metadata = data.metadata;

      await db
        .update(memories)
        .set(updates)
        .where(and(eq(memories.id, id), eq(memories.userId, userId)));

      return await this.getById(userId, id);
    } catch (err: any) {
      console.warn("[MEMORIES WARN] DB unavailable for update, using local store:", err?.message);
      const { LocalStore } = await import("../../services/localStore.js");
      return LocalStore.updateMemory(userId, id, data);
    }
  }

  static async delete(userId: string, id: string) {
    const isAvail = await isDatabaseAvailable();
    if (!isAvail) {
      const { LocalStore } = await import("../../services/localStore.js");
      return LocalStore.deleteMemory(userId, id);
    }
    try {
      const existing = await this.getById(userId, id);
      if (!existing) return false;

      await db
        .delete(memories)
        .where(and(eq(memories.id, id), eq(memories.userId, userId)));

      return true;
    } catch (err: any) {
      const { LocalStore } = await import("../../services/localStore.js");
      return LocalStore.deleteMemory(userId, id);
    }
  }
}
