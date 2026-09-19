import fs from "fs";
import path from "path";
import crypto from "crypto";

const DATA_DIR = path.resolve(process.cwd(), "data");
const MEMORIES_FILE = path.join(DATA_DIR, "local_memories.json");
const CATEGORIES_FILE = path.join(DATA_DIR, "local_categories.json");

export interface LocalCategory {
  id: string;
  userId: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LocalMemory {
  id: string;
  userId: string;
  categoryId?: string | null;
  categoryName?: string | null;
  categoryIcon?: string | null;
  categoryColor?: string | null;
  title: string;
  content?: string | null;
  type: string;
  sourceUrl?: string | null;
  mediaUrl?: string | null;
  mediaMetadata?: any | null;
  isFavorite: boolean;
  isArchived: boolean;
  metadata?: any | null;
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_CATEGORIES: Array<Omit<LocalCategory, "id" | "userId" | "createdAt" | "updatedAt">> = [
  { name: "Entertainment", slug: "entertainment", icon: "video", color: "#FF5C5C" },
  { name: "Ideas", slug: "ideas", icon: "lightbulb", color: "#FFD028" },
  { name: "Music", slug: "music", icon: "music", color: "#A855F7" },
  { name: "Tech", slug: "tech", icon: "tech", color: "#3B82F6" },
  { name: "Books", slug: "books", icon: "book", color: "#10B981" },
  { name: "Resources", slug: "resources", icon: "link", color: "#6366F1" },
];

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readMemories(): LocalMemory[] {
  ensureDir();
  if (!fs.existsSync(MEMORIES_FILE)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(MEMORIES_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeMemories(items: LocalMemory[]) {
  ensureDir();
  fs.writeFileSync(MEMORIES_FILE, JSON.stringify(items, null, 2), "utf-8");
}

function readAllCategories(): LocalCategory[] {
  ensureDir();
  if (fs.existsSync(CATEGORIES_FILE)) {
    try {
      const raw = fs.readFileSync(CATEGORIES_FILE, "utf-8");
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }
  return [];
}

function writeAllCategories(list: LocalCategory[]) {
  ensureDir();
  fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(list, null, 2), "utf-8");
}

function readCategories(userId: string): LocalCategory[] {
  let list = readAllCategories();

  const userCats = list.filter((c) => c.userId === userId);
  if (userCats.length === 0) {
    const now = new Date().toISOString();
    const seeded = DEFAULT_CATEGORIES.map((def) => ({
      id: `cat-${def.slug}-${crypto.randomUUID().slice(0, 8)}`,
      userId,
      ...def,
      createdAt: now,
      updatedAt: now,
    }));
    list.push(...seeded);
    writeAllCategories(list);
    return seeded;
  }

  return userCats;
}

export const LocalStore = {
  listCategories(userId: string): LocalCategory[] {
    return readCategories(userId);
  },

  getCategoryById(userId: string, id: string): LocalCategory | null {
    const cats = readCategories(userId);
    return cats.find((c) => c.id === id) || null;
  },

  createCategory(userId: string, data: any): LocalCategory {
    const list = readAllCategories();
    const slug = (data.name || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const now = new Date().toISOString();
    const newCat: LocalCategory = {
      id: `cat-${slug}-${crypto.randomUUID().slice(0, 8)}`,
      userId,
      name: data.name.trim(),
      slug: slug || "category",
      icon: data.icon || "folder",
      color: data.color || "#D4F82C",
      description: data.description || null,
      createdAt: now,
      updatedAt: now,
    };
    list.push(newCat);
    writeAllCategories(list);
    return newCat;
  },

  updateCategory(userId: string, id: string, data: any): LocalCategory | null {
    const list = readAllCategories();
    const idx = list.findIndex((c) => c.id === id && c.userId === userId);
    if (idx === -1) return null;
    const cat = { ...list[idx] };
    if (data.name !== undefined) {
      cat.name = data.name.trim();
      cat.slug = data.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    }
    if (data.icon !== undefined) cat.icon = data.icon;
    if (data.color !== undefined) cat.color = data.color;
    if (data.description !== undefined) cat.description = data.description;
    cat.updatedAt = new Date().toISOString();
    list[idx] = cat;
    writeAllCategories(list);
    return cat;
  },

  deleteCategory(userId: string, id: string): boolean {
    const list = readAllCategories();
    const filtered = list.filter((c) => !(c.id === id && c.userId === userId));
    if (filtered.length === list.length) return false;
    writeAllCategories(filtered);
    return true;
  },

  clearAllMemories(userId?: string) {
    if (userId) {
      const all = readMemories();
      const remaining = all.filter((m) => m.userId !== userId);
      writeMemories(remaining);
    } else {
      writeMemories([]);
    }
  },

  listMemories(userId: string, filters: any = {}): LocalMemory[] {
    let all = readMemories().filter((m) => m.userId === userId);

    if (filters.categoryId) {
      all = all.filter((m) => m.categoryId === filters.categoryId);
    }
    if (filters.type) {
      all = all.filter((m) => m.type === filters.type);
    }
    if (filters.isFavorite !== undefined) {
      all = all.filter((m) => m.isFavorite === filters.isFavorite);
    }
    if (filters.isArchived !== undefined) {
      all = all.filter((m) => m.isArchived === filters.isArchived);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      all = all.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          (m.content && m.content.toLowerCase().includes(q))
      );
    }

    all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return all;
  },

  getMemoryById(userId: string, id: string): LocalMemory | null {
    const all = readMemories();
    return all.find((m) => m.id === id && m.userId === userId) || null;
  },

  createMemory(userId: string, data: any): LocalMemory {
    const all = readMemories();
    const categories = readCategories(userId);

    let catId = data.categoryId || null;
    let catName: string | null = null;
    let catIcon: string | null = null;
    let catColor: string | null = null;

    if (catId) {
      const found = categories.find((c) => c.id === catId);
      if (found) {
        catName = found.name;
        catIcon = found.icon;
        catColor = found.color;
      }
    } else if (categories.length > 0) {
      const defaultCat = categories.find((c) => c.name === "Ideas") || categories[0];
      catId = defaultCat.id;
      catName = defaultCat.name;
      catIcon = defaultCat.icon;
      catColor = defaultCat.color;
    }

    const now = new Date().toISOString();
    const newMemory: LocalMemory = {
      id: crypto.randomUUID(),
      userId,
      categoryId: catId,
      categoryName: catName,
      categoryIcon: catIcon,
      categoryColor: catColor,
      title: (data.title || "Note").trim(),
      content: data.content || null,
      type: data.type || "text",
      sourceUrl: data.sourceUrl || null,
      mediaUrl: data.mediaUrl || null,
      mediaMetadata: data.mediaMetadata || null,
      isFavorite: Boolean(data.isFavorite),
      isArchived: false,
      metadata: data.metadata || null,
      createdAt: now,
      updatedAt: now,
    };

    all.unshift(newMemory);
    writeMemories(all);
    return newMemory;
  },

  updateMemory(userId: string, id: string, data: any): LocalMemory | null {
    const all = readMemories();
    const idx = all.findIndex((m) => m.id === id && m.userId === userId);
    if (idx === -1) return null;

    const existing = all[idx];
    const categories = readCategories(userId);

    let catName = existing.categoryName;
    let catIcon = existing.categoryIcon;
    let catColor = existing.categoryColor;

    if (data.categoryId !== undefined) {
      const found = categories.find((c) => c.id === data.categoryId);
      if (found) {
        catName = found.name;
        catIcon = found.icon;
        catColor = found.color;
      }
    }

    const updated: LocalMemory = {
      ...existing,
      title: data.title !== undefined ? data.title.trim() : existing.title,
      content: data.content !== undefined ? data.content : existing.content,
      type: data.type !== undefined ? data.type : existing.type,
      categoryId: data.categoryId !== undefined ? data.categoryId : existing.categoryId,
      categoryName: catName,
      categoryIcon: catIcon,
      categoryColor: catColor,
      sourceUrl: data.sourceUrl !== undefined ? data.sourceUrl : existing.sourceUrl,
      mediaUrl: data.mediaUrl !== undefined ? data.mediaUrl : existing.mediaUrl,
      mediaMetadata: data.mediaMetadata !== undefined ? data.mediaMetadata : existing.mediaMetadata,
      isFavorite: data.isFavorite !== undefined ? Boolean(data.isFavorite) : existing.isFavorite,
      isArchived: data.isArchived !== undefined ? Boolean(data.isArchived) : existing.isArchived,
      metadata: data.metadata !== undefined ? data.metadata : existing.metadata,
      updatedAt: new Date().toISOString(),
    };

    all[idx] = updated;
    writeMemories(all);
    return updated;
  },

  deleteMemory(userId: string, id: string): boolean {
    const all = readMemories();
    const filtered = all.filter((m) => !(m.id === id && m.userId === userId));
    if (filtered.length === all.length) return false;
    writeMemories(filtered);
    return true;
  },
};
