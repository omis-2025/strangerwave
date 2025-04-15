import { 
  users, type User, type InsertUser,
  chatPreferences, type ChatPreferences, type InsertChatPreferences,
  chatSessions, type ChatSession, type InsertChatSession,
  messages, type Message, type InsertMessage,
  reports, type Report, type InsertReport,
  waitingQueue, type WaitingQueue, type InsertWaitingQueue
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private usersByUid: Map<string, User>;
  private chatPreferences: Map<number, ChatPreferences>;
  private chatSessions: Map<number, ChatSession>;
  private messages: Map<number, Message>;
  private reports: Map<number, Report>;
  private waitingQueue: Map<number, WaitingQueue>;
  
  private currentUserId: number;
  private currentChatPreferencesId: number;
  private currentChatSessionId: number;
  private currentMessageId: number;
  private currentReportId: number;
  private currentWaitingQueueId: number;

  constructor() {
    this.users = new Map();
    this.usersByUid = new Map();
    this.chatPreferences = new Map();
    this.chatSessions = new Map();
    this.messages = new Map();
    this.reports = new Map();
    this.waitingQueue = new Map();
    
    this.currentUserId = 1;
    this.currentChatPreferencesId = 1;
    this.currentChatSessionId = 1;
    this.currentMessageId = 1;
    this.currentReportId = 1;
    this.currentWaitingQueueId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUid(uid: string): Promise<User | undefined> {
    return this.usersByUid.get(uid);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      isAdmin: false,
      isBanned: false,
      lastActive: now,
      stripeCustomerId: null
    };
    this.users.set(id, user);
    this.usersByUid.set(user.uid, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    if (user.uid) {
      this.usersByUid.set(user.uid, updatedUser);
    }
    return updatedUser;
  }

  async updateStripeCustomerId(id: number, stripeCustomerId: string): Promise<User | undefined> {
    return this.updateUser(id, { stripeCustomerId });
  }

  // Chat preferences methods
  async getChatPreferences(userId: number): Promise<ChatPreferences | undefined> {
    return Array.from(this.chatPreferences.values()).find(
      (pref) => pref.userId === userId
    );
  }

  async setChatPreferences(insertPreferences: InsertChatPreferences): Promise<ChatPreferences> {
    const existingPrefs = await this.getChatPreferences(insertPreferences.userId as number);
    
    if (existingPrefs) {
      const updatedPrefs = { ...existingPrefs, ...insertPreferences };
      this.chatPreferences.set(existingPrefs.id, updatedPrefs);
      return updatedPrefs;
    } else {
      const id = this.currentChatPreferencesId++;
      const preferences: ChatPreferences = { ...insertPreferences, id };
      this.chatPreferences.set(id, preferences);
      return preferences;
    }
  }

  // Chat session methods
  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const id = this.currentChatSessionId++;
    const now = new Date();
    const session: ChatSession = {
      ...insertSession,
      id,
      startedAt: now,
      endedAt: null,
      active: true
    };
    this.chatSessions.set(id, session);
    return session;
  }

  async getChatSession(id: number): Promise<ChatSession | undefined> {
    return this.chatSessions.get(id);
  }

  async endChatSession(id: number): Promise<ChatSession | undefined> {
    const session = await this.getChatSession(id);
    if (!session) return undefined;
    
    const now = new Date();
    const updatedSession = { ...session, endedAt: now, active: false };
    this.chatSessions.set(id, updatedSession);
    return updatedSession;
  }

  // Messages methods
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const now = new Date();
    const message: Message = {
      ...insertMessage,
      id,
      createdAt: now
    };
    this.messages.set(id, message);
    return message;
  }

  async getSessionMessages(sessionId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.sessionId === sessionId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  // Reports methods
  async createReport(insertReport: InsertReport): Promise<Report> {
    const id = this.currentReportId++;
    const now = new Date();
    const report: Report = {
      ...insertReport,
      id,
      createdAt: now,
      resolved: false
    };
    this.reports.set(id, report);
    return report;
  }

  async getReports(resolved?: boolean): Promise<Report[]> {
    let reports = Array.from(this.reports.values());
    
    if (resolved !== undefined) {
      reports = reports.filter(report => report.resolved === resolved);
    }
    
    return reports.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async resolveReport(id: number): Promise<Report | undefined> {
    const report = this.reports.get(id);
    if (!report) return undefined;
    
    const updatedReport = { ...report, resolved: true };
    this.reports.set(id, updatedReport);
    return updatedReport;
  }

  // Waiting queue methods
  async addToWaitingQueue(insertEntry: InsertWaitingQueue): Promise<WaitingQueue> {
    // First remove any existing entry for this user
    await this.removeFromWaitingQueue(insertEntry.userId as number);
    
    // Then add the new entry
    const id = this.currentWaitingQueueId++;
    const now = new Date();
    const entry: WaitingQueue = {
      ...insertEntry,
      id,
      joinedAt: now
    };
    this.waitingQueue.set(id, entry);
    return entry;
  }

  async removeFromWaitingQueue(userId: number): Promise<void> {
    const entries = Array.from(this.waitingQueue.values())
      .filter(entry => entry.userId === userId);
    
    for (const entry of entries) {
      this.waitingQueue.delete(entry.id);
    }
  }

  async getMatchingUsers(preferences: { preferredGender?: string, country?: string }): Promise<WaitingQueue[]> {
    let entries = Array.from(this.waitingQueue.values());
    
    // Sort by join time (oldest first)
    entries = entries.sort((a, b) => 
      a.joinedAt.getTime() - b.joinedAt.getTime()
    );
    
    // Apply filters if specified
    if (preferences.preferredGender && preferences.preferredGender !== 'any') {
      // If user wants specific gender, find users of that gender 
      // who either want any gender or specifically user's gender
      const userGender = preferences.preferredGender;
      entries = entries.filter(entry => {
        // Only match if user's gender matches what the queue entry is looking for,
        // or if the queue entry is looking for any gender
        return entry.preferredGender === 'any' || entry.preferredGender === userGender;
      });
    }
    
    if (preferences.country) {
      entries = entries.filter(entry => {
        // If entry specified a country, match it exactly
        // If entry didn't specify a country, it's a match for any country
        return !entry.country || entry.country === preferences.country;
      });
    }
    
    return entries;
  }

  // Admin methods
  async banUser(id: number): Promise<User | undefined> {
    return this.updateUser(id, { isBanned: true });
  }

  async unbanUser(id: number): Promise<User | undefined> {
    return this.updateUser(id, { isBanned: false });
  }

  async getAllUsers(filter?: { isBanned?: boolean }): Promise<User[]> {
    let users = Array.from(this.users.values());
    
    if (filter?.isBanned !== undefined) {
      users = users.filter(user => user.isBanned === filter.isBanned);
    }
    
    return users.sort((a, b) => 
      (b.lastActive?.getTime() || 0) - (a.lastActive?.getTime() || 0)
    );
  }
}

export const storage = new MemStorage();
