# Streak Rewards & Milestone Badges System

This document outlines the implementation plan for the gamification features in StrangerWave, including user streaks, achievements, and milestone badges.

## 1. Schema Updates for Drizzle ORM

Here are the schema extensions for the gamification features:

```typescript
// Additional imports needed in shared/schema.ts
import { pgTable, text, serial, integer, boolean, timestamp, date, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define the categories for achievements
export const achievementCategoryEnum = pgEnum('achievement_category', [
  'streak', 'milestone', 'quality', 'special'
]);

// New tables for gamification features

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: achievementCategoryEnum("category").notNull(),
  iconUrl: text("icon_url"),
  points: integer("points").default(0).notNull(),
  requirements: jsonb("requirements").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  achievementId: integer("achievement_id").references(() => achievements.id).notNull(),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
  displayed: boolean("displayed").default(false).notNull(),
});

export const userStreaks = pgTable("user_streaks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  currentLoginStreak: integer("current_login_streak").default(0).notNull(),
  longestLoginStreak: integer("longest_login_streak").default(0).notNull(),
  currentChatStreak: integer("current_chat_streak").default(0).notNull(),
  longestChatStreak: integer("longest_chat_streak").default(0).notNull(),
  lastLoginDate: date("last_login_date").defaultNow().notNull(),
  streakUpdatedAt: timestamp("streak_updated_at").defaultNow().notNull(),
});

// Create insert schemas
export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  createdAt: true
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  earnedAt: true
});

export const insertUserStreaksSchema = createInsertSchema(userStreaks).omit({
  id: true,
  streakUpdatedAt: true
});

// Export types
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievements.$inferSelect;

export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;

export type InsertUserStreaks = z.infer<typeof insertUserStreaksSchema>;
export type UserStreaks = typeof userStreaks.$inferSelect;

// Users table updates - this would be done via migration
// Additional fields needed:
// - achievementPoints: integer
// - totalAchievementCount: integer
```

## 2. Achievement System Implementation

### 2.1 Achievement Types and Definitions

First, we'll define various achievement types and their requirements:

```typescript
// server/achievements/types.ts

export interface AchievementRequirement {
  type: string;
  threshold: number;
  additionalParams?: Record<string, any>;
}

export interface AchievementDefinition {
  id: number;
  name: string;
  description: string;
  category: 'streak' | 'milestone' | 'quality' | 'special';
  iconUrl: string;
  points: number;
  requirements: AchievementRequirement[];
}

// Define achievement types
export enum AchievementType {
  // Streak achievements
  LOGIN_STREAK = 'login_streak',
  CHAT_STREAK = 'chat_streak',
  
  // Milestone achievements
  TOTAL_CHATS = 'total_chats', 
  TOTAL_MESSAGES = 'total_messages',
  COUNTRIES_VISITED = 'countries_visited',
  LANGUAGES_USED = 'languages_used',
  
  // Quality achievements
  LONG_CHATS = 'long_chats',
  HIGH_RATINGS = 'high_ratings',
  CONVERSATIONS_WITHOUT_REPORTS = 'conversations_without_reports',
  
  // Special achievements
  FIRST_CHAT = 'first_chat',
  INVITED_FRIEND = 'invited_friend',
  SUBSCRIPTION_MILESTONE = 'subscription_milestone',
}

// Achievement definitions database (could be stored in DB, but starting with code)
export const achievementDefinitions: AchievementDefinition[] = [
  // Streak Achievements
  {
    id: 1,
    name: 'Three-Day Streak',
    description: 'Logged in for 3 consecutive days',
    category: 'streak',
    iconUrl: '/achievements/streak-3.svg',
    points: 10,
    requirements: [{ type: AchievementType.LOGIN_STREAK, threshold: 3 }]
  },
  {
    id: 2,
    name: 'Weekly Warrior',
    description: 'Logged in for 7 consecutive days',
    category: 'streak',
    iconUrl: '/achievements/streak-7.svg',
    points: 25,
    requirements: [{ type: AchievementType.LOGIN_STREAK, threshold: 7 }]
  },
  {
    id: 3,
    name: 'Monthly Master',
    description: 'Logged in for 30 consecutive days',
    category: 'streak',
    iconUrl: '/achievements/streak-30.svg',
    points: 100,
    requirements: [{ type: AchievementType.LOGIN_STREAK, threshold: 30 }]
  },
  {
    id: 4,
    name: 'Chat Streak: Three Days',
    description: 'Had at least one chat for 3 consecutive days',
    category: 'streak',
    iconUrl: '/achievements/chat-streak-3.svg',
    points: 15,
    requirements: [{ type: AchievementType.CHAT_STREAK, threshold: 3 }]
  },
  {
    id: 5,
    name: 'Chat Streak: One Week',
    description: 'Had at least one chat for 7 consecutive days',
    category: 'streak',
    iconUrl: '/achievements/chat-streak-7.svg',
    points: 30,
    requirements: [{ type: AchievementType.CHAT_STREAK, threshold: 7 }]
  },
  
  // Milestone Achievements
  {
    id: 6,
    name: 'First Connection',
    description: 'Completed your first chat',
    category: 'milestone',
    iconUrl: '/achievements/first-chat.svg',
    points: 5,
    requirements: [{ type: AchievementType.TOTAL_CHATS, threshold: 1 }]
  },
  {
    id: 7,
    name: 'Chat Explorer',
    description: 'Completed 10 chats',
    category: 'milestone',
    iconUrl: '/achievements/chats-10.svg',
    points: 20,
    requirements: [{ type: AchievementType.TOTAL_CHATS, threshold: 10 }]
  },
  {
    id: 8,
    name: 'Chat Enthusiast',
    description: 'Completed 50 chats',
    category: 'milestone',
    iconUrl: '/achievements/chats-50.svg',
    points: 50,
    requirements: [{ type: AchievementType.TOTAL_CHATS, threshold: 50 }]
  },
  {
    id: 9,
    name: 'Chat Master',
    description: 'Completed 100 chats',
    category: 'milestone',
    iconUrl: '/achievements/chats-100.svg',
    points: 100,
    requirements: [{ type: AchievementType.TOTAL_CHATS, threshold: 100 }]
  },
  {
    id: 10,
    name: 'Messaging Rookie',
    description: 'Sent 50 messages',
    category: 'milestone',
    iconUrl: '/achievements/messages-50.svg',
    points: 10,
    requirements: [{ type: AchievementType.TOTAL_MESSAGES, threshold: 50 }]
  },
  {
    id: 11,
    name: 'Messaging Pro',
    description: 'Sent 500 messages',
    category: 'milestone',
    iconUrl: '/achievements/messages-500.svg',
    points: 25,
    requirements: [{ type: AchievementType.TOTAL_MESSAGES, threshold: 500 }]
  },
  {
    id: 12,
    name: 'Global Chatter',
    description: 'Chatted with people from 5 different countries',
    category: 'milestone',
    iconUrl: '/achievements/countries-5.svg',
    points: 30,
    requirements: [{ type: AchievementType.COUNTRIES_VISITED, threshold: 5 }]
  },
  {
    id: 13,
    name: 'Polyglot',
    description: 'Used 3 different languages in chats',
    category: 'milestone',
    iconUrl: '/achievements/languages-3.svg',
    points: 25,
    requirements: [{ type: AchievementType.LANGUAGES_USED, threshold: 3 }]
  },
  
  // Quality Achievements
  {
    id: 14,
    name: 'Deep Connection',
    description: 'Had 5 chats lasting more than 15 minutes',
    category: 'quality',
    iconUrl: '/achievements/long-chats-5.svg',
    points: 35,
    requirements: [{ 
      type: AchievementType.LONG_CHATS, 
      threshold: 5,
      additionalParams: { minDuration: 15 } // minutes
    }]
  },
  {
    id: 15,
    name: 'Five-Star Chatter',
    description: 'Received 5 five-star ratings',
    category: 'quality',
    iconUrl: '/achievements/five-stars.svg',
    points: 40,
    requirements: [{ 
      type: AchievementType.HIGH_RATINGS, 
      threshold: 5,
      additionalParams: { rating: 5 }
    }]
  },
  {
    id: 16,
    name: 'Perfect Record',
    description: 'Completed 20 chats with no reports',
    category: 'quality',
    iconUrl: '/achievements/no-reports-20.svg',
    points: 30,
    requirements: [{ 
      type: AchievementType.CONVERSATIONS_WITHOUT_REPORTS, 
      threshold: 20
    }]
  },
  
  // Special Achievements
  {
    id: 17,
    name: 'Ambassador',
    description: 'Invited a friend who completed 5 chats',
    category: 'special',
    iconUrl: '/achievements/invited-friend.svg',
    points: 50,
    requirements: [{ type: AchievementType.INVITED_FRIEND, threshold: 1 }]
  },
  {
    id: 18,
    name: 'Premium Member',
    description: 'Subscribed to StrangerWave Premium',
    category: 'special',
    iconUrl: '/achievements/premium.svg',
    points: 20,
    requirements: [{ 
      type: AchievementType.SUBSCRIPTION_MILESTONE, 
      threshold: 1,
      additionalParams: { tier: 'Premium' }
    }]
  },
  {
    id: 19,
    name: 'VIP Member',
    description: 'Subscribed to StrangerWave VIP',
    category: 'special',
    iconUrl: '/achievements/vip.svg',
    points: 30,
    requirements: [{ 
      type: AchievementType.SUBSCRIPTION_MILESTONE, 
      threshold: 1,
      additionalParams: { tier: 'VIP' }
    }]
  },
  {
    id: 20,
    name: 'Premium Loyalty',
    description: 'Maintained Premium subscription for 3 months',
    category: 'special',
    iconUrl: '/achievements/premium-3-months.svg',
    points: 75,
    requirements: [{ 
      type: AchievementType.SUBSCRIPTION_MILESTONE, 
      threshold: 3,
      additionalParams: { tier: 'Premium', unit: 'months' }
    }]
  }
];
```

### 2.2 Achievement Service

Create a service to manage achievements and check for new ones:

```typescript
// server/services/achievements.ts

import { storage } from '../storage';
import { 
  achievementDefinitions, 
  AchievementType, 
  AchievementRequirement 
} from './achievements/types';

/**
 * Main function to check and award achievements for a user
 */
export async function checkAchievements(userId: number): Promise<number[]> {
  try {
    // Get user data
    const user = await storage.getUser(userId);
    if (!user) return [];
    
    // Get user's existing achievements
    const existingAchievements = await storage.getUserAchievements(userId);
    const existingIds = new Set(existingAchievements.map(a => a.achievementId));
    
    // Get user streaks and metrics
    const streaks = await storage.getUserStreaks(userId);
    const metrics = await getUserMetrics(userId);
    
    // Check each achievement
    const newAchievements: number[] = [];
    
    for (const achievement of achievementDefinitions) {
      // Skip if user already has this achievement
      if (existingIds.has(achievement.id)) continue;
      
      // Check if user meets requirements
      const eligible = await checkAchievementEligibility(
        userId, 
        achievement.requirements,
        streaks,
        metrics
      );
      
      if (eligible) {
        // Award the achievement
        await storage.createUserAchievement({
          userId,
          achievementId: achievement.id,
          displayed: false
        });
        
        // Update user achievement stats
        await storage.updateUser(userId, {
          achievementPoints: (user.achievementPoints || 0) + achievement.points,
          totalAchievementCount: (user.totalAchievementCount || 0) + 1
        });
        
        newAchievements.push(achievement.id);
      }
    }
    
    return newAchievements;
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
}

/**
 * Check if a user meets the requirements for an achievement
 */
async function checkAchievementEligibility(
  userId: number,
  requirements: AchievementRequirement[],
  streaks?: UserStreaks,
  metrics?: any
): Promise<boolean> {
  // Get streaks if not provided
  if (!streaks) {
    streaks = await storage.getUserStreaks(userId);
  }
  
  // Get metrics if not provided
  if (!metrics) {
    metrics = await getUserMetrics(userId);
  }
  
  // Check each requirement
  for (const requirement of requirements) {
    const eligible = await checkSingleRequirement(
      userId, 
      requirement, 
      streaks, 
      metrics
    );
    
    if (!eligible) return false;
  }
  
  return true;
}

/**
 * Check a single achievement requirement
 */
async function checkSingleRequirement(
  userId: number,
  requirement: AchievementRequirement,
  streaks?: UserStreaks,
  metrics?: any
): Promise<boolean> {
  const { type, threshold, additionalParams } = requirement;
  
  switch (type) {
    // Streak-based achievements
    case AchievementType.LOGIN_STREAK:
      return streaks?.currentLoginStreak >= threshold || 
             streaks?.longestLoginStreak >= threshold;
      
    case AchievementType.CHAT_STREAK:
      return streaks?.currentChatStreak >= threshold ||
             streaks?.longestChatStreak >= threshold;
    
    // Milestone achievements
    case AchievementType.TOTAL_CHATS:
      return metrics?.totalChats >= threshold;
      
    case AchievementType.TOTAL_MESSAGES:
      return metrics?.totalMessages >= threshold;
      
    case AchievementType.COUNTRIES_VISITED:
      return metrics?.uniqueCountries >= threshold;
      
    case AchievementType.LANGUAGES_USED:
      return metrics?.uniqueLanguages >= threshold;
    
    // Quality achievements
    case AchievementType.LONG_CHATS:
      const minDuration = additionalParams?.minDuration || 15; // default 15 minutes
      return metrics?.longChatsCount >= threshold;
      
    case AchievementType.HIGH_RATINGS:
      const rating = additionalParams?.rating || 5;
      return metrics?.highRatingsCount >= threshold;
      
    case AchievementType.CONVERSATIONS_WITHOUT_REPORTS:
      return metrics?.conversationsWithoutReports >= threshold;
    
    // Special achievements
    case AchievementType.INVITED_FRIEND:
      return metrics?.successfulReferrals >= threshold;
      
    case AchievementType.SUBSCRIPTION_MILESTONE:
      const tier = additionalParams?.tier || 'Premium';
      const unit = additionalParams?.unit || 'subscription';
      
      if (unit === 'subscription') {
        return user?.premiumTier === tier;
      } else if (unit === 'months') {
        // Check subscription duration in months
        return metrics?.subscriptionMonths >= threshold && user?.premiumTier === tier;
      }
      
      return false;
      
    case AchievementType.FIRST_CHAT:
      return metrics?.totalChats >= 1;
      
    default:
      return false;
  }
}

/**
 * Collect various metrics needed for achievement checks
 */
async function getUserMetrics(userId: number): Promise<Record<string, any>> {
  // Get user data
  const user = await storage.getUser(userId);
  
  // Get chat metrics
  const userInteractionMetrics = await storage.getUserInteractionMetrics(userId);
  
  // Count total messages
  const totalMessages = await storage.countUserMessages(userId);
  
  // Get unique countries from chats
  const uniqueCountries = await storage.getUniqueCountriesForUser(userId);
  
  // Get unique languages used
  const uniqueLanguages = await storage.getUniqueLanguagesForUser(userId);
  
  // Count long chats (> minDuration minutes)
  const longChatsCount = await storage.getLongChatsCount(userId, 15);
  
  // Count high ratings
  const highRatingsCount = await storage.getHighRatingsCount(userId, 5);
  
  // Count conversations without reports
  const conversationsWithoutReports = await storage.getConversationsWithoutReportsCount(userId);
  
  // Count successful referrals
  const successfulReferrals = await storage.getSuccessfulReferralsCount(userId);
  
  // Calculate subscription duration in months
  const subscriptionMonths = user?.premiumUntil 
    ? Math.floor((new Date(user.premiumUntil).getTime() - new Date().getTime()) / (30 * 24 * 60 * 60 * 1000))
    : 0;
  
  return {
    totalChats: userInteractionMetrics?.totalChats || 0,
    totalMessages,
    uniqueCountries: uniqueCountries.length,
    uniqueLanguages: uniqueLanguages.length,
    longChatsCount,
    highRatingsCount,
    conversationsWithoutReports,
    successfulReferrals,
    subscriptionMonths,
  };
}

/**
 * Update user streaks based on activity
 */
export async function updateUserStreaks(userId: number): Promise<void> {
  try {
    // Get user streaks
    let streaks = await storage.getUserStreaks(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    
    if (!streaks) {
      // Create new streak record
      streaks = await storage.createUserStreaks({
        userId,
        currentLoginStreak: 1,
        longestLoginStreak: 1,
        currentChatStreak: 0,
        longestChatStreak: 0,
        lastLoginDate: today,
      });
      return;
    }
    
    // Convert date strings to Date objects
    const lastLogin = new Date(streaks.lastLoginDate);
    lastLogin.setHours(0, 0, 0, 0); // Normalize to start of day
    
    // Calculate date difference in days
    const diffTime = Math.abs(today.getTime() - lastLogin.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Update login streak
    let { currentLoginStreak, longestLoginStreak } = streaks;
    
    if (diffDays === 1) {
      // Consecutive day
      currentLoginStreak += 1;
      longestLoginStreak = Math.max(longestLoginStreak, currentLoginStreak);
    } else if (diffDays > 1) {
      // Streak broken
      currentLoginStreak = 1;
    }
    // If diffDays === 0, user already logged in today, don't update
    
    // Update streaks in database
    await storage.updateUserStreaks(userId, {
      currentLoginStreak,
      longestLoginStreak,
      lastLoginDate: today,
      streakUpdatedAt: new Date()
    });
    
    // Check for streak achievements
    await checkAchievements(userId);
  } catch (error) {
    console.error('Error updating user streaks:', error);
  }
}

/**
 * Update chat streak when user completes a chat
 */
export async function updateChatStreak(userId: number): Promise<void> {
  try {
    // Get user streaks
    let streaks = await storage.getUserStreaks(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    
    if (!streaks) {
      // Create new streak record
      streaks = await storage.createUserStreaks({
        userId,
        currentLoginStreak: 1,
        longestLoginStreak: 1,
        currentChatStreak: 1,
        longestChatStreak: 1,
        lastLoginDate: today,
      });
      return;
    }
    
    // Convert date strings to Date objects
    const lastLogin = new Date(streaks.lastLoginDate);
    lastLogin.setHours(0, 0, 0, 0); // Normalize to start of day
    
    // Calculate date difference in days
    const diffTime = Math.abs(today.getTime() - lastLogin.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Update chat streak
    let { currentChatStreak, longestChatStreak } = streaks;
    
    if (diffDays <= 1) {
      // Chat on consecutive day or same day
      // Only increment if it's a new day
      if (diffDays === 1) {
        currentChatStreak += 1;
        longestChatStreak = Math.max(longestChatStreak, currentChatStreak);
      }
    } else {
      // Streak broken
      currentChatStreak = 1;
    }
    
    // Update streaks in database
    await storage.updateUserStreaks(userId, {
      currentChatStreak,
      longestChatStreak,
      streakUpdatedAt: new Date()
    });
    
    // Check for streak achievements
    await checkAchievements(userId);
  } catch (error) {
    console.error('Error updating chat streak:', error);
  }
}
```

### 2.3 Storage Interface Updates

Extend the storage interface for achievement-related operations:

```typescript
// server/storage.ts - extend IStorage interface

export interface IStorage {
  // Existing methods...
  
  // Achievements
  getAchievements(): Promise<Achievement[]>;
  getAchievement(id: number): Promise<Achievement | undefined>;
  getUserAchievements(userId: number): Promise<(UserAchievement & Achievement)[]>;
  createUserAchievement(achievement: InsertUserAchievement): Promise<UserAchievement>;
  markAchievementDisplayed(userId: number, achievementId: number): Promise<UserAchievement>;
  
  // User Streaks
  getUserStreaks(userId: number): Promise<UserStreaks | undefined>;
  createUserStreaks(streaks: InsertUserStreaks): Promise<UserStreaks>;
  updateUserStreaks(userId: number, updates: Partial<UserStreaks>): Promise<UserStreaks | undefined>;
  
  // Extended User Metrics
  countUserMessages(userId: number): Promise<number>;
  getUniqueCountriesForUser(userId: number): Promise<string[]>;
  getUniqueLanguagesForUser(userId: number): Promise<string[]>;
  getLongChatsCount(userId: number, minDurationMinutes: number): Promise<number>;
  getHighRatingsCount(userId: number, minRating: number): Promise<number>;
  getConversationsWithoutReportsCount(userId: number): Promise<number>;
  getSuccessfulReferralsCount(userId: number): Promise<number>;
}

// Implementation in DatabaseStorage class
export class DatabaseStorage implements IStorage {
  // Existing methods...
  
  // Achievements
  async getAchievements(): Promise<Achievement[]> {
    return db.select().from(achievements);
  }
  
  async getAchievement(id: number): Promise<Achievement | undefined> {
    const [achievement] = await db
      .select()
      .from(achievements)
      .where(eq(achievements.id, id));
    return achievement;
  }
  
  async getUserAchievements(userId: number): Promise<(UserAchievement & Achievement)[]> {
    return db
      .select({
        id: userAchievements.id,
        userId: userAchievements.userId,
        achievementId: userAchievements.achievementId,
        earnedAt: userAchievements.earnedAt,
        displayed: userAchievements.displayed,
        name: achievements.name,
        description: achievements.description,
        category: achievements.category,
        iconUrl: achievements.iconUrl,
        points: achievements.points,
        requirements: achievements.requirements,
      })
      .from(userAchievements)
      .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, userId));
  }
  
  async createUserAchievement(achievement: InsertUserAchievement): Promise<UserAchievement> {
    const [result] = await db
      .insert(userAchievements)
      .values(achievement)
      .returning();
    return result;
  }
  
  async markAchievementDisplayed(userId: number, achievementId: number): Promise<UserAchievement> {
    const [result] = await db
      .update(userAchievements)
      .set({ displayed: true })
      .where(
        and(
          eq(userAchievements.userId, userId),
          eq(userAchievements.achievementId, achievementId)
        )
      )
      .returning();
    return result;
  }
  
  // User Streaks
  async getUserStreaks(userId: number): Promise<UserStreaks | undefined> {
    const [streaks] = await db
      .select()
      .from(userStreaks)
      .where(eq(userStreaks.userId, userId));
    return streaks;
  }
  
  async createUserStreaks(streaks: InsertUserStreaks): Promise<UserStreaks> {
    const [result] = await db
      .insert(userStreaks)
      .values(streaks)
      .returning();
    return result;
  }
  
  async updateUserStreaks(userId: number, updates: Partial<UserStreaks>): Promise<UserStreaks | undefined> {
    const [result] = await db
      .update(userStreaks)
      .set(updates)
      .where(eq(userStreaks.userId, userId))
      .returning();
    return result;
  }
  
  // Extended User Metrics
  async countUserMessages(userId: number): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(messages)
      .where(eq(messages.senderId, userId));
    return result[0]?.count || 0;
  }
  
  async getUniqueCountriesForUser(userId: number): Promise<string[]> {
    // Get all sessions where user participated
    const userSessions = await db
      .select()
      .from(chatSessions)
      .where(
        or(
          eq(chatSessions.user1Id, userId),
          eq(chatSessions.user2Id, userId)
        )
      );
    
    const sessionIds = userSessions.map(session => session.id);
    
    // Get all other users from these sessions
    const otherUserIds = userSessions.map(session => 
      session.user1Id === userId ? session.user2Id : session.user1Id
    );
    
    // Get other users' countries from chat preferences
    const preferences = await db
      .select()
      .from(chatPreferences)
      .where(inArray(chatPreferences.userId, otherUserIds));
    
    // Extract and deduplicate countries
    const countries = new Set<string>();
    preferences.forEach(pref => {
      if (pref.country) countries.add(pref.country);
    });
    
    return Array.from(countries);
  }
  
  async getUniqueLanguagesForUser(userId: number): Promise<string[]> {
    // Get all messages sent or received by user
    const userSessions = await db
      .select()
      .from(chatSessions)
      .where(
        or(
          eq(chatSessions.user1Id, userId),
          eq(chatSessions.user2Id, userId)
        )
      );
    
    const sessionIds = userSessions.map(session => session.id);
    
    // Get languages from these sessions
    const messagesWithLanguages = await db
      .select({ detectedLanguage: messages.detectedLanguage })
      .from(messages)
      .where(
        and(
          inArray(messages.sessionId, sessionIds),
          isNotNull(messages.detectedLanguage)
        )
      );
    
    // Extract and deduplicate languages
    const languages = new Set<string>();
    messagesWithLanguages.forEach(msg => {
      if (msg.detectedLanguage) languages.add(msg.detectedLanguage);
    });
    
    return Array.from(languages);
  }
  
  async getLongChatsCount(userId: number, minDurationMinutes: number): Promise<number> {
    // Get all sessions where user participated
    const userSessions = await db
      .select()
      .from(chatSessions)
      .where(
        and(
          or(
            eq(chatSessions.user1Id, userId),
            eq(chatSessions.user2Id, userId)
          ),
          isNotNull(chatSessions.endedAt)
        )
      );
    
    // Calculate chat durations and count long chats
    const minDurationMs = minDurationMinutes * 60 * 1000; // convert to milliseconds
    let longChatsCount = 0;
    
    for (const session of userSessions) {
      if (session.startedAt && session.endedAt) {
        const duration = new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime();
        if (duration >= minDurationMs) {
          longChatsCount++;
        }
      }
    }
    
    return longChatsCount;
  }
  
  async getHighRatingsCount(userId: number, minRating: number): Promise<number> {
    // Get count of high ratings from matching feedback
    const result = await db
      .select({ count: count() })
      .from(matchingFeedback)
      .where(
        and(
          eq(matchingFeedback.userId, userId),
          gte(matchingFeedback.rating, minRating)
        )
      );
    
    return result[0]?.count || 0;
  }
  
  async getConversationsWithoutReportsCount(userId: number): Promise<number> {
    // Get all sessions where user participated
    const userSessions = await db
      .select()
      .from(chatSessions)
      .where(
        or(
          eq(chatSessions.user1Id, userId),
          eq(chatSessions.user2Id, userId)
        )
      );
    
    const sessionIds = userSessions.map(session => session.id);
    
    // Get sessions with reports
    const reportedSessions = await db
      .select({ sessionId: reports.sessionId })
      .distinct()
      .from(reports)
      .where(
        and(
          inArray(reports.sessionId, sessionIds),
          eq(reports.reportedId, userId)
        )
      );
    
    const reportedSessionIds = new Set(reportedSessions.map(r => r.sessionId));
    
    // Count sessions without reports
    return sessionIds.filter(id => !reportedSessionIds.has(id)).length;
  }
  
  async getSuccessfulReferralsCount(userId: number): Promise<number> {
    // This would be implemented based on the referral system
    // For now, returning a placeholder
    return 0;
  }
}
```

## 3. Integration with Existing App Flow

### 3.1 Login Check for Streaks

Modify authentication handler to update streaks when users log in:

```typescript
// server/routes.ts - inside authentication handler

app.post('/api/login', async (req, res) => {
  // ... existing login code
  
  // Update user streaks
  await updateUserStreaks(user.id);
  
  // ... continue with login process
});

// For Firebase auth
app.post('/api/firebase-auth', async (req, res) => {
  // ... existing firebase auth code
  
  // Update user streaks
  await updateUserStreaks(user.id);
  
  // ... continue with auth process
});
```

### 3.2 Chat Completion for Streaks and Achievements

Modify the chat end handler to update streaks and check for achievements:

```typescript
// server/routes.ts - inside handleDisconnect or similar function

async function handleChatEnd(userId: number, sessionId: number) {
  // ... existing chat end code
  
  // Update chat streak
  await updateChatStreak(userId);
  
  // Check for new achievements
  const newAchievements = await checkAchievements(userId);
  
  // If there are new achievements, notify the user
  if (newAchievements.length > 0) {
    const achievements = await Promise.all(
      newAchievements.map(id => storage.getAchievement(id))
    );
    
    sendToUser(userId, {
      type: 'achievements',
      achievements: achievements.filter(Boolean) // Remove any undefined values
    });
  }
}
```

### 3.3 Achievement Notification and Display

Add a notification endpoint for marking achievements as displayed:

```typescript
// server/routes.ts - inside registerRoutes

app.post('/api/achievements/:id/mark-displayed', async (req, res) => {
  try {
    // User must be authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const userId = getUserIdFromRequest(req);
    const achievementId = parseInt(req.params.id, 10);
    
    if (isNaN(achievementId)) {
      return res.status(400).json({ error: 'Invalid achievement ID' });
    }
    
    // Mark the achievement as displayed
    await storage.markAchievementDisplayed(userId, achievementId);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking achievement displayed:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user achievements
app.get('/api/achievements', async (req, res) => {
  try {
    // User must be authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const userId = getUserIdFromRequest(req);
    
    // Get user's achievements
    const achievements = await storage.getUserAchievements(userId);
    
    res.json(achievements);
  } catch (error) {
    console.error('Error getting achievements:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get new (undisplayed) achievements
app.get('/api/achievements/new', async (req, res) => {
  try {
    // User must be authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const userId = getUserIdFromRequest(req);
    
    // Get user's undisplayed achievements
    const achievements = await storage.getUserAchievements(userId);
    const newAchievements = achievements.filter(a => !a.displayed);
    
    res.json(newAchievements);
  } catch (error) {
    console.error('Error getting new achievements:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
```

## 4. Client-Side Implementation

### 4.1 Achievement Display Component

Create a component to display achievements:

```tsx
// client/src/components/achievements/AchievementsList.tsx

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Award, Calendar, Star, Zap } from 'lucide-react';

interface Achievement {
  id: number;
  achievementId: number;
  name: string;
  description: string;
  category: 'streak' | 'milestone' | 'quality' | 'special';
  iconUrl: string;
  points: number;
  earnedAt: string;
}

export function AchievementsList() {
  const { data: achievements, isLoading } = useQuery({
    queryKey: ['/api/achievements'],
  });
  
  const { data: user } = useQuery({
    queryKey: ['/api/user/profile'],
  });
  
  const totalPoints = achievements?.reduce((sum, achievement) => sum + achievement.points, 0) || 0;
  
  if (isLoading) {
    return <div>Loading achievements...</div>;
  }
  
  // Group achievements by category
  const achievementsByCategory = {
    streak: achievements?.filter(a => a.category === 'streak') || [],
    milestone: achievements?.filter(a => a.category === 'milestone') || [],
    quality: achievements?.filter(a => a.category === 'quality') || [],
    special: achievements?.filter(a => a.category === 'special') || [],
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Achievements</h2>
        <Badge variant="secondary" className="px-3 py-1 text-base">
          <Award className="h-4 w-4 mr-1" />
          {totalPoints} Points
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Award className="h-5 w-5 mr-2 text-primary" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {achievements?.length || 0} / {20}
            </div>
            <Progress 
              value={(achievements?.length || 0) / 20 * 100} 
              className="h-2 mt-2" 
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary" />
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {user?.streaks?.currentLoginStreak || 0} days
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Longest: {user?.streaks?.longestLoginStreak || 0} days
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList className="w-full">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="streak">
            <Calendar className="h-4 w-4 mr-1" />
            Streaks
          </TabsTrigger>
          <TabsTrigger value="milestone">
            <Zap className="h-4 w-4 mr-1" />
            Milestones
          </TabsTrigger>
          <TabsTrigger value="quality">
            <Star className="h-4 w-4 mr-1" />
            Quality
          </TabsTrigger>
          <TabsTrigger value="special">
            <Award className="h-4 w-4 mr-1" />
            Special
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {achievements?.map(achievement => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="streak" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {achievementsByCategory.streak.map(achievement => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="milestone" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {achievementsByCategory.milestone.map(achievement => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="quality" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {achievementsByCategory.quality.map(achievement => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="special" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {achievementsByCategory.special.map(achievement => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const earnedDate = new Date(achievement.earnedAt).toLocaleDateString();
  
  return (
    <Card className="overflow-hidden">
      <div className="h-2 bg-primary" />
      <CardHeader className="pb-2 flex flex-row items-start">
        <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mr-3">
          {achievement.iconUrl ? (
            <img src={achievement.iconUrl} alt={achievement.name} className="w-8 h-8" />
          ) : (
            <Award className="h-6 w-6 text-primary" />
          )}
        </div>
        <div>
          <CardTitle className="text-base">{achievement.name}</CardTitle>
          <CardDescription>{achievement.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <Badge variant="outline" className="text-xs">
            {achievement.points} points
          </Badge>
          <span className="text-xs text-muted-foreground">
            Earned {earnedDate}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 4.2 Achievement Notification Component

Create a notification component for new achievements:

```tsx
// client/src/components/achievements/AchievementNotification.tsx

import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Achievement {
  id: number;
  achievementId: number;
  name: string;
  description: string;
  category: string;
  iconUrl: string;
  points: number;
}

export function AchievementNotification() {
  const queryClient = useQueryClient();
  
  // Get new (undisplayed) achievements
  const { data: newAchievements, isLoading } = useQuery({
    queryKey: ['/api/achievements/new'],
    refetchInterval: 60000, // Check every minute
  });
  
  // Mutation for marking achievement as displayed
  const markDisplayedMutation = useMutation({
    mutationFn: (achievementId: number) => 
      apiRequest('POST', `/api/achievements/${achievementId}/mark-displayed`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/achievements/new'] });
    },
  });
  
  // If there are multiple achievements, show them one after another
  const [currentAchievementIndex, setCurrentAchievementIndex] = React.useState(0);
  const [showNotification, setShowNotification] = React.useState(false);
  
  useEffect(() => {
    // If we have new achievements, show the notification
    if (newAchievements && newAchievements.length > 0) {
      setShowNotification(true);
      
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        dismissCurrentAchievement();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [newAchievements, currentAchievementIndex]);
  
  const dismissCurrentAchievement = () => {
    if (!newAchievements || newAchievements.length === 0) return;
    
    const achievement = newAchievements[currentAchievementIndex];
    
    // Mark as displayed
    markDisplayedMutation.mutate(achievement.achievementId);
    
    // Hide notification
    setShowNotification(false);
    
    // Move to next achievement after animation completes
    setTimeout(() => {
      if (currentAchievementIndex < newAchievements.length - 1) {
        setCurrentAchievementIndex(currentAchievementIndex + 1);
      } else {
        setCurrentAchievementIndex(0);
      }
    }, 300);
  };
  
  if (isLoading || !newAchievements || newAchievements.length === 0) {
    return null;
  }
  
  const currentAchievement = newAchievements[currentAchievementIndex];
  
  return (
    <AnimatePresence>
      {showNotification && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-4 right-4 z-50 w-80"
        >
          <div className={cn(
            "rounded-lg shadow-lg overflow-hidden",
            "bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm",
            "border border-primary/20"
          )}>
            <div className="h-1 bg-primary" />
            <div className="p-4">
              <div className="flex">
                <div className="mr-3">
                  {currentAchievement.iconUrl ? (
                    <img 
                      src={currentAchievement.iconUrl} 
                      alt={currentAchievement.name} 
                      className="w-10 h-10"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-base">Achievement Unlocked!</h3>
                    <button
                      onClick={dismissCurrentAchievement}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <p className="font-medium text-sm mt-1">
                    {currentAchievement.name}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {currentAchievement.description}
                  </p>
                  
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-primary font-medium">
                      +{currentAchievement.points} points
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {newAchievements.length > 1 ? 
                        `${currentAchievementIndex + 1} of ${newAchievements.length}` : 
                        ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### 4.3 Profile Page with Streaks and Achievements

Update the profile page to show streaks and achievements:

```tsx
// client/src/pages/Profile.tsx

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Award, Settings, User, MessageSquare, Clock } from 'lucide-react';
import { AchievementsList } from '@/components/achievements/AchievementsList';

export default function Profile() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/user/profile'],
  });
  
  if (isLoading) {
    return <div>Loading profile...</div>;
  }
  
  return (
    <div className="container py-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user?.avatarUrl} />
                  <AvatarFallback>{user?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{user?.username}</CardTitle>
                  <CardDescription>Joined {new Date(user?.createdAt).toLocaleDateString()}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  <span>{user?.achievementPoints || 0} Achievement Points</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>{user?.streaks?.currentLoginStreak || 0} Day Streak</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <span>{user?.totalChats || 0} Total Chats</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Last active: {user?.lastActive ? 
                    new Date(user.lastActive).toLocaleString() : 'Never'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:w-2/3">
          <Tabs defaultValue="achievements">
            <TabsList>
              <TabsTrigger value="achievements">
                <Award className="h-4 w-4 mr-2" />
                Achievements
              </TabsTrigger>
              <TabsTrigger value="activity">
                <Calendar className="h-4 w-4 mr-2" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="achievements" className="mt-6">
              <AchievementsList />
            </TabsContent>
            
            <TabsContent value="activity" className="mt-6">
              <ActivityTimeline />
            </TabsContent>
            
            <TabsContent value="settings" className="mt-6">
              <UserSettings />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// Other components like ActivityTimeline and UserSettings would be implemented separately
```

## 5. Implementation Plan and Timeline

### Phase 1: Backend Development (Week 1)

1. **Day 1-2**: Database schema updates
   - Create achievements, user_achievements, and user_streaks tables
   - Update users table with achievement-related fields
   - Implement storage interface methods

2. **Day 3-4**: Achievement system implementation
   - Create achievement definitions and types
   - Implement achievement checking logic
   - Develop streak tracking system

3. **Day 5**: API endpoints
   - Create achievement-related API endpoints
   - Add streak updating to existing flows
   - Test achievement triggers

### Phase 2: Frontend Development (Week 2)

1. **Day 1-2**: Achievement UI components
   - Create achievement list component
   - Develop achievement notification system
   - Implement achievement card component

2. **Day 3-4**: Profile page enhancements
   - Update profile page with achievements tab
   - Add streak visualization
   - Implement user stats display

3. **Day 5**: Testing and optimization
   - Test achievement triggers in various scenarios
   - Optimize achievement checking for performance
   - Refine notification UX

## 6. Potential Challenges and Mitigations

### Performance Concerns

**Challenge**: Checking achievements on every action could impact performance.

**Mitigation**:
- Batch achievement checks when possible
- Only check relevant achievement types based on the action
- Use caching for frequently accessed metrics
- Run more complex checks asynchronously

### User Experience

**Challenge**: Achievement notifications could become overwhelming.

**Mitigation**:
- Group similar achievements in notifications
- Allow users to customize notification preferences
- Space out notifications if multiple achievements are earned at once
- Provide clear UI for dismissing notifications

### Implementation Complexity

**Challenge**: Building a complete achievement system is complex with many edge cases.

**Mitigation**:
- Start with a core set of achievements and expand over time
- Focus on reliable streak tracking as the foundation
- Use a phased approach, adding achievement categories incrementally
- Implement thorough error handling and logging