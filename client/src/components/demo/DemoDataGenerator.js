/**
 * Demo Data Generator
 * 
 * This utility generates realistic-looking data for the analytics dashboard demo.
 * The data is deterministic (based on seeds) to ensure consistency between views.
 */

// Seed-based random number generator for consistent data
function seededRandom(seed) {
  return function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

// Create a new random generator with a specific seed
const createRandom = (seed) => {
  const random = seededRandom(seed);
  return {
    // Random number between min and max
    number: (min, max) => min + random() * (max - min),
    // Random integer between min and max (inclusive)
    integer: (min, max) => Math.floor(min + random() * (max - min + 1)),
    // Random boolean with probability
    boolean: (probability = 0.5) => random() < probability,
    // Random item from array
    fromArray: (array) => array[Math.floor(random() * array.length)],
    // Random date between start and end
    date: (start, end) => {
      const startTime = start.getTime();
      const endTime = end.getTime();
      return new Date(startTime + random() * (endTime - startTime));
    }
  };
};

// Generate demo data for user metrics
export function generateUserMetrics(timeframe = 'month', seed = 12345) {
  const random = createRandom(seed);
  
  // Base metrics that look impressive but realistic
  const activeUsers = random.integer(4800, 5600);
  const totalSessions = random.integer(activeUsers * 1.8, activeUsers * 2.2);
  const avgSessionDuration = random.number(11.5, 13.5) * 60 * 1000; // 11.5-13.5 minutes in ms
  
  // Add small variance based on timeframe
  const timeframeMultiplier = timeframe === 'day' ? 0.85 : 
                             timeframe === 'week' ? 0.92 : 1;
  
  return {
    activeUsers: Math.round(activeUsers * timeframeMultiplier),
    totalSessions: Math.round(totalSessions * timeframeMultiplier),
    averageSessionDuration: avgSessionDuration * timeframeMultiplier
  };
}

// Generate demo data for conversation metrics
export function generateConversationMetrics(timeframe = 'month', seed = 67890) {
  const random = createRandom(seed);
  
  // Base metrics
  const totalConversations = random.integer(28000, 32000);
  const completionRate = random.number(65, 72); // percentage
  const completedConversations = Math.round(totalConversations * (completionRate / 100));
  const avgMessagesPerConversation = random.number(23, 28);
  const totalMessages = Math.round(totalConversations * avgMessagesPerConversation);
  const avgConversationDuration = random.number(11, 14) * 60 * 1000; // 11-14 minutes in ms
  
  // Add small variance based on timeframe
  const timeframeMultiplier = timeframe === 'day' ? 0.83 : 
                             timeframe === 'week' ? 0.91 : 1;
  
  return {
    totalConversations: Math.round(totalConversations * timeframeMultiplier),
    completedConversations: Math.round(completedConversations * timeframeMultiplier),
    completionRate,
    totalMessages: Math.round(totalMessages * timeframeMultiplier),
    averageMessagesPerConversation: avgMessagesPerConversation,
    averageConversationDuration: avgConversationDuration
  };
}

// Generate demo data for user growth
export function generateUserGrowth(timeframe = 'month', seed = 13579) {
  const random = createRandom(seed);
  
  // Determine number of data points and interval based on timeframe
  let dataPoints;
  let interval;
  let baseDate = new Date();
  
  switch (timeframe) {
    case 'day':
      dataPoints = 24; // hourly for a day
      interval = 60 * 60 * 1000; // 1 hour in ms
      baseDate = new Date(baseDate.setHours(0, 0, 0, 0));
      break;
    case 'week':
      dataPoints = 7; // daily for a week
      interval = 24 * 60 * 60 * 1000; // 1 day in ms
      baseDate = new Date(baseDate.setDate(baseDate.getDate() - 6));
      baseDate = new Date(baseDate.setHours(0, 0, 0, 0));
      break;
    case 'month':
      dataPoints = 30; // daily for a month
      interval = 24 * 60 * 60 * 1000; // 1 day in ms
      baseDate = new Date(baseDate.setDate(baseDate.getDate() - 29));
      baseDate = new Date(baseDate.setHours(0, 0, 0, 0));
      break;
    default:
      dataPoints = 30;
      interval = 24 * 60 * 60 * 1000;
      baseDate = new Date(baseDate.setDate(baseDate.getDate() - 29));
      baseDate = new Date(baseDate.setHours(0, 0, 0, 0));
  }
  
  // Generate growth data with realistic upward trend
  const growth = [];
  
  // Starting values
  let newUsersBase = random.integer(180, 220);
  let returningUsersBase = random.integer(450, 550);
  
  // Growth rates (subtle upward trend)
  const newUsersGrowthRate = random.number(1.01, 1.03);
  const returningUsersGrowthRate = random.number(1.015, 1.035);
  
  for (let i = 0; i < dataPoints; i++) {
    // Calculate date for this data point
    const pointDate = new Date(baseDate.getTime() + (i * interval));
    
    // Add some noise to the trend
    const newUsersNoise = random.number(0.85, 1.15);
    const returningUsersNoise = random.number(0.9, 1.1);
    
    // Calculate values with growth and noise
    const newUsers = Math.round(newUsersBase * Math.pow(newUsersGrowthRate, i) * newUsersNoise);
    const returningUsers = Math.round(returningUsersBase * Math.pow(returningUsersGrowthRate, i) * returningUsersNoise);
    
    // Add weekend boost for Saturday/Sunday
    const dayOfWeek = pointDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const weekendMultiplier = isWeekend ? random.number(1.2, 1.3) : 1;
    
    growth.push({
      timestamp: pointDate.toISOString(),
      newUsers: Math.round(newUsers * weekendMultiplier),
      returningUsers: Math.round(returningUsers * weekendMultiplier)
    });
  }
  
  return growth;
}

// Generate demo data for conversation length distribution
export function generateConversationLengthDistribution(timeframe = 'month', seed = 24680) {
  const random = createRandom(seed);
  
  // Distribution that looks realistic but impressive
  // Showing good engagement with many medium-length conversations
  const distribution = [
    { duration: 1, count: random.integer(1800, 2200) },   // < 1 min
    { duration: 5, count: random.integer(4500, 5500) },   // 1-5 min
    { duration: 15, count: random.integer(8000, 9000) },  // 5-15 min (peak)
    { duration: 30, count: random.integer(5000, 6000) },  // 15-30 min
    { duration: 60, count: random.integer(2200, 2800) },  // 30-60 min
    { duration: 90, count: random.integer(800, 1200) }    // > 60 min
  ];
  
  // Adjust counts based on timeframe
  if (timeframe === 'day') {
    distribution.forEach(bucket => {
      bucket.count = Math.round(bucket.count / 30); // Roughly 1/30th of monthly
    });
  } else if (timeframe === 'week') {
    distribution.forEach(bucket => {
      bucket.count = Math.round(bucket.count / 4.3); // Roughly 1/4.3 of monthly
    });
  }
  
  return distribution;
}

// Generate demo data for user retention
export function generateUserRetention(timeframe = 'month', seed = 97531) {
  const random = createRandom(seed);
  
  // Generate realistic user retention data points
  // These should represent session frequency vs. duration
  const users = [];
  
  for (let i = 0; i < 50; i++) {
    // More active users have more sessions and longer durations
    const activityLevel = random.number(0.1, 1.0);
    
    const sessionCount = Math.round(activityLevel * 20 + random.number(-2, 2));
    const avgSessionDuration = Math.round(activityLevel * 40 + 5 + random.number(-3, 3));
    const totalMessages = Math.round(sessionCount * avgSessionDuration * 0.8 + random.number(-10, 10));
    
    users.push({
      userId: i + 1,
      sessionCount: Math.max(1, sessionCount),
      avgSessionDuration: Math.max(3, avgSessionDuration),
      totalMessages: Math.max(sessionCount * 2, totalMessages)
    });
  }
  
  return users;
}

// Generate demo data for top users
export function generateTopUsers(timeframe = 'month', limit = 10, seed = 86420) {
  const random = createRandom(seed);
  
  const users = [];
  
  // Current date for last active calculation
  const now = new Date();
  
  for (let i = 0; i < limit; i++) {
    // More active users appear higher in the list
    const activityLevel = 1 - (i / limit) * 0.5; // Ranges from 1.0 to 0.5
    
    const conversationCount = Math.round(activityLevel * 35 + random.number(-2, 5));
    const messageCount = Math.round(conversationCount * (random.number(12, 18)));
    const avgSessionDuration = Math.round(activityLevel * 40 + 15 + random.number(-5, 10));
    
    // Calculate a random recent last active time (more active users = more recent)
    const hoursAgo = Math.round(random.number(0, 24 * (1 / activityLevel)));
    const lastActive = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
    
    users.push({
      id: i + 1,
      username: `user${random.integer(1000, 9999)}`,
      conversationCount,
      messageCount,
      avgSessionDuration,
      lastActive: lastActive.toISOString()
    });
  }
  
  // Sort by message count (highest first)
  users.sort((a, b) => b.messageCount - a.messageCount);
  
  return users;
}

// Generate demo data for topic distribution
export function generateTopicDistribution(timeframe = 'month', seed = 11223) {
  const random = createRandom(seed);
  
  // Create a realistic but impressive topic distribution
  // Focus on topics that suggest meaningful conversations
  return {
    'general_conversation': random.integer(30, 38),
    'tech': random.integer(12, 18),
    'travel': random.integer(10, 14),
    'music': random.integer(8, 12),
    'movies': random.integer(6, 10),
    'food': random.integer(5, 9),
    'sports': random.integer(4, 8),
    'education': random.integer(3, 5),
    'other': random.integer(2, 4)
  };
}

// Generate engagement data over time
export function generateEngagementData(days = 10, seed = 33445) {
  const random = createRandom(seed);
  
  const data = [];
  
  // Base values
  let activeUsersBase = random.integer(400, 450);
  let conversationsBase = random.integer(200, 230);
  let messagesBase = random.integer(3000, 3300);
  
  // Growth rates
  const activeUsersGrowth = random.number(1.03, 1.06);
  const conversationsGrowth = random.number(1.04, 1.07);
  const messagesGrowth = random.number(1.04, 1.08);
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days + 1);
  startDate.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    // Apply growth with some noise
    const activeUsers = Math.round(activeUsersBase * Math.pow(activeUsersGrowth, i) * random.number(0.92, 1.08));
    const conversations = Math.round(conversationsBase * Math.pow(conversationsGrowth, i) * random.number(0.9, 1.1));
    const messages = Math.round(messagesBase * Math.pow(messagesGrowth, i) * random.number(0.88, 1.12));
    
    data.push({
      date: date.toISOString().split('T')[0],
      activeUsers,
      conversations,
      messages
    });
  }
  
  return data;
}

// Generate retention cohort data
export function generateRetentionCohorts(seed = 55667) {
  const random = createRandom(seed);
  
  const cohorts = [];
  
  // Generate 4 weekly cohorts
  for (let i = 0; i < 4; i++) {
    // Newer cohorts might have slightly better metrics due to product improvements
    const recencyBonus = i * 0.02;
    
    cohorts.push({
      cohort: `Week ${4-i}`,
      users: random.integer(90, 130),
      d1: random.integer(44, 52) + recencyBonus,
      d7: random.integer(26, 34) + recencyBonus,
      d14: random.integer(16, 24) + recencyBonus,
      d30: random.integer(10, 18) + recencyBonus
    });
  }
  
  return cohorts;
}

// Generate all demo data needed for the dashboard
export function generateAllDemoData(timeframe = 'month') {
  return {
    userMetrics: generateUserMetrics(timeframe),
    conversationMetrics: generateConversationMetrics(timeframe),
    userGrowth: generateUserGrowth(timeframe),
    conversationLengthDistribution: generateConversationLengthDistribution(timeframe),
    userRetention: generateUserRetention(timeframe),
    topUsers: generateTopUsers(timeframe),
    topicDistribution: generateTopicDistribution(timeframe),
    engagementData: generateEngagementData(10),
    retentionCohorts: generateRetentionCohorts()
  };
}