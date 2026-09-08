"use client";

import React, { useState, useEffect } from "react";
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
import { AuthService } from "@/services/authService";
import { CreditService } from "@/services/creditService";
import { CmsService, CmsPrompt } from "@/services/cmsService";
import { CmsLayout } from "@/components/cms/CmsLayout";
import { CmsLoginView } from "@/components/cms/CmsLoginView";

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("cms-login") === "true" || window.location.hash === "#cms") {
        return CmsService.isAdminAuthenticated() ? "cms" : "cms_login";
      }
    }
    return "dashboard";
  });
  const [user, setUser] = useState<User>(() => AuthService.getCurrentUser());
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("trendprompt_theme") === "dark";
    }
    return false;
  });
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState<boolean>(false);
  const [initialPresetId, setInitialPresetId] = useState<string | null>(null);
  const [initialCmsPrompt, setInitialCmsPrompt] = useState<CmsPrompt | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return CmsService.isAdminAuthenticated();
    }
    return false;
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync user state from services
  const refreshUser = () => {
    setUser(AuthService.getCurrentUser());
  };

  // Sync dark mode class on document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const handleToggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("trendprompt_theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("trendprompt_theme", "light");
      }
      return next;
    });
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
    // Switch to create tab with loaded prompt
    setActiveTab("create");
    // We trigger custom preset loading by providing prompt ID or metadata
    setInitialPresetId(prompt.tags[0] || null);
    showToast("info", `Opened "${prompt.title}" in Studio Workspace`);
  };

  const handleSignOut = () => {
    AuthService.signOut();
    refreshUser();
    showToast("info", "Signed out. Reverted to guest session.");
  };

  const handleUpgradeSuccess = (newPlan: "pro" | "creator") => {
    refreshUser();
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
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("cms-settings-updated", checkAdmin);
      window.removeEventListener("cms-prompts-updated", checkAdmin);
    };
  }, []);

  // CMS Dashboard Full Screen View
  if (activeTab === "cms") {
    return (
      <div className="dark">
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
      <div className="dark">
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
      <div className={isDarkMode ? "dark" : ""}>
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
    <div className={isDarkMode ? "dark" : ""}>
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
                showToast={showToast}
                initialPresetId={initialPresetId}
                onClearInitialPreset={() => setInitialPresetId(null)}
                initialCmsPrompt={initialCmsPrompt}
                onClearInitialCmsPrompt={() => setInitialCmsPrompt(null)}
              />
            )}

            {activeTab === "history" && (
              <HistoryView
                user={user}
                onlyFavorites={false}
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
                showToast={showToast}
                onUpgradeSuccess={handleUpgradeSuccess}
              />
            )}

            {activeTab === "settings" && (
              <SettingsView
                user={user}
                setUser={setUser}
                isDarkMode={isDarkMode}
                onToggleTheme={handleToggleTheme}
                onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
                showToast={showToast}
              />
            )}
          </main>
        </div>

        {/* Upgrade / Pricing Modal */}
        {isUpgradeModalOpen && (
          <PricingView
            user={user}
            isModal={true}
            onClose={() => {
              setIsUpgradeModalOpen(false);
              refreshUser();
            }}
            showToast={showToast}
            onUpgradeSuccess={handleUpgradeSuccess}
          />
        )}

        {/* Modular Auth Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={(u) => {
            setUser(u);
            refreshUser();
          }}
          showToast={showToast}
        />

        {/* Sign Out Confirmation Modal */}
        <SignOutConfirmModal
          isOpen={isSignOutModalOpen}
          onClose={() => setIsSignOutModalOpen(false)}
          onConfirm={handleSignOut}
          user={user}
        />

        {/* Global Toast Container */}
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    </div>
  );
}
