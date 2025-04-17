import { db } from '../../db';
import { analyticsEvents, messages } from '../../shared/schema';
import { eq, and, gte } from 'drizzle-orm';

/**
 * Advanced user behavior analysis processor
 * Processes user data to generate behavior profiles and insights
 */
class UserBehaviorAnalyzer {
  /**
   * Generate or update a user behavior profile based on their activity
   * @param {number} userId - User ID to analyze
   * @returns {Promise<object>} - The generated behavior profile
   */
  async generateUserProfile(userId) {
    try {
      // Get user's events in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const events = await db
        .select()
        .from(analyticsEvents)
        .where(
          and(
            eq(analyticsEvents.userId, userId),
            gte(analyticsEvents.timestamp, thirtyDaysAgo)
          )
        );
      
      // Get user's messages
      const userMessages = await db
        .select()
        .from(messages)
        .where(eq(messages.senderId, userId));
      
      // Initialize profile data
      const conversationStyle = this.analyzeConversationStyle(userMessages);
      const topicInterests = this.analyzeTopicInterests(userMessages);
      const activityPatterns = this.analyzeActivityPatterns(events);
      const engagementMetrics = this.calculateEngagementMetrics(events, userMessages);
      
      return {
        userId,
        conversationStyle,
        topicInterests,
        activityPatterns,
        engagementMetrics,
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error generating user behavior profile:', error);
      throw error;
    }
  }
  
  /**
   * Analyze conversation style based on message patterns
   * @param {Array} messages - User's messages
   * @returns {object} - Conversation style data
   */
  analyzeConversationStyle(messages) {
    // Calculate average message length
    const totalLength = messages.reduce((sum, msg) => sum + msg.content.length, 0);
    const avgMessageLength = messages.length > 0 ? totalLength / messages.length : 0;
    
    // Analyze response time patterns
    const responseTimes = [];
    const messagesBySession = this.groupMessagesBySession(messages);
    
    for (const sessionMessages of Object.values(messagesBySession)) {
      // Sort messages by timestamp
      sessionMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      
      // Calculate time between messages
      for (let i = 1; i < sessionMessages.length; i++) {
        const timeDiff = new Date(sessionMessages[i].timestamp) - new Date(sessionMessages[i-1].timestamp);
        if (timeDiff > 0 && timeDiff < 5 * 60 * 1000) { // Ignore gaps larger than 5 minutes
          responseTimes.push(timeDiff);
        }
      }
    }
    
    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;
    
    // Identify conversation initiator pattern
    const initiatedCount = this.countConversationsInitiated(messages);
    
    return {
      avgMessageLength,
      avgResponseTime,
      initiatedCount,
      messageVelocity: messages.length / (30 * 24 * 60 * 60 * 1000), // Messages per millisecond in last 30 days
      isVerbose: avgMessageLength > 100, // Arbitrary threshold
      isResponsive: avgResponseTime < 10000, // Less than 10 seconds
      isInitiator: initiatedCount > 5 // Arbitrary threshold
    };
  }
  
  /**
   * Group messages by chat session
   * @param {Array} messages - User's messages
   * @returns {object} - Messages grouped by session ID
   */
  groupMessagesBySession(messages) {
    return messages.reduce((groups, message) => {
      const sessionId = message.sessionId;
      if (!groups[sessionId]) {
        groups[sessionId] = [];
      }
      groups[sessionId].push(message);
      return groups;
    }, {});
  }
  
  /**
   * Count conversations initiated by the user
   * @param {Array} messages - User's messages
   * @returns {number} - Number of conversations initiated
   */
  countConversationsInitiated(messages) {
    const sessionFirstMessages = {};
    
    // Group by session and find first message in each session
    for (const message of messages) {
      const sessionId = message.sessionId;
      
      if (!sessionFirstMessages[sessionId] || 
          new Date(message.timestamp) < new Date(sessionFirstMessages[sessionId].timestamp)) {
        sessionFirstMessages[sessionId] = message;
      }
    }
    
    // Count sessions where user was first to send message
    let initiatedCount = 0;
    for (const sessionId in sessionFirstMessages) {
      // This would require additional logic to determine which user initiated
      // For now, use a placeholder approximation
      const firstMessage = sessionFirstMessages[sessionId];
      if (firstMessage && firstMessage.timestamp) {
        initiatedCount++;
      }
    }
    
    return initiatedCount;
  }
  
  /**
   * Analyze topic interests based on message content
   * @param {Array} messages - User's messages
   * @returns {object} - Topic interests data
   */
  analyzeTopicInterests(messages) {
    // This would typically integrate with an NLP service for topic extraction
    // For now, implement a basic keyword-based approach
    const keywords = {
      'tech': ['computer', 'software', 'programming', 'app', 'technology', 'code'],
      'music': ['music', 'song', 'band', 'concert', 'album', 'artist'],
      'movies': ['movie', 'film', 'actor', 'director', 'cinema', 'watch'],
      'sports': ['game', 'team', 'player', 'sports', 'match', 'ball'],
      'travel': ['travel', 'trip', 'country', 'visit', 'flight', 'city'],
      'food': ['food', 'restaurant', 'eat', 'cook', 'recipe', 'delicious']
    };
    
    const topicCounts = {};
    Object.keys(keywords).forEach(topic => topicCounts[topic] = 0);
    
    // Count keyword occurrences in messages
    for (const message of messages) {
      const content = message.content.toLowerCase();
      
      for (const [topic, words] of Object.entries(keywords)) {
        for (const word of words) {
          if (content.includes(word)) {
            topicCounts[topic]++;
            break; // Only count once per topic per message
          }
        }
      }
    }
    
    // Calculate total occurrences
    const totalOccurrences = Object.values(topicCounts).reduce((sum, count) => sum + count, 0);
    
    // Convert counts to percentages
    const topicPercentages = {};
    for (const [topic, count] of Object.entries(topicCounts)) {
      topicPercentages[topic] = totalOccurrences > 0 ? (count / totalOccurrences) * 100 : 0;
    }
    
    // Sort topics by percentage
    const sortedTopics = Object.entries(topicPercentages)
      .sort(([, a], [, b]) => b - a)
      .map(([topic, percentage]) => ({ topic, percentage }));
    
    return {
      primaryInterests: sortedTopics.slice(0, 3).map(item => item.topic),
      interestDistribution: topicPercentages,
      totalTopicReferences: totalOccurrences
    };
  }
  
  /**
   * Analyze user activity patterns
   * @param {Array} events - User's events
   * @returns {object} - Activity patterns data
   */
  analyzeActivityPatterns(events) {
    // Initialize counters
    const hourCounts = Array(24).fill(0);
    const dayOfWeekCounts = Array(7).fill(0);
    
    // Count events by hour and day of week
    for (const event of events) {
      const date = new Date(event.timestamp);
      const hour = date.getHours();
      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
      
      hourCounts[hour]++;
      dayOfWeekCounts[dayOfWeek]++;
    }
    
    // Find peak activity hours (top 3)
    const peakHours = hourCounts
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(item => item.hour);
    
    // Find most active day of week
    const mostActiveDay = dayOfWeekCounts
      .map((count, day) => ({ day, count }))
      .sort((a, b) => b.count - a.count)[0].day;
    
    // Calculate consistency (standard deviation of hourly activity)
    const avgHourlyCount = hourCounts.reduce((sum, count) => sum + count, 0) / 24;
    const hourlyVariance = hourCounts.reduce((sum, count) => sum + Math.pow(count - avgHourlyCount, 2), 0) / 24;
    const consistencyScore = 1 - Math.min(1, Math.sqrt(hourlyVariance) / avgHourlyCount);
    
    return {
      hourlyDistribution: hourCounts,
      dailyDistribution: dayOfWeekCounts,
      peakHours,
      mostActiveDay,
      consistencyScore,
      isNightOwl: peakHours.some(hour => hour >= 22 || hour <= 4),
      isWeekendUser: dayOfWeekCounts[0] + dayOfWeekCounts[6] > events.length * 0.4 // 40% of activity on weekends
    };
  }
  
  /**
   * Calculate user engagement metrics
   * @param {Array} events - User's events
   * @param {Array} messages - User's messages
   * @returns {object} - Engagement metrics data
   */
  calculateEngagementMetrics(events, messages) {
    // Count sessions
    const sessionIds = new Set();
    events.forEach(event => {
      if (event.sessionId) {
        sessionIds.add(event.sessionId);
      }
    });
    
    // Count conversations
    const conversationIds = new Set();
    messages.forEach(message => {
      conversationIds.add(message.sessionId);
    });
    
    // Calculate messages per conversation
    const messagesPerConversation = conversationIds.size > 0 ? messages.length / conversationIds.size : 0;
    
    // Calculate conversation completion rate
    // This would need more complex logic to determine which conversations were "completed"
    // For now, use a placeholder approximation
    const completedConversations = conversationIds.size * 0.7; // Assuming 70% completion rate
    const completionRate = conversationIds.size > 0 ? completedConversations / conversationIds.size : 0;
    
    // Calculate session frequency (sessions per day)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const daysActive = new Set();
    events.forEach(event => {
      const date = new Date(event.timestamp);
      if (date >= thirtyDaysAgo) {
        daysActive.add(date.toDateString());
      }
    });
    
    const sessionFrequency = daysActive.size > 0 ? sessionIds.size / daysActive.size : 0;
    
    // Calculate retention score (0-100)
    const retentionScore = Math.min(100, 
      (daysActive.size / 30) * 40 + // 40% weight on days active
      Math.min(1, messagesPerConversation / 15) * 30 + // 30% weight on messages per conversation
      completionRate * 30 // 30% weight on conversation completion
    );
    
    return {
      totalSessions: sessionIds.size,
      totalConversations: conversationIds.size,
      messagesPerConversation,
      completionRate,
      sessionFrequency,
      daysActive: daysActive.size,
      retentionScore,
      engagementLevel: this.calculateEngagementLevel(retentionScore)
    };
  }
  
  /**
   * Calculate engagement level based on retention score
   * @param {number} retentionScore - User retention score (0-100)
   * @returns {string} - Engagement level
   */
  calculateEngagementLevel(retentionScore) {
    if (retentionScore >= 80) return 'highly_engaged';
    if (retentionScore >= 50) return 'engaged';
    if (retentionScore >= 30) return 'casual';
    return 'inactive';
  }
}

export default new UserBehaviorAnalyzer();