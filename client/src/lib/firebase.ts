import { initializeApp, getApps, getApp } from "firebase/app";
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
let app;
let auth;
let db;

try {
  // Prevent multiple initializations
  if (!getApps().length) {
    console.log("Initializing Firebase with config");
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }

  auth = getAuth(app);
  db = getFirestore(app);

  // Global error handler for auth
  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log('User authenticated:', user.uid);
    }
  }, (error) => {
    console.error('Auth state error:', error);
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
  });

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
} catch (error) {
  console.error("Firebase initialization failed:", error);
}

// Export the Firebase instances
export { app, auth, db };

// For anonymous sign-in
export const signInAnonymouslyWithFirebase = async () => {
  try {
    console.log("Attempting anonymous sign-in");
    const userCredential = await signInAnonymously(auth);
    console.log("Anonymous sign-in successful");
    return userCredential.user;
  } catch (error) {
    console.error("Error signing in anonymously:", error);
    throw error;
  }
};

export const isFirebaseConfigured = () => {
  return !!firebaseConfig.apiKey && !!firebaseConfig.projectId && !!firebaseConfig.appId;
};