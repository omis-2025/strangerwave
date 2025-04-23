import { storage } from './storage';
import { User, UserInteractionMetrics, UserInterests } from '@shared/schema';
import { OpenAI } from 'openai';

/**
 * Types for AI matching implementation
 */
interface ExtractedInterest {
  interest: string;
  weight: number;
}

interface TimePreference {
  morning: number; // 5:00 - 11:59
  afternoon: number; // 12:00 - 16:59
  evening: number; // 17:00 - 21:59
  night: number; // 22:00 - 4:59
  [key: string]: number; // Allow string indexing
}

interface MatchingPreferences {
  interests: string[];
  languagePreference: string;
  conversationStyle: string;
  experienceLevel: string;
}

/**
 * Analyzes a chat message to extract potential user interests
 * @param message - The chat message content
 * @param userId - The user ID who sent the message
 */
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

/**
 * Extract keywords/topics from text content
 * This is a simplified implementation - in production, consider using a more 
 * sophisticated NLP approach or third-party API
 */
function extractKeywords(text: string): ExtractedInterest[] {
  // Define common topics/interests
  const commonInterests = [
    "music", "movies", "travel", "sports", "gaming", "books", "food", "technology",
    "art", "fashion", "fitness", "photography", "cooking", "pets", "nature",
    "politics", "science", "history", "languages", "dance", "theater", "coding",
    "education", "health", "cars", "finance", "business", "beauty", "spirituality",
    "news", "yoga", "meditation", "space", "environment", "sports", "hiking", "biking"
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

/**
 * Updates a user's top interests list in their profile for quick matching
 */
async function updateUserTopInterests(userId: number): Promise<void> {
  // Get all interests for user, sorted by weight
  const interests = await storage.getUserInterests(userId);
  const sortedInterests = interests
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 10) // Take top 10
    .map(i => ({ name: i.interest, weight: i.weight }));

  // Update user record with these interests
  if (sortedInterests.length > 0) {
    await storage.updateUser(userId, {
      interests: sortedInterests
    });
  }
}

/**
 * Tracks the end of a chat session and updates user metrics
 * @param userId - The user ID
 * @param sessionId - The chat session ID
 * @param duration - Duration of the chat in seconds
 */
export async function handleChatEnd(
  userId: number, 
  sessionId: number, 
  duration: number
): Promise<void> {
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
    await storage.createUserInteractionMetrics({
      userId,
      totalChats: 1,
      avgChatDuration: duration,
      chatAcceptRate: 1.0, // First chat was accepted
      chatRejectCount: 0,
      preferredChatHours: calculateTimeOfDayPreference(new Date()),
    });
  }

  // Calculate and store match quality score
  const messages = await storage.getSessionMessages(sessionId);
  const matchQuality = calculateMatchQuality(session, messages, duration);

  // Update the session with quality metrics
  await storage.updateChatSession(sessionId, {
    matchQualityScore: matchQuality,
  });
}

/**
 * Categorizes current time of day into a preference map
 */
function calculateTimeOfDayPreference(date: Date): TimePreference {
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

/**
 * Calculate match quality score based on various factors
 */
function calculateMatchQuality(
  session: any, 
  messages: any[], 
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
  const messageDistributionScore = messageCount > 0
    ? 5 * (1 - Math.abs(user1Messages - user2Messages) / messageCount)
    : 0;

  // Combine scores (simple average for now)
  score = (durationScore + messageCountScore + messageDistributionScore) / 3;

  // Scale to 0-1 range
  return Math.min(1, Math.max(0, score / 5));
}

/**
 * Calculate compatibility between two users for matching
 */
export function calculateCompatibilityScore(
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
      metrics1.preferredChatHours as TimePreference, 
      metrics2.preferredChatHours as TimePreference
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

/**
 * Calculate similarity between two users' interests
 */
function calculateInterestCompatibility(
  interests1: any[], 
  interests2: any[]
): number {
  // Extract interest names
  const names1 = new Set(interests1.map(i => i.name.toLowerCase()));
  const names2 = new Set(interests2.map(i => i.name.toLowerCase()));

  // Count common interests
  let commonCount = 0;
  // Use Array.from to avoid Set iteration issues
  Array.from(names1).forEach(interest => {
    if (names2.has(interest)) {
      commonCount++;
    }
  });

  // Calculate Jaccard similarity: intersection / union
  const unionSize = names1.size + names2.size - commonCount;
  return unionSize > 0 ? commonCount / unionSize : 0;
}

/**
 * Calculate compatibility between two users' preferred chat times
 */
function calculateTimeCompatibility(
  hours1: TimePreference,
  hours2: TimePreference
): number {
  // Calculate dot product of time preference vectors
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  for (const key of Object.keys(hours1) as Array<keyof TimePreference>) {
    dotProduct += hours1[key] * hours2[key];
    magnitude1 += hours1[key] * hours1[key];
    magnitude2 += hours2[key] * hours2[key];
  }

  // Cosine similarity
  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);

  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }

  return dotProduct / (magnitude1 * magnitude2);
}


export class EnhancedAIMatching {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async findOptimalMatch(user: MatchingPreferences, activeUsers: MatchingPreferences[]): Promise<string | null> {
    const compatibilityScores = await Promise.all(
      activeUsers.map(async (potentialMatch) => {
        const score = await this.calculateCompatibilityScore(user, potentialMatch);
        return { userId: potentialMatch.userId, score }; // Assuming userId is part of MatchingPreferences
      })
    );

    const bestMatch = compatibilityScores
      .sort((a, b) => b.score - a.score)
      .find(match => match.score > 0.7);

    return bestMatch ? bestMatch.userId : null;
  }

  private async calculateCompatibilityScore(user1: MatchingPreferences, user2: MatchingPreferences): Promise<number> {
    const sharedInterests = user1.interests.filter(interest => 
      user2.interests.includes(interest)
    ).length;

    const languageMatch = user1.languagePreference === user2.languagePreference ? 1 : 0.5;
    const styleMatch = user1.conversationStyle === user2.conversationStyle ? 1 : 0.7;
    const experienceMatch = user1.experienceLevel === user2.experienceLevel ? 1 : 0.8; // Added experience level

    return (sharedInterests * 0.4) + (languageMatch * 0.3) + (styleMatch * 0.2) + (experienceMatch * 0.1); // Adjusted weights
  }
}