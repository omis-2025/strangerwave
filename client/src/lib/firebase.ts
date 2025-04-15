import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration directly from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBhCaneh4UN0p-NB7VLfRqEw7lTlTo4sqk",
  authDomain: "strangerwave-fbed8.firebaseapp.com",
  projectId: "strangerwave-fbed8",
  storageBucket: "strangerwave-fbed8.firebasestorage.app",
  messagingSenderId: "720316631299",
  appId: "1:720316631299:web:e45741afa949a2f8f3c136",
  measurementId: "G-RHHQ0J4QY3"
};

// Log configuration for debugging
console.log("Using Firebase configuration:", {
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  apiKeyExists: Boolean(firebaseConfig.apiKey),
  appIdExists: Boolean(firebaseConfig.appId)
});

// Initialize Firebase
console.log("Initializing Firebase with config");
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize analytics in browser environment only
if (typeof window !== 'undefined') {
  // Dynamically import analytics to avoid server-side issues
  import('firebase/analytics').then((module) => {
    try {
      const { getAnalytics } = module;
      const analytics = getAnalytics(app);
      console.log("Firebase Analytics initialized");
    } catch (analyticsError) {
      console.warn("Firebase Analytics initialization failed:", analyticsError);
    }
  }).catch(err => {
    console.warn("Could not load Firebase Analytics:", err);
  });
}

console.log("Firebase initialized successfully");

// Export the Firebase instances
export { app, auth, db };

// For anonymous sign-in
export const signInAnonymouslyWithFirebase = async (attempt = 1, maxAttempts = 3) => {
  try {
    console.log(`Attempting anonymous sign-in (attempt ${attempt}/${maxAttempts})`);
    const userCredential = await signInAnonymously(auth);
    console.log("Anonymous sign-in successful");
    return userCredential.user;
  } catch (error: any) {
    console.error("Error signing in anonymously:", error);
    
    if (error.code === 'auth/too-many-requests' && attempt < maxAttempts) {
      const backoffTime = Math.min(1000 * Math.pow(2, attempt), 10000); // Max 10 second delay
      console.log(`Backing off for ${backoffTime}ms before retry`);
      await new Promise(resolve => setTimeout(resolve, backoffTime));
      return signInAnonymouslyWithFirebase(attempt + 1, maxAttempts);
    }
    
    throw error;
  }
};

export const isFirebaseConfigured = () => {
  return !!firebaseConfig.apiKey && !!firebaseConfig.projectId && !!firebaseConfig.appId;
};
