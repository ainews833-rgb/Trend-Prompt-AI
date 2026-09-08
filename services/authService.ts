import { User } from "@/types";
import { EmailValidationService } from "./emailValidationService";

const AUTH_STORAGE_KEY = "trendprompt_user_session";

export const DEFAULT_USER: User = {
  id: "usr_789412",
  name: "Alex Morgan",
  email: "alex.morgan@creator.io",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
  plan: "free",
  creditsRemaining: 7,
  creditsTotal: 10,
  creditPacks: 0,
  authProvider: "email",
  isEmailVerified: true,
};

export class AuthService {
  private static user: User | null = null;
  private static listeners: Array<(user: User | null) => void> = [];

  public static getCurrentUser(): User {
    return this.getUser();
  }

  public static signUp(name: string, email: string): User {
    const validation = EmailValidationService.validate(email);
    if (!validation.isValid || validation.isFake) {
      throw new Error(validation.reason || "Invalid or disposable email address detected.");
    }
    return this.signIn(email, name, "email");
  }

  public static updateProfile(updates: { name?: string; email?: string }): User {
    if (updates.email) {
      const validation = EmailValidationService.validate(updates.email);
      if (!validation.isValid || validation.isFake) {
        throw new Error(validation.reason || "Invalid or disposable email address detected.");
      }
    }
    return this.updateUser(updates);
  }

  public static getUser(): User {
    if (typeof window === "undefined") {
      return DEFAULT_USER;
    }
    if (!this.user) {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        try {
          this.user = JSON.parse(stored);
        } catch {
          this.user = { ...DEFAULT_USER };
        }
      } else {
        this.user = { ...DEFAULT_USER };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.user));
      }
    }
    return this.user || DEFAULT_USER;
  }

  public static updateUser(updates: Partial<User>): User {
    const current = this.getUser();
    const updated = { ...current, ...updates };
    this.user = updated;
    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
    }
    this.notify();
    return updated;
  }

  public static signIn(email: string, name?: string, provider: "email" | "google" = "email"): User {
    // Check email safety
    const validation = EmailValidationService.validate(email);
    if (!validation.isValid || validation.isFake) {
      throw new Error(validation.reason || "Fake or disposable email addresses are not permitted.");
    }

    const newUser: User = {
      id: "usr_" + Math.random().toString(36).substring(2, 9),
      name: name || email.split("@")[0],
      email,
      avatar:
        provider === "google"
          ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"
          : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
      plan: "free",
      creditsRemaining: 10,
      creditsTotal: 10,
      creditPacks: 0,
      authProvider: provider,
      isEmailVerified: true,
    };
    this.user = newUser;
    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    }
    this.notify();
    return newUser;
  }

  /**
   * One-click Google Login & Sign Up
   */
  public static signInWithGoogle(preferredEmail?: string, preferredName?: string): User {
    const googleEmail = preferredEmail || "ainews833@gmail.com";
    const googleName = preferredName || "Google Creator";

    const newUser: User = {
      id: "usr_g_" + Math.random().toString(36).substring(2, 9),
      name: googleName,
      email: googleEmail,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
      plan: "free",
      creditsRemaining: 10,
      creditsTotal: 10,
      creditPacks: 0,
      authProvider: "google",
      isEmailVerified: true,
    };

    this.user = newUser;
    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    }
    this.notify();
    return newUser;
  }

  public static signOut(): void {
    this.user = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    this.notify();
  }

  public static subscribe(listener: (user: User | null) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private static notify(): void {
    this.listeners.forEach((l) => l(this.user));
  }
}
