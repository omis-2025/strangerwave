import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Title, 
  Text, 
  Tab, 
  TabList, 
  TabGroup, 
  TabPanel, 
  TabPanels,
  Metric,
  Grid,
  Col,
  AreaChart,
  DonutChart,
  BarChart,
  Flex,
  Badge,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Button,
  Callout
} from '@tremor/react';
import { 
  Loader2, 
  Users, 
  MessageCircle, 
  Clock, 
  TrendingUp,
  UserPlus,
  BarChart2,
  Maximize2,
  Download,
  Eye,
  HelpCircle
} from 'lucide-react';
import { generateAllDemoData } from './DemoDataGenerator';

const DemoAnalyticsDashboard: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('month');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [demoData, setDemoData] = useState<any>(null);
  
  // Generate demo data when timeframe changes
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate loading delay for realism
    setTimeout(() => {
      const data = generateAllDemoData(timeframe);
      setDemoData(data);
      setIsLoading(false);
    }, 800);
  }, [timeframe]);
  
  // Format timestamp for charts
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

  // Format last active date for user table
  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // Calculate difference in milliseconds
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  // Prepare topic distribution data for chart
  const prepareTopicData = () => {
    if (!demoData?.topicDistribution) return [];
    
    return Object.entries(demoData.topicDistribution).map(([name, value]) => ({
      name,
      value
    }));
  };
  
  // Prepare retention data for chart
  const prepareRetentionData = () => {
    if (!demoData?.retentionCohorts) return [];
    
    return demoData.retentionCohorts.map((cohort: any) => ({
      name: cohort.cohort,
      'Day 1': cohort.d1,
      'Day 7': cohort.d7,
      'Day 30': cohort.d30
    }));
  };
  
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <Title className="text-2xl font-bold">StrangerWave Analytics</Title>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <TabGroup>
            <TabList>
              <Tab onClick={() => setTimeframe('day')}>24 Hours</Tab>
              <Tab onClick={() => setTimeframe('week')}>7 Days</Tab>
              <Tab onClick={() => setTimeframe('month')}>30 Days</Tab>
            </TabList>
          </TabGroup>
          <Button variant="secondary" icon={Eye}>
            Demo View
          </Button>
        </div>
      </div>
      
      <Callout title="Demo Dashboard" icon={HelpCircle} color="blue" className="mb-6">
        This is a demonstration of StrangerWave's analytics capabilities with anonymized data. All metrics are simulated for illustration purposes.
      </Callout>
      
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
              <Metric className="mt-1">{demoData.userMetrics.activeUsers.toLocaleString()}</Metric>
              <Text className="text-xs text-green-500 mt-2">+20.3% vs. previous period</Text>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-violet-500" />
                <Text>Total Conversations</Text>
              </div>
              <Metric className="mt-1">{demoData.conversationMetrics.totalConversations.toLocaleString()}</Metric>
              <Text className="text-xs text-green-500 mt-2">+24.7% vs. previous period</Text>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                <Text>Avg. Session Length</Text>
              </div>
              <Metric className="mt-1">{Math.round(demoData.userMetrics.averageSessionDuration / 60000)} min</Metric>
              <Text className="text-xs text-green-500 mt-2">+1.8 min vs. previous period</Text>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-emerald-500" />
                <Text>Conversion Rate</Text>
              </div>
              <Metric className="mt-1">8.7%</Metric>
              <Text className="text-xs text-green-500 mt-2">+1.2pp vs. previous period</Text>
            </Card>
          </Grid>
          
          <TabGroup>
            <TabList>
              <Tab>Overview</Tab>
              <Tab>User Growth</Tab>
              <Tab>Conversations</Tab>
              <Tab>Retention</Tab>
              <Tab>Content</Tab>
              <Tab>Export</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Grid numItems={1} numItemsMd={2} className="gap-6 mt-6">
                  <Card>
                    <Title>User Engagement</Title>
                    <Text>Active users, conversations, and messages over time</Text>
                    <AreaChart
                      className="h-72 mt-4"
                      data={demoData.engagementData}
                      index="date"
                      categories={['activeUsers', 'conversations', 'messages']}
                      colors={['blue', 'violet', 'emerald']}
                      valueFormatter={(number) => `${Intl.NumberFormat('us').format(number).toString()}`}
                    />
                  </Card>
                  
                  <Card>
                    <Title>Topic Distribution</Title>
                    <Text>Most common conversation topics</Text>
                    <DonutChart
                      className="h-72 mt-4"
                      data={prepareTopicData()}
                      category="value"
                      index="name"
                      valueFormatter={(value) => `${value}%`}
                      colors={['violet', 'indigo', 'blue', 'cyan', 'teal', 'green', 'emerald', 'amber', 'rose']}
                    />
                  </Card>
                </Grid>
                
                <Grid numItems={1} numItemsMd={2} className="gap-6 mt-6">
                  <Card>
                    <Title>User Retention by Cohort</Title>
                    <Text>Percentage of users who return after N days</Text>
                    <BarChart
                      className="h-72 mt-4"
                      data={prepareRetentionData()}
                      index="name"
                      categories={['Day 1', 'Day 7', 'Day 30']}
                      colors={['blue', 'teal', 'amber']}
                      valueFormatter={(value) => `${value}%`}
                      stack={false}
                    />
                  </Card>
                  
                  <Card>
                    <Title>Conversation Length Distribution</Title>
                    <Text>Duration of conversations in minutes</Text>
                    <BarChart
                      className="h-72 mt-4"
                      data={demoData.conversationLengthDistribution}
                      index="duration"
                      categories={['count']}
                      colors={['violet']}
                      valueFormatter={(value) => `${value} conversations`}
                      stack={false}
                    />
                  </Card>
                </Grid>
              </TabPanel>
              
              <TabPanel>
                <Grid numItems={1} numItemsMd={2} className="gap-6 mt-6">
                  <Card>
                    <Title>User Growth</Title>
                    <Text>New and returning users over time</Text>
                    <AreaChart
                      className="h-80 mt-4"
                      data={demoData.userGrowth}
                      index="timestamp"
                      categories={['newUsers', 'returningUsers']}
                      colors={['emerald', 'blue']}
                      valueFormatter={(number) => number.toLocaleString()}
                    />
                  </Card>
                  
                  <Card>
                    <Title>User Activity by Time of Day</Title>
                    <Text>Active users by hour (last 30 days)</Text>
                    <BarChart
                      className="h-80 mt-4"
                      data={[
                        { hour: "00:00", users: 245 },
                        { hour: "01:00", users: 185 },
                        { hour: "02:00", users: 138 },
                        { hour: "03:00", users: 97 },
                        { hour: "04:00", users: 85 },
                        { hour: "05:00", users: 110 },
                        { hour: "06:00", users: 156 },
                        { hour: "07:00", users: 215 },
                        { hour: "08:00", users: 279 },
                        { hour: "09:00", users: 324 },
                        { hour: "10:00", users: 376 },
                        { hour: "11:00", users: 410 },
                        { hour: "12:00", users: 452 },
                        { hour: "13:00", users: 487 },
                        { hour: "14:00", users: 520 },
                        { hour: "15:00", users: 561 },
                        { hour: "16:00", users: 619 },
                        { hour: "17:00", users: 675 },
                        { hour: "18:00", users: 734 },
                        { hour: "19:00", users: 792 },
                        { hour: "20:00", users: 839 },
                        { hour: "21:00", users: 801 },
                        { hour: "22:00", users: 712 },
                        { hour: "23:00", users: 541 }
                      ]}
                      index="hour"
                      categories={['users']}
                      colors={['blue']}
                      valueFormatter={(value) => `${value} users`}
                    />
                  </Card>
                </Grid>
                
                <Card className="mt-6">
                  <Title>Geographic Distribution</Title>
                  <Text>Active users by country (last 30 days)</Text>
                  <Table className="mt-4">
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell>Country</TableHeaderCell>
                        <TableHeaderCell>Users</TableHeaderCell>
                        <TableHeaderCell>% of Total</TableHeaderCell>
                        <TableHeaderCell>Growth</TableHeaderCell>
                        <TableHeaderCell>Avg. Session</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>United States</TableCell>
                        <TableCell>1,254</TableCell>
                        <TableCell>22.4%</TableCell>
                        <TableCell><Badge color="emerald">+18.3%</Badge></TableCell>
                        <TableCell>14.2 min</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>United Kingdom</TableCell>
                        <TableCell>738</TableCell>
                        <TableCell>13.2%</TableCell>
                        <TableCell><Badge color="emerald">+12.7%</Badge></TableCell>
                        <TableCell>13.8 min</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Canada</TableCell>
                        <TableCell>523</TableCell>
                        <TableCell>9.3%</TableCell>
                        <TableCell><Badge color="emerald">+21.2%</Badge></TableCell>
                        <TableCell>12.9 min</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Germany</TableCell>
                        <TableCell>487</TableCell>
                        <TableCell>8.7%</TableCell>
                        <TableCell><Badge color="emerald">+16.8%</Badge></TableCell>
                        <TableCell>11.5 min</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Australia</TableCell>
                        <TableCell>431</TableCell>
                        <TableCell>7.7%</TableCell>
                        <TableCell><Badge color="emerald">+14.3%</Badge></TableCell>
                        <TableCell>12.1 min</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>France</TableCell>
                        <TableCell>392</TableCell>
                        <TableCell>7.0%</TableCell>
                        <TableCell><Badge color="emerald">+10.9%</Badge></TableCell>
                        <TableCell>10.8 min</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Other</TableCell>
                        <TableCell>1,775</TableCell>
                        <TableCell>31.7%</TableCell>
                        <TableCell><Badge color="emerald">+25.1%</Badge></TableCell>
                        <TableCell>11.2 min</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Card>
              </TabPanel>
              
              <TabPanel>
                <Grid numItems={1} numItemsMd={2} className="gap-6 mt-6">
                  <Card>
                    <Title>Conversation Metrics</Title>
                    <Flex className="mt-4">
                      <div>
                        <Text>Total Conversations</Text>
                        <Metric className="flex items-center gap-2">
                          <MessageCircle className="h-5 w-5" />
                          {demoData.conversationMetrics.totalConversations.toLocaleString()}
                        </Metric>
                      </div>
                      <div>
                        <Text>Avg. Duration</Text>
                        <Metric className="flex items-center gap-2">
                          <Clock className="h-5 w-5" />
                          {Math.round(demoData.conversationMetrics.averageConversationDuration / 60000)} min
                        </Metric>
                      </div>
                    </Flex>
                    <div className="mt-4">
                      <Text>Completion Rate</Text>
                      <div className="flex items-center justify-between">
                        <div className="w-64">
                          <DonutChart
                            data={[
                              { name: 'Completed', value: demoData.conversationMetrics.completedConversations },
                              { name: 'Abandoned', value: demoData.conversationMetrics.totalConversations - demoData.conversationMetrics.completedConversations }
                            ]}
                            category="value"
                            index="name"
                            valueFormatter={(v) => `${v.toLocaleString()} conversations`}
                            className="h-28 mt-2"
                            colors={['emerald', 'rose']}
                          />
                        </div>
                        <div className="text-right">
                          <Metric>{Math.round(demoData.conversationMetrics.completionRate)}%</Metric>
                          <Text>Completion Rate</Text>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Text>Messages Per Conversation</Text>
                      <Metric>{Math.round(demoData.conversationMetrics.averageMessagesPerConversation)}</Metric>
                    </div>
                  </Card>
                  
                  <Card>
                    <Title>Conversation Length Distribution</Title>
                    <Text>Duration of conversations in minutes</Text>
                    <BarChart
                      className="h-80 mt-4"
                      data={demoData.conversationLengthDistribution}
                      index="duration"
                      categories={['count']}
                      colors={['violet']}
                      valueFormatter={(value) => `${value} conversations`}
                      stack={false}
                    />
                  </Card>
                </Grid>
                
                <Card className="mt-6">
                  <Title>Top Conversation Topics</Title>
                  <Text>Most discussed topics based on content analysis</Text>
                  <Grid numItems={1} numItemsMd={2} className="gap-4 mt-4">
                    <DonutChart
                      data={prepareTopicData()}
                      category="value"
                      index="name"
                      valueFormatter={(value) => `${value}%`}
                      colors={['violet', 'indigo', 'blue', 'cyan', 'teal', 'green', 'emerald', 'amber', 'rose']}
                      className="h-80"
                    />
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableHeaderCell>Topic</TableHeaderCell>
                          <TableHeaderCell>Distribution</TableHeaderCell>
                          <TableHeaderCell>Avg. Engagement</TableHeaderCell>
                          <TableHeaderCell>Trend</TableHeaderCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {prepareTopicData().map((topic: any) => (
                          <TableRow key={topic.name}>
                            <TableCell>{topic.name.replace(/_/g, ' ')}</TableCell>
                            <TableCell>{topic.value}%</TableCell>
                            <TableCell>{(Math.random() * 2 + 3).toFixed(1)}/5</TableCell>
                            <TableCell>
                              <Badge color={Math.random() > 0.3 ? 'emerald' : 'amber'}>
                                {Math.random() > 0.3 ? '+' : ''}{(Math.random() * 20 - 5).toFixed(1)}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Grid>
                </Card>
              </TabPanel>
              
              <TabPanel>
                <Grid numItems={1} numItemsMd={2} className="gap-6 mt-6">
                  <Card>
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
                  
                  <Card>
                    <Title>User Retention Matrix</Title>
                    <Text>Session frequency vs. session duration</Text>
                    <div className="h-80 mt-4 flex items-center justify-center">
                      <img
                        src="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*-hQ28wYK0Vb30tv6g9T3Zw.png"
                        alt="Retention matrix visualization"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  </Card>
                </Grid>
                
                <Card className="mt-6">
                  <Title>Top Active Users</Title>
                  <Text>Users with highest engagement metrics</Text>
                  
                  <Table className="mt-4">
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell>User</TableHeaderCell>
                        <TableHeaderCell>Conversations</TableHeaderCell>
                        <TableHeaderCell>Messages</TableHeaderCell>
                        <TableHeaderCell>Avg. Duration</TableHeaderCell>
                        <TableHeaderCell>Last Active</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {demoData.topUsers.map((user: any) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <Text className="font-medium">{user.username}</Text>
                              <Text className="text-xs text-gray-500">ID: {user.id}</Text>
                            </div>
                          </TableCell>
                          <TableCell>{user.conversationCount}</TableCell>
                          <TableCell>{user.messageCount}</TableCell>
                          <TableCell>{user.avgSessionDuration} min</TableCell>
                          <TableCell>
                            <Badge color={
                              new Date(user.lastActive).getTime() > Date.now() - 3600000 ? 'emerald' : 
                              new Date(user.lastActive).getTime() > Date.now() - 86400000 ? 'amber' : 
                              'gray'
                            }>
                              {formatLastActive(user.lastActive)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </TabPanel>
              
              <TabPanel>
                <Grid numItems={1} numItemsMd={2} className="gap-6 mt-6">
                  <Card>
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
                  
                  <Card>
                    <Title>Sentiment Analysis</Title>
                    <Text>Conversation sentiment distribution</Text>
                    <DonutChart
                      className="h-80 mt-4"
                      data={[
                        { name: 'Very Positive', value: 18 },
                        { name: 'Positive', value: 37 },
                        { name: 'Neutral', value: 29 },
                        { name: 'Negative', value: 12 },
                        { name: 'Very Negative', value: 4 }
                      ]}
                      category="value"
                      index="name"
                      valueFormatter={(value) => `${value}%`}
                      colors={['emerald', 'green', 'blue', 'amber', 'rose']}
                    />
                  </Card>
                </Grid>
                
                <Card className="mt-6">
                  <Title>Content Moderation Metrics</Title>
                  <Text>Moderation actions and effectiveness</Text>
                  
                  <Grid numItems={1} numItemsMd={3} className="gap-4 mt-4">
                    <Card>
                      <Text>Content Detection</Text>
                      <Metric>99.3%</Metric>
                      <Text className="text-xs text-gray-500">Inappropriate content detection rate</Text>
                    </Card>
                    
                    <Card>
                      <Text>False Positives</Text>
                      <Metric>0.7%</Metric>
                      <Text className="text-xs text-gray-500">Incorrectly flagged content</Text>
                    </Card>
                    
                    <Card>
                      <Text>Response Time</Text>
                      <Metric>217ms</Metric>
                      <Text className="text-xs text-gray-500">Average moderation latency</Text>
                    </Card>
                  </Grid>
                  
                  <Table className="mt-6">
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell>Category</TableHeaderCell>
                        <TableHeaderCell>Occurrences</TableHeaderCell>
                        <TableHeaderCell>% of Total</TableHeaderCell>
                        <TableHeaderCell>Auto-Action</TableHeaderCell>
                        <TableHeaderCell>Trend</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>Spam/Advertising</TableCell>
                        <TableCell>1,254</TableCell>
                        <TableCell>42.5%</TableCell>
                        <TableCell>Message Blocked</TableCell>
                        <TableCell><Badge color="emerald">-8.3%</Badge></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Explicit Content</TableCell>
                        <TableCell>876</TableCell>
                        <TableCell>29.7%</TableCell>
                        <TableCell>Match Terminated</TableCell>
                        <TableCell><Badge color="emerald">-12.7%</Badge></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Harassment</TableCell>
                        <TableCell>412</TableCell>
                        <TableCell>14.0%</TableCell>
                        <TableCell>Warning Issued</TableCell>
                        <TableCell><Badge color="amber">+3.2%</Badge></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Hate Speech</TableCell>
                        <TableCell>289</TableCell>
                        <TableCell>9.8%</TableCell>
                        <TableCell>User Suspended</TableCell>
                        <TableCell><Badge color="emerald">-5.8%</Badge></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Other Violations</TableCell>
                        <TableCell>118</TableCell>
                        <TableCell>4.0%</TableCell>
                        <TableCell>Review Queued</TableCell>
                        <TableCell><Badge color="emerald">-2.3%</Badge></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Card>
              </TabPanel>
              
              <TabPanel>
                <Grid numItems={1} numItemsMd={2} className="gap-6 mt-6">
                  <Card className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Download className="h-5 w-5 text-primary" />
                      <Title>Data Export</Title>
                    </div>
                    
                    <Text className="mb-6">Export data for integration with your systems</Text>
                    
                    <div className="mb-6">
                      <Text className="mb-2">Data Type</Text>
                      <select className="w-full p-2 border rounded">
                        <option value="conversations">Conversations</option>
                        <option value="user-activity">User Activity</option>
                        <option value="analytics">Analytics</option>
                        <option value="topics">Topics</option>
                      </select>
                    </div>
                    
                    <div className="mb-6">
                      <Text className="mb-2">Date Range</Text>
                      <div className="flex gap-4">
                        <input type="date" className="w-full p-2 border rounded" defaultValue="2023-03-17" />
                        <input type="date" className="w-full p-2 border rounded" defaultValue="2023-04-17" />
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <Text className="mb-2">Group By</Text>
                      <select className="w-full p-2 border rounded">
                        <option value="day">Day</option>
                        <option value="week">Week</option>
                        <option value="month">Month</option>
                      </select>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button icon={Download} className="mt-4">
                        Export Data
                      </Button>
                    </div>
                  </Card>
                  
                  <Card className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart2 className="h-5 w-5 text-primary" />
                      <Title>API Access</Title>
                    </div>
                    
                    <Text className="mb-6">Access StrangerWave data programmatically via API</Text>
                    
                    <div className="mb-6">
                      <Text className="font-medium mb-2">API Key</Text>
                      <div className="flex gap-4">
                        <input 
                          type="text" 
                          className="w-full p-2 border rounded bg-gray-50" 
                          value="PARTNER_API_KEY_1" 
                          readOnly
                        />
                        <Button variant="secondary">Copy</Button>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <Text className="font-medium mb-2">Sample Endpoint</Text>
                      <div className="p-3 bg-gray-50 rounded font-mono text-sm overflow-x-auto">
                        GET /api/partner/analytics?timeframe=month
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <Text className="font-medium mb-2">Example Response</Text>
                      <div className="p-3 bg-gray-50 rounded font-mono text-sm h-48 overflow-y-auto">
                        {`{
  "success": true,
  "timeframe": "month",
  "stats": {
    "activeUserCount": 5428,
    "conversationCount": 28973,
    "messageCount": 721842,
    "avgConversationDuration": 732500,
    "avgConversationDurationMinutes": 12.2
  }
}`}
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button className="mt-4">View API Docs</Button>
                    </div>
                  </Card>
                </Grid>
                
                <Card className="mt-6">
                  <Title>Available Export Formats</Title>
                  <Text>Export data in various formats for analysis</Text>
                  
                  <Table className="mt-4">
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell>Format</TableHeaderCell>
                        <TableHeaderCell>Description</TableHeaderCell>
                        <TableHeaderCell>Use Case</TableHeaderCell>
                        <TableHeaderCell>Action</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="bg-blue-100 text-blue-800 p-1 rounded">JSON</div>
                            <Text>JSON Data</Text>
                          </div>
                        </TableCell>
                        <TableCell>Complete data in JSON format</TableCell>
                        <TableCell>API integrations, custom analysis</TableCell>
                        <TableCell>
                          <Button variant="light" size="xs" icon={Download}>Export</Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="bg-green-100 text-green-800 p-1 rounded">CSV</div>
                            <Text>CSV Data</Text>
                          </div>
                        </TableCell>
                        <TableCell>Tabular data in CSV format</TableCell>
                        <TableCell>Excel analysis, data import</TableCell>
                        <TableCell>
                          <Button variant="light" size="xs" icon={Download}>Export</Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="bg-purple-100 text-purple-800 p-1 rounded">XLSX</div>
                            <Text>Excel Workbook</Text>
                          </div>
                        </TableCell>
                        <TableCell>Formatted Excel workbook with multiple sheets</TableCell>
                        <TableCell>Business reporting, presentations</TableCell>
                        <TableCell>
                          <Button variant="light" size="xs" icon={Download}>Export</Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="bg-red-100 text-red-800 p-1 rounded">PDF</div>
                            <Text>PDF Report</Text>
                          </div>
                        </TableCell>
                        <TableCell>Formatted report with visualizations</TableCell>
                        <TableCell>Executive summaries, sharing</TableCell>
                        <TableCell>
                          <Button variant="light" size="xs" icon={Download}>Export</Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Card>
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </>
      )}
    </div>
  );
};

export default DemoAnalyticsDashboard;