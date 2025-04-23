import { 
  users, type User, type InsertUser,
  chatPreferences, type ChatPreferences, type InsertChatPreferences,
  chatSessions, type ChatSession, type InsertChatSession,
  messages, type Message, type InsertMessage,
  reports, type Report, type InsertReport,
  waitingQueue, type WaitingQueue, type InsertWaitingQueue,
  // AI matching imports
  userInteractionMetrics, type UserInteractionMetrics, type InsertUserInteractionMetrics,
  userInterests, type UserInterests, type InsertUserInterests,
  matchingFeedback, type MatchingFeedback, type InsertMatchingFeedback,
  matchingAlgorithmConfig, type MatchingAlgorithmConfig, type InsertMatchingAlgorithmConfig,
  userAlgorithmAssignment, type UserAlgorithmAssignment, type InsertUserAlgorithmAssignment,
  // Achievement and streak system imports
  achievements, type Achievement, type InsertAchievement,
  userAchievements, type UserAchievement, type InsertUserAchievement,
  userStreaks, type UserStreak, type InsertUserStreak,
  // Referral system imports
  referralCodes, type ReferralCode, type InsertReferralCode,
  referrals, type Referral, type InsertReferral,
  referralRewards, type ReferralReward, type InsertReferralReward,
  userReferralRewards, type UserReferralReward, type InsertUserReferralReward,
  // Social sharing imports
  socialShares, type SocialShare, type InsertSocialShare,
  // Creator mode imports
  privateRooms, type PrivateRoom, type InsertPrivateRoom
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, isNull, or, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUid(uid: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  updateStripeCustomerId(id: number, stripeCustomerId: string): Promise<User | undefined>;
  updateUserStripeInfo(id: number, data: {customerId: string, subscriptionId: string}): Promise<User | undefined>;

  // Subscription methods
  activatePremium(userId: number, tier: string, expiryDate: Date): Promise<User | undefined>;
  deactivatePremium(userId: number): Promise<User | undefined>;
  getUserSubscriptionStatus(userId: number): Promise<{isActive: boolean, expiryDate?: Date, tier?: string}>;

  // Chat preferences methods
  getChatPreferences(userId: number): Promise<ChatPreferences | undefined>;
  setChatPreferences(preferences: InsertChatPreferences): Promise<ChatPreferences>;

  // Chat session methods
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  getChatSession(id: number): Promise<ChatSession | undefined>;
  endChatSession(id: number): Promise<ChatSession | undefined>;
  updateChatSession(id: number, updates: Partial<ChatSession>): Promise<ChatSession | undefined>;

  // Messages methods
  createMessage(message: InsertMessage): Promise<Message>;
  getSessionMessages(sessionId: number): Promise<Message[]>;

  // Reports methods
  createReport(report: InsertReport): Promise<Report>;
  getReports(resolved?: boolean): Promise<Report[]>;
  resolveReport(id: number): Promise<Report | undefined>;

  // Waiting queue methods
  addToWaitingQueue(entry: InsertWaitingQueue): Promise<WaitingQueue>;
  removeFromWaitingQueue(userId: number): Promise<void>;
  getMatchingUsers(preferences: { preferredGender?: string, country?: string, preferredTopics?: string[] }): Promise<WaitingQueue[]>;

  // Admin methods
  banUser(id: number): Promise<User | undefined>;
  unbanUser(id: number): Promise<User | undefined>;
  incrementBanCount(userId: number): Promise<User | undefined>;
  getAllUsers(filter?: { isBanned?: boolean }): Promise<User[]>;

  // User Interaction Metrics methods
  getUserInteractionMetrics(userId: number): Promise<UserInteractionMetrics | undefined>;
  createUserInteractionMetrics(metrics: InsertUserInteractionMetrics): Promise<UserInteractionMetrics>;
  updateUserInteractionMetrics(userId: number, updates: Partial<UserInteractionMetrics>): Promise<UserInteractionMetrics | undefined>;

  // User Interests methods
  getUserInterests(userId: number): Promise<UserInterests[]>;
  createUserInterest(interest: InsertUserInterests): Promise<UserInterests>;
  updateUserInterest(id: number, updates: Partial<UserInterests>): Promise<UserInterests | undefined>;
  deleteUserInterest(id: number): Promise<void>;

  // Matching Feedback methods
  createMatchingFeedback(feedback: InsertMatchingFeedback): Promise<MatchingFeedback>;
  getSessionFeedback(sessionId: number): Promise<MatchingFeedback[]>;

  // Matching Algorithm methods
  getMatchingAlgorithmConfig(id: number): Promise<MatchingAlgorithmConfig | undefined>;
  getActiveMatchingAlgorithms(): Promise<MatchingAlgorithmConfig[]>;
  createMatchingAlgorithmConfig(config: InsertMatchingAlgorithmConfig): Promise<MatchingAlgorithmConfig>;
  updateMatchingAlgorithmConfig(id: number, updates: Partial<MatchingAlgorithmConfig>): Promise<MatchingAlgorithmConfig | undefined>;

  // User Algorithm Assignment methods
  getUserAlgorithmAssignment(userId: number): Promise<UserAlgorithmAssignment | undefined>;
  createUserAlgorithmAssignment(assignment: InsertUserAlgorithmAssignment): Promise<UserAlgorithmAssignment>;
  updateUserAlgorithmAssignment(userId: number, algorithmId: number): Promise<UserAlgorithmAssignment | undefined>;

  // Achievement methods
  getAchievement(id: number): Promise<Achievement | undefined>;
  getAllAchievements(): Promise<Achievement[]>;
  getAchievementsByCategory(category: string): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  updateAchievement(id: number, updates: Partial<Achievement>): Promise<Achievement | undefined>;

  // User Achievement methods
  getUserAchievements(userId: number): Promise<UserAchievement[]>;
  getUserAchievement(userId: number, achievementId: number): Promise<UserAchievement | undefined>;
  earnAchievement(userId: number, achievementId: number): Promise<UserAchievement>;
  markAchievementDisplayed(id: number): Promise<UserAchievement | undefined>;
  getUndisplayedAchievements(userId: number): Promise<Array<{ achievement: Achievement, userAchievement: UserAchievement }>>;

  // User Streak methods
  getUserStreak(userId: number, streakType?: string): Promise<UserStreak | undefined | {current: number; longest: number}>;
  getUserStreaks(userId: number): Promise<UserStreak[]>;
  createUserStreak(streak: InsertUserStreak): Promise<UserStreak>;
  updateUserStreak(id: number, updates: Partial<UserStreak>): Promise<UserStreak | undefined>;
  updateLoginStreak(userId: number): Promise<UserStreak>;
  updateChatStreak(userId: number): Promise<UserStreak>;

  // Referral system methods
  getUserReferralCode(userId: number): Promise<ReferralCode | undefined>;
  getReferralCodeByCode(code: string): Promise<ReferralCode | undefined>;
  createReferralCode(code: InsertReferralCode): Promise<ReferralCode>;
  deactivateReferralCode(userId: number): Promise<ReferralCode | undefined>;
  createReferral(referral: InsertReferral): Promise<Referral>;
  getReferralByReferredId(referredId: number): Promise<Referral | undefined>;
  getUserReferrals(referrerId: number): Promise<Referral[]>;
  getQualifiedReferrals(referrerId: number): Promise<Referral[]>;
  getActiveReferralRewards(): Promise<ReferralReward[]>;
  getReferralReward(id: number): Promise<ReferralReward | undefined>;
  getUserReferralReward(userId: number, rewardId: number): Promise<UserReferralReward | undefined>;
  getUserReferralRewards(userId: number): Promise<(UserReferralReward & { reward: ReferralReward })[]>;
  createUserReferralReward(userReward: InsertUserReferralReward): Promise<UserReferralReward>;
  getTopReferrers(limit: number): Promise<Array<{ user: Partial<User>, referralCount: number }>>;

  // Social sharing methods
  createSocialShare(share: InsertSocialShare): Promise<SocialShare>;
  getSocialShare(id: number): Promise<SocialShare | undefined>;
  getUserSocialShares(userId: number): Promise<SocialShare[]>;
  incrementShareClicks(shareId: number): Promise<SocialShare | undefined>;
  incrementShareConversions(shareId: number): Promise<SocialShare | undefined>;

  // Creator mode methods
  getCreators(): Promise<User[]>;
  createPrivateRoom(room: InsertPrivateRoom): Promise<PrivateRoom>;
  getPrivateRoom(id: number): Promise<PrivateRoom | undefined>;
  updatePrivateRoom(id: number, updates: Partial<PrivateRoom>): Promise<PrivateRoom | undefined>;
  getUserPrivateRooms(userId: number): Promise<PrivateRoom[]>;
  getCreatorPrivateRooms(creatorId: number): Promise<PrivateRoom[]>;

  getUserStats(userId: number): Promise<{
    totalChats: number;
    engagementScore: number;
  }>;

  getUserChatHistory(userId: number): Promise<{
    date: string;
    count: number;
  }[]>;

  getUserStreak(userId: number): Promise<{
    current: number;
    longest: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUid(uid: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.uid, uid));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      ...insertUser,
      isAdmin: false,
      isBanned: false,
      lastActive: new Date(),
    }).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...updates, lastActive: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async updateStripeCustomerId(id: number, stripeCustomerId: string): Promise<User | undefined> {
    return this.updateUser(id, { stripeCustomerId });
  }

  async updateUserStripeInfo(id: number, data: {customerId: string, subscriptionId: string}): Promise<User | undefined> {
    return this.updateUser(id, { 
      stripeCustomerId: data.customerId,
      stripeSubscriptionId: data.subscriptionId
    });
  }

  async activatePremium(userId: number, tier: string, expiryDate: Date): Promise<User | undefined> {
    return this.updateUser(userId, {
      isPremium: true,
      premiumTier: tier,
      premiumUntil: expiryDate
    });
  }

  async deactivatePremium(userId: number): Promise<User | undefined> {
    return this.updateUser(userId, {
      isPremium: false,
      premiumUntil: null
    });
  }

  async getUserSubscriptionStatus(userId: number): Promise<{isActive: boolean, expiryDate?: Date, tier?: string}> {
    const user = await this.getUser(userId);

    if (!user) {
      return { isActive: false };
    }

    const isActive = user.isPremium === true && user.premiumUntil && new Date(user.premiumUntil) > new Date();

    return {
      isActive: isActive || false,
      expiryDate: user.premiumUntil || undefined,
      tier: user.premiumTier || undefined
    };
  }

  async incrementBanCount(userId: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;

    const banCount = (user.banCount || 0) + 1;
    return this.updateUser(userId, { banCount });
  }

  // Chat preferences methods
  async getChatPreferences(userId: number): Promise<ChatPreferences | undefined> {
    const [preferences] = await db
      .select()
      .from(chatPreferences)
      .where(eq(chatPreferences.userId, userId));
    return preferences;
  }

  async setChatPreferences(insertPreferences: InsertChatPreferences): Promise<ChatPreferences> {
    // Make sure userId is treated as a number
    const userId = Number(insertPreferences.userId);
    if (isNaN(userId)) {
      throw new Error("Invalid userId in chat preferences");
    }

    // First try to find existing preferences
    const existingPreferences = await this.getChatPreferences(userId);

    if (existingPreferences) {
      // Update existing preferences
      const [updatedPreferences] = await db
        .update(chatPreferences)
        .set(insertPreferences)
        .where(eq(chatPreferences.id, existingPreferences.id))
        .returning();
      return updatedPreferences;
    } else {
      // Create new preferences
      const [newPreferences] = await db
        .insert(chatPreferences)
        .values(insertPreferences)
        .returning();
      return newPreferences;
    }
  }

  // Chat session methods
  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const [session] = await db
      .insert(chatSessions)
      .values({
        ...insertSession,
        startedAt: new Date(),
        active: true
      })
      .returning();
    return session;
  }

  async getChatSession(id: number): Promise<ChatSession | undefined> {
    const [session] = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.id, id));
    return session;
  }

  async endChatSession(id: number): Promise<ChatSession | undefined> {
    const [updatedSession] = await db
      .update(chatSessions)
      .set({
        endedAt: new Date(),
        active: false
      })
      .where(eq(chatSessions.id, id))
      .returning();
    return updatedSession;
  }

  // Messages methods
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async getSessionMessages(sessionId: number): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(eq(messages.sessionId, sessionId))
      .orderBy(messages.createdAt);
  }

  // Reports methods
  async createReport(insertReport: InsertReport): Promise<Report> {
    const [report] = await db
      .insert(reports)
      .values({
        ...insertReport,
        resolved: false
      })
      .returning();
    return report;
  }

  async getReports(resolved?: boolean): Promise<Report[]> {
    if (resolved !== undefined) {
      return db
        .select()
        .from(reports)
        .where(eq(reports.resolved, resolved))
        .orderBy(desc(reports.createdAt));
    }

    return db
      .select()
      .from(reports)
      .orderBy(desc(reports.createdAt));
  }

  async resolveReport(id: number): Promise<Report | undefined> {
    const [updatedReport] = await db
      .update(reports)
      .set({ resolved: true })
      .where(eq(reports.id, id))
      .returning();
    return updatedReport;
  }

  // Waiting queue methods
  async addToWaitingQueue(insertEntry: InsertWaitingQueue): Promise<WaitingQueue> {
    // First, remove any existing entries for this user
    await this.removeFromWaitingQueue(insertEntry.userId);

    // Then add the new entry
    const [entry] = await db
      .insert(waitingQueue)
      .values(insertEntry)
      .returning();
    return entry;
  }

  async removeFromWaitingQueue(userId: number): Promise<void> {
    await db
      .delete(waitingQueue)
      .where(eq(waitingQueue.userId, userId));
  }

  async getMatchingUsers(preferences: { preferredGender?: string, country?: string }): Promise<WaitingQueue[]> {
    // We need to use the 'or' and 'and' operators correctly for complex conditions
    let conditions = [];

    if (preferences.preferredGender && preferences.preferredGender !== 'any') {
      // When user prefers a specific gender, find queue entries that either:
      // 1. Want any gender, or
      // 2. Want the specific gender the user is
      conditions.push(
        or(
          eq(waitingQueue.preferredGender, 'any' as any),
          eq(waitingQueue.preferredGender, preferences.preferredGender as any)
        )
      );
    }

    if (preferences.country) {
      // When user prefers a specific country, find queue entries that either:
      // 1. Have no country preference (null), or
      // 2. Want the specific country the user is from
      conditions.push(
        or(
          isNull(waitingQueue.country),
          eq(waitingQueue.country, preferences.country)
        )
      );
    }

    // If we have conditions, use them, otherwise select all
    if (conditions.length > 0) {
      return db
        .select()
        .from(waitingQueue)
        .where(conditions.length === 1 ? conditions[0] : and(...conditions))
        .orderBy(waitingQueue.joinedAt);
    } else {
      return db
        .select()
        .from(waitingQueue)
        .orderBy(waitingQueue.joinedAt);
    }
  }

  // Admin methods
  async banUser(id: number): Promise<User | undefined> {
    return this.updateUser(id, { isBanned: true });
  }

  async unbanUser(id: number): Promise<User | undefined> {
    return this.updateUser(id, { isBanned: false });
  }

  async getAllUsers(filter?: { isBanned?: boolean }): Promise<User[]> {
    if (filter?.isBanned !== undefined) {
      return db
        .select()
        .from(users)
        .where(eq(users.isBanned, filter.isBanned))
        .orderBy(desc(users.lastActive));
    }

    return db
      .select()
      .from(users)
      .orderBy(desc(users.lastActive));
  }

  // Chat session methods
  async updateChatSession(id: number, updates: Partial<ChatSession>): Promise<ChatSession | undefined> {
    const [updatedSession] = await db
      .update(chatSessions)
      .set(updates)
      .where(eq(chatSessions.id, id))
      .returning();
    return updatedSession;
  }

  // User Interaction Metrics methods
  async getUserInteractionMetrics(userId: number): Promise<UserInteractionMetrics | undefined> {
    const [metrics] = await db
      .select()
      .from(userInteractionMetrics)
      .where(eq(userInteractionMetrics.userId, userId));
    return metrics;
  }

  async createUserInteractionMetrics(metrics: InsertUserInteractionMetrics): Promise<UserInteractionMetrics> {
    const [newMetrics] = await db
      .insert(userInteractionMetrics)
      .values(metrics)
      .returning();
    return newMetrics;
  }

  async updateUserInteractionMetrics(userId: number, updates: Partial<UserInteractionMetrics>): Promise<UserInteractionMetrics | undefined> {
    const [updatedMetrics] = await db
      .update(userInteractionMetrics)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(userInteractionMetrics.userId, userId))
      .returning();
    return updatedMetrics;
  }

  // User Interests methods
  async getUserInterests(userId: number): Promise<UserInterests[]> {
    return db
      .select()
      .from(userInterests)
      .where(eq(userInterests.userId, userId))
      .orderBy(desc(userInterests.weight));
  }

  async createUserInterest(interest: InsertUserInterests): Promise<UserInterests> {
    const [newInterest] = await db
      .insert(userInterests)
      .values(interest)
      .returning();
    return newInterest;
  }

  async updateUserInterest(id: number, updates: Partial<UserInterests>): Promise<UserInterests | undefined> {
    const [updatedInterest] = await db
      .update(userInterests)
      .set(updates)
      .where(eq(userInterests.id, id))
      .returning();
    return updatedInterest;
  }

  async deleteUserInterest(id: number): Promise<void> {
    await db
      .delete(userInterests)
      .where(eq(userInterests.id, id));
  }

  // Matching Feedback methods
  async createMatchingFeedback(feedback: InsertMatchingFeedback): Promise<MatchingFeedback> {
    const [newFeedback] = await db
      .insert(matchingFeedback)
      .values(feedback)
      .returning();
    return newFeedback;
  }

  async getSessionFeedback(sessionId: number): Promise<MatchingFeedback[]> {
    return db
      .select()
      .from(matchingFeedback)
      .where(eq(matchingFeedback.sessionId, sessionId));
  }

  // Matching Algorithm methods
  async getMatchingAlgorithmConfig(id: number): Promise<MatchingAlgorithmConfig | undefined> {
    const [config] = await db
      .select()
      .from(matchingAlgorithmConfig)
      .where(eq(matchingAlgorithmConfig.id, id));
    return config;
  }

  async getActiveMatchingAlgorithms(): Promise<MatchingAlgorithmConfig[]> {
    return db
      .select()
      .from(matchingAlgorithmConfig)
      .where(eq(matchingAlgorithmConfig.isActive, true));
  }

  async createMatchingAlgorithmConfig(config: InsertMatchingAlgorithmConfig): Promise<MatchingAlgorithmConfig> {
    const [newConfig] = await db
      .insert(matchingAlgorithmConfig)
      .values(config)
      .returning();
    return newConfig;
  }

  async updateMatchingAlgorithmConfig(id: number, updates: Partial<MatchingAlgorithmConfig>): Promise<MatchingAlgorithmConfig | undefined> {
    const [updatedConfig] = await db
      .update(matchingAlgorithmConfig)
      .set(updates)
      .where(eq(matchingAlgorithmConfig.id, id))
      .returning();
    return updatedConfig;
  }

  // User Algorithm Assignment methods
  async getUserAlgorithmAssignment(userId: number): Promise<UserAlgorithmAssignment | undefined> {
    const [assignment] = await db
      .select()
      .from(userAlgorithmAssignment)
      .where(eq(userAlgorithmAssignment.userId, userId));
    return assignment;
  }

  async createUserAlgorithmAssignment(assignment: InsertUserAlgorithmAssignment): Promise<UserAlgorithmAssignment> {
    const [newAssignment] = await db
      .insert(userAlgorithmAssignment)
      .values(assignment)
      .returning();
    return newAssignment;
  }

  async updateUserAlgorithmAssignment(userId: number, algorithmId: number): Promise<UserAlgorithmAssignment | undefined> {
    const [updatedAssignment] = await db
      .update(userAlgorithmAssignment)
      .set({
        algorithmId,
        assignedAt: new Date()
      })
      .where(eq(userAlgorithmAssignment.userId, userId))
      .returning();
    return updatedAssignment;
  }

  // Achievement methods
  async getAchievement(id: number): Promise<Achievement | undefined> {
    const [achievement] = await db
      .select()
      .from(achievements)
      .where(eq(achievements.id, id));
    return achievement;
  }

  async getAllAchievements(): Promise<Achievement[]> {
    return db
      .select()
      .from(achievements)
      .orderBy(achievements.id);
  }

  async getAchievementsByCategory(category: string): Promise<Achievement[]> {
    return db
      .select()
      .from(achievements)
      .where(eq(achievements.category, category as any))
      .orderBy(achievements.id);
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const [newAchievement] = await db
      .insert(achievements)
      .values(achievement)
      .returning();
    return newAchievement;
  }

  async updateAchievement(id: number, updates: Partial<Achievement>): Promise<Achievement | undefined> {
    const [updatedAchievement] = await db
      .update(achievements)
      .set(updates)
      .where(eq(achievements.id, id))
      .returning();
    return updatedAchievement;
  }

  // User Achievement methods
  async getUserAchievements(userId: number): Promise<UserAchievement[]> {
    return db
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId))
      .orderBy(desc(userAchievements.earnedAt));
  }

  async getUserAchievement(userId: number, achievementId: number): Promise<UserAchievement | undefined> {
    const [userAchievement] = await db
      .select()
      .from(userAchievements)
      .where(
        and(
          eq(userAchievements.userId, userId),
          eq(userAchievements.achievementId, achievementId)
        )
      );
    return userAchievement;
  }

  async earnAchievement(userId: number, achievementId: number): Promise<UserAchievement> {
    // Check if the user already has this achievement
    const existingAchievement = await this.getUserAchievement(userId, achievementId);

    if (existingAchievement) {
      return existingAchievement; // User already has this achievement
    }

    // Create a new user achievement
    const [newUserAchievement] = await db
      .insert(userAchievements)
      .values({
        userId,
        achievementId,
        displayed: false
      })
      .returning();

    return newUserAchievement;
  }

  async markAchievementDisplayed(id: number): Promise<UserAchievement | undefined> {
    const [updatedUserAchievement] = await db
      .update(userAchievements)
      .set({ displayed: true })
      .where(eq(userAchievements.id, id))
      .returning();
    return updatedUserAchievement;
  }

  async getUndisplayedAchievements(userId: number): Promise<Array<{ achievement: Achievement, userAchievement: UserAchievement }>> {
    // First get all undisplayed user achievements
    const userAchievementsList = await db
      .select()
      .from(userAchievements)
      .where(
        and(
          eq(userAchievements.userId, userId),
          eq(userAchievements.displayed, false)
        )
      );

    // Then get the actual achievement data for each one
    const result = await Promise.all(
      userAchievementsList.map(async (ua) => {
        const achievement = await this.getAchievement(ua.achievementId);
        return {
          achievement: achievement!,
          userAchievement: ua
        };
      })
    );

    return result.filter(item => item.achievement); // Filter out any null achievements
  }

  // User Streak methods
  async getUserStreak(userId: number, streakType?: string): Promise<UserStreak | undefined | {current: number; longest: number}> {
    if (streakType) {
      const [streak] = await db
        .select()
        .from(userStreaks)
        .where(
          and(
            eq(userStreaks.userId, userId),
            eq(userStreaks.streakType, streakType)
          )
        );
      return streak;
    } else {
      const [streak] = await db
        .select()
        .from(userStreaks)
        .where(eq(userStreaks.userId, userId))
        .orderBy(desc(userStreaks.currentStreak))
        .limit(1);

      return {
        current: streak?.currentStreak || 0,
        longest: streak?.longestStreak || 0
      };
    }
  }

  async getUserStreaks(userId: number): Promise<UserStreak[]> {
    return db
      .select()
      .from(userStreaks)
      .where(eq(userStreaks.userId, userId));
  }

  async createUserStreak(streak: InsertUserStreak): Promise<UserStreak> {
    const [newStreak] = await db
      .insert(userStreaks)
      .values(streak)
      .returning();
    return newStreak;
  }

  async updateUserStreak(id: number, updates: Partial<UserStreak>): Promise<UserStreak | undefined> {
    const [updatedStreak] = await db
      .update(userStreaks)
      .set(updates)
      .where(eq(userStreaks.id, id))
      .returning();
    return updatedStreak;
  }

  async updateLoginStreak(userId: number): Promise<UserStreak> {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format

    // Get the existing login streak or create a new one
    let streak = await this.getUserStreak(userId, 'login');

    if (!streak) {
      // Create a new streak
      return this.createUserStreak({
        userId,
        streakType: 'login',
        currentStreak: 1,
        longestStreak: 1,
        lastUpdateDate: today,
        streakStartDate: today,
        protectionUsed: false,
        streakData: {
          history: [{ date: todayStr, count: 1 }],
          milestones: [{ days: 1, achievedAt: todayStr }]
        }
      });
    }

    // Check if the streak was already updated today
    const lastUpdateDateStr = new Date(streak.lastUpdateDate).toISOString().split('T')[0];
    if (lastUpdateDateStr === todayStr) {
      return streak; // Already updated today
    }

    // Calculate the difference in days
    const lastUpdate = new Date(streak.lastUpdateDate);
    const diffTime = Math.abs(today.getTime() - lastUpdate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    let newCurrentStreak: number;
    let newLongestStreak: number = streak.longestStreak;
    let protectionUsed: boolean = streak.protectionUsed;
    let streakStartDate: Date | null = streak.streakStartDate;

    if (diffDays === 1) {
      // Consecutive day
      newCurrentStreak = streak.currentStreak + 1;
      if (newCurrentStreak > streak.longestStreak) {
        newLongestStreak = newCurrentStreak;
      }
    } else if (diffDays === 2 && !streak.protectionUsed) {
      // Missed one day but can use streak protection
      newCurrentStreak = streak.currentStreak + 1;
      protectionUsed = true;
      if (newCurrentStreak > streak.longestStreak) {
        newLongestStreak = newCurrentStreak;
      }
    } else {
      // Streak broken
      newCurrentStreak = 1;
      protectionUsed = false;
      streakStartDate = today;
    }

    // Update streak history
    const history = streak.streakData?.history || [];
    const milestones = streak.streakData?.milestones || [];

    history.push({ date: todayStr, count: newCurrentStreak });

    // Add milestone if it's a significant number
    if ([3, 7, 14, 21, 30, 60, 90, 180, 365].includes(newCurrentStreak)) {
      milestones.push({ days: newCurrentStreak, achievedAt: todayStr });
    }

    // Update the streak
    const updatedStreak = await this.updateUserStreak(streak.id, {
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      lastUpdateDate: today,
      streakStartDate,
      protectionUsed,
      streakData: {
        history,
        milestones
      }
    });

    return updatedStreak!;
  }

  async updateChatStreak(userId: number): Promise<UserStreak> {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format

    // Get the existing chat streak or create a new one
    let streak = await this.getUserStreak(userId, 'chat');

    if (!streak) {
      // Create a new streak
      return this.createUserStreak({
        userId,
        streakType: 'chat',
        currentStreak: 1,
        longestStreak: 1,
        lastUpdateDate: today,
        streakStartDate: today,
        protectionUsed: false,
        streakData: {
          history: [{ date: todayStr, count: 1 }],
          milestones: [{ days: 1, achievedAt: todayStr }]
        }
      });
    }

    // Check if the streak was already updated today
    const lastUpdateDateStr = new Date(streak.lastUpdateDate).toISOString().split('T')[0];
    if (lastUpdateDateStr === todayStr) {
      return streak; // Already updated today
    }

    // The logic for chat streaks is the same as login streaks
    // Calculate the difference in days
    const lastUpdate = new Date(streak.lastUpdateDate);
    const diffTime = Math.abs(today.getTime() - lastUpdate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    let newCurrentStreak: number;
    let newLongestStreak: number = streak.longestStreak;
    let protectionUsed: boolean = streak.protectionUsed;
    let streakStartDate: Date | null = streak.streakStartDate;

    if (diffDays === 1) {
      // Consecutive day
      newCurrentStreak = streak.currentStreak + 1;
      if (newCurrentStreak > streak.longestStreak) {
        newLongestStreak = newCurrentStreak;
      }
    } else ifif (diffDays === 2 && !streak.protectionUsed) {
      // Missed one day but can use streak protection
      newCurrentStreak = streak.currentStreak + 1;
      protectionUsed = true;
      if (newCurrentStreak > streak.longestStreak) {
        newLongestStreak = newCurrentStreak;
      }
    } else {
      // Streak broken
      newCurrentStreak = 1;
      protectionUsed = false;
      streakStartDate = today;
    }

    // Update streak history
    const history = streak.streakData?.history || [];
    const milestones = streak.streakData?.milestones || [];

    history.push({ date: todayStr, count: newCurrentStreak });

    // Add milestone if it's a significant number
    if ([3, 7, 14, 21, 30, 60, 90, 180, 365].includes(newCurrentStreak)) {
      milestones.push({ days: newCurrentStreak, achievedAt: todayStr });
    }

    // Update the streak
    const updatedStreak = await this.updateUserStreak(streak.id, {
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      lastUpdateDate: today,
      streakStartDate,
      protectionUsed,
      streakData: {
        history,
        milestones
      }
    });

    return updatedStreak!;
  }

  // Referral system methods
  async getUserReferralCode(userId: number): Promise<ReferralCode | undefined> {
    const [code] = await db
      .select()
      .from(referralCodes)
      .where(and(
        eq(referralCodes.userId, userId),
        eq(referralCodes.isActive, true)
      ));
    return code;
  }

  async getReferralCodeByCode(code: string): Promise<ReferralCode | undefined> {
    const [referralCode] = await db
      .select()
      .from(referralCodes)
      .where(eq(referralCodes.code, code));
    return referralCode;
  }

  async createReferralCode(insertCode: InsertReferralCode): Promise<ReferralCode> {
    const [code] = await db
      .insert(referralCodes)
      .values({
        ...insertCode,
        createdAt: new Date()
      })
      .returning();
    return code;
  }

  async deactivateReferralCode(userId: number): Promise<ReferralCode | undefined> {
    const [updatedCode] = await db
      .update(referralCodes)
      .set({ isActive: false })
      .where(and(
        eq(referralCodes.userId, userId),
        eq(referralCodes.isActive, true)
      ))
      .returning();
    return updatedCode;
  }

  async createReferral(insertReferral: InsertReferral): Promise<Referral> {
    const [referral] = await db
      .insert(referrals)
      .values({
        ...insertReferral,
        createdAt: new Date()
      })
      .returning();
    return referral;
  }

  async getReferralByReferredId(referredId: number): Promise<Referral | undefined> {
    const [referral] = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referredId, referredId));
    return referral;
  }

  async getUserReferrals(referrerId: number): Promise<Referral[]> {
    return db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, referrerId))
      .orderBy(desc(referrals.createdAt));
  }

  async getQualifiedReferrals(referrerId: number): Promise<Referral[]> {
    // Qualified referrals are those that led to premium subscriptions or other conversion events
    return db
      .select()
      .from(referrals)
      .where(and(
        eq(referrals.referrerId, referrerId),
        eq(referrals.status, 'converted')
      ));
  }

  async getActiveReferralRewards(): Promise<ReferralReward[]> {
    return db
      .select()
      .from(referralRewards)
      .where(eq(referralRewards.isActive, true))
      .orderBy(referralRewards.requiredReferrals);
  }

  async getReferralReward(id: number): Promise<ReferralReward | undefined> {
    const [reward] = await db
      .select()
      .from(referralRewards)
      .where(eq(referralRewards.id, id));
    return reward;
  }

  async getUserReferralReward(userId: number, rewardId: number): Promise<UserReferralReward | undefined> {
    const [userReward] = await db
      .select()
      .from(userReferralRewards)
      .where(and(
        eq(userReferralRewards.userId, userId),
        eq(userReferralRewards.rewardId, rewardId)
      ));
    return userReward;
  }

  async getUserReferralRewards(userId: number): Promise<(UserReferralReward & { reward: ReferralReward })[]> {
    const userRewards = await db
      .select({
        userReward: userReferralRewards,
        reward: referralRewards
      })
      .from(userReferralRewards)
      .innerJoin(
        referralRewards,
        eq(userReferralRewards.rewardId, referralRewards.id)
      )
      .where(eq(userReferralRewards.userId, userId));

    return userRewards.map(({ userReward, reward }) => ({
      ...userReward,
      reward
    }));
  }

  async createUserReferralReward(insertUserReward: InsertUserReferralReward): Promise<UserReferralReward> {
    const [userReward] = await db
      .insert(userReferralRewards)
      .values(insertUserReward)
      .returning();
    return userReward;
  }

  async getTopReferrers(limit: number): Promise<Array<{ user: Partial<User>, referralCount: number }>> {
    // Get users with the highest referral counts
    const topUsers = await db
      .select({
        user: users,
        referralCount: referrals.referrerId.count().as('referral_count')
      })
      .from(users)
      .leftJoin(
        referrals,
        eq(users.id, referrals.referrerId)
      )
      .groupBy(users.id)
      .orderBy(desc(sql`referral_count`))
      .limit(limit);

    return topUsers.map(({ user, referralCount }) => ({
      user: {
        id: user.id,
        username: user.username,
        avatar: user.avatar
      },
      referralCount: Number(referralCount) || 0
    }));
  }

  // Social sharing methods
  async createSocialShare(insertShare: InsertSocialShare): Promise<SocialShare> {
    const [share] = await db
      .insert(socialShares)
      .values({
        ...insertShare,
        clicks: 0,
        conversions: 0,
        createdAt: new Date()
      })
      .returning();
    return share;
  }

  async getSocialShare(id: number): Promise<SocialShare | undefined> {
    const [share] = await db
      .select()
      .from(socialShares)
      .where(eq(socialShares.id, id));
    return share;
  }

  async getUserSocialShares(userId: number): Promise<SocialShare[]> {
    return db
      .select()
      .from(socialShares)
      .where(eq(socialShares.userId, userId))
      .orderBy(desc(socialShares.createdAt));
  }

  async incrementShareClicks(shareId: number): Promise<SocialShare | undefined> {
    const share = await this.getSocialShare(shareId);
    if (!share) return undefined;

    const [updatedShare] = await db
      .update(socialShares)
      .set({ clicks: (share.clicks || 0) + 1 })
      .where(eq(socialShares.id, shareId))
      .returning();
    return updatedShare;
  }

  async incrementShareConversions(shareId: number): Promise<SocialShare | undefined> {
    const share = await this.getSocialShare(shareId);
    if (!share) return undefined;

    const [updatedShare] = await db
      .update(socialShares)
      .set({ conversions: (share.conversions || 0) + 1 })
      .where(eq(socialShares.id, shareId))
      .returning();
    return updatedShare;
  }

  // Creator mode methods
  async getCreators(): Promise<User[]> {
    return db
      .select()
      .from(users)
      .where(eq(users.isCreator, true))
      .orderBy(desc(users.lastActive));
  }

  async createPrivateRoom(insertRoom: InsertPrivateRoom): Promise<PrivateRoom> {
    const [room] = await db
      .insert(privateRooms)
      .values({
        ...insertRoom,
        requestedAt: new Date(),
        tokensSpent: 0,
        minutesActive: 0
      })
      .returning();
    return room;
  }

  async getPrivateRoom(id: number): Promise<PrivateRoom | undefined> {
    const [room] = await db
      .select()
      .from(privateRooms)
      .where(eq(privateRooms.id, id));
    return room;
  }

  async updatePrivateRoom(id: number, updates: Partial<PrivateRoom>): Promise<PrivateRoom | undefined> {
    const [updatedRoom] = await db
      .update(privateRooms)
      .set(updates)
      .where(eq(privateRooms.id, id))
      .returning();
    return updatedRoom;
  }

  async getUserPrivateRooms(userId: number): Promise<PrivateRoom[]> {
    return db
      .select()
      .from(privateRooms)
      .where(eq(privateRooms.userId, userId))
      .orderBy(desc(privateRooms.requestedAt));
  }

  async getCreatorPrivateRooms(creatorId: number): Promise<PrivateRoom[]> {
    return db
      .select()
      .from(privateRooms)
      .where(eq(privateRooms.creatorId, creatorId))
      .orderBy(desc(privateRooms.requestedAt));
  }

  async getUserStats(userId: number): Promise<{ totalChats: number; engagementScore: number; }> {
    //Implementation for getUserStats would go here.  This is a placeholder.
    return { totalChats: 0, engagementScore: 0 };
  }

  async getUserChatHistory(userId: number): Promise<{ date: string; count: number; }[]> {
    //Implementation for getUserChatHistory would go here. This is a placeholder.
    return [];
  }

  async getUserStreak(userId: number): Promise<{ current: number; longest: number; }> {
    //Implementation for getUserStreak would go here. This is a placeholder.
    return { current: 0, longest: 0 };
  }
}

export const storage = new DatabaseStorage();