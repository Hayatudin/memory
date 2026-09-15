import { create } from "zustand";
import { Memory } from "../types/models";
import { MemoriesApi, ListMemoriesParams } from "../api/memories.api";

interface MemoryState {
  memories: Memory[];
  isLoading: boolean;
  isRefreshing: boolean;
  page: number;
  hasMore: boolean;
  activeFilter: string | null;

  fetchMemories: (params?: ListMemoriesParams) => Promise<void>;
  refreshMemories: () => Promise<void>;
  loadMore: () => Promise<void>;
  addMemoryLocally: (memory: Memory) => void;
  updateMemoryLocally: (memory: Memory) => void;
  removeMemoryLocally: (id: string) => void;
}

export const useMemoryStore = create<MemoryState>((set, get) => ({
  memories: [],
  isLoading: false,
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
