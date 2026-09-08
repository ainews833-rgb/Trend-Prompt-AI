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

        {/* Pro Plan Trigger with Emoji Icon (replaces Credit option, preserves functionality) */}
        <button
          onClick={onOpenUpgrade}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs border ${
            user.plan === "pro" || user.plan === "creator"
              ? "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/50"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-transparent shadow-blue-500/25"
          }`}
          title="Click to view Pro Plan and account upgrades"
        >
          <span className="text-sm leading-none" role="img" aria-label="crown">👑</span>
          <span>Pro</span>
          {user.plan === "pro" || user.plan === "creator" ? (
            <span className="hidden sm:inline text-[10px] font-semibold opacity-80">(Active)</span>
          ) : (
            <span className="hidden sm:inline text-[10px] font-semibold opacity-90 px-1 py-0.2 bg-white/20 rounded">Upgrade</span>
          )}
        </button>

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
