import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Default configuration - in a real app, these would come from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "firebase-api-key-placeholder",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "firebase-project-id-placeholder",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "firebase-app-id-placeholder",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "firebase-project-id-placeholder"}.firebaseapp.com`,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// For anonymous sign-in
export const signInAnonymouslyWithFirebase = async () => {
  try {
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  } catch (error) {
    console.error("Error signing in anonymously:", error);
    throw error;
  }
};

export const isFirebaseConfigured = () => {
  // Check if essential Firebase config values are set
  return (
    import.meta.env.VITE_FIREBASE_API_KEY !== undefined &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID !== undefined &&
    import.meta.env.VITE_FIREBASE_APP_ID !== undefined
  );
};
