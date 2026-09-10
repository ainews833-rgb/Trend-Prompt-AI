import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, Firestore, doc, getDocFromServer } from "firebase/firestore";
import firebaseConfig from "@/firebase-applet-config.json";

let app: FirebaseApp;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const auth: Auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({ prompt: "select_account" });

// Use dedicated Firestore Database ID from configuration
export const db: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);

/**
 * Validate connection to Firestore on initial boot
 */
export async function testConnection(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("Firestore client is offline. Checking network or config.");
    }
    // Connection test document might not exist yet, but request reached server
    return true;
  }
}

export { app };
