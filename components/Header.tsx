import React from "react";
import {
  Menu,
  Sun,
  Moon,
  Sparkles,
  Wand2,
  ExternalLink,
  Zap,
  Globe,
  Layout,
} from "lucide-react";
import { ActiveTab, User } from "@/types";

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  user: User;
  onOpenUpgrade: () => void;
  onToggleTheme: () => void;
  isDarkMode: boolean;
  onOpenMobileMenu: () => void;
  onOpenAuth?: () => void;
}

export function Header({
  activeTab,
  setActiveTab,
  user,
  onOpenUpgrade,
  onToggleTheme,
  isDarkMode,
  onOpenMobileMenu,
  onOpenAuth,
}: HeaderProps) {
  const getTabTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return "Dashboard";
      case "create":
        return "Create Prompt Workspace";
      case "history":
        return "My Prompts & History";
      case "favorites":
        return "Favorite Prompts";
      case "pricing":
        return "Plans & Credits";
      case "settings":
        return "Settings & Preferences";
      case "landing":
        return "Product Overview";
      default:
        return "TrendPrompt AI";
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 sticky top-0 z-20 flex items-center justify-between">
      {/* Left section: Mobile menu & current view name */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="text-lg font-bold text-slate-800 dark:text-white">
          {getTabTitle()}
        </h1>
      </div>

      {/* Right section: AI Engine badge, Credits, Quick CTA, Theme toggle, Landing preview toggle */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Sleek Engine Status Badge */}
        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-green-50 dark:bg-emerald-950/60 text-green-700 dark:text-emerald-300 rounded font-medium border border-green-200 dark:border-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-400 animate-pulse" />
          AI Engine Active
        </span>

        {/* Toggle between Studio App and Landing Page view */}
        <button
          onClick={() => setActiveTab(activeTab === "landing" ? "dashboard" : "landing")}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
        >
          {activeTab === "landing" ? (
            <>
              <Layout className="w-3.5 h-3.5 text-blue-600" />
              <span>Back to App</span>
            </>
          ) : (
            <>
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>Landing Page</span>
            </>
          )}
        </button>

        {/* Remaining Credits Badge */}
        <button
          onClick={onOpenUpgrade}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all active:scale-95"
          title="Click to view plans or purchase credits"
        >
          <Zap className="w-3.5 h-3.5 fill-blue-600 text-blue-600 dark:fill-blue-400 dark:text-blue-400" />
          <span>
            {user.creditsRemaining}{" "}
            <span className="hidden sm:inline">credits</span>
          </span>
        </button>

        {/* Quick New Prompt CTA (if not already on create tab) */}
        {activeTab !== "create" && (
          <button
            onClick={() => setActiveTab("create")}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Create Prompt</span>
          </button>
        )}

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Account / Sign In Trigger */}
        {onOpenAuth && (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs font-medium text-slate-700 dark:text-slate-200 cursor-pointer"
            title="Account / Sign In with Email or Google"
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="w-5 h-5 rounded-full object-cover border border-slate-300 dark:border-slate-600"
            />
            <span className="hidden md:inline truncate max-w-[90px]">{user.name.split(" ")[0]}</span>
          </button>
        )}
      </div>
    </header>
  );
}
