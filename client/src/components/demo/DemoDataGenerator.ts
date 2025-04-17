/**
 * Generates demo data for the analytics dashboard
 * This module contains functions to generate realistic mock data for demonstration purposes
 */

// Generate random engagement data over time
export function generateEngagementData(timeframe: 'day' | 'week' | 'month'): any[] {
  const data: any[] = [];
  const now = new Date();
  let dataPoints = 0;
  
  switch (timeframe) {
    case 'day':
      dataPoints = 24; // Hourly data points
      break;
    case 'week':
      dataPoints = 7; // Daily data points
      break;
    case 'month':
      dataPoints = 30; // Daily data points
      break;
  }
  
  // Base values and growth rates
  const baseActiveUsers = 4800;
  const baseConversations = 9600;
  const baseMessages = 240000;
  const growthRate = 0.02; // 2% growth per time period
  const volatility = 0.1; // Random noise factor
  
  // Generate data points
  for (let i = 0; i < dataPoints; i++) {
    const date = new Date(now);
    
    switch (timeframe) {
      case 'day':
        date.setHours(date.getHours() - (dataPoints - i));
        break;
      case 'week':
      case 'month':
        date.setDate(date.getDate() - (dataPoints - i));
        break;
    }
    
    // Calculate growth factor (more recent data has higher values)
    const growthFactor = 1 + (growthRate * i);
    
    // Add random noise for natural-looking data
    const randomNoise = () => 1 + ((Math.random() * 2 - 1) * volatility);
    
    // Add weekend effect - higher on weekends for 'week' and 'month' views
    let weekendBoost = 1;
    if (timeframe !== 'day') {
      const dayOfWeek = date.getDay();
      weekendBoost = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.15 : 1;
    }
    
    // Add time of day effect for 'day' view - peak in evening
    let timeOfDayFactor = 1;
    if (timeframe === 'day') {
      const hour = date.getHours();
      timeOfDayFactor = hour >= 17 && hour <= 22 ? 1.3 : 
                        hour >= 10 && hour <= 16 ? 1.1 :
                        hour >= 0 && hour <= 5 ? 0.6 : 1;
    }
    
    // Calculate values with all factors applied
    const activeUsers = Math.round(baseActiveUsers * growthFactor * randomNoise() * weekendBoost * timeOfDayFactor);
    const conversations = Math.round(baseConversations * growthFactor * randomNoise() * weekendBoost * timeOfDayFactor);
    const messages = Math.round(baseMessages * growthFactor * randomNoise() * weekendBoost * timeOfDayFactor);
    
    data.push({
      date: date.toISOString(),
      activeUsers,
      conversations,
      messages
    });
  }
  
  return data;
}

// Generate topic distribution data
export function generateTopicDistribution(): Record<string, number> {
  // Start with predetermined topic percentages
  const topics: Record<string, number> = {
    'Music': 16,
    'Technology': 14,
    'Travel': 12,
    'Movies_TV': 11,
    'Gaming': 10,
    'Sports': 9,
    'Education': 8,
    'Food': 7,
    'Fashion': 6,
    'Art': 5,
    'Other': 2
  };
  
  // Add slight randomness to each value
  let total = 0;
  Object.keys(topics).forEach(key => {
    // Random adjustment between -1% and +1%
    const randomAdjustment = Math.round((Math.random() * 2 - 1) * 1);
    topics[key] = Math.max(1, topics[key] + randomAdjustment);
    total += topics[key];
  });
  
  // Normalize to ensure total is exactly 100%
  Object.keys(topics).forEach(key => {
    topics[key] = Math.round((topics[key] / total) * 100);
  });
  
  return topics;
}

// Generate user growth data over time
export function generateUserGrowthData(timeframe: 'day' | 'week' | 'month'): any[] {
  const data: any[] = [];
  const now = new Date();
  let dataPoints = 0;
  
  switch (timeframe) {
    case 'day':
      dataPoints = 24; // Hourly data points
      break;
    case 'week':
      dataPoints = 7; // Daily data points
      break;
    case 'month':
      dataPoints = 30; // Daily data points
      break;
  }
  
  // Base values
  const baseNewUsers = 140;
  const baseReturningUsers = 320;
  const growthRate = 0.015; // 1.5% growth per time period
  const volatility = 0.15; // Random noise factor
  
  // Generate data points
  for (let i = 0; i < dataPoints; i++) {
    const date = new Date(now);
    
    switch (timeframe) {
      case 'day':
        date.setHours(date.getHours() - (dataPoints - i));
        break;
      case 'week':
      case 'month':
        date.setDate(date.getDate() - (dataPoints - i));
        break;
    }
    
    // Calculate growth factor
    const growthFactor = 1 + (growthRate * i);
    
    // Add random noise
    const randomNoise = () => 1 + ((Math.random() * 2 - 1) * volatility);
    
    // Calculate values
    const newUsers = Math.round(baseNewUsers * growthFactor * randomNoise());
    const returningUsers = Math.round(baseReturningUsers * growthFactor * randomNoise());
    
    data.push({
      timestamp: date.toISOString(),
      newUsers,
      returningUsers
    });
  }
  
  return data;
}

// Generate conversation length distribution
export function generateConversationLengthDistribution(): any[] {
  // Conversation duration ranges in minutes
  const durationRanges = [
    '0-1', '1-2', '2-5', '5-10', '10-15', '15-20', '20-30', '30+'
  ];
  
  // Base distribution - more conversations in the 5-15 minute range
  const baseCounts = [180, 340, 720, 980, 850, 620, 340, 170];
  const volatility = 0.1;
  
  return durationRanges.map((duration, index) => {
    // Add some randomness to the count
    const randomFactor = 1 + ((Math.random() * 2 - 1) * volatility);
    const count = Math.round(baseCounts[index] * randomFactor);
    
    return { duration, count };
  });
}

// Generate user metrics
export function generateUserMetrics(): any {
  return {
    activeUsers: 5428,
    newUsers: 1247,
    returningUsers: 4181,
    averageSessionDuration: 750000, // in milliseconds (12.5 minutes)
    sessionsPerUser: 2.8
  };
}

// Generate conversation metrics
export function generateConversationMetrics(): any {
  const totalConversations = 28973;
  const completedConversations = 19768;
  
  return {
    totalConversations,
    completedConversations,
    averageConversationDuration: 732500, // in milliseconds (12.2 minutes)
    averageMessagesPerConversation: 25.2,
    completionRate: (completedConversations / totalConversations) * 100
  };
}

// Generate top active users data
export function generateTopUsersData(): any[] {
  const users = [];
  
  for (let i = 1; i <= 10; i++) {
    // Generate random but plausible user data
    const conversationCount = Math.floor(Math.random() * 50 + 150);
    const messageCount = conversationCount * Math.floor(Math.random() * 15 + 20);
    const avgSessionDuration = Math.floor(Math.random() * 6 + 10);
    
    // Generate last active time (random time within the last 3 days)
    const lastActive = new Date();
    lastActive.setHours(lastActive.getHours() - Math.random() * 72);
    
    users.push({
      id: 1000 + i,
      username: `user${1000 + i}`,
      conversationCount,
      messageCount,
      avgSessionDuration,
      lastActive: lastActive.toISOString()
    });
  }
  
  // Sort by conversation count (descending)
  return users.sort((a, b) => b.conversationCount - a.conversationCount);
}

// Generate cohort retention data
export function generateRetentionCohorts(): any[] {
  const cohorts = [
    { cohort: 'Mar 2025', d1: 48, d7: 28, d30: 15 },
    { cohort: 'Feb 2025', d1: 47, d7: 26, d30: 14 },
    { cohort: 'Jan 2025', d1: 45, d7: 25, d30: 13 },
    { cohort: 'Dec 2024', d1: 43, d7: 24, d30: 12 }
  ];
  
  // Add slight randomness to each value
  cohorts.forEach(cohort => {
    cohort.d1 += Math.round((Math.random() * 2 - 1) * 2);
    cohort.d7 += Math.round((Math.random() * 2 - 1) * 2);
    cohort.d30 += Math.round((Math.random() * 2 - 1));
  });
  
  return cohorts;
}

// Generate all dashboard data
export function generateAllDemoData(timeframe: 'day' | 'week' | 'month'): any {
  return {
    engagementData: generateEngagementData(timeframe),
    userGrowth: generateUserGrowthData(timeframe),
    topicDistribution: generateTopicDistribution(),
    conversationLengthDistribution: generateConversationLengthDistribution(),
    userMetrics: generateUserMetrics(),
    conversationMetrics: generateConversationMetrics(),
    topUsers: generateTopUsersData(),
    retentionCohorts: generateRetentionCohorts()
  };
}