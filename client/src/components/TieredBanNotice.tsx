import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface TieredBanNoticeProps {
  banCount: number;
  onWatchAd: () => void;
  onUnban: () => void;
}

export default function TieredBanNotice({ banCount, onWatchAd, onUnban }: TieredBanNoticeProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [adWatched, setAdWatched] = useState(false);
  
  const isFirstBan = banCount === 1;
  const handleWatchAd = async () => {
    setIsLoading(true);
    
    // Simulate ad watching (in a real app, this would be your ad provider's code)
    setTimeout(() => {
      setAdWatched(true);
      setIsLoading(false);
      toast({
        title: "Ad completed",
        description: "Thank you for watching. You can now continue chatting.",
      });
      onWatchAd();
    }, 3000);
  };
  
  const handlePayment = async () => {
    setIsLoading(true);
    try {
      // Call the payment intent endpoint
      const response = await apiRequest(
        "POST",
        "/api/create-payment-intent",
        { amount: 10.99 }
      );
      
      if (!response.ok) {
        throw new Error("Failed to create payment");
      }
      
      const data = await response.json();
      
      // Redirect to payment page with client secret
      window.location.href = `/payment?clientSecret=${data.clientSecret}`;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process payment request. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="border-red-900/30 bg-red-950/10 mb-6">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-2">
          <div className="bg-red-500/10 p-2 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-red-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <CardTitle className="text-xl text-red-500">Account Restricted</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-gray-300 mb-2">
            {isFirstBan 
              ? "Your account has been temporarily banned due to violation of our community guidelines."
              : "Your account has been banned multiple times. To continue using our service, you'll need to pay a fee."}
          </p>
          <p className="text-gray-400 text-sm">
            {isFirstBan
              ? "You can watch an ad to remove the ban immediately, or pay $10.99 to permanently remove this ban."
              : "After multiple violations, you need to pay $10.99 to unban your account."}
          </p>
        </div>
        
        {isFirstBan && !adWatched && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 mb-4">
            <div className="flex items-center">
              <div className="bg-amber-500/10 p-1.5 rounded-full mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-amber-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              </div>
              <span className="text-sm text-amber-200">
                Free option: Watch a 30-second ad to continue
              </span>
            </div>
          </div>
        )}

        {banCount > 1 && (
          <div className="bg-red-900/20 border border-red-900/30 rounded-lg p-3 mb-4">
            <div className="flex items-center">
              <div className="bg-red-500/20 p-1.5 rounded-full mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-red-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <span className="text-sm text-red-200">
                This is ban #{banCount}. After 3 bans, payment will be your only option.
              </span>
            </div>
          </div>
        )}

        <div className="bg-gray-800/50 border border-gray-700 rounded-lg">
          <div className="p-4 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-200">Unban Fee</span>
              <span className="font-bold text-gray-200">$10.99</span>
            </div>
            <p className="text-gray-400 text-xs mt-1">
              One-time payment to restore your account 
            </p>
          </div>
          <div className="p-4">
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 text-green-500 mr-2 mt-0.5" 
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Immediate account restoration</span>
              </li>
              <li className="flex items-start">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 text-green-500 mr-2 mt-0.5" 
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Reset your ban counter</span>
              </li>
              <li className="flex items-start">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 text-green-500 mr-2 mt-0.5" 
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Continue chatting without restrictions</span>
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-3">
        {isFirstBan && !adWatched && (
          <Button 
            variant="outline"
            className="w-full sm:w-auto"
            onClick={handleWatchAd}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                Loading ad...
              </div>
            ) : (
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="10 8 16 12 10 16 10 8" />
                </svg>
                Watch Ad
              </div>
            )}
          </Button>
        )}
        <Button 
          className="w-full sm:w-auto bg-gradient-to-r from-primary to-blue-600"
          onClick={handlePayment}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Processing...
            </div>
          ) : (
            <div className="flex items-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 mr-2" 
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              Pay $10.99
            </div>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}