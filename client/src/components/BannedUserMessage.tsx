import { useState } from 'react';
import { useAuth } from '@/lib/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertOctagon } from 'lucide-react';

export function BannedUserMessage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const handleUnbanPayment = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to make a payment.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Create a checkout session for unbanning
      const response = await apiRequest('POST', '/api/stripe/create-checkout-session', {
        planType: 'UNBAN',
        userId: user?.userId || 0
      });
      
      const data = await response.json();
      
      if (response.ok && data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Could not create checkout session');
      }
    } catch (error) {
      console.error('Unban checkout error:', error);
      toast({
        title: "Checkout Failed",
        description: "Failed to start checkout process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Only show if the user is banned
  if (!user?.isBanned) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 bg-gray-900/90 flex items-center justify-center p-4 z-50">
      <Card className="max-w-md w-full border-red-500/50">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-red-500/20 p-4 rounded-full">
              <AlertOctagon className="h-10 w-10 text-red-500" />
            </div>
          </div>
          <CardTitle className="text-xl text-center text-red-500">Account Banned</CardTitle>
          <CardDescription className="text-center">
            Your account has been banned for violating our community guidelines.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm">
              Your account has been banned due to inappropriate behavior or content that violates our 
              community guidelines. This may include:
            </p>
            <ul className="text-sm list-disc pl-5 space-y-1">
              <li>Sharing inappropriate or explicit content</li>
              <li>Harassment or abusive behavior</li>
              <li>Violating our terms of service</li>
              <li>Repeated reports from other users</li>
            </ul>
            <p className="text-sm mt-4">
              You can unban your account by paying a one-time fee of <strong>$10.99</strong>.
              After payment, your account will be immediately unbanned, and you can continue chatting.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full bg-red-500 hover:bg-red-600"
            onClick={handleUnbanPayment}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              'Pay $10.99 to Unban'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}