import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, MessageCircle, Shield, Award, Star } from "lucide-react";
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';

interface RewardTier {
  name: string;
  icon: JSX.Element;
  threshold: number;
  rewards: string[];
  color: string;
}

const REWARD_TIERS: RewardTier[] = [
  {
    name: 'Bronze',
    icon: <Star className="h-4 w-4 text-amber-600" />,
    threshold: 5,
    rewards: ['Daily Tokens x2', 'Custom Profile Frame'],
    color: 'from-amber-400 to-amber-600'
  },
  {
    name: 'Silver',
    icon: <Star className="h-4 w-4 text-slate-400" />,
    threshold: 15,
    rewards: ['Premium Features Trial', 'Special Badge'],
    color: 'from-slate-400 to-slate-600'
  },
  {
    name: 'Gold',
    icon: <Star className="h-4 w-4 text-yellow-400" />,
    threshold: 30,
    rewards: ['Priority Matching', 'Exclusive Themes'],
    color: 'from-yellow-400 to-yellow-600'
  }
];

interface UserStreak {
  id: number;
  userId: number;
  streakType: string;
  currentStreak: number;
  longestStreak: number;
  lastUpdateDate: string | Date;
  streakStartDate: string | Date | null;
  protectionUsed: boolean;
  streakData?: {
    history?: { date: string, count: number }[];
    milestones?: { days: number, achievedAt: string }[];
  };
}

interface StreakTrackerProps {
  streak: UserStreak;
  isPremium?: boolean;
}

export default function StreakTracker({ streak, isPremium = false }: StreakTrackerProps) {
  const [currentTier, setCurrentTier] = useState<RewardTier>(REWARD_TIERS[0]);

  useEffect(() => {
    const tier = REWARD_TIERS.reverse().find(t => streak.currentStreak >= t.threshold) || REWARD_TIERS[0];
    setCurrentTier(tier);
  }, [streak.currentStreak]);

  const nextTier = REWARD_TIERS.find(t => t.threshold > streak.currentStreak) || currentTier;
  const progress = (streak.currentStreak / nextTier.threshold) * 100;

  return (
    <Card className="overflow-hidden">
      <div className={`h-2 bg-gradient-to-r ${currentTier.color}`}></div>

      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {currentTier.icon}
            <div>
              <CardTitle className="text-xl">{currentTier.name} Tier</CardTitle>
              <CardDescription>Current Streak: {streak.currentStreak} days</CardDescription>
            </div>
          </div>

          {isPremium && streak.protectionUsed && (
            <div className="flex items-center gap-1 text-xs text-amber-500">
              <Shield className="h-4 w-4" />
              Protected
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <span className="text-xl font-bold text-white">{streak.currentStreak}</span>
            </div>
            <div>
              <h4 className="font-semibold">Current Streak</h4>
              <p className="text-sm text-muted-foreground">Keep it going!</p>
            </div>
          </div>

          <div className="relative pt-2">
            <div className="flex justify-between mb-2 text-sm">
              <span>Progress to Next Tier</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 bg-gradient-to-r ${currentTier.color}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Current Rewards:</h4>
            <ul className="list-none space-y-2">
              {currentTier.rewards.map((reward, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">{reward}</span>
                </li>
              ))}
            </ul>
          </div>

          {nextTier !== currentTier && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Next tier: {nextTier.name}</span>
                <span>{streak.currentStreak}/{nextTier.threshold}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <div className="text-xs text-muted-foreground mt-4">
            <p>Longest streak: {streak.longestStreak} days</p>
            <p>Started: {format(new Date(streak.streakStartDate), 'PP')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}