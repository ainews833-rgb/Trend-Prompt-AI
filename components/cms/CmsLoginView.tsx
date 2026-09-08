"use client";

import React, { useState } from "react";
import { Lock, User, Key, ArrowLeft, ShieldAlert, Sparkles, Check } from "lucide-react";
import { CmsService } from "@/services/cmsService";

interface CmsLoginViewProps {
  onLoginSuccess: () => void;
  onBackToSite: () => void;
  showToast: (type: "success" | "error" | "info", message: string) => void;
}

export function CmsLoginView({
  onLoginSuccess,
  onBackToSite,
  showToast,
}: CmsLoginViewProps) {
  const settings = CmsService.getSettings();
  const [usernameOrEmail, setUsernameOrEmail] = useState<string>(settings.adminEmail || "admin@trendinggeminiprompts.com");
  const [password, setPassword] = useState<string>("admin123");
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    setTimeout(() => {
      const ok = CmsService.loginAdmin(password, usernameOrEmail);
      setIsSubmitting(false);

      if (ok) {
        showToast("success", "Authenticated as Administrator. Welcome back!");
        onLoginSuccess();
      } else {
        setErrorMsg("Invalid username, email, or password. Access denied.");
        showToast("error", "Admin authentication failed.");
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-blue-600 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* WordPress CMS Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white shadow-xl shadow-blue-500/20 border border-blue-400/30">
            <span className="text-2xl font-black tracking-tighter">W</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            WordPress CMS
          </h1>
          <p className="text-xs text-slate-400">
            Trending Photo Prompts Engine — Administrator Gateway
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username or Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Username or Email Address
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="admin@trendinggeminiprompts.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder:text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 block">
                  Password
                </label>
              </div>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder:text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded-md border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500"
                />
                <span>Remember Me</span>
              </label>

              <span className="text-[11px] text-blue-400 hover:underline cursor-pointer">
                Change in Site Settings
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>{isSubmitting ? "Authenticating..." : "Log In to CMS Dashboard"}</span>
            </button>
          </form>

          {/* Discreet Security Note for Admin */}
          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 space-y-1">
            <p className="flex items-center gap-1 text-slate-400 font-medium">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Admin Protected Gateway:</span>
            </p>
            <p>
              Default credentials: <code className="text-blue-300">admin</code> or <code className="text-blue-300">admin@trendinggeminiprompts.com</code> / password: <code className="text-blue-300">admin123</code>.
            </p>
            <p className="text-slate-500">
              You can modify your password, email, and username inside the Site Settings menu once logged in.
            </p>
          </div>
        </div>

        {/* Back to Live Site Button */}
        <div className="text-center">
          <button
            onClick={onBackToSite}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← Back to Live Site</span>
          </button>
        </div>
      </div>
    </div>
  );
}
