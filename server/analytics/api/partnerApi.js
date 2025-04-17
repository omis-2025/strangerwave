import express from 'express';
import { db } from '../../db';
import { analyticsEvents, messages, chatSessions } from '../../shared/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import UserBehaviorAnalyzer from '../processors/UserBehaviorAnalyzer';
import ConversationInsightsGenerator from '../processors/ConversationInsightsGenerator';

const router = express.Router();

/**
 * Authentication middleware for partner API
 * Validates API key and sets partner information on request
 */
const partnerAuthMiddleware = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'Missing API key'
    });
  }
  
  try {
    // This would normally validate against a partners table in the database
    // For demo purposes, using a simple check
    const partnerId = validatePartnerApiKey(apiKey);
    
    if (!partnerId) {
      return res.status(403).json({
        success: false,
        error: 'Invalid API key'
      });
    }
    
    // Set partner info on request object
    req.partner = {
      id: partnerId,
      name: `Partner ${partnerId}`,
      tier: 'premium', // Would be determined from database
      permissions: ['read_analytics', 'read_insights'] // Would be determined from database
    };
    
    next();
  } catch (error) {
    console.error('Partner auth error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
};

/**
 * Validate partner API key
 * @param {string} apiKey - API key to validate
 * @returns {number|null} - Partner ID if valid, null if invalid
 */
function validatePartnerApiKey(apiKey) {
  // This would normally check against a database
  // For demo purposes, using a simple check
  if (apiKey === 'PARTNER_API_KEY_1') return 1;
  if (apiKey === 'PARTNER_API_KEY_2') return 2;
  return null;
}

// Apply auth middleware to all routes
router.use(partnerAuthMiddleware);

/**
 * Partner dashboard statistics
 * GET /api/partner/stats
 */
router.get('/stats', async (req, res) => {
  try {
    const timeframe = req.query.timeframe || 'month';
    let startDate;
    
    // Calculate start date based on timeframe
    switch (timeframe) {
      case 'day':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }
    
    // These would be filtered by partner integration in a real implementation
    // For demo purposes, returning platform-wide stats
    
    // Get active users
    const activeUserEvents = await db
      .select()
      .from(analyticsEvents)
      .where(gte(analyticsEvents.timestamp, startDate))
      .groupBy(({ userId }) => userId);
    
    const activeUserCount = activeUserEvents.length;
    
    // Get conversation count
    const conversations = await db
      .select()
      .from(chatSessions)
      .where(gte(chatSessions.startedAt, startDate));
    
    const conversationCount = conversations.length;
    
    // Get message count
    const messageCount = await db
      .select({ count: ({ id }) => id.count() })
      .from(messages)
      .where(gte(messages.timestamp, startDate));
    
    // Get average conversation length
    let totalDuration = 0;
    let completedCount = 0;
    
    for (const conversation of conversations) {
      if (conversation.endedAt) {
        totalDuration += new Date(conversation.endedAt) - new Date(conversation.startedAt);
        completedCount++;
      }
    }
    
    const avgConversationDuration = completedCount > 0 ? totalDuration / completedCount : 0;
    
    // Return stats
    res.json({
      success: true,
      timeframe,
      stats: {
        activeUserCount,
        conversationCount,
        messageCount: messageCount[0]?.count || 0,
        avgConversationDuration,
        avgConversationDurationMinutes: avgConversationDuration / 60000
      }
    });
  } catch (error) {
    console.error('Error fetching partner stats:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching stats'
    });
  }
});

/**
 * Partner user insights
 * GET /api/partner/users/:userId/insights
 */
router.get('/users/:userId/insights', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId || isNaN(parseInt(userId))) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }
    
    // Generate user profile and insights
    const userProfile = await UserBehaviorAnalyzer.generateUserProfile(parseInt(userId));
    
    res.json({
      success: true,
      userId: parseInt(userId),
      insights: userProfile
    });
  } catch (error) {
    console.error(`Error fetching user insights for user ${req.params.userId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Error fetching user insights'
    });
  }
});

/**
 * Partner conversation insights
 * GET /api/partner/conversations/:sessionId/insights
 */
router.get('/conversations/:sessionId/insights', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId || isNaN(parseInt(sessionId))) {
      return res.status(400).json({
        success: false,
        error: 'Invalid session ID'
      });
    }
    
    // Generate conversation insights
    const insights = await ConversationInsightsGenerator.generateConversationInsights(parseInt(sessionId));
    
    res.json({
      success: true,
      sessionId: parseInt(sessionId),
      insights
    });
  } catch (error) {
    console.error(`Error fetching conversation insights for session ${req.params.sessionId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Error fetching conversation insights'
    });
  }
});

/**
 * Partner aggregate insights
 * GET /api/partner/insights/aggregate
 */
router.get('/insights/aggregate', async (req, res) => {
  try {
    const timeframe = req.query.timeframe || 'month';
    let startDate;
    
    // Calculate start date based on timeframe
    switch (timeframe) {
      case 'day':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }
    
    // Generate aggregate insights
    const insights = await ConversationInsightsGenerator.generateAggregateInsights(startDate);
    
    res.json({
      success: true,
      timeframe,
      insights
    });
  } catch (error) {
    console.error('Error fetching aggregate insights:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching aggregate insights'
    });
  }
});

/**
 * Partner topic distribution data
 * GET /api/partner/topics/distribution
 */
router.get('/topics/distribution', async (req, res) => {
  try {
    const timeframe = req.query.timeframe || 'month';
    let startDate;
    
    // Calculate start date based on timeframe
    switch (timeframe) {
      case 'day':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }
    
    // In a real implementation, this would analyze message content
    // For demo purposes, return simulated topic distribution
    
    // Generate simulated topic distribution
    // This would come from actual content analysis in production
    const topicDistribution = {
      'general_conversation': 35,
      'tech': 15,
      'travel': 12,
      'music': 10,
      'movies': 8,
      'food': 7,
      'sports': 6,
      'education': 4,
      'other': 3
    };
    
    res.json({
      success: true,
      timeframe,
      topicDistribution
    });
  } catch (error) {
    console.error('Error fetching topic distribution:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching topic distribution'
    });
  }
});

/**
 * Partner user retention data
 * GET /api/partner/users/retention
 */
router.get('/users/retention', async (req, res) => {
  try {
    // In a real implementation, this would analyze user retention
    // For demo purposes, return simulated retention data
    
    // Calculate retention by day (D1, D7, D30)
    // This would come from actual retention analysis in production
    const retentionData = {
      d1: 45, // 45% of users return after 1 day
      d7: 28, // 28% of users return after 7 days
      d14: 18, // 18% of users return after 14 days
      d30: 12, // 12% of users return after 30 days
      cohorts: [
        { cohort: 'Week 1', users: 100, d1: 48, d7: 30, d14: 20, d30: 15 },
        { cohort: 'Week 2', users: 120, d1: 50, d7: 32, d14: 22, d30: 16 },
        { cohort: 'Week 3', users: 90, d1: 44, d7: 28, d14: 19, d30: 12 },
        { cohort: 'Week 4', users: 110, d1: 46, d7: 29, d14: 18, d30: 13 }
      ]
    };
    
    res.json({
      success: true,
      retentionData
    });
  } catch (error) {
    console.error('Error fetching user retention data:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching user retention data'
    });
  }
});

export default router;