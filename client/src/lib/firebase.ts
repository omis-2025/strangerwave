
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, Auth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth: Auth = getAuth(app);
const db = getFirestore(app);

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
