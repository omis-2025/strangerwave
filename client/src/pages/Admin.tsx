import { useState, useEffect } from "react";
import { useAuth } from "@/lib/useAuth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  username: string;
  isBanned: boolean;
  lastActive: string;
  ipAddress: string;
}

interface Report {
  id: number;
  reporterId: number;
  reportedId: number;
  sessionId: number;
  reason: string;
  details: string;
  createdAt: string;
  resolved: boolean;
}

export default function Admin() {
  const { user, isAdmin, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [reportFilter, setReportFilter] = useState("unresolved");
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [activeTab, setActiveTab] = useState("users");

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to access this page."
      });
      navigate("/");
    }
  }, [isLoading, isAdmin, navigate, toast]);

  // Fetch users based on filter
  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      
      const queryParams = new URLSearchParams();
      if (userFilter === "banned") {
        queryParams.set("banned", "true");
      } else if (userFilter === "active") {
        queryParams.set("banned", "false");
      }
      
      const response = await fetch(`/api/admin/users?${queryParams.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch users"
        });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while fetching users"
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Fetch reports based on filter
  const fetchReports = async () => {
    try {
      setIsLoadingReports(true);
      
      const queryParams = new URLSearchParams();
      if (reportFilter === "unresolved") {
        queryParams.set("resolved", "false");
      } else if (reportFilter === "resolved") {
        queryParams.set("resolved", "true");
      }
      
      const response = await fetch(`/api/admin/reports?${queryParams.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch reports"
        });
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while fetching reports"
      });
    } finally {
      setIsLoadingReports(false);
    }
  };

  // Load data on initial render and when filters change
  useEffect(() => {
    if (isAdmin) {
      if (activeTab === "users") {
        fetchUsers();
      } else if (activeTab === "reports") {
        fetchReports();
      }
    }
  }, [isAdmin, activeTab, userFilter, reportFilter]);

  // Ban a user
  const handleBanUser = async (userId: number) => {
    try {
      const response = await apiRequest("POST", `/api/admin/users/${userId}/ban`, {});
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "User has been banned"
        });
        fetchUsers();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to ban user"
        });
      }
    } catch (error) {
      console.error("Error banning user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while banning user"
      });
    }
  };

  // Unban a user
  const handleUnbanUser = async (userId: number) => {
    try {
      const response = await apiRequest("POST", `/api/admin/users/${userId}/unban`, {});
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "User has been unbanned"
        });
        fetchUsers();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to unban user"
        });
      }
    } catch (error) {
      console.error("Error unbanning user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while unbanning user"
      });
    }
  };

  // Resolve a report
  const handleResolveReport = async (reportId: number) => {
    try {
      const response = await apiRequest("POST", `/api/admin/reports/${reportId}/resolve`, {});
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Report has been resolved"
        });
        fetchReports();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to resolve report"
        });
      }
    } catch (error) {
      console.error("Error resolving report:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while resolving report"
      });
    }
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.ipAddress?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "Never";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);
    
    if (diffSec < 60) return "Just now";
    if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
    if (diffHr < 24) return `${diffHr} hour${diffHr !== 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    
    return format(date, "MMM d, yyyy");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-surface py-4 px-4 sm:px-6 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-text-primary flex items-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-2 text-accent" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M19 7V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v2" />
              <path d="M12 12v7" />
              <path d="M17 12v7" />
              <path d="M7 12v7" />
              <path d="M22 12H2" />
              <path d="M19 12a3 3 0 0 1-3-3" />
              <path d="M8 12a3 3 0 0 1-3-3" />
              <path d="M14 9a2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 1 2-2 2 2 0 0 1 2 2Z" />
            </svg>
            Admin Panel
          </h1>
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-text-primary hover:text-primary"
          >
            Back to Chat
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 sm:p-6">
        <Card className="mb-6">
          <CardContent className="py-6">
            <Tabs defaultValue="users" onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="users">User Management</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
              </TabsList>
              
              <TabsContent value="users">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-5 w-5 text-text-secondary" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                      </div>
                    </div>
                    
                    <Select value={userFilter} onValueChange={setUserFilter}>
                      <SelectTrigger className="max-w-[180px]">
                        <SelectValue placeholder="Filter users" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="banned">Banned Users</SelectItem>
                        <SelectItem value="active">Active Users</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {isLoadingUsers ? (
                    <div className="p-8 text-center">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-text-secondary">Loading users...</p>
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-text-secondary">No users found</p>
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-surface-light">
                            <TableHead>User ID</TableHead>
                            <TableHead>IP Address</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last Active</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.username}</TableCell>
                              <TableCell>{user.ipAddress || "Unknown"}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  user.isBanned 
                                    ? 'bg-red-900 text-red-200' 
                                    : 'bg-green-900 text-green-200'
                                }`}>
                                  {user.isBanned ? 'Banned' : 'Active'}
                                </span>
                              </TableCell>
                              <TableCell>{formatDate(user.lastActive)}</TableCell>
                              <TableCell>
                                {user.isBanned ? (
                                  <Button 
                                    variant="ghost" 
                                    className="text-primary hover:text-blue-400"
                                    onClick={() => handleUnbanUser(user.id)}
                                  >
                                    Unban
                                  </Button>
                                ) : (
                                  <Button 
                                    variant="ghost" 
                                    className="text-error hover:text-red-400"
                                    onClick={() => handleBanUser(user.id)}
                                  >
                                    Ban
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="reports">
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <Select value={reportFilter} onValueChange={setReportFilter}>
                      <SelectTrigger className="max-w-[180px]">
                        <SelectValue placeholder="Filter reports" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Reports</SelectItem>
                        <SelectItem value="unresolved">Unresolved</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {isLoadingReports ? (
                    <div className="p-8 text-center">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-text-secondary">Loading reports...</p>
                    </div>
                  ) : reports.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-text-secondary">No reports found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reports.map((report) => (
                        <Card key={report.id} className={report.resolved ? "opacity-70" : ""}>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-base">
                                Report #{report.id}
                              </CardTitle>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                report.resolved 
                                  ? 'bg-green-900 text-green-200' 
                                  : 'bg-amber-900 text-amber-200'
                              }`}>
                                {report.resolved ? 'Resolved' : 'Pending'}
                              </span>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-text-secondary">Reporter:</div>
                              <div>User #{report.reporterId}</div>
                              
                              <div className="text-text-secondary">Reported:</div>
                              <div>User #{report.reportedId}</div>
                              
                              <div className="text-text-secondary">Session:</div>
                              <div>#{report.sessionId}</div>
                              
                              <div className="text-text-secondary">Reason:</div>
                              <div>{report.reason}</div>
                              
                              <div className="text-text-secondary">Date:</div>
                              <div>{formatDate(report.createdAt)}</div>
                            </div>
                            
                            {report.details && (
                              <div className="mt-2 pt-2 border-t border-gray-800">
                                <div className="text-text-secondary text-sm mb-1">Details:</div>
                                <p className="text-sm">{report.details}</p>
                              </div>
                            )}
                            
                            {!report.resolved && (
                              <div className="flex justify-between mt-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleBanUser(report.reportedId)}
                                >
                                  Ban User
                                </Button>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleResolveReport(report.id)}
                                >
                                  Mark Resolved
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      <footer className="bg-surface py-4 px-4 sm:px-6 border-t border-gray-800">
        <div className="container mx-auto text-center text-text-secondary text-sm">
          <p>© {new Date().getFullYear()} StrangerWave - <a href="#" className="hover:text-primary">Terms</a> · <a href="#" className="hover:text-primary">Privacy</a></p>
        </div>
      </footer>
    </div>
  );
}
