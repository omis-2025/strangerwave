# AI-Powered Matching System Integration

This document outlines the implementation plan for the AI-powered matching system for StrangerWave, including schema updates, backend logic, and integration with the existing queue system.

## 1. Updated Drizzle Schema

Here's how we'll extend the current `shared/schema.ts` file to support the AI matching features:

```typescript
// New imports needed
import { pgTable, text, serial, integer, boolean, timestamp, jsonb, pgEnum, real, date, array } from "drizzle-orm/pg-core";

// New tables for AI matching

export const userInteractionMetrics = pgTable("user_interaction_metrics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  totalChats: integer("total_chats").default(0).notNull(),
  avgChatDuration: integer("avg_chat_duration").default(0).notNull(), // seconds
  chatAcceptRate: real("chat_accept_rate").default(0).notNull(),
  chatRejectCount: integer("chat_reject_count").default(0).notNull(),
  preferredChatHours: jsonb("preferred_chat_hours"),
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
  parameters: jsonb("parameters").notNull(),
  isActive: boolean("is_active").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userAlgorithmAssignment = pgTable("user_algorithm_assignment", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  algorithmId: integer("algorithm_id").references(() => matchingAlgorithmConfig.id).notNull(),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
});

// Extend existing tables
// This is conceptual since we can't actually alter existing table definitions in TypeScript
// We would need to add these fields through migrations in practice

// For users table
// interests: jsonb
// matchingScore: integer
// lastMatchedAt: timestamp

// For chatSessions table
// algorithmId: integer (references matchingAlgorithmConfig)
// matchQualityScore: real

// For waitingQueue table
// preferredTopics: array(text)
// matchingPriority: integer

// Create Zod schemas and types for the new tables
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

// Export types
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
```

## 2. Backend Integration

### Data Collection Components

1. **Chat Session Tracking**
   
   We need to enhance the existing chat flow to collect metrics about user behavior:

```typescript
// server/routes.ts - inside handleDisconnect or similar function

async function handleChatEnd(userId: number, sessionId: number, duration: number) {
  // Get the chat session
  const session = await storage.getChatSession(sessionId);
  if (!session) return;
  
  // Update user metrics
  const metrics = await storage.getUserInteractionMetrics(userId);
  
  if (metrics) {
    // Calculate new average duration
    const newTotalChats = metrics.totalChats + 1;
    const newAvgDuration = ((metrics.avgChatDuration * metrics.totalChats) + duration) / newTotalChats;
    
    await storage.updateUserInteractionMetrics(userId, {
      totalChats: newTotalChats,
      avgChatDuration: Math.floor(newAvgDuration),
    });
  } else {
    // Create new metrics record
    await storage.createUserInteractionMetrics(userId, {
      totalChats: 1,
      avgChatDuration: duration,
      chatAcceptRate: 1.0, // First chat was accepted
      chatRejectCount: 0,
      preferredChatHours: calculateTimeOfDayPreference(new Date()),
    });
  }
  
  // Calculate and store match quality score based on:
  // - Duration
  // - Number of messages
  // - Whether users exchanged contact info
  const messages = await storage.getSessionMessages(sessionId);
  const matchQuality = calculateMatchQuality(session, messages, duration);
  
  // Update the session with quality metrics
  await storage.updateChatSession(sessionId, {
    matchQualityScore: matchQuality,
  });
}

// Helper function to categorize time of day
function calculateTimeOfDayPreference(date: Date): Record<string, number> {
  const hour = date.getHours();
  const timeOfDay = 
    hour >= 5 && hour < 12 ? 'morning' :
    hour >= 12 && hour < 17 ? 'afternoon' :
    hour >= 17 && hour < 22 ? 'evening' : 'night';
  
  // Return an object with the current time period set to 1.0
  // and all others at 0 for first-time initialization
  return {
    morning: timeOfDay === 'morning' ? 1.0 : 0,
    afternoon: timeOfDay === 'afternoon' ? 1.0 : 0,
    evening: timeOfDay === 'evening' ? 1.0 : 0,
    night: timeOfDay === 'night' ? 1.0 : 0,
  };
}

// Calculate match quality score based on various factors
function calculateMatchQuality(
  session: ChatSession, 
  messages: Message[], 
  durationSeconds: number
): number {
  // Base factors
  let score = 0;
  
  // Duration factor - longer conversations indicate better matches
  // Scale: 0-5 points
  const durationScore = Math.min(5, durationSeconds / 120); // 5 points for 10+ minute conversations
  
  // Message count and frequency
  // Scale: 0-5 points
  const messageCount = messages.length;
  const messageCountScore = Math.min(5, messageCount / 20); // 5 points for 20+ messages
  
  // Message distribution (back-and-forth engagement)
  // Scale: 0-5 points
  const user1Messages = messages.filter(m => m.senderId === session.user1Id).length;
  const user2Messages = messages.filter(m => m.senderId === session.user2Id).length;
  
  // Perfect distribution would be 50/50
  const messageDistributionScore = 5 * (1 - Math.abs(user1Messages - user2Messages) / messageCount);
  
  // Combine scores (simple average for now)
  score = (durationScore + messageCountScore + messageDistributionScore) / 3;
  
  // Scale to 0-1 range
  return Math.min(1, Math.max(0, score / 5));
}
```

2. **Interest Extraction**

We'll implement a simple keyword extraction system to identify potential interests from chat messages:

```typescript
// server/moderation.ts - add a new function

import { storage } from './storage';

interface ExtractedInterest {
  interest: string;
  weight: number;
}

export async function extractInterestsFromMessage(
  message: string, 
  userId: number
): Promise<void> {
  // Skip very short messages
  if (message.length < 20) return;
  
  const extractedInterests = extractKeywords(message);
  if (!extractedInterests.length) return;
  
  // Get existing interests for this user
  const existingInterests = await storage.getUserInterests(userId);
  const existingKeywords = new Map(existingInterests.map(i => [i.interest.toLowerCase(), i]));
  
  // Process each extracted interest
  for (const extracted of extractedInterests) {
    const normalizedInterest = extracted.interest.toLowerCase();
    
    if (existingKeywords.has(normalizedInterest)) {
      // Update weight of existing interest
      const existing = existingKeywords.get(normalizedInterest)!;
      const newWeight = Math.min(5.0, existing.weight + (extracted.weight * 0.1));
      
      await storage.updateUserInterest(existing.id, {
        weight: newWeight
      });
    } else {
      // Add new interest
      await storage.createUserInterest({
        userId,
        interest: extracted.interest,
        weight: Math.min(1.0, extracted.weight),
        source: 'derived'
      });
    }
  }
  
  // Update the user's top interests JSON for quick access
  await updateUserTopInterests(userId);
}

function extractKeywords(text: string): ExtractedInterest[] {
  // This is a simplified keyword extraction - in a real implementation, 
  // we might use a more sophisticated NLP approach or third-party API
  
  // Define common topics/interests
  const commonInterests = [
    "music", "movies", "travel", "sports", "gaming", "books", "food", "technology",
    "art", "fashion", "fitness", "photography", "cooking", "pets", "nature",
    "politics", "science", "history", "languages", "dance", "theater", "coding"
  ];
  
  const results: ExtractedInterest[] = [];
  const normalizedText = text.toLowerCase();
  
  // Check for each interest in the text
  for (const interest of commonInterests) {
    // Simple matching logic: count occurrences and create weight
    const regex = new RegExp(`\\b${interest}\\b`, 'gi');
    const matches = normalizedText.match(regex);
    
    if (matches && matches.length > 0) {
      results.push({
        interest,
        weight: Math.min(1.0, 0.2 * matches.length) // 0.2 per mention, max 1.0
      });
    }
  }
  
  return results;
}

async function updateUserTopInterests(userId: number): Promise<void> {
  // Get all interests for user, sorted by weight
  const interests = await storage.getUserInterests(userId);
  const sortedInterests = interests
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 10) // Take top 10
    .map(i => ({ name: i.interest, weight: i.weight }));
  
  // Update user record with these interests
  await storage.updateUser(userId, {
    interests: sortedInterests
  });
}
```

### Matching Algorithm Integration

Now let's integrate the AI matching with the existing queue system:

```typescript
// server/routes.ts - modify the findMatch function

async function findMatch(userId: number, preferences: any) {
  // Get the user's metrics and interests for matching
  const user = await storage.getUser(userId);
  const userMetrics = await storage.getUserInteractionMetrics(userId);
  
  // Determine which algorithm to use for this user
  // If user doesn't have an algorithm assignment, assign one randomly
  let algorithmId = 1; // Default algorithm ID
  const userAlgorithm = await storage.getUserAlgorithmAssignment(userId);
  
  if (userAlgorithm) {
    algorithmId = userAlgorithm.algorithmId;
  } else {
    // Simple A/B testing: assign randomly to algorithm 1 or 2
    algorithmId = Math.random() > 0.5 ? 1 : 2;
    await storage.createUserAlgorithmAssignment({
      userId,
      algorithmId
    });
  }
  
  // Get the algorithm config
  const algorithm = await storage.getMatchingAlgorithmConfig(algorithmId);
  
  // Get potential matches from waiting queue
  const potentialMatches = await storage.getMatchingUsers(preferences);
  
  if (potentialMatches.length === 0) {
    // No matches available
    return null;
  }
  
  // Score each potential match using the algorithm
  const scoredMatches = await Promise.all(
    potentialMatches.map(async (match) => {
      const matchUser = await storage.getUser(match.userId);
      const matchMetrics = await storage.getUserInteractionMetrics(match.userId);
      
      // Calculate compatibility score
      const score = calculateCompatibilityScore(
        user, 
        matchUser, 
        userMetrics, 
        matchMetrics, 
        algorithm.parameters
      );
      
      return {
        userId: match.userId,
        score
      };
    })
  );
  
  // Sort by score, descending
  scoredMatches.sort((a, b) => b.score - a.score);
  
  // Return the best match
  const bestMatch = scoredMatches[0]?.userId;
  
  if (bestMatch) {
    // Remove the matched user from the waiting queue
    await storage.removeFromWaitingQueue(bestMatch);
    
    // Log the match for algorithm performance tracking
    const session = await storage.createChatSession({
      user1Id: userId,
      user2Id: bestMatch,
      algorithmId,
      active: true
    });
    
    // Update last matched timestamp
    await storage.updateUser(userId, { 
      lastMatchedAt: new Date()
    });
    await storage.updateUser(bestMatch, { 
      lastMatchedAt: new Date()
    });
    
    return bestMatch;
  }
  
  return null;
}

function calculateCompatibilityScore(
  user1: User,
  user2: User,
  metrics1?: UserInteractionMetrics,
  metrics2?: UserInteractionMetrics,
  algorithmParams?: Record<string, number>
): number {
  // Default weights if algorithm parameters not provided
  const params = algorithmParams || {
    interestWeight: 0.5,
    chatTimeWeight: 0.3,
    durationWeight: 0.2
  };
  
  let score = 0;
  
  // 1. Interest compatibility (if both users have interests)
  if (user1.interests && user2.interests) {
    score += calculateInterestCompatibility(user1.interests, user2.interests) * params.interestWeight;
  }
  
  // 2. Preferred chat time compatibility
  if (metrics1?.preferredChatHours && metrics2?.preferredChatHours) {
    score += calculateTimeCompatibility(
      metrics1.preferredChatHours, 
      metrics2.preferredChatHours
    ) * params.chatTimeWeight;
  }
  
  // 3. Chat duration preference similarity
  if (metrics1?.avgChatDuration && metrics2?.avgChatDuration) {
    const durationDiff = Math.abs(metrics1.avgChatDuration - metrics2.avgChatDuration);
    // Normalize: closer durations = higher score
    const durationScore = Math.max(0, 1 - (durationDiff / 600)); // Normalize based on 10 minute difference
    score += durationScore * params.durationWeight;
  }
  
  return score;
}

function calculateInterestCompatibility(
  interests1: any[], 
  interests2: any[]
): number {
  // Extract interest names
  const names1 = new Set(interests1.map(i => i.name.toLowerCase()));
  const names2 = new Set(interests2.map(i => i.name.toLowerCase()));
  
  // Count common interests
  let commonCount = 0;
  for (const interest of names1) {
    if (names2.has(interest)) {
      commonCount++;
    }
  }
  
  // Calculate Jaccard similarity: intersection / union
  const unionSize = names1.size + names2.size - commonCount;
  return unionSize > 0 ? commonCount / unionSize : 0;
}

function calculateTimeCompatibility(
  hours1: Record<string, number>,
  hours2: Record<string, number>
): number {
  // Calculate dot product of time preference vectors
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;
  
  for (const timeSlot of ['morning', 'afternoon', 'evening', 'night']) {
    const pref1 = hours1[timeSlot] || 0;
    const pref2 = hours2[timeSlot] || 0;
    
    dotProduct += pref1 * pref2;
    magnitude1 += pref1 * pref1;
    magnitude2 += pref2 * pref2;
  }
  
  // Cosine similarity
  const magnitudeProduct = Math.sqrt(magnitude1) * Math.sqrt(magnitude2);
  return magnitudeProduct > 0 ? dotProduct / magnitudeProduct : 0;
}
```

## 3. Storage Interface Updates

We need to extend the storage interface to support the new tables and operations:

```typescript
// server/storage.ts - extend IStorage interface

export interface IStorage {
  // Existing methods...
  
  // User Interaction Metrics
  getUserInteractionMetrics(userId: number): Promise<UserInteractionMetrics | undefined>;
  createUserInteractionMetrics(metrics: InsertUserInteractionMetrics): Promise<UserInteractionMetrics>;
  updateUserInteractionMetrics(userId: number, updates: Partial<UserInteractionMetrics>): Promise<UserInteractionMetrics | undefined>;
  
  // User Interests
  getUserInterests(userId: number): Promise<UserInterests[]>;
  createUserInterest(interest: InsertUserInterests): Promise<UserInterests>;
  updateUserInterest(id: number, updates: Partial<UserInterests>): Promise<UserInterests | undefined>;
  
  // Matching Feedback
  createMatchingFeedback(feedback: InsertMatchingFeedback): Promise<MatchingFeedback>;
  getSessionFeedback(sessionId: number): Promise<MatchingFeedback[]>;
  
  // Matching Algorithm Config
  getMatchingAlgorithmConfig(id: number): Promise<MatchingAlgorithmConfig | undefined>;
  getActiveAlgorithms(): Promise<MatchingAlgorithmConfig[]>;
  createMatchingAlgorithmConfig(config: InsertMatchingAlgorithmConfig): Promise<MatchingAlgorithmConfig>;
  updateMatchingAlgorithmConfig(id: number, updates: Partial<MatchingAlgorithmConfig>): Promise<MatchingAlgorithmConfig | undefined>;
  
  // User Algorithm Assignment
  getUserAlgorithmAssignment(userId: number): Promise<UserAlgorithmAssignment | undefined>;
  createUserAlgorithmAssignment(assignment: InsertUserAlgorithmAssignment): Promise<UserAlgorithmAssignment>;
}

// Implement the interface methods in DatabaseStorage class
// ... (implementation details omitted for brevity)
```

## 4. Algorithm Testing and Evaluation

We'll need an admin interface to evaluate the performance of different matching algorithms. Here's a conceptual flowchart for algorithm evaluation:

1. Create at least two algorithm configurations with different parameter weights
2. Randomly assign users to algorithms when they join the platform
3. Track key metrics for each algorithm:
   - Average match quality score
   - Average chat duration
   - Feedback ratings
   - User retention rate

4. Automatically select the best-performing algorithm based on these metrics
5. Continue refining algorithm parameters based on performance data

## 5. Potential Issues and Mitigations

### Performance Concerns

1. **Matching Algorithm Complexity**: The matching algorithm could become computationally expensive with many users in the queue
   - Mitigation: Implement caching of compatibility scores, batch processing, and algorithmic optimizations
   
2. **Database Scaling**: Additional tables and frequent updates could impact database performance
   - Mitigation: Implement appropriate indexing, consider sharding for user metrics data

### Data Collection Challenges

1. **Cold Start Problem**: New users have no interaction history for matching
   - Mitigation: Implement a "new user" algorithm variant that relies more on explicit preferences
   
2. **Interest Extraction Accuracy**: Simple keyword extraction may not capture nuanced interests
   - Mitigation: Start with the simple approach and iterate; consider integrating with NLP service later

### Integration Risks

1. **Algorithmic Bias**: Ensure the algorithm doesn't create unintended grouping patterns
   - Mitigation: Regular monitoring of match distribution, diversity metrics in the admin dashboard
   
2. **Migration Without Disruption**: Adding these features without disrupting existing users
   - Mitigation: Gradual rollout, A/B testing, and careful database migration planning

## 6. Implementation Timeline

Phase 1 (Week 1): Database Schema Updates
- Create new tables
- Update existing tables
- Implement storage interface methods

Phase 2 (Week 2): Core Algorithm Implementation
- Implement data collection components
- Develop matching algorithm
- Integrate with existing queue system

Phase 3 (Week 3): Testing & Optimization
- Set up A/B testing framework
- Monitor algorithm performance
- Optimize based on initial results

Phase 4 (Week 4): UI Enhancements & Admin Dashboard
- Add feedback collection UI
- Develop admin interface for algorithm management
- Create performance monitoring dashboard