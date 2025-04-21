
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Chart } from './ui/chart';

export function PersonalDashboard() {
  const { data: userStats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: () => apiRequest('GET', '/api/user/stats')
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Conversation Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{userStats?.totalChats || 0}</div>
          <p className="text-xs text-muted-foreground">Total conversations</p>
          <Chart 
            data={userStats?.chatHistory || []}
            className="h-32 mt-4"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Engagement Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{userStats?.engagementScore || 0}</div>
          <p className="text-xs text-muted-foreground">Based on interaction quality</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Streak</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{userStats?.currentStreak || 0} days</div>
          <p className="text-xs text-muted-foreground">Keep chatting to maintain streak!</p>
        </CardContent>
      </Card>
    </div>
  );
}
