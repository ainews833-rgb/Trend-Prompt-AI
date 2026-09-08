import { GeneratedPromptResult, PromptMode } from "@/types";
import { PRESET_TRENDS } from "./presetSamples";
import { createStorageThumbnail } from "@/lib/imageUtils";

const HISTORY_STORAGE_KEY = "trendprompt_prompt_history";
const MAX_HISTORY_ITEMS = 30;

// Compact SVG placeholder for when raw image data must be evicted to preserve localStorage quota
const COMPACT_PLACEHOLDER =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><rect width='120' height='120' fill='%231e293b'/><circle cx='60' cy='50' r='18' fill='%2338bdf8'/><path d='M30 95 C30 75 90 75 90 95' fill='%2338bdf8'/></svg>";

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

  /**
   * Safely writes history items to localStorage with automatic multi-tier quota degradation.
   * Completely eliminates "Failed to execute 'setItem' on 'Storage': Setting the value exceeded the quota."
   */
  private static safeSetStorage(items: GeneratedPromptResult[]): boolean {
    if (typeof window === "undefined") return false;

    // Strategy 1: Direct attempt with items capped at MAX_HISTORY_ITEMS
    try {
      const capped = items.slice(0, MAX_HISTORY_ITEMS);
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(capped));
      return true;
    } catch (e) {
      console.warn("localStorage quota reached on direct write. Starting auto-pruning recovery...", e);
    }

    // Strategy 2: Strip large base64 data from items older than the 2 most recent entries
    try {
      const trimmed = items.slice(0, 20).map((item, index) => {
        if (index > 1) {
          return {
            ...item,
            referenceImage:
              item.referenceImage?.startsWith("data:image/") && item.referenceImage.length > 5000
                ? COMPACT_PLACEHOLDER
                : item.referenceImage,
            userPhoto:
              item.userPhoto?.startsWith("data:image/") && item.userPhoto.length > 5000
                ? undefined
                : item.userPhoto,
          };
        }
        return item;
      });
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(trimmed));
      return true;
    } catch (e) {
      console.warn("Quota still exceeded on Strategy 2. Trying aggressive compression...", e);
    }

    // Strategy 3: Keep only top 10 items with compact SVG placeholders
    try {
      const favorited = items.filter((i) => i.isFavorited);
      const recents = items.filter((i) => !i.isFavorited).slice(0, 5);
      const combined = [...favorited, ...recents].slice(0, 10).map((item) => ({
        ...item,
        referenceImage:
          item.referenceImage?.startsWith("data:image/") && item.referenceImage.length > 2000
            ? COMPACT_PLACEHOLDER
            : item.referenceImage,
        userPhoto: undefined,
      }));
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(combined));
      return true;
    } catch (e) {
      console.warn("Quota still exceeded on Strategy 3. Saving text metadata only...", e);
    }

    // Strategy 4: Save only text metadata without any images
    try {
      const textOnly = items.slice(0, 8).map((item) => ({
        ...item,
        referenceImage: COMPACT_PLACEHOLDER,
        userPhoto: undefined,
      }));
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(textOnly));
      return true;
    } catch (e) {
      console.error("Critical storage exhaustion: unable to write history to localStorage.", e);
      return false;
    }
  }

  public static getHistory(): GeneratedPromptResult[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Failed to parse history from localStorage:", e);
    }

    // Seed with two default historical entries from PRESET_TRENDS for a rich initial experience
    const initialSeed: GeneratedPromptResult[] = PRESET_TRENDS.slice(0, 2).map((preset, index) => ({
      ...preset.sampleResult,
      id: "hist_seed_" + preset.id,
      createdAt: new Date(Date.now() - (index + 1) * 3600 * 1000 * 8).toISOString(),
      isFavorited: index === 0,
    }));

    this.safeSetStorage(initialSeed);
    return initialSeed;
  }

  /**
   * Saves prompt into localStorage by first converting high-res base64 images into
   * lightweight JPEG thumbnails (~5-10 KB), preventing quota exhaustion.
   */
  public static async savePrompt(prompt: GeneratedPromptResult): Promise<void> {
    if (typeof window === "undefined") return;

    try {
      // Create tiny lightweight storage thumbnails for referenceImage and userPhoto
      const storageThumbRef = prompt.referenceImage
        ? await createStorageThumbnail(prompt.referenceImage, 240, 0.55)
        : prompt.referenceImage;

      const storageThumbUser = prompt.userPhoto
        ? await createStorageThumbnail(prompt.userPhoto, 160, 0.5)
        : undefined;

      const storagePrompt: GeneratedPromptResult = {
        ...prompt,
        referenceImage: storageThumbRef,
        userPhoto: storageThumbUser,
      };

      const history = this.getHistory();
      const existingIndex = history.findIndex((h) => h.id === prompt.id);
      let updated: GeneratedPromptResult[];

      if (existingIndex >= 0) {
        updated = [...history];
        updated[existingIndex] = storagePrompt;
      } else {
        updated = [storagePrompt, ...history];
      }

      this.safeSetStorage(updated);
    } catch (err) {
      console.warn("Non-fatal: error preparing thumbnail for history save:", err);
      // Fallback synchronous save with minimal data
      this.savePromptSync(prompt);
    }
  }

  /**
   * Synchronous fallback saver using placeholders if async thumbnail generation fails.
   */
  public static savePromptSync(prompt: GeneratedPromptResult): void {
    if (typeof window === "undefined") return;
    try {
      const storagePrompt: GeneratedPromptResult = {
        ...prompt,
        referenceImage:
          prompt.referenceImage && prompt.referenceImage.length > 8000
            ? COMPACT_PLACEHOLDER
            : prompt.referenceImage,
        userPhoto: undefined,
      };
      const history = this.getHistory();
      const existingIndex = history.findIndex((h) => h.id === prompt.id);
      let updated: GeneratedPromptResult[];

      if (existingIndex >= 0) {
        updated = [...history];
        updated[existingIndex] = storagePrompt;
      } else {
        updated = [storagePrompt, ...history];
      }

      this.safeSetStorage(updated);
    } catch (e) {
      console.warn("savePromptSync error:", e);
    }
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

    this.safeSetStorage(history);
    return { success: true, isFavorited: item.isFavorited };
  }

  public static deletePrompt(id: string): void {
    if (typeof window === "undefined") return;
    const history = this.getHistory();
    const filtered = history.filter((h) => h.id !== id);
    this.safeSetStorage(filtered);
  }

  public static getFavorites(): GeneratedPromptResult[] {
    return this.getHistory().filter((item) => item.isFavorited);
  }

  public static clearAll(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch (e) {
      console.warn("Failed to clear localStorage:", e);
    }
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
