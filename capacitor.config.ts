import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.strangerwave.app',
  appName: 'StrangerWave',
  webDir: 'build',
  bundledWebRuntime: false,
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
    scrollEnabled: true,
    webViewDecelerationSpeed: "normal"
  },
  server: {
    androidScheme: 'https',
    hostname: 'app.strangerwave.com',
    cleartext: false
  }
};

export default config;