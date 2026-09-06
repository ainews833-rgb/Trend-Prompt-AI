import React from "react";
import {
  Wand2,
  Sparkles,
  Camera,
  Layers,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Zap,
  Sliders,
  ShieldCheck,
  Compass,
} from "lucide-react";
import { Logo } from "./Logo";
import { PRESET_TRENDS } from "@/services/presetSamples";

interface LandingViewProps {
  onStartApp: () => void;
  onSelectPreset: (presetId: string) => void;
}

export function LandingView({ onStartApp, onSelectPreset }: LandingViewProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between">
      {/* Navigation */}
      <header className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 h-16 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Logo size="md" />

        <div className="flex items-center gap-3">
          <button
            onClick={onStartApp}
            className="hidden sm:inline-flex text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5"
          >
            Open App Studio
          </button>
          <button
            onClick={onStartApp}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all active:scale-95"
          >
            <span>Try It Free</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 sm:px-8 pt-12 pb-16 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-semibold animate-in fade-in duration-500">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation Vision to Prompt Engineering</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-[1.15]">
          Turn Any Trending Image Into Your Own{" "}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
            AI Prompt
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Upload a reference image. Our AI breaks down the visual details and creates a ready-to-use prompt for recreating the trend with your own photo.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={onStartApp}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-xl shadow-blue-500/25 transition-all active:scale-95"
          >
            <Wand2 className="w-4 h-4" />
            <span>Try It Free (10 Analyses)</span>
          </button>

          <a
            href="#how-it-works"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-sm border border-slate-200 dark:border-slate-800 transition-colors"
          >
            <span>See How It Works</span>
          </a>
        </div>
      </section>

      {/* Interactive Visual Deconstruction Demonstration */}
      <section className="px-4 sm:px-8 py-8 max-w-6xl mx-auto w-full">
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden p-5 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Interactive Visual Demo
              </span>
              <h3 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white">
                From Viral Reference to Usable Re-creation Prompt
              </h3>
            </div>
            <button
              onClick={() => onSelectPreset(PRESET_TRENDS[0].id)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 hover:bg-blue-100 self-start sm:self-auto"
            >
              Open this in Studio Workspace &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left: Reference thumbnail */}
            <div className="lg:col-span-4 space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase">
                01. Uploaded Trend Reference
              </span>
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-[4/5] bg-slate-100">
                <img
                  src={PRESET_TRENDS[0].imageUrl}
                  alt="Reference demo"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 right-3 bg-slate-950/80 backdrop-blur-xs p-2.5 rounded-xl text-xs text-white">
                  <p className="font-bold">{PRESET_TRENDS[0].title}</p>
                  <p className="text-[11px] text-slate-300">
                    Golden hour sunset backlight, 85mm lens
                  </p>
                </div>
              </div>
            </div>

            {/* Center: Arrow & AI analysis pills */}
            <div className="lg:col-span-4 space-y-3">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                02. AI Multi-Dimensional Analysis
              </span>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Composition:
                  </span>{" "}
                  <span className="text-slate-500 dark:text-slate-400">
                    Centered rule-of-thirds, 85mm shallow depth of field.
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Lighting:
                  </span>{" "}
                  <span className="text-slate-500 dark:text-slate-400">
                    Warm directional low-angle sun, soft ambient fill light.
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Identity Directive:
                  </span>{" "}
                  <span className="text-slate-500 dark:text-slate-400">
                    Replace subject with user photo face while maintaining scene.
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Generated Midjourney & Flux prompt */}
            <div className="lg:col-span-4 space-y-2">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                03. Ready-To-Use Recreated Prompt
              </span>
              <div className="p-4 rounded-2xl bg-slate-950 text-slate-100 font-mono text-xs leading-relaxed space-y-3 border border-slate-800 shadow-inner min-h-[220px]">
                <p className="text-slate-300">
                  {PRESET_TRENDS[0].sampleResult.midjourneyFormat}
                </p>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="text-emerald-400 font-semibold">
                    Midjourney v6.1 Ready
                  </span>
                  <span>Click to test &rarr;</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Section (Section 23) */}
      <section id="how-it-works" className="px-4 sm:px-8 py-16 max-w-5xl mx-auto text-center space-y-10">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white">
            How TrendPrompt AI Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Three simple steps to recreate any trending aesthetic.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
              STEP 01
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Upload a Reference Image
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Found an incredible photo on Instagram or Pinterest? Upload it into TrendPrompt AI to decode its secret formula.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              STEP 02
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Let AI Analyze the Visuals
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Gemini vision inspects camera specs, lens depth, lighting direction, wardrobe styling, and color grading across 14 dimensions.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">
              STEP 03
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recreate With Your Photo
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Copy the prompt to Midjourney or Flux, upload your own selfie as the face reference, and generate your personal version.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 py-10 px-4 sm:px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="md" showTagline />
          <div className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-right">
            <p>&copy; {new Date().getFullYear()} TrendPrompt AI. All rights reserved.</p>
            <p className="mt-0.5">Powered by Google Gemini 2.5 Vision &amp; Prompt Engineering.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
