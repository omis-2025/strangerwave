import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  Title, 
  Text, 
  Tab, 
  TabList, 
  TabGroup, 
  TabPanel, 
  TabPanels,
  Grid,
  Metric,
  AreaChart,
  DonutChart,
  BarChart
} from '@tremor/react';
import { Loader2, Users, MessageCircle, Clock, TrendingUp } from 'lucide-react';

interface PartnerDashboardProps {
  partnerId: number;
  apiKey: string;
}

const PartnerDashboard: React.FC<PartnerDashboardProps> = ({ partnerId, apiKey }) => {
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'year'>('month');
  
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/partner/stats', timeframe],
    queryFn: async () => {
      const res = await fetch(`/api/partner/stats?timeframe=${timeframe}`, {
        headers: {
          'X-API-KEY': apiKey
        }
      });
      if (!res.ok) throw new Error('Failed to fetch partner stats');
      return res.json();
    }
  });
  
  const { data: topicData, isLoading: isLoadingTopics } = useQuery({
    queryKey: ['/api/partner/topics/distribution', timeframe],
    queryFn: async () => {
      const res = await fetch(`/api/partner/topics/distribution?timeframe=${timeframe}`, {
        headers: {
          'X-API-KEY': apiKey
        }
      });
      if (!res.ok) throw new Error('Failed to fetch topic distribution');
      return res.json();
    }
  });
  
  const { data: retentionData, isLoading: isLoadingRetention } = useQuery({
    queryKey: ['/api/partner/users/retention'],
    queryFn: async () => {
      const res = await fetch('/api/partner/users/retention', {
        headers: {
          'X-API-KEY': apiKey
        }
      });
      if (!res.ok) throw new Error('Failed to fetch user retention data');
      return res.json();
    }
  });
  
  const isLoading = isLoadingStats || isLoadingTopics || isLoadingRetention;
  
  // Prepare topic distribution data for chart
  const prepareTopicData = () => {
    if (!topicData?.topicDistribution) return [];
    
    return Object.entries(topicData.topicDistribution).map(([name, value]) => ({
      name,
      value
    }));
  };
  
  // Prepare retention data for chart
  const prepareRetentionData = () => {
    if (!retentionData?.retentionData?.cohorts) return [];
    
    return retentionData.retentionData.cohorts.map(cohort => ({
      name: cohort.cohort,
      'Day 1': cohort.d1,
      'Day 7': cohort.d7,
      'Day 30': cohort.d30
    }));
  };
  
  // Simulated engagement data
  // This would be replaced with actual data from API
  const engagementData = [
    { date: '2023-01-01', activeUsers: 423, conversations: 210, messages: 3150 },
    { date: '2023-01-02', activeUsers: 456, conversations: 237, messages: 3544 },
    { date: '2023-01-03', activeUsers: 478, conversations: 245, messages: 3689 },
    { date: '2023-01-04', activeUsers: 509, conversations: 276, messages: 4020 },
    { date: '2023-01-05', activeUsers: 532, conversations: 298, messages: 4390 },
    { date: '2023-01-06', activeUsers: 544, conversations: 312, messages: 4598 },
    { date: '2023-01-07', activeUsers: 589, conversations: 345, messages: 5012 },
    { date: '2023-01-08', activeUsers: 618, conversations: 367, messages: 5389 },
    { date: '2023-01-09', activeUsers: 647, conversations: 390, messages: 5781 },
    { date: '2023-01-10', activeUsers: 675, conversations: 412, messages: 6128 }
  ];
  
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <Title className="text-2xl font-bold">Partner Dashboard</Title>
          <Text>Partner ID: {partnerId}</Text>
        </div>
        <TabGroup>
          <TabList>
            <Tab onClick={() => setTimeframe('day')}>24 Hours</Tab>
            <Tab onClick={() => setTimeframe('week')}>7 Days</Tab>
            <Tab onClick={() => setTimeframe('month')}>30 Days</Tab>
            <Tab onClick={() => setTimeframe('year')}>Year</Tab>
          </TabList>
        </TabGroup>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <Grid numItems={1} numItemsMd={2} numItemsLg={4} className="gap-6 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <Text>Active Users</Text>
              </div>
              <Metric className="mt-1">{stats?.stats?.activeUserCount.toLocaleString()}</Metric>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-violet-500" />
                <Text>Conversations</Text>
              </div>
              <Metric className="mt-1">{stats?.stats?.conversationCount.toLocaleString()}</Metric>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                <Text>Messages</Text>
              </div>
              <Metric className="mt-1">{stats?.stats?.messageCount.toLocaleString()}</Metric>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                <Text>Avg. Conversation</Text>
              </div>
              <Metric className="mt-1">{Math.round(stats?.stats?.avgConversationDurationMinutes || 0)} min</Metric>
            </Card>
          </Grid>
          
          <TabGroup>
            <TabList>
              <Tab>Usage</Tab>
              <Tab>Topics</Tab>
              <Tab>Retention</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Card className="mt-6">
                  <Title>User Engagement</Title>
                  <Text>Active users, conversations, and messages over time</Text>
                  <AreaChart
                    className="h-72 mt-4"
                    data={engagementData}
                    index="date"
                    categories={['activeUsers', 'conversations', 'messages']}
                    colors={['blue', 'violet', 'emerald']}
                    valueFormatter={(number) => `${Intl.NumberFormat('us').format(number).toString()}`}
                  />
                </Card>
              </TabPanel>
              <TabPanel>
                <Card className="mt-6">
                  <Title>Topic Distribution</Title>
                  <Text>Most common conversation topics</Text>
                  <DonutChart
                    className="h-80 mt-4"
                    data={prepareTopicData()}
                    category="value"
                    index="name"
                    valueFormatter={(value) => `${value}%`}
                    colors={['violet', 'indigo', 'blue', 'cyan', 'teal', 'green', 'emerald', 'amber', 'rose']}
                  />
                </Card>
              </TabPanel>
              <TabPanel>
                <Card className="mt-6">
                  <Title>User Retention by Cohort</Title>
                  <Text>Percentage of users who return after N days</Text>
                  <BarChart
                    className="h-80 mt-4"
                    data={prepareRetentionData()}
                    index="name"
                    categories={['Day 1', 'Day 7', 'Day 30']}
                    colors={['blue', 'teal', 'amber']}
                    valueFormatter={(value) => `${value}%`}
                    stack={false}
                  />
                </Card>
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </>
      )}
    </div>
  );
};

export default PartnerDashboard;