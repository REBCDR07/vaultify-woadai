import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_MODEL } from "@/lib/constants";

export interface SavedRepo {
  id: string;
  full_name: string;
  html_url: string;
  stars: number;
  language: string;
  topics: string[];
  ai_summary: string;
  personal_note: string;
  tags: string[];
  saved_at: string;
  collection_ids: string[];
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  is_public: boolean;
  slug: string;
  created_at: string;
}

export interface SearchLogEntry {
  id: string;
  query: string;
  searched_at: string;
}

interface VaultifyState {
  // Groq config
  groqApiKey: string;
  groqModel: string;
  totalTokensUsed: number;
  setGroqApiKey: (key: string) => void;
  setGroqModel: (model: string) => void;
  addTokens: (count: number) => void;

  // GitHub token
  githubToken: string;
  setGithubToken: (token: string) => void;

  // Onboarding
  onboardingDone: boolean;
  setOnboardingDone: (done: boolean) => void;

  // Favorites
  favorites: SavedRepo[];
  addFavorite: (repo: SavedRepo) => void;
  removeFavorite: (fullName: string) => void;
  updateFavoriteNote: (fullName: string, note: string) => void;
  updateFavoriteTags: (fullName: string, tags: string[]) => void;
  moveFavoriteToCollection: (fullName: string, collectionId: string) => void;

  // Collections
  collections: Collection[];
  addCollection: (col: Collection) => void;
  removeCollection: (id: string) => void;
  updateCollection: (id: string, updates: Partial<Collection>) => void;

  // Search history
  searchHistory: SearchLogEntry[];
  addSearchLog: (entry: SearchLogEntry) => void;
  clearSearchHistory: () => void;
}

export const useStore = create<VaultifyState>()(
  persist(
    (set) => ({
      groqApiKey: "",
      groqModel: DEFAULT_MODEL,
      totalTokensUsed: 0,
      githubToken: "",
      onboardingDone: false,

      setGroqApiKey: (key) => set({ groqApiKey: key }),
      setGroqModel: (model) => set({ groqModel: model }),
      addTokens: (count) => set((s) => ({ totalTokensUsed: s.totalTokensUsed + count })),
      setGithubToken: (token) => set({ githubToken: token }),
      setOnboardingDone: (done) => set({ onboardingDone: done }),

      favorites: [],
      addFavorite: (repo) =>
        set((s) => ({
          favorites: s.favorites.some((f) => f.full_name === repo.full_name)
            ? s.favorites
            : [...s.favorites, repo],
        })),
      removeFavorite: (fullName) =>
        set((s) => ({ favorites: s.favorites.filter((f) => f.full_name !== fullName) })),
      updateFavoriteNote: (fullName, note) =>
        set((s) => ({
          favorites: s.favorites.map((f) =>
            f.full_name === fullName ? { ...f, personal_note: note } : f
          ),
        })),
      updateFavoriteTags: (fullName, tags) =>
        set((s) => ({
          favorites: s.favorites.map((f) =>
            f.full_name === fullName ? { ...f, tags } : f
          ),
        })),
      moveFavoriteToCollection: (fullName, collectionId) =>
        set((s) => ({
          favorites: s.favorites.map((f) =>
            f.full_name === fullName
              ? { ...f, collection_ids: [...new Set([...f.collection_ids, collectionId])] }
              : f
          ),
        })),

      collections: [],
      addCollection: (col) => set((s) => ({ collections: [...s.collections, col] })),
      removeCollection: (id) =>
        set((s) => ({
          collections: s.collections.filter((c) => c.id !== id),
          favorites: s.favorites.map((f) => ({
            ...f,
            collection_ids: f.collection_ids.filter((cid) => cid !== id),
          })),
        })),
      updateCollection: (id, updates) =>
        set((s) => ({
          collections: s.collections.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),

      searchHistory: [],
      addSearchLog: (entry) =>
        set((s) => ({
          searchHistory: [entry, ...s.searchHistory].slice(0, 20),
        })),
      clearSearchHistory: () => set({ searchHistory: [] }),
    }),
    { name: "vaultify-storage" }
  )
);
