import { useState, useEffect } from "react";
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from "@/lib/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  console.warn('Missing Stripe public key. Payment features will be limited.');
}

const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [, navigate] = useLocation();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin,
        },
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Successful",
          description: "Your access has been restored. You can now continue chatting.",
        });
        
        // Navigate back to the chat
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message || "An error occurred during payment processing",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="w-full"
      >
        {isProcessing ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          "Pay $10.99 & Restore Access"
        )}
      </Button>
    </form>
  );
};

export default function Payment() {
  const { user, isBanned } = useAuth();
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  useEffect(() => {
    // If user is not banned, redirect to home
    if (user && !isBanned) {
      navigate('/');
      return;
    }
    
    // Skip payment flow if Stripe is not configured
    if (!stripePromise) {
      setIsLoading(false);
      return;
    }

    // Create PaymentIntent when component mounts
    const createPaymentIntent = async () => {
      try {
        if (!user) return;
        
        const response = await apiRequest(
          "POST", 
          "/api/create-payment-intent", 
          { userId: user.userId }
        );
        
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error("Error creating payment intent:", error);
        toast({
          title: "Payment Setup Failed",
          description: "Could not initialize payment. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      createPaymentIntent();
    } else {
      setIsLoading(false);
    }
  }, [user, isBanned, navigate, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-surface py-4 px-4 sm:px-6 shadow-md">
        <div className="container mx-auto">
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
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Account Restricted
          </h1>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 sm:p-6 flex flex-col items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-14 w-14 text-error mx-auto mb-2" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
            <CardTitle className="text-xl">Your account has been restricted</CardTitle>
            <CardDescription>
              Due to violations of our community guidelines, your account has been restricted from using our service.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-surface-light p-4 rounded-lg mb-4">
              <h3 className="font-medium text-text-primary mb-2">Restore Access</h3>
              <p className="text-text-secondary mb-4">You can restore your access by paying a one-time fee of $10.99</p>
              
              {!stripePromise ? (
                <div className="text-center p-4 bg-black bg-opacity-20 rounded-lg">
                  <p className="text-error mb-2">Payment services are currently unavailable</p>
                  <p className="text-text-secondary text-sm">Please try again later or contact support</p>
                </div>
              ) : clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <PaymentForm />
                </Elements>
              ) : (
                <div className="flex justify-center p-4">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              )}
            </div>
            
            <div className="text-center text-text-secondary text-sm">
              <p>If you believe this was a mistake, please <a href="#" className="text-primary hover:underline">contact support</a>.</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
          </CardFooter>
        </Card>
      </main>

      <footer className="bg-surface py-4 px-4 sm:px-6 border-t border-gray-800">
        <div className="container mx-auto text-center text-text-secondary text-sm">
          <p>© {new Date().getFullYear()} Anonymous Chat - <a href="#" className="hover:text-primary">Terms</a> · <a href="#" className="hover:text-primary">Privacy</a></p>
        </div>
      </footer>
    </div>
  );
}
