import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Trophy, Award, Calendar, Star, Clock } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

// Define Achievement type
export interface Achievement {
  id: number;
  code: string;
  name: string;
  description: string;
  category: 'streak' | 'milestone' | 'quality' | 'special' | 'onboarding' | 'engagement';
  iconUrl: string | null;
  points: number;
  requirements: any;
  createdAt: string | Date;
}

export interface UserAchievement {
  id: number;
  userId: number;
  achievementId: number;
  earnedAt: string | Date;
  displayed: boolean;
}

// Achievement category icon mapping
const categoryIcons = {
  'streak': <Calendar className="h-5 w-5 text-blue-500" />,
  'milestone': <Trophy className="h-5 w-5 text-yellow-500" />,
  'quality': <Star className="h-5 w-5 text-purple-500" />,
  'special': <Award className="h-5 w-5 text-emerald-500" />,
  'onboarding': <Clock className="h-5 w-5 text-slate-500" />,
  'engagement': <Trophy className="h-5 w-5 text-rose-500" />
};

// Achievement tier colors
const tierColors = {
  'bronze': 'bg-amber-700',
  'silver': 'bg-slate-400',
  'gold': 'bg-yellow-500',
  'platinum': 'bg-gradient-to-r from-indigo-400 to-purple-500'
};

interface AchievementCardProps {
  achievement: Achievement;
  earnedAt?: Date | string;
  isEarned?: boolean;
  showProgress?: boolean;
  progressValue?: number;
  progressMax?: number;
}

const AchievementCard = ({
  achievement,
  earnedAt,
  isEarned = false,
  showProgress = false,
  progressValue = 0,
  progressMax = 100
}: AchievementCardProps) => {
  
  // Determine the tier based on points
  const getTier = (points: number) => {
    if (points >= 200) return 'platinum';
    if (points >= 100) return 'gold';
    if (points >= 50) return 'silver';
    return 'bronze';
  };
  
  const tier = getTier(achievement.points);
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className={`
            relative overflow-hidden transition-all 
            ${isEarned ? 'border-primary shadow-md hover:shadow-lg' : 'opacity-70 grayscale hover:opacity-80'}
          `}>
            {/* Tier indicator */}
            <div className={`absolute top-0 right-0 h-20 w-20 ${tierColors[tier]} opacity-20 rounded-bl-full`}></div>
            
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-bold">
                  {achievement.name}
                </CardTitle>
                <div className="mt-1">
                  {categoryIcons[achievement.category] || <Award className="h-5 w-5" />}
                </div>
              </div>
              <CardDescription className="text-sm">{achievement.description}</CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="flex justify-between items-center mt-2">
                <Badge variant="outline" className="font-semibold">
                  +{achievement.points} points
                </Badge>
                
                {isEarned && earnedAt && (
                  <div className="text-xs text-muted-foreground">
                    Earned {typeof earnedAt === 'string' 
                      ? formatDistanceToNow(new Date(earnedAt), { addSuffix: true })
                      : formatDistanceToNow(earnedAt, { addSuffix: true })
                    }
                  </div>
                )}
              </div>
              
              {/* Progress bar for in-progress achievements */}
              {showProgress && !isEarned && (
                <div className="mt-3">
                  <div className="w-full bg-secondary rounded-full h-2.5">
                    <div 
                      className="bg-primary h-2.5 rounded-full" 
                      style={{ width: `${Math.min(100, (progressValue / progressMax) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-right mt-1 text-muted-foreground">
                    {progressValue}/{progressMax}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TooltipTrigger>
        
        <TooltipContent>
          <p>{isEarned ? 'Achievement unlocked!' : 'Keep going to unlock this achievement'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AchievementCard;