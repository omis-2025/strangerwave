import { pgTable, text, serial, integer, boolean, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const genderEnum = pgEnum('gender', ['male', 'female', 'any']);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  uid: text("uid").notNull().unique(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  isBanned: boolean("is_banned").default(false).notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  lastActive: timestamp("last_active").defaultNow(),
  ipAddress: text("ip_address"),
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
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  isAdmin: true,
  isBanned: true,
  stripeCustomerId: true,
  lastActive: true
});

export const insertChatPreferencesSchema = createInsertSchema(chatPreferences).omit({
  id: true
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
  startedAt: true,
  endedAt: true
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
  joinedAt: true
});

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
