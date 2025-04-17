import React from 'react';
import { Card, Title, Text } from '@tremor/react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Loader2 } from 'lucide-react';

interface UserGrowthChartProps {
  timeframe: 'day' | 'week' | 'month';
}

const UserGrowthChart: React.FC<UserGrowthChartProps> = ({ timeframe }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/analytics/growth/users', timeframe],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/growth/users?timeframe=${timeframe}`);
      if (!res.ok) throw new Error('Failed to fetch user growth data');
      return res.json();
    }
  });

  // Format date based on timeframe
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    switch (timeframe) {
      case 'day':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case 'week':
        return date.toLocaleDateString([], { weekday: 'short' });
      case 'month':
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      default:
        return date.toLocaleDateString();
    }
  };

  return (
    <Card className="p-6">
      <Title>User Growth</Title>
      <Text>New and returning users over time</Text>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-64 text-red-500">
          Error loading user growth data
        </div>
      ) : data?.growth ? (
        <div className="h-80 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data.growth}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={formatDate}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value) => [value, '']}
                labelFormatter={(label) => formatDate(label)}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="newUsers" 
                name="New Users" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="returningUsers" 
                name="Returning Users" 
                stroke="#82ca9d"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex justify-center items-center h-64 text-gray-500">
          No user growth data available
        </div>
      )}
    </Card>
  );
};

export default UserGrowthChart;