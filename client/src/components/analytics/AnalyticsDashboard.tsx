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
} from '@tremor/react';
import UserMetricsCard from './UserMetricsCard';
import ConversationMetricsCard from './ConversationMetricsCard';
import TopUserTable from './TopUserTable';
import EventsTimeline from './EventsTimeline';
import ConversationLengthChart from './ConversationLengthChart';
import UserRetentionChart from './UserRetentionChart';
import UserGrowthChart from './UserGrowthChart';
import { Loader2 } from 'lucide-react';

const AnalyticsDashboard: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('day');
  
  const { data: userMetrics, isLoading: isLoadingUserMetrics } = useQuery({
    queryKey: ['/api/analytics/metrics/users', timeframe],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/metrics/users?timeframe=${timeframe}`);
      if (!res.ok) throw new Error('Failed to fetch user metrics');
      return res.json();
    }
  });
  
  const { data: conversationMetrics, isLoading: isLoadingConversationMetrics } = useQuery({
    queryKey: ['/api/analytics/metrics/conversations', timeframe],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/metrics/conversations?timeframe=${timeframe}`);
      if (!res.ok) throw new Error('Failed to fetch conversation metrics');
      return res.json();
    }
  });
  
  const isLoading = isLoadingUserMetrics || isLoadingConversationMetrics;
  
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <Title className="text-2xl font-bold">Analytics Dashboard</Title>
        <TabGroup>
          <TabList>
            <Tab onClick={() => setTimeframe('day')}>24 Hours</Tab>
            <Tab onClick={() => setTimeframe('week')}>7 Days</Tab>
            <Tab onClick={() => setTimeframe('month')}>30 Days</Tab>
          </TabList>
        </TabGroup>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <Grid numItems={1} numItemsMd={2} className="gap-6 mb-6">
            <UserMetricsCard metrics={userMetrics?.metrics} />
            <ConversationMetricsCard metrics={conversationMetrics?.metrics} />
          </Grid>
          
          <TabGroup>
            <TabList>
              <Tab>Overview</Tab>
              <Tab>Conversations</Tab>
              <Tab>Users</Tab>
              <Tab>Events</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Grid numItems={1} numItemsMd={2} className="gap-6 mt-6">
                  <UserGrowthChart timeframe={timeframe} />
                  <ConversationLengthChart timeframe={timeframe} />
                </Grid>
              </TabPanel>
              <TabPanel>
                <Grid numItems={1} numItemsMd={2} className="gap-6 mt-6">
                  <ConversationLengthChart timeframe={timeframe} />
                  <Card>
                    <Title>Top Conversation Topics</Title>
                    <Text>Most discussed topics based on conversation analysis</Text>
                    {/* Topic Analysis visualization here */}
                  </Card>
                </Grid>
              </TabPanel>
              <TabPanel>
                <Grid numItems={1} numItemsMd={2} className="gap-6 mt-6">
                  <UserRetentionChart timeframe={timeframe} />
                  <TopUserTable timeframe={timeframe} />
                </Grid>
              </TabPanel>
              <TabPanel>
                <EventsTimeline timeframe={timeframe} />
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboard;