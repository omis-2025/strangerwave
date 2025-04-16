import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Lock, CreditCard, Star, CheckCircle } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import PayPalButton from './PayPalButton';

interface PremiumSubscriptionProps {
  onClose?: () => void;
}

export default function PremiumSubscription({ onClose }: PremiumSubscriptionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [selectedTab, setSelectedTab] = useState<string>('monthly');

  const handleSubscriptionSuccess = () => {
    toast({
      title: "Subscription Successful",
      description: "Thank you for subscribing to StrangerWave Premium!",
    });
    
    if (onClose) {
      onClose();
    }
  };

  return (
    <Card className="w-full max-w-md border border-gray-700 bg-gray-800 shadow-xl">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-2">
          <Star className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl text-white">StrangerWave Premium</CardTitle>
        <CardDescription className="text-gray-300">
          Upgrade your chat experience with exclusive features
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="bg-gray-700/30 p-1.5 rounded-full mr-3 mt-0.5">
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">Ad-free experience</p>
              <p className="text-gray-400 text-xs">No interruptions while chatting</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="bg-gray-700/30 p-1.5 rounded-full mr-3 mt-0.5">
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">Priority matching</p>
              <p className="text-gray-400 text-xs">Find chat partners faster</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="bg-gray-700/30 p-1.5 rounded-full mr-3 mt-0.5">
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">Premium profile badge</p>
              <p className="text-gray-400 text-xs">Stand out in the chat list</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="bg-gray-700/30 p-1.5 rounded-full mr-3 mt-0.5">
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">Advanced filters</p>
              <p className="text-gray-400 text-xs">More options to find the perfect chat partner</p>
            </div>
          </div>
        </div>
        
        <div className="pt-4">
          <Tabs defaultValue="monthly" className="w-full" onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-1 mb-4">
              <TabsTrigger value="monthly" className="flex items-center justify-center">
                <Star className="h-4 w-4 mr-2" />
                Monthly - $4.99
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="monthly" className="space-y-4">
              <div className="flex items-center justify-center mb-4 bg-primary/10 p-2 rounded-lg border border-primary/20">
                <Lock className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm text-primary font-medium">Secure Payment Processing</span>
              </div>
              
              {user ? (
                <div className="space-y-4">
                  <PayPalButton 
                    userId={user.userId}
                    productType="subscription"
                    subscriptionType="monthly"
                    buttonLabel="Subscribe with PayPal"
                    onSuccess={handleSubscriptionSuccess}
                    onCancel={() => {
                      toast({
                        title: "Subscription Cancelled",
                        description: "You have cancelled the subscription process.",
                      });
                    }}
                  />
                </div>
              ) : (
                <Button 
                  onClick={() => navigate('/login')} 
                  className="w-full"
                >
                  Sign in to Subscribe
                </Button>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Trust badges */}
        <div className="pt-4 border-t border-gray-700">
          <div className="flex flex-wrap justify-center gap-4 mb-4">
            <div className="flex items-center text-xs text-gray-400">
              <Shield className="h-4 w-4 mr-1 text-primary" />
              <span>Secure Payments</span>
            </div>
            <div className="flex items-center text-xs text-gray-400">
              <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
              <span>Cancel Anytime</span>
            </div>
            <div className="flex items-center text-xs text-gray-400">
              <Lock className="h-4 w-4 mr-1 text-blue-500" />
              <span>GDPR Compliant</span>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-center border-t border-gray-700 pt-4">
        <p className="text-xs text-gray-400">
          By subscribing, you agree to our Terms of Service
        </p>
      </CardFooter>
    </Card>
  );
}