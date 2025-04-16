import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializeAnalytics } from "./lib/analytics";
import { Capacitor } from '@capacitor/core';

// Initialize Firebase Analytics
initializeAnalytics();

// Handle mobile app lifecycle events
if (Capacitor.isNativePlatform()) {
  // We'll handle mobile lifecycle events in a safer way
  // that doesn't require the @capacitor/app package
  document.addEventListener('visibilitychange', () => {
    const isActive = document.visibilityState === 'visible';
    console.log('App state changed. Is active:', isActive);
    // You can log app state changes to analytics here
  });
}

createRoot(document.getElementById("root")!).render(<App />);
