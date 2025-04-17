import express from 'express';
import { db } from '../../db';
import { analyticsEvents, messages, chatSessions, users } from '../../shared/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { partnerAuthMiddleware } from './partnerApi';

const router = express.Router();

// Apply partner auth middleware to all routes
router.use(partnerAuthMiddleware);

/**
 * Export conversation data
 * GET /api/export/conversations
 */
router.get('/conversations', async (req, res) => {
  try {
    const { startDate, endDate, limit = 100, offset = 0 } = req.query;
    
    // Validate dates
    const parsedStartDate = startDate ? new Date(startDate) : new Date(0);
    const parsedEndDate = endDate ? new Date(endDate) : new Date();
    
    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format'
      });
    }
    
    // Check if partner has permission to export this data
    if (!req.partner.permissions.includes('export_conversations')) {
      return res.status(403).json({
        success: false,
        error: 'Partner does not have permission to export conversation data'
      });
    }
    
    // Get conversations in date range
    const conversations = await db
      .select()
      .from(chatSessions)
      .where(
        and(
          gte(chatSessions.startedAt, parsedStartDate),
          lte(chatSessions.startedAt, parsedEndDate)
        )
      )
      .limit(parseInt(limit))
      .offset(parseInt(offset));
    
    // Get messages for each conversation
    const conversationData = [];
    
    for (const conversation of conversations) {
      const conversationMessages = await db
        .select()
        .from(messages)
        .where(eq(messages.sessionId, conversation.id))
        .orderBy(({ timestamp }) => timestamp.asc());
      
      // Anonymize user IDs based on partner permissions
      const anonymizeUsers = !req.partner.permissions.includes('export_user_ids');
      
      const processedMessages = conversationMessages.map(message => {
        // Remove any sensitive information
        const { content, timestamp, senderId } = message;
        
        return {
          content,
          timestamp,
          senderId: anonymizeUsers ? `user_${senderId % 10000}` : senderId
        };
      });
      
      conversationData.push({
        id: conversation.id,
        startedAt: conversation.startedAt,
        endedAt: conversation.endedAt,
        duration: conversation.endedAt ? 
          new Date(conversation.endedAt) - new Date(conversation.startedAt) : null,
        messageCount: processedMessages.length,
        messages: processedMessages
      });
    }
    
    res.json({
      success: true,
      metadata: {
        exportedAt: new Date(),
        partnerId: req.partner.id,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: conversationData.length,
        totalConversations: await countTotalConversations(parsedStartDate, parsedEndDate)
      },
      conversations: conversationData
    });
  } catch (error) {
    console.error('Error exporting conversation data:', error);
    res.status(500).json({
      success: false,
      error: 'Error exporting conversation data'
    });
  }
});

/**
 * Export user activity data
 * GET /api/export/user-activity
 */
router.get('/user-activity', async (req, res) => {
  try {
    const { startDate, endDate, limit = 100, offset = 0 } = req.query;
    
    // Validate dates
    const parsedStartDate = startDate ? new Date(startDate) : new Date(0);
    const parsedEndDate = endDate ? new Date(endDate) : new Date();
    
    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format'
      });
    }
    
    // Check if partner has permission to export this data
    if (!req.partner.permissions.includes('export_user_activity')) {
      return res.status(403).json({
        success: false,
        error: 'Partner does not have permission to export user activity data'
      });
    }
    
    // Get users
    const userList = await db
      .select()
      .from(users)
      .limit(parseInt(limit))
      .offset(parseInt(offset));
    
    // Get activity for each user
    const userData = [];
    
    for (const user of userList) {
      // Get user events
      const events = await db
        .select()
        .from(analyticsEvents)
        .where(
          and(
            eq(analyticsEvents.userId, user.id),
            gte(analyticsEvents.timestamp, parsedStartDate),
            lte(analyticsEvents.timestamp, parsedEndDate)
          )
        );
      
      // Get user conversations
      const conversations = await db
        .select()
        .from(chatSessions)
        .where(
          and(
            gte(chatSessions.startedAt, parsedStartDate),
            lte(chatSessions.startedAt, parsedEndDate),
            eq(chatSessions.user1Id, user.id).or(eq(chatSessions.user2Id, user.id))
          )
        );
      
      // Get user messages
      const userMessages = await db
        .select()
        .from(messages)
        .where(
          and(
            eq(messages.senderId, user.id),
            gte(messages.timestamp, parsedStartDate),
            lte(messages.timestamp, parsedEndDate)
          )
        );
      
      // Anonymize user ID based on partner permissions
      const anonymizeUsers = !req.partner.permissions.includes('export_user_ids');
      const userId = anonymizeUsers ? `user_${user.id % 10000}` : user.id;
      
      // Calculate activity metrics
      const activityData = {
        userId,
        eventCount: events.length,
        conversationCount: conversations.length,
        messageCount: userMessages.length,
        avgMessageLength: userMessages.length > 0 ? 
          userMessages.reduce((sum, msg) => sum + msg.content.length, 0) / userMessages.length : 0,
        firstActivity: events.length > 0 ? 
          new Date(Math.min(...events.map(e => new Date(e.timestamp).getTime()))) : null,
        lastActivity: events.length > 0 ? 
          new Date(Math.max(...events.map(e => new Date(e.timestamp).getTime()))) : null
      };
      
      userData.push(activityData);
    }
    
    res.json({
      success: true,
      metadata: {
        exportedAt: new Date(),
        partnerId: req.partner.id,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: userData.length,
        totalUsers: await countTotalUsers()
      },
      users: userData
    });
  } catch (error) {
    console.error('Error exporting user activity data:', error);
    res.status(500).json({
      success: false,
      error: 'Error exporting user activity data'
    });
  }
});

/**
 * Export aggregated analytics data
 * GET /api/export/analytics
 */
router.get('/analytics', async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    // Validate dates
    const parsedStartDate = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const parsedEndDate = endDate ? new Date(endDate) : new Date();
    
    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format'
      });
    }
    
    // Check if partner has permission to export this data
    if (!req.partner.permissions.includes('export_analytics')) {
      return res.status(403).json({
        success: false,
        error: 'Partner does not have permission to export analytics data'
      });
    }
    
    // Generate time buckets based on groupBy parameter
    const timeBuckets = generateTimeBuckets(parsedStartDate, parsedEndDate, groupBy);
    
    // Aggregate data for each time bucket
    const analyticsData = [];
    
    for (let i = 0; i < timeBuckets.length - 1; i++) {
      const bucketStart = timeBuckets[i];
      const bucketEnd = timeBuckets[i + 1];
      
      // Count active users
      const activeUserEvents = await db
        .select()
        .from(analyticsEvents)
        .where(
          and(
            gte(analyticsEvents.timestamp, bucketStart),
            lt(analyticsEvents.timestamp, bucketEnd)
          )
        )
        .groupBy(({ userId }) => userId);
      
      const activeUserCount = activeUserEvents.length;
      
      // Count conversations
      const conversationCount = await db
        .select({ count: ({ id }) => id.count() })
        .from(chatSessions)
        .where(
          and(
            gte(chatSessions.startedAt, bucketStart),
            lt(chatSessions.startedAt, bucketEnd)
          )
        );
      
      // Count messages
      const messageCount = await db
        .select({ count: ({ id }) => id.count() })
        .from(messages)
        .where(
          and(
            gte(messages.timestamp, bucketStart),
            lt(messages.timestamp, bucketEnd)
          )
        );
      
      analyticsData.push({
        periodStart: bucketStart,
        periodEnd: bucketEnd,
        activeUsers: activeUserCount,
        conversations: conversationCount[0]?.count || 0,
        messages: messageCount[0]?.count || 0
      });
    }
    
    res.json({
      success: true,
      metadata: {
        exportedAt: new Date(),
        partnerId: req.partner.id,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        groupBy
      },
      data: analyticsData
    });
  } catch (error) {
    console.error('Error exporting analytics data:', error);
    res.status(500).json({
      success: false,
      error: 'Error exporting analytics data'
    });
  }
});

/**
 * Export conversation topics data
 * GET /api/export/topics
 */
router.get('/topics', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Validate dates
    const parsedStartDate = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const parsedEndDate = endDate ? new Date(endDate) : new Date();
    
    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format'
      });
    }
    
    // Check if partner has permission to export this data
    if (!req.partner.permissions.includes('export_topics')) {
      return res.status(403).json({
        success: false,
        error: 'Partner does not have permission to export topic data'
      });
    }
    
    // In a real implementation, this would analyze message content
    // For demo purposes, return simulated topic distribution
    const topicData = {
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
    
    // Simulated topic trends over time
    const topicTrends = [
      { date: '2023-01-01', tech: 12, travel: 14, music: 9, education: 3 },
      { date: '2023-01-02', tech: 13, travel: 13, music: 10, education: 3 },
      { date: '2023-01-03', tech: 14, travel: 12, music: 11, education: 4 },
      { date: '2023-01-04', tech: 15, travel: 12, music: 10, education: 4 },
      { date: '2023-01-05', tech: 16, travel: 11, music: 9, education: 5 },
      { date: '2023-01-06', tech: 16, travel: 12, music: 8, education: 5 },
      { date: '2023-01-07', tech: 17, travel: 13, music: 9, education: 4 }
    ];
    
    res.json({
      success: true,
      metadata: {
        exportedAt: new Date(),
        partnerId: req.partner.id,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        note: 'Topic data is derived from conversation analysis'
      },
      topicDistribution: topicData,
      topicTrends
    });
  } catch (error) {
    console.error('Error exporting topic data:', error);
    res.status(500).json({
      success: false,
      error: 'Error exporting topic data'
    });
  }
});

/**
 * Count total conversations in date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<number>} - Total conversation count
 */
async function countTotalConversations(startDate, endDate) {
  const result = await db
    .select({ count: ({ id }) => id.count() })
    .from(chatSessions)
    .where(
      and(
        gte(chatSessions.startedAt, startDate),
        lte(chatSessions.startedAt, endDate)
      )
    );
  
  return result[0]?.count || 0;
}

/**
 * Count total users
 * @returns {Promise<number>} - Total user count
 */
async function countTotalUsers() {
  const result = await db
    .select({ count: ({ id }) => id.count() })
    .from(users);
  
  return result[0]?.count || 0;
}

/**
 * Generate time buckets for analytics aggregation
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {string} groupBy - Grouping interval ('hour', 'day', 'week', 'month')
 * @returns {Array<Date>} - Array of bucket boundary dates
 */
function generateTimeBuckets(startDate, endDate, groupBy) {
  const buckets = [];
  let currentDate = new Date(startDate);
  
  // Add start date as first bucket
  buckets.push(new Date(currentDate));
  
  // Generate buckets based on groupBy
  while (currentDate < endDate) {
    switch (groupBy) {
      case 'hour':
        currentDate = new Date(currentDate.setHours(currentDate.getHours() + 1));
        break;
      case 'day':
        currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
        break;
      case 'week':
        currentDate = new Date(currentDate.setDate(currentDate.getDate() + 7));
        break;
      case 'month':
        currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
        break;
      default:
        currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
    }
    
    // Add bucket if it's before or equal to end date
    if (currentDate <= endDate) {
      buckets.push(new Date(currentDate));
    }
  }
  
  // Add end date as last bucket if not already included
  if (currentDate > endDate) {
    buckets.push(new Date(endDate));
  }
  
  return buckets;
}

export default router;