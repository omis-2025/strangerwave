import { 
  users, type User, type InsertUser,
  chatPreferences, type ChatPreferences, type InsertChatPreferences,
  chatSessions, type ChatSession, type InsertChatSession,
  messages, type Message, type InsertMessage,
  reports, type Report, type InsertReport,
  waitingQueue, type WaitingQueue, type InsertWaitingQueue
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, isNull } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUid(uid: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  updateStripeCustomerId(id: number, stripeCustomerId: string): Promise<User | undefined>;
  
  // Chat preferences methods
  getChatPreferences(userId: number): Promise<ChatPreferences | undefined>;
  setChatPreferences(preferences: InsertChatPreferences): Promise<ChatPreferences>;
  
  // Chat session methods
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  getChatSession(id: number): Promise<ChatSession | undefined>;
  endChatSession(id: number): Promise<ChatSession | undefined>;
  
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
  getMatchingUsers(preferences: { preferredGender?: string, country?: string }): Promise<WaitingQueue[]>;
  
  // Admin methods
  banUser(id: number): Promise<User | undefined>;
  unbanUser(id: number): Promise<User | undefined>;
  getAllUsers(filter?: { isBanned?: boolean }): Promise<User[]>;
}

import { db } from "./db";
import { eq, and, desc, isNull } from "drizzle-orm";

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

  // Chat preferences methods
  async getChatPreferences(userId: number): Promise<ChatPreferences | undefined> {
    const [preferences] = await db
      .select()
      .from(chatPreferences)
      .where(eq(chatPreferences.userId, userId));
    return preferences;
  }

  async setChatPreferences(insertPreferences: InsertChatPreferences): Promise<ChatPreferences> {
    // First try to find existing preferences
    const existingPreferences = await this.getChatPreferences(insertPreferences.userId);
    
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
    let query = db.select().from(waitingQueue);
    
    if (preferences.preferredGender && preferences.preferredGender !== 'any') {
      // When user prefers a specific gender, find queue entries that either:
      // 1. Want any gender, or
      // 2. Want the specific gender the user is
      query = query.where(
        eq(waitingQueue.preferredGender, 'any' as any) || 
        eq(waitingQueue.preferredGender, preferences.preferredGender as any)
      );
    }
    
    if (preferences.country) {
      // When user prefers a specific country, find queue entries that either:
      // 1. Have no country preference (null), or
      // 2. Want the specific country the user is from
      query = query.where(
        isNull(waitingQueue.country) || 
        eq(waitingQueue.country, preferences.country)
      );
    }
    
    return query.orderBy(waitingQueue.joinedAt);
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
}

export const storage = new DatabaseStorage();
