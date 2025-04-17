import { db } from '../../db';
import { messages, chatSessions } from '../../shared/schema';
import { eq, and, gte } from 'drizzle-orm';

/**
 * Advanced conversation analysis processor
 * Generates insights from conversation data to identify patterns and trends
 */
class ConversationInsightsGenerator {
  /**
   * Generate insights for a specific conversation
   * @param {number} sessionId - Conversation session ID
   * @returns {Promise<object>} - Generated insights
   */
  async generateConversationInsights(sessionId) {
    try {
      // Get all messages for the conversation
      const conversationMessages = await db
        .select()
        .from(messages)
        .where(eq(messages.sessionId, sessionId))
        .orderBy(({ timestamp }) => timestamp.asc());
      
      // Get session details
      const [session] = await db
        .select()
        .from(chatSessions)
        .where(eq(chatSessions.id, sessionId));
      
      if (!session || conversationMessages.length === 0) {
        throw new Error(`No data found for conversation ${sessionId}`);
      }
      
      // Generate insights
      const durationMetrics = this.calculateDurationMetrics(session, conversationMessages);
      const messageMetrics = this.calculateMessageMetrics(conversationMessages);
      const participantMetrics = this.calculateParticipantMetrics(conversationMessages);
      const contentAnalysis = this.analyzeContent(conversationMessages);
      const interactionPatterns = this.analyzeInteractionPatterns(conversationMessages);
      
      return {
        sessionId,
        durationMetrics,
        messageMetrics,
        participantMetrics,
        contentAnalysis,
        interactionPatterns,
        generatedAt: new Date()
      };
    } catch (error) {
      console.error(`Error generating insights for conversation ${sessionId}:`, error);
      throw error;
    }
  }
  
  /**
   * Generate aggregate insights across all conversations in given timeframe
   * @param {Date} startDate - Start date for analysis
   * @param {Date} endDate - End date for analysis
   * @returns {Promise<object>} - Aggregate insights
   */
  async generateAggregateInsights(startDate = new Date(0), endDate = new Date()) {
    try {
      // Get all sessions in the timeframe
      const sessions = await db
        .select()
        .from(chatSessions)
        .where(
          and(
            gte(chatSessions.startedAt, startDate),
            gte(endDate, chatSessions.startedAt)
          )
        );
      
      // Collect metrics across all sessions
      const sessionMetrics = [];
      for (const session of sessions) {
        try {
          const insights = await this.generateConversationInsights(session.id);
          sessionMetrics.push(insights);
        } catch (error) {
          console.warn(`Skipping session ${session.id} due to error:`, error.message);
        }
      }
      
      // Calculate aggregate metrics
      const aggregateInsights = this.calculateAggregateMetrics(sessionMetrics);
      
      return {
        timeframe: {
          startDate,
          endDate
        },
        aggregateInsights,
        sessionCount: sessions.length,
        analyzedSessionCount: sessionMetrics.length,
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Error generating aggregate insights:', error);
      throw error;
    }
  }
  
  /**
   * Calculate duration metrics for a conversation
   * @param {object} session - Chat session data
   * @param {Array} messages - Conversation messages
   * @returns {object} - Duration metrics
   */
  calculateDurationMetrics(session, messages) {
    // Calculate conversation duration
    const startTime = new Date(session.startedAt);
    const endTime = session.endedAt ? new Date(session.endedAt) : new Date();
    const totalDuration = endTime - startTime;
    
    // Calculate average time between messages
    let totalTimeBetween = 0;
    let countTimeBetween = 0;
    
    for (let i = 1; i < messages.length; i++) {
      const prevTime = new Date(messages[i-1].timestamp);
      const currTime = new Date(messages[i].timestamp);
      const timeDiff = currTime - prevTime;
      
      // Only count reasonable gaps (< 5 minutes)
      if (timeDiff > 0 && timeDiff < 5 * 60 * 1000) {
        totalTimeBetween += timeDiff;
        countTimeBetween++;
      }
    }
    
    const avgTimeBetweenMessages = countTimeBetween > 0 ? totalTimeBetween / countTimeBetween : 0;
    
    // Calculate response times
    let totalResponseTime = 0;
    let responseCount = 0;
    
    for (let i = 1; i < messages.length; i++) {
      // Only counts as a response if it's from a different user
      if (messages[i].senderId !== messages[i-1].senderId) {
        const prevTime = new Date(messages[i-1].timestamp);
        const currTime = new Date(messages[i].timestamp);
        const responseTime = currTime - prevTime;
        
        // Only count reasonable response times (< 1 minute)
        if (responseTime > 0 && responseTime < 60 * 1000) {
          totalResponseTime += responseTime;
          responseCount++;
        }
      }
    }
    
    const avgResponseTime = responseCount > 0 ? totalResponseTime / responseCount : 0;
    
    return {
      totalDuration,
      totalDurationMinutes: totalDuration / 60000,
      avgTimeBetweenMessages,
      avgResponseTime,
      isLongConversation: totalDuration > 10 * 60 * 1000, // > 10 minutes
      isResponsive: avgResponseTime < 10 * 1000 // < 10 seconds
    };
  }
  
  /**
   * Calculate message metrics for a conversation
   * @param {Array} messages - Conversation messages
   * @returns {object} - Message metrics
   */
  calculateMessageMetrics(messages) {
    // Calculate message lengths
    const messageLengths = messages.map(m => m.content.length);
    const totalLength = messageLengths.reduce((sum, len) => sum + len, 0);
    const avgMessageLength = messages.length > 0 ? totalLength / messages.length : 0;
    
    // Calculate message length distribution
    const lengthDistribution = {
      short: 0, // < 20 chars
      medium: 0, // 20-100 chars
      long: 0 // > 100 chars
    };
    
    messageLengths.forEach(len => {
      if (len < 20) lengthDistribution.short++;
      else if (len <= 100) lengthDistribution.medium++;
      else lengthDistribution.long++;
    });
    
    // Calculate percentage distribution
    const lengthPercentages = {
      short: messages.length > 0 ? (lengthDistribution.short / messages.length) * 100 : 0,
      medium: messages.length > 0 ? (lengthDistribution.medium / messages.length) * 100 : 0,
      long: messages.length > 0 ? (lengthDistribution.long / messages.length) * 100 : 0
    };
    
    return {
      messageCount: messages.length,
      totalLength,
      avgMessageLength,
      lengthDistribution,
      lengthPercentages,
      isVerbose: avgMessageLength > 100, // Arbitrary threshold
      isChatty: messages.length > 20 // Arbitrary threshold
    };
  }
  
  /**
   * Calculate participant metrics for a conversation
   * @param {Array} messages - Conversation messages
   * @returns {object} - Participant metrics
   */
  calculateParticipantMetrics(messages) {
    // Get unique participants
    const participants = Array.from(new Set(messages.map(m => m.senderId)));
    
    // Calculate messages per participant
    const messagesByParticipant = {};
    participants.forEach(participantId => {
      const participantMessages = messages.filter(m => m.senderId === participantId);
      messagesByParticipant[participantId] = {
        count: participantMessages.length,
        percentage: messages.length > 0 ? (participantMessages.length / messages.length) * 100 : 0,
        totalLength: participantMessages.reduce((sum, m) => sum + m.content.length, 0),
        avgLength: participantMessages.length > 0 ? 
          participantMessages.reduce((sum, m) => sum + m.content.length, 0) / participantMessages.length : 0
      };
    });
    
    // Determine conversation balance
    let maxPercentage = 0;
    let minPercentage = 100;
    
    Object.values(messagesByParticipant).forEach(metrics => {
      maxPercentage = Math.max(maxPercentage, metrics.percentage);
      minPercentage = Math.min(minPercentage, metrics.percentage);
    });
    
    const balanceScore = participants.length > 1 ? (100 - (maxPercentage - minPercentage)) / 100 : 0;
    
    return {
      participantCount: participants.length,
      messagesByParticipant,
      balanceScore,
      isBalanced: balanceScore > 0.7, // Arbitrary threshold
      dominantParticipant: Object.entries(messagesByParticipant)
        .sort(([, a], [, b]) => b.count - a.count)[0][0]
    };
  }
  
  /**
   * Analyze conversation content
   * @param {Array} messages - Conversation messages
   * @returns {object} - Content analysis
   */
  analyzeContent(messages) {
    // This would typically integrate with an NLP service for more advanced analysis
    // For now, implement a basic keyword-based approach
    
    // Combine all message content
    const allContent = messages.map(m => m.content.toLowerCase()).join(' ');
    
    // Calculate rough sentiment based on keyword presence
    const positiveWords = ['good', 'great', 'awesome', 'excellent', 'fantastic', 'happy', 'love', 'like', 'thanks', 'appreciate'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'sad', 'hate', 'dislike', 'sorry', 'unfortunate', 'disappointed'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    positiveWords.forEach(word => {
      const matches = allContent.match(new RegExp(`\\b${word}\\b`, 'g'));
      if (matches) positiveCount += matches.length;
    });
    
    negativeWords.forEach(word => {
      const matches = allContent.match(new RegExp(`\\b${word}\\b`, 'g'));
      if (matches) negativeCount += matches.length;
    });
    
    // Calculate sentiment score (-1 to 1)
    const totalSentimentWords = positiveCount + negativeCount;
    const sentimentScore = totalSentimentWords > 0 ? 
      (positiveCount - negativeCount) / totalSentimentWords : 0;
    
    // Calculate sentiment label
    let sentimentLabel;
    if (sentimentScore > 0.5) sentimentLabel = 'very_positive';
    else if (sentimentScore > 0.1) sentimentLabel = 'positive';
    else if (sentimentScore > -0.1) sentimentLabel = 'neutral';
    else if (sentimentScore > -0.5) sentimentLabel = 'negative';
    else sentimentLabel = 'very_negative';
    
    // Count question marks as proxy for engagement
    const questionCount = (allContent.match(/\?/g) || []).length;
    
    return {
      positiveCount,
      negativeCount,
      sentimentScore,
      sentimentLabel,
      questionCount,
      isInquisitive: questionCount > messages.length * 0.2, // 20% of messages have questions
      // This would be expanded with actual NLP topic analysis
      topicsPlaceholder: ['general_conversation']
    };
  }
  
  /**
   * Analyze interaction patterns in the conversation
   * @param {Array} messages - Conversation messages
   * @returns {object} - Interaction pattern analysis
   */
  analyzeInteractionPatterns(messages) {
    // Calculate back-and-forth exchange frequency
    let exchangeCount = 0;
    
    for (let i = 1; i < messages.length; i++) {
      if (messages[i].senderId !== messages[i-1].senderId) {
        exchangeCount++;
      }
    }
    
    const exchangeRate = messages.length > 1 ? exchangeCount / (messages.length - 1) : 0;
    
    // Calculate conversation flow (gaps between messages)
    const gaps = [];
    
    for (let i = 1; i < messages.length; i++) {
      const prevTime = new Date(messages[i-1].timestamp);
      const currTime = new Date(messages[i].timestamp);
      gaps.push(currTime - prevTime);
    }
    
    const avgGap = gaps.length > 0 ? gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length : 0;
    const maxGap = gaps.length > 0 ? Math.max(...gaps) : 0;
    const gapConsistency = this.calculateGapConsistency(gaps);
    
    // Determine conversation flow pattern
    let flowPattern;
    if (exchangeRate > 0.8) flowPattern = 'rapid_exchange';
    else if (exchangeRate > 0.5) flowPattern = 'balanced_exchange';
    else if (gapConsistency > 0.7) flowPattern = 'consistent_monologue';
    else flowPattern = 'irregular';
    
    return {
      exchangeCount,
      exchangeRate,
      avgGap,
      maxGap,
      gapConsistency,
      flowPattern,
      hasLongPauses: maxGap > 60 * 1000, // > 1 minute
      isRapidFire: avgGap < 10 * 1000 && exchangeRate > 0.7 // < 10 seconds between messages with high exchange rate
    };
  }
  
  /**
   * Calculate consistency in time gaps between messages
   * @param {Array} gaps - Array of time gaps between messages
   * @returns {number} - Consistency score (0-1)
   */
  calculateGapConsistency(gaps) {
    if (gaps.length < 2) return 1; // Perfect consistency with 0-1 gaps
    
    const avgGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
    const variance = gaps.reduce((sum, gap) => sum + Math.pow(gap - avgGap, 2), 0) / gaps.length;
    const stdDev = Math.sqrt(variance);
    
    // Calculate coefficient of variation (lower is more consistent)
    const cv = stdDev / avgGap;
    
    // Convert to consistency score (0-1)
    return Math.max(0, Math.min(1, 1 - (cv / 2)));
  }
  
  /**
   * Calculate aggregate metrics across multiple conversations
   * @param {Array} sessionMetrics - Array of conversation metrics
   * @returns {object} - Aggregate metrics
   */
  calculateAggregateMetrics(sessionMetrics) {
    if (sessionMetrics.length === 0) {
      return {
        noData: true
      };
    }
    
    // Calculate averages for key metrics
    const avgDuration = sessionMetrics.reduce((sum, s) => sum + s.durationMetrics.totalDuration, 0) / sessionMetrics.length;
    const avgMessageCount = sessionMetrics.reduce((sum, s) => sum + s.messageMetrics.messageCount, 0) / sessionMetrics.length;
    const avgMessageLength = sessionMetrics.reduce((sum, s) => sum + s.messageMetrics.avgMessageLength, 0) / sessionMetrics.length;
    const avgResponseTime = sessionMetrics.reduce((sum, s) => sum + s.durationMetrics.avgResponseTime, 0) / sessionMetrics.length;
    const avgBalanceScore = sessionMetrics.reduce((sum, s) => sum + s.participantMetrics.balanceScore, 0) / sessionMetrics.length;
    
    // Calculate sentiment distribution
    const sentimentCounts = {
      very_positive: 0,
      positive: 0,
      neutral: 0,
      negative: 0,
      very_negative: 0
    };
    
    sessionMetrics.forEach(s => {
      sentimentCounts[s.contentAnalysis.sentimentLabel]++;
    });
    
    const sentimentDistribution = {};
    Object.entries(sentimentCounts).forEach(([label, count]) => {
      sentimentDistribution[label] = (count / sessionMetrics.length) * 100;
    });
    
    // Calculate flow pattern distribution
    const flowPatternCounts = {
      rapid_exchange: 0,
      balanced_exchange: 0,
      consistent_monologue: 0,
      irregular: 0
    };
    
    sessionMetrics.forEach(s => {
      flowPatternCounts[s.interactionPatterns.flowPattern]++;
    });
    
    const flowPatternDistribution = {};
    Object.entries(flowPatternCounts).forEach(([pattern, count]) => {
      flowPatternDistribution[pattern] = (count / sessionMetrics.length) * 100;
    });
    
    return {
      avgDuration,
      avgDurationMinutes: avgDuration / 60000,
      avgMessageCount,
      avgMessageLength,
      avgResponseTime,
      avgBalanceScore,
      sentimentDistribution,
      flowPatternDistribution,
      conversationQualityScore: this.calculateConversationQualityScore(
        avgDuration / 60000, // Convert to minutes
        avgMessageCount,
        avgBalanceScore,
        avgResponseTime
      )
    };
  }
  
  /**
   * Calculate overall conversation quality score
   * @param {number} durationMinutes - Average conversation duration in minutes
   * @param {number} messageCount - Average message count
   * @param {number} balanceScore - Average balance score
   * @param {number} responseTimeMs - Average response time in milliseconds
   * @returns {number} - Quality score (0-100)
   */
  calculateConversationQualityScore(durationMinutes, messageCount, balanceScore, responseTimeMs) {
    // Duration factor (longer is better, up to a point)
    const durationFactor = Math.min(1, durationMinutes / 15) * 25; // 25% weight, max at 15 minutes
    
    // Message count factor (more messages is better, up to a point)
    const messageFactor = Math.min(1, messageCount / 30) * 25; // 25% weight, max at 30 messages
    
    // Balance factor (more balanced is better)
    const balanceFactor = balanceScore * 30; // 30% weight
    
    // Response time factor (faster is better, down to a point)
    const responseTimeFactor = Math.max(0, Math.min(1, 1 - (responseTimeMs - 2000) / 20000)) * 20; // 20% weight, optimal between 2-22 seconds
    
    // Calculate overall score
    return Math.round(durationFactor + messageFactor + balanceFactor + responseTimeFactor);
  }
}

export default new ConversationInsightsGenerator();