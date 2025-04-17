import React from 'react';
import { Card, Title, Text } from '@tremor/react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2 } from 'lucide-react';

interface ConversationLengthChartProps {
  timeframe: 'day' | 'week' | 'month';
}

const ConversationLengthChart: React.FC<ConversationLengthChartProps> = ({ timeframe }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/analytics/conversations/length', timeframe],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/conversations/length?timeframe=${timeframe}`);
      if (!res.ok) throw new Error('Failed to fetch conversation length data');
      return res.json();
    }
  });

  // Format duration for tooltip
  const formatDuration = (minutes: number) => {
    if (minutes < 1) {
      return '< 1 min';
    } else if (minutes < 60) {
      return `${Math.round(minutes)} min${minutes === 1 ? '' : 's'}`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = Math.round(minutes % 60);
      return `${hours} hr${hours === 1 ? '' : 's'}${remainingMinutes > 0 ? ` ${remainingMinutes} min${remainingMinutes === 1 ? '' : 's'}` : ''}`;
    }
  };

  return (
    <Card className="p-6">
      <Title>Conversation Length Distribution</Title>
      <Text>Duration of conversations in minutes</Text>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-64 text-red-500">
          Error loading conversation length data
        </div>
      ) : data?.distribution ? (
        <div className="h-80 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.distribution}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="duration" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  // Simplify x-axis labels
                  if (value === 1) return '< 1 min';
                  if (value === 5) return '1-5 min';
                  if (value === 15) return '5-15 min';
                  if (value === 30) return '15-30 min';
                  if (value === 60) return '30-60 min';
                  if (value === 90) return '> 60 min';
                  return value;
                }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value) => [`${value} conversations`, 'Count']}
                labelFormatter={(label) => {
                  // More descriptive tooltip labels
                  if (label === 1) return 'Less than 1 minute';
                  if (label === 5) return '1 to 5 minutes';
                  if (label === 15) return '5 to 15 minutes';
                  if (label === 30) return '15 to 30 minutes';
                  if (label === 60) return '30 to 60 minutes';
                  if (label === 90) return 'More than 60 minutes';
                  return `${label} minutes`;
                }}
              />
              <Bar 
                dataKey="count" 
                name="Conversations" 
                fill="#8884d8" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex justify-center items-center h-64 text-gray-500">
          No conversation length data available
        </div>
      )}
    </Card>
  );
};

export default ConversationLengthChart;