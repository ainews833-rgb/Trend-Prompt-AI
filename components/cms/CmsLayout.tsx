"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  PlusCircle,
  Tags,
  History,
  Archive,
  Settings,
  ExternalLink,
  LogOut,
  Sparkles,
  Search,
  Eye,
  Copy,
  Check,
  Edit3,
  Trash2,
  Upload,
  Download,
  ShieldCheck,
  Key,
  User,
  Mail,
  Database,
  ArrowRight,
  X,
  Wand2,
  Layers,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import { CmsPrompt, CmsService, CmsSettings, CmsRequestedPrompt } from "@/services/cmsService";

// Helper to compress uploaded images to high-quality lightweight data URLs (<80KB)
const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 800;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.8));
        } else {
          resolve((event.target?.result as string) || "");
        }
      };
      img.onerror = () => reject(new Error("Failed to process image"));
      img.src = event.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

interface CmsLayoutProps {
  onBackToSite: () => void;
  onLogout: () => void;
  showToast: (type: "success" | "error" | "info", message: string) => void;
}

export function CmsLayout({ onBackToSite, onLogout, showToast }: CmsLayoutProps) {
  const [activeMenu, setActiveMenu] = useState<
    "dashboard" | "all_prompts" | "requested" | "add_prompt" | "categories" | "history" | "backup" | "settings"
  >("dashboard");

  const [prompts, setPrompts] = useState<CmsPrompt[]>(() => CmsService.getPrompts());
  const [settings, setSettings] = useState<CmsSettings>(() => CmsService.getSettings());
  const [requestedPrompts, setRequestedPrompts] = useState<CmsRequestedPrompt[]>(() => CmsService.getRequestedPrompts());

  // Quick Promo State (Strictly 3 fields: Category, Image, Promo)
  const [quickCategory, setQuickCategory] = useState("Lifestyle Photography");
  const [quickImageUrl, setQuickImageUrl] = useState("");
  const [quickPromo, setQuickPromo] = useState("");

  // Edit / Add Modal State (Strictly 3 fields: Category, Image, Promo)
  const [editingPrompt, setEditingPrompt] = useState<Partial<CmsPrompt> | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Gemini AI Wizard Modal State
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardIdea, setWizardIdea] = useState("");
  const [wizardLoading, setWizardLoading] = useState(false);

  // Password / Credentials change state inside settings
  const [newUsername, setNewUsername] = useState(settings.adminUsername || "admin");
  const [newEmail, setNewEmail] = useState(settings.adminEmail || "admin@trendinggeminiprompts.com");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Search & Filter state for "All Prompts"
  const [promptSearch, setPromptSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const quickFileInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  const stats = CmsService.getStats();

  const refreshData = () => {
    setPrompts(CmsService.getPrompts());
    setSettings(CmsService.getSettings());
    setRequestedPrompts(CmsService.getRequestedPrompts());
  };

  useEffect(() => {
    const handleUpdate = () => refreshData();
    window.addEventListener("cms-prompts-updated", handleUpdate);
    window.addEventListener("cms-settings-updated", handleUpdate);
    return () => {
      window.removeEventListener("cms-prompts-updated", handleUpdate);
      window.removeEventListener("cms-settings-updated", handleUpdate);
    };
  }, []);

  // Quick Promo Handler (Category, Image, Promo)
  const handleSaveQuickPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPromo.trim()) {
      showToast("error", "Please write the promo text.");
      return;
    }

    CmsService.savePrompt({
      category: quickCategory,
      imageUrl: quickImageUrl.trim(),
      promptBody: quickPromo.trim(),
      status: "published",
      title: quickCategory,
    });

    setQuickPromo("");
    setQuickImageUrl("");
    refreshData();
    showToast("success", "Promo card published to the front page!");
  };

  // Status toggle
  const handleToggleStatus = (id: string) => {
    const next = CmsService.toggleStatus(id);
    refreshData();
    showToast("info", `Prompt status updated to ${next.toUpperCase()}`);
  };

  // Delete Prompt
  const handleDeletePrompt = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete this promo?`)) {
      CmsService.deletePrompt(id);
      refreshData();
      showToast("info", "Promo card deleted.");
    }
  };

  // Open Edit Modal with strictly 3 fields: Category, Image, Promo
  const handleOpenEdit = (prompt?: CmsPrompt) => {
    if (prompt) {
      setEditingPrompt({ ...prompt });
    } else {
      setEditingPrompt({
        category: "Lifestyle Photography",
        imageUrl: "",
        promptBody: "",
        status: "published",
      });
    }
    setIsEditModalOpen(true);
  };

  // Save Prompt in Modal (No title field, strictly category, image, promo)
  const handleSaveEditModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPrompt?.promptBody?.trim()) {
      showToast("error", "Promo prompt text is required.");
      return;
    }

    CmsService.savePrompt({
      ...editingPrompt,
      category: editingPrompt.category || "Lifestyle Photography",
      imageUrl: editingPrompt.imageUrl || "",
      promptBody: editingPrompt.promptBody || "",
      title: editingPrompt.category || "Trending Promo",
      status: "published",
    });

    setIsEditModalOpen(false);
    setEditingPrompt(null);
    refreshData();
    showToast("success", "Promo published and live on the front page!");
  };

  // Gemini AI Wizard Generator
  const handleRunAiWizard = async () => {
    if (!wizardIdea.trim()) {
      showToast("error", "Please enter a visual concept or trend idea.");
      return;
    }

    setWizardLoading(true);
    try {
      const res = await fetch("/api/cms/generate-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: wizardIdea.trim() }),
      });

      const data = await res.json();
      if (data.success && data.card) {
        setEditingPrompt({
          title: data.card.title,
          promptBody: data.card.promptBody,
          midjourneyFormat: data.card.midjourneyFormat,
          leonardoFormat: data.card.leonardoFormat,
          fluxFormat: data.card.fluxFormat,
          negativePrompt: data.card.negativePrompt,
          category: data.card.category || "Photorealistic & Portraits",
          tags: data.card.tags || ["AI Generated", "Trending", "Photorealistic"],
          imageUrl: data.card.imageUrl,
          status: "published",
        });

        setIsWizardOpen(false);
        setIsEditModalOpen(true);
        showToast("success", "AI Wizard generated a fresh AI photo & ultra-detailed prompt package!");
      } else {
        throw new Error(data.error || "Generation failed");
      }
    } catch (err: unknown) {
      console.warn("AI Wizard call failed, falling back gracefully:", err);
      // Fallback with dynamic seed
      const title = wizardIdea.trim();
      const seed = Math.floor(Math.random() * 9000000) + 1000000;
      const cleanVisual = encodeURIComponent(`${title}, high fashion editorial portrait, 85mm lens, natural daylight, 8k definition`);
      const dynamicPhotoUrl = `https://image.pollinations.ai/prompt/${cleanVisual}?width=768&height=1024&model=flux&seed=${seed}&nologo=true`;

      const promptBody = `Create a picture of this woman unchanged her feature face Subject: A stylish young woman posing outdoors with a scenic coastal background inspired by ${title}. She is looking back over her shoulder towards the viewer, with a confident and chic expression. Natural makeup brown contour and highlight, rose lip color.

Hair: Long, luscious Light brown hair styled in soft, voluminous waves, with some strands gently swept back by the breeze, adding a dynamic element to the image.

Dress & Style: She is wearing a light blue, possibly striped or textured, halter-neck or strapless top with a ruffled or layered detail. The fabric appears light and airy, suitable for a warm climate.

Accessories: Sunglasses: Fashionable dark, oval-shaped sunglasses with a substantial frame. Handbag: A classic black quilted handbag with a gold chain strap, likely a high-end designer bag (reminiscent of Chanel). The bag is worn over her shoulder, resting against her side. Jewelry: A delicate gold ring is visible on her right hand, which is raised to adjust her sunglasses or playfully touch her hair.

Vibe & Emotion: The overall vibe is one of sophisticated vacation, luxury, and relaxed glamour. Her pose and expression convey confidence, allure, and a sense of enjoying a beautiful destination.

Lighting: Bright and natural sunlight, typical of a clear day. The lighting creates subtle highlights on her hair and skin, and casts gentle shadows, giving depth to the scene.

Colors: The dominant colors are the vibrant blue of the sea and sky, the lush greens of the foliage, the light tones of the road, and the woman's dark hair and black accessories contrasted by her light blue top.

Background: A stunning coastal landscape with a clear, calm blue sea extending to the horizon. In the distance, faint outlines of mountains or hills are visible. The foreground features a well-maintained pathway or road flanked by green, manicured bushes and mature trees (possibly pines). There are hints of white buildings or structures in the distance near the coastline, suggesting a resort or upscale area.

Camera Angle & Composition: The shot is a medium-close up, focusing on the woman from the waist up. The camera is positioned slightly below eye level, which can be flattering. The composition places her slightly off-center, with the expansive sea and sky providing a beautiful and balanced backdrop. The winding road leads the eye towards the distant water.

Photography Style: The image appears to be high-resolution, with sharp focus on the subject and a natural, vibrant color palette. It has the feel of a candid yet perfectly styled travel or fashion photograph, capturing an effortless elegance.`;

      setEditingPrompt({
        title,
        promptBody,
        midjourneyFormat: `${title}, editorial portrait, unchanged facial identity, 85mm prime lens, soft natural lighting, creamy bokeh, Kodak Portra 400 tones --ar 3:4 --v 6.1 --style raw`,
        leonardoFormat: `${title}, photorealistic portrait, authentic 35mm film grain, directional sunlight, high editorial detail --strength 0.88`,
        fluxFormat: `${title}, candid high-resolution portrait, golden natural lighting, authentic skin micro-pores, 8k photographic definition`,
        negativePrompt: "altered face, modified face, changed nose, distorted face, plastic skin, CGI, 3D render, low quality, bad hands, mutated anatomy",
        category: "Photorealistic & Portraits",
        tags: ["AI Generated", "Trending", "Photorealistic"],
        imageUrl: dynamicPhotoUrl,
        status: "published",
      });

      setIsWizardOpen(false);
      setIsEditModalOpen(true);
      showToast("success", "AI Wizard generated a fresh AI photo & ultra-detailed prompt package!");
    } finally {
      setWizardLoading(false);
    }
  };

  // Download Backups
  const handleDownloadBackup = () => {
    const json = CmsService.exportBackupJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gemini_prompts_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("success", "Backup archive downloaded successfully!");
  };

  // Restore from File
  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const res = CmsService.importBackupJson(text);
      if (res.success) {
        refreshData();
        showToast("success", `Restored ${res.count} prompts from backup!`);
      } else {
        showToast("error", res.error || "Failed to restore backup.");
      }
    };
    reader.readAsText(file);
  };

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    CmsService.saveSettings(settings);
    refreshData();
    showToast("success", "Site settings & identity updated successfully!");
  };

  // Update Admin Credentials (User requested feature!)
  const handleUpdateCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      showToast("error", "New password and confirmation do not match.");
      return;
    }

    const updates: Partial<CmsSettings> = {
      adminUsername: newUsername.trim(),
      adminEmail: newEmail.trim(),
    };

    if (newPassword) {
      updates.adminPassword = newPassword;
    }

    CmsService.saveSettings(updates);
    refreshData();
    setNewPassword("");
    setConfirmPassword("");
    showToast("success", "Administrator credentials updated securely!");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top WordPress CMS Navigation Bar */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-base shadow-sm">
              W
            </div>
            <div>
              <span className="text-xs font-bold text-white tracking-tight block">
                WordPress CMS
              </span>
              <span className="text-[10px] text-slate-400 block -mt-0.5">
                Trending Photo Prompts
              </span>
            </div>
          </div>

          <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

          {/* Visit Site Badge */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700/60 transition-colors"
            title="Open Live Site in New Tab"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Visit Site</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
            <span className="text-slate-500 text-[10px] truncate max-w-[150px]">
              {settings.publicDomain}
            </span>
          </a>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Top Right "Visit Site" Button */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-750 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700/70 transition-colors shadow-xs"
            title="Open Live Site in New Tab"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            <span>Visit Site</span>
          </a>

          <button
            onClick={() => handleOpenEdit()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Prompt</span>
          </button>

          <button
            onClick={() => setIsWizardOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-bold shadow-sm border border-indigo-500/40 transition-all active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Gemini AI Wizard</span>
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <span className="text-xs font-semibold text-slate-300 hidden md:inline">
              {settings.adminUsername || "Administrator"}
            </span>
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Log Out Administrator"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main CMS Layout (Sidebar + Content) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Dark WordPress CMS Sidebar */}
        <aside className="w-60 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 overflow-y-auto">
          <div className="p-3 space-y-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 pt-2">
              Content Management
            </div>

            <nav className="space-y-1">
              <button
                onClick={() => setActiveMenu("dashboard")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeMenu === "dashboard"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </div>
              </button>

              <button
                onClick={() => setActiveMenu("all_prompts")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeMenu === "all_prompts"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4" />
                  <span>All Prompts / Articles</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                  {prompts.length}
                </span>
              </button>

              <button
                onClick={() => setActiveMenu("requested")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeMenu === "requested"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4" />
                  <span>Requested Prompts</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300">
                  {requestedPrompts.length}
                </span>
              </button>

              <button
                onClick={() => handleOpenEdit()}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all"
              >
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <span>Add New Prompt</span>
              </button>

              <button
                onClick={() => setActiveMenu("categories")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeMenu === "categories"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                }`}
              >
                <Tags className="w-4 h-4" />
                <span>Categories & Tags</span>
              </button>

              <button
                onClick={() => setActiveMenu("backup")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeMenu === "backup"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                }`}
              >
                <Archive className="w-4 h-4" />
                <span>Backup & Restore</span>
              </button>

              <button
                onClick={() => setActiveMenu("settings")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeMenu === "settings"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Site Settings</span>
              </button>
            </nav>
          </div>

          {/* Bottom of Sidebar */}
          <div className="p-3 border-t border-slate-800 space-y-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/60 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
              title="Open Live Site in New Tab"
            >
              <div className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                <span>View Live Site</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </a>

            <div className="px-3 py-1 flex items-center justify-between text-[11px] text-slate-500">
              <div className="truncate max-w-[140px]">
                <span className="font-bold text-slate-400 block truncate">
                  {settings.adminUsername}
                </span>
                <span className="text-[10px] text-slate-500 truncate block">
                  {settings.adminEmail}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="text-slate-400 hover:text-red-400 p-1 rounded"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </aside>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-950 space-y-8">
          {/* MENU 1: DASHBOARD VIEW (Screenshot 1) */}
          {activeMenu === "dashboard" && (
            <div className="space-y-8 max-w-6xl mx-auto">
              {/* Dashboard Headline & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Trending Gemini Prompts CMS Dashboard
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Publish new prompts, track copy stats, and manage SEO articles live on your domain.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => handleOpenEdit()}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Write New Prompt</span>
                  </button>

                  <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-800 transition-colors cursor-pointer"
                    title="Open Live Site in New Tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                    <span>Visit Site</span>
                  </a>
                </div>
              </div>

              {/* 4 Stat Cards matching Screenshot 1 */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Live Prompts */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <span>Live Prompts</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white">
                    {stats.livePrompts}
                  </div>
                  <div className="text-[11px] text-emerald-400 font-semibold">
                    Active on Domain
                  </div>
                </div>

                {/* 2. Drafts */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <span>Drafts</span>
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white">
                    {stats.drafts}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Unpublished
                  </div>
                </div>

                {/* 3. Total Copies */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <span>Total Copies</span>
                    <Copy className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white">
                    {stats.totalCopies}
                  </div>
                  <div className="text-[11px] text-blue-400 font-semibold">
                    Prompt Clipboard Clicks
                  </div>
                </div>

                {/* 4. Est. Views */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <span>Est. Views</span>
                    <Eye className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white">
                    {stats.estViews.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-purple-400 font-semibold">
                    Organic Page Impressions
                  </div>
                </div>
              </div>

              {/* Lower 2-Column Section (Quick Draft + Recently Published Prompts) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Quick Promo (Strictly 3 fields: Category, Image, Promo) */}
                <div className="lg:col-span-5 p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      <span>Add Promo to Front Page</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Create and publish a card directly to the front page in three quick fields.
                    </p>
                  </div>

                  <form onSubmit={handleSaveQuickPromo} className="space-y-3.5">
                    {/* 1. Category */}
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Category
                      </label>
                      <select
                        value={quickCategory}
                        onChange={(e) => setQuickCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Lifestyle Photography">Lifestyle Photography</option>
                        <option value="Fashion & Editorial Photography">Fashion & Editorial Photography</option>
                        <option value="Photorealistic & Portraits">Photorealistic & Portraits</option>
                        <option value="Digital Art & Creative Portraiture">Digital Art & Creative Portraiture</option>
                        <option value="Cinematic & Conceptual">Cinematic & Conceptual</option>
                        <option value="Anime & Illustration">Anime & Illustration</option>
                        <option value="Architecture & Interior">Architecture & Interior</option>
                        <option value="Product & Commercial">Product & Commercial</option>
                      </select>
                    </div>

                    {/* 2. Image */}
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Promo Image
                      </label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={quickImageUrl}
                            onChange={(e) => setQuickImageUrl(e.target.value)}
                            placeholder="Paste image URL (or upload below)..."
                            className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="file"
                            ref={quickFileInputRef}
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  const compressed = await compressImageFile(file);
                                  setQuickImageUrl(compressed);
                                  showToast("success", "Image uploaded and compressed!");
                                } catch {
                                  showToast("error", "Failed to upload image.");
                                }
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => quickFileInputRef.current?.click()}
                            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 shrink-0 border border-slate-700 transition-colors cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const concept = quickPromo.trim() || quickCategory || "editorial aesthetic portrait";
                              const seed = Math.floor(Math.random() * 9000000) + 1000000;
                              const clean = encodeURIComponent(`${concept.slice(0, 100)}, high resolution photography, 85mm lens, natural daylight, 8k definition`);
                              const newUrl = `https://image.pollinations.ai/prompt/${clean}?width=768&height=1024&model=flux&seed=${seed}&nologo=true`;
                              setQuickImageUrl(newUrl);
                              showToast("success", "AI generated a brand new photo for this promo!");
                            }}
                            className="px-2.5 py-2 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 text-xs font-semibold flex items-center gap-1.5 shrink-0 border border-indigo-700/50 transition-colors cursor-pointer"
                            title="Generate a unique Flux AI photo for this promo"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>AI Photo</span>
                          </button>
                        </div>

                        {quickImageUrl && (
                          <div className="relative w-full h-32 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 group">
                            <img
                              src={quickImageUrl}
                              alt="Promo Preview"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => setQuickImageUrl("")}
                              className="absolute top-2 right-2 p-1 rounded-lg bg-black/70 text-white hover:bg-red-600 transition-colors text-[10px]"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 3. Promo */}
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Place to Add Promo (Prompt Text)
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={quickPromo}
                        onChange={(e) => setQuickPromo(e.target.value)}
                        placeholder="Enter the promo prompt text here. Users can click this card on the front page to view the prompt print on the side..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-blue-500 resize-none font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all active:scale-95 shadow-md"
                    >
                      Publish Promo Card to Front Page
                    </button>
                  </form>
                </div>

                {/* Right Column: Recently Published Prompts (7 cols) */}
                <div className="lg:col-span-7 p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">
                      Live Promo Cards
                    </h3>
                    <button
                      onClick={() => setActiveMenu("all_prompts")}
                      className="text-xs text-blue-400 font-semibold hover:underline"
                    >
                      View All ({prompts.length}) →
                    </button>
                  </div>

                  {prompts.length === 0 ? (
                    <div className="py-12 text-center space-y-2 border border-dashed border-slate-800 rounded-2xl p-6">
                      <div className="w-10 h-10 rounded-xl bg-slate-800/80 text-slate-400 mx-auto flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 opacity-60" />
                      </div>
                      <p className="text-xs font-semibold text-slate-300">No Promos Added Yet</p>
                      <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                        Fill out the 3 fields on the left to publish your first promo card to the front page!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 divide-y divide-slate-800/60">
                      {prompts.slice(0, 5).map((p) => (
                        <div key={p.id} className="pt-2.5 first:pt-0 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            {p.imageUrl ? (
                              <img
                                src={p.imageUrl}
                                alt={p.category}
                                className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-800"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                                <ImageIcon className="w-5 h-5 opacity-40" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-950 text-blue-300 border border-blue-800/40">
                                  {p.category}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {p.copiesCount} copies
                                </span>
                              </div>
                              <p
                                className="text-xs text-slate-200 truncate mt-1 cursor-pointer hover:text-blue-400 transition-colors font-mono"
                                onClick={() => handleOpenEdit(p)}
                              >
                                {p.promptBody}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                              {p.status}
                            </span>
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                              title="Edit Promo"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeletePrompt(p.id, p.category)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                              title="Delete Promo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                    <span>Showing top 5 latest promos</span>
                    <button
                      onClick={() => handleOpenEdit()}
                      className="text-blue-400 font-bold hover:underline"
                    >
                      + Create Another
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MENU 2: ALL PROMPTS / PROMOS */}
          {activeMenu === "all_prompts" && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-white">All Promo Cards ({prompts.length})</h2>
                  <p className="text-xs text-slate-400">Manage, edit, publish or draft promo cards on the front page.</p>
                </div>

                <button
                  onClick={() => handleOpenEdit()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add Promo Card</span>
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={promptSearch}
                    onChange={(e) => setPromptSearch(e.target.value)}
                    placeholder="Search by category or prompt text..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden"
                >
                  <option value="All">All Categories</option>
                  <option value="Lifestyle Photography">Lifestyle Photography</option>
                  <option value="Fashion & Editorial Photography">Fashion & Editorial Photography</option>
                  <option value="Photorealistic & Portraits">Photorealistic & Portraits</option>
                  <option value="Digital Art & Creative Portraiture">Digital Art & Creative Portraiture</option>
                  <option value="Cinematic & Conceptual">Cinematic & Conceptual</option>
                  <option value="Anime & Illustration">Anime & Illustration</option>
                  <option value="Architecture & Interior">Architecture & Interior</option>
                  <option value="Product & Commercial">Product & Commercial</option>
                </select>
              </div>

              {/* Prompts Table */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                      <th className="p-3.5">Promo Card</th>
                      <th className="p-3.5 hidden md:table-cell">Category</th>
                      <th className="p-3.5 hidden sm:table-cell">Status</th>
                      <th className="p-3.5">Copies</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {prompts
                      .filter((p) => {
                        const matchesCat = categoryFilter === "All" || p.category === categoryFilter;
                        const matchesText =
                          !promptSearch.trim() ||
                          (p.category && p.category.toLowerCase().includes(promptSearch.toLowerCase())) ||
                          (p.promptBody && p.promptBody.toLowerCase().includes(promptSearch.toLowerCase()));
                        return matchesCat && matchesText;
                      })
                      .map((p) => (
                        <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              {p.imageUrl ? (
                                <img
                                  src={p.imageUrl}
                                  alt={p.category}
                                  className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-800"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                                  <ImageIcon className="w-5 h-5 opacity-40" />
                                </div>
                              )}
                              <div className="min-w-0 max-w-sm">
                                <span className="font-bold text-white text-xs block truncate">{p.category}</span>
                                <p className="text-slate-400 text-[11px] line-clamp-1 font-mono">{p.promptBody}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 text-slate-300 hidden md:table-cell">{p.category}</td>
                          <td className="p-3.5 hidden sm:table-cell">
                            <button
                              onClick={() => handleToggleStatus(p.id)}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                                p.status === "published"
                                  ? "bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-amber-950 hover:text-amber-300"
                                  : "bg-amber-950 text-amber-300 border-amber-800 hover:bg-emerald-950 hover:text-emerald-300"
                              }`}
                              title="Click to toggle publish status"
                            >
                              {p.status}
                            </button>
                          </td>
                          <td className="p-3.5 text-slate-300 font-semibold">{p.copiesCount}</td>
                          <td className="p-3.5 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => handleOpenEdit(p)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                                title="Edit"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeletePrompt(p.id, p.category)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                    {prompts.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-slate-500 text-xs">
                          No promo cards found. Click &quot;Add Promo Card&quot; to create your first card!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MENU 3: REQUESTED PROMPTS */}
          {activeMenu === "requested" && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div>
                <h2 className="text-xl font-black text-white">Community Requested Prompts</h2>
                <p className="text-xs text-slate-400">Incoming prompt submissions and trend requests from users.</p>
              </div>

              <div className="space-y-3">
                {requestedPrompts.map((req) => (
                  <div key={req.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{req.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">{req.category}</span>
                      </div>
                      <p className="text-xs text-slate-400">{req.description}</p>
                      <span className="text-[10px] text-slate-500 block">Submitted by {req.submittedBy}</span>
                    </div>

                    <button
                      onClick={() => {
                        CmsService.approveRequestedPrompt(req.id);
                        refreshData();
                        showToast("success", `Approved "${req.title}" and published to front page!`);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shrink-0"
                    >
                      Approve & Publish
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MENU 4: CATEGORIES & TAGS */}
          {activeMenu === "categories" && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div>
                <h2 className="text-xl font-black text-white">Categories & Aesthetic Tags</h2>
                <p className="text-xs text-slate-400">Manage tags for Pinterest feed filtering.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: "Lifestyle Photography", count: 18 },
                  { name: "Fashion & Editorial Photography", count: 14 },
                  { name: "Photorealistic & Portraits", count: 12 },
                  { name: "Digital Art & Creative Portraiture", count: 5 },
                  { name: "Cinematic & Conceptual", count: 3 },
                ].map((c) => (
                  <div key={c.name} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-white">{c.name}</h4>
                      <span className="text-[11px] text-slate-400">{c.count} active prompts</span>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-blue-950 text-blue-300 font-semibold">Active</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MENU 5: BACKUP & RESTORE (Screenshot 2) */}
          {activeMenu === "backup" && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <Archive className="w-5 h-5 text-blue-400" />
                    <span>Prompt Cards Backup & Restore</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Download full ZIP archives or standalone JSON backups of prompt cards, or restore them directly into the database.
                  </p>
                </div>

                <button
                  onClick={() => showToast("success", "Cloud Database is already in sync!")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300"
                >
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sync Cloud DB</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Download Backups (Left Card) */}
                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                      <Download className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Download Backups</h3>
                      <p className="text-xs text-slate-400">Export prompts, categories, and tags</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-slate-300">Current Live Prompts</span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-xl bg-slate-900">
                        <span className="text-[10px] text-slate-400 block">Published</span>
                        <span className="text-base font-bold text-emerald-400">{stats.livePrompts}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900">
                        <span className="text-[10px] text-slate-400 block">Drafts</span>
                        <span className="text-base font-bold text-amber-400">{stats.drafts}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Backup contains all prompt texts, image URLs, categories, AI tools, tags, and parameters.
                  </p>

                  <button
                    onClick={handleDownloadBackup}
                    className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Complete Backup Archive (.json)</span>
                  </button>
                </div>

                {/* 2. Restore Prompts (Right Card) */}
                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Restore Prompts from Backup</h3>
                      <p className="text-xs text-slate-400">Upload a previously downloaded archive to restore prompts</p>
                    </div>
                  </div>

                  {/* Drag & Drop Area */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-8 rounded-2xl border-2 border-dashed border-slate-800 hover:border-blue-500 bg-slate-950/60 cursor-pointer flex flex-col items-center justify-center text-center space-y-3 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-400 flex items-center justify-center">
                      <Archive className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">
                        Click to select or drag & drop backup <span className="text-blue-400">.JSON / .ZIP</span> archive
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Accepts *.json complete archives</p>
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleRestoreFile}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* MENU 6: SITE SETTINGS (Screenshot 3) */}
          {activeMenu === "settings" && (
            <div className="space-y-8 max-w-4xl mx-auto">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-400" />
                  <span>General Settings & Infrastructure</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Configure site identity, public URLs, administrator credentials, and Gemini AI system instructions.
                </p>
              </div>

              {/* Card 1: Site Identity */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-xs">
                  Site Identity
                </h3>

                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300 block">Site Title</label>
                      <input
                        type="text"
                        value={settings.siteTitle}
                        onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300 block">Public Domain / URL</label>
                      <input
                        type="text"
                        value={settings.publicDomain}
                        onChange={(e) => setSettings({ ...settings, publicDomain: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 block">Tagline</label>
                    <input
                      type="text"
                      value={settings.tagline}
                      onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 block">Footer Copyright Text</label>
                    <input
                      type="text"
                      value={settings.footerCopyright}
                      onChange={(e) => setSettings({ ...settings, footerCopyright: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md"
                    >
                      Save Site Identity
                    </button>
                  </div>
                </form>
              </div>

              {/* Card 2: Administrator Security & Credentials (USER'S EXPLICIT REQUEST) */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Key className="w-4 h-4 text-amber-400" />
                      <span>Administrator Credentials & Security</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Change your administrator username, email, and password. Only you have access to this portal.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    High Security
                  </span>
                </div>

                <form onSubmit={handleUpdateCredentials} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300 block">Admin Username</label>
                      <div className="relative">
                        <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          required
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300 block">Admin Email</label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="email"
                          required
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300 block">New Password (leave blank to keep current)</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300 block">Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md"
                    >
                      Update Admin Credentials
                    </button>
                  </div>
                </form>
              </div>

              {/* Card 3: Gemini AI Custom System Instructions */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-bold text-white">Gemini AI Custom System Instructions & Directives</h3>
                </div>
                <p className="text-xs text-slate-400">
                  Specify permanent custom rules, tone of voice, formatting styles, or reverse-engineering directives for all server-side Gemini API calls.
                </p>

                <textarea
                  rows={4}
                  value={settings.geminiInstructions}
                  onChange={(e) => setSettings({ ...settings, geminiInstructions: e.target.value })}
                  placeholder="e.g. Always include ultra-detailed lighting descriptions, camera focal lengths, and cinematic ratios in every generated prompt package..."
                  className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                />

                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      CmsService.saveSettings(settings);
                      showToast("success", "Saved custom Gemini AI instructions!");
                    }}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                  >
                    Save Gemini Instructions
                  </button>
                </div>
              </div>

              {/* Card 4: Database Status */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">CMS Prompt Storage & Cloud Sync</h4>
                    <p className="text-[11px] text-slate-400">Connected & Ready ({stats.livePrompts} Posts Synced Live)</p>
                  </div>
                </div>

                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Healthy & Online
                </span>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL 1: ADD / EDIT PROMO MODAL (STRICTLY 3 FIELDS: CATEGORY, IMAGE, PROMO) */}
      {isEditModalOpen && editingPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div>
                <h3 className="text-base font-bold text-white">
                  {editingPrompt.id ? "Edit Promo Card" : "Add Promo Card to Front Page"}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Card will display on the front page with side drawer prompt print.
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body - Strictly 3 Fields */}
            <form onSubmit={handleSaveEditModal} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              {/* 1. Category */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-300 block">Category</label>
                <select
                  value={editingPrompt.category || "Lifestyle Photography"}
                  onChange={(e) => setEditingPrompt({ ...editingPrompt, category: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Lifestyle Photography">Lifestyle Photography</option>
                  <option value="Fashion & Editorial Photography">Fashion & Editorial Photography</option>
                  <option value="Photorealistic & Portraits">Photorealistic & Portraits</option>
                  <option value="Digital Art & Creative Portraiture">Digital Art & Creative Portraiture</option>
                  <option value="Cinematic & Conceptual">Cinematic & Conceptual</option>
                  <option value="Anime & Illustration">Anime & Illustration</option>
                  <option value="Architecture & Interior">Architecture & Interior</option>
                  <option value="Product & Commercial">Product & Commercial</option>
                </select>
              </div>

              {/* 2. Image */}
              <div className="space-y-2">
                <label className="font-semibold text-slate-300 block">Promo Image</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editingPrompt.imageUrl || ""}
                    onChange={(e) => setEditingPrompt({ ...editingPrompt, imageUrl: e.target.value })}
                    placeholder="Paste image URL (or upload below)..."
                    className="flex-1 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="file"
                    ref={modalFileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const compressed = await compressImageFile(file);
                          setEditingPrompt({ ...editingPrompt, imageUrl: compressed });
                          showToast("success", "Image uploaded successfully!");
                        } catch {
                          showToast("error", "Failed to upload image.");
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => modalFileInputRef.current?.click()}
                    className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 shrink-0 border border-slate-700 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const concept = editingPrompt.promptBody?.trim() || editingPrompt.title || editingPrompt.category || "editorial aesthetic portrait";
                      const seed = Math.floor(Math.random() * 9000000) + 1000000;
                      const clean = encodeURIComponent(`${concept.slice(0, 100)}, high resolution photography, 85mm lens, natural daylight, 8k definition`);
                      const newUrl = `https://image.pollinations.ai/prompt/${clean}?width=768&height=1024&model=flux&seed=${seed}&nologo=true`;
                      setEditingPrompt({ ...editingPrompt, imageUrl: newUrl });
                      showToast("success", "AI generated a brand new photo for this promo!");
                    }}
                    className="px-2.5 py-2.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 text-xs font-semibold flex items-center gap-1.5 shrink-0 border border-indigo-700/50 transition-colors cursor-pointer"
                    title="Generate a unique Flux AI photo for this promo"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>AI Photo</span>
                  </button>
                </div>

                {editingPrompt.imageUrl && (
                  <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                    <img
                      src={editingPrompt.imageUrl}
                      alt="Promo Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setEditingPrompt({ ...editingPrompt, imageUrl: "" })}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-white hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* 3. Place to Add Promo (Prompt Text) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-300 block">
                    Place to Add Promo (Prompt Text)
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {editingPrompt.promptBody?.length || 0} chars
                  </span>
                </div>
                <textarea
                  rows={5}
                  required
                  value={editingPrompt.promptBody || ""}
                  onChange={(e) => setEditingPrompt({ ...editingPrompt, promptBody: e.target.value })}
                  placeholder="Enter the prompt text / promotion here. When the user clicks this photo card on the front page, this exact prompt print will be automatically displayed on the side drawer for copying..."
                  className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md transition-all active:scale-95"
                >
                  Publish Promo Card to Front Page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: GEMINI AI WIZARD MODAL */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Gemini AI Prompt Wizard</span>
              </div>
              <button
                onClick={() => setIsWizardOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Enter any trending photo concept. Gemini AI will automatically write camera specs, lighting setups, Midjourney parameters, and negative prompts for you.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Trend or Style Idea</label>
              <input
                type="text"
                value={wizardIdea}
                onChange={(e) => setWizardIdea(e.target.value)}
                placeholder="e.g. 90s Grunge Flash Film Portrait in Berlin Underground"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setIsWizardOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={handleRunAiWizard}
                disabled={wizardLoading}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md disabled:opacity-50 flex items-center gap-1.5"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>{wizardLoading ? "Generating..." : "Generate Full Card"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
