import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { 
  Users, 
  ShieldAlert, 
  Activity, 
  DollarSign, 
  BarChart2,
  Filter,
  Flag,
  Search,
  Ban,
  UserCheck,
  MoreHorizontal,
  Clock,
  Calendar,
  Globe,
  Smartphone,
  Monitor,
  AlertTriangle,
  MessageSquare,
  VideoIcon
} from 'lucide-react';

// Types for our data
interface User {
  id: number;
  username: string;
  isBanned: boolean;
  lastActive: string;
  ipAddress: string;
  country?: string;
  gender?: string;
  premium?: boolean;
  premiumTier?: string;
  banCount: number;
  created: string;
  isPremium?: boolean;
  reportCount?: number;
}

interface Report {
  id: number;
  reporterId: number;
  reporterUsername: string;
  reportedUserId: number;
  reportedUsername: string;
  reason: string;
  details: string;
  timestamp: string;
  resolved: boolean;
  chatSessionId: number;
}

interface ChatSession {
  id: number;
  user1Id: number;
  user2Id: number;
  startTime: string;
  endTime: string | null;
  duration: number | null;
  messageCount: number;
  videoEnabled: boolean;
}

interface PaymentTransaction {
  id: number;
  userId: number;
  username: string;
  amount: number;
  type: 'subscription' | 'unban' | 'boost';
  status: 'completed' | 'failed' | 'pending';
  processor: 'stripe' | 'paypal';
  timestamp: string;
}

interface DashboardStats {
  totalUsers: number;
  activeToday: number;
  premiumUsers: number;
  conversionRate: number;
  reportResolutionTime: number;
  revenueToday: number;
  revenueThisMonth: number;
  averageSessionLength: number;
  textToVideoRatio: number;
  userRetention: number;
  activeBans: number;
  newUsers24h: number;
}

// Mock chart data (real implementation would fetch this data from API)
const userActivityData = [
  { name: '12am', users: 120 },
  { name: '3am', users: 80 },
  { name: '6am', users: 190 },
  { name: '9am', users: 340 },
  { name: '12pm', users: 580 },
  { name: '3pm', users: 620 },
  { name: '6pm', users: 750 },
  { name: '9pm', users: 820 },
];

const premiumConversionData = [
  { name: 'Free', value: 92.3 },
  { name: 'Premium', value: 5.8 },
  { name: 'VIP', value: 1.6 },
  { name: 'Ultimate', value: 0.3 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// The Admin Panel Component
export default function EnhancedAdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(10);
  const [userFilter, setUserFilter] = useState('all');
  const [reportPage, setReportPage] = useState(1);
  const [reportFilter, setReportFilter] = useState('unresolved');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [banReason, setBanReason] = useState('');
  const [showBanDialog, setShowBanDialog] = useState(false);
  const { toast } = useToast();

  // Query to fetch dashboard stats
  const { data: dashboardStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/stats');
      return response.json() as Promise<DashboardStats>;
    }
  });

  // Query to fetch users
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['admin', 'users', userPage, usersPerPage, userFilter, userSearchQuery],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/admin/users?page=${userPage}&limit=${usersPerPage}&filter=${userFilter}&search=${userSearchQuery}`);
      return response.json() as Promise<{users: User[], total: number}>;
    }
  });

  // Query to fetch reports
  const { data: reports, isLoading: isLoadingReports } = useQuery({
    queryKey: ['admin', 'reports', reportPage, reportFilter],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/admin/reports?page=${reportPage}&resolved=${reportFilter === 'resolved'}`);
      return response.json() as Promise<{reports: Report[], total: number}>;
    }
  });

  // Query to fetch payment transactions
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['admin', 'transactions'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/transactions');
      return response.json() as Promise<{transactions: PaymentTransaction[], total: number}>;
    }
  });

  // Function to handle banning a user
  const handleBanUser = async (userId: number) => {
    try {
      await apiRequest('POST', `/api/admin/users/${userId}/ban`, { reason: banReason });
      toast({
        title: "User Banned",
        description: "The user has been banned successfully.",
        variant: "default",
      });
      setShowBanDialog(false);
      setBanReason('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to ban user. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Function to handle unbanning a user
  const handleUnbanUser = async (userId: number) => {
    try {
      await apiRequest('POST', `/api/admin/users/${userId}/unban`);
      toast({
        title: "User Unbanned",
        description: "The user has been unbanned successfully.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unban user. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Function to handle resolving a report
  const handleResolveReport = async (reportId: number) => {
    try {
      await apiRequest('POST', `/api/admin/reports/${reportId}/resolve`);
      toast({
        title: "Report Resolved",
        description: "The report has been marked as resolved.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resolve report. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold">StrangerWave Admin Panel</CardTitle>
              <CardDescription>Manage users, reports, and view analytics</CardDescription>
            </div>
            <Badge variant="outline" className="ml-auto">
              {new Date().toLocaleDateString()}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 md:w-[600px] w-full">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            <span className="hidden sm:inline">Reports</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Payments</span>
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingStats ? '...' : dashboardStats?.totalUsers.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{isLoadingStats ? '...' : dashboardStats?.newUsers24h} in last 24h
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingStats ? '...' : dashboardStats?.activeToday.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isLoadingStats ? '...' : 
                    Math.round((dashboardStats?.activeToday / dashboardStats?.totalUsers) * 100)}% of total users
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingStats ? '...' : dashboardStats?.premiumUsers.toLocaleString()}
                </div>
                <Progress 
                  value={isLoadingStats ? 0 : dashboardStats?.conversionRate * 100} 
                  className="h-2 mt-2" 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {isLoadingStats ? '...' : (dashboardStats?.conversionRate * 100).toFixed(1)}% conversion rate
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${isLoadingStats ? '...' : dashboardStats?.revenueThisMonth.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  ${isLoadingStats ? '...' : dashboardStats?.revenueToday.toLocaleString()} today
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">User Activity (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={userActivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="users" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Subscription Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={premiumConversionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {premiumConversionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg. Session Length</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                  <div className="text-2xl font-bold">
                    {isLoadingStats ? '...' : `${dashboardStats?.averageSessionLength.toFixed(1)} min`}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Text vs Video Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="flex items-center mr-4">
                    <MessageSquare className="h-5 w-5 mr-1 text-blue-500" />
                    <span>
                      {isLoadingStats ? '...' : 
                        `${Math.round(100 - dashboardStats?.textToVideoRatio * 100)}%`}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <VideoIcon className="h-5 w-5 mr-1 text-green-500" />
                    <span>
                      {isLoadingStats ? '...' : 
                        `${Math.round(dashboardStats?.textToVideoRatio * 100)}%`}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">7-Day Retention</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                  <div className="text-2xl font-bold">
                    {isLoadingStats ? '...' : `${(dashboardStats?.userRetention * 100).toFixed(1)}%`}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage user accounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    className="pl-8"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="reported">Reported</SelectItem>
                    <SelectItem value="active">Active Today</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isLoadingUsers ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">Location</TableHead>
                        <TableHead className="hidden md:table-cell">Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users?.users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-2">
                                {user.username.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div>{user.username}</div>
                                <div className="text-xs text-muted-foreground">ID: {user.id}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {user.isBanned ? (
                                <Badge variant="destructive" className="w-fit">Banned</Badge>
                              ) : (
                                <Badge variant="outline" className="w-fit">Active</Badge>
                              )}
                              {user.isPremium && (
                                <Badge variant="secondary" className="w-fit">{user.premiumTier || 'Premium'}</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {user.country || 'Unknown'}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {new Date(user.created).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                                  View Profile
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {user.isBanned ? (
                                  <DropdownMenuItem onClick={() => handleUnbanUser(user.id)}>
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    Unban User
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => {
                                    setSelectedUser(user);
                                    setShowBanDialog(true);
                                  }}>
                                    <Ban className="mr-2 h-4 w-4" />
                                    Ban User
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setUserPage(p => Math.max(1, p - 1))}
                      disabled={userPage === 1}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink isActive>{userPage}</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setUserPage(p => p + 1)}
                      disabled={!users || users.users.length < usersPerPage}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Reports</CardTitle>
              <CardDescription>Review and manage user reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <Select value={reportFilter} onValueChange={setReportFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unresolved">Unresolved</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="all">All Reports</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isLoadingReports ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Report Details</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports?.reports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">Reported: {report.reportedUsername}</div>
                              <div className="text-xs text-muted-foreground">
                                by {report.reporterUsername} • {new Date(report.timestamp).toLocaleString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{report.reason}</Badge>
                          </TableCell>
                          <TableCell>
                            {report.resolved ? (
                              <Badge variant="outline" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                                Resolved
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20">
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => setSelectedReport(report)}>
                                  View Details
                                </DropdownMenuItem>
                                {!report.resolved && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleResolveReport(report.id)}>
                                      Mark as Resolved
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                      // This would set up the ban process for the reported user
                                      const reportedUser = users?.users.find(u => u.id === report.reportedUserId);
                                      if (reportedUser) {
                                        setSelectedUser(reportedUser);
                                        setShowBanDialog(true);
                                        setBanReason(report.reason);
                                      }
                                    }}>
                                      Ban Reported User
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setReportPage(p => Math.max(1, p - 1))}
                      disabled={reportPage === 1}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink isActive>{reportPage}</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setReportPage(p => p + 1)}
                      disabled={!reports || reports.reports.length === 0}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Transactions</CardTitle>
              <CardDescription>View payment history and subscription details</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTransactions ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions?.transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {transaction.type === 'subscription' ? (
                                <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                                  Subscription
                                </Badge>
                              ) : transaction.type === 'unban' ? (
                                <Badge variant="outline" className="bg-red-500/10 text-red-500">
                                  Unban Fee
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-purple-500/10 text-purple-500">
                                  Profile Boost
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                via {transaction.processor === 'stripe' ? 'Stripe' : 'PayPal'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            ${transaction.amount.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {transaction.username}
                          </TableCell>
                          <TableCell>
                            {transaction.status === 'completed' ? (
                              <Badge variant="outline" className="bg-green-500/10 text-green-500">
                                Completed
                              </Badge>
                            ) : transaction.status === 'pending' ? (
                              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                                Pending
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-500/10 text-red-500">
                                Failed
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(transaction.timestamp).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Details Dialog */}
      {selectedUser && (
        <Dialog open={!!selectedUser && !showBanDialog} onOpenChange={(open) => !open && setSelectedUser(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>User Profile</DialogTitle>
              <DialogDescription>
                Detailed information about {selectedUser.username}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold mr-4">
                  {selectedUser.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-medium text-lg">{selectedUser.username}</h3>
                  <p className="text-sm text-muted-foreground">ID: {selectedUser.id}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Status</p>
                  <div>
                    {selectedUser.isBanned ? (
                      <Badge variant="destructive">Banned</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-500/10 text-green-500">
                        Active
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium">Subscription</p>
                  <div>
                    {selectedUser.isPremium ? (
                      <Badge variant="secondary">{selectedUser.premiumTier || 'Premium'}</Badge>
                    ) : (
                      <Badge variant="outline">Free</Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium">Location</p>
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{selectedUser.country || 'Unknown'}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium">Joined</p>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{new Date(selectedUser.created).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium">Last Active</p>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{new Date(selectedUser.lastActive).toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium">Ban Count</p>
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{selectedUser.banCount || 0}</span>
                  </div>
                </div>

                <div className="space-y-1 col-span-2">
                  <p className="text-sm font-medium">IP Address</p>
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{selectedUser.ipAddress}</span>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="flex justify-between">
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
              {selectedUser.isBanned ? (
                <Button 
                  onClick={() => handleUnbanUser(selectedUser.id)}
                  variant="default"
                >
                  Unban User
                </Button>
              ) : (
                <Button 
                  onClick={() => setShowBanDialog(true)}
                  variant="destructive"
                >
                  Ban User
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Ban User Dialog */}
      <Dialog open={showBanDialog} onOpenChange={(open) => !open && setShowBanDialog(false)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              {selectedUser ? `Ban ${selectedUser.username} from using the platform.` : 'Ban user from using the platform.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="reason" className="text-sm font-medium">
                Ban Reason
              </label>
              <Input
                id="reason"
                placeholder="Enter ban reason..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowBanDialog(false);
                setBanReason('');
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedUser && handleBanUser(selectedUser.id)}
              disabled={!banReason.trim()}
            >
              Ban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Details Dialog */}
      {selectedReport && (
        <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Report Details</DialogTitle>
              <DialogDescription>
                Report #{selectedReport.id} • {new Date(selectedReport.timestamp).toLocaleString()}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Reported User</h3>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-2">
                      {selectedReport.reportedUsername.charAt(0).toUpperCase()}
                    </div>
                    <span>{selectedReport.reportedUsername}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Reporter</h3>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-2">
                      {selectedReport.reporterUsername.charAt(0).toUpperCase()}
                    </div>
                    <span>{selectedReport.reporterUsername}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-1">Reason</h3>
                <Badge variant="outline">{selectedReport.reason}</Badge>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-1">Details</h3>
                <div className="bg-muted/50 rounded-md p-3 text-sm">
                  {selectedReport.details || 'No additional details provided.'}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-1">Status</h3>
                {selectedReport.resolved ? (
                  <Badge variant="outline" className="bg-green-500/10 text-green-500">
                    Resolved
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-orange-500/10 text-orange-500">
                    Pending
                  </Badge>
                )}
              </div>
            </div>
            <DialogFooter>
              {!selectedReport.resolved ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedReport(null)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      // Ban the reported user
                      const reportedUser = users?.users.find(u => u.id === selectedReport.reportedUserId);
                      if (reportedUser) {
                        setSelectedUser(reportedUser);
                        setShowBanDialog(true);
                        setBanReason(selectedReport.reason);
                      }
                      setSelectedReport(null);
                    }}
                  >
                    Ban User
                  </Button>
                  <Button 
                    onClick={() => {
                      handleResolveReport(selectedReport.id);
                      setSelectedReport(null);
                    }}
                  >
                    Mark Resolved
                  </Button>
                </>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedReport(null)}
                >
                  Close
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}