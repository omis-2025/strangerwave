import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Demo() {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();
  const [userState, setUserState] = useState({
    id: 1, // mock user ID
    username: 'demo_user',
    isBanned: false,
    hasSubscription: false,
    subscriptionTier: null
  });
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleBanUser = () => {
    setUserState(prev => ({...prev, isBanned: true}));
    addLog('User banned');
    toast({
      title: 'User Banned',
      description: 'The user has been banned for violating community guidelines.',
      variant: 'destructive',
    });
  };

  const handleUnbanUser = () => {
    setUserState(prev => ({...prev, isBanned: false}));
    addLog('User unbanned manually by admin');
    toast({
      title: 'User Unbanned',
      description: 'The user has been unbanned successfully.',
    });
  };

  const handlePayment = async (type: string, tier?: string) => {
    try {
      setLoading(type);
      addLog(`Creating ${type} checkout session...`);
      
      // In a real app, this would call the API to create a checkout session
      setTimeout(() => {
        if (type === 'unban') {
          addLog('Payment successful - user automatically unbanned');
          setUserState(prev => ({...prev, isBanned: false}));
        } else if (tier) {
          addLog(`Subscription to ${tier} successful`);
          setUserState(prev => ({
            ...prev, 
            hasSubscription: true, 
            subscriptionTier: tier,
            // Auto-unban if banned and buying subscription
            isBanned: prev.isBanned ? false : prev.isBanned
          }));
          if (userState.isBanned) {
            addLog('User automatically unbanned due to subscription purchase');
          }
        }
        
        toast({
          title: type === 'unban' ? 'Unban Fee Paid' : 'Subscription Activated',
          description: type === 'unban' 
            ? 'Your account has been unbanned successfully.' 
            : `You're now subscribed to ${tier}!`,
        });
        
        setLoading(null);
      }, 2000);
      
    } catch (error) {
      console.error('Checkout error:', error);
      addLog(`Error: ${error.message}`);
      toast({
        title: "Checkout Failed",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
      setLoading(null);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">StrangerWave Payment Flow Demo</h1>
      
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>User Status</CardTitle>
            <CardDescription>Current user account status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Username:</span>
              <span>{userState.username}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Account Status:</span>
              <span className={`px-2 py-1 text-sm rounded-full ${
                userState.isBanned 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {userState.isBanned ? 'Banned' : 'Active'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Subscription:</span>
              {userState.hasSubscription ? (
                <span className={`px-2 py-1 text-sm rounded-full ${
                  userState.subscriptionTier === 'Premium'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {userState.subscriptionTier}
                </span>
              ) : (
                <span className="text-gray-500">None</span>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
            {userState.isBanned ? (
              <>
                <Button 
                  className="w-full bg-red-500 hover:bg-red-600"
                  onClick={() => handlePayment('unban')}
                  disabled={loading !== null}
                >
                  {loading === 'unban' ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                  ) : (
                    'Pay $10.99 Unban Fee'
                  )}
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  Pay a one-time fee to remove the ban from your account.
                </p>
                <div className="border-t w-full my-2"></div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleUnbanUser}
                >
                  Admin: Force Unban
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                className="w-full text-red-500"
                onClick={handleBanUser}
              >
                Admin: Ban User
              </Button>
            )}
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Subscription Options</CardTitle>
            <CardDescription>Choose a plan that's right for you</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="premium">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="premium" className="w-full">Premium</TabsTrigger>
                <TabsTrigger value="vip" className="w-full">VIP</TabsTrigger>
              </TabsList>
              
              <TabsContent value="premium" className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Price:</span>
                  <span className="text-xl font-bold">$4.99/month</span>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    No ads or interruptions
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Priority matching
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Extended video time
                  </li>
                </ul>
                <Button 
                  className="w-full mt-4 bg-blue-500 hover:bg-blue-600"
                  onClick={() => handlePayment('subscription', 'Premium')}
                  disabled={loading !== null}
                >
                  {loading === 'subscription' ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                  ) : (
                    'Subscribe Now'
                  )}
                </Button>
              </TabsContent>
              
              <TabsContent value="vip" className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Price:</span>
                  <span className="text-xl font-bold">$7.99/month</span>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Everything in Premium
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    VIP customer support
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Exclusive filters
                  </li>
                </ul>
                <Button 
                  className="w-full mt-4 bg-purple-500 hover:bg-purple-600"
                  onClick={() => handlePayment('subscription', 'VIP')}
                  disabled={loading !== null}
                >
                  {loading === 'subscription' ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                  ) : (
                    'Subscribe Now'
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Payment Process Flow</CardTitle>
          <CardDescription>See what happens during payment processing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-4 max-h-60 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500 text-center">No payment activity yet. Start a transaction to see the flow.</p>
            ) : (
              <ul className="space-y-1 font-mono text-sm">
                {logs.map((log, index) => (
                  <li key={index}>{log}</li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Alert className="bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
            <AlertDescription>
              In production, these steps would connect to Stripe's API to process real payments.
              The auto-unban feature works in two ways: via direct unban fee payment or as a courtesy
              when banned users purchase a Premium or VIP subscription.
            </AlertDescription>
          </Alert>
        </CardFooter>
      </Card>
    </div>
  );
}