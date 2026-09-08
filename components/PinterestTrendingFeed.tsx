"use client";

import React, { useState, useEffect } from "react";
import {
  Copy,
  Check,
  Wand2,
  Sparkles,
  TrendingUp,
  Search,
  Filter,
  Eye,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";
import { CmsPrompt, CmsService } from "@/services/cmsService";

interface PinterestTrendingFeedProps {
  onSelectPrompt: (prompt: CmsPrompt) => void;
  onUseInStudio: (prompt: CmsPrompt) => void;
  showToast: (type: "success" | "error" | "info", message: string) => void;
}

export function PinterestTrendingFeed({
  onSelectPrompt,
  onUseInStudio,
  showToast,
}: PinterestTrendingFeedProps) {
  const [prompts, setPrompts] = useState<CmsPrompt[]>(() => CmsService.getPublishedPrompts());
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Listen to CMS updates so any new prompt added by the admin immediately appears live
  useEffect(() => {
    const handleCmsUpdate = () => {
      setPrompts(CmsService.getPublishedPrompts());
    };

    window.addEventListener("cms-prompts-updated", handleCmsUpdate);
    return () => window.removeEventListener("cms-prompts-updated", handleCmsUpdate);
  }, []);

  const categories = [
    "All",
    "Lifestyle Photography",
    "Fashion & Editorial Photography",
    "Photorealistic & Portraits",
    "Digital Art & Creative Portraiture",
    "Cinematic & Conceptual",
  ];

  const filteredPrompts = prompts.filter((p) => {
    const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.promptBody.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleQuickCopy = (e: React.MouseEvent, prompt: CmsPrompt) => {
    e.stopPropagation();
    navigator.clipboard.writeText(prompt.promptBody);
    setCopiedId(prompt.id);
    CmsService.incrementCopyCount(prompt.id);
    showToast("success", "Prompt copied to clipboard!");
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleRecreateClick = (e: React.MouseEvent, prompt: CmsPrompt) => {
    e.stopPropagation();
    onUseInStudio(prompt);
  };

  return (
    <div className="space-y-6">
      {/* Header bar with Search & Category Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300 text-xs font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pinterest-Style Trending Prompts Feed</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Explore Trending Prompts
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Click any image to automatically view its full prompt on the side and try it with your photo.
            </p>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search aesthetics, styles, tags..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/90 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Masonry / Pinterest Multi-Column Grid */}
      {filteredPrompts.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-3">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No trending prompts match your search query.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
            }}
            className="text-xs px-4 py-2 rounded-xl bg-blue-600 text-white font-medium shadow-xs"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 [column-fill:_balance] space-y-4">
          {filteredPrompts.map((prompt) => {
            // Determine aspect ratio class to create organic Pinterest waterfall height variations
            const aspectClasses =
              prompt.aspectRatio === "tall"
                ? "aspect-[3/4.5]"
                : prompt.aspectRatio === "vertical"
                ? "aspect-[3/4]"
                : "aspect-[4/5]";

            return (
              <div
                key={prompt.id}
                onClick={() => onSelectPrompt(prompt)}
                className="group relative cursor-pointer break-inside-avoid rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Image Container */}
                <div className={`relative w-full ${aspectClasses} overflow-hidden bg-slate-100 dark:bg-slate-800`}>
                  <img
                    src={prompt.imageUrl}
                    alt={prompt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />

                  {/* Dark gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3.5">
                    {/* Top hover bar */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-900/80 text-white backdrop-blur-md border border-white/20">
                        {prompt.category.split(" ")[0]}
                      </span>

                      <button
                        onClick={(e) => handleQuickCopy(e, prompt)}
                        className="p-2 rounded-full bg-white/90 hover:bg-white text-slate-900 shadow-md backdrop-blur-xs transition-transform active:scale-90"
                        title="Copy Prompt"
                      >
                        {copiedId === prompt.id ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Bottom hover bar with CTA */}
                    <div className="space-y-2">
                      <p className="text-xs text-white font-medium line-clamp-2 drop-shadow-sm">
                        {prompt.promptBody}
                      </p>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={(e) => handleRecreateClick(e, prompt)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold shadow-md transition-transform active:scale-95"
                        >
                          <Wand2 className="w-3.5 h-3.5" />
                          <span>Recreate with My Face</span>
                        </button>

                        <span className="text-[10px] text-slate-300 flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {prompt.copiesCount} copies
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Card Info (Always visible like Pinterest pin details) */}
                <div className="p-3.5 space-y-1.5 bg-white dark:bg-slate-900">
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {prompt.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                    <span className="truncate max-w-[140px]">{prompt.category}</span>
                    <span className="text-blue-600 dark:text-blue-400 font-semibold group-hover:underline flex items-center gap-0.5 shrink-0">
                      <span>View Prompt</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
