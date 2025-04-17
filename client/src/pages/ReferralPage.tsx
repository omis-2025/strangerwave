import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useUser } from "@/hooks/use-user";
import { FiCopy, FiCheckCircle, FiGift, FiAward, FiUsers, FiShare2 } from "react-icons/fi";
import EmptyState from "@/components/EmptyState";
import Loader from "@/components/Loader";

const ReferralPage: React.FC = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  const userId = user?.id;

  // Get user's referral code
  const { data: referralCode, isLoading: isLoadingCode } = useQuery({
    queryKey: ['/api/referral/codes/user', userId],
    queryFn: () => apiRequest("GET", `/api/referral/codes/user/${userId}`),
    enabled: !!userId,
  });

  // Get user's referrals
  const { data: referrals, isLoading: isLoadingReferrals } = useQuery({
    queryKey: ['/api/referral/user', userId],
    queryFn: () => apiRequest("GET", `/api/referral/user/${userId}`),
    enabled: !!userId,
  });

  // Get available rewards
  const { data: rewards, isLoading: isLoadingRewards } = useQuery({
    queryKey: ['/api/referral/rewards'],
    queryFn: () => apiRequest("GET", `/api/referral/rewards`),
  });

  // Get user's claimed rewards
  const { data: userRewards, isLoading: isLoadingUserRewards } = useQuery({
    queryKey: ['/api/referral/rewards/user', userId],
    queryFn: () => apiRequest("GET", `/api/referral/rewards/user/${userId}`),
    enabled: !!userId,
  });

  // Get referral leaderboard
  const { data: leaderboard, isLoading: isLoadingLeaderboard } = useQuery({
    queryKey: ['/api/referral/leaderboard'],
    queryFn: () => apiRequest("GET", `/api/referral/leaderboard`),
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
    return userRewards?.some(r => r.rewardId === rewardId);
  };

  // Count qualified referrals for progress bars
  const qualifiedReferrals = referrals?.filter(r => r.status === "converted")?.length || 0;

  return (
    <div className="container py-8 px-4 md:px-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Referral Program</h1>
            <p className="text-muted-foreground mt-1">
              Invite friends, earn rewards, and unlock exclusive benefits
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Referral Code Card */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FiShare2 className="h-5 w-5" />
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
                <FiUsers className="h-5 w-5" />
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
                        {referrals.slice(0, 5).map((referral) => (
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
                      icon={<FiUsers className="h-10 w-10 text-muted-foreground" />}
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
                <FiAward className="h-5 w-5" />
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
                  {leaderboard.map((entry, index) => (
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
                  icon={<FiAward className="h-10 w-10 text-muted-foreground" />}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Rewards Section */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FiGift className="h-5 w-5" />
              Referral Rewards
            </CardTitle>
            <CardDescription>
              Earn special rewards by referring friends
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingRewards ? (
              <div className="flex justify-center py-8">
                <Loader />
              </div>
            ) : rewards && rewards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rewards.map((reward) => {
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
                icon={<FiGift className="h-10 w-10 text-muted-foreground" />}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReferralPage;