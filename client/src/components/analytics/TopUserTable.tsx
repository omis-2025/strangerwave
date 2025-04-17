import React from 'react';
import { Card, Title, Text, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Badge } from '@tremor/react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

interface TopUserTableProps {
  timeframe: 'day' | 'week' | 'month';
}

interface TopUser {
  id: number;
  username: string;
  conversationCount: number;
  messageCount: number;
  avgSessionDuration: number;
  lastActive: string;
}

const TopUserTable: React.FC<TopUserTableProps> = ({ timeframe }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/analytics/users/top', timeframe],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/users/top?timeframe=${timeframe}`);
      if (!res.ok) throw new Error('Failed to fetch top users data');
      return res.json();
    }
  });

  // Format last active date
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

  return (
    <Card className="p-6">
      <Title>Top Active Users</Title>
      <Text>Users with highest engagement metrics</Text>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-64 text-red-500">
          Error loading top users data
        </div>
      ) : data?.users && data.users.length > 0 ? (
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
            {data.users.map((user: TopUser) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <Text className="font-medium">{user.username}</Text>
                    <Text className="text-xs text-gray-500">ID: {user.id}</Text>
                  </div>
                </TableCell>
                <TableCell>{user.conversationCount}</TableCell>
                <TableCell>{user.messageCount}</TableCell>
                <TableCell>{Math.round(user.avgSessionDuration / 60000)} min</TableCell>
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
      ) : (
        <div className="flex justify-center items-center h-64 text-gray-500">
          No top users data available
        </div>
      )}
    </Card>
  );
};

export default TopUserTable;