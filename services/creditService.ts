import { CreditTransaction } from "@/types";
import { AuthService } from "./authService";

const TRANSACTIONS_KEY = "trendprompt_credit_transactions";

export class CreditService {
  public static getRemainingCredits(): number {
    const user = AuthService.getUser();
    return user.creditsRemaining;
  }

  public static hasCredits(): boolean {
    return this.getRemainingCredits() > 0;
  }

  public static deductCredit(description = "Image Analysis & Prompt Generation"): boolean {
    const user = AuthService.getUser();
    if (user.creditsRemaining <= 0) {
      return false;
    }

    const updatedCredits = user.creditsRemaining - 1;
    AuthService.updateUser({ creditsRemaining: updatedCredits });

    this.logTransaction({
      id: "tx_" + Date.now().toString(36),
      type: "usage",
      amount: -1,
      timestamp: new Date().toISOString(),
      description,
    });

    return true;
  }

  public static updatePlan(plan: "free" | "pro" | "creator"): void {
    const newTotal = plan === "free" ? 10 : 100;
    AuthService.updateUser({
      plan: plan === "creator" ? "pro" : plan,
      creditsRemaining: newTotal,
      creditsTotal: newTotal,
    });

    this.logTransaction({
      id: "tx_" + Date.now().toString(36),
      type: "subscription_refresh",
      amount: newTotal,
      timestamp: new Date().toISOString(),
      description: `Updated to ${plan === "free" ? "Free Plan" : "Pro Plan"} (${newTotal} credits/mo)`,
    });
  }

  public static addCredits(amount: number, label: string): void {
    this.addCreditPack(amount, label);
  }

  public static resetCredits(): void {
    this.resetFreeCredits();
  }

  public static upgradePlan(plan: "pro" | "creator"): void {
    const newTotal = 100;
    AuthService.updateUser({
      plan: "pro",
      creditsRemaining: newTotal,
      creditsTotal: newTotal,
    });

    this.logTransaction({
      id: "tx_" + Date.now().toString(36),
      type: "subscription_refresh",
      amount: newTotal,
      timestamp: new Date().toISOString(),
      description: `Upgraded to Pro Plan (${newTotal} credits/mo)`,
    });
  }

  public static addCreditPack(amount: number, label: string): void {
    const user = AuthService.getUser();
    const updatedCredits = user.creditsRemaining + amount;
    const updatedPacks = user.creditPacks + 1;

    AuthService.updateUser({
      creditsRemaining: updatedCredits,
      creditPacks: updatedPacks,
    });

    this.logTransaction({
      id: "tx_" + Date.now().toString(36),
      type: "purchase",
      amount,
      timestamp: new Date().toISOString(),
      description: `Purchased ${label} (+${amount} credits)`,
    });
  }

  public static resetFreeCredits(): void {
    AuthService.updateUser({
      creditsRemaining: 10,
      creditsTotal: 10,
    });

    this.logTransaction({
      id: "tx_" + Date.now().toString(36),
      type: "subscription_refresh",
      amount: 10,
      timestamp: new Date().toISOString(),
      description: "Reset free trial credits (10 credits)",
    });
  }

  public static getTransactions(): CreditTransaction[] {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(TRANSACTIONS_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  private static logTransaction(tx: CreditTransaction): void {
    if (typeof window === "undefined") return;
    const current = this.getTransactions();
    const updated = [tx, ...current].slice(0, 50);
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updated));
  }
}
