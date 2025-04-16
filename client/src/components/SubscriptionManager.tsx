import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { MobilePaymentsManager } from '@/lib/mobilePayments';
import { Capacitor } from '@capacitor/core';

interface SubscriptionManagerProps {
  userId: number;
}

interface SubscriptionStatus {
  isActive: boolean;
  expiryDate?: string;
  tier?: string;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ userId }) => {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState(false);
  const { toast } = useToast();
  const paymentsManager = MobilePaymentsManager.getInstance();
  const isNative = Capacitor.isNativePlatform();
  const platform = paymentsManager.getPlatform();

  useEffect(() => {
    checkSubscriptionStatus();
  }, [userId]);

  const checkSubscriptionStatus = async () => {
    setLoading(true);
    try {
      const response = await apiRequest('GET', '/api/payments/subscription/status');
      const data = await response.json();
      setStatus(data);
    } catch (error: any) {
      console.error('Error checking subscription status:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not load subscription status'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    setProcessingAction(true);
    
    try {
      await paymentsManager.initialize();
      
      // Get the appropriate product ID based on platform
      const products = await paymentsManager.getAvailableProducts();
      const subscriptionProduct = products.find(p => p.type === 'subscription' && p.period === 'month');
      
      if (!subscriptionProduct) {
        throw new Error('Subscription product not found');
      }
      
      await paymentsManager.purchaseSubscription(
        subscriptionProduct.id, 
        (result) => {
          if (result.verified) {
            toast({
              title: 'Subscription Successful',
              description: 'You are now a premium member!'
            });
            checkSubscriptionStatus();
          } else {
            toast({
              variant: 'destructive',
              title: 'Subscription Failed',
              description: 'There was an issue processing your subscription'
            });
          }
          setProcessingAction(false);
        }
      );
    } catch (error: any) {
      console.error('Error subscribing:', error);
      toast({
        variant: 'destructive',
        title: 'Subscription Error',
        description: error.message || 'There was an issue processing your subscription'
      });
      setProcessingAction(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will continue to have premium access until your current period ends.')) {
      return;
    }
    
    setProcessingAction(true);
    try {
      const response = await apiRequest('POST', '/api/payments/subscription/cancel');
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Subscription Cancelled',
          description: 'Your subscription has been cancelled but will remain active until the end of your current billing period.'
        });
        checkSubscriptionStatus();
      } else {
        throw new Error('Failed to cancel subscription');
      }
    } catch (error: any) {
      console.error('Error cancelling subscription:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not cancel subscription'
      });
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRestorePurchases = async () => {
    setProcessingAction(true);
    try {
      const result = await paymentsManager.restorePurchases();
      
      if (result.restored) {
        toast({
          title: 'Purchases Restored',
          description: `Successfully restored ${result.products.length} purchase(s)`
        });
        checkSubscriptionStatus();
      } else {
        toast({
          variant: 'destructive',
          title: 'No Purchases Found',
          description: 'We couldn\'t find any purchases to restore'
        });
      }
    } catch (error: any) {
      console.error('Error restoring purchases:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not restore purchases'
      });
    } finally {
      setProcessingAction(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-[140px]" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Subscription Status</CardTitle>
          {status?.isActive && (
            <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              {status.tier === 'premium' ? 'Premium' : 'Active'}
            </Badge>
          )}
        </div>
        <CardDescription>
          Manage your StrangerWave subscription
        </CardDescription>
      </CardHeader>
      <CardContent>
        {status?.isActive ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Status</h3>
              <p>Your subscription is active until {status.expiryDate ? new Date(status.expiryDate).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Features</h3>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Unlimited chat sessions</li>
                <li>Ad-free experience</li>
                <li>Priority matching</li>
                <li>Advanced filters</li>
                <li>Custom themes</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Benefits of Premium</h3>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Unlimited chat sessions</li>
                <li>Ad-free experience</li>
                <li>Priority matching</li>
                <li>Advanced filters</li>
                <li>Custom themes</li>
              </ul>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-md">
              <p className="text-sm font-semibold">
                Subscribe for just $4.99/month
              </p>
              {isNative && (
                <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                  Subscription will be charged to your {platform === 'ios' ? 'iTunes' : 'Google Play'} account
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        {status?.isActive ? (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleCancelSubscription}
            disabled={processingAction}
          >
            {processingAction ? 'Processing...' : 'Cancel Subscription'}
          </Button>
        ) : (
          <Button 
            className="w-full"
            onClick={handleSubscribe}
            disabled={processingAction}
          >
            {processingAction ? 'Processing...' : 'Subscribe Now'}
          </Button>
        )}
        
        {isNative && (
          <Button 
            variant="ghost" 
            className="w-full"
            onClick={handleRestorePurchases}
            disabled={processingAction}
          >
            Restore Purchases
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default SubscriptionManager;