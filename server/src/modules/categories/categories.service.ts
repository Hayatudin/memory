import { eq, and, desc } from "drizzle-orm";
import { db, isDatabaseAvailable } from "../../db/index.js";
import { categories } from "../../db/schema/categories.js";
import crypto from "crypto";

export interface CreateCategoryDTO {
  name: string;
  icon?: string;
  color?: string;
  description?: string;
}

export interface UpdateCategoryDTO {
  name?: string;
  icon?: string;
  color?: string;
  description?: string;
}

export class CategoriesService {
  static readonly DEFAULT_CATEGORIES = [
    { name: "Entertainment", icon: "video", color: "#FF5C5C" },
    { name: "Ideas", icon: "lightbulb", color: "#FFD028" },
    { name: "Music", icon: "music", color: "#A855F7" },
    { name: "Tech", icon: "tech", color: "#3B82F6" },
    { name: "Books", icon: "book", color: "#10B981" },
    { name: "Resources", icon: "link", color: "#6366F1" },
  ];

  static async listByUser(userId: string) {
    const isAvail = await isDatabaseAvailable();
    if (!isAvail) {
      const { LocalStore } = await import("../../services/localStore.js");
      return LocalStore.listCategories(userId);
    }
    try {
      const existing = await db
        .select()
        .from(categories)
        .where(eq(categories.userId, userId))
        .orderBy(desc(categories.createdAt));

      if (existing.length === 0) {
        // Auto-seed canonical default categories for the user
        for (const def of this.DEFAULT_CATEGORIES) {
          try {
            await this.create(userId, def);
          } catch {
            // ignore duplicate race
          }
        }
        return await db
          .select()
          .from(categories)
          .where(eq(categories.userId, userId))
          .orderBy(desc(categories.createdAt));
      }

      return existing;
    } catch (err: any) {
      console.warn("[CATEGORIES WARN] DB unavailable, using local store:", err?.message);
      const { LocalStore } = await import("../../services/localStore.js");
      return LocalStore.listCategories(userId);
    }
  }

  static async getById(userId: string, id: string) {
    const isAvail = await isDatabaseAvailable();
    if (!isAvail) {
      const { LocalStore } = await import("../../services/localStore.js");
      return LocalStore.getCategoryById(userId, id);
    }
    try {
      const [category] = await db
        .select()
        .from(categories)
        .where(and(eq(categories.id, id), eq(categories.userId, userId)));
      return category || null;
    } catch (err: any) {
      const { LocalStore } = await import("../../services/localStore.js");
      return LocalStore.getCategoryById(userId, id);
    }
  }

  static async create(userId: string, data: CreateCategoryDTO) {
    const isAvail = await isDatabaseAvailable();
    if (!isAvail) {
      const { LocalStore } = await import("../../services/localStore.js");
      return LocalStore.createCategory(userId, data);
    }
    try {
      const slug = data.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const newCategory = {
        id: crypto.randomUUID(),
        userId,
        name: data.name.trim(),
        slug: slug || "category",
        icon: data.icon || "folder",
        color: data.color || "#D4F82C",
        description: data.description || null,
      };

      await db.insert(categories).values(newCategory);
      return newCategory;
    } catch (err: any) {
      console.warn("[CATEGORIES WARN] DB insert failed, using LocalStore:", err?.message);
      const { LocalStore } = await import("../../services/localStore.js");
      return LocalStore.createCategory(userId, data);
    }
  }

  static async update(userId: string, id: string, data: UpdateCategoryDTO) {
    const isAvail = await isDatabaseAvailable();
    if (!isAvail) {
      const { LocalStore } = await import("../../services/localStore.js");
      return LocalStore.updateCategory(userId, id, data);
    }
    const existing = await this.getById(userId, id);
    if (!existing) return null;

    const updates: Partial<typeof categories.$inferInsert> = {};
    if (data.name !== undefined) {
      updates.name = data.name.trim();
      updates.slug = data.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    }
    if (data.icon !== undefined) updates.icon = data.icon;
    if (data.color !== undefined) updates.color = data.color;
    if (data.description !== undefined) updates.description = data.description;

    try {
      await db
        .update(categories)
        .set(updates)
        .where(and(eq(categories.id, id), eq(categories.userId, userId)));

      return this.getById(userId, id);
    } catch {
      const { LocalStore } = await import("../../services/localStore.js");
      return LocalStore.updateCategory(userId, id, data);
    }
  }

  static async delete(userId: string, id: string) {
    const isAvail = await isDatabaseAvailable();
    if (!isAvail) {
      const { LocalStore } = await import("../../services/localStore.js");
      return LocalStore.deleteCategory(userId, id);
    }
    try {
      const existing = await this.getById(userId, id);
      if (!existing) return false;

      await db
        .delete(categories)
        .where(and(eq(categories.id, id), eq(categories.userId, userId)));

      return true;
    } catch {
      const { LocalStore } = await import("../../services/localStore.js");
      return LocalStore.deleteCategory(userId, id);
    }
  }
}
