import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useUser } from "@/hooks/use-user";
import EmptyState from "@/components/EmptyState";
import Loader from "@/components/Loader";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  FiUsers, 
  FiDollarSign, 
  FiStar, 
  FiUser,
  FiCalendar,
  FiSettings,
  FiMessageSquare,
  FiBarChart2,
  FiCheckSquare
} from "react-icons/fi";
import { FaCrown } from "react-icons/fa";

const CreatorModePage: React.FC = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [tokenRate, setTokenRate] = useState(50);
  const [tippingEnabled, setTippingEnabled] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const userId = user?.id;

  // Get creator profile
  const { data: creatorProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['/api/creator/profile', userId],
    queryFn: () => apiRequest("GET", `/api/creator/profile/${userId}`),
    enabled: !!userId,
    onSuccess: (data) => {
      if (data) {
        setTokenRate(data.privateRoomRate || 50);
        setTippingEnabled(data.tippingEnabled || true);
        setCategories(data.contentCategories || []);
      }
    }
  });

  // Get private rooms
  const { data: privateRooms, isLoading: isLoadingRooms } = useQuery({
    queryKey: ['/api/creator/rooms', userId],
    queryFn: () => apiRequest("GET", `/api/creator/rooms/${userId}`),
    enabled: !!userId && !!creatorProfile?.isCreator,
  });

  // Get creator stats
  const { data: creatorStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/creator/stats', userId],
    queryFn: () => apiRequest("GET", `/api/creator/stats/${userId}`),
    enabled: !!userId && !!creatorProfile?.isCreator,
  });

  // Activate creator mode mutation
  const activateCreatorMutation = useMutation({
    mutationFn: () => apiRequest("POST", '/api/creator/activate', { userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/creator/profile', userId] });
      toast({
        title: "Creator mode activated!",
        description: "Your creator profile is now active.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to activate creator mode",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  });

  // Update creator settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (data: { tippingEnabled: boolean, privateRoomRate: number, contentCategories: string[] }) => 
      apiRequest("PUT", `/api/creator/settings/${userId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/creator/profile', userId] });
      toast({
        title: "Settings updated!",
        description: "Your creator settings have been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to update settings",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  });

  // Accept/Reject room request mutation
  const handleRoomRequestMutation = useMutation({
    mutationFn: ({ roomId, action }: { roomId: number, action: 'accept' | 'reject' }) => 
      apiRequest("POST", `/api/creator/rooms/${roomId}/${action}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/creator/rooms', userId] });
      toast({
        title: "Room request updated",
        description: "The room request has been processed.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to process request",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  });

  const handleActivateCreator = () => {
    activateCreatorMutation.mutate();
  };

  const handleUpdateSettings = () => {
    updateSettingsMutation.mutate({
      tippingEnabled,
      privateRoomRate: tokenRate,
      contentCategories: categories
    });
  };

  const handleRoomRequest = (roomId: number, action: 'accept' | 'reject') => {
    handleRoomRequestMutation.mutate({ roomId, action });
  };

  const availableCategories = [
    "Casual Chat", "Gaming", "Music", "Fashion", "Fitness",
    "Relationship Advice", "Tech Talk", "Comedy", "Life Coaching"
  ];

  return (
    <div className="container py-8 px-4 md:px-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <FaCrown className="h-6 w-6 text-yellow-400" />
              Creator Mode
            </h1>
            <p className="text-muted-foreground mt-1">
              Engage with your fans and monetize your influence
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        {/* Main content */}
        {isLoadingProfile ? (
          <div className="flex justify-center py-16">
            <Loader size="lg" />
          </div>
        ) : !creatorProfile?.isCreator ? (
          <Card>
            <CardHeader>
              <CardTitle>Become a Creator</CardTitle>
              <CardDescription>
                Activate creator mode to unlock special features and monetization opportunities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FiUsers className="h-5 w-5 text-blue-400" />
                      Private Rooms
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">Host exclusive one-on-one sessions with your fans at rates you set.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FiDollarSign className="h-5 w-5 text-green-400" />
                      Receive Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">Let your audience show appreciation through tokens and tips.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FiStar className="h-5 w-5 text-yellow-400" />
                      Premium Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">Get enhanced referral bonuses and premium analytics tools.</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="bg-muted p-4 rounded-md text-sm mt-6">
                <p>
                  <strong>Requirements:</strong> Creators must have an account in good standing, be at least 18 years old, 
                  and comply with our community guidelines.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-6">
              <Button 
                onClick={handleActivateCreator} 
                disabled={activateCreatorMutation.isPending}
                className="w-full md:w-auto"
                size="lg"
              >
                {activateCreatorMutation.isPending ? <Loader size="sm" /> : "Activate Creator Mode"}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="rooms">Private Rooms</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                      <CardTitle>Creator Dashboard</CardTitle>
                      <CardDescription>
                        Track your performance and earnings
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                      <FaCrown className="h-3 w-3 text-yellow-400" />
                      Creator Status: Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isLoadingStats ? (
                    <div className="flex justify-center py-8">
                      <Loader />
                    </div>
                  ) : creatorStats ? (
                    <>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground">Token Balance</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center gap-2">
                              <FiDollarSign className="h-5 w-5 text-green-400" />
                              <span className="text-2xl font-bold">{creatorStats.tokenBalance}</span>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground">Completed Rooms</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center gap-2">
                              <FiUsers className="h-5 w-5 text-blue-400" />
                              <span className="text-2xl font-bold">{creatorStats.completedRooms}</span>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground">Average Rating</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center gap-2">
                              <FiStar className="h-5 w-5 text-yellow-400" />
                              <span className="text-2xl font-bold">{creatorStats.averageRating.toFixed(1)}</span>
                              <span className="text-sm text-muted-foreground">/ 5.0</span>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground">Unique Fans</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center gap-2">
                              <FiUser className="h-5 w-5 text-purple-400" />
                              <span className="text-2xl font-bold">{creatorStats.uniqueFans}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Recent Activity</CardTitle>
                          </CardHeader>
                          <CardContent>
                            {creatorStats.recentActivity && creatorStats.recentActivity.length > 0 ? (
                              <div className="space-y-4">
                                {creatorStats.recentActivity.map((activity, index) => (
                                  <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                                    <div className={`p-2 rounded-full ${
                                      activity.type === 'room' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' : 
                                      activity.type === 'tip' ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' : 
                                      'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'
                                    }`}>
                                      {activity.type === 'room' ? <FiUsers className="h-4 w-4" /> : 
                                       activity.type === 'tip' ? <FiDollarSign className="h-4 w-4" /> : 
                                       <FiUser className="h-4 w-4" />}
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-medium">{activity.description}</p>
                                      <div className="flex justify-between items-center mt-1">
                                        <span className="text-xs text-muted-foreground">
                                          {new Date(activity.timestamp).toLocaleDateString()}
                                        </span>
                                        {activity.amount && (
                                          <Badge variant="outline" className="text-green-600">
                                            +{activity.amount} tokens
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <EmptyState 
                                title="No recent activity" 
                                description="Your recent activities will appear here"
                                icon={<FiCalendar className="h-10 w-10 text-muted-foreground" />}
                              />
                            )}
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Top Fans</CardTitle>
                          </CardHeader>
                          <CardContent>
                            {creatorStats.topFans && creatorStats.topFans.length > 0 ? (
                              <div className="space-y-4">
                                {creatorStats.topFans.map((fan, index) => (
                                  <div key={index} className="flex items-center gap-3 pb-3 border-b last:border-0">
                                    <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                                      index === 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                                      index === 1 ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' :
                                      index === 2 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' :
                                      'bg-muted text-muted-foreground'
                                    }`}>
                                      {index + 1}
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-medium">{fan.username}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {fan.sessionCount} sessions | {fan.totalSpent} tokens
                                      </p>
                                    </div>
                                    <div>
                                      <Badge variant={index < 3 ? "default" : "outline"}>
                                        Top Fan
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <EmptyState 
                                title="No top fans yet" 
                                description="Your most dedicated fans will appear here"
                                icon={<FiUsers className="h-10 w-10 text-muted-foreground" />}
                              />
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </>
                  ) : (
                    <EmptyState 
                      title="No stats available" 
                      description="Start engaging with fans to see your performance metrics"
                      icon={<FiBarChart2 className="h-10 w-10 text-muted-foreground" />}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Private Rooms Tab */}
            <TabsContent value="rooms" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Private Room Requests</CardTitle>
                  <CardDescription>
                    Manage your private room sessions with fans
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingRooms ? (
                    <div className="flex justify-center py-8">
                      <Loader />
                    </div>
                  ) : privateRooms && privateRooms.length > 0 ? (
                    <div className="space-y-4">
                      <Tabs defaultValue="pending">
                        <TabsList>
                          <TabsTrigger value="pending">Pending</TabsTrigger>
                          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                          <TabsTrigger value="completed">Completed</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="pending" className="mt-4">
                          {privateRooms.filter(room => room.status === 'pending').length > 0 ? (
                            <div className="space-y-4">
                              {privateRooms
                                .filter(room => room.status === 'pending')
                                .map(room => (
                                  <Card key={room.id}>
                                    <CardHeader className="pb-2">
                                      <div className="flex justify-between">
                                        <CardTitle className="text-lg">Request from {room.user.username}</CardTitle>
                                        <Badge>Pending</Badge>
                                      </div>
                                    </CardHeader>
                                    <CardContent className="pb-3">
                                      <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                          <p className="text-sm text-muted-foreground">Requested Date</p>
                                          <p>{new Date(room.requestedDate).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-muted-foreground">Duration</p>
                                          <p>{room.duration} minutes</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-muted-foreground">Token Rate</p>
                                          <p className="flex items-center">
                                            <FiDollarSign className="h-4 w-4 text-green-400 mr-1" />
                                            {room.tokenRate} tokens/min
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-muted-foreground">Total Value</p>
                                          <p className="font-medium">
                                            {room.tokenRate * room.duration} tokens
                                          </p>
                                        </div>
                                      </div>
                                      {room.notes && (
                                        <div className="mb-4">
                                          <p className="text-sm text-muted-foreground">Notes</p>
                                          <p className="bg-muted p-2 rounded-md mt-1 text-sm">{room.notes}</p>
                                        </div>
                                      )}
                                    </CardContent>
                                    <CardFooter className="flex justify-end gap-2 border-t pt-3">
                                      <Button 
                                        variant="outline" 
                                        onClick={() => handleRoomRequest(room.id, 'reject')}
                                      >
                                        Decline
                                      </Button>
                                      <Button 
                                        onClick={() => handleRoomRequest(room.id, 'accept')}
                                      >
                                        Accept
                                      </Button>
                                    </CardFooter>
                                  </Card>
                                ))}
                            </div>
                          ) : (
                            <EmptyState 
                              title="No pending requests" 
                              description="You don't have any pending room requests"
                              icon={<FiMessageSquare className="h-10 w-10 text-muted-foreground" />}
                            />
                          )}
                        </TabsContent>
                        
                        <TabsContent value="scheduled" className="mt-4">
                          {privateRooms.filter(room => room.status === 'scheduled').length > 0 ? (
                            <div className="space-y-4">
                              {privateRooms
                                .filter(room => room.status === 'scheduled')
                                .map(room => (
                                  <Card key={room.id}>
                                    <CardHeader className="pb-2">
                                      <div className="flex justify-between">
                                        <CardTitle className="text-lg">Session with {room.user.username}</CardTitle>
                                        <Badge variant="secondary">Scheduled</Badge>
                                      </div>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <p className="text-sm text-muted-foreground">Date & Time</p>
                                          <p>{new Date(room.scheduledStart).toLocaleString()}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-muted-foreground">Duration</p>
                                          <p>{room.duration} minutes</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-muted-foreground">Token Rate</p>
                                          <p className="flex items-center">
                                            <FiDollarSign className="h-4 w-4 text-green-400 mr-1" />
                                            {room.tokenRate} tokens/min
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-muted-foreground">Total Value</p>
                                          <p className="font-medium">
                                            {room.tokenRate * room.duration} tokens
                                          </p>
                                        </div>
                                      </div>
                                    </CardContent>
                                    <CardFooter className="justify-end border-t pt-3">
                                      <Button>
                                        Join Room
                                      </Button>
                                    </CardFooter>
                                  </Card>
                                ))}
                            </div>
                          ) : (
                            <EmptyState 
                              title="No scheduled sessions" 
                              description="You don't have any upcoming room sessions"
                              icon={<FiCalendar className="h-10 w-10 text-muted-foreground" />}
                            />
                          )}
                        </TabsContent>
                        
                        <TabsContent value="completed" className="mt-4">
                          {privateRooms.filter(room => room.status === 'completed').length > 0 ? (
                            <div className="space-y-4">
                              {privateRooms
                                .filter(room => room.status === 'completed')
                                .map(room => (
                                  <Card key={room.id}>
                                    <CardHeader className="pb-2">
                                      <div className="flex justify-between">
                                        <CardTitle className="text-lg">Session with {room.user.username}</CardTitle>
                                        <Badge variant="outline">Completed</Badge>
                                      </div>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="grid grid-cols-2 gap-4 mb-3">
                                        <div>
                                          <p className="text-sm text-muted-foreground">Date</p>
                                          <p>{new Date(room.completedAt).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-muted-foreground">Duration</p>
                                          <p>{room.actualDuration || room.duration} minutes</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-muted-foreground">Earnings</p>
                                          <p className="flex items-center text-green-600 font-medium">
                                            <FiDollarSign className="h-4 w-4 mr-1" />
                                            {room.finalTokens} tokens
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-muted-foreground">Rating</p>
                                          <p className="flex items-center">
                                            <FiStar className="h-4 w-4 text-yellow-400 mr-1" />
                                            {room.userRating || '-'}/5
                                          </p>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                            </div>
                          ) : (
                            <EmptyState 
                              title="No completed sessions" 
                              description="Your completed sessions will appear here"
                              icon={<FiCheckSquare className="h-10 w-10 text-muted-foreground" />}
                            />
                          )}
                        </TabsContent>
                      </Tabs>
                    </div>
                  ) : (
                    <EmptyState 
                      title="No room requests" 
                      description="When fans request private sessions, they'll appear here"
                      icon={<FiUsers className="h-10 w-10 text-muted-foreground" />}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Settings Tab */}
            <TabsContent value="settings" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FiSettings className="h-5 w-5" />
                    Creator Settings
                  </CardTitle>
                  <CardDescription>
                    Configure your creator profile and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Private Room Settings</h3>
                    
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="token-rate">Token Rate (per minute)</Label>
                      <div className="flex items-center gap-2">
                        <Slider
                          id="token-rate"
                          min={10}
                          max={200}
                          step={5}
                          value={[tokenRate]}
                          onValueChange={(values) => setTokenRate(values[0])}
                          className="flex-1"
                        />
                        <span className="min-w-[70px] bg-muted rounded-md p-2 text-center">
                          {tokenRate} tokens
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Set how many tokens you charge per minute for private rooms
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between space-y-0 rounded-md border p-3">
                      <div className="space-y-0.5">
                        <Label htmlFor="tipping">Enable Tipping</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow fans to send you tips during sessions
                        </p>
                      </div>
                      <Switch
                        id="tipping"
                        checked={tippingEnabled}
                        onCheckedChange={setTippingEnabled}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-lg font-medium">Content Categories</h3>
                    <p className="text-sm text-muted-foreground">
                      Select the types of content/conversations you specialize in
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {availableCategories.map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`category-${category}`} 
                            checked={categories.includes(category)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setCategories([...categories, category]);
                              } else {
                                setCategories(categories.filter(c => c !== category));
                              }
                            }}
                          />
                          <label 
                            htmlFor={`category-${category}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {category}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t pt-6">
                  <Button 
                    onClick={handleUpdateSettings} 
                    disabled={updateSettingsMutation.isPending}
                  >
                    {updateSettingsMutation.isPending ? <Loader size="sm" /> : "Save Settings"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default CreatorModePage;