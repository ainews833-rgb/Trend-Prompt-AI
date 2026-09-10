import React, { useState } from "react";
import {
  User as UserIcon,
  Shield,
  Zap,
  RotateCcw,
  Trash2,
  Moon,
  Sun,
  Key,
  Check,
  CreditCard,
  Layers,
  Sparkles,
} from "lucide-react";
import { OutputStyle, PromptMode, User } from "@/types";
import { CreditService } from "@/services/creditService";
import { HistoryService } from "@/services/historyService";
import { AuthService } from "@/services/authService";
import { EmailValidationService } from "@/services/emailValidationService";

interface SettingsViewProps {
  user: User;
  setUser: (user: User) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenUpgrade: () => void;
  showToast: (type: "success" | "error" | "info", message: string) => void;
}

export function SettingsView({
  user,
  setUser,
  isDarkMode,
  onToggleTheme,
  onOpenUpgrade,
  showToast,
}: SettingsViewProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [isSaved, setIsSaved] = useState(false);
  const transactions = CreditService.getTransactions().slice(0, 5);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = EmailValidationService.validate(email);
    if (validation.isFake) {
      showToast("error", `Fake Email Blocked: ${validation.reason}`);
      return;
    }

    try {
      const updated = await AuthService.updateProfile({ name, email });
      setUser(updated);
      setIsSaved(true);
      showToast("success", "Profile settings saved.");
      setTimeout(() => setIsSaved(false), 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update profile";
      showToast("error", msg);
    }
  };

  const handleResetCredits = () => {
    CreditService.resetCredits();
    const updated = AuthService.getCurrentUser();
    setUser(updated);
    showToast("info", "Reset credits to 10 for demonstration.");
  };

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear all prompt history?")) {
      HistoryService.clearAll();
      showToast("info", "All prompt history has been cleared.");
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <div className="border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Account &amp; Workspace Settings
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your profile, subscription tier, credit usage, and application preferences.
        </p>
      </div>

      {/* Profile Form */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-blue-600" />
          <span>Profile Information</span>
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="flex items-center gap-4">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-14 h-14 rounded-full object-cover border border-slate-200 dark:border-slate-700"
            />
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                Avatar Image
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Personalized creator avatar
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <Shield className="w-3 h-3" />
                  {user.authProvider === "google" ? "Google Account (Verified)" : "Verified Genuine Email"}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500">Fake Email Guard Active</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
          >
            {isSaved && <Check className="w-3.5 h-3.5 text-emerald-300" />}
            <span>{isSaved ? "Saved!" : "Save Changes"}</span>
          </button>
        </form>
      </div>

      {/* Subscription & Credit Usage */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Credits &amp; Subscription</span>
          </h3>

          <button
            onClick={onOpenUpgrade}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Manage Subscription
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-500 dark:text-slate-400">Current Plan</span>
            <p className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider mt-1">
              {user.plan} Tier
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-500 dark:text-slate-400">Remaining Balance</span>
            <p className="text-base font-bold text-blue-600 dark:text-blue-400 mt-1">
              {user.creditsRemaining} / {user.creditsTotal}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex flex-col justify-between">
            <span className="text-slate-500 dark:text-slate-400">Developer Demo</span>
            <button
              onClick={handleResetCredits}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 mt-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to 10 Credits</span>
            </button>
          </div>
        </div>

        {/* Recent Transaction Activity */}
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Recent Credit Activity
          </h4>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {transactions.map((t) => (
              <div key={t.id} className="py-2 flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-200">
                    {t.description}
                  </p>
                  <span className="text-[11px] text-slate-400" suppressHydrationWarning>
                    {new Date(t.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <span
                  className={`font-semibold ${
                    t.type === "usage" ? "text-rose-500" : "text-emerald-500"
                  }`}
                >
                  {t.type === "usage" ? `-${Math.abs(t.amount)}` : `+${t.amount}`} credit
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Preferences & Theme */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          App Preferences
        </h3>

        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              Color Theme
            </p>
            <p className="text-slate-500">
              Toggle between light and dark interface mode
            </p>
          </div>

          <button
            onClick={onToggleTheme}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
            <span>{isDarkMode ? "Dark Mode" : "Light Mode"}</span>
          </button>
        </div>

        <div className="flex items-center justify-between py-2 text-xs">
          <div>
            <p className="font-semibold text-rose-600 dark:text-rose-400">
              Clear All Prompt History
            </p>
            <p className="text-slate-500">
              Permanently delete all saved and favorited prompt generations
            </p>
          </div>

          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900 hover:bg-rose-100"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>
      </div>
    </div>
  );
}
