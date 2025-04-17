import { useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/lib/useAuth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, Check, X } from 'lucide-react';

// Pricing data structure
const pricingPlans = [
  {
    id: 'premium',
    name: 'Premium',
    prices: {
      monthly: 5.99,
      yearly: 59.99
    },
    features: [
      { text: 'No ads or interruptions', included: true },
      { text: 'Priority matching', included: true },
      { text: 'Profile customization', included: true },
      { text: 'Extended video time', included: true },
      { text: 'VIP customer support', included: false },
      { text: 'Exclusive filters', included: false }
    ],
    popular: false,
    color: 'bg-blue-500'
  },
  {
    id: 'vip',
    name: 'VIP',
    prices: {
      monthly: 9.99,
      yearly: 99.99
    },
    features: [
      { text: 'No ads or interruptions', included: true },
      { text: 'Priority matching', included: true },
      { text: 'Profile customization', included: true },
      { text: 'Extended video time', included: true },
      { text: 'VIP customer support', included: true },
      { text: 'Exclusive filters', included: true }
    ],
    popular: true,
    color: 'bg-purple-600'
  }
];

export default function Pricing() {
  const [yearly, setYearly] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const handleSubscribe = async (planType: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to subscribe to a plan.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(planType);
      
      // Create a checkout session
      const response = await apiRequest('POST', '/api/stripe/create-checkout-session', {
        planType: planType.toUpperCase(),
        userId: user?.userId || 0,
        interval: yearly ? 'yearly' : 'monthly'
      });
      
      const data = await response.json();
      
      if (response.ok && data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Could not create checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Failed",
        description: "Failed to start checkout process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };
  
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
      setLoading('unban');
      
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
      setLoading(null);
    }
  };
  
  return (
    <div className="container mx-auto py-16 px-4">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-4xl font-bold mb-3">Choose Your Plan</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Upgrade your chat experience with premium features and no interruptions.
        </p>
        
        <div className="flex items-center justify-center mb-8">
          <Label htmlFor="billing-toggle" className={`mr-2 ${!yearly ? 'font-medium' : 'text-muted-foreground'}`}>
            Monthly
          </Label>
          <Switch 
            id="billing-toggle" 
            checked={yearly} 
            onCheckedChange={setYearly} 
          />
          <Label htmlFor="billing-toggle" className={`ml-2 ${yearly ? 'font-medium' : 'text-muted-foreground'}`}>
            Yearly <span className="text-emerald-500 ml-1">(Save 16%)</span>
          </Label>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {pricingPlans.map((plan) => (
          <Card 
            key={plan.id}
            className={`relative ${plan.popular ? 'border-2 border-primary' : 'border-border'}`}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/3">
                <div className="bg-primary text-primary-foreground text-sm font-medium py-1 px-3 rounded-full">
                  Most Popular
                </div>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>
                <div className="flex items-baseline mt-2">
                  <span className="text-3xl font-bold">
                    ${yearly ? plan.prices.yearly : plan.prices.monthly}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    {yearly ? '/year' : '/month'}
                  </span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground mr-2 flex-shrink-0" />
                    )}
                    <span className={feature.included ? '' : 'text-muted-foreground'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                size="lg"
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading !== null}
              >
                {loading === plan.id ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  'Subscribe Now'
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {user?.isBanned && (
        <div className="mt-16 max-w-md mx-auto">
          <Card className="border-red-500/50">
            <CardHeader>
              <CardTitle className="text-xl text-red-500">Account Banned</CardTitle>
              <CardDescription>
                Your account has been banned for violating our community guidelines.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                You can unban your account by paying a one-time fee of <strong>$10.99</strong>.
                After payment, your account will be immediately unbanned, and you can continue chatting.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-red-500 hover:bg-red-600"
                onClick={handleUnbanPayment}
                disabled={loading !== null}
              >
                {loading === 'unban' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  'Pay Unban Fee'
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}