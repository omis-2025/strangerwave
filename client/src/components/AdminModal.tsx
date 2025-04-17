import { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserData {
  id: number;
  username: string;
  isBanned: boolean;
  lastActive: string;
  ipAddress: string;
  subscriptionTier?: string;
  subscriptionExpiryDate?: string;
  banCount?: number;
  unbannedAt?: string;
}

export default function AdminModal({ isOpen, onClose }: AdminModalProps) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      const queryParams = new URLSearchParams();
      
      // Apply filters based on selection
      switch (filter) {
        case "banned":
          queryParams.set("banned", "true");
          break;
        case "active":
          queryParams.set("banned", "false");
          break;
        case "subscribed":
          queryParams.set("subscribed", "true");
          break;
        case "premium":
          queryParams.set("tier", "premium");
          break;
        case "vip":
          queryParams.set("tier", "vip");
          break;
        case "unbanned":
          queryParams.set("recently_unbanned", "true");
          break;
      }
      
      const response = await fetch(`/api/admin/users?${queryParams.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, filter]);
  
  const handleBanUser = async (userId: number) => {
    try {
      const response = await apiRequest("POST", `/api/admin/users/${userId}/ban`, {});
      
      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Error banning user:", error);
    }
  };
  
  const handleUnbanUser = async (userId: number) => {
    try {
      const response = await apiRequest("POST", `/api/admin/users/${userId}/unban`, {});
      
      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Error unbanning user:", error);
    }
  };
  
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.ipAddress?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
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
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className={`fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 ${isOpen ? '' : 'hidden'}`}>
        <div className="bg-surface rounded-lg w-full max-w-4xl mx-4 overflow-hidden">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <h3 className="text-lg font-medium text-text-primary">Admin Panel</h3>
            <button 
              className="text-text-secondary hover:text-text-primary"
              onClick={onClose}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          
          <div className="p-5">
            <div className="mb-6">
              <h4 className="text-lg font-medium text-text-primary mb-3">User Management</h4>
              
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
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
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="max-w-[180px]">
                    <SelectValue placeholder="Filter users" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="banned">Banned Users</SelectItem>
                    <SelectItem value="active">Active Users</SelectItem>
                    <SelectItem value="subscribed">Subscribers</SelectItem>
                    <SelectItem value="premium">Premium Users</SelectItem>
                    <SelectItem value="vip">VIP Users</SelectItem>
                    <SelectItem value="unbanned">Recently Unbanned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* User List */}
              <div className="bg-surface-light rounded-lg overflow-hidden">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-text-secondary">Loading users...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-text-secondary">No users found</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-800">
                    <thead className="bg-black bg-opacity-20">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                          User ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                          IP Address
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                          Subscription
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                          Last Active
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                            {user.username}
                            {user.banCount && user.banCount > 0 && (
                              <div className="text-xs text-red-400 mt-1">
                                Ban count: {user.banCount}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                            {user.ipAddress || "Unknown"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              user.isBanned 
                                ? 'bg-red-900 text-red-200' 
                                : 'bg-green-900 text-green-200'
                            }`}>
                              {user.isBanned ? 'Banned' : 'Active'}
                            </span>
                            {user.unbannedAt && (
                              <div className="text-xs text-gray-400 mt-1">
                                Unbanned: {formatDate(user.unbannedAt)}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {user.subscriptionTier ? (
                              <div>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  user.subscriptionTier.toLowerCase() === 'premium'
                                    ? 'bg-blue-900 text-blue-200'
                                    : 'bg-purple-900 text-purple-200'
                                }`}>
                                  {user.subscriptionTier}
                                </span>
                                {user.subscriptionExpiryDate && (
                                  <div className="text-xs text-gray-400 mt-1">
                                    Expires: {formatDate(user.subscriptionExpiryDate)}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-500">Basic</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                            {formatDate(user.lastActive)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {user.isBanned ? (
                              <button 
                                className="text-primary hover:text-blue-400 mr-3"
                                onClick={() => handleUnbanUser(user.id)}
                              >
                                Unban
                              </button>
                            ) : (
                              <button 
                                className="text-error hover:text-red-400 mr-3"
                                onClick={() => handleBanUser(user.id)}
                              >
                                Ban
                              </button>
                            )}
                            <button className="text-text-secondary hover:text-text-primary">
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              
              {/* Pagination (simplified) */}
              {filteredUsers.length > 0 && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-text-secondary text-sm">
                    Showing {Math.min(10, filteredUsers.length)} of {filteredUsers.length} users
                  </div>
                  <div className="flex space-x-1">
                    <Button size="sm" variant="outline" className="bg-primary text-white">1</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
