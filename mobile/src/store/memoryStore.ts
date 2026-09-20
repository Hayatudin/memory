import { create } from "zustand";
import { Memory, Category } from "../types/models";
import { MemoriesApi, ListMemoriesParams, CreateMemoryPayload, UpdateMemoryPayload } from "../api/memories.api";
import { CategoriesApi } from "../api/categories.api";

import AsyncStorage from "@react-native-async-storage/async-storage";

const FAVORITES_STORAGE_KEY = "@memory_app_favorite_categories_v1";
const ORDER_STORAGE_KEY = "@memory_app_category_order_v1";

interface MemoryState {
  memories: Memory[];
  categories: Category[];
  favoriteCategoryIds: string[];
  isLoading: boolean;
  isLoadingCategories: boolean;
  isRefreshing: boolean;
  page: number;
  hasMore: boolean;
  activeFilter: string | null;

  fetchMemories: (params?: ListMemoriesParams) => Promise<void>;
  refreshMemories: () => Promise<void>;
  loadMore: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  toggleFavoriteCategory: (id: string) => Promise<void>;
  reorderCategories: (orderedCategories: Category[]) => Promise<void>;
  createCategory: (name: string, icon?: string, color?: string) => Promise<Category>;
  updateCategory: (id: string, name: string, icon?: string, color?: string) => Promise<Category>;
  deleteCategory: (id: string) => Promise<boolean>;
  createMemory: (payload: CreateMemoryPayload) => Promise<Memory>;
  updateMemory: (id: string, payload: UpdateMemoryPayload) => Promise<Memory>;
  addMemoryLocally: (memory: Memory) => void;
  updateMemoryLocally: (memory: Memory) => void;
  removeMemoryLocally: (id: string) => void;
}

const INITIAL_STORE_CATEGORIES: Category[] = [
  {
    id: "cat-entertainment-000001",
    userId: "usr-orhan-default",
    name: "Entertainment",
    slug: "entertainment",
    icon: "video",
    color: "#FF5C5C",
    createdAt: "2026-09-19T00:00:00.000Z",
    updatedAt: "2026-09-19T00:00:00.000Z",
  },
  {
    id: "cat-ideas-000002",
    userId: "usr-orhan-default",
    name: "Ideas",
    slug: "ideas",
    icon: "lightbulb",
    color: "#FFD028",
    createdAt: "2026-09-19T00:00:00.000Z",
    updatedAt: "2026-09-19T00:00:00.000Z",
  },
  {
    id: "cat-music-000003",
    userId: "usr-orhan-default",
    name: "Music",
    slug: "music",
    icon: "music",
    color: "#A855F7",
    createdAt: "2026-09-19T00:00:00.000Z",
    updatedAt: "2026-09-19T00:00:00.000Z",
  },
  {
    id: "cat-tech-000004",
    userId: "usr-orhan-default",
    name: "Tech",
    slug: "tech",
    icon: "tech",
    color: "#3B82F6",
    createdAt: "2026-09-19T00:00:00.000Z",
    updatedAt: "2026-09-19T00:00:00.000Z",
  },
  {
    id: "cat-books-000005",
    userId: "usr-orhan-default",
    name: "Books",
    slug: "books",
    icon: "book",
    color: "#10B981",
    createdAt: "2026-09-19T00:00:00.000Z",
    updatedAt: "2026-09-19T00:00:00.000Z",
  },
  {
    id: "cat-resources-000006",
    userId: "usr-orhan-default",
    name: "Resources",
    slug: "resources",
    icon: "link",
    color: "#6366F1",
    createdAt: "2026-09-19T00:00:00.000Z",
    updatedAt: "2026-09-19T00:00:00.000Z",
  },
];

export const useMemoryStore = create<MemoryState>((set, get) => ({
  memories: [],
  categories: INITIAL_STORE_CATEGORIES,
  isLoading: false,
  isLoadingCategories: false,
  isRefreshing: false,
  page: 1,
  hasMore: true,
  activeFilter: null,

  fetchMemories: async (params = {}) => {
    set({ isLoading: true });
    try {
      const response = await MemoriesApi.list({ page: 1, limit: 20, ...params });
      const items = response.data || [];
      const totalPages = response.pagination?.totalPages || 1;

      set({
        memories: items,
        page: 1,
        hasMore: 1 < totalPages,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  refreshMemories: async () => {
    set({ isRefreshing: true });
    try {
      const response = await MemoriesApi.list({ page: 1, limit: 20 });
      const items = response.data || [];
      const totalPages = response.pagination?.totalPages || 1;

      set({
        memories: items,
        page: 1,
        hasMore: 1 < totalPages,
        isRefreshing: false,
      });
    } catch {
      set({ isRefreshing: false });
    }
  },

  loadMore: async () => {
    const { page, hasMore, isLoading, memories } = get();
    if (!hasMore || isLoading) return;

    const nextPage = page + 1;
    set({ isLoading: true });

    try {
      const response = await MemoriesApi.list({ page: nextPage, limit: 20 });
      const newItems = response.data || [];
      const totalPages = response.pagination?.totalPages || 1;

      set({
        memories: [...memories, ...newItems],
        page: nextPage,
        hasMore: nextPage < totalPages,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  favoriteCategoryIds: [],

  fetchCategories: async () => {
    set({ isLoadingCategories: true });
    try {
      // Load favorites and order from AsyncStorage
      let savedFavorites: string[] = [];
      let savedOrder: string[] = [];
      try {
        const [favsJson, orderJson] = await Promise.all([
          AsyncStorage.getItem(FAVORITES_STORAGE_KEY),
          AsyncStorage.getItem(ORDER_STORAGE_KEY),
        ]);
        if (favsJson) savedFavorites = JSON.parse(favsJson);
        if (orderJson) savedOrder = JSON.parse(orderJson);
      } catch (storageErr) {
        console.warn("Error reading category preferences from storage:", storageErr);
      }

      const res = await CategoriesApi.list();
      let rawCategories = (res.data && res.data.length > 0) ? res.data : get().categories;

      // If user had a saved custom order, apply it
      if (savedOrder && savedOrder.length > 0) {
        const orderMap = new Map(savedOrder.map((id, index) => [id, index]));
        rawCategories = [...rawCategories].sort((a, b) => {
          const orderA = orderMap.has(a.id) ? (orderMap.get(a.id) as number) : 999;
          const orderB = orderMap.has(b.id) ? (orderMap.get(b.id) as number) : 999;
          return orderA - orderB;
        });
      }

      set({
        categories: rawCategories,
        favoriteCategoryIds: savedFavorites,
        isLoadingCategories: false,
      });
    } catch {
      set({ isLoadingCategories: false });
    }
  },

  toggleFavoriteCategory: async (id: string) => {
    const current = get().favoriteCategoryIds;
    const isFav = current.includes(id);
    const next = isFav ? current.filter((catId) => catId !== id) : [...current, id];
    set({ favoriteCategoryIds: next });
    try {
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn("Failed to persist favorite categories:", e);
    }
  },

  reorderCategories: async (orderedCategories: Category[]) => {
    set({ categories: orderedCategories });
    try {
      const orderIds = orderedCategories.map((c) => c.id);
      await AsyncStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orderIds));
    } catch (e) {
      console.warn("Failed to persist category order:", e);
    }
  },

  updateCategory: async (id: string, name: string, icon?: string, color?: string) => {
    let updatedCat: Category | null = null;
    try {
      const res = await CategoriesApi.update(id, { name: name.trim(), icon, color });
      if (res.data) {
        updatedCat = res.data;
      }
    } catch (e) {
      console.warn("Backend category update failed, updating locally:", e);
    }

    if (!updatedCat) {
      const current = get().categories.find((c) => c.id === id);
      updatedCat = {
        ...(current || {
          id,
          userId: "usr-local-default",
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          createdAt: new Date().toISOString(),
        }),
        name: name.trim(),
        icon: icon || current?.icon || "folder",
        color: color || current?.color || "#3B82F6",
        updatedAt: new Date().toISOString(),
      } as Category;
    }

    set((state) => ({
      categories: state.categories.map((c) => (c.id === id ? (updatedCat as Category) : c)),
      memories: state.memories.map((m) =>
        m.categoryId === id ? { ...m, categoryName: name.trim() } : m
      ),
    }));

    return updatedCat;
  },

  deleteCategory: async (id: string) => {
    try {
      await CategoriesApi.delete(id);
    } catch (e) {
      console.warn("Backend category delete failed, removing locally:", e);
    }

    set((state) => {
      const nextCategories = state.categories.filter((c) => c.id !== id);
      const nextFavorites = state.favoriteCategoryIds.filter((catId) => catId !== id);
      AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(nextFavorites)).catch(() => {});
      AsyncStorage.setItem(
        ORDER_STORAGE_KEY,
        JSON.stringify(nextCategories.map((c) => c.id))
      ).catch(() => {});
      return {
        categories: nextCategories,
        favoriteCategoryIds: nextFavorites,
      };
    });

    return true;
  },

  createCategory: async (name: string, icon?: string, color?: string) => {
    try {
      const res = await CategoriesApi.create({ name: name.trim(), icon, color });
      if (res.data) {
        const created = res.data;
        set((state) => {
          const exists = state.categories.some(
            (c) => c.id === created.id || c.name.toLowerCase() === created.name.toLowerCase()
          );
          if (exists) return state;
          return { categories: [...state.categories, created] };
        });
        return created;
      }
    } catch (e) {
      console.warn("Backend category create failed, saving locally:", e);
    }
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const fallbackCategory: Category = {
      id: "cat-" + (slug || "custom") + "-" + Date.now().toString(36),
      userId: "usr-local-default",
      name: name.trim(),
      slug: slug || "category",
      icon: icon || "folder",
      color: color || "#3B82F6",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({ categories: [...state.categories, fallbackCategory] }));
    return fallbackCategory;
  },

  createMemory: async (payload: CreateMemoryPayload) => {
    try {
      const res = await MemoriesApi.create(payload);
      if (res.data) {
        const created = res.data;
        set((state) => ({ memories: [created, ...state.memories] }));
        return created;
      }
    } catch (e) {
      console.warn("Backend save failed, saving memory locally:", e);
    }
    // Fallback: Always ensure the memory is stored in state so user work is never lost
    const fallbackId = "mem-" + Date.now();
    const fallbackMemory: Memory = {
      id: fallbackId,
      userId: "usr-local-default",
      categoryId: payload.categoryId,
      title: payload.title,
      content: payload.content || null,
      type: payload.type || "text",
      sourceType: (payload.sourceType as any) || "web",
      sourceUrl: payload.sourceUrl || null,
      mediaUrl: payload.mediaUrl || null,
      mediaMetadata: payload.mediaMetadata || null,
      isFavorite: false,
      isArchived: false,
      metadata: payload.metadata || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({ memories: [fallbackMemory, ...state.memories] }));
    return fallbackMemory;
  },

  updateMemory: async (id: string, payload: UpdateMemoryPayload) => {
    const category = payload.categoryId
      ? get().categories.find((c) => c.id === payload.categoryId)
      : null;

    try {
      const res = await MemoriesApi.update(id, payload);
      if (res.data) {
        let updated = res.data;
        if (category && (!updated.categoryName || !updated.categoryId)) {
          updated = {
            ...updated,
            categoryId: category.id,
            categoryName: category.name,
            categoryIcon: category.icon || updated.categoryIcon,
            categoryColor: category.color || updated.categoryColor,
          };
        }
        set((state) => ({
          memories: state.memories.map((m) => (m.id === id ? updated : m)),
        }));
        return updated;
      }
    } catch (e) {
      console.warn("Backend update failed, updating memory locally:", e);
    }
    const current = get().memories.find((m) => m.id === id);
    const updated: Memory = {
      ...(current || {
        id,
        userId: "usr-local-default",
        type: "text",
        sourceType: "note",
        isFavorite: false,
        isArchived: false,
        createdAt: new Date().toISOString(),
      }),
      ...payload,
      ...(category
        ? {
            categoryId: category.id,
            categoryName: category.name,
            categoryIcon: category.icon,
            categoryColor: category.color,
          }
        : {}),
      updatedAt: new Date().toISOString(),
    } as Memory;
    set((state) => ({
      memories: state.memories.map((m) => (m.id === id ? updated : m)),
    }));
    return updated;
  },

  addMemoryLocally: (memory: Memory) => {
    set((state) => ({
      memories: [memory, ...state.memories],
    }));
  },

  updateMemoryLocally: (memory: Memory) => {
    set((state) => ({
      memories: state.memories.map((m) => (m.id === memory.id ? memory : m)),
    }));
  },

  removeMemoryLocally: (id: string) => {
    set((state) => ({
      memories: state.memories.filter((m) => m.id !== id),
    }));
  },
}));

export default useMemoryStore;
