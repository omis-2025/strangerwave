import React from 'react';
import { Card, Title, Text, Metric, Flex, DonutChart } from '@tremor/react';
import { MessageCircle, Clock } from 'lucide-react';

interface ConversationMetricsProps {
  metrics?: {
    totalConversations: number;
    completedConversations: number;
    completionRate: number;
    totalMessages: number;
    averageMessagesPerConversation: number;
    averageConversationDuration: number; // in milliseconds
  };
}

const ConversationMetricsCard: React.FC<ConversationMetricsProps> = ({ metrics }) => {
  if (!metrics) {
    return (
      <Card className="p-6">
        <Title>Conversation Metrics</Title>
        <Text>Loading conversation metrics...</Text>
      </Card>
    );
  }

  // Format duration from milliseconds to minutes
  const avgDurationMins = Math.round(metrics.averageConversationDuration / 60000);
  
  // Data for completion rate donut chart
  const completionData = [
    { name: 'Completed', value: metrics.completedConversations },
    { name: 'Abandoned', value: metrics.totalConversations - metrics.completedConversations }
  ];
  
  return (
    <Card className="p-6">
      <Title>Conversation Metrics</Title>
      <Flex className="mt-4">
        <div>
          <Text>Total Conversations</Text>
          <Metric className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            {metrics.totalConversations.toLocaleString()}
          </Metric>
        </div>
        <div>
          <Text>Avg. Duration</Text>
          <Metric className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {avgDurationMins} min
          </Metric>
        </div>
      </Flex>
      <div className="mt-4">
        <Text>Completion Rate</Text>
        <div className="flex items-center justify-between">
          <DonutChart
            data={completionData}
            category="value"
            index="name"
            valueFormatter={(v) => `${v.toLocaleString()} conversations`}
            className="h-28 mt-2"
            colors={['emerald', 'rose']}
          />
          <div className="text-right">
            <Metric>{Math.round(metrics.completionRate)}%</Metric>
            <Text>Completion Rate</Text>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <Text>Messages Per Conversation</Text>
        <Metric>{Math.round(metrics.averageMessagesPerConversation)}</Metric>
      </div>
    </Card>
  );
};

export default ConversationMetricsCard;