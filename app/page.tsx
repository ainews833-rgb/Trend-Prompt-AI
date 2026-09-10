"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { DashboardView } from "@/components/DashboardView";
import { WorkspaceView } from "@/components/WorkspaceView";
import { HistoryView } from "@/components/HistoryView";
import { PricingView } from "@/components/PricingView";
import { SettingsView } from "@/components/SettingsView";
import { LandingView } from "@/components/LandingView";
import { AuthModal } from "@/components/AuthModal";
import { SignOutConfirmModal } from "@/components/SignOutConfirmModal";
import { ToastContainer, ToastMessage } from "@/components/Toast";
import { ActiveTab, GeneratedPromptResult, User } from "@/types";
import { AuthService, DEFAULT_USER } from "@/services/authService";
import { CreditService } from "@/services/creditService";
import { CmsService, CmsPrompt } from "@/services/cmsService";
import { CmsLayout } from "@/components/cms/CmsLayout";
import { CmsLoginView } from "@/components/cms/CmsLoginView";

// Safe External Store for Theme
function subscribeTheme(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener("theme-changed", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("theme-changed", callback);
  };
}

function getThemeSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("trendprompt_theme") === "dark";
}

function getThemeServerSnapshot(): boolean {
  return false;
}

// Safe External Store for User Profile
function subscribeUser(callback: () => void) {
  return AuthService.subscribe(() => callback());
}

function getUserSnapshot(): User {
  return AuthService.getUser();
}

function getUserServerSnapshot(): User {
  return DEFAULT_USER;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState<boolean>(false);
  const [initialPresetId, setInitialPresetId] = useState<string | null>(null);
  const [initialCmsPrompt, setInitialCmsPrompt] = useState<CmsPrompt | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Safe external stores for hydration parity
  const isDarkMode = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getThemeServerSnapshot);
  const user = useSyncExternalStore(subscribeUser, getUserSnapshot, getUserServerSnapshot);

  // Sync dark mode class on document when theme changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const handleToggleTheme = () => {
    const isCurrentlyDark = getThemeSnapshot();
    const nextDark = !isCurrentlyDark;
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("trendprompt_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("trendprompt_theme", "light");
    }
    window.dispatchEvent(new Event("theme-changed"));
  };

  const showToast = (type: "success" | "error" | "info", message: string) => {
    const newToast: ToastMessage = {
      id: "toast_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      type,
      message,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSelectPreset = (presetId: string) => {
    setInitialPresetId(presetId);
    setActiveTab("create");
  };

  const handleOpenPrompt = (prompt: GeneratedPromptResult) => {
    setActiveTab("create");
    setInitialPresetId(prompt.tags[0] || null);
    showToast("info", `Opened "${prompt.title}" in Studio Workspace`);
  };

  const handleSignOut = () => {
    AuthService.signOut();
    showToast("info", "Signed out. Reverted to guest session.");
  };

  const handleUpgradeSuccess = (_newPlan: "pro" | "creator") => {
    AuthService.getUser();
  };

  const handleSelectCmsPrompt = (prompt: CmsPrompt) => {
    setInitialCmsPrompt(prompt);
    setActiveTab("create");
  };

  // Secret shortcut & URL parameter listener for Administrator
  useEffect(() => {
    const checkAdmin = () => {
      setIsAdminLoggedIn(CmsService.isAdminAuthenticated());
    };

    const timer = setTimeout(() => {
      checkAdmin();
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("cms-login") === "true" || window.location.hash === "#cms") {
        setActiveTab(CmsService.isAdminAuthenticated() ? "cms" : "cms_login");
      }
    }, 0);

    window.addEventListener("cms-settings-updated", checkAdmin);
    window.addEventListener("cms-prompts-updated", checkAdmin);

    // Secret Admin Shortcut: Ctrl + Shift + A (or Cmd + Shift + A on Mac)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "a" || e.key === "A")) {
        e.preventDefault();
        if (CmsService.isAdminAuthenticated()) {
          setActiveTab("cms");
        } else {
          setActiveTab("cms_login");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("cms-settings-updated", checkAdmin);
      window.removeEventListener("cms-prompts-updated", checkAdmin);
    };
  }, []);

  // CMS Dashboard Full Screen View
  if (activeTab === "cms") {
    return (
      <div className="dark" suppressHydrationWarning>
        <CmsLayout
          onBackToSite={() => setActiveTab("dashboard")}
          onLogout={() => {
            CmsService.logoutAdmin();
            setIsAdminLoggedIn(false);
            setActiveTab("dashboard");
            showToast("info", "Administrator logged out.");
          }}
          showToast={showToast}
        />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    );
  }

  // CMS Login View
  if (activeTab === "cms_login") {
    return (
      <div className="dark" suppressHydrationWarning>
        <CmsLoginView
          onLoginSuccess={() => {
            setIsAdminLoggedIn(true);
            setActiveTab("cms");
          }}
          onBackToSite={() => setActiveTab("dashboard")}
          showToast={showToast}
        />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    );
  }

  // If user navigated to Landing Page view
  if (activeTab === "landing") {
    return (
      <div className={isDarkMode ? "dark" : ""} suppressHydrationWarning>
        <LandingView
          onStartApp={() => setActiveTab("dashboard")}
          onSelectPreset={(id) => {
            handleSelectPreset(id);
          }}
        />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    );
  }

  return (
    <div className={isDarkMode ? "dark" : ""} suppressHydrationWarning>
      <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans antialiased">
        {/* Persistent Desktop Sidebar & Mobile Drawer */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={user}
          onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
          onSignOut={() => setIsSignOutModalOpen(true)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        {/* Main Content Viewport */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <Header
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            user={user}
            onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
            onToggleTheme={handleToggleTheme}
            isDarkMode={isDarkMode}
            onOpenMobileMenu={() => setMobileOpen(true)}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />

          <main className="flex-1 pb-12">
            {activeTab === "dashboard" && (
              <DashboardView
                user={user}
                setActiveTab={setActiveTab}
                onSelectPreset={handleSelectPreset}
                onSelectCmsPrompt={handleSelectCmsPrompt}
                onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
                showToast={showToast}
              />
            )}

            {activeTab === "create" && (
              <WorkspaceView
                user={user}
                onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
                initialPresetId={initialPresetId}
                initialCmsPrompt={initialCmsPrompt}
                showToast={showToast}
              />
            )}

            {activeTab === "history" && (
              <HistoryView
                user={user}
                onOpenPrompt={handleOpenPrompt}
                onNewPrompt={() => setActiveTab("create")}
                onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
                showToast={showToast}
              />
            )}

            {activeTab === "favorites" && (
              <HistoryView
                user={user}
                onlyFavorites={true}
                onOpenPrompt={handleOpenPrompt}
                onNewPrompt={() => setActiveTab("create")}
                onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
                showToast={showToast}
              />
            )}

            {activeTab === "pricing" && (
              <PricingView
                user={user}
                onUpgradeSuccess={handleUpgradeSuccess}
                showToast={showToast}
              />
            )}

            {activeTab === "settings" && (
              <SettingsView
                user={user}
                setUser={(updated) => {
                  AuthService.updateUser(updated);
                }}
                isDarkMode={isDarkMode}
                onToggleTheme={handleToggleTheme}
                onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
                showToast={showToast}
              />
            )}
          </main>
        </div>
      </div>

      {/* Global Modals */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800">
            <PricingView
              user={user}
              isModal={true}
              onClose={() => setIsUpgradeModalOpen(false)}
              onUpgradeSuccess={handleUpgradeSuccess}
              showToast={showToast}
            />
          </div>
        </div>
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(updatedUser) => {
          showToast("success", `Signed in as ${updatedUser.name}`);
        }}
        showToast={showToast}
      />

      <SignOutConfirmModal
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
        onConfirm={handleSignOut}
        user={user}
      />

      {/* Toast Notifications System */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Secret CMS Trigger for Admin */}
      <div className="fixed bottom-3 right-3 z-40">
        <button
          onClick={() => {
            if (CmsService.isAdminAuthenticated()) {
              setActiveTab("cms");
            } else {
              setActiveTab("cms_login");
            }
          }}
          className="p-2 rounded-full bg-slate-900/40 hover:bg-slate-900/80 text-slate-400 hover:text-white border border-slate-700/50 backdrop-blur-xs transition-all shadow-lg hover:scale-105 cursor-pointer text-xs flex items-center gap-1.5"
          title={isAdminLoggedIn ? "Open Admin CMS (Ctrl+Shift+A)" : "Admin Portal (Ctrl+Shift+A)"}
        >
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[10px] font-mono hidden sm:inline">CMS</span>
        </button>
      </div>
    </div>
  );
}
