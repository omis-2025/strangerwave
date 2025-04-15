import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { LoaderCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/lib/useAuth';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Make sure to call loadStripe outside of a component's render
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CheckoutFormProps {
  userId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

function CheckoutForm({ userId, onSuccess, onCancel }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      return;
    }
    
    setLoading(true);
    setErrorMessage(null);
    
    // Confirm payment
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
      },
      redirect: 'if_required',
    });
    
    if (error) {
      // Show error message
      setErrorMessage(error.message || 'An error occurred while processing your payment');
      toast({
        title: 'Payment Failed',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
      setLoading(false);
    } else {
      // Payment successful, manually call the webhook to update user status
      try {
        await apiRequest('POST', '/api/payment/webhook', {
          type: 'payment_intent.succeeded',
          data: {
            object: {
              metadata: {
                userId: userId.toString(),
              },
            },
          },
        });
        
        toast({
          title: 'Payment Successful',
          description: 'Your account has been unbanned',
        });
        
        onSuccess();
      } catch (webhookError) {
        console.error('Failed to process webhook', webhookError);
        toast({
          title: 'Account Update Failed',
          description: 'Payment was successful, but we could not update your account. Please contact support.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      {errorMessage && (
        <div className="p-3 text-sm text-red-500 bg-red-50 rounded">
          {errorMessage}
        </div>
      )}
      
      <div className="flex space-x-3">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={loading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="flex-1"
          disabled={!stripe || loading}
        >
          {loading ? (
            <>
              <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay $10.99`
          )}
        </Button>
      </div>
    </form>
  );
}

interface PaymentFormProps {
  userId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PaymentForm({ userId, onSuccess, onCancel }: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    // Create PaymentIntent on component mount
    const createPaymentIntent = async () => {
      try {
        setLoading(true);
        
        const response = await apiRequest('POST', '/api/payment/create-payment-intent', {
          userId,
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create payment intent');
        }
        
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (err: any) {
        setError(err.message || 'An error occurred while setting up payment');
        toast({
          title: 'Payment Setup Failed',
          description: err.message || 'Please try again later',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    createPaymentIntent();
  }, [userId, toast]);
  
  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Unban Your Account</CardTitle>
        <CardDescription className="text-center">
          Pay the fee to continue using our chat service
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 text-center">
            <LoaderCircle className="w-8 h-8 mx-auto mb-4 animate-spin text-primary" />
            <p>Setting up payment...</p>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">
            <p className="mb-4">{error}</p>
            <Button onClick={onCancel}>Go Back</Button>
          </div>
        ) : clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm userId={userId} onSuccess={onSuccess} onCancel={onCancel} />
          </Elements>
        ) : (
          <div className="p-4 text-center text-red-500">
            <p className="mb-4">Failed to initialize payment</p>
            <Button onClick={onCancel}>Go Back</Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-center text-muted-foreground">
        Your payment is processed securely through Stripe. We do not store your card details.
      </CardFooter>
    </Card>
  );
}