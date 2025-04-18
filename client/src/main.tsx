import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializeAnalytics } from "./lib/analytics";
import analytics, { NavigationEvent } from "./lib/analytics";
import sessionTracker from "./lib/sessionTracker";
import { Capacitor } from '@capacitor/core';

// Initialize Firebase Analytics
initializeAnalytics().then(() => {
  // Only log in development mode
  if (import.meta.env.DEV) {
    console.log('Analytics initialized in main.tsx');
  }
  
  // Track app initialization
  analytics.trackNavigation(NavigationEvent.AppOpen, {
    source: 'app_startup',
    timestamp: Date.now()
  });
  
  // Initialize session tracking
  sessionTracker.init();
  
}).catch(error => {
  console.error('Failed to initialize analytics:', error);
});

// Handle mobile app lifecycle events
if (Capacitor.isNativePlatform()) {
  // We'll handle mobile lifecycle events in a safer way
  // that doesn't require the @capacitor/app package
  document.addEventListener('visibilitychange', () => {
    const isActive = document.visibilityState === 'visible';
    
    // Only log in development mode
    if (import.meta.env.DEV) {
      console.log('App state changed. Is active:', isActive);
    }
    // Session tracker already handles visibility changes
  });
}

createRoot(document.getElementById("root")!).render(<App />);
