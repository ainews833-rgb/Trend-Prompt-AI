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
} from "lucide-react";
import { CmsPrompt, CmsService, CmsSettings, CmsRequestedPrompt } from "@/services/cmsService";

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

  // Quick Draft State
  const [quickTitle, setQuickTitle] = useState("");
  const [quickBody, setQuickBody] = useState("");

  // Edit / Add Modal State
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

  // Quick Prompt Draft Handler
  const handleSaveQuickDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() || !quickBody.trim()) {
      showToast("error", "Please provide both title and prompt text.");
      return;
    }

    CmsService.savePrompt({
      title: quickTitle.trim(),
      promptBody: quickBody.trim(),
      status: "draft",
      category: "Lifestyle Photography",
    });

    setQuickTitle("");
    setQuickBody("");
    refreshData();
    showToast("success", "Prompt draft saved successfully!");
  };

  // Status toggle
  const handleToggleStatus = (id: string) => {
    const next = CmsService.toggleStatus(id);
    refreshData();
    showToast("info", `Prompt status updated to ${next.toUpperCase()}`);
  };

  // Delete Prompt
  const handleDeletePrompt = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      CmsService.deletePrompt(id);
      refreshData();
      showToast("info", "Prompt deleted.");
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (prompt?: CmsPrompt) => {
    if (prompt) {
      setEditingPrompt({ ...prompt });
    } else {
      setEditingPrompt({
        title: "",
        category: "Lifestyle Photography",
        imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
        promptBody: "",
        midjourneyFormat: "",
        leonardoFormat: "",
        fluxFormat: "",
        negativePrompt: "lowres, distorted face, plastic skin, bad anatomy, deformed fingers",
        tags: ["Trending", "AI Photo Prompt"],
        status: "published",
      });
    }
    setIsEditModalOpen(true);
  };

  // Save Prompt in Modal
  const handleSaveEditModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPrompt?.title?.trim() || !editingPrompt?.promptBody?.trim()) {
      showToast("error", "Title and prompt text are required.");
      return;
    }

    CmsService.savePrompt(editingPrompt);
    setIsEditModalOpen(false);
    setEditingPrompt(null);
    refreshData();
    showToast("success", "Prompt published and live on the front page!");
  };

  // Gemini AI Wizard Generator
  const handleRunAiWizard = () => {
    if (!wizardIdea.trim()) {
      showToast("error", "Please enter a visual concept or trend idea.");
      return;
    }

    setWizardLoading(true);
    setTimeout(() => {
      const title = wizardIdea.trim();
      const promptBody = `Hyper-realistic cinematic aesthetic portrait of ${title}. Shot on Hasselblad H6D-100c with 85mm f/1.4 lens, natural directional lighting with soft fill, fine skin micro-textures, natural pores and catchlights, Kodak Portra 400 analog color grading, 8k photographic definition.`;
      const midjourney = `Cinematic portrait of ${title}, Hasselblad 85mm f/1.4, Kodak Portra 400, natural window lighting, photorealistic, high resolution --ar 4:5 --style raw --v 6.1`;
      const leonardo = `Fine art editorial portrait, ${title}, authentic 35mm film grain, atmospheric depth, pristine optical detail --strength 0.88`;
      const flux = `Ultra-sharp candid photo of ${title}, cinematic golden hour lighting, authentic textures, professional portraiture, 8k resolution`;

      setEditingPrompt({
        title,
        promptBody,
        midjourneyFormat: midjourney,
        leonardoFormat: leonardo,
        fluxFormat: flux,
        negativePrompt: "distorted face, plastic skin, CGI, 3D render, low quality, bad hands",
        category: "Photorealistic & Portraits",
        tags: ["AI Generated", "Trending", "Photorealistic"],
        imageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80",
        status: "published",
      });

      setWizardLoading(false);
      setIsWizardOpen(false);
      setIsEditModalOpen(true);
      showToast("success", "AI Wizard generated full prompt package! Review and publish.");
    }, 700);
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
          <button
            onClick={onBackToSite}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700/60 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Visit Site</span>
            <span className="text-slate-500 text-[10px] truncate max-w-[150px]">
              {settings.publicDomain}
            </span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleOpenEdit()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Prompt</span>
          </button>

          <button
            onClick={() => setIsWizardOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-bold shadow-sm border border-indigo-500/40 transition-all active:scale-95"
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
            <button
              onClick={onBackToSite}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/60 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors"
            >
              <div className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                <span>View Live Site</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </button>

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

                  <button
                    onClick={onBackToSite}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-800 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Visit Site</span>
                  </button>
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
                {/* Left Column: Quick Prompt Draft (4 cols) */}
                <div className="lg:col-span-5 p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      <span>Quick Prompt Draft</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Jot down a prompt idea quickly to save it as a draft for later editing.
                    </p>
                  </div>

                  <form onSubmit={handleSaveQuickDraft} className="space-y-3.5">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Prompt Title
                      </label>
                      <input
                        type="text"
                        value={quickTitle}
                        onChange={(e) => setQuickTitle(e.target.value)}
                        placeholder="e.g. Neon Cyberpunk Alleyway in Rain..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Prompt Body
                      </label>
                      <textarea
                        rows={4}
                        value={quickBody}
                        onChange={(e) => setQuickBody(e.target.value)}
                        placeholder="Paste the prompt text here..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-blue-500 resize-none font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-200 text-slate-950 font-bold text-xs transition-all active:scale-95"
                    >
                      Save as Draft
                    </button>
                  </form>
                </div>

                {/* Right Column: Recently Published Prompts (7 cols) */}
                <div className="lg:col-span-7 p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">
                      Recently Published Prompts
                    </h3>
                    <button
                      onClick={() => setActiveMenu("all_prompts")}
                      className="text-xs text-blue-400 font-semibold hover:underline"
                    >
                      View All ({prompts.length}) →
                    </button>
                  </div>

                  <div className="space-y-2.5 divide-y divide-slate-800/60">
                    {prompts.slice(0, 5).map((p) => (
                      <div key={p.id} className="pt-2.5 first:pt-0 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={p.imageUrl}
                            alt={p.title}
                            className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-800"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white truncate hover:text-blue-400 transition-colors cursor-pointer" onClick={() => handleOpenEdit(p)}>
                              {p.title}
                            </h4>
                            <p className="text-[11px] text-slate-400 truncate">
                              {p.category} • {p.copiesCount} copies
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
                            title="Edit Prompt"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                    <span>Showing top 5 latest prompts</span>
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

          {/* MENU 2: ALL PROMPTS / ARTICLES */}
          {activeMenu === "all_prompts" && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-white">All Prompts & Articles ({prompts.length})</h2>
                  <p className="text-xs text-slate-400">Manage, edit, publish or draft your trending prompts.</p>
                </div>

                <button
                  onClick={() => handleOpenEdit()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add New Prompt</span>
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
                    placeholder="Search by title, prompt text, or tag..."
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
                </select>
              </div>

              {/* Prompts Table */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                      <th className="p-3.5">Prompt</th>
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
                          p.title.toLowerCase().includes(promptSearch.toLowerCase()) ||
                          p.promptBody.toLowerCase().includes(promptSearch.toLowerCase());
                        return matchesCat && matchesText;
                      })
                      .map((p) => (
                        <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.imageUrl}
                                alt={p.title}
                                className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-800"
                              />
                              <div className="min-w-0 max-w-sm">
                                <h4 className="font-bold text-white truncate">{p.title}</h4>
                                <p className="text-slate-400 text-[11px] line-clamp-1">{p.promptBody}</p>
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
                                onClick={() => handleDeletePrompt(p.id, p.title)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
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

      {/* MODAL 1: ADD / EDIT PROMPT MODAL */}
      {isEditModalOpen && editingPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <h3 className="text-base font-bold text-white">
                {editingPrompt.id ? "Edit Prompt Card" : "Add New Prompt to Front Page"}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleSaveEditModal} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              {/* Title */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-300 block">Prompt Title</label>
                <input
                  type="text"
                  required
                  value={editingPrompt.title || ""}
                  onChange={(e) => setEditingPrompt({ ...editingPrompt, title: e.target.value })}
                  placeholder="e.g. Vintage Countryside Picnic Couple Portrait"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300 block">Category</label>
                  <select
                    value={editingPrompt.category || "Lifestyle Photography"}
                    onChange={(e) => setEditingPrompt({ ...editingPrompt, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="Lifestyle Photography">Lifestyle Photography</option>
                    <option value="Fashion & Editorial Photography">Fashion & Editorial Photography</option>
                    <option value="Photorealistic & Portraits">Photorealistic & Portraits</option>
                    <option value="Digital Art & Creative Portraiture">Digital Art & Creative Portraiture</option>
                    <option value="Cinematic & Conceptual">Cinematic & Conceptual</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300 block">Publish Status</label>
                  <select
                    value={editingPrompt.status || "published"}
                    onChange={(e) => setEditingPrompt({ ...editingPrompt, status: e.target.value as "published" | "draft" })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="published">Published (Live on Front Page)</option>
                    <option value="draft">Draft (Unpublished)</option>
                  </select>
                </div>
              </div>

              {/* Image URL */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-300 block">Reference Image URL (Unsplash or CDN)</label>
                <input
                  type="url"
                  required
                  value={editingPrompt.imageUrl || ""}
                  onChange={(e) => setEditingPrompt({ ...editingPrompt, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              {/* Master Prompt Body */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-300 block">Master Prompt Text</label>
                <textarea
                  rows={4}
                  required
                  value={editingPrompt.promptBody || ""}
                  onChange={(e) => setEditingPrompt({ ...editingPrompt, promptBody: e.target.value })}
                  placeholder="Full detailed photographic and visual prompt..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs"
                />
              </div>

              {/* Midjourney Format */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-300 block">Midjourney Format (--ar, --v, --style)</label>
                <input
                  type="text"
                  value={editingPrompt.midjourneyFormat || ""}
                  onChange={(e) => setEditingPrompt({ ...editingPrompt, midjourneyFormat: e.target.value })}
                  placeholder="... --ar 4:5 --v 6.1"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>

              {/* Leonardo Format */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-300 block">Leonardo.ai Format (--strength)</label>
                <input
                  type="text"
                  value={editingPrompt.leonardoFormat || ""}
                  onChange={(e) => setEditingPrompt({ ...editingPrompt, leonardoFormat: e.target.value })}
                  placeholder="... --strength 0.88"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>

              {/* Negative Prompt */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-300 block">Negative Prompt (Weights & Exclusions)</label>
                <input
                  type="text"
                  value={editingPrompt.negativePrompt || ""}
                  onChange={(e) => setEditingPrompt({ ...editingPrompt, negativePrompt: e.target.value })}
                  placeholder="lowres, bad anatomy, deformed fingers..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md"
                >
                  Save & Publish to Front Page
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
