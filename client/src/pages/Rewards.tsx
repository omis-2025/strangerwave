import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Trophy, Star, Award, Calendar, Github, Gift, Users, Share2 } from "lucide-react";
import { FiCopy, FiCheckCircle, FiGift, FiAward, FiUsers, FiShare2 } from "react-icons/fi";
import { useAuth } from '@/lib/useAuth';
import AchievementCard, { Achievement, UserAchievement } from '@/components/rewards/AchievementCard';
import StreakTracker, { UserStreak } from '@/components/rewards/StreakTracker';
import { apiRequest } from '@/lib/queryClient';
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import EmptyState from "@/components/EmptyState";
import Loader from "@/components/Loader";

// Type definitions for referral system
interface ReferralCode {
  id: number;
  userId: number;
  code: string;
  isActive: boolean;
  isCreatorCode?: boolean;
  bonusPercentage?: number;
  createdAt: string;
}

interface Referral {
  id: number;
  referrerId: number;
  referredId: number;
  referralCode: string;
  status: 'pending' | 'converted';
  rewardClaimed: boolean;
  createdAt: string;
  referredUser?: {
    id: number;
    username: string;
  };
}

interface ReferralReward {
  id: number;
  name: string;
  description: string;
  type: 'premium_days' | 'tokens' | 'other';
  value: any;
  requiredReferrals: number;
  isActive: boolean;
}

interface UserReferralReward {
  id: number;
  userId: number;
  rewardId: number;
  appliedAt: string;
  expiresAt?: string;
  reward: ReferralReward;
}

interface LeaderboardEntry {
  user: {
    id: number;
    username: string;
  };
  referralCount: number;
}

interface AchievementWithUserData extends UserAchievement {
  achievement: Achievement;
}

const RewardsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("streaks");
  const [copied, setCopied] = useState(false);
  const userId = user?.userId;
  
  // Fetch streaks data
  const { data: streaks, isLoading: streaksLoading, error: streaksError } = useQuery({
    queryKey: ['/api/users', userId, 'streaks'],
    queryFn: () => 
      apiRequest('GET', `/api/users/${userId}/streaks`)
        .then(res => res.json()),
    enabled: !!userId
  });

  // Fetch achievements data
  const { data: achievements, isLoading: achievementsLoading, error: achievementsError } = useQuery({
    queryKey: ['/api/users', userId, 'achievements'],
    queryFn: () => 
      apiRequest('GET', `/api/users/${userId}/achievements`)
        .then(res => res.json()),
    enabled: !!userId
  });
  
  // Fetch all possible achievements for the "Locked" tab
  const { data: allAchievements, isLoading: allAchievementsLoading } = useQuery({
    queryKey: ['/api/achievements'],
    queryFn: () => 
      apiRequest('GET', '/api/achievements')
        .then(res => res.json()),
    enabled: !!userId
  });
  
  // Referral system queries
  // Get user's referral code
  const { data: referralCode, isLoading: isLoadingCode } = useQuery({
    queryKey: ['/api/referral/codes/user', userId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/referral/codes/user/${userId}`);
      return response.json();
    },
    enabled: !!userId,
  });

  // Get user's referrals
  const { data: referrals, isLoading: isLoadingReferrals } = useQuery({
    queryKey: ['/api/referral/user', userId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/referral/user/${userId}`);
      return response.json();
    },
    enabled: !!userId,
  });

  // Get available rewards
  const { data: referralRewards, isLoading: isLoadingReferralRewards } = useQuery({
    queryKey: ['/api/referral/rewards'],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/referral/rewards`);
      return response.json();
    },
  });

  // Get user's claimed rewards
  const { data: userReferralRewards, isLoading: isLoadingUserReferralRewards } = useQuery({
    queryKey: ['/api/referral/rewards/user', userId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/referral/rewards/user/${userId}`);
      return response.json();
    },
    enabled: !!userId,
  });

  // Get referral leaderboard
  const { data: leaderboard, isLoading: isLoadingLeaderboard } = useQuery({
    queryKey: ['/api/referral/leaderboard'],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/referral/leaderboard`);
      return response.json();
    },
  });

  // Generate referral code mutation
  const generateCodeMutation = useMutation({
    mutationFn: () => apiRequest("POST", '/api/referral/codes', { userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/referral/codes/user', userId] });
      toast({
        title: "Referral code generated!",
        description: "Share your unique code with friends to earn rewards.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to generate code",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  });

  // Claim reward mutation
  const claimRewardMutation = useMutation({
    mutationFn: (rewardId: number) => 
      apiRequest("POST", '/api/referral/rewards/claim', { userId, rewardId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/referral/rewards/user', userId] });
      toast({
        title: "Reward claimed!",
        description: "Your reward has been added to your account.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to claim reward",
        description: "Please check if you meet the requirements.",
        variant: "destructive",
      });
    }
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
  
  // Referral system helper functions
  const handleCopyCode = () => {
    if (referralCode?.code) {
      navigator.clipboard.writeText(referralCode.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Code copied!",
        description: "Referral code copied to clipboard.",
      });
    }
  };

  const handleGenerateCode = () => {
    generateCodeMutation.mutate();
  };

  const handleClaimReward = (rewardId: number) => {
    claimRewardMutation.mutate(rewardId);
  };

  // Get app URL for sharing
  const appUrl = window.location.origin;
  const getReferralUrl = () => {
    return `${appUrl}/signup?ref=${referralCode?.code || ''}`;
  };

  // Check if user has already claimed a reward
  const isRewardClaimed = (rewardId: number) => {
    return userReferralRewards?.some((r: UserReferralReward) => r.rewardId === rewardId);
  };

  // Count qualified referrals for progress bars
  const qualifiedReferrals = referrals?.filter((r: Referral) => r.status === "converted")?.length || 0;
  
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
        <TabsList className="grid grid-cols-4 md:w-[500px]">
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
          <TabsTrigger value="referrals">
            <Gift className="mr-2 h-4 w-4" />
            Referrals
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
              {lockedAchievements.map((achievement: Achievement) => (
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
        
        {/* Referrals Tab */}
        <TabsContent value="referrals">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Referral Code Card */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Your Referral Code
                </CardTitle>
                <CardDescription>
                  Share this code with friends to earn rewards
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {isLoadingCode ? (
                  <div className="flex justify-center py-4">
                    <Loader />
                  </div>
                ) : referralCode ? (
                  <>
                    <div className="flex items-center justify-between p-4 bg-muted rounded-md">
                      <span className="text-xl font-bold tracking-wider">{referralCode.code}</span>
                      <Button size="sm" variant="ghost" onClick={handleCopyCode}>
                        {copied ? <FiCheckCircle className="h-4 w-4" /> : <FiCopy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">Referral link:</p>
                      <div className="flex items-center justify-between p-2 bg-background rounded-md border mt-1 text-xs overflow-hidden">
                        <span className="truncate">{getReferralUrl()}</span>
                        <Button size="sm" variant="ghost" onClick={() => {
                          navigator.clipboard.writeText(getReferralUrl());
                          toast({
                            title: "Link copied!",
                            description: "Referral link copied to clipboard.",
                          });
                        }}>
                          <FiCopy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 gap-3">
                    <p className="text-muted-foreground text-center">
                      You don't have a referral code yet
                    </p>
                    <Button onClick={handleGenerateCode} disabled={generateCodeMutation.isPending}>
                      {generateCodeMutation.isPending ? <Loader size="sm" /> : "Generate Code"}
                    </Button>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-3 border-t pt-4">
                <p className="text-sm text-center max-w-[300px] mx-auto">
                  For each friend who joins with your code, you'll earn rewards based on their activity
                </p>
              </CardFooter>
            </Card>

            {/* Stats Card */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Your Referrals
                </CardTitle>
                <CardDescription>
                  Track your referral performance
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {isLoadingReferrals ? (
                  <div className="flex justify-center py-4">
                    <Loader />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-md">
                        <span className="text-3xl font-bold">{referrals?.length || 0}</span>
                        <span className="text-sm text-muted-foreground">Total Referrals</span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-md">
                        <span className="text-3xl font-bold">{qualifiedReferrals}</span>
                        <span className="text-sm text-muted-foreground">Converted</span>
                      </div>
                    </div>
                    
                    {referrals && referrals.length > 0 ? (
                      <div className="border rounded-md mt-2">
                        <div className="p-3 border-b bg-muted">
                          <h3 className="font-medium">Recent Referrals</h3>
                        </div>
                        <div className="max-h-[200px] overflow-y-auto">
                          {referrals.slice(0, 5).map((referral: Referral) => (
                            <div key={referral.id} className="flex items-center justify-between p-3 border-b last:border-0">
                              <div>
                                <p className="font-medium">{referral.referredUser?.username || 'Anonymous'}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(referral.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <span 
                                className={`px-2 py-1 rounded-full text-xs ${
                                  referral.status === 'converted' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                }`}
                              >
                                {referral.status === 'converted' ? 'Converted' : 'Pending'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <EmptyState 
                        title="No referrals yet" 
                        description="Share your referral code to start earning rewards"
                        icon={<Users className="h-10 w-10 text-muted-foreground" />}
                      />
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Leaderboard Card */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Leaderboard
                </CardTitle>
                <CardDescription>
                  Top referrers this month
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingLeaderboard ? (
                  <div className="flex justify-center py-4">
                    <Loader />
                  </div>
                ) : leaderboard && leaderboard.length > 0 ? (
                  <div className="space-y-4">
                    {leaderboard.map((entry: LeaderboardEntry, index: number) => (
                      <div key={entry.user.id} className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                          index === 1 ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' :
                          index === 2 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{entry.user.username}</div>
                          <div className="text-xs text-muted-foreground">{entry.referralCount} referrals</div>
                        </div>
                        {userId === entry.user.id && (
                          <div className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">You</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState 
                    title="No data yet" 
                    description="Be the first to reach the top"
                    icon={<Award className="h-10 w-10 text-muted-foreground" />}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Rewards Section */}
          <Card className="col-span-3 mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Referral Rewards
              </CardTitle>
              <CardDescription>
                Earn special rewards by referring friends
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingReferralRewards ? (
                <div className="flex justify-center py-8">
                  <Loader />
                </div>
              ) : referralRewards && referralRewards.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {referralRewards.map((reward: ReferralReward) => {
                    const claimed = isRewardClaimed(reward.id);
                    const progress = Math.min(100, (qualifiedReferrals / reward.requiredReferrals) * 100);
                    const isEligible = qualifiedReferrals >= reward.requiredReferrals;
                    
                    return (
                      <Card key={reward.id} className={`border ${claimed ? 'bg-muted' : ''}`}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{reward.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <p className="text-sm mb-4">{reward.description}</p>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{qualifiedReferrals}/{reward.requiredReferrals} referrals</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        </CardContent>
                        <CardFooter>
                          {claimed ? (
                            <Button disabled className="w-full bg-green-600 hover:bg-green-700">
                              <FiCheckCircle className="mr-2 h-4 w-4" /> Claimed
                            </Button>
                          ) : (
                            <Button 
                              className="w-full" 
                              disabled={!isEligible || claimRewardMutation.isPending}
                              onClick={() => handleClaimReward(reward.id)}
                            >
                              {claimRewardMutation.isPending ? <Loader size="sm" /> : "Claim Reward"}
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <EmptyState 
                  title="No rewards available" 
                  description="Check back later for referral rewards"
                  icon={<Gift className="h-10 w-10 text-muted-foreground" />}
                />
              )}
            </CardContent>
          </Card>
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