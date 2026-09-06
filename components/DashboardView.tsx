import React from "react";
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
import { PRESET_TRENDS, TrendPreset } from "@/services/presetSamples";
import { HistoryService } from "@/services/historyService";

interface DashboardViewProps {
  user: User;
  setActiveTab: (tab: ActiveTab) => void;
  onSelectPreset: (presetId: string) => void;
  onOpenUpgrade: () => void;
  showToast: (type: "success" | "error" | "info", message: string) => void;
}

export function DashboardView({
  user,
  setActiveTab,
  onSelectPreset,
  onOpenUpgrade,
  showToast,
}: DashboardViewProps) {
  const history = HistoryService.getHistory();
  const recentPrompts = history.slice(0, 4);
  const favoriteCount = history.filter((h) => h.isFavorited).length;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("success", "Prompt copied to clipboard!");
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

      {/* Trending Visual Inspirations (1-click to test workflow!) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span>Curated Trending Aesthetics</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any trending style to load its visual analysis and try it with your own photo.
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PRESET_TRENDS.map((preset) => (
            <div
              key={preset.id}
              onClick={() => onSelectPreset(preset.id)}
              className="group cursor-pointer rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={preset.imageUrl}
                    alt={preset.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900/80 text-white backdrop-blur-xs border border-white/20">
                      {preset.badge}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-600/90 text-white backdrop-blur-xs">
                      {preset.trendScore}/100 Match
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-1.5">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {preset.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {preset.description}
                  </p>
                </div>
              </div>

              <div className="px-4 pb-4 pt-1 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400 border-t border-slate-100 dark:border-slate-800/80">
                <span>Analyze this Trend</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
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
    </div>
  );
}
