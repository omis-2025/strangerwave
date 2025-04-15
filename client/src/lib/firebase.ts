import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Debug logging to check environment variables
console.log("Firebase ENV check - API Key exists:", Boolean(import.meta.env.VITE_FIREBASE_API_KEY));
console.log("Firebase ENV check - Project ID exists:", Boolean(import.meta.env.VITE_FIREBASE_PROJECT_ID));
console.log("Firebase ENV check - App ID exists:", Boolean(import.meta.env.VITE_FIREBASE_APP_ID));

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: "123456789012", // Default placeholder for messaging
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Log full config (without sensitive values)
console.log("Firebase Config:", {
  apiKeyExists: Boolean(firebaseConfig.apiKey),
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  appIdExists: Boolean(firebaseConfig.appId)
});

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
