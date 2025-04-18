import { getAnalytics, logEvent, isSupported } from 'firebase/analytics';
import { getApp } from 'firebase/app';

// Function to initialize analytics
export async function initializeAnalytics(): Promise<void> {
  try {
    // Initialize Firebase Analytics if supported
    if (await isSupported()) {
      const app = getApp();
      getAnalytics(app);
      console.log('Firebase Analytics initialized successfully');
    } else {
      console.log('Firebase Analytics not supported in this environment');
    }
  } catch (error) {
    console.error('Error initializing analytics:', error);
  }
}

// Event categories
export enum EventCategory {
  Navigation = 'navigation',
  Session = 'session',
  Chat = 'chat',
  VideoCall = 'video_call',
  Referral = 'referral',
  Rewards = 'rewards',
  Monetization = 'monetization',
  Settings = 'settings',
  Engagement = 'engagement',
  Performance = 'performance',
  Error = 'error'
}

// User navigation & session tracking events
export enum NavigationEvent {
  PageView = 'page_view',
  AppOpen = 'app_open',
  SessionStart = 'session_start',
  SessionEnd = 'session_end',
  SignIn = 'sign_in',
  SignOut = 'sign_out',
}

// Chat/video usage events
export enum ChatEvent {
  StartChat = 'start_chat',
  EndChat = 'end_chat',
  SendMessage = 'send_message',
  ReceiveMessage = 'receive_message',
  NextPartner = 'next_partner',
  ReportUser = 'report_user',
  BlockUser = 'block_user',
  TranslateMessage = 'translate_message',
}

export enum VideoEvent {
  StartVideoCall = 'start_video_call',
  EndVideoCall = 'end_video_call',
  ToggleCamera = 'toggle_camera',
  ToggleMicrophone = 'toggle_microphone',
  SwitchCamera = 'switch_camera',
}

// Referral & rewards system events
export enum ReferralEvent {
  GenerateCode = 'generate_referral_code',
  ShareCode = 'share_referral_code',
  ReferralSignUp = 'referral_signup',
  ReferralConverted = 'referral_converted',
  ViewLeaderboard = 'view_leaderboard',
}

export enum RewardEvent {
  ClaimReward = 'claim_reward',
  AchievementEarned = 'achievement_earned',
  ViewRewards = 'view_rewards',
  StreakUpdated = 'streak_updated',
  TrustLevelIncreased = 'trust_level_increased',
}

// Monetization events
export enum MonetizationEvent {
  ViewSubscriptionPlans = 'view_subscription_plans',
  StartSubscription = 'start_subscription',
  CompleteSubscription = 'complete_subscription',
  CancelSubscription = 'cancel_subscription',
  StartUnban = 'start_unban_payment',
  CompleteUnban = 'complete_unban_payment',
}

// Settings & preferences events
export enum SettingsEvent {
  UpdateLanguage = 'update_language',
  UpdateGenderFilter = 'update_gender_filter',
  UpdateCountryFilter = 'update_country_filter',
  UpdateNotificationSettings = 'update_notification_settings',
  UpdateProfileSettings = 'update_profile_settings',
  EnableTranslation = 'enable_translation',
  DisableTranslation = 'disable_translation',
}

// Parameters interface for type checking
export interface EventParams {
  [key: string]: any;
}

/**
 * Analytics service for tracking user events
 */
class AnalyticsService {
  private static instance: AnalyticsService;
  private analyticsSupported: boolean = false;
  private firebaseAnalytics: any = null;
  
  private constructor() {
    this.initializeAnalytics();
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Initialize analytics providers
   */
  private async initializeAnalytics(): Promise<void> {
    try {
      // Initialize Firebase Analytics if supported
      if (await isSupported()) {
        const app = getApp();
        this.firebaseAnalytics = getAnalytics(app);
        this.analyticsSupported = true;
        console.log('Analytics initialized successfully');
      } else {
        console.log('Firebase Analytics not supported in this environment');
        this.analyticsSupported = false;
      }
    } catch (error) {
      console.error('Error initializing analytics:', error);
      this.analyticsSupported = false;
    }
  }

  /**
   * Track an event with parameters
   * @param eventName The name of the event to track
   * @param params Additional parameters for the event
   */
  public trackEvent(eventName: string, params: EventParams = {}): void {
    if (!this.analyticsSupported) {
      console.log(`[Analytics] Event not tracked (analytics not supported): ${eventName}`, params);
      return;
    }

    try {
      // Firebase Analytics
      if (this.firebaseAnalytics) {
        logEvent(this.firebaseAnalytics, eventName, params);
      }

      // Here we can add other analytics providers like Mixpanel, Amplitude, etc.
      console.log(`[Analytics] Tracked event: ${eventName}`, params);
    } catch (error) {
      console.error(`[Analytics] Error tracking event ${eventName}:`, error);
    }
  }

  /**
   * Track user navigation event
   */
  public trackNavigation(event: NavigationEvent, params: EventParams = {}): void {
    this.trackEvent(event, {
      ...params,
      event_category: EventCategory.Navigation,
    });
  }

  /**
   * Track chat-related event
   */
  public trackChatEvent(event: ChatEvent, params: EventParams = {}): void {
    this.trackEvent(event, {
      ...params,
      event_category: EventCategory.Chat,
    });
  }

  /**
   * Track video call-related event
   */
  public trackVideoEvent(event: VideoEvent, params: EventParams = {}): void {
    this.trackEvent(event, {
      ...params,
      event_category: EventCategory.VideoCall,
    });
  }

  /**
   * Track referral-related event
   */
  public trackReferralEvent(event: ReferralEvent, params: EventParams = {}): void {
    this.trackEvent(event, {
      ...params,
      event_category: EventCategory.Referral,
    });
  }

  /**
   * Track reward-related event
   */
  public trackRewardEvent(event: RewardEvent, params: EventParams = {}): void {
    this.trackEvent(event, {
      ...params,
      event_category: EventCategory.Rewards,
    });
  }

  /**
   * Track monetization-related event
   */
  public trackMonetizationEvent(event: MonetizationEvent, params: EventParams = {}): void {
    this.trackEvent(event, {
      ...params,
      event_category: EventCategory.Monetization,
    });
  }

  /**
   * Track settings-related event
   */
  public trackSettingsEvent(event: SettingsEvent, params: EventParams = {}): void {
    this.trackEvent(event, {
      ...params,
      event_category: EventCategory.Settings,
    });
  }

  /**
   * Track page view
   */
  public trackPageView(pagePath: string, pageTitle: string): void {
    this.trackNavigation(NavigationEvent.PageView, {
      page_path: pagePath,
      page_title: pageTitle,
    });
  }

  /**
   * Track performance metrics
   */
  public trackPerformance(metricName: string, value: number): void {
    this.trackEvent(metricName, {
      event_category: EventCategory.Performance,
      value,
    });
  }

  /**
   * Track error
   */
  public trackError(errorType: string, errorMessage: string, errorContext: EventParams = {}): void {
    this.trackEvent('error', {
      event_category: EventCategory.Error,
      error_type: errorType,
      error_message: errorMessage,
      ...errorContext,
    });
  }
}

// Create singleton instance
const analytics = AnalyticsService.getInstance();

export default analytics;