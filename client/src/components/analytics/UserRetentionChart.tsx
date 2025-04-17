import React from 'react';
import { Card, Title, Text } from '@tremor/react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ZAxis
} from 'recharts';

interface UserRetentionChartProps {
  timeframe: 'day' | 'week' | 'month';
}

const UserRetentionChart: React.FC<UserRetentionChartProps> = ({ timeframe }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/analytics/users/retention', timeframe],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/users/retention?timeframe=${timeframe}`);
      if (!res.ok) throw new Error('Failed to fetch user retention data');
      return res.json();
    }
  });

  return (
    <Card className="p-6">
      <Title>User Retention</Title>
      <Text>Session frequency vs. session duration</Text>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-64 text-red-500">
          Error loading user retention data
        </div>
      ) : data?.users ? (
        <div className="h-80 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{
                top: 20,
                right: 20,
                bottom: 20,
                left: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                type="number" 
                dataKey="sessionCount" 
                name="Session Count" 
                label={{ 
                  value: 'Number of Sessions', 
                  position: 'bottom',
                  offset: 0
                }}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                type="number" 
                dataKey="avgSessionDuration" 
                name="Average Duration" 
                label={{ 
                  value: 'Avg. Session Duration (min)', 
                  angle: -90, 
                  position: 'left' 
                }}
                tick={{ fontSize: 12 }}
                unit=" min"
              />
              <ZAxis 
                type="number" 
                dataKey="totalMessages" 
                range={[50, 400]} 
                name="Messages Sent" 
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                formatter={(value, name) => {
                  if (name === 'Average Duration') return [`${Math.round(value)} min`, name];
                  if (name === 'Session Count') return [value, name];
                  if (name === 'Messages Sent') return [value, name];
                  return [value, name];
                }}
              />
              <Scatter 
                name="Users" 
                data={data.users} 
                fill="#8884d8"
                shape="circle"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex justify-center items-center h-64 text-gray-500">
          No user retention data available
        </div>
      )}
    </Card>
  );
};

export default UserRetentionChart;