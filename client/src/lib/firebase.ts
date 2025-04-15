import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: "000000000000", // Default placeholder, not critical for anonymous auth
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: "G-0000000000" // Default placeholder
};

// Check if Firebase config is properly set
const isConfigValid = import.meta.env.VITE_FIREBASE_API_KEY && 
                       import.meta.env.VITE_FIREBASE_PROJECT_ID && 
                       import.meta.env.VITE_FIREBASE_APP_ID;

if (!isConfigValid) {
  console.error("Firebase configuration is incomplete. Please ensure all required Firebase keys are set.");
}

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
