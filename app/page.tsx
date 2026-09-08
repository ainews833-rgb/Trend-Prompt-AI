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
import { ToastContainer, ToastMessage } from "@/components/Toast";
import { ActiveTab, GeneratedPromptResult, User } from "@/types";
import { AuthService } from "@/services/authService";
import { CreditService } from "@/services/creditService";

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
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
  const [initialPresetId, setInitialPresetId] = useState<string | null>(null);
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
          onSignOut={handleSignOut}
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
              />
            )}

            {activeTab === "history" && (
              <HistoryView
                onlyFavorites={false}
                onOpenPrompt={handleOpenPrompt}
                onNewPrompt={() => setActiveTab("create")}
                showToast={showToast}
              />
            )}

            {activeTab === "favorites" && (
              <HistoryView
                onlyFavorites={true}
                onOpenPrompt={handleOpenPrompt}
                onNewPrompt={() => setActiveTab("create")}
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

        {/* Global Toast Container */}
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    </div>
  );
}
