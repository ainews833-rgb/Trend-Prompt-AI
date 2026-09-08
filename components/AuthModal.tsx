import React, { useState, useMemo } from "react";
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Sparkles,
  Check,
} from "lucide-react";
import { Logo } from "./Logo";
import { AuthService } from "@/services/authService";
import { EmailValidationService } from "@/services/emailValidationService";
import { User } from "@/types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  showToast: (type: "success" | "error" | "info", message: string) => void;
}

export function AuthModal({ isOpen, onClose, onSuccess, showToast }: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [fakeEmailGuardEnabled, setFakeEmailGuardEnabled] = useState(true);

  // Google OAuth confirmation states
  const [isGoogleConfirming, setIsGoogleConfirming] = useState(false);
  const [googleAccountEmail, setGoogleAccountEmail] = useState("ainews833@gmail.com");
  const [googleAccountName, setGoogleAccountName] = useState("AI News Creator");
  const [isAuthorizingGoogle, setIsAuthorizingGoogle] = useState(false);

  // Real-time email validation
  const validation = useMemo(() => {
    if (!email.trim()) return null;
    return EmailValidationService.validate(email);
  }, [email]);

  const handleStartGoogleSignIn = () => {
    // Instead of one-click instant sign in, ask for user confirmation first as requested
    setIsGoogleConfirming(true);
  };

  const handleConfirmGoogleSignIn = () => {
    setIsAuthorizingGoogle(true);
    setTimeout(() => {
      try {
        const user = AuthService.signInWithGoogle(googleAccountEmail, googleAccountName);
        onSuccess(user);
        showToast("success", `Authorized and signed in with Google as ${user.email}`);
        setIsGoogleConfirming(false);
        setIsAuthorizingGoogle(false);
        onClose();
      } catch (err: unknown) {
        setIsAuthorizingGoogle(false);
        const msg = err instanceof Error ? err.message : "Google authorization failed.";
        showToast("error", msg);
      }
    }, 700);
  };

  if (!isOpen) return null;

  if (isGoogleConfirming) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
        <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
          {/* Close / Cancel Button */}
          <button
            onClick={() => setIsGoogleConfirming(false)}
            disabled={isAuthorizingGoogle}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Google Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Sign in with Google
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Confirm authorization to continue to <span className="font-semibold text-slate-800 dark:text-slate-200">TrendPrompt AI</span>
            </p>
          </div>

          {/* Account Selection Card */}
          <div className="p-4 rounded-2xl border-2 border-blue-500/50 bg-blue-50/40 dark:bg-blue-950/30 flex items-center gap-3 relative">
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop"
              alt="Google Account"
              className="w-11 h-11 rounded-full object-cover border-2 border-blue-500"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {googleAccountName}
                </p>
                <span className="text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold px-1.5 py-0.2 rounded">
                  Connected
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {googleAccountEmail}
              </p>
            </div>
            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
          </div>

          {/* Permissions & Data Sharing Confirmation Details */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
            <p className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Permissions Requested</span>
            </p>
            <ul className="space-y-1.5 text-slate-600 dark:text-slate-300 pl-1">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>Share your name and profile avatar with TrendPrompt AI</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>Verify and link your Google account ({googleAccountEmail})</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>Persist your custom prompts, favorites, and plan access</span>
              </li>
            </ul>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-200/60 dark:border-slate-700">
              TrendPrompt AI will never post without permission. You can disconnect anytime.
            </p>
          </div>

          {/* Confirm & Cancel Buttons */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              disabled={isAuthorizingGoogle}
              onClick={handleConfirmGoogleSignIn}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isAuthorizingGoogle ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Authorizing with Google...</span>
                </>
              ) : (
                <span>Confirm &amp; Continue as {googleAccountName}</span>
              )}
            </button>

            <button
              type="button"
              disabled={isAuthorizingGoogle}
              onClick={() => setIsGoogleConfirming(false)}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSendOtp = () => {
    if (!email) {
      showToast("error", "Please enter an email address first.");
      return;
    }
    if (fakeEmailGuardEnabled && validation && validation.isFake) {
      showToast("error", `Blocked fake email: ${validation.reason}`);
      return;
    }

    const code = EmailValidationService.requestVerificationCode(email);
    setGeneratedOtp(code);
    setIsVerifyingOtp(true);
    showToast("info", `Verification code sent to ${email} (Simulation: ${code})`);
  };

  const handleVerifyOtpAndFinish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!EmailValidationService.verifyCode(email, otpCode)) {
      showToast("error", "Invalid or expired verification code. Please try again.");
      return;
    }

    try {
      const user = tab === "signup"
        ? AuthService.signUp(name || "Creator", email)
        : AuthService.signIn(email, name);
      onSuccess(user);
      showToast("success", `Email verified successfully! Welcome ${user.name}!`);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed.";
      showToast("error", msg);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast("error", "Please enter an email address.");
      return;
    }

    // Check fake email defense
    if (fakeEmailGuardEnabled && validation && validation.isFake) {
      showToast("error", `Fake Email Detected: ${validation.reason}`);
      return;
    }

    try {
      if (tab === "signup") {
        const user = AuthService.signUp(name || "Creator", email);
        onSuccess(user);
        showToast("success", `Welcome to TrendPrompt AI, ${user.name}!`);
      } else {
        const user = AuthService.signIn(email);
        onSuccess(user);
        showToast("success", `Welcome back, ${user.name}!`);
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed.";
      showToast("error", msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <Logo size="md" className="justify-center" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white pt-2">
            {tab === "login" ? "Sign In to Your Workspace" : "Create Creator Account"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {tab === "login"
              ? "Access your saved prompts, personal identity models, and credits."
              : "Sign up to reverse-engineer visual trends and save prompts."}
          </p>
        </div>

        {/* 1-Click Google Sign In */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleStartGoogleSignIn}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 text-xs font-semibold shadow-xs transition-all active:scale-98 flex items-center justify-center gap-3 cursor-pointer"
          >
            {/* Google Colorful G SVG */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-slate-900 px-3 text-[11px] text-slate-400 uppercase tracking-wider absolute">
              Or with Email
            </span>
          </div>
        </div>

        {/* Tab switcher: Sign In vs Sign Up */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-semibold">
          <button
            onClick={() => {
              setTab("login");
              setIsVerifyingOtp(false);
            }}
            className={`flex-1 py-1.5 rounded-lg transition-colors ${
              tab === "login"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setTab("signup");
              setIsVerifyingOtp(false);
            }}
            className={`flex-1 py-1.5 rounded-lg transition-colors ${
              tab === "signup"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* OTP Code Step if requested */}
        {isVerifyingOtp ? (
          <form onSubmit={handleVerifyOtpAndFinish} className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 space-y-1 text-center">
              <KeyRound className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto" />
              <p className="font-bold text-blue-900 dark:text-blue-200">
                Enter Verification Code
              </p>
              <p className="text-[11px] text-blue-700 dark:text-blue-300">
                We sent a 6-digit code to <strong>{email}</strong> to verify this is a real account.
              </p>
              {generatedOtp && (
                <div className="pt-1">
                  <span className="inline-block px-2.5 py-0.5 rounded bg-blue-200/60 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 text-xs font-mono font-bold">
                    Demo Code: {generatedOtp}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                6-Digit Code
              </label>
              <input
                type="text"
                placeholder="123456"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.trim())}
                className="w-full text-center text-lg tracking-widest font-mono py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsVerifyingOtp(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={otpCode.length < 6}
                className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-1.5"
              >
                <span>Confirm &amp; Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        ) : (
          /* Standard Email Login / Sign Up Form */
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {tab === "signup" && (
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Your Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. Alex Rivera"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                {/* Fake Email Protection Indicator */}
                <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                  <Shield className="w-3 h-3 text-emerald-500" />
                  <span>Fake Email Shield</span>
                </div>
              </div>

              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="you@company.com or you@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-9 pr-9 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 ${
                    validation && validation.isFake
                      ? "border-rose-400 focus:ring-rose-500"
                      : validation && validation.isValid
                      ? "border-emerald-400 focus:ring-emerald-500"
                      : "border-slate-200 dark:border-slate-700 focus:ring-blue-500"
                  }`}
                />
                {/* Validation status icon inside input */}
                {validation && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {validation.isFake ? (
                      <ShieldAlert className="w-4 h-4 text-rose-500" />
                    ) : validation.isValid ? (
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    ) : null}
                  </div>
                )}
              </div>

              {/* Real-Time Live Fake Email Warning / Validation Badge */}
              {validation && (
                <div className="mt-1.5">
                  {validation.isFake ? (
                    <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-[11px] flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                      <div>
                        <p className="font-bold">Fake or Disposable Email Blocked</p>
                        <p className="text-[10px] text-rose-600 dark:text-rose-300 leading-tight mt-0.5">
                          {validation.reason}
                        </p>
                        <p className="text-[10px] text-rose-500 mt-1">
                          Tip: Use your genuine Google, Microsoft, Yahoo, or workplace email.
                        </p>
                      </div>
                    </div>
                  ) : validation.isValid ? (
                    <div className="p-1.5 px-2.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-[11px] flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="font-medium">
                          Verified: {validation.detectedService || "Valid Permanent Domain"}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        {validation.confidenceScore}% Trust
                      </span>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Quick Email Verification Code Option */}
            {tab === "signup" && email && validation && !validation.isFake && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="w-full py-1.5 px-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] font-medium flex items-center justify-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                  <span>Verify with 6-Digit Email Code (Anti-Fake Proof)</span>
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={validation?.isFake === true}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 pt-2 cursor-pointer"
            >
              <span>
                {tab === "login" ? "Sign In to Workspace" : "Create Account & Claim Credits"}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* Security Trust Footer */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Anti-Fake Email Protection</span>
          </div>
          <button
            type="button"
            onClick={() => setFakeEmailGuardEnabled(!fakeEmailGuardEnabled)}
            className="hover:underline text-[10px] text-blue-600 dark:text-blue-400"
          >
            {fakeEmailGuardEnabled ? "Shield: Enabled" : "Shield: Disabled"}
          </button>
        </div>
      </div>
    </div>
  );
}
