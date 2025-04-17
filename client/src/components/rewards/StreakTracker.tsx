import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, MessageCircle, Shield, Award } from "lucide-react";
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';

export interface UserStreak {
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

const StreakTracker: React.FC<StreakTrackerProps> = ({ streak, isPremium = false }) => {
  // Format a date with support for string dates
  const formatDate = (date: string | Date | null) => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isToday(dateObj)) return 'Today';
    if (isYesterday(dateObj)) return 'Yesterday';
    
    return format(dateObj, 'MMM d, yyyy');
  };
  
  // Calculate next milestone
  const getNextMilestone = (current: number) => {
    const milestones = [3, 7, 14, 30, 60, 100, 365];
    return milestones.find(m => m > current) || current + 1;
  };
  
  const nextMilestone = getNextMilestone(streak.currentStreak);
  const progress = (streak.currentStreak / nextMilestone) * 100;
  
  // Determine streak specific icon and colors
  const getStreakAssets = (type: string) => {
    switch (type) {
      case 'login':
        return {
          icon: <Calendar className="h-6 w-6 text-blue-500" />,
          color: 'from-blue-400 to-blue-600',
          title: 'Login Streak',
          description: 'Consecutive days logged in'
        };
      case 'chat':
        return {
          icon: <MessageCircle className="h-6 w-6 text-green-500" />,
          color: 'from-green-400 to-green-600',
          title: 'Chat Streak',
          description: 'Consecutive days chatting'
        };
      default:
        return {
          icon: <Award className="h-6 w-6 text-amber-500" />,
          color: 'from-amber-400 to-amber-600',
          title: 'Activity Streak',
          description: 'Consecutive days active'
        };
    }
  };
  
  const { icon, color, title, description } = getStreakAssets(streak.streakType);
  
  // Format the last update for display
  const getLastUpdateText = () => {
    const date = typeof streak.lastUpdateDate === 'string' 
      ? new Date(streak.lastUpdateDate) 
      : streak.lastUpdateDate;
    
    if (isToday(date)) {
      return 'Updated today';
    }
    
    return `Last updated ${formatDistanceToNow(date, { addSuffix: true })}`;
  };
  
  return (
    <Card className="overflow-hidden">
      <div className={`h-2 bg-gradient-to-r ${color}`}></div>
      
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              {icon} {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          
          {isPremium && streak.protectionUsed && (
            <div className="flex items-center gap-1 text-xs text-amber-500 font-medium">
              <Shield className="h-4 w-4" />
              Protected
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 gap-6 mb-4">
          <div>
            <div className="text-5xl font-bold text-primary mb-1">
              {streak.currentStreak}
            </div>
            <div className="text-sm text-muted-foreground">Current streak</div>
          </div>
          <div>
            <div className="text-4xl font-semibold mb-1">
              {streak.longestStreak}
            </div>
            <div className="text-sm text-muted-foreground">Longest streak</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Next milestone: {nextMilestone} days</span>
            <span className="text-primary">{streak.currentStreak}/{nextMilestone}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        <div className="mt-3 text-xs text-muted-foreground">
          {streak.streakStartDate && (
            <div>Started on {formatDate(streak.streakStartDate)}</div>
          )}
          <div>{getLastUpdateText()}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakTracker;