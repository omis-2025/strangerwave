import { getAnalytics, logEvent, setUserId, setUserProperties } from "firebase/analytics";
import { getApp } from "firebase/app";
import { Capacitor } from "@capacitor/core";

// Check if we're running in a mobile environment
const isMobile = () => {
  return Capacitor.isNativePlatform();
};

// Get platform
const getPlatform = (): string => {
  if (!Capacitor.isNativePlatform()) return 'web';
  return Capacitor.getPlatform();
};

// Initialize analytics
let analytics: any = null;

export const initializeAnalytics = () => {
  try {
    // Get the Firebase app instance
    const app = getApp();
    
    // Initialize Firebase Analytics
    analytics = getAnalytics(app);
    
    console.log("Firebase Analytics initialized");
    
    // Log initial app_open event
    logAnalyticsEvent('app_open', {
      platform: isMobile() ? 'mobile' : 'web',
      device_type: getPlatform()
    });
    
    return analytics;
  } catch (error) {
    console.error("Failed to initialize Firebase Analytics:", error);
    return null;
  }
};

// Set user ID for analytics
export const setAnalyticsUserId = (userId: string) => {
  if (analytics) {
    setUserId(analytics, userId);
  }
};

// Set user properties for analytics
export const setAnalyticsUserProperties = (properties: Record<string, any>) => {
  if (analytics) {
    setUserProperties(analytics, properties);
  }
};

// Log analytics event
export const logAnalyticsEvent = (eventName: string, eventParams?: Record<string, any>) => {
  if (analytics) {
    logEvent(analytics, eventName, eventParams);
  }
};

// Common analytics events
export const AnalyticsEvents = {
  // User engagement events
  USER_SIGNUP: 'user_signup',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  PROFILE_UPDATE: 'profile_update',
  
  // Chat events
  CHAT_STARTED: 'chat_started',
  CHAT_ENDED: 'chat_ended',
  MESSAGE_SENT: 'message_sent',
  VIDEO_CHAT_STARTED: 'video_chat_started',
  VIDEO_CHAT_ENDED: 'video_chat_ended',
  
  // Matching events
  SEARCH_STARTED: 'search_started',
  MATCH_FOUND: 'match_found',
  MATCH_SKIPPED: 'match_skipped',
  FILTER_APPLIED: 'filter_applied',
  
  // Monetization events
  SUBSCRIPTION_VIEW: 'subscription_view',
  SUBSCRIPTION_START: 'subscription_start',
  PAYMENT_INITIATED: 'payment_initiated',
  PAYMENT_COMPLETED: 'payment_completed',
  PREMIUM_FEATURE_USED: 'premium_feature_used',
  
  // Moderation events
  REPORT_SUBMITTED: 'report_submitted',
  USER_BANNED: 'user_banned',
  CONTENT_FLAGGED: 'content_flagged',
  
  // App performance events
  ERROR_OCCURRED: 'error_occurred',
  NETWORK_ISSUE: 'network_issue',
  APP_CRASH: 'app_crash'
};

// Add screen tracking
export const trackScreen = (screenName: string, screenClass?: string) => {
  if (analytics) {
    logEvent(analytics, 'screen_view', {
      firebase_screen: screenName,
      firebase_screen_class: screenClass || screenName,
    });
  }
};

// Track user engagement time
export const trackEngagementTime = (timeInSeconds: number, activityType: string) => {
  if (analytics) {
    logEvent(analytics, 'user_engagement', {
      engagement_time_msec: timeInSeconds * 1000,
      activity_type: activityType
    });
  }
};

export default {
  initializeAnalytics,
  setAnalyticsUserId,
  setAnalyticsUserProperties,
  logAnalyticsEvent,
  trackScreen,
  trackEngagementTime,
  AnalyticsEvents
};