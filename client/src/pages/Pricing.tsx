import { useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/lib/useAuth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, Check, X, CreditCard, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Pricing data structure
const pricingPlans = [
  {
    id: 'free',
    name: 'Free',
    description: 'Access to basic features with some limitations',
    prices: {
      monthly: 0,
      yearly: 0
    },
    features: [
      { text: 'Random matching', included: true },
      { text: 'Basic chat functionality', included: true },
      { text: 'Limited video time (5 minutes)', included: true },
      { text: 'Standard support', included: true },
      { text: 'Ad-supported experience', included: true },
      { text: 'Basic filters', included: true }
    ],
    popular: false,
    color: 'bg-gray-400',
    buttonText: 'Current Plan'
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Enhanced features for serious users',
    prices: {
      monthly: 2.99,
      yearly: 29.99
    },
    features: [
      { text: 'No ads or interruptions', included: true },
      { text: 'Priority matching', included: true },
      { text: 'Profile customization', included: true },
      { text: 'Extended video time (30 minutes)', included: true },
      { text: 'VIP customer support', included: false },
      { text: 'Exclusive filters', included: false }
    ],
    popular: false,
    color: 'bg-blue-500',
    highlight: 'Most Affordable',
    buttonText: 'Subscribe Now'
  },
  {
    id: 'vip',
    name: 'VIP',
    description: 'All premium features plus exclusive benefits',
    prices: {
      monthly: 7.99,
      yearly: 79.99
    },
    features: [
      { text: 'No ads or interruptions', included: true },
      { text: 'Priority matching', included: true },
      { text: 'Profile customization', included: true },
      { text: 'Unlimited video time', included: true },
      { text: 'VIP customer support', included: true },
      { text: 'Exclusive filters', included: true }
    ],
    popular: true,
    color: 'bg-purple-600',
    highlight: 'Most Popular',
    buttonText: 'Subscribe Now'
  }
];

export default function Pricing() {
  const [yearly, setYearly] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    id: string;
    name: string;
    price: number;
    interval: string;
  } | null>(null);
  
  // Define a type for plan structure
  type PricingPlan = {
    id: string;
    name: string;
    prices: {
      monthly: number;
      yearly: number;
    };
    [key: string]: any; // For other properties
  };
  
  const openConfirmDialog = (plan: PricingPlan) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to subscribe to a plan.",
        variant: "destructive",
      });
      return;
    }
    
    const interval = yearly ? 'yearly' : 'monthly';
    const price = yearly ? plan.prices.yearly : plan.prices.monthly;
    
    setSelectedPlan({
      id: plan.id,
      name: plan.name,
      price,
      interval
    });
    
    setConfirmDialogOpen(true);
  };
  
  const handleSubscribe = async () => {
    if (!selectedPlan || !user) return;
    
    try {
      setLoading(selectedPlan.id);
      
      // Create a checkout session
      const response = await apiRequest('POST', '/api/stripe/create-checkout-session', {
        planType: selectedPlan.id.toUpperCase(),
        userId: user?.userId || 0,
        interval: selectedPlan.interval
      });
      
      const data = await response.json();
      
      if (response.ok && data.url) {
        // Show success toast before redirecting
        toast({
          title: "Redirecting to checkout",
          description: "You'll be redirected to our secure payment provider.",
        });
        
        // Brief timeout to let the toast appear before redirect
        setTimeout(() => {
          // Redirect to Stripe checkout
          window.location.href = data.url;
        }, 1000);
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
      setConfirmDialogOpen(false);
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
        // Show success toast before redirecting
        toast({
          title: "Redirecting to checkout",
          description: "You'll be redirected to our secure payment provider.",
        });
        
        // Brief timeout to let the toast appear before redirect
        setTimeout(() => {
          // Redirect to Stripe checkout
          window.location.href = data.url;
        }, 1000);
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
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {pricingPlans.map((plan) => (
          <Card 
            key={plan.id}
            className={`relative ${plan.popular ? 'border-2 border-primary shadow-lg' : 'border-border'} transition-all duration-200 hover:shadow-lg`}
          >
            {plan.highlight && (
              <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/3">
                <div className={`${plan.popular ? 'bg-primary' : 'bg-blue-500'} text-primary-foreground text-sm font-medium py-1 px-3 rounded-full`}>
                  {plan.highlight}
                </div>
              </div>
            )}
            <CardHeader className="pb-3">
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              {plan.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {plan.description}
                </p>
              )}
              <CardDescription className="mt-3">
                <div className="flex items-baseline">
                  {plan.id === 'free' ? (
                    <span className="text-3xl font-bold">Free</span>
                  ) : (
                    <>
                      <span className="text-3xl font-bold">
                        ${yearly ? plan.prices.yearly : plan.prices.monthly}
                      </span>
                      <span className="text-muted-foreground ml-1">
                        {yearly ? '/year' : '/month'}
                      </span>
                    </>
                  )}
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-b border-muted pb-1 mb-4">
                  <h4 className="text-sm font-medium">Features included:</h4>
                </div>
                <ul className="space-y-3 text-sm">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      {feature.included ? (
                        <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground mr-2 mt-0.5 flex-shrink-0" />
                      )}
                      <span className={feature.included ? '' : 'text-muted-foreground'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                size="lg"
                variant={plan.id === 'free' ? 'outline' : 'default'}
                onClick={() => plan.id !== 'free' ? openConfirmDialog(plan) : null}
                disabled={loading !== null || plan.id === 'free'}
              >
                {loading === plan.id ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  plan.buttonText || 'Subscribe Now'
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
      
      {/* Subscription Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5 text-primary" />
              Confirm Subscription
            </DialogTitle>
            <DialogDescription>
              Please review your subscription details before proceeding to payment.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPlan && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-muted-foreground">Plan</div>
                <div className="font-medium">{selectedPlan.name}</div>
                
                <div className="text-muted-foreground">Billing</div>
                <div className="font-medium capitalize">{selectedPlan.interval}</div>
                
                <div className="text-muted-foreground">Price</div>
                <div className="font-medium">${selectedPlan.price} / {selectedPlan.interval === 'yearly' ? 'year' : 'month'}</div>
              </div>
              
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                <div className="flex items-start">
                  <AlertCircle className="mr-2 h-4 w-4 mt-0.5 text-amber-500" />
                  <div>
                    <p>You'll be redirected to our secure payment provider to complete your subscription.</p>
                    <p className="mt-1">Your plan will automatically renew at the end of your billing cycle.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between sm:space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setConfirmDialogOpen(false)}
              disabled={loading !== null}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleSubscribe}
              disabled={loading !== null}
              className="sm:ml-4"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Proceed to Payment'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}