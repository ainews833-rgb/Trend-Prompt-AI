import { User } from "@/types";

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
};

export class AuthService {
  private static user: User | null = null;
  private static listeners: Array<(user: User | null) => void> = [];

  public static getCurrentUser(): User {
    return this.getUser();
  }

  public static signUp(name: string, email: string): User {
    return this.signIn(email, name);
  }

  public static updateProfile(updates: { name?: string; email?: string }): User {
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

  public static signIn(email: string, name?: string): User {
    const newUser: User = {
      id: "usr_" + Math.random().toString(36).substring(2, 9),
      name: name || email.split("@")[0],
      email,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
      plan: "free",
      creditsRemaining: 10,
      creditsTotal: 10,
      creditPacks: 0,
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
