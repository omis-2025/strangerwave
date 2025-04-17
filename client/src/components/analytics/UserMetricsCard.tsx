import React from 'react';
import { Card, Title, Text, Metric, Flex, ProgressBar } from '@tremor/react';
import { Users, Clock } from 'lucide-react';

interface UserMetricsProps {
  metrics?: {
    activeUsers: number;
    totalSessions: number;
    averageSessionDuration: number; // in milliseconds
  };
}

const UserMetricsCard: React.FC<UserMetricsProps> = ({ metrics }) => {
  if (!metrics) {
    return (
      <Card className="p-6">
        <Title>User Metrics</Title>
        <Text>Loading user metrics...</Text>
      </Card>
    );
  }

  // Format duration from milliseconds to minutes
  const avgDurationMins = Math.round(metrics.averageSessionDuration / 60000);
  
  return (
    <Card className="p-6">
      <Title>User Metrics</Title>
      <Flex className="mt-4">
        <div>
          <Text>Active Users</Text>
          <Metric className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {metrics.activeUsers.toLocaleString()}
          </Metric>
        </div>
        <div>
          <Text>Total Sessions</Text>
          <Metric>{metrics.totalSessions.toLocaleString()}</Metric>
        </div>
      </Flex>
      <div className="mt-6">
        <div className="flex justify-between items-center">
          <Text>Average Session Time</Text>
          <Text className="font-medium">{avgDurationMins} min</Text>
        </div>
        <ProgressBar value={Math.min(avgDurationMins, 30) / 30 * 100} className="mt-2" />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0 min</span>
          <span>30+ min</span>
        </div>
      </div>
    </Card>
  );
};

export default UserMetricsCard;