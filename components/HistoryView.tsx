import React, { useState, useMemo } from "react";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Bookmark,
  Heart,
  Copy,
  ExternalLink,
  Trash2,
  Check,
  Calendar,
  Layers,
  Wand2,
  FileText,
  Filter,
} from "lucide-react";
import { GeneratedPromptResult, PromptMode, User } from "@/types";
import { HistoryService } from "@/services/historyService";

interface HistoryViewProps {
  user?: User;
  onlyFavorites?: boolean;
  onOpenPrompt: (prompt: GeneratedPromptResult) => void;
  onNewPrompt: () => void;
  onOpenUpgrade?: () => void;
  showToast: (type: "success" | "error" | "info", message: string) => void;
}

export function HistoryView({
  user,
  onlyFavorites = false,
  onOpenPrompt,
  onNewPrompt,
  onOpenUpgrade,
  showToast,
}: HistoryViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [modeFilter, setModeFilter] = useState<PromptMode | "all">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const userPlan = user?.plan || "free";
  const maxFavorites = HistoryService.getMaxFavorites(userPlan);
  const currentFavoritesCount = useMemo(() => {
    return HistoryService.getFavoritesCount();
  }, [version]);

  const prompts = useMemo(() => {
    // version dependency ensures re-filtering on deletion or favorite toggle
    return HistoryService.filterAndSort(searchQuery, modeFilter, sortBy, onlyFavorites);
  }, [searchQuery, modeFilter, sortBy, onlyFavorites, version]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast("success", "Prompt copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleFavorite = (id: string) => {
    const res = HistoryService.toggleFavorite(id, userPlan);
    if (!res.success) {
      showToast("error", res.reason || "Favorites limit reached.");
      if (onOpenUpgrade) onOpenUpgrade();
      return;
    }
    showToast("info", res.isFavorited ? "Added to favorites" : "Removed from favorites");
    setVersion((v) => v + 1);
  };

  const handleDelete = (id: string) => {
    HistoryService.deletePrompt(id);
    showToast("info", "Prompt deleted from history.");
    setVersion((v) => v + 1);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              {onlyFavorites ? (
                <>
                  <Bookmark className="w-6 h-6 text-amber-500 fill-amber-500" />
                  <span>Favorite Prompts</span>
                </>
              ) : (
                <span>Prompt History &amp; Saved Trends</span>
              )}
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
              Favorites: {currentFavoritesCount} / {maxFavorites} ({userPlan === "pro" || userPlan === "creator" ? "Pro Plan" : "Free Plan"})
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {onlyFavorites
              ? `All your favorited prompts (${currentFavoritesCount} of ${maxFavorites} allowed on ${userPlan === "pro" || userPlan === "creator" ? "Pro Plan" : "Free Plan"}).`
              : "Access, search, filter, and reuse all your past visual trend deconstructions."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {userPlan === "free" && currentFavoritesCount >= maxFavorites && onOpenUpgrade && (
            <button
              onClick={onOpenUpgrade}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <span>Upgrade to Pro (25 Favs)</span>
            </button>
          )}

          <button
            onClick={onNewPrompt}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>New Prompt</span>
          </button>
        </div>
      </div>

      {/* Plan limit warning banner if on free and at limit */}
      {userPlan === "free" && currentFavoritesCount >= maxFavorites && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-amber-800 dark:text-amber-300">
            <Bookmark className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Free Plan Limit Reached:</strong> You have saved {currentFavoritesCount}/5 favorite prompts. Upgrade to Pro Plan to store up to 25 favorites.
            </span>
          </div>
          {onOpenUpgrade && (
            <button
              onClick={onOpenUpgrade}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shrink-0 self-start sm:self-auto"
            >
              Upgrade to Pro
            </button>
          )}
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Search */}
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, prompt keywords, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Mode Filter */}
        <div className="sm:col-span-3">
          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value as PromptMode | "all")}
            className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Prompt Modes</option>
            <option value="quick">Quick</option>
            <option value="detailed">Detailed</option>
            <option value="cinematic">Cinematic</option>
            <option value="photorealistic">Photorealistic</option>
            <option value="social_trend">Social Trend</option>
            <option value="commercial">Commercial</option>
            <option value="creative">Creative</option>
          </select>
        </div>

        {/* Sort */}
        <div className="sm:col-span-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "newest" | "oldest")}
            className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
          </select>
        </div>
      </div>

      {/* Prompts Cards Grid */}
      {prompts.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
              {onlyFavorites ? "No favorite prompts yet" : "No prompts found"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {onlyFavorites
                ? "Click the heart icon on any generated prompt to add it to your favorites."
                : "Try adjusting your search query or generate a new prompt from the Studio workspace."}
            </p>
          </div>
          <button
            onClick={onNewPrompt}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-xs"
          >
            Create a Prompt
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {prompts.map((prompt) => (
            <div
              key={prompt.id}
              className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Top thumbnail & mode badge */}
              <div>
                <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden group">
                  <img
                    src={prompt.referenceImage}
                    alt={prompt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900/80 text-white backdrop-blur-xs border border-white/20">
                      {prompt.mode.replace("_", " ")}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleFavorite(prompt.id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white backdrop-blur-xs border border-white/20 transition-colors"
                    title="Toggle Favorite"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        prompt.isFavorited ? "fill-rose-500 text-rose-500" : "text-white"
                      }`}
                    />
                  </button>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-white bg-slate-950/70 backdrop-blur-xs px-2.5 py-1 rounded-lg">
                    <span className="truncate">{prompt.trendInsights.trendStyle}</span>
                    <span className="font-semibold text-emerald-300 shrink-0 ml-1">
                      {prompt.trendInsights.trendScore}/100
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {prompt.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 font-mono leading-relaxed bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                    {prompt.fullPrompt}
                  </p>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(prompt.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => onOpenPrompt(prompt)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Studio</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopy(prompt.id, prompt.fullPrompt)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    title="Copy Prompt"
                  >
                    {copiedId === prompt.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    onClick={() => handleDelete(prompt.id)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    title="Delete Prompt"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
