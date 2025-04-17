import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Trophy, Star, Award, Calendar, Github } from "lucide-react";
import { useAuth } from '@/lib/useAuth';
import AchievementCard, { Achievement, UserAchievement } from '@/components/rewards/AchievementCard';
import StreakTracker, { UserStreak } from '@/components/rewards/StreakTracker';
import { apiRequest } from '@/lib/queryClient';

interface AchievementWithUserData extends UserAchievement {
  achievement: Achievement;
}

const RewardsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("streaks");
  
  // Fetch streaks data
  const { data: streaks, isLoading: streaksLoading, error: streaksError } = useQuery({
    queryKey: ['/api/users', user?.userId, 'streaks'],
    queryFn: () => 
      apiRequest('GET', `/api/users/${user?.userId}/streaks`)
        .then(res => res.json()),
    enabled: !!user?.userId
  });

  // Fetch achievements data
  const { data: achievements, isLoading: achievementsLoading, error: achievementsError } = useQuery({
    queryKey: ['/api/users', user?.userId, 'achievements'],
    queryFn: () => 
      apiRequest('GET', `/api/users/${user?.userId}/achievements`)
        .then(res => res.json()),
    enabled: !!user?.userId
  });
  
  // Fetch all possible achievements for the "Locked" tab
  const { data: allAchievements, isLoading: allAchievementsLoading } = useQuery({
    queryKey: ['/api/achievements'],
    queryFn: () => 
      apiRequest('GET', '/api/achievements')
        .then(res => res.json()),
    enabled: !!user?.userId
  });
  
  // Filter achievements by category
  const filterAchievementsByCategory = (achievements: AchievementWithUserData[] = [], category: string) => {
    return achievements.filter(a => a.achievement.category === category);
  };
  
  // Calculate which achievements are not yet earned
  const getLockedAchievements = () => {
    if (!allAchievements || !achievements) return [];
    
    const earnedIds = achievements.map((a: AchievementWithUserData) => a.achievementId);
    return allAchievements.filter((a: Achievement) => !earnedIds.includes(a.id));
  };
  
  // Calculate total achievement points
  const getTotalPoints = () => {
    if (!achievements) return 0;
    
    return achievements.reduce((total: number, achievement: AchievementWithUserData) => {
      return total + achievement.achievement.points;
    }, 0);
  };
  
  // Get user trust level based on achievement points
  const getTrustLevel = () => {
    const points = getTotalPoints();
    
    if (points >= 1001) return { name: 'Exemplary', level: 5 };
    if (points >= 501) return { name: 'Respected', level: 4 };
    if (points >= 201) return { name: 'Established', level: 3 };
    if (points >= 51) return { name: 'Trusted', level: 2 };
    return { name: 'New User', level: 1 };
  };

  if (!user) {
    return (
      <div className="container py-10">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            Please log in to view your rewards and achievements.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  const trustLevel = getTrustLevel();
  const lockedAchievements = getLockedAchievements();
  
  return (
    <div className="container py-6 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Your Rewards</h1>
          <p className="text-muted-foreground">Track your progress and achievements</p>
        </div>
        
        <div className="bg-muted p-3 rounded-lg">
          <div className="text-sm text-muted-foreground">Trust Level</div>
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span className="font-semibold">{trustLevel.name}</span>
            <span className="text-muted-foreground text-sm">(Level {trustLevel.level})</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {getTotalPoints()} total points
          </div>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 md:w-[400px]">
          <TabsTrigger value="streaks">
            <Calendar className="mr-2 h-4 w-4" />
            Streaks
          </TabsTrigger>
          <TabsTrigger value="achievements">
            <Trophy className="mr-2 h-4 w-4" />
            Unlocked
          </TabsTrigger>
          <TabsTrigger value="locked">
            <Award className="mr-2 h-4 w-4" />
            Locked
          </TabsTrigger>
        </TabsList>
        
        {/* Streaks Tab */}
        <TabsContent value="streaks" className="space-y-4">
          {streaksLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : streaksError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                There was a problem loading your streaks.
                <Button variant="link" className="p-0 h-auto text-white ml-2"
                  onClick={() => window.location.reload()}>
                  Try again
                </Button>
              </AlertDescription>
            </Alert>
          ) : streaks?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {streaks.map((streak: UserStreak) => (
                <StreakTracker 
                  key={streak.id} 
                  streak={streak} 
                  isPremium={user.isPremium} 
                />
              ))}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Streaks Yet</AlertTitle>
              <AlertDescription>
                Start logging in and chatting daily to build your streaks!
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
        
        {/* Unlocked Achievements Tab */}
        <TabsContent value="achievements">
          {achievementsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Array(6).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </div>
          ) : achievementsError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                There was a problem loading your achievements.
                <Button variant="link" className="p-0 h-auto text-white ml-2"
                  onClick={() => window.location.reload()}>
                  Try again
                </Button>
              </AlertDescription>
            </Alert>
          ) : achievements?.length > 0 ? (
            <div className="space-y-6">
              {['streak', 'milestone', 'quality', 'special', 'onboarding', 'engagement'].map(category => {
                const categoryAchievements = filterAchievementsByCategory(achievements, category);
                if (categoryAchievements.length === 0) return null;
                
                return (
                  <div key={category} className="space-y-3">
                    <h3 className="text-lg font-semibold capitalize">{category} Achievements</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {categoryAchievements.map(achievementData => (
                        <AchievementCard
                          key={achievementData.id}
                          achievement={achievementData.achievement}
                          earnedAt={achievementData.earnedAt}
                          isEarned={true}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Achievements Yet</AlertTitle>
              <AlertDescription>
                Keep using StrangerWave to earn your first achievement!
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
        
        {/* Locked Achievements Tab */}
        <TabsContent value="locked">
          {allAchievementsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Array(6).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </div>
          ) : lockedAchievements.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {lockedAchievements.map(achievement => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  isEarned={false}
                  showProgress={achievement.requirements?.type === 'LOGIN_STREAK' || 
                               achievement.requirements?.type === 'CHAT_STREAK' ||
                               achievement.requirements?.type === 'SESSION_COUNT'}
                  progressValue={getAchievementProgress(achievement, streaks)}
                  progressMax={achievement.requirements?.threshold || 100}
                />
              ))}
            </div>
          ) : (
            <Alert>
              <Trophy className="h-4 w-4 text-yellow-500" />
              <AlertTitle>All Achievements Unlocked!</AlertTitle>
              <AlertDescription>
                Congratulations! You've unlocked all available achievements.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper function to calculate achievement progress
function getAchievementProgress(achievement: Achievement, streaks?: UserStreak[]): number {
  if (!streaks || !achievement.requirements) return 0;
  
  const { type, threshold } = achievement.requirements;
  
  if (type === 'LOGIN_STREAK') {
    const loginStreak = streaks.find(s => s.streakType === 'login');
    return loginStreak?.currentStreak || 0;
  }
  
  if (type === 'CHAT_STREAK') {
    const chatStreak = streaks.find(s => s.streakType === 'chat');
    return chatStreak?.currentStreak || 0;
  }
  
  // For now, show 0 progress for other types
  return 0;
}

export default RewardsPage;