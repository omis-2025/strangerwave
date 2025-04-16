import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { Button } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';

interface PayPalButtonProps {
  userId: number;
  productType: 'unban' | 'subscription';
  subscriptionType?: 'monthly';
  buttonLabel?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PayPalButton({
  userId,
  productType,
  subscriptionType,
  buttonLabel = 'Pay with PayPal',
  onSuccess,
  onCancel
}: PayPalButtonProps) {
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch the PayPal client ID
  useEffect(() => {
    const fetchClientId = async () => {
      try {
        const response = await apiRequest('GET', '/api/paypal/client-id');
        const data = await response.json();
        setClientId(data.clientId);
      } catch (error: any) {
        console.error('Error fetching PayPal client ID:', error);
        toast({
          title: 'PayPal Setup Failed',
          description: error.message || 'Could not initialize PayPal. Please try another payment method.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchClientId();
  }, [toast]);

  // Function to create a PayPal order
  const createOrder = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('POST', '/api/paypal/create-order', {
        userId,
        productType,
        subscriptionType: productType === 'subscription' ? subscriptionType : undefined,
      });
      
      const data = await response.json();
      setOrderId(data.orderId);
      return data.orderId;
    } catch (error: any) {
      console.error('Error creating PayPal order:', error);
      toast({
        title: 'PayPal Order Failed',
        description: error.message || 'Could not create order. Please try another payment method.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Function to handle approved payment
  const onApprove = async (data: { orderID: string }) => {
    try {
      setLoading(true);
      const response = await apiRequest('POST', '/api/paypal/capture-order', {
        orderId: data.orderID,
      });
      
      const responseData = await response.json();
      
      if (responseData.success) {
        toast({
          title: 'Payment Successful',
          description: productType === 'unban' 
            ? 'Your account has been unbanned. You can now continue using the chat service.'
            : 'Your subscription has been activated. Thank you for supporting StrangerWave!',
        });
        onSuccess();
      } else {
        throw new Error('Failed to capture order');
      }
      
      return responseData;
    } catch (error: any) {
      console.error('Error capturing PayPal order:', error);
      toast({
        title: 'Payment Failed',
        description: error.message || 'Failed to process payment. Please try again.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  if (!clientId) {
    return (
      <Button disabled className="w-full flex items-center justify-center">
        <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
        Loading PayPal...
      </Button>
    );
  }

  return (
    <PayPalScriptProvider options={{ clientId }}>
      <div className="paypal-button-container">
        <PayPalButtons
          style={{ layout: "horizontal", label: "pay" }}
          disabled={loading}
          forceReRender={[userId, productType, subscriptionType]}
          createOrder={createOrder}
          onApprove={onApprove}
          onCancel={() => {
            toast({
              title: 'Payment Cancelled',
              description: 'You have cancelled the payment process.',
            });
            onCancel();
          }}
          onError={(err) => {
            console.error('PayPal Error:', err);
            toast({
              title: 'PayPal Error',
              description: 'There was an issue with the PayPal payment. Please try another method.',
              variant: 'destructive',
            });
          }}
        />
      </div>
    </PayPalScriptProvider>
  );
}