import { GeneratedPromptResult, PromptMode } from "@/types";
import { PRESET_TRENDS } from "./presetSamples";

const HISTORY_STORAGE_KEY = "trendprompt_prompt_history";

export class HistoryService {
  public static getMaxFavorites(plan: "free" | "pro" | "creator" = "free"): number {
    return plan === "pro" || plan === "creator" ? 25 : 5;
  }

  public static getFavoritesCount(): number {
    return this.getFavorites().length;
  }

  public static canAddFavorite(plan: "free" | "pro" | "creator" = "free"): boolean {
    const current = this.getFavoritesCount();
    const max = this.getMaxFavorites(plan);
    return current < max;
  }

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

  public static toggleFavorite(
    id: string,
    userPlan: "free" | "pro" | "creator" = "free"
  ): { success: boolean; isFavorited: boolean; reason?: string } {
    if (typeof window === "undefined") return { success: false, isFavorited: false };
    const history = this.getHistory();
    const item = history.find((h) => h.id === id);
    if (!item) return { success: false, isFavorited: false, reason: "Prompt not found" };

    // If currently not favorited, check limits before favoriting
    if (!item.isFavorited) {
      const currentFavCount = history.filter((h) => h.isFavorited).length;
      const maxAllowed = this.getMaxFavorites(userPlan);
      if (currentFavCount >= maxAllowed) {
        return {
          success: false,
          isFavorited: false,
          reason: `Favorite limit reached (${maxAllowed}/${maxAllowed} on ${
            userPlan === "pro" || userPlan === "creator" ? "Pro Plan" : "Free Plan"
          }). Upgrade to Pro to save up to 25 favorites!`,
        };
      }
      item.isFavorited = true;
    } else {
      item.isFavorited = false;
    }

    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    return { success: true, isFavorited: item.isFavorited };
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
