import { GeneratedPromptResult, PromptMode } from "@/types";
import { PRESET_TRENDS } from "./presetSamples";

const HISTORY_STORAGE_KEY = "trendprompt_prompt_history";

export class HistoryService {
  public static getHistory(): GeneratedPromptResult[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        // fallback to seed
      }
    }

    // Seed with two default historical entries from PRESET_TRENDS for a rich initial experience
    const initialSeed: GeneratedPromptResult[] = PRESET_TRENDS.slice(0, 2).map((preset, index) => ({
      ...preset.sampleResult,
      id: "hist_seed_" + preset.id,
      createdAt: new Date(Date.now() - (index + 1) * 3600 * 1000 * 8).toISOString(),
      isFavorited: index === 0,
    }));

    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(initialSeed));
    return initialSeed;
  }

  public static savePrompt(prompt: GeneratedPromptResult): void {
    if (typeof window === "undefined") return;
    const history = this.getHistory();
    const existingIndex = history.findIndex((h) => h.id === prompt.id);
    let updated: GeneratedPromptResult[];

    if (existingIndex >= 0) {
      updated = [...history];
      updated[existingIndex] = prompt;
    } else {
      updated = [prompt, ...history];
    }

    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  }

  public static toggleFavorite(id: string): boolean {
    if (typeof window === "undefined") return false;
    const history = this.getHistory();
    const item = history.find((h) => h.id === id);
    if (!item) return false;

    item.isFavorited = !item.isFavorited;
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    return item.isFavorited;
  }

  public static deletePrompt(id: string): void {
    if (typeof window === "undefined") return;
    const history = this.getHistory();
    const filtered = history.filter((h) => h.id !== id);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(filtered));
  }

  public static getFavorites(): GeneratedPromptResult[] {
    return this.getHistory().filter((item) => item.isFavorited);
  }

  public static clearAll(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  }

  public static filterAndSort(
    searchQuery = "",
    modeFilter: PromptMode | "all" = "all",
    sortBy: "newest" | "oldest" = "newest",
    onlyFavorites = false
  ): GeneratedPromptResult[] {
    let list = this.getHistory();

    if (onlyFavorites) {
      list = list.filter((p) => p.isFavorited);
    }

    if (modeFilter !== "all") {
      list = list.filter((p) => p.mode === modeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.fullPrompt.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q)) ||
          p.trendInsights?.trendStyle.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });

    return list;
  }
}
