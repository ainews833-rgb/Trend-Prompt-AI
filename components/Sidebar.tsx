import React from "react";
import {
  LayoutDashboard,
  Wand2,
  FolderHeart,
  Bookmark,
  History,
  Sparkles,
  Settings,
  ChevronRight,
  LogOut,
  Zap,
  Menu,
  X,
  CreditCard,
} from "lucide-react";
import { Logo } from "./Logo";
import { ActiveTab, User } from "@/types";

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  user: User;
  onOpenUpgrade: () => void;
  onSignOut: () => void;
  onOpenAuth: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export function Sidebar({
  activeTab,
  setActiveTab,
  user,
  onOpenUpgrade,
  onSignOut,
  onOpenAuth,
  mobileOpen,
  setMobileOpen,
}: SidebarProps) {
  const navItems = [
    {
      id: "dashboard" as ActiveTab,
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "create" as ActiveTab,
      label: "Create Prompt",
      icon: Wand2,
      badge: "Core",
    },
    {
      id: "history" as ActiveTab,
      label: "My Prompts",
      icon: FolderHeart,
      badge: null,
    },
    {
      id: "favorites" as ActiveTab,
      label: "Favorites",
      icon: Bookmark,
      badge: null,
    },
    {
      id: "history" as ActiveTab,
      label: "Prompt History",
      icon: History,
      badge: null,
    },
    {
      id: "pricing" as ActiveTab,
      label: "Upgrade & Plans",
      icon: Sparkles,
      badge: "Pro",
    },
    {
      id: "settings" as ActiveTab,
      label: "Settings",
      icon: Settings,
      badge: null,
    },
  ];

  const creditPercentage = Math.min(100, Math.max(0, (user.creditsRemaining / user.creditsTotal) * 100));

  const content = (
    <div className="flex flex-col h-full justify-between bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 w-64 select-none">
      {/* Top Header & Logo */}
      <div>
        <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={() => {
              setActiveTab("dashboard");
              setMobileOpen(false);
            }}
            className="text-left focus:outline-none flex items-center gap-2"
          >
            <Logo size="md" />
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            // Distinguish between duplicate item targets (e.g. My Prompts vs Prompt History)
            const isSelected =
              activeTab === item.id ||
              (item.label === "My Prompts" && activeTab === "history" && index === 2) ||
              (item.label === "Prompt History" && activeTab === "history" && index === 4);

            return (
              <button
                key={`${item.id}-${index}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isSelected
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-medium"
                    : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/70"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isSelected
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                      item.badge === "Core"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area: Credits, Upgrade, Profile */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        {/* Credits usage card */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 mb-4 border border-slate-200 dark:border-slate-700" suppressHydrationWarning>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Usage
            </span>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400" suppressHydrationWarning>
              {user.creditsRemaining}/{user.creditsTotal} Analysis
            </span>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${creditPercentage}%` }}
            />
          </div>

          <button
            onClick={() => {
              onOpenUpgrade();
              setMobileOpen(false);
            }}
            className="w-full mt-3 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-2 rounded-lg font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs"
          >
            Upgrade to Pro
          </button>
        </div>

        {/* User profile section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 object-cover flex-shrink-0 border border-slate-200 dark:border-slate-700"
            />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate capitalize">
                {user.plan} Plan
              </p>
            </div>
          </div>

          <button
            onClick={onSignOut}
            title="Sign Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block h-screen shrink-0 sticky top-0 z-30">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-slate-900 shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
