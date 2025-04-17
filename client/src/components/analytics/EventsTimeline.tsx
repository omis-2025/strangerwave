import React from 'react';
import { Card, Title, Text, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Badge } from '@tremor/react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Clock, User, MessageCircle, Users, Search } from 'lucide-react';

interface EventsTimelineProps {
  timeframe: 'day' | 'week' | 'month';
}

interface AnalyticsEvent {
  id: number;
  userId: number | null;
  sessionId: string;
  eventName: string;
  properties: Record<string, any>;
  timestamp: string;
  clientInfo: Record<string, any>;
}

const EventsTimeline: React.FC<EventsTimelineProps> = ({ timeframe }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/analytics/events/recent', timeframe],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/events/recent?timeframe=${timeframe}&limit=50`);
      if (!res.ok) throw new Error('Failed to fetch events data');
      return res.json();
    }
  });

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Get icon for event type
  const getEventIcon = (eventName: string) => {
    switch (eventName) {
      case 'authentication':
        return <User className="h-4 w-4" />;
      case 'matching':
        return <Users className="h-4 w-4" />;
      case 'conversation':
        return <MessageCircle className="h-4 w-4" />;
      case 'page_view':
        return <Search className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Get badge color based on event type
  const getEventColor = (eventName: string): 'emerald' | 'blue' | 'amber' | 'rose' | 'purple' | 'gray' => {
    switch (eventName) {
      case 'authentication':
        return 'emerald';
      case 'matching':
        return 'blue';
      case 'conversation':
        return 'purple';
      case 'subscription':
        return 'amber';
      case 'error':
        return 'rose';
      default:
        return 'gray';
    }
  };

  // Get formatted event description
  const getEventDescription = (event: AnalyticsEvent) => {
    const { eventName, properties, userId } = event;
    
    switch (eventName) {
      case 'authentication':
        return `User ${userId || 'Anonymous'} ${properties.action} ${properties.success ? 'successful' : 'failed'}`;
      case 'matching':
        return `User ${userId} ${properties.action} match ${properties.matchId ? `with ${properties.matchId}` : ''}`;
      case 'conversation':
        return `User ${userId} ${properties.action} in conversation ${properties.conversationId}`;
      case 'page_view':
        return `User ${userId || 'Anonymous'} viewed ${properties.path}`;
      case 'subscription':
        return `User ${userId} ${properties.action} ${properties.tier} subscription`;
      default:
        return `${eventName} event`;
    }
  };

  return (
    <Card className="p-6 mt-6">
      <Title>Event Timeline</Title>
      <Text>Recent user activities and system events</Text>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-64 text-red-500">
          Error loading events data
        </div>
      ) : data?.events && data.events.length > 0 ? (
        <Table className="mt-4">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Time</TableHeaderCell>
              <TableHeaderCell>Event</TableHeaderCell>
              <TableHeaderCell>User</TableHeaderCell>
              <TableHeaderCell>Description</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.events.map((event: AnalyticsEvent) => (
              <TableRow key={event.id}>
                <TableCell>{formatTimestamp(event.timestamp)}</TableCell>
                <TableCell>
                  <Badge 
                    icon={getEventIcon(event.eventName)} 
                    color={getEventColor(event.eventName)}
                  >
                    {event.eventName}
                  </Badge>
                </TableCell>
                <TableCell>
                  {event.userId ? (
                    <Text>{event.userId}</Text>
                  ) : (
                    <Text className="text-gray-500">Anonymous</Text>
                  )}
                </TableCell>
                <TableCell>
                  <Text>{getEventDescription(event)}</Text>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="flex justify-center items-center h-64 text-gray-500">
          No events data available
        </div>
      )}
    </Card>
  );
};

export default EventsTimeline;