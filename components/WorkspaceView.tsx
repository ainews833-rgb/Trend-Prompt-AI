import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  Image as ImageIcon,
  Sparkles,
  Sliders,
  Copy,
  Check,
  RefreshCw,
  Heart,
  Download,
  Edit3,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Trash2,
  FileText,
  Camera,
  Layers,
  Info,
  Maximize2,
  ExternalLink,
  Zap,
  Minimize2,
  UserCheck,
  Compass,
  ShieldCheck,
  ShieldAlert,
  Shield,
} from "lucide-react";
import {
  AdvancedSettings,
  GeneratedPromptResult,
  OutputStyle,
  PromptDetailLevel,
  PromptMode,
  StructuredAnalysis,
  User,
} from "@/types";
import { PRESET_TRENDS, TrendPreset } from "@/services/presetSamples";
import { PromptService } from "@/services/promptService";
import { CreditService } from "@/services/creditService";
import { HistoryService } from "@/services/historyService";

interface WorkspaceViewProps {
  user: User;
  onOpenUpgrade: () => void;
  showToast: (type: "success" | "error" | "info", message: string) => void;
  initialPresetId?: string | null;
  onClearInitialPreset?: () => void;
}

const DEFAULT_NEGATIVE_PROMPT =
  "altered face, modified face, changed nose, different nose shape, reshaped nose bridge, modified nostrils, altered ears, different ears, modified earlobes, changed eye shape, modified eye distance, altered facial features, different person, wrong face, morphed face, celebrity lookalike, altered body size, artificial slimming, changed body weight, distorted body proportions, airbrushed plastic skin, 3d render, cartoon, doll-like, bad anatomy, distorted hands";


const PROMPT_MODES: Array<{
  id: PromptMode;
  label: string;
  description: string;
  badge?: string;
}> = [
  { id: "quick", label: "Quick", description: "Short & punchy prompt" },
  { id: "detailed", label: "Detailed", description: "Deeply descriptive & structured" },
  { id: "cinematic", label: "Cinematic", description: "Movie stills, anamorphic, dramatic" },
  { id: "photorealistic", label: "Photorealistic", description: "Natural lenses, authentic skin texture" },
  { id: "social_trend", label: "Social Trend", description: "Instagram & TikTok aesthetic" },
  { id: "commercial", label: "Commercial", description: "Luxury ad & brand campaign style" },
  { id: "creative", label: "Creative", description: "Artistic interpretation & atmosphere" },
];

const OUTPUT_STYLES: OutputStyle[] = [
  "Photography",
  "Cinematic",
  "Editorial",
  "Fashion",
  "Luxury",
  "Street Photography",
  "Studio",
  "Travel",
  "Lifestyle",
  "Fantasy",
  "Artistic",
];

const LOADING_STAGES = [
  "Reading image & metadata...",
  "Understanding visual composition & focal points...",
  "Analyzing lighting direction, shadows & color grading...",
  "Detecting camera angles, lens characteristics & bokeh...",
  "Synthesizing identity preservation instructions...",
  "Finalizing production-ready prompt variations...",
];

export function WorkspaceView({
  user,
  onOpenUpgrade,
  showToast,
  initialPresetId,
  onClearInitialPreset,
}: WorkspaceViewProps) {
  // Reference image state
  const [refImage, setRefImage] = useState<string | null>(null);
  const [refDimensions, setRefDimensions] = useState<{
    width: number;
    height: number;
    fileSizeFormatted?: string;
  } | null>(null);

  // Optional User Photo state
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [userPhotoDimensions, setUserPhotoDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // Mode and settings
  const [selectedMode, setSelectedMode] = useState<PromptMode>("detailed");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettings>({
    promptDetail: "high",
    preserveComposition: 90,
    preserveStyle: 95,
    preservePose: 85,
    preserveEnvironment: 80,
    creativity: 30,
    outputStyle: "Cinematic",
    targetPlatform: "midjourney",
    lockFaceAndBody: true,
    preserveFacialGeometry: 100,
  });

  // Analysis & Output state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStageIndex, setLoadingStageIndex] = useState(0);
  const [currentResult, setCurrentResult] = useState<GeneratedPromptResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editablePromptText, setEditablePromptText] = useState("");
  const [activePlatformTab, setActivePlatformTab] = useState<"standard" | "midjourney" | "leonardo" | "flux" | "dalle" | "negative">("standard");
  const [activeAccordion, setActiveAccordion] = useState<"prompt" | "breakdown" | "trend" | "workflow">("prompt");

  // File input refs
  const refFileInputRef = useRef<HTMLInputElement>(null);
  const userPhotoInputRef = useRef<HTMLInputElement>(null);

  // Handle initial preset if passed from Dashboard
  useEffect(() => {
    if (!initialPresetId) return;
    const preset = PRESET_TRENDS.find((p) => p.id === initialPresetId);
    if (!preset) return;

    const timeout = setTimeout(() => {
      setRefImage(preset.imageUrl);
      setRefDimensions(preset.sampleResult.referenceDimensions || { width: 1000, height: 1200, fileSizeFormatted: "350 KB" });
      setSelectedMode(preset.mode);
      if (preset.sampleResult.settingsUsed) {
        setAdvancedSettings(preset.sampleResult.settingsUsed);
      }
      const fullResult: GeneratedPromptResult = {
        ...preset.sampleResult,
        id: `${preset.id}_preset`,
        createdAt: "2025-01-01T00:00:00.000Z",
        isFavorited: false,
      };
      setCurrentResult(fullResult);
      setEditablePromptText(preset.sampleResult.fullPrompt);
      showToast("info", `Loaded "${preset.title}" preset`);
      if (onClearInitialPreset) {
        onClearInitialPreset();
      }
    }, 0);

    return () => clearTimeout(timeout);
  }, [initialPresetId, onClearInitialPreset, showToast]);

  // Handle image upload from file
  const handleFileUpload = (
    file: File,
    type: "reference" | "userPhoto"
  ) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      showToast("error", "Unsupported file type. Please upload JPG, PNG, or WEBP.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      showToast("error", "Image too large (limit is 15MB).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const dimensions = {
          width: img.width,
          height: img.height,
          fileSizeFormatted: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        };

        if (type === "reference") {
          setRefImage(result);
          setRefDimensions(dimensions);
          showToast("success", `Reference image loaded (${img.width}x${img.height})`);
        } else {
          setUserPhoto(result);
          setUserPhotoDimensions(dimensions);
          showToast("success", "Personal reference photo added");
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, type: "reference" | "userPhoto") => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0], type);
    }
  };

  // Run AI Analysis
  const handleAnalyze = async () => {
    if (!refImage) {
      showToast("error", "Please upload or select a reference image first.");
      return;
    }

    // Check credits
    if (!CreditService.hasCredits()) {
      onOpenUpgrade();
      showToast("error", "You have reached your generation limit. Please upgrade to continue.");
      return;
    }

    setIsAnalyzing(true);
    setLoadingStageIndex(0);

    // Visual loading stage interval
    const stageInterval = setInterval(() => {
      setLoadingStageIndex((prev) => (prev < LOADING_STAGES.length - 1 ? prev + 1 : prev));
    }, 900);

    try {
      const result = await PromptService.analyzeImage(
        refImage,
        selectedMode,
        advancedSettings,
        userPhoto || undefined,
        refDimensions || undefined
      );

      // Decrement credit
      CreditService.deductCredit(`Prompt Generation: ${result.title}`);

      // Save to history
      HistoryService.savePrompt(result);

      setCurrentResult(result);
      setEditablePromptText(result.fullPrompt);
      showToast("success", "Analysis complete! Reusable prompt generated.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "AI analysis failed. Please retry.";
      showToast("error", msg);
    } finally {
      clearInterval(stageInterval);
      setIsAnalyzing(false);
    }
  };

  // Action helpers
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast("success", "Prompt copied to clipboard!");
    setTimeout(() => setCopied(false), 2200);
  };

  const handleFavoriteToggle = () => {
    if (!currentResult) return;
    const plan = user?.plan || "free";
    const res = HistoryService.toggleFavorite(currentResult.id, plan);
    if (!res.success && res.reason) {
      showToast("error", res.reason);
      return;
    }
    setCurrentResult({ ...currentResult, isFavorited: res.isFavorited });
    showToast("info", res.isFavorited ? "Added to favorites" : "Removed from favorites");
  };

  const handleDownload = () => {
    if (!currentResult) return;
    PromptService.downloadPrompt(currentResult);
    showToast("success", "Prompt exported to text file.");
  };

  const handleShorten = () => {
    if (!currentResult) return;
    setEditablePromptText(currentResult.shortPrompt);
    showToast("info", "Switched to concise prompt mode.");
  };

  const handleMakeDetailed = () => {
    if (!currentResult) return;
    setEditablePromptText(currentResult.detailedPrompt);
    showToast("info", "Expanded to maximum photographic detail.");
  };

  const handleApplyPreset = (preset: TrendPreset) => {
    setRefImage(preset.imageUrl);
    setRefDimensions(preset.sampleResult.referenceDimensions || { width: 1000, height: 1200, fileSizeFormatted: "350 KB" });
    setSelectedMode(preset.mode);
    if (preset.sampleResult.settingsUsed) {
      setAdvancedSettings(preset.sampleResult.settingsUsed);
    }
    const fullResult: GeneratedPromptResult = {
      ...preset.sampleResult,
      id: `${preset.id}_preset`,
      createdAt: "2025-01-01T00:00:00.000Z",
      isFavorited: false,
    };
    setCurrentResult(fullResult);
    setEditablePromptText(fullResult.fullPrompt);
    showToast("info", `Applied "${preset.title}"`);
  };

  // Get current active prompt text based on platform tab
  const getActivePromptForPlatform = () => {
    if (!currentResult) return "";
    if (isEditing) return editablePromptText;

    switch (activePlatformTab) {
      case "midjourney":
        return currentResult.midjourneyFormat;
      case "leonardo":
        return currentResult.leonardoFormat || `${currentResult.fullPrompt} [Leonardo.ai Settings: Turn ON Image Guidance -> Character Reference / Face Transfer (Strength: 0.90) with your photo]`;
      case "flux":
        return currentResult.fluxFormat;
      case "dalle":
        return currentResult.dalleFormat;
      case "negative":
        return currentResult.negativePrompt || DEFAULT_NEGATIVE_PROMPT;
      default:
        return editablePromptText || currentResult.fullPrompt;
    }
  };

  const promptPills = [
    {
      id: "detailed",
      label: "Detailed",
      isActive: selectedMode === "detailed",
      onClick: () => {
        setSelectedMode("detailed");
        if (currentResult) handleMakeDetailed();
        showToast("info", "Prompt Mode: Detailed");
      },
    },
    {
      id: "cinematic",
      label: "Cinematic",
      isActive: selectedMode === "cinematic" || advancedSettings.outputStyle === "Cinematic",
      onClick: () => {
        setSelectedMode("cinematic");
        setAdvancedSettings((prev) => ({ ...prev, outputStyle: "Cinematic" }));
        showToast("info", "Prompt Mode: Cinematic");
      },
    },
    {
      id: "photorealistic",
      label: "Photorealistic",
      isActive: selectedMode === "photorealistic" || advancedSettings.outputStyle === "Photography",
      onClick: () => {
        setSelectedMode("photorealistic");
        setAdvancedSettings((prev) => ({ ...prev, outputStyle: "Photography" }));
        showToast("info", "Prompt Mode: Photorealistic");
      },
    },
    {
      id: "social_trend",
      label: "Social Trend",
      isActive: selectedMode === "social_trend",
      onClick: () => {
        setSelectedMode("social_trend");
        showToast("info", "Prompt Mode: Social Trend");
      },
    },
    {
      id: "creative",
      label: "Creative",
      isActive: selectedMode === "creative",
      onClick: () => {
        setSelectedMode("creative");
        showToast("info", "Prompt Mode: Creative Interpretation");
      },
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
            Trend Deconstruction &amp; Face-Swap Studio
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Extract, elevate, and recreate viral image trends with your own authentic face in any AI tool.
          </p>
        </div>

        {/* Quick presets pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-blue-500" />
            Quick Trends:
          </span>
          {PRESET_TRENDS.slice(0, 3).map((p) => (
            <button
              key={p.id}
              onClick={() => handleApplyPreset(p)}
              className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/60 dark:hover:text-blue-300 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              {p.title.split(" ")[0]} {p.title.split(" ")[1]}
            </button>
          ))}
        </div>
      </div>

      {/* 3-Step Trend-to-Face Workflow Visual Guide */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-800/90 dark:via-blue-950/40 dark:to-indigo-950/40 rounded-2xl p-4 sm:p-5 border border-blue-200/70 dark:border-blue-900/50 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Trend-to-Face Master Workflow
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                ✓ 100% Face &amp; Body Locked
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
              Download any viral trend photo, upload it here, and get a professional prompt to generate the trend with <strong>your own face</strong> in any AI tool.
            </p>
          </div>

          {/* 3 Steps */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs overflow-x-auto pb-1 sm:pb-0 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">1</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Upload Trend</span>
            </div>
            <span className="text-slate-400 dark:text-slate-600 font-bold">→</span>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">2</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">AI Elevates &amp; Locks</span>
            </div>
            <span className="text-slate-400 dark:text-slate-600 font-bold">→</span>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">3</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Recreate with Your Face</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Panel Sleek Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* ========================================================= */}
        {/* LEFT PANEL: Reference Image, User Photo & Controls (5/12) */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Reference Image Section */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  1. Viral Trend Image
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Source style, lighting &amp; composition to copy
                </p>
              </div>
              <div className="flex items-center gap-2">
                {refImage && (
                  <button
                    onClick={() => {
                      setRefImage(null);
                      setRefDimensions(null);
                    }}
                    className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1 transition-colors mr-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
                <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Trend Source
                </span>
              </div>
            </div>

            <div className="flex-1 p-6 flex flex-col items-center justify-center">
              <input
                ref={refFileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileUpload(e.target.files[0], "reference");
                  }
                }}
              />

              {!refImage ? (
                <div
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, "reference")}
                  onClick={() => refFileInputRef.current?.click()}
                  className="w-full aspect-video bg-slate-50 dark:bg-slate-800/40 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center group cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all"
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-slate-400 group-hover:text-blue-500 mb-3 transition-colors"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Drop trending image here
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Supports JPG, PNG, WEBP (Max 15MB)
                  </p>
                </div>
              ) : (
                <div className="w-full space-y-3">
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950/5 dark:bg-slate-950 group aspect-video max-h-[280px] flex items-center justify-center">
                    <img
                      src={refImage}
                      alt="Reference trend"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => refFileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-white/90 text-slate-800 hover:bg-white text-xs font-semibold shadow-md transition-colors"
                      >
                        Replace Image
                      </button>
                    </div>
                  </div>

                  {/* Image metadata badges */}
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 rounded-lg border border-slate-200/60 dark:border-slate-800">
                    <span className="flex items-center gap-1.5 font-medium">
                      <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                      {refDimensions ? `${refDimensions.width} × ${refDimensions.height} px` : "Reference Ready"}
                    </span>
                    {refDimensions?.fileSizeFormatted && (
                      <span>{refDimensions.fileSizeFormatted}</span>
                    )}
                    <button
                      onClick={() => refFileInputRef.current?.click()}
                      className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                    >
                      Change
                    </button>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleAnalyze}
                disabled={!refImage || isAnalyzing}
                className="w-full mt-4 bg-blue-600 text-white font-bold py-2.5 rounded-xl text-sm shadow-md shadow-blue-200 dark:shadow-blue-950 hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Reference Image...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>Analyze Reference Image</span>
                  </>
                )}
              </button>
            </div>
          </section>

          {/* Personal Identity (Face-Swap Target) Section */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  2. Your Photo / Face (Personal Identity)
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Your authentic face to place inside the elevated trend
                </p>
              </div>
              {userPhoto && (
                <button
                  onClick={() => {
                    setUserPhoto(null);
                    setUserPhotoDimensions(null);
                  }}
                  className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              )}
            </div>

            <input
              ref={userPhotoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFileUpload(e.target.files[0], "userPhoto");
                }
              }}
            />

            {!userPhoto ? (
              <div className="flex gap-4 items-center">
                <div
                  onClick={() => userPhotoInputRef.current?.click()}
                  className="w-20 h-20 bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center flex-shrink-0 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all group"
                  title="Click to upload your photo or selfie"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-slate-400 group-hover:text-indigo-600 transition-colors"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p
                    onClick={() => userPhotoInputRef.current?.click()}
                    className="text-sm font-semibold text-slate-800 dark:text-slate-200 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5"
                  >
                    <span>Upload Your Photo / Selfie</span>
                    <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold px-1.5 py-0.5 rounded">
                      Recommended
                    </span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                    Upload your selfie so our AI can lock your authentic nose, ears, eyes, and natural body size in the final prompt!
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex gap-4 items-center">
                <img
                  src={userPhoto}
                  alt="User photo"
                  className="w-20 h-20 rounded-xl object-cover border-2 border-indigo-500 flex-shrink-0 shadow-xs"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Identity Linked &amp; Face Locked</span>
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed mt-0.5 font-medium">
                    ✓ Exact nose, ears &amp; body proportions frozen
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={() => userPhotoInputRef.current?.click()}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                    >
                      Change Photo
                    </button>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <button
                      onClick={() => {
                        setUserPhoto(null);
                        setUserPhotoDimensions(null);
                      }}
                      className="text-xs text-rose-500 hover:underline font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Generation Mode Section */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                Generation Mode
              </h2>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {PROMPT_MODES.find((m) => m.id === selectedMode)?.description}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PROMPT_MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedMode === mode.id
                      ? "border-blue-600 bg-blue-50/70 text-blue-900 dark:border-blue-500 dark:bg-blue-950/60 dark:text-blue-100 shadow-xs"
                      : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">{mode.label}</span>
                    {selectedMode === mode.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {mode.description}
                  </p>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* ========================================================= */}
        {/* RIGHT PANEL: Generated Prompt, Controls & Analysis (7/12) */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 flex flex-col gap-6 overflow-hidden">
          {/* Section 1: Generated Prompt Card */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
            {/* Header bar */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  Generated Prompt
                </h2>
                <div className="flex gap-1 ml-4">
                  <button
                    onClick={() => {
                      if (!currentResult) {
                        showToast("info", "Upload an image and analyze first to generate a prompt.");
                        return;
                      }
                      handleCopy(getActivePromptForPlatform());
                    }}
                    className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <button
                    onClick={() => {
                      if (!currentResult) {
                        showToast("info", "Analyze an image first to save prompts.");
                        return;
                      }
                      handleFavoriteToggle();
                    }}
                    className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    {currentResult?.isFavorited ? "Saved" : "Save"}
                  </button>
                </div>
              </div>

              {/* Header tool icons */}
              <div className="flex gap-1 items-center">
                {currentResult && (
                  <>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className={`p-1.5 rounded transition-colors ${
                        isEditing
                          ? "bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900"
                          : "hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      }`}
                      title={isEditing ? "Done editing" : "Edit prompt text"}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleFavoriteToggle}
                      className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${
                        currentResult.isFavorited
                          ? "text-rose-500"
                          : "text-slate-400 hover:text-rose-500"
                      }`}
                      title="Favorite prompt"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          currentResult.isFavorited ? "fill-rose-500" : ""
                        }`}
                      />
                    </button>
                    <button
                      onClick={handleDownload}
                      className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      title="Download prompt"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 p-6 flex flex-col">
              {/* Style Pills from Sleek Interface design */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                {promptPills.map((pill) => (
                  <button
                    key={pill.id}
                    onClick={pill.onClick}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                      pill.isActive
                        ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>

              {/* Main content display */}
              {isAnalyzing ? (
                <div className="flex-1 min-h-[160px] bg-slate-50 dark:bg-slate-800/40 rounded-xl p-6 border border-slate-200/60 dark:border-slate-700/60 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-10 h-10 rounded-full border-3 border-blue-200 border-t-blue-600 animate-spin" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Analyzing Reference Image...
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {LOADING_STAGES[loadingStageIndex]}
                    </p>
                  </div>
                </div>
              ) : !currentResult ? (
                <div className="flex-1 min-h-[160px] bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200/60 dark:border-slate-700/60 font-mono text-sm text-slate-400 dark:text-slate-500 italic flex items-center justify-center text-center leading-relaxed">
                  No analysis data yet. Upload an image and click &ldquo;Analyze Reference Image&rdquo; to generate your first trend prompt.
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Platform Target Tabs */}
                  <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 overflow-x-auto text-xs pb-2">
                    <span className="text-[11px] font-medium text-slate-400 shrink-0 mr-1">
                      Platform:
                    </span>
                    <button
                      onClick={() => setActivePlatformTab("standard")}
                      className={`pb-1 font-medium border-b-2 transition-colors shrink-0 ${
                        activePlatformTab === "standard"
                          ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-semibold"
                          : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      Universal / Standard
                    </button>
                    <button
                      onClick={() => setActivePlatformTab("midjourney")}
                      className={`pb-1 font-medium border-b-2 transition-colors shrink-0 ${
                        activePlatformTab === "midjourney"
                          ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-semibold"
                          : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      Midjourney v6.1
                    </button>
                    <button
                      onClick={() => setActivePlatformTab("leonardo")}
                      className={`pb-1 font-medium border-b-2 transition-colors shrink-0 ${
                        activePlatformTab === "leonardo"
                          ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-semibold"
                          : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      Leonardo.ai / Fooocus
                    </button>
                    <button
                      onClick={() => setActivePlatformTab("flux")}
                      className={`pb-1 font-medium border-b-2 transition-colors shrink-0 ${
                        activePlatformTab === "flux"
                          ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-semibold"
                          : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      Flux.1 &amp; SDXL
                    </button>
                    <button
                      onClick={() => setActivePlatformTab("dalle")}
                      className={`pb-1 font-medium border-b-2 transition-colors shrink-0 ${
                        activePlatformTab === "dalle"
                          ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-semibold"
                          : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      ChatGPT-4o / DALL-E 3
                    </button>
                    <button
                      onClick={() => setActivePlatformTab("negative")}
                      className={`pb-1 font-medium border-b-2 transition-colors shrink-0 flex items-center gap-1.5 ${
                        activePlatformTab === "negative"
                          ? "border-rose-600 text-rose-600 dark:border-rose-400 dark:text-rose-400 font-semibold"
                          : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Negative Prompt (Anti-Face Alteration)</span>
                    </button>
                  </div>

                  {/* Face & Anatomy Preservation Guarantee Banner */}
                  <div className="p-3 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                          <span>Identity &amp; Anatomy Freeze Active</span>
                          <span className="text-[10px] uppercase font-bold bg-emerald-200/80 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-100 px-1.5 py-0.5 rounded">
                            100% Locked
                          </span>
                        </p>
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                          Authentic nose shape, ear contours, eye shape, and body build are protected from AI distortion.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const neg = currentResult?.negativePrompt || DEFAULT_NEGATIVE_PROMPT;
                        navigator.clipboard.writeText(neg);
                        showToast("success", "Copied anti-face alteration negative prompt!");
                      }}
                      className="shrink-0 flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 hover:bg-emerald-200 dark:hover:bg-emerald-850 text-emerald-800 dark:text-emerald-200 font-semibold text-[11px] transition-colors cursor-pointer"
                      title="Copy negative prompt designed to prevent facial modifications"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy Negative Prompt</span>
                    </button>
                  </div>

                  {/* Visual Elevation Engine Pill */}
                  {currentResult.trendElevationSummary && (
                    <div className="p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/80 dark:border-blue-900/60 text-xs flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-blue-950 dark:text-blue-200">
                          AI Visual Elevation Engine Active:
                        </span>{" "}
                        <span className="text-slate-700 dark:text-slate-300 leading-relaxed">
                          {currentResult.trendElevationSummary}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Prompt Text Display / Editing */}
                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        value={editablePromptText}
                        onChange={(e) => setEditablePromptText(e.target.value)}
                        rows={6}
                        className="w-full p-3.5 rounded-xl border border-blue-300 dark:border-blue-700 bg-slate-50 dark:bg-slate-950 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                      />
                      <div className="flex justify-between items-center text-xs text-slate-500">
                        <span>{editablePromptText.length} characters</span>
                        <button
                          onClick={() => {
                            setCurrentResult({ ...currentResult, fullPrompt: editablePromptText });
                            setIsEditing(false);
                            showToast("success", "Custom edits saved.");
                          }}
                          className="px-3 py-1 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed break-words select-all">
                      {getActivePromptForPlatform()}
                    </div>
                  )}

                  {/* Quick Refine actions */}
                  <div className="flex items-center justify-between pt-2 text-xs border-t border-slate-100 dark:border-slate-800 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-medium">Refine:</span>
                      <button
                        onClick={handleShorten}
                        className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors"
                      >
                        Shorten
                      </button>
                      <button
                        onClick={handleMakeDetailed}
                        className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors"
                      >
                        Make More Detailed
                      </button>
                      <button
                        onClick={handleAnalyze}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Regenerate</span>
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      Click Copy or press <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono">Cmd+C</kbd>
                    </div>
                  </div>

                  {/* Platform-Specific Face-Swap Instructions Guide */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>
                          {activePlatformTab === "midjourney" && "How to Use in Midjourney v6.1 with Your Photo"}
                          {activePlatformTab === "leonardo" && "How to Use in Leonardo.ai with Your Photo"}
                          {activePlatformTab === "flux" && "How to Use in Flux.1 & SDXL with Your Photo"}
                          {activePlatformTab === "dalle" && "How to Use in ChatGPT-4o with Your Photo"}
                          {activePlatformTab === "negative" && "Anatomical Negative Prompt Protection Guide"}
                          {activePlatformTab === "standard" && "Universal Step-by-Step AI Recreation Guide"}
                        </span>
                      </p>
                      <span className="text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold px-2 py-0.5 rounded-full">
                        Step-by-Step
                      </span>
                    </div>

                    <div className="text-slate-600 dark:text-slate-300 leading-relaxed space-y-1 text-[11px]">
                      {activePlatformTab === "midjourney" && (
                        <>
                          <p>
                            1. <strong>Upload Your Selfie to Discord:</strong> Drag your portrait into Discord, press Enter, right-click the image and select <strong>Copy Link</strong>.
                          </p>
                          <p>
                            2. <strong>Paste &amp; Replace:</strong> Type <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded font-mono text-[10px]">/imagine</code>, paste the prompt above, and replace <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded font-mono text-[10px]">[YOUR_PHOTO_URL]</code> with your image link.
                          </p>
                          <p>
                            3. <strong>Identity Locked:</strong> Midjourney will lock your authentic nose, ears, and facial identity while applying the exact viral trend style!
                          </p>
                        </>
                      )}
                      {activePlatformTab === "leonardo" && (
                        <>
                          <p>
                            1. <strong>Open Leonardo.ai:</strong> Navigate to <strong>Image Generation</strong> and toggle <strong>Image Guidance</strong> ON in the left menu.
                          </p>
                          <p>
                            2. <strong>Character Reference:</strong> Select <strong>Character Reference</strong> or <strong>Face Transfer</strong>, upload your selfie, and set Strength to <strong>0.85 - 0.90</strong>.
                          </p>
                          <p>
                            3. <strong>Generate:</strong> Paste this elevated prompt in Leonardo. The prompt directs Leonardo to render the trend scene with your authentic facial geometry intact!
                          </p>
                        </>
                      )}
                      {activePlatformTab === "flux" && (
                        <>
                          <p>
                            1. <strong>Input Your Selfie:</strong> In Flux.1 (WebUI or ComfyUI), connect your portrait into the <strong>InstantID</strong> or <strong>PuLID</strong> node.
                          </p>
                          <p>
                            2. <strong>Apply Master Prompt:</strong> Paste the text above as your positive prompt.
                          </p>
                          <p>
                            3. <strong>Add Anti-Alteration Negative Prompt:</strong> Click the <strong>Negative Prompt</strong> tab and copy our anatomy shield string to prevent any nose, ear, or body distortion.
                          </p>
                        </>
                      )}
                      {activePlatformTab === "dalle" && (
                        <>
                          <p>
                            1. <strong>Attach Your Selfie:</strong> In ChatGPT-4o, click the <strong>+ (Attach)</strong> icon and upload your portrait photo.
                          </p>
                          <p>
                            2. <strong>Send Prompt:</strong> Paste this prompt and enter: <em>&ldquo;Recreate this visual trend using my attached photo for my exact face, nose shape, ears, and body build.&rdquo;</em>
                          </p>
                        </>
                      )}
                      {activePlatformTab === "negative" && (
                        <>
                          <p>
                            This negative prompt is mathematically engineered to stop AI tools from smoothing, reshaping, or mutating facial geometry, nose bridges, ear contours, or natural body builds.
                          </p>
                          <p>
                            Paste it directly into the <strong>Negative Prompt</strong> or <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded font-mono text-[10px]">--no</code> parameter in Midjourney, Stable Diffusion, or Leonardo.
                          </p>
                        </>
                      )}
                      {activePlatformTab === "standard" && (
                        <>
                          <p>
                            1. Click <strong>Copy Prompt</strong> above.
                          </p>
                          <p>
                            2. Open your preferred AI generator (Midjourney, Leonardo, Flux, Stable Diffusion, Ideogram, or ChatGPT).
                          </p>
                          <p>
                            3. Upload your portrait photo as identity reference and run the prompt to get the exact viral trend with your face!
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Section 2: Advanced Controls Card from Sleek Interface */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-5 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              Advanced Controls
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {/* Composition */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Composition
                  </label>
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                    {advancedSettings.preserveComposition}%
                  </span>
                </div>
                <div className="relative flex items-center h-4">
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full transition-all"
                      style={{ width: `${advancedSettings.preserveComposition}%` }}
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={advancedSettings.preserveComposition}
                    onChange={(e) =>
                      setAdvancedSettings({
                        ...advancedSettings,
                        preserveComposition: Number(e.target.value),
                      })
                    }
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Visual Style */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Visual Style
                  </label>
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                    {advancedSettings.preserveStyle}%
                  </span>
                </div>
                <div className="relative flex items-center h-4">
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full transition-all"
                      style={{ width: `${advancedSettings.preserveStyle}%` }}
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={advancedSettings.preserveStyle}
                    onChange={(e) =>
                      setAdvancedSettings({
                        ...advancedSettings,
                        preserveStyle: Number(e.target.value),
                      })
                    }
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Pose Match */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Pose Match
                  </label>
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                    {advancedSettings.preservePose}%
                  </span>
                </div>
                <div className="relative flex items-center h-4">
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full transition-all"
                      style={{ width: `${advancedSettings.preservePose}%` }}
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={advancedSettings.preservePose}
                    onChange={(e) =>
                      setAdvancedSettings({
                        ...advancedSettings,
                        preservePose: Number(e.target.value),
                      })
                    }
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Environment */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Environment
                  </label>
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                    {advancedSettings.preserveEnvironment}%
                  </span>
                </div>
                <div className="relative flex items-center h-4">
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full transition-all"
                      style={{ width: `${advancedSettings.preserveEnvironment}%` }}
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={advancedSettings.preserveEnvironment}
                    onChange={(e) =>
                      setAdvancedSettings({
                        ...advancedSettings,
                        preserveEnvironment: Number(e.target.value),
                      })
                    }
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Facial Geometry Lock (Nose & Ears) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Facial Geometry (Nose &amp; Ears)
                  </label>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    {advancedSettings.preserveFacialGeometry ?? 100}% (Locked)
                  </span>
                </div>
                <div className="relative flex items-center h-4">
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all"
                      style={{ width: `${advancedSettings.preserveFacialGeometry ?? 100}%` }}
                    />
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={advancedSettings.preserveFacialGeometry ?? 100}
                    onChange={(e) =>
                      setAdvancedSettings({
                        ...advancedSettings,
                        preserveFacialGeometry: Number(e.target.value),
                      })
                    }
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  Freezes authentic nasal bridge, tip, nostril contours, and earlobe geometry.
                </p>
              </div>

              {/* Body Proportions & Size Lock */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Body Proportions &amp; Size
                  </label>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    {advancedSettings.lockFaceAndBody ? "100% (No Slimming)" : "Flexible"}
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      setAdvancedSettings({
                        ...advancedSettings,
                        lockFaceAndBody: !advancedSettings.lockFaceAndBody,
                      })
                    }
                    className={`flex-1 py-1 px-3 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      advancedSettings.lockFaceAndBody
                        ? "bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/60 dark:border-emerald-700 dark:text-emerald-300"
                        : "bg-slate-100 border-slate-300 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {advancedSettings.lockFaceAndBody
                      ? "✓ Strict Authentic Body Size"
                      : "Standard Model Proportion"}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  Strictly prevents artificial AI slimming, body distortion, or unnatural warping.
                </p>
              </div>
            </div>
          </section>

          {/* Detailed analysis cards when result exists */}
          {currentResult && (
            <div className="space-y-6">
              {/* Before & After Concept Card */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Before &amp; After Concept
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                    Ready to Recreate
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  {/* Left: Reference thumbnail */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                    <img
                      src={currentResult.referenceImage}
                      alt="Reference thumbnail"
                      className="w-14 h-14 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-slate-400 uppercase">
                        Left: Reference Trend
                      </p>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                        {currentResult.title}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Composition &amp; Lighting Locked
                      </p>
                    </div>
                  </div>

                  {/* Right: User identity target */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                    {currentResult.userPhoto ? (
                      <img
                        src={currentResult.userPhoto}
                        alt="User thumbnail"
                        className="w-14 h-14 rounded-lg object-cover border border-indigo-200 dark:border-indigo-700 shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <UserCheck className="w-6 h-6" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase">
                        Right: Your Identity
                      </p>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                        {currentResult.userPhoto ? "Personal Photo Attached" : "User Photo Reference"}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Face &amp; Identity Mapped
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Ready to recreate this trend with your own photo.</strong> Copy this prompt into Midjourney, Flux, SDXL, or DALL-E and provide your own photo as the identity reference.
                  </p>
                </div>
              </div>

              {/* Visual Trend Analysis Card */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-blue-600" />
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      Visual Trend Analysis
                    </h4>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Trend Score:
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {currentResult.trendInsights.trendScore} / 100
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                    Trend Style: {currentResult.trendInsights.trendStyle}
                  </p>
                  {currentResult.trendInsights.explanation && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {currentResult.trendInsights.explanation}
                    </p>
                  )}
                </div>

                {/* Visual Characteristics pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {currentResult.trendInsights.visualCharacteristics.map((trait, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                    >
                      • {trait}
                    </span>
                  ))}
                </div>
              </div>

              {/* Structured AI Analysis Deconstruction */}
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-blue-600" />
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      Structured AI Deconstruction
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    14 Architectural Dimensions
                  </span>
                </div>

                <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <AnalysisItem
                    title="Subject & Pose"
                    content={`${currentResult.structuredAnalysis.subject} ${currentResult.structuredAnalysis.pose}`}
                  />
                  <AnalysisItem
                    title="Composition & Framing"
                    content={currentResult.structuredAnalysis.composition}
                  />
                  <AnalysisItem
                    title="Camera & Lens Specs"
                    content={`${currentResult.structuredAnalysis.camera} | ${currentResult.structuredAnalysis.lens}`}
                  />
                  <AnalysisItem
                    title="Lighting Direction & Shadows"
                    content={currentResult.structuredAnalysis.lighting}
                  />
                  <AnalysisItem
                    title="Environment & Background"
                    content={`${currentResult.structuredAnalysis.environment} | ${currentResult.structuredAnalysis.background}`}
                  />
                  <AnalysisItem
                    title="Wardrobe & Styling"
                    content={currentResult.structuredAnalysis.clothing}
                  />
                  <AnalysisItem
                    title="Color Palette & Mood"
                    content={`${currentResult.structuredAnalysis.colors} | ${currentResult.structuredAnalysis.mood}`}
                  />
                  <AnalysisItem
                    title="Texture & Grain Characteristics"
                    content={currentResult.structuredAnalysis.image_quality}
                  />
                  <div className="sm:col-span-2 p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/60">
                    <p className="font-bold text-blue-900 dark:text-blue-200 mb-0.5 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                      Identity Replacement Directive
                    </p>
                    <p className="text-blue-800 dark:text-blue-300 leading-relaxed">
                      {currentResult.structuredAnalysis.identity_preservation}
                    </p>
                  </div>
                  {currentResult.structuredAnalysis.facial_features_lock && (
                    <div className="sm:col-span-2 p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/60">
                      <p className="font-bold text-emerald-900 dark:text-emerald-200 mb-0.5 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        Facial Geometry &amp; Anatomical Freeze
                      </p>
                      <p className="text-emerald-800 dark:text-emerald-300 leading-relaxed">
                        {currentResult.structuredAnalysis.facial_features_lock}
                      </p>
                    </div>
                  )}
                  {currentResult.trendElevationSummary && (
                    <div className="sm:col-span-2 p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-900/60">
                      <p className="font-bold text-purple-900 dark:text-purple-200 mb-0.5 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        Aesthetic &amp; Optical Elevation Applied
                      </p>
                      <p className="text-purple-800 dark:text-purple-300 leading-relaxed">
                        {currentResult.trendElevationSummary}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AnalysisItem({ title, content }: { title: string; content: string }) {
  return (
    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-1">
      <p className="font-bold text-slate-800 dark:text-slate-200">{title}</p>
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{content}</p>
    </div>
  );
}
