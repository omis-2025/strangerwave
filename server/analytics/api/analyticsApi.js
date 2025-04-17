import express from 'express';
import { db } from '../../db';
import { analyticsEvents, userSessions, conversationAnalytics, messages, chatSessions } from '../../shared/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { adminMiddleware } from '../../middleware/auth';

const router = express.Router();

// Secure all analytics routes with admin middleware
router.use(adminMiddleware);

// Get recent events
router.get('/events/recent', async (req, res) => {
  try {
    const { timeframe = 'day', limit = 100 } = req.query;
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
      default:
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    }
    
    const events = await db
      .select()
      .from(analyticsEvents)
      .where(gte(analyticsEvents.timestamp, startDate))
      .orderBy(({ timestamp }) => timestamp.desc())
      .limit(parseInt(limit, 10));
    
    res.json({ success: true, events });
  } catch (error) {
    console.error('Error fetching recent events:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get events for a specific user
router.get('/events/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { timeframe = 'day', limit = 100 } = req.query;
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
      default:
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    }
    
    const events = await db
      .select()
      .from(analyticsEvents)
      .where(
        and(
          eq(analyticsEvents.userId, parseInt(userId, 10)),
          gte(analyticsEvents.timestamp, startDate)
        )
      )
      .orderBy(({ timestamp }) => timestamp.desc())
      .limit(parseInt(limit, 10));
    
    res.json({ success: true, events });
  } catch (error) {
    console.error(`Error fetching events for user ${req.params.userId}:`, error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get aggregate user metrics
router.get('/metrics/users', async (req, res) => {
  try {
    const { timeframe = 'day' } = req.query;
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
      default:
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    }
    
    // Get unique active users
    const activeUsersQuery = await db
      .select({ userId: analyticsEvents.userId })
      .from(analyticsEvents)
      .where(gte(analyticsEvents.timestamp, startDate))
      .groupBy(({ userId }) => userId);
    
    const activeUsers = activeUsersQuery.filter(u => u.userId !== null).length;
    
    // Get total sessions
    const totalSessionsQuery = await db
      .select({ count: ({ id }) => id.count() })
      .from(userSessions)
      .where(gte(userSessions.startedAt, startDate));
    
    const totalSessions = totalSessionsQuery[0]?.count || 0;
    
    // Get average session duration
    const sessionDurationsQuery = await db
      .select({
        duration: ({ endedAt, startedAt }) => endedAt !== null ? 
          endedAt.toUnixTimestamp().minus(startedAt.toUnixTimestamp()).multiply(1000) : null
      })
      .from(userSessions)
      .where(
        and(
          gte(userSessions.startedAt, startDate),
          userSessions.endedAt.isNotNull()
        )
      );
    
    const sessionDurations = sessionDurationsQuery
      .map(s => s.duration)
      .filter(d => d !== null);
    
    const totalDuration = sessionDurations.reduce((sum, duration) => sum + Number(duration), 0);
    const averageDuration = sessionDurations.length > 0 ? totalDuration / sessionDurations.length : 0;
    
    res.json({
      success: true,
      metrics: {
        activeUsers,
        totalSessions,
        averageSessionDuration: averageDuration
      }
    });
  } catch (error) {
    console.error('Error fetching user metrics:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get conversation analytics
router.get('/metrics/conversations', async (req, res) => {
  try {
    const { timeframe = 'day' } = req.query;
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
      default:
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    }
    
    // Get conversation stats
    const conversationsQuery = await db
      .select()
      .from(chatSessions)
      .where(gte(chatSessions.startedAt, startDate));
    
    const conversations = conversationsQuery || [];
    
    // Calculate metrics
    const totalConversations = conversations.length;
    const completedConversations = conversations.filter(c => c.endedAt !== null).length;
    
    // Get message counts by conversation
    const messageCountsQuery = await db
      .select({
        sessionId: messages.sessionId,
        count: ({ id }) => id.count()
      })
      .from(messages)
      .where(gte(messages.timestamp, startDate))
      .groupBy(({ sessionId }) => sessionId);
    
    const messageCounts = messageCountsQuery || [];
    const totalMessages = messageCounts.reduce((sum, session) => sum + Number(session.count), 0);
    
    // Calculate average conversation duration
    const completedConversationsList = conversations.filter(c => c.endedAt !== null);
    const totalDuration = completedConversationsList.reduce(
      (sum, c) => sum + (new Date(c.endedAt).getTime() - new Date(c.startedAt).getTime()),
      0
    );
    
    const averageDuration = completedConversationsList.length > 0 
      ? totalDuration / completedConversationsList.length 
      : 0;
    
    res.json({
      success: true,
      metrics: {
        totalConversations,
        completedConversations,
        completionRate: totalConversations > 0 ? (completedConversations / totalConversations) * 100 : 0,
        totalMessages,
        averageMessagesPerConversation: totalConversations > 0 ? totalMessages / totalConversations : 0,
        averageConversationDuration: averageDuration
      }
    });
  } catch (error) {
    console.error('Error fetching conversation metrics:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user growth data
router.get('/growth/users', async (req, res) => {
  try {
    const { timeframe = 'day' } = req.query;
    let startDate;
    let interval;
    
    // Calculate start date and interval based on timeframe
    switch (timeframe) {
      case 'day':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        interval = 60 * 60 * 1000; // 1 hour in milliseconds
        break;
      case 'week':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        interval = 24 * 60 * 60 * 1000; // 1 day in milliseconds
        break;
      case 'month':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        interval = 24 * 60 * 60 * 1000 * 3; // 3 days in milliseconds
        break;
      default:
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        interval = 60 * 60 * 1000;
    }
    
    // Create time buckets
    const buckets = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= new Date()) {
      buckets.push({
        timestamp: new Date(currentDate).toISOString(),
        newUsers: 0,
        returningUsers: 0
      });
      
      currentDate = new Date(currentDate.getTime() + interval);
    }
    
    // Get first time events for each user to identify new users
    // This would come from actual data in a real implementation
    
    // For now, return sample data that matches the buckets
    const growth = buckets.map((bucket, index) => {
      // Generate some realistic sample data
      // In a real implementation, this would query the database
      const newUsers = Math.floor(Math.random() * 50) + 20; // 20-70 new users
      const returningUsers = Math.floor(Math.random() * 100) + 50; // 50-150 returning users
      
      return {
        ...bucket,
        newUsers,
        returningUsers
      };
    });
    
    res.json({
      success: true,
      timeframe,
      growth
    });
  } catch (error) {
    console.error('Error fetching user growth data:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get conversation length distribution
router.get('/conversations/length', async (req, res) => {
  try {
    const { timeframe = 'day' } = req.query;
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
      default:
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    }
    
    // Get completed conversations
    const conversationsQuery = await db
      .select()
      .from(chatSessions)
      .where(
        and(
          gte(chatSessions.startedAt, startDate),
          chatSessions.endedAt.isNotNull()
        )
      );
    
    const conversations = conversationsQuery || [];
    
    // Calculate durations and group into buckets
    const durationBuckets = {
      1: 0,  // < 1 minute
      5: 0,  // 1-5 minutes
      15: 0, // 5-15 minutes
      30: 0, // 15-30 minutes
      60: 0, // 30-60 minutes
      90: 0  // > 60 minutes
    };
    
    conversations.forEach(conversation => {
      const durationMs = new Date(conversation.endedAt).getTime() - new Date(conversation.startedAt).getTime();
      const durationMinutes = durationMs / (60 * 1000);
      
      if (durationMinutes < 1) durationBuckets[1]++;
      else if (durationMinutes < 5) durationBuckets[5]++;
      else if (durationMinutes < 15) durationBuckets[15]++;
      else if (durationMinutes < 30) durationBuckets[30]++;
      else if (durationMinutes < 60) durationBuckets[60]++;
      else durationBuckets[90]++;
    });
    
    // Format for chart
    const distribution = Object.entries(durationBuckets).map(([duration, count]) => ({
      duration: parseInt(duration, 10),
      count
    }));
    
    res.json({
      success: true,
      timeframe,
      distribution
    });
  } catch (error) {
    console.error('Error fetching conversation length distribution:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user retention data
router.get('/users/retention', async (req, res) => {
  try {
    const { timeframe = 'day' } = req.query;
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
      default:
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    }
    
    // This would come from actual user session data in a real implementation
    
    // For now, return sample data
    // In a real implementation, this would query the database for user retention metrics
    const users = [];
    
    // Generate 50 sample user data points
    for (let i = 0; i < 50; i++) {
      const sessionCount = Math.floor(Math.random() * 20) + 1; // 1-20 sessions
      const avgSessionDuration = Math.floor(Math.random() * 45) + 5; // 5-50 minutes
      const totalMessages = Math.floor(Math.random() * 200) + sessionCount * 5; // At least 5 messages per session
      
      users.push({
        userId: i + 1,
        sessionCount,
        avgSessionDuration,
        totalMessages
      });
    }
    
    res.json({
      success: true,
      timeframe,
      users
    });
  } catch (error) {
    console.error('Error fetching user retention data:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get top active users
router.get('/users/top', async (req, res) => {
  try {
    const { timeframe = 'day', limit = 10 } = req.query;
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
      default:
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    }
    
    // This would come from actual user activity data in a real implementation
    
    // For now, return sample data
    // In a real implementation, this would query the database for top users
    const users = [];
    
    // Generate sample top users
    for (let i = 0; i < parseInt(limit, 10); i++) {
      const conversationCount = Math.floor(Math.random() * 30) + 10; // 10-40 conversations
      const messageCount = conversationCount * (Math.floor(Math.random() * 15) + 5); // 5-20 messages per conversation
      const avgSessionDuration = Math.floor(Math.random() * 45) + 15; // 15-60 minutes
      
      // Calculate a random recent last active time
      const hoursAgo = Math.floor(Math.random() * 48); // 0-48 hours ago
      const lastActive = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
      
      users.push({
        id: i + 1,
        username: `user${i + 1}`,
        conversationCount,
        messageCount,
        avgSessionDuration,
        lastActive: lastActive.toISOString()
      });
    }
    
    // Sort by message count (highest first)
    users.sort((a, b) => b.messageCount - a.messageCount);
    
    res.json({
      success: true,
      timeframe,
      users
    });
  } catch (error) {
    console.error('Error fetching top users:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;