import { useEffect, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/lib/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function PaymentSuccess() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [planType, setPlanType] = useState<string | null>(null);
  
  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get the session ID from URL parameters
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get('session_id');
        
        if (!sessionId) {
          setError('No session ID found in URL.');
          setLoading(false);
          return;
        }
        
        // Call API to verify the payment
        const response = await apiRequest('GET', `/api/stripe/verify-checkout?session_id=${sessionId}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to verify payment');
        }
        
        // Payment verified successfully
        setPlanType(data.planType);
        
        // Refresh user data to get updated subscription status
        if (refreshUser) {
          await refreshUser();
        }
        
        toast({
          title: 'Payment Successful!',
          description: `Thank you for subscribing to ${data.planType === 'premium' ? 'Premium' : 'VIP'}.`,
          variant: 'default',
        });
      } catch (err) {
        console.error('Payment verification error:', err);
        setError('Failed to verify your payment. Please contact support.');
      } finally {
        setLoading(false);
      }
    };
    
    verifyPayment();
  }, [toast, refreshUser]);
  
  const handleContinue = () => {
    navigate('/chat');
  };
  
  return (
    <div className="container max-w-md mx-auto py-16 px-4">
      <Card className="border-2 border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {loading ? 'Processing Payment' : error ? 'Payment Error' : 'Payment Successful'}
          </CardTitle>
          <CardDescription>
            {loading 
              ? 'Please wait while we process your payment...' 
              : error 
                ? 'We encountered an issue with your payment' 
                : `You're now subscribed to ${planType === 'premium' ? 'Premium' : 'VIP'}!`}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center justify-center pt-6">
          {loading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground text-sm">Verifying your payment...</p>
            </div>
          ) : error ? (
            <div className="text-center">
              <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-4">
                {error}
              </div>
              <p className="text-sm text-muted-foreground">
                If you believe this is an error, please contact our support team.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="bg-primary/10 p-6 rounded-full mb-6">
                <CheckCircle className="h-16 w-16 text-primary" />
              </div>
              
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold mb-2">
                  Thank you for your purchase!
                </h3>
                <p className="text-muted-foreground">
                  Your account has been upgraded to {planType === 'premium' ? 'Premium' : 'VIP'}.
                  Enjoy your enhanced experience!
                </p>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={handleContinue}
            disabled={loading}
          >
            {error ? 'Try Again' : 'Continue to Chat'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}