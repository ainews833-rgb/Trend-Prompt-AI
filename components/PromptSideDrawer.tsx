"use client";

import React, { useState } from "react";
import {
  X,
  Copy,
  Check,
  Wand2,
  Sparkles,
  Layers,
  Camera,
  Share2,
  ShieldCheck,
  Eye,
  Sliders,
  ExternalLink,
} from "lucide-react";
import { CmsPrompt, CmsService } from "@/services/cmsService";

interface PromptSideDrawerProps {
  prompt: CmsPrompt | null;
  isOpen: boolean;
  onClose: () => void;
  onUseInStudio: (prompt: CmsPrompt) => void;
  showToast: (type: "success" | "error" | "info", message: string) => void;
}

export function PromptSideDrawer({
  prompt,
  isOpen,
  onClose,
  onUseInStudio,
  showToast,
}: PromptSideDrawerProps) {
  const [activeTab, setActiveTab] = useState<"master" | "midjourney" | "leonardo" | "flux" | "negative">("master");
  const [copied, setCopied] = useState(false);

  if (!isOpen || !prompt) return null;

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    CmsService.incrementCopyCount(prompt.id);
    showToast("success", "Prompt copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const getActivePromptText = () => {
    switch (activeTab) {
      case "midjourney":
        return prompt.midjourneyFormat || `${prompt.promptBody} --ar 4:5 --v 6.1`;
      case "leonardo":
        return prompt.leonardoFormat || `${prompt.promptBody} --strength 0.88`;
      case "flux":
        return prompt.fluxFormat || prompt.promptBody;
      case "negative":
        return prompt.negativePrompt || "lowres, plastic skin, distorted anatomy, bad hands, cartoon, 3d render";
      default:
        return prompt.promptBody;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Dimmed backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      />

      {/* Slide-over Side Drawer Container */}
      <div className="relative z-10 w-full max-w-lg sm:max-w-xl h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/90 backdrop-blur-xs sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
              {prompt.category}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {prompt.viewsCount} views
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: prompt.title, text: prompt.promptBody });
                } else {
                  handleCopyText(prompt.promptBody);
                }
              }}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Share Prompt"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Close Drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Main Visual Image Preview */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-sm group">
            <img
              src={prompt.imageUrl}
              alt={prompt.title}
              className="w-full max-h-[380px] object-cover object-top"
            />
            <div className="absolute bottom-3 right-3">
              <button
                onClick={() => handleCopyText(prompt.promptBody)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md text-xs font-semibold shadow-lg border border-white/20 transition-transform active:scale-95"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Quick Copy"}</span>
              </button>
            </div>
          </div>

          {/* Title & Creator */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
              {prompt.title}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {prompt.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Primary Action: Recreate in Studio with Your Face */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span className="text-xs font-bold uppercase tracking-wider">Face-Swap & Trend Recreation</span>
              </div>
              <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-medium">100% Free</span>
            </div>
            <p className="text-xs text-blue-100 leading-relaxed">
              Want this exact viral look with your face? Load this style into Studio, upload your portrait, and generate customized prompts.
            </p>
            <button
              onClick={() => {
                onUseInStudio(prompt);
                onClose();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-blue-700 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
            >
              <Wand2 className="w-4 h-4 text-blue-600" />
              <span>Use This Trend in Studio With My Photo</span>
            </button>
          </div>

          {/* Platform Format Selector Tabs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                <span>Copy Ready-to-Use Prompt</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {prompt.copiesCount} total copies
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveTab("master")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "master"
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Master Prompt
              </button>
              <button
                onClick={() => setActiveTab("midjourney")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "midjourney"
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Midjourney v6.1
              </button>
              <button
                onClick={() => setActiveTab("leonardo")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "leonardo"
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Leonardo.ai
              </button>
              <button
                onClick={() => setActiveTab("flux")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "flux"
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Flux / SDXL
              </button>
              <button
                onClick={() => setActiveTab("negative")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "negative"
                    ? "bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Negative Prompt
              </button>
            </div>

            {/* Prompt Text Display Box */}
            <div className="relative rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 leading-relaxed shadow-inner">
              <p className="whitespace-pre-wrap select-all">{getActivePromptText()}</p>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-sans">
                  {activeTab === "negative" ? "Anatomical preservation negative weights" : "Full optical & photographic descriptors"}
                </span>

                <button
                  onClick={() => handleCopyText(getActivePromptText())}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all active:scale-95"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied to Clipboard!" : "Copy Prompt Text"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Guidance Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs space-y-2 text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>How to Apply with Your Photo:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
              <li>Copy the formatted prompt text above.</li>
              <li>Open your favorite generator (Midjourney, Leonardo, or Flux).</li>
              <li>Upload your own selfie/portrait as the reference/character image.</li>
              <li>Paste this prompt to copy the composition, lighting, and mood.</li>
            </ol>
          </div>
        </div>

        {/* Drawer Sticky Footer */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 backdrop-blur-xs flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 text-[11px]">
            Published by {prompt.author}
          </span>
          <button
            onClick={() => handleCopyText(prompt.promptBody)}
            className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Full Prompt</span>
          </button>
        </div>
      </div>
    </div>
  );
}
