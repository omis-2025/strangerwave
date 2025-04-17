import { pgTable, text, serial, integer, boolean, timestamp, jsonb, pgEnum, real } from "drizzle-orm/pg-core";
import { PgArray as array } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const genderEnum = pgEnum('gender', ['male', 'female', 'non-binary', 'transgender', 'genderqueer', 'gender-fluid', 'other', 'any']);

// Main user table
export const users = pgTable("users", {
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

// --- SCHEMA INSERTION HELPERS ---

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
  algorithmId: true,
  matchQualityScore: true,
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
