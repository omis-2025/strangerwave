import { pgTable, text, serial, integer, boolean, timestamp, jsonb, pgEnum, real, date } from "drizzle-orm/pg-core";
import { PgArray as array } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const genderEnum = pgEnum('gender', ['male', 'female', 'non-binary', 'transgender', 'genderqueer', 'gender-fluid', 'other', 'any']);

// Forward declaration to avoid circular references
export let users: ReturnType<typeof pgTable>;

// Main user table
users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  uid: text("uid").notNull().unique(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  isBanned: boolean("is_banned").default(false).notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  isPremium: boolean("is_premium").default(false),
  premiumUntil: timestamp("premium_until"),
  premiumTier: text("premium_tier"),
  gender: genderEnum("gender").default('any'),
  banCount: integer("ban_count").default(0),
  lastActive: timestamp("last_active").defaultNow(),
  ipAddress: text("ip_address"),
  // AI Matching fields
  interests: jsonb("interests").$type<{name: string, weight: number}[]>(), // Top interests for quick matching
  matchingScore: integer("matching_score"), // Priority score for matching
  lastMatchedAt: timestamp("last_matched_at"), // When user was last matched
  // Session tracking
  sessionCount: integer("session_count").default(0), // Total number of chat sessions
  // Translation fields
  preferredLanguage: text("preferred_language").default('en'),
  // Referral fields
  referralCount: integer("referral_count").default(0),
  wasReferred: boolean("was_referred").default(false),
  referredBy: integer("referred_by").references(() => users.id),
  // Virtual tokens and Creator mode
  tokens: integer("tokens").default(0), // Virtual currency for tipping and purchases
  isCreator: boolean("is_creator").default(false), // Whether user is in creator mode
  creatorBio: text("creator_bio"), // Profile description for creators
  creatorSettings: jsonb("creator_settings").$type<{
    tippingEnabled: boolean,
    privateRoomRate: number, // Token rate for private chat
    contentCategories: string[]
  }>(),
  country: text("country"), // User's country for localization
});

export const chatPreferences = pgTable("chat_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  preferredGender: genderEnum("preferred_gender").default('any'),
  country: text("country"),
});

export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  user1Id: integer("user1_id").references(() => users.id),
  user2Id: integer("user2_id").references(() => users.id),
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
  active: boolean("active").default(true),
  // AI Matching fields
  algorithmId: integer("algorithm_id"), // References which algorithm created this match
  matchQualityScore: real("match_quality_score"), // 0-1 score of match quality
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => chatSessions.id),
  senderId: integer("sender_id").references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  // Translation fields
  detectedLanguage: text("detected_language"),
  isTranslated: boolean("is_translated").default(false),
  originalContent: text("original_content"), // Stores original content when translated
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  reporterId: integer("reporter_id").references(() => users.id),
  reportedId: integer("reported_id").references(() => users.id),
  sessionId: integer("session_id").references(() => chatSessions.id),
  reason: text("reason").notNull(),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow(),
  resolved: boolean("resolved").default(false),
});

export const waitingQueue = pgTable("waiting_queue", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  preferredGender: genderEnum("preferred_gender").default('any'),
  country: text("country"),
  joinedAt: timestamp("joined_at").defaultNow(),
  // AI Matching fields
  preferredTopics: text("preferred_topics").array(), // Topics user is interested in discussing
  matchingPriority: integer("matching_priority").default(0), // Higher number = higher priority
});

// --- TRANSLATION SYSTEM TABLES ---

export const translationCache = pgTable("translation_cache", {
  id: serial("id").primaryKey(),
  sourceText: text("source_text").notNull(),
  sourceLanguage: text("source_language").notNull(),
  targetLanguage: text("target_language").notNull(),
  translatedText: text("translated_text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUsedAt: timestamp("last_used_at").defaultNow().notNull(),
  useCount: integer("use_count").default(1).notNull()
});

export const translationMetrics = pgTable("translation_metrics", {
  id: serial("id").primaryKey(),
  date: timestamp("date").defaultNow().notNull(),
  sourceLanguage: text("source_language").notNull(),
  targetLanguage: text("target_language").notNull(),
  translationCount: integer("translation_count").default(0).notNull(),
  cacheHitCount: integer("cache_hit_count").default(0).notNull(),
  apiCallCount: integer("api_call_count").default(0).notNull(),
  characterCount: integer("character_count").default(0).notNull(),
  averageLatencyMs: integer("average_latency_ms"),
  errorCount: integer("error_count").default(0).notNull()
});

export const supportedLanguages = pgTable("supported_languages", {
  code: text("code").primaryKey(),
  name: text("name").notNull(),
  nativeName: text("native_name").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  direction: text("direction").default('ltr').notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// --- AI MATCHING SYSTEM TABLES ---

export const userInteractionMetrics = pgTable("user_interaction_metrics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  totalChats: integer("total_chats").default(0).notNull(),
  avgChatDuration: integer("avg_chat_duration").default(0).notNull(), // seconds
  chatAcceptRate: real("chat_accept_rate").default(0).notNull(),
  chatRejectCount: integer("chat_reject_count").default(0).notNull(),
  preferredChatHours: jsonb("preferred_chat_hours").$type<Record<string, number>>(), // time of day preferences
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userInterests = pgTable("user_interests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  interest: text("interest").notNull(),
  weight: real("weight").default(1.0).notNull(),
  source: text("source").notNull(), // "explicit" or "derived"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const matchingFeedback = pgTable("matching_feedback", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => chatSessions.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  rating: integer("rating"), // 1-5
  feedbackText: text("feedback_text"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const matchingAlgorithmConfig = pgTable("matching_algorithm_config", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  parameters: jsonb("parameters").$type<Record<string, number>>().notNull(),
  isActive: boolean("is_active").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userAlgorithmAssignment = pgTable("user_algorithm_assignment", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  algorithmId: integer("algorithm_id").references(() => matchingAlgorithmConfig.id).notNull(),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
});

// --- REFERRAL SYSTEM TABLES ---

// Referral codes table - stores unique referral codes for users
export const referralCodes = pgTable("referral_codes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  code: text("code").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true).notNull(),
  isCreatorCode: boolean("is_creator_code").default(false).notNull(), // Special codes for creators
  bonusPercentage: integer("bonus_percentage").default(0), // Extra rewards for special promotions
});

// Referrals table - tracks referral relationships between users
export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").references(() => users.id).notNull(),
  referredId: integer("referred_id").references(() => users.id).notNull().unique(),
  referralCode: text("referral_code").references(() => referralCodes.code).notNull(),
  referredAt: timestamp("referred_at").defaultNow().notNull(),
  status: text("status").default('pending').notNull(), // "pending", "qualified", "rewarded"
  rewardClaimed: boolean("reward_claimed").default(false).notNull(),
  rewardClaimedAt: timestamp("reward_claimed_at"),
});

// Referral rewards table - defines available rewards for successful referrals
export const referralRewards = pgTable("referral_rewards", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // "premium_days", "tokens", "badge", "discount"
  value: jsonb("value").notNull(), // e.g. {"days": 30} or {"tokens": 500}
  requiredReferrals: integer("required_referrals").default(1).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  iconUrl: text("icon_url"),
});

// User referral rewards table - tracks rewards claimed by users
export const userReferralRewards = pgTable("user_referral_rewards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  rewardId: integer("reward_id").references(() => referralRewards.id).notNull(),
  claimedAt: timestamp("claimed_at").defaultNow().notNull(),
  appliedAt: timestamp("applied_at"),
  expiresAt: timestamp("expires_at"),
});

// Social shares table - tracks user-shared content
export const socialShares = pgTable("social_shares", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  sessionId: integer("session_id").references(() => chatSessions.id),
  type: text("type").notNull(), // "chat_moment", "achievement", "streak"
  content: text("content"), // Sanitized content text 
  mediaUrl: text("media_url"), // URL to blurred image or clip
  shareUrl: text("share_url").notNull(), // Unique tracking URL
  platform: text("platform"), // "twitter", "facebook", "instagram", etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
  clickCount: integer("click_count").default(0).notNull(),
  convertedCount: integer("converted_count").default(0).notNull(), // How many clicks resulted in signups
});

// VIP private rooms table - for creator chats
export const privateRooms = pgTable("private_rooms", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").references(() => users.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  tokenRate: integer("token_rate").notNull(), // Tokens per minute
  status: text("status").default('pending').notNull(), // "pending", "active", "completed", "cancelled"
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  tokensSpent: integer("tokens_spent").default(0).notNull(),
  minutesActive: integer("minutes_active").default(0).notNull(),
  creatorRating: integer("creator_rating"), // 1-5 rating from user
  userRating: integer("user_rating"), // 1-5 rating from creator
});

// --- ACHIEVEMENT AND STREAK SYSTEM TABLES ---

// Achievement types for better organization
export const achievementTypeEnum = pgEnum('achievement_type', ['streak', 'milestone', 'quality', 'special', 'onboarding', 'engagement', 'referral', 'creator']);

// Achievements table - defines available achievements
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // Unique code identifier for the achievement
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: achievementTypeEnum("category").notNull(),
  iconUrl: text("icon_url"),
  points: integer("points").default(0).notNull(),
  requirements: jsonb("requirements").notNull(), // e.g. { type: "LOGIN_STREAK", threshold: 7 }
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User achievements - tracks which achievements users have earned
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  achievementId: integer("achievement_id").references(() => achievements.id).notNull(),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
  displayed: boolean("displayed").default(false).notNull(), // Whether it's been shown to user
});

// User streaks - tracks consecutive usage patterns
export const userStreaks = pgTable("user_streaks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  streakType: text("streak_type").notNull(), // e.g. "login", "chat", "video"
  currentStreak: integer("current_streak").default(0).notNull(),
  longestStreak: integer("longest_streak").default(0).notNull(),
  lastUpdateDate: date("last_update_date").notNull(),
  streakStartDate: date("streak_start_date"),
  protectionUsed: boolean("protection_used").default(false).notNull(), // For streak protection feature
  streakData: jsonb("streak_data").$type<{
    history: { date: string, count: number }[],
    milestones: { days: number, achievedAt: string }[]
  }>(),
});

// --- SCHEMA INSERTION HELPERS ---

// Referral system insert schemas
export const insertReferralCodeSchema = createInsertSchema(referralCodes).omit({
  id: true,
  createdAt: true
});

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  referredAt: true,
  rewardClaimedAt: true
});

export const insertReferralRewardSchema = createInsertSchema(referralRewards).omit({
  id: true
});

export const insertUserReferralRewardSchema = createInsertSchema(userReferralRewards).omit({
  id: true,
  claimedAt: true
});

export const insertSocialShareSchema = createInsertSchema(socialShares).omit({
  id: true,
  createdAt: true,
  clickCount: true,
  convertedCount: true
});

export const insertPrivateRoomSchema = createInsertSchema(privateRooms).omit({
  id: true,
  startedAt: true,
  endedAt: true,
  tokensSpent: true,
  minutesActive: true
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  isAdmin: true,
  isBanned: true,
  stripeCustomerId: true,
  lastActive: true,
  interests: true,
  matchingScore: true,
  lastMatchedAt: true,
});

export const insertChatPreferencesSchema = createInsertSchema(chatPreferences).omit({
  id: true
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
  startedAt: true,
  endedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
  resolved: true
});

export const insertWaitingQueueSchema = createInsertSchema(waitingQueue).omit({
  id: true,
  joinedAt: true,
  preferredTopics: true,
  matchingPriority: true,
});

// Translation insert schemas
export const insertTranslationCacheSchema = createInsertSchema(translationCache).omit({
  id: true,
  createdAt: true,
  lastUsedAt: true,
  useCount: true
});

export const insertTranslationMetricsSchema = createInsertSchema(translationMetrics).omit({
  id: true,
  date: true
});

export const insertSupportedLanguagesSchema = createInsertSchema(supportedLanguages).omit({
  createdAt: true
});

// AI Matching insert schemas
export const insertUserInteractionMetricsSchema = createInsertSchema(userInteractionMetrics).omit({
  id: true,
  updatedAt: true
});

export const insertUserInterestsSchema = createInsertSchema(userInterests).omit({
  id: true,
  createdAt: true
});

export const insertMatchingFeedbackSchema = createInsertSchema(matchingFeedback).omit({
  id: true,
  createdAt: true
});

export const insertMatchingAlgorithmConfigSchema = createInsertSchema(matchingAlgorithmConfig).omit({
  id: true,
  createdAt: true
});

export const insertUserAlgorithmAssignmentSchema = createInsertSchema(userAlgorithmAssignment).omit({
  id: true,
  assignedAt: true
});

// Achievement system insert schemas
export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  createdAt: true
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  earnedAt: true
});

export const insertUserStreakSchema = createInsertSchema(userStreaks).omit({
  id: true
});

// --- TYPE EXPORTS ---

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertChatPreferences = z.infer<typeof insertChatPreferencesSchema>;
export type ChatPreferences = typeof chatPreferences.$inferSelect;

export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type ChatSession = typeof chatSessions.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;

export type InsertWaitingQueue = z.infer<typeof insertWaitingQueueSchema>;
export type WaitingQueue = typeof waitingQueue.$inferSelect;

// Translation types
export type InsertTranslationCache = z.infer<typeof insertTranslationCacheSchema>;
export type TranslationCache = typeof translationCache.$inferSelect;

export type InsertTranslationMetrics = z.infer<typeof insertTranslationMetricsSchema>;
export type TranslationMetrics = typeof translationMetrics.$inferSelect;

export type InsertSupportedLanguage = z.infer<typeof insertSupportedLanguagesSchema>;
export type SupportedLanguage = typeof supportedLanguages.$inferSelect;

// AI Matching types
export type InsertUserInteractionMetrics = z.infer<typeof insertUserInteractionMetricsSchema>;
export type UserInteractionMetrics = typeof userInteractionMetrics.$inferSelect;

export type InsertUserInterests = z.infer<typeof insertUserInterestsSchema>;
export type UserInterests = typeof userInterests.$inferSelect;

export type InsertMatchingFeedback = z.infer<typeof insertMatchingFeedbackSchema>;
export type MatchingFeedback = typeof matchingFeedback.$inferSelect;

export type InsertMatchingAlgorithmConfig = z.infer<typeof insertMatchingAlgorithmConfigSchema>;
export type MatchingAlgorithmConfig = typeof matchingAlgorithmConfig.$inferSelect;

export type InsertUserAlgorithmAssignment = z.infer<typeof insertUserAlgorithmAssignmentSchema>;
export type UserAlgorithmAssignment = typeof userAlgorithmAssignment.$inferSelect;

// Achievement system types
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievements.$inferSelect;

export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;

export type InsertUserStreak = z.infer<typeof insertUserStreakSchema>;
export type UserStreak = typeof userStreaks.$inferSelect;

// Referral system types
export type InsertReferralCode = z.infer<typeof insertReferralCodeSchema>;
export type ReferralCode = typeof referralCodes.$inferSelect;

export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type Referral = typeof referrals.$inferSelect;

export type InsertReferralReward = z.infer<typeof insertReferralRewardSchema>;
export type ReferralReward = typeof referralRewards.$inferSelect;

export type InsertUserReferralReward = z.infer<typeof insertUserReferralRewardSchema>;
export type UserReferralReward = typeof userReferralRewards.$inferSelect;

export type InsertSocialShare = z.infer<typeof insertSocialShareSchema>;
export type SocialShare = typeof socialShares.$inferSelect;

export type InsertPrivateRoom = z.infer<typeof insertPrivateRoomSchema>;
export type PrivateRoom = typeof privateRooms.$inferSelect;
