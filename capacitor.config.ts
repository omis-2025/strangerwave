import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.strangerwave.app',
  appName: 'StrangerWave',
  webDir: 'dist/public',
  plugins: {
    // Camera permissions for video chat
    Camera: {
      allowExternalAccess: true,
      permissions: ['camera']
    },
    // Microphone permissions for audio chat
    Microphone: {
      permissions: ['microphone']
    },
    // Push notification configuration
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    // Deep link handling for subscriptions
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#121212",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "large",
      spinnerColor: "#0EA5E9",
      splashFullScreen: true,
      splashImmersive: true
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false
  },
  ios: {
    contentInset: "always",
    backgroundColor: "#121212",
    allowsLinkPreview: false,
    scrollEnabled: true
  },
  server: {
    androidScheme: 'https',
    // For development purposes, use localhost
    // For production, replace with your actual domain
    hostname: process.env.NODE_ENV === 'development' ? 'localhost' : 'app.strangerwave.com',
    cleartext: true, // Allow HTTP for development
    url: process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : undefined
  }
};

export default config;