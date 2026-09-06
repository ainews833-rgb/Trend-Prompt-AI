import React, { useState } from "react";
import {
  Check,
  Zap,
  Sparkles,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  X,
  Layers,
  Crown,
  HelpCircle,
} from "lucide-react";
import { User } from "@/types";
import { CreditService } from "@/services/creditService";

interface PricingViewProps {
  user: User;
  onClose?: () => void;
  isModal?: boolean;
  showToast: (type: "success" | "error" | "info", message: string) => void;
  onUpgradeSuccess: (newPlan: "pro" | "creator") => void;
}

export function PricingView({
  user,
  onClose,
  isModal = false,
  showToast,
  onUpgradeSuccess,
}: PricingViewProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("annually");
  const [simulatingCheckout, setSimulatingCheckout] = useState<string | null>(null);

  const plans = [
    {
      id: "free",
      name: "Free Starter",
      tagline: "Explore visual trends and test AI prompt synthesis.",
      priceMonthly: 0,
      priceAnnually: 0,
      creditsIncluded: "10 free analyses",
      features: [
        "10 Free AI visual trend analyses",
        "Universal & Midjourney prompt export",
        "Standard composition deconstruction",
        "Basic prompt refinement (Shorten)",
        "Prompt history (up to 20 items)",
      ],
      cta: "Current Tier",
      current: user.plan === "free",
      popular: false,
    },
    {
      id: "pro",
      name: "Pro Creator",
      tagline: "For creators recreating trending aesthetics and daily photos.",
      priceMonthly: 19,
      priceAnnually: 15,
      creditsIncluded: "100 credits / month",
      features: [
        "100 AI visual deconstructions per month",
        "All prompt modes (Cinematic, Commercial, Social)",
        "Full 14-dimension structured deconstruction",
        "All export formats (Midjourney v6, Flux, DALL-E)",
        "Personal photo identity-preservation engine",
        "Unlimited saved history & favorites",
        "Priority Gemini Vision processing speed",
      ],
      cta: "Upgrade to Pro",
      current: user.plan === "pro",
      popular: true,
    },
    {
      id: "creator",
      name: "Studio Team",
      tagline: "For professional digital creators, agencies, and studios.",
      priceMonthly: 39,
      priceAnnually: 32,
      creditsIncluded: "350 credits / month",
      features: [
        "350 credits per month + rollover",
        "Commercial rights on all generated prompts",
        "Batch analysis & high-resolution inspection",
        "Custom style presets & team sharing",
        "Direct export & webhooks ready",
        "Dedicated creative prompt engineer support",
      ],
      cta: "Upgrade to Studio",
      current: user.plan === "creator",
      popular: false,
    },
  ];

  const creditPacks = [
    { id: "pack_25", credits: 25, price: 5, label: "+25 Credits" },
    { id: "pack_60", credits: 60, price: 10, label: "+60 Credits", bestValue: true },
    { id: "pack_150", credits: 150, price: 20, label: "+150 Credits" },
  ];

  const handleSelectPlan = (planId: string) => {
    if (planId === user.plan) return;
    setSimulatingCheckout(planId);

    // Modular billing flow: updates local state ready for Stripe webhook
    setTimeout(() => {
      CreditService.updatePlan(planId as "free" | "pro" | "creator");
      onUpgradeSuccess(planId as "pro" | "creator");
      setSimulatingCheckout(null);
      showToast("success", `Plan upgraded to ${planId.toUpperCase()}! Credits updated.`);
      if (onClose) onClose();
    }, 800);
  };

  const handleBuyCreditPack = (credits: number, price: number) => {
    setSimulatingCheckout(`pack_${credits}`);
    setTimeout(() => {
      CreditService.addCredits(credits, `Purchased +${credits} Credit Pack ($${price})`);
      setSimulatingCheckout(null);
      showToast("success", `Added ${credits} credits to your account!`);
      if (onClose) onClose();
    }, 800);
  };

  const content = (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Flexible Plans &amp; Credit Packs</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Choose the Perfect Plan for Recreating Trends
        </h2>

        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Turn any trending visual into your own prompt. Upgrade for unlimited precision, personal photo mapping, and priority vision processing.
        </p>

        {/* Current status banner if limit reached */}
        {user.creditsRemaining <= 0 && (
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-semibold">
            You&apos;ve reached your free limit. Upgrade or add credits to continue turning trending images into detailed AI prompts.
          </div>
        )}

        {/* Billing cycle toggle */}
        <div className="pt-2 flex items-center justify-center gap-3 text-xs font-semibold">
          <span className={billingCycle === "monthly" ? "text-slate-900 dark:text-white" : "text-slate-400"}>
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === "monthly" ? "annually" : "monthly")}
            className="w-12 h-6 rounded-full bg-blue-600 p-1 transition-colors relative"
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                billingCycle === "annually" ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
          <span className={billingCycle === "annually" ? "text-slate-900 dark:text-white flex items-center gap-1" : "text-slate-400"}>
            Annually <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded font-bold">Save 20%</span>
          </span>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const price = billingCycle === "annually" ? plan.priceAnnually : plan.priceMonthly;
          const isSelected = plan.current;

          return (
            <div
              key={plan.id}
              className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between border transition-all relative ${
                plan.popular
                  ? "bg-white dark:bg-slate-900 border-blue-500 shadow-xl ring-2 ring-blue-500/20"
                  : "bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-xs"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm">
                  Most Popular
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-h-[36px]">
                    {plan.tagline}
                  </p>
                </div>

                <div className="flex items-baseline gap-1 pt-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                    ${price}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    / month
                  </span>
                </div>

                <div className="inline-block text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg">
                  {plan.creditsIncluded}
                </div>

                <ul className="space-y-2.5 pt-4 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isSelected || simulatingCheckout !== null}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    isSelected
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-default"
                      : plan.popular
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 active:scale-95"
                      : "bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 active:scale-95"
                  }`}
                >
                  {simulatingCheckout === plan.id ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                      Connecting...
                    </span>
                  ) : isSelected ? (
                    <span>Current Plan</span>
                  ) : (
                    <span>{plan.cta}</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* One-Time Credit Packs (Section 14) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <span>Need More Credits Without a Subscription?</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Instant credit packs that never expire. Use them whenever you need to deconstruct a trend.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {creditPacks.map((pack) => (
            <div
              key={pack.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-sm text-slate-900 dark:text-white block">
                  {pack.label}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  ${pack.price} one-time
                </span>
              </div>

              <button
                onClick={() => handleBuyCreditPack(pack.credits, pack.price)}
                disabled={simulatingCheckout !== null}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs transition-colors"
              >
                Buy Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
        <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          {content}
        </div>
      </div>
    );
  }

  return <div className="p-4 sm:p-6">{content}</div>;
}
