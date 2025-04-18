import analytics, { SessionEvent } from './analytics';

interface SessionData {
  startTime: number;
  lastActivityTime: number;
  active: boolean;
  type: string;
  metadata: Record<string, any>;
}

/**
 * SessionTracker utility class to track user session duration and activity
 */
class SessionTracker {
  private static instance: SessionTracker;
  private sessions: Map<string, SessionData> = new Map();
  private readonly INACTIVITY_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes in milliseconds
  private inactivityTimer: ReturnType<typeof setTimeout> | null = null;
  private trackerInitialized = false;

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  public static getInstance(): SessionTracker {
    if (!SessionTracker.instance) {
      SessionTracker.instance = new SessionTracker();
    }
    return SessionTracker.instance;
  }

  /**
   * Initialize session tracking
   */
  public init(): void {
    if (this.trackerInitialized) return;
    
    // Set up listeners for page visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    // Set up beforeunload event to track session end
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    
    // Track user activity
    document.addEventListener('mousemove', this.handleUserActivity.bind(this));
    document.addEventListener('keydown', this.handleUserActivity.bind(this));
    document.addEventListener('touchstart', this.handleUserActivity.bind(this));
    document.addEventListener('click', this.handleUserActivity.bind(this));
    
    // Start inactivity detection
    this.startInactivityDetection();
    
    // Start app session
    this.startSession('app', {});
    
    this.trackerInitialized = true;
  }

  /**
   * Start a new session or update an existing one
   * @param sessionType Type of session (e.g., 'app', 'chat', 'video')
   * @param metadata Additional data to associate with the session
   * @returns Session ID
   */
  public startSession(sessionType: string, metadata: Record<string, any> = {}): string {
    const sessionId = `${sessionType}_${Date.now()}`;
    const now = Date.now();
    
    this.sessions.set(sessionId, {
      startTime: now,
      lastActivityTime: now,
      active: true,
      type: sessionType,
      metadata
    });
    
    // Track session start event
    analytics.trackSession(SessionEvent.Start, {
      session_id: sessionId,
      session_type: sessionType,
      ...metadata
    });
    
    return sessionId;
  }

  /**
   * End a session and track its duration
   * @param sessionId ID of the session to end
   * @param additionalData Additional data to include in the analytics event
   */
  public endSession(sessionId: string, additionalData: Record<string, any> = {}): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    
    const endTime = Date.now();
    const durationMs = endTime - session.startTime;
    const durationSeconds = Math.round(durationMs / 1000);
    
    // Track session end and duration
    analytics.trackSession(SessionEvent.End, {
      session_id: sessionId,
      session_type: session.type,
      ...session.metadata,
      ...additionalData
    });
    
    analytics.trackSessionDuration(durationSeconds, session.type, {
      session_id: sessionId,
      ...session.metadata,
      ...additionalData
    });
    
    // Remove the session
    this.sessions.delete(sessionId);
  }

  /**
   * Update session metadata
   * @param sessionId ID of the session to update
   * @param metadata Metadata to merge with existing session metadata
   */
  public updateSessionMetadata(sessionId: string, metadata: Record<string, any>): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    
    this.sessions.set(sessionId, {
      ...session,
      metadata: {
        ...session.metadata,
        ...metadata
      }
    });
  }

  /**
   * Handle visibility change (app going to background/foreground)
   */
  private handleVisibilityChange(): void {
    const isVisible = document.visibilityState === 'visible';
    
    // Update all active sessions
    this.sessions.forEach((session, sessionId) => {
      if (session.active) {
        if (isVisible) {
          // App came to foreground
          analytics.trackSession(SessionEvent.Foreground, {
            session_id: sessionId,
            session_type: session.type
          });
        } else {
          // App went to background
          analytics.trackSession(SessionEvent.Background, {
            session_id: sessionId,
            session_type: session.type
          });
        }
      }
    });
  }

  /**
   * Handle before unload (when the user closes the page)
   */
  private handleBeforeUnload(): void {
    // End all active sessions
    this.sessions.forEach((session, sessionId) => {
      if (session.active) {
        this.endSession(sessionId, { end_reason: 'page_close' });
      }
    });
  }

  /**
   * Handle user activity (to track inactivity)
   */
  private handleUserActivity(): void {
    const now = Date.now();
    
    // Update all active sessions
    this.sessions.forEach((session, sessionId) => {
      if (session.active) {
        // If the user was inactive and is now active again
        if (now - session.lastActivityTime > this.INACTIVITY_THRESHOLD_MS) {
          analytics.trackSession(SessionEvent.ActivityResumed, {
            session_id: sessionId,
            session_type: session.type,
            inactive_time_seconds: Math.round((now - session.lastActivityTime) / 1000)
          });
        }
        
        // Update last activity time
        this.sessions.set(sessionId, {
          ...session,
          lastActivityTime: now
        });
      }
    });
    
    // Reset inactivity timer
    this.resetInactivityTimer();
  }

  /**
   * Start inactivity detection
   */
  private startInactivityDetection(): void {
    this.resetInactivityTimer();
  }

  /**
   * Reset inactivity timer
   */
  private resetInactivityTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }
    
    this.inactivityTimer = setTimeout(() => {
      this.handleInactivity();
    }, this.INACTIVITY_THRESHOLD_MS);
  }

  /**
   * Handle user inactivity
   */
  private handleInactivity(): void {
    const now = Date.now();
    
    // Track inactivity for all active sessions
    this.sessions.forEach((session, sessionId) => {
      if (session.active) {
        const inactiveTime = now - session.lastActivityTime;
        
        if (inactiveTime >= this.INACTIVITY_THRESHOLD_MS) {
          analytics.trackSession(SessionEvent.InactivityDetected, {
            session_id: sessionId,
            session_type: session.type,
            inactive_time_seconds: Math.round(inactiveTime / 1000)
          });
        }
      }
    });
  }
}

// Create and export singleton instance
const sessionTracker = SessionTracker.getInstance();
export default sessionTracker;