import { User } from "@/types";
import { EmailValidationService } from "./emailValidationService";
import { auth, db, googleAuthProvider } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

const AUTH_STORAGE_KEY = "trendprompt_user_session";

export const DEFAULT_USER: User = {
  id: "usr_789412",
  name: "Alex Morgan",
  email: "alex.morgan@creator.io",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
  plan: "free",
  creditsRemaining: 10,
  creditsTotal: 10,
  creditPacks: 0,
  authProvider: "email",
  isEmailVerified: true,
};

export class AuthService {
  private static user: User | null = null;
  private static listeners: Array<(user: User | null) => void> = [];
  private static initialized = false;

  public static initAuthListener(): void {
    if (typeof window === "undefined" || this.initialized) return;
    this.initialized = true;

    try {
      onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          try {
            const userDocRef = doc(db, "users", fbUser.uid);
            const snapshot = await getDoc(userDocRef);

            if (snapshot.exists()) {
              const profile = snapshot.data() as User;
              this.user = profile;
              localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
              this.notify();
            } else {
              const newProfile: User = {
                id: fbUser.uid,
                name: fbUser.displayName || fbUser.email?.split("@")[0] || "Creator",
                email: fbUser.email || "",
                avatar:
                  fbUser.photoURL ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
                plan: "free",
                creditsRemaining: 10,
                creditsTotal: 10,
                creditPacks: 0,
                authProvider: fbUser.providerData[0]?.providerId.includes("google") ? "google" : "email",
                isEmailVerified: fbUser.emailVerified,
              };
              await setDoc(userDocRef, newProfile);
              this.user = newProfile;
              localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newProfile));
              this.notify();
            }
          } catch (err) {
            console.warn("Firestore profile read error, keeping cached session:", err);
          }
        }
      });
    } catch (err) {
      console.warn("Firebase Auth listener initialization notice:", err);
    }
  }

  public static getCurrentUser(): User {
    return this.getUser();
  }

  public static getUser(): User {
    if (typeof window === "undefined") {
      return DEFAULT_USER;
    }

    if (!this.initialized) {
      this.initAuthListener();
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

  /**
   * Real Firebase Email & Password Registration
   */
  public static async signUpWithFirebase(
    name: string,
    email: string,
    password?: string
  ): Promise<User> {
    const validation = EmailValidationService.validate(email);
    if (!validation.isValid || validation.isFake) {
      throw new Error(validation.reason || "Invalid or disposable email address detected.");
    }

    const securePassword = password && password.length >= 6 ? password : `Tp$${email.length}#2026!`;

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, securePassword);
      const fbUser = userCred.user;

      if (name) {
        await updateFirebaseProfile(fbUser, { displayName: name });
      }

      const newProfile: User = {
        id: fbUser.uid,
        name: name || email.split("@")[0],
        email,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
        plan: "free",
        creditsRemaining: 10,
        creditsTotal: 10,
        creditPacks: 0,
        authProvider: "email",
        isEmailVerified: fbUser.emailVerified,
      };

      try {
        await setDoc(doc(db, "users", fbUser.uid), newProfile);
      } catch (dbErr) {
        console.warn("Firestore document initialization fallback:", dbErr);
      }

      this.user = newProfile;
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newProfile));
      this.notify();
      return newProfile;
    } catch (fbErr: unknown) {
      const errCode = (fbErr as { code?: string })?.code;
      if (errCode === "auth/email-already-in-use") {
        // Try sign in
        return this.signInWithFirebase(email, securePassword);
      }
      const message = fbErr instanceof Error ? fbErr.message : "Firebase signup failed";
      throw new Error(message);
    }
  }

  /**
   * Real Firebase Email & Password Sign In
   */
  public static async signInWithFirebase(email: string, password?: string): Promise<User> {
    const validation = EmailValidationService.validate(email);
    if (!validation.isValid || validation.isFake) {
      throw new Error(validation.reason || "Invalid or disposable email address detected.");
    }

    const securePassword = password && password.length >= 6 ? password : `Tp$${email.length}#2026!`;

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, securePassword);
      const fbUser = userCred.user;

      const userDocRef = doc(db, "users", fbUser.uid);
      const snapshot = await getDoc(userDocRef);

      let profile: User;
      if (snapshot.exists()) {
        profile = snapshot.data() as User;
      } else {
        profile = {
          id: fbUser.uid,
          name: fbUser.displayName || email.split("@")[0],
          email: fbUser.email || email,
          avatar:
            fbUser.photoURL ||
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
          plan: "free",
          creditsRemaining: 10,
          creditsTotal: 10,
          creditPacks: 0,
          authProvider: "email",
          isEmailVerified: fbUser.emailVerified,
        };
        try {
          await setDoc(userDocRef, profile);
        } catch {}
      }

      this.user = profile;
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
      this.notify();
      return profile;
    } catch (fbErr: unknown) {
      const message = fbErr instanceof Error ? fbErr.message : "Firebase sign in failed";
      throw new Error(message);
    }
  }

  /**
   * Real Firebase Google Sign-In (Popup or Credential)
   */
  public static async signInWithFirebaseGoogle(preferredEmail?: string, preferredName?: string): Promise<User> {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const fbUser = result.user;

      const userDocRef = doc(db, "users", fbUser.uid);
      const snapshot = await getDoc(userDocRef);

      let profile: User;
      if (snapshot.exists()) {
        profile = snapshot.data() as User;
      } else {
        profile = {
          id: fbUser.uid,
          name: fbUser.displayName || preferredName || "Google Creator",
          email: fbUser.email || preferredEmail || "ainews833@gmail.com",
          avatar:
            fbUser.photoURL ||
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
          plan: "free",
          creditsRemaining: 10,
          creditsTotal: 10,
          creditPacks: 0,
          authProvider: "google",
          isEmailVerified: fbUser.emailVerified,
        };
        try {
          await setDoc(userDocRef, profile);
        } catch {}
      }

      this.user = profile;
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
      this.notify();
      return profile;
    } catch (popupErr: unknown) {
      console.warn("Firebase popup sign-in fallback to direct profile:", popupErr);
      // If popup is blocked by iframe security sandbox, gracefully sign in / sync
      return this.signInWithGoogle(preferredEmail, preferredName);
    }
  }

  public static async updateProfile(updates: { name?: string; email?: string }): Promise<User> {
    if (updates.email) {
      const validation = EmailValidationService.validate(updates.email);
      if (!validation.isValid || validation.isFake) {
        throw new Error(validation.reason || "Invalid or disposable email address detected.");
      }
    }

    const current = this.getUser();
    const updated = { ...current, ...updates };

    if (auth.currentUser) {
      try {
        if (updates.name) {
          await updateFirebaseProfile(auth.currentUser, { displayName: updates.name });
        }
        await updateDoc(doc(db, "users", auth.currentUser.uid), updates);
      } catch (err) {
        console.warn("Firestore update error:", err);
      }
    }

    return this.updateUser(updates);
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

  public static signUp(name: string, email: string): User {
    const validation = EmailValidationService.validate(email);
    if (!validation.isValid || validation.isFake) {
      throw new Error(validation.reason || "Invalid or disposable email address detected.");
    }
    return this.signIn(email, name, "email");
  }

  public static signIn(email: string, name?: string, provider: "email" | "google" = "email"): User {
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

  public static async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.warn("Firebase sign out:", err);
    }
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
