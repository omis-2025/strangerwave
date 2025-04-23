/**
 * Utility functions for the StrangerWave AI matching system
 */

// Calculate similarity between two arrays of interests
export function calculateInterestSimilarity(interests1: string[], interests2: string[]): number {
  if (!interests1 || !interests2 || interests1.length === 0 || interests2.length === 0) {
    return 0;
  }
  
  // Convert to lowercase for case-insensitive comparison
  const set1 = new Set(interests1.map(i => i.toLowerCase()));
  const set2 = new Set(interests2.map(i => i.toLowerCase()));
  
  // Find common interests
  let commonCount = 0;
  set1.forEach(interest => {
    if (set2.has(interest)) {
      commonCount++;
    }
  });
  
  // Calculate Jaccard similarity: intersection / union
  const unionSize = set1.size + set2.size - commonCount;
  return unionSize > 0 ? commonCount / unionSize : 0;
}

// Get user preferences from storage (mock implementation)
export async function getUserPreferences(userId: string) {
  // This would typically fetch from database
  return {
    interests: ['technology', 'music', 'travel'],
    languages: ['en'],
    conversationStyle: 'casual',
    experienceLevel: 'intermediate'
  };
}

// Export other utilities that might be needed in the future
export * from './taxCalculation';