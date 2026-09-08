import React, { useState, useEffect } from "react";
import {
  Wand2,
  FolderHeart,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Zap,
  Bookmark,
  Copy,
  Clock,
  ExternalLink,
  Layers,
  Camera,
  Check,
  Compass,
} from "lucide-react";
import { ActiveTab, GeneratedPromptResult, User } from "@/types";
import { HistoryService } from "@/services/historyService";
import { PromptSideDrawer } from "@/components/PromptSideDrawer";
import { CmsPrompt, CmsService } from "@/services/cmsService";

interface DashboardViewProps {
  user: User;
  setActiveTab: (tab: ActiveTab) => void;
  onSelectPreset: (presetId: string) => void;
  onSelectCmsPrompt?: (prompt: CmsPrompt) => void;
  onOpenUpgrade: () => void;
  showToast: (type: "success" | "error" | "info", message: string) => void;
}

export function DashboardView({
  user,
  setActiveTab,
  onSelectPreset,
  onSelectCmsPrompt,
  onOpenUpgrade,
  showToast,
}: DashboardViewProps) {
  const history = HistoryService.getHistory();
  const recentPrompts = history.slice(0, 4);
  const favoriteCount = history.filter((h) => h.isFavorited).length;

  const [promos, setPromos] = useState<CmsPrompt[]>(() => CmsService.getPublishedPrompts());
  const [selectedPrompt, setSelectedPrompt] = useState<CmsPrompt | null>(null);
  const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [savedPromptIds, setSavedPromptIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleUpdate = () => {
      setPromos(CmsService.getPublishedPrompts());
    };
    window.addEventListener("cms-prompts-updated", handleUpdate);
    return () => window.removeEventListener("cms-prompts-updated", handleUpdate);
  }, []);

  const handleCopy = (text: string, promptId?: string) => {
    navigator.clipboard.writeText(text);
    if (promptId) {
      setCopiedPromptId(promptId);
      CmsService.incrementCopyCount(promptId);
      setTimeout(() => setCopiedPromptId(null), 2000);
    }
    showToast("success", "Prompt copied to clipboard!");
  };

  const handleToggleSave = (promptId: string) => {
    setSavedPromptIds((prev) => {
      const next = new Set(prev);
      if (next.has(promptId)) {
        next.delete(promptId);
        showToast("info", "Removed from saved prompts");
      } else {
        next.add(promptId);
        showToast("success", "Prompt saved to bookmarks!");
      }
      return next;
    });
  };

  const handleCardClick = (prompt: CmsPrompt) => {
    setSelectedPrompt(prompt);
    setIsSideDrawerOpen(true);
  };

  const handleUseInStudio = (prompt: CmsPrompt) => {
    if (onSelectCmsPrompt) {
      onSelectCmsPrompt(prompt);
    } else {
      onSelectPreset(prompt.category);
    }
    setActiveTab("create");
    showToast("info", `Loaded prompt for "${prompt.category}" into Studio.`);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-8">
      {/* Hero Section (Section 2 of requirements) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white p-6 sm:p-10 border border-slate-800 shadow-xl">
        {/* Background glow accents */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Trend Reverse-Engineering</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Turn Any Trend Into Your Own AI Prompt
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Upload a trending image. Let AI analyze it. Get a detailed prompt you can use with your own photo.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab("create")}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/30 transition-all active:scale-95"
            >
              <Wand2 className="w-4 h-4" />
              <span>Create New Prompt</span>
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/20 transition-all active:scale-95"
            >
              <FolderHeart className="w-4 h-4" />
              <span>View My Prompts</span>
            </button>
          </div>
        </div>

        {/* Quick status bar in hero */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block">Remaining Credits</span>
            <span className="text-base font-bold text-white flex items-center gap-1 mt-0.5">
              <Zap className="w-4 h-4 text-amber-400" />
              {user.creditsRemaining} / {user.creditsTotal}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Saved Prompts</span>
            <span className="text-base font-bold text-white mt-0.5 block">
              {history.length}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Favorites</span>
            <span className="text-base font-bold text-white mt-0.5 block">
              {favoriteCount}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Current Plan</span>
            <span className="text-base font-bold text-blue-400 uppercase tracking-wider mt-0.5 block">
              {user.plan} Tier
            </span>
          </div>
        </div>
      </div>

      {/* Trending Promos Section (Dynamically populated by Admin CMS) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span>Trending Promos & Photo Styles</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any promo photo to view its prompt print on the side and try it in Studio.
            </p>
          </div>

          <button
            onClick={() => setActiveTab("create")}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>Open Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {promos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 sm:p-12 text-center bg-slate-50/50 dark:bg-slate-900/30">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              No Promo Cards Added Yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1.5 leading-relaxed">
              When you add a promo in the backend with an image and promo text, it will appear here as a card.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4.5">
            {promos.map((promo) => (
              <div
                key={promo.id}
                onClick={() => handleCardClick(promo)}
                className="group relative aspect-[3/4] rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer select-none"
              >
                {/* Photo Filling Entire Card (Edge-to-Edge with rounded corners) */}
                {promo.imageUrl ? (
                  <img
                    src={promo.imageUrl}
                    alt={promo.category}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-850 text-slate-400 p-4 text-center">
                    <Camera className="w-10 h-10 opacity-30 mb-2" />
                    <span className="text-xs font-semibold">{promo.category}</span>
                  </div>
                )}

                {/* Permanent subtle category pill (top-left) */}
                <div className="absolute top-3 left-3 z-10 pointer-events-none transition-opacity duration-200 group-hover:opacity-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-950/70 text-white backdrop-blur-md border border-white/20 shadow-xs">
                    {promo.category}
                  </span>
                </div>

                {/* Hover Overlay with Action Buttons (Revealed when moving mouse over image) */}
                <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3.5 z-20">
                  {/* Top Row on Hover: Category Tag & Quick Copy Pill */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20">
                      {promo.category}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(promo.promptBody, promo.id);
                      }}
                      className="px-3 py-1 rounded-full bg-white/95 hover:bg-white text-slate-900 text-[11px] font-bold shadow-lg flex items-center gap-1.5 transition-transform hover:scale-105 active:scale-95"
                      title="Copy Prompt"
                    >
                      {copiedPromptId === promo.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-800" />
                      )}
                      <span>{copiedPromptId === promo.id ? "Copied!" : "Copy"}</span>
                    </button>
                  </div>

                  {/* Center Floating Action Circles (Matching uploaded screenshot reference) */}
                  <div className="flex items-center justify-center gap-3.5 my-auto">
                    {/* Circle 1: Bookmark / Save */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSave(promo.id);
                      }}
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/95 hover:bg-white text-slate-800 shadow-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-90"
                      title={savedPromptIds.has(promo.id) ? "Saved to Favorites" : "Save to Favorites"}
                    >
                      <Bookmark
                        className={`w-5 h-5 ${
                          savedPromptIds.has(promo.id)
                            ? "fill-amber-500 text-amber-500"
                            : "text-slate-800"
                        }`}
                      />
                    </button>

                    {/* Circle 2: Sparkle / Quick Copy Prompt */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(promo.promptBody, promo.id);
                      }}
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/95 hover:bg-white text-amber-500 shadow-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-90"
                      title="Copy Prompt"
                    >
                      {copiedPromptId === promo.id ? (
                        <Check className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Sparkles className="w-5 h-5 text-amber-500" />
                      )}
                    </button>
                  </div>

                  {/* Bottom Row on Hover: Click to Open Print Hint */}
                  <div className="text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/65 text-white text-[10px] font-medium backdrop-blur-md border border-white/15">
                      <Wand2 className="w-3 h-3 text-blue-400" />
                      <span>Click image to view print</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* How It Works 3-Step Section (Section 23 & 24) */}
      <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-5">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            How TrendPrompt AI Works
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            From trending photo to personalized creative prompt in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-xs">
              01
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Upload Reference Trend
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Upload any viral portrait, cinematic still, or magazine editorial.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-xs">
              02
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              AI Vision Analysis
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              AI deconstructs composition, lighting, lens specs, color grade, and wardrobe.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 font-bold flex items-center justify-center text-xs">
              03
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Recreate With Your Photo
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Take the structured prompt to Midjourney or Flux with your photo as face reference.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Prompts Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span>Recent Prompt Generations</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your recent deconstructed trend prompts.
            </p>
          </div>

          <button
            onClick={() => setActiveTab("history")}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            View All History
          </button>
        </div>

        {recentPrompts.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-3">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No prompts generated yet.
            </p>
            <button
              onClick={() => setActiveTab("create")}
              className="text-xs px-4 py-2 rounded-xl bg-blue-600 text-white font-medium shadow-xs"
            >
              Create Your First Prompt
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recentPrompts.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 transition-all flex gap-3.5"
              >
                <img
                  src={item.referenceImage}
                  alt={item.title}
                  className="w-20 h-20 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                />

                <div className="min-w-0 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        {item.title}
                      </h4>
                      <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 shrink-0">
                        {item.mode}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                      {item.fullPrompt}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <span className="text-[11px] text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleCopy(item.fullPrompt)}
                      className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Slide-over Prompt Side Drawer (When clicking any Pinterest card) */}
      <PromptSideDrawer
        prompt={selectedPrompt}
        isOpen={isSideDrawerOpen}
        onClose={() => setIsSideDrawerOpen(false)}
        onUseInStudio={handleUseInStudio}
        showToast={showToast}
      />
    </div>
  );
}
