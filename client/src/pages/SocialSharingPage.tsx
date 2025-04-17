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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  FiCopy, 
  FiCheckCircle, 
  FiTwitter, 
  FiFacebook, 
  FiInstagram, 
  FiLink, 
  FiEdit,
  FiBarChart2,
  FiShare2
} from "react-icons/fi";

const SocialSharingPage: React.FC = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [platform, setPlatform] = useState("twitter");
  const [copied, setCopied] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const userId = user?.id;

  // Get user's social shares
  const { data: shares, isLoading: isLoadingShares } = useQuery({
    queryKey: ['/api/social/user', userId],
    queryFn: () => apiRequest("GET", `/api/social/user/${userId}`),
    enabled: !!userId,
  });

  // Create social share mutation
  const createShareMutation = useMutation({
    mutationFn: (data: { content: string, platform: string }) => 
      apiRequest("POST", '/api/social/create', { 
        userId, 
        content: data.content, 
        platform: data.platform 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social/user', userId] });
      setContent("");
      setPlatform("twitter");
      toast({
        title: "Share created!",
        description: "Your social share has been created. Share it with your network!",
      });
    },
    onError: () => {
      toast({
        title: "Failed to create share",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  });

  // Track click mutation
  const trackClickMutation = useMutation({
    mutationFn: (shareId: number) => 
      apiRequest("POST", `/api/social/${shareId}/click`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social/user', userId] });
    }
  });

  const handleCreateShare = () => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter content for your share.",
        variant: "destructive",
      });
      return;
    }

    createShareMutation.mutate({ content, platform });
  };

  const handleCopyShareUrl = (shareId: number, shareUrl: string) => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(shareId);
    setTimeout(() => setCopied(null), 2000);
    toast({
      title: "Link copied!",
      description: "Share link copied to clipboard.",
    });
    
    // Track click
    trackClickMutation.mutate(shareId);
  };

  const platformIcons = {
    twitter: <FiTwitter className="h-5 w-5 text-blue-400" />,
    facebook: <FiFacebook className="h-5 w-5 text-blue-600" />,
    instagram: <FiInstagram className="h-5 w-5 text-pink-500" />,
    other: <FiLink className="h-5 w-5 text-gray-400" />,
  };

  const getShareText = (shareContent: string, shareUrl: string) => {
    switch (platform) {
      case "twitter":
        return `${shareContent} ${shareUrl} #StrangerWave`;
      case "facebook":
        return `${shareContent} ${shareUrl}`;
      case "instagram":
        return `${shareContent}\n.\n.\n.\n#StrangerWave #AnonymousChat #MeetStrangers ${shareUrl}`;
      default:
        return `${shareContent} ${shareUrl}`;
    }
  };

  return (
    <div className="container py-8 px-4 md:px-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Social Sharing</h1>
            <p className="text-muted-foreground mt-1">
              Share your StrangerWave experience on social media
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        {/* Main content */}
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Share</TabsTrigger>
            <TabsTrigger value="history">Your Shares</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FiEdit className="h-5 w-5" />
                  Create a New Share
                </CardTitle>
                <CardDescription>
                  Share your experience with friends on social media
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Choose Platform</label>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant={platform === "twitter" ? "default" : "outline"} 
                      size="sm"
                      className="flex gap-2 items-center"
                      onClick={() => setPlatform("twitter")}
                    >
                      <FiTwitter /> Twitter
                    </Button>
                    <Button 
                      variant={platform === "facebook" ? "default" : "outline"} 
                      size="sm"
                      className="flex gap-2 items-center"
                      onClick={() => setPlatform("facebook")}
                    >
                      <FiFacebook /> Facebook
                    </Button>
                    <Button 
                      variant={platform === "instagram" ? "default" : "outline"} 
                      size="sm"
                      className="flex gap-2 items-center"
                      onClick={() => setPlatform("instagram")}
                    >
                      <FiInstagram /> Instagram
                    </Button>
                    <Button 
                      variant={platform === "other" ? "default" : "outline"} 
                      size="sm"
                      className="flex gap-2 items-center"
                      onClick={() => setPlatform("other")}
                    >
                      <FiLink /> Other
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Share Content</label>
                  <Textarea 
                    placeholder="I just had an amazing chat on StrangerWave! Join me and meet fascinating people from around the world..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Preview</label>
                  <Card className="bg-muted/40 border-dashed">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {platform in platformIcons ? platformIcons[platform as keyof typeof platformIcons] : platformIcons.other}
                        <span className="font-medium">{platform.charAt(0).toUpperCase() + platform.slice(1)} Share</span>
                      </div>
                      <p className="text-sm whitespace-pre-line">
                        {content || "Enter your message above to see a preview"}
                        {content && (
                          <span className="text-primary">
                            {" "}[Your unique tracking link will appear here]
                          </span>
                        )}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  onClick={handleCreateShare} 
                  disabled={!content.trim() || createShareMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {createShareMutation.isPending ? <Loader size="sm" /> : <FiShare2 className="h-4 w-4" />}
                  Create Share
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FiBarChart2 className="h-5 w-5" />
                  Your Shares History
                </CardTitle>
                <CardDescription>
                  Track engagement with your shared content
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingShares ? (
                  <div className="flex justify-center py-8">
                    <Loader />
                  </div>
                ) : shares && shares.length > 0 ? (
                  <div className="space-y-6">
                    {shares.map((share) => (
                      <Card key={share.id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between">
                            <div className="flex items-center gap-2">
                              {share.platform && share.platform in platformIcons 
                                ? platformIcons[share.platform as keyof typeof platformIcons] 
                                : platformIcons.other}
                              <CardTitle className="text-lg">{share.platform?.charAt(0).toUpperCase() + share.platform?.slice(1) || "Other"}</CardTitle>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(share.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <p className="text-sm mb-3 whitespace-pre-line">{share.content}</p>
                          <div className="flex items-center justify-between px-3 py-2 bg-muted rounded-md text-sm">
                            <span className="truncate max-w-[200px] md:max-w-[400px]">{share.shareUrl}</span>
                            <Button size="sm" variant="ghost" onClick={() => handleCopyShareUrl(share.id, share.shareUrl)}>
                              {copied === share.id ? <FiCheckCircle className="h-4 w-4" /> : <FiCopy className="h-4 w-4" />}
                            </Button>
                          </div>
                        </CardContent>
                        <div className="px-6 py-3 bg-muted border-t">
                          <div className="flex justify-between">
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <p className="text-lg font-bold">{share.clickCount}</p>
                                <p className="text-xs text-muted-foreground">Clicks</p>
                              </div>
                              <div className="text-center">
                                <p className="text-lg font-bold">{share.convertedCount}</p>
                                <p className="text-xs text-muted-foreground">Conversions</p>
                              </div>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => handleCopyShareUrl(share.id, share.shareUrl)}>
                              Share Again
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <EmptyState 
                    title="No shares yet" 
                    description="Create your first social share to start tracking engagement"
                    icon={<FiShare2 className="h-10 w-10 text-muted-foreground" />}
                    action={
                      <Button variant="outline" onClick={() => document.querySelector('[data-value="create"]')?.click()}>
                        Create Your First Share
                      </Button>
                    }
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SocialSharingPage;