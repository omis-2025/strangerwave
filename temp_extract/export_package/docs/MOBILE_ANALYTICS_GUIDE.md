# StrangerWave Mobile Analytics Implementation Guide

This guide outlines the analytics and crash reporting implementation for the StrangerWave mobile apps. Proper analytics are essential for understanding user behavior, fixing issues, and improving engagement.

## Analytics Strategy Overview

StrangerWave uses a multi-layered analytics approach:

1. **User Engagement Metrics** - Track how users interact with the app
2. **Performance Monitoring** - Identify technical issues and optimization opportunities
3. **Conversion Tracking** - Measure premium conversion rates and revenue
4. **Crash Reporting** - Identify and fix stability issues
5. **User Journey Analysis** - Understand the complete user experience

## Firebase Analytics Implementation

Firebase Analytics provides the core analytics platform for StrangerWave mobile apps.

### Setup and Configuration

1. **Installation**

Add the following to your project:

```bash
# Install Firebase Analytics
npm install @capacitor-community/firebase-analytics
```

2. **Initialize Analytics**

```typescript
// client/src/lib/analytics.ts
import { Capacitor } from '@capacitor/core';
import { FirebaseAnalytics } from '@capacitor-community/firebase-analytics';

export class AnalyticsService {
  private static instance: AnalyticsService;
  private isNative = Capacitor.isNativePlatform();
  private initialized = false;
  
  private constructor() {}
  
  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }
  
  /**
   * Initialize Firebase Analytics for all platforms
   */
  public async initialize(): Promise<boolean> {
    try {
      if (this.isNative) {
        // For mobile platforms
        await FirebaseAnalytics.initializeFirebase();
        // Enable collection
        await FirebaseAnalytics.setCollectionEnabled({
          enabled: true
        });
      } else {
        // Web already initialized in main.tsx
      }
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
      return false;
    }
  }
  
  /**
   * Log an event with optional parameters
   */
  public async logEvent(
    name: string, 
    parameters?: Record<string, string | number | boolean>
  ): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      if (this.isNative) {
        await FirebaseAnalytics.logEvent({
          name,
          params: parameters || {}
        });
      } else {
        // Use web implementation
        if (window.gtag) {
          window.gtag('event', name, parameters || {});
        }
      }
    } catch (error) {
      console.error(`Failed to log event ${name}:`, error);
    }
  }
  
  /**
   * Set user properties
   */
  public async setUserProperty(name: string, value: string): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      if (this.isNative) {
        await FirebaseAnalytics.setUserProperty({
          name,
          value
        });
      } else {
        // Web implementation
        if (window.gtag) {
          window.gtag('set', 'user_properties', { [name]: value });
        }
      }
    } catch (error) {
      console.error(`Failed to set user property ${name}:`, error);
    }
  }
  
  /**
   * Set user ID (anonymized)
   */
  public async setUserId(id: string): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      // Hash the user ID for privacy
      const hashedId = `${id.split('').reduce((a, b) => (((a << 5) - a) + b.charCodeAt(0))|0, 0)}`;
      
      if (this.isNative) {
        await FirebaseAnalytics.setUserId({
          userId: hashedId
        });
      } else {
        // Web implementation
        if (window.gtag) {
          window.gtag('set', { 'user_id': hashedId });
        }
      }
    } catch (error) {
      console.error('Failed to set user ID:', error);
    }
  }
}

// Usage example:
// const analytics = AnalyticsService.getInstance();
// analytics.initialize();
// analytics.logEvent('login_success');
```

## Key Events to Track

### User Engagement Events

| Event Name | Parameters | Description |
|------------|------------|-------------|
| `login` | `{ method: string }` | User logged in |
| `registration` | `{ method: string }` | New user registration |
| `chat_started` | `{ match_time: number }` | Chat started with another user |
| `chat_ended` | `{ duration: number }` | Chat ended |
| `message_sent` | `{ chat_id: string }` | Message sent in chat |
| `filter_changed` | `{ filter_type: string, value: string }` | User changed match filters |
| `report_submitted` | `{ reason: string }` | User reported another user |
| `premium_view` | `{ source: string }` | User viewed premium features |

### Revenue Tracking Events

| Event Name | Parameters | Description |
|------------|------------|-------------|
| `subscription_started` | `{ plan: string, price: number, trial: boolean }` | Started subscription |
| `subscription_renewed` | `{ plan: string, price: number }` | Subscription renewed |
| `subscription_cancelled` | `{ plan: string, reason: string }` | Subscription cancelled |
| `item_purchased` | `{ item_id: string, price: number }` | One-time purchase |
| `payment_failed` | `{ error: string, product: string }` | Payment failed |
| `ban_removed` | `{ ban_duration: number, price: number }` | User paid to remove ban |

### User Journey Events

| Event Name | Parameters | Description |
|------------|------------|-------------|
| `onboarding_started` | `{}` | Started onboarding process |
| `onboarding_completed` | `{ time_spent: number }` | Completed onboarding |
| `age_verification` | `{ verified: boolean }` | Age verification result |
| `tutorial_step` | `{ step_id: number, completed: boolean }` | Tutorial step interaction |
| `feature_interaction` | `{ feature_id: string, action: string }` | User interacted with a feature |

## Crash Reporting with Firebase Crashlytics

### 1. Installation

```bash
# Install Crashlytics
npm install @capacitor-community/firebase-crashlytics
```

### 2. Implementation

```typescript
// client/src/lib/crashReporting.ts
import { Capacitor } from '@capacitor/core';
import { FirebaseCrashlytics } from '@capacitor-community/firebase-crashlytics';

export class CrashReportingService {
  private static instance: CrashReportingService;
  private isNative = Capacitor.isNativePlatform();
  private initialized = false;
  
  private constructor() {}
  
  public static getInstance(): CrashReportingService {
    if (!CrashReportingService.instance) {
      CrashReportingService.instance = new CrashReportingService();
    }
    return CrashReportingService.instance;
  }
  
  /**
   * Initialize Crashlytics
   */
  public async initialize(): Promise<boolean> {
    try {
      if (this.isNative) {
        await FirebaseCrashlytics.initialize();
        // Override global error handlers
        this.setupErrorHandlers();
      }
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize crash reporting:', error);
      return false;
    }
  }
  
  /**
   * Set up global error handlers
   */
  private setupErrorHandlers(): void {
    if (!this.isNative) return;
    
    // For React errors
    window.addEventListener('error', (event) => {
      this.recordError(event.error || new Error(event.message), 'window.onerror');
      return false;
    });
    
    // For unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.recordError(event.reason || new Error('Unhandled Promise rejection'), 'unhandledrejection');
      return false;
    });
  }
  
  /**
   * Record an error manually
   */
  public async recordError(error: Error, context?: string): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      if (this.isNative) {
        await FirebaseCrashlytics.recordException({
          message: error.message,
          stacktrace: error.stack || ''
        });
        
        if (context) {
          await FirebaseCrashlytics.setContext({
            key: 'error_context',
            value: context
          });
        }
      } else {
        // Web fallback
        console.error('Error:', error, 'Context:', context);
      }
    } catch (e) {
      console.error('Failed to record error:', e);
    }
  }
  
  /**
   * Set user identifier for crash reports (anonymized)
   */
  public async setUserId(id: string): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      // Hash the user ID for privacy
      const hashedId = `${id.split('').reduce((a, b) => (((a << 5) - a) + b.charCodeAt(0))|0, 0)}`;
      
      if (this.isNative) {
        await FirebaseCrashlytics.setUserId({
          userId: hashedId
        });
      }
    } catch (error) {
      console.error('Failed to set user ID for crash reporting:', error);
    }
  }
  
  /**
   * Add custom log to crash report
   */
  public async log(message: string): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      if (this.isNative) {
        await FirebaseCrashlytics.log({
          message
        });
      }
    } catch (error) {
      console.error('Failed to add log to crash report:', error);
    }
  }
}
```

## Performance Monitoring

### Implementation

```typescript
// client/src/lib/performanceMonitoring.ts
import { Capacitor } from '@capacitor/core';
import { FirebasePerformance } from '@capacitor-community/firebase-performance';

export class PerformanceService {
  private static instance: PerformanceService;
  private isNative = Capacitor.isNativePlatform();
  private initialized = false;
  private activeTraces: Map<string, any> = new Map();
  
  private constructor() {}
  
  public static getInstance(): PerformanceService {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService();
    }
    return PerformanceService.instance;
  }
  
  /**
   * Initialize Performance Monitoring
   */
  public async initialize(): Promise<boolean> {
    try {
      if (this.isNative) {
        await FirebasePerformance.initializeFirebasePerformance();
      }
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize performance monitoring:', error);
      return false;
    }
  }
  
  /**
   * Start tracking a custom trace
   */
  public async startTrace(traceName: string): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      if (this.isNative) {
        await FirebasePerformance.startTrace({ traceName });
        this.activeTraces.set(traceName, Date.now());
      } else {
        // Web fallback using Performance API
        this.activeTraces.set(traceName, performance.now());
      }
    } catch (error) {
      console.error(`Failed to start trace ${traceName}:`, error);
    }
  }
  
  /**
   * Stop tracking a custom trace
   */
  public async stopTrace(traceName: string, attributes?: Record<string, string>): Promise<void> {
    if (!this.initialized || !this.activeTraces.has(traceName)) {
      return;
    }
    
    try {
      if (this.isNative) {
        if (attributes) {
          for (const [key, value] of Object.entries(attributes)) {
            await FirebasePerformance.putTraceAttribute({
              traceName,
              attribute: key,
              value
            });
          }
        }
        
        await FirebasePerformance.stopTrace({ traceName });
      } else {
        // Web fallback
        const startTime = this.activeTraces.get(traceName);
        const duration = performance.now() - startTime;
        console.log(`Trace ${traceName} completed in ${duration}ms`, attributes);
      }
      
      this.activeTraces.delete(traceName);
    } catch (error) {
      console.error(`Failed to stop trace ${traceName}:`, error);
    }
  }
  
  /**
   * Track network request performance
   */
  public trackNetworkRequest(url: string, method: string): Promise<void> {
    // Implementation depends on specific requirements
    const traceName = `network_${method.toLowerCase()}_${url.split('/').pop()}`;
    return this.startTrace(traceName);
  }
}
```

## Integration Into App

### App Initialization

Add analytics initialization to the app startup process:

```typescript
// client/src/App.tsx - within the App component

import { useEffect } from 'react';
import { AnalyticsService } from './lib/analytics';
import { CrashReportingService } from './lib/crashReporting';
import { PerformanceService } from './lib/performanceMonitoring';

function App() {
  useEffect(() => {
    const initServices = async () => {
      // Initialize monitoring services
      const analytics = AnalyticsService.getInstance();
      await analytics.initialize();
      
      const crashReporting = CrashReportingService.getInstance();
      await crashReporting.initialize();
      
      const performance = PerformanceService.getInstance();
      await performance.initialize();
      
      // Log app start event
      analytics.logEvent('app_started', {
        platform: Capacitor.getPlatform()
      });
    };
    
    initServices();
  }, []);
  
  // Rest of the component...
}
```

### User Authentication Integration

```typescript
// In user authentication logic
import { AnalyticsService } from './lib/analytics';
import { CrashReportingService } from './lib/crashReporting';

// After successful login
const onLoginSuccess = async (userId: string) => {
  const analytics = AnalyticsService.getInstance();
  const crashReporting = CrashReportingService.getInstance();
  
  // Set user ID for analytics and crash reporting
  await analytics.setUserId(userId);
  await crashReporting.setUserId(userId);
  
  // Log login event
  await analytics.logEvent('login_success', {
    method: 'firebase'
  });
};
```

### Chat Feature Integration

```typescript
// In chat component/service
import { AnalyticsService } from './lib/analytics';
import { PerformanceService } from './lib/performanceMonitoring';

const startChat = async (partnerId: string) => {
  const performance = PerformanceService.getInstance();
  await performance.startTrace('chat_matching');
  
  // Chat matching logic...
  
  await performance.stopTrace('chat_matching', {
    matching_algorithm: 'v2',
    filters_applied: 'true'
  });
  
  const analytics = AnalyticsService.getInstance();
  await analytics.logEvent('chat_started', {
    match_time: matchTime,
    filters_used: true
  });
};
```

## Best Practices for Mobile Analytics

1. **Respect User Privacy**
   - Always anonymize user identifiers
   - Comply with GDPR, CCPA, and other privacy regulations
   - Provide clear opt-out options
   - Never log personally identifiable information (PII)

2. **Optimize Data Collection**
   - Don't track everything - focus on actionable metrics
   - Batch analytics events when possible
   - Consider battery and network usage impact
   - Test analytics in various network conditions

3. **Error Handling**
   - Ensure analytics failures don't affect the user experience
   - Implement retry logic for failed analytics events
   - Add proper error handling around all analytics calls

4. **Documentation**
   - Maintain a centralized list of all event types and parameters
   - Document the purpose of each event and expected values
   - Ensure consistent naming conventions across events

## Analytics Dashboard Setup

1. **Firebase Analytics Dashboard**
   - Set up custom dashboards for key metrics
   - Create audience segments for targeted analysis
   - Configure alerting for critical metrics

2. **Custom Reports**
   - User retention report
   - Premium conversion funnel
   - Session duration by feature usage
   - Chat satisfaction metrics
   - User journey visualization

## Compliance and Privacy

### 1. Privacy Policy Requirements

Update the privacy policy to include:

- Types of data collected through analytics
- Purpose of collection
- Third-party analytics providers
- User data rights
- Opt-out procedures

### 2. App Store Compliance

- Follow Apple's App Tracking Transparency framework requirements
- Obtain user consent before tracking across apps and websites
- Provide proper usage descriptions for permissions

### 3. User-Facing Controls

Implement a settings screen allowing users to:
- Opt out of analytics collection
- Review their interaction data
- Request data deletion

## Resources

- [Firebase Analytics Documentation](https://firebase.google.com/docs/analytics)
- [Capacitor Firebase Analytics Plugin](https://github.com/capacitor-community/firebase-analytics)
- [Apple App Store Analytics Guidelines](https://developer.apple.com/app-store/user-privacy-and-data-use/)
- [Google Play Developer Policy](https://play.google.com/about/developer-content-policy/)