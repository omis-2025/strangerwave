import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/lib/useAuth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, Check, X, CreditCard, AlertCircle, Clock, Quote, Star, Timer, Crown } from 'lucide-react';
import { TrustBadgesGroup, PaymentProviderLogos, SecurityTestimonial } from '@/components/TrustBadges';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getPricingPlans, trackPricingEvent, PricingPlan } from '@/lib/pricingVariants';
import abTesting, { PricingVariant } from '@/lib/abTesting';

// Get pricing plans based on the user's A/B test variant
const pricingPlans = getPricingPlans();

export default function Pricing() {
  const [yearly, setYearly] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, login } = useAuth();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    id: string;
    name: string;
    price: number;
    interval: string;
  } | null>(null);
  const [timeLeft, setTimeLeft] = useState({
    hours: 47,
    minutes: 59,
    seconds: 59
  });
  
  // Countdown timer for limited time offer
  // Track page view when component loads
  useEffect(() => {
    // Track pricing page view with the current pricing variant
    const variant = abTesting.getVariant('subscription_pricing_test', PricingVariant.Standard);
    trackPricingEvent('pricing_page_view', 'any', { 
      variant: variant.toString(),
      timestamp: Date.now()
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Using the PricingPlan interface imported from pricingVariants.ts
  
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
    
    // Track this pricing plan selection in our A/B testing system
    trackPricingEvent('plan_selected', plan.id, { 
      price,
      billing_period: interval,
      plan_name: plan.name
    });
    
    setSelectedPlan({
      id: plan.id,
      name: plan.name,
      price,
      interval
    });
    
    setConfirmDialogOpen(true);
  };
  
  const handleSubscribe = async () => {
    if (!selectedPlan) {
      toast({
        title: "Invalid Plan",
        description: "Please select a valid subscription plan.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      // Explicitly handle the unauthenticated case
      toast({
        title: "Authentication Required",
        description: "Please log in to continue with your purchase.",
        variant: "destructive",
      });
      // Automatically trigger login process
      try {
        await login();
        // Don't continue with subscription process - wait for auth to complete
        toast({
          title: "Please try again",
          description: "You're being logged in. Please try subscribing again in a moment.",
        });
        setConfirmDialogOpen(false);
        return;
      } catch (loginError) {
        console.error("Login attempt failed:", loginError);
        // Continue with error handling
      }
      return;
    }
    
    try {
      // Set loading state with plan ID
      setLoading(selectedPlan.id);
      
      // Ensure we have a valid userId - prefer userId over id for consistency
      const userId = user.userId;
      if (!userId) {
        toast({
          title: "User ID Missing",
          description: "Your user account is incomplete. Please try logging out and back in.",
          variant: "destructive",
        });
        throw new Error('Invalid or missing user ID - please refresh and try again');
      }
      
      // Log checkout attempt for debugging
      console.log("Creating checkout session for:", {
        planType: selectedPlan.id.toUpperCase(),
        userId,
        interval: selectedPlan.interval
      });
      
      // Create a checkout session with enhanced error handling and debug logs
      console.log("Sending checkout request with data:", {
        planType: selectedPlan.id.toUpperCase(),
        userId,
        interval: selectedPlan.interval
      });
      
      const response = await apiRequest('POST', '/api/stripe/create-checkout-session', {
        planType: selectedPlan.id.toUpperCase(),
        userId,
        interval: selectedPlan.interval
      });
      
      console.log("Received checkout response with status:", response.status);
      
      // Check for response issues first
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Checkout response error text:", errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
          console.error("Parsed error data:", errorData);
        } catch (e) {
          // If not JSON, use the raw text
          console.error("Failed to parse error response as JSON:", e);
          throw new Error(`Server error (${response.status}): ${errorText || 'Unknown error'}`);
        }
        throw new Error(errorData.error || errorData.message || `Server error (${response.status})`);
      }
      
      // Parse the response data
      const data = await response.json();
      console.log("Checkout session created successfully, data:", data);
      
      // Check for redirect URL
      if (!data.url) {
        throw new Error('No checkout URL returned from server');
      }
      
      // Show success toast before redirecting
      toast({
        title: "Redirecting to checkout",
        description: "You'll be redirected to our secure payment provider.",
      });
      
      // Track checkout redirection in analytics
      console.log(`User ${userId} redirected to checkout for ${selectedPlan.id} plan`);
      
      // Brief timeout to let the toast appear before redirect
      setTimeout(() => {
        // Save checkout state for return journey
        localStorage.setItem('checkoutInProgress', 'true');
        localStorage.setItem('checkoutPlan', selectedPlan.id);
        
        // Redirect to Stripe checkout
        window.location.href = data.url;
      }, 1000);
    } catch (error: any) {
      // Enhanced error handling for better user experience
      console.error('Checkout error:', error);
      
      // Determine the most user-friendly error message
      const errorMessage = error.message || "An unexpected error occurred";
      const errorDetails = errorMessage.includes('Server error') 
        ? "There was a problem with our payment system. Please try again later."
        : errorMessage;
      
      toast({
        title: "Checkout Failed",
        description: errorDetails,
        variant: "destructive",
      });
    } finally {
      // Always clean up loading state and dialog
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
      
      // Ensure we have a valid userId
      const userId = user.userId;
      if (!userId) {
        throw new Error('Invalid user ID - please log in again');
      }
      
      console.log("Creating unban checkout session for user:", userId);
      
      // Output related environment variables state (without values)
      console.log("Environment check:", { 
        stripeKeyAvailable: !!import.meta.env.VITE_STRIPE_PUBLIC_KEY,
        apiUrlBase: window.location.origin
      });
      
      // Create a checkout session for unbanning
      const response = await apiRequest('POST', '/api/stripe/create-checkout-session', {
        planType: 'UNBAN',
        userId: userId
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
    } catch (error: any) {
      console.error('Unban checkout error:', error);
      toast({
        title: "Checkout Failed",
        description: `Failed to start checkout process: ${error.message || "Please try again"}`,
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };
  
  // Track successful conversions from URL parameters
  useEffect(() => {
    // Check if there's a successful payment completion from Stripe
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment_status');
    const paymentPlan = localStorage.getItem('checkoutPlan');
    
    if (paymentStatus === 'success' && paymentPlan) {
      // Clear the localStorage items
      localStorage.removeItem('checkoutInProgress');
      localStorage.removeItem('checkoutPlan');
      
      // Track the successful conversion in our A/B test system
      trackPricingEvent('payment_success', paymentPlan, {
        source: 'stripe',
        plan: paymentPlan
      });
      
      // Show success toast
      toast({
        title: "Payment Successful",
        description: "Thank you for your purchase! Your account has been upgraded.",
        variant: "default",
      });
      
      // Clean URL parameters without refreshing the page
      const newUrl = window.location.pathname;
      window.history.pushState({}, '', newUrl);
    }
  }, [toast]);

  return (
    <div className="container mx-auto py-16 px-4">
      {/* Enhanced Limited Time Offer Banner with Countdown Timer */}
      <div className="max-w-5xl mx-auto -mt-8 mb-12">
        <div className="bg-gradient-to-r from-amber-500/15 to-amber-600/10 backdrop-blur-sm border border-amber-500/40 rounded-xl px-5 py-4 flex items-center justify-center shadow-md relative overflow-hidden">
          {/* Animated pulse background */}
          <div className="absolute inset-0 bg-amber-500/5 animate-pulse"></div>
          
          {/* Timer icon with enhanced animation */}
          <div className="relative z-10 mr-4">
            <div className="animate-pulse inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-amber-400/30 to-amber-600/20 text-amber-500 border border-amber-500/30 shadow-inner">
              <Timer className="h-5 w-5" />
            </div>
          </div>
          
          {/* Offer text with better layout */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-center relative z-10">
            <p className="text-sm sm:text-base font-medium text-amber-700 dark:text-amber-400">
              <span className="font-extrabold">Limited Time Offer:</span> 30% off yearly VIP plan ending in 
            </p>
            <div className="flex items-center mt-1 sm:mt-0 sm:ml-2">
              <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-700 dark:text-amber-400 font-mono rounded-md px-3 py-1 text-sm sm:text-base font-bold flex items-center shadow-inner border border-amber-500/20">
                {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
              </div>
              <span className="ml-2 text-sm sm:text-base font-medium text-amber-700 dark:text-amber-400">
                Use code <button 
                  className="font-mono bg-gradient-to-r from-amber-400/20 to-amber-500/20 px-3 py-1 rounded-md shadow-sm border border-amber-500/30 hover:bg-amber-500/30 transition-colors duration-200 group relative"
                  onClick={() => {
                    navigator.clipboard.writeText('WAVE30');
                    toast({ 
                      title: "Code copied!",
                      description: "Paste it at checkout to get 30% off"
                    });
                  }}
                >
                  WAVE30
                  <span className="absolute -right-1 -top-1 text-[0.6rem] bg-amber-500/90 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    📋
                  </span>
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
          Upgrade your chat experience with premium features and no interruptions.
        </p>
        
        {/* Enhanced toggle with animation */}
        <div className="inline-flex items-center justify-center mb-10 bg-muted/30 p-2 rounded-xl border border-border/50 shadow-sm">
          <div className="relative flex items-center p-1 z-10">
            <div 
              className={`absolute inset-0 ${yearly ? 'translate-x-full' : ''} transition-transform duration-300 ease-out bg-primary/10 border border-primary/20 rounded-lg shadow-sm`} 
              style={{ width: '50%' }}
            />
            <button
              className={`relative z-10 px-6 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${!yearly ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => {
                setYearly(false);
                trackPricingEvent('billing_period_change', 'monthly');
              }}
            >
              Monthly
            </button>
            <button
              className={`relative z-10 px-6 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${yearly ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => {
                setYearly(true);
                trackPricingEvent('billing_period_change', 'yearly');
              }}
            >
              Yearly
              <span className="ml-2 inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Save 16%
              </span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {pricingPlans.map((plan) => (
          <div 
            key={plan.id}
            className={`relative group transition-all duration-500 ${plan.id === 'premium' ? 'lg:-translate-y-4' : ''}`}
          >
            {/* Popular/Best Value Badge */}
            {plan.id === 'premium' && (
              <div className="absolute -top-5 left-0 right-0 flex justify-center z-10">
                <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium shadow-md border border-blue-400 flex items-center gap-2">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  Most Popular
                </div>
              </div>
            )}
            
            {/* VIP Badge */}
            {plan.id === 'vip' && (
              <div className="absolute -top-5 left-0 right-0 flex justify-center z-10">
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow-md border border-amber-400 flex items-center gap-2">
                  <Crown className="h-3.5 w-3.5" />
                  Best Value
                </div>
              </div>
            )}
            
            <Card 
              className={`relative h-full overflow-hidden transition-all duration-300
                ${plan.id === 'free' 
                  ? 'border border-border shadow-sm hover:shadow-md hover:border-border/80' 
                  : plan.id === 'premium'
                    ? 'border-2 border-blue-500 shadow-lg hover:shadow-xl hover:shadow-blue-500/10'
                    : 'border-2 border-primary shadow-lg hover:shadow-xl hover:shadow-primary/10'
                }
                ${plan.id === 'vip' ? 'bg-gradient-to-b from-background via-background to-primary/5' : ''}
              `}
            >
              {/* Highlight for VIP - Crown in corner */}
              {plan.id === 'vip' && (
                <div className="absolute top-3 right-3 text-amber-500">
                  <Crown className="h-5 w-5" />
                </div>
              )}
              
              {/* Card decorative elements */}
              {plan.id !== 'free' && (
                <div className="absolute inset-0 overflow-hidden opacity-10">
                  <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full 
                    ${plan.id === 'premium' ? 'bg-blue-500/20' : 'bg-primary/20'}`} />
                  <div className={`absolute -left-10 -bottom-10 w-40 h-40 rounded-full 
                    ${plan.id === 'premium' ? 'bg-blue-500/20' : 'bg-primary/20'}`} />
                </div>
              )}
              
              <CardHeader className="pb-2 relative z-10">
                <CardTitle className={`text-2xl font-bold flex items-center gap-2
                  ${plan.id === 'premium' ? 'text-blue-500' : plan.id === 'vip' ? 'text-primary' : ''}`}>
                  {plan.name}
                </CardTitle>
                
                {plan.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {plan.description}
                  </p>
                )}
                
                <div className="mt-4 text-sm">
                  <div className="flex items-baseline">
                    {plan.id === 'free' ? (
                      <span className="text-4xl font-extrabold">Free</span>
                    ) : (
                      <>
                        <span className="text-sm font-normal text-muted-foreground mr-1">$</span>
                        <span className="text-4xl font-extrabold">
                          {yearly ? plan.prices.yearly : plan.prices.monthly}
                        </span>
                        <span className="text-muted-foreground ml-1.5 text-sm">
                          {yearly ? '/year' : '/month'}
                        </span>
                      </>
                    )}
                  </div>
                  
                  {/* Trial and Discount Badges */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {plan.trial && (
                      <div className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
                        <span className="mr-1">✦</span> {plan.trial}
                      </div>
                    )}
                    {plan.discount && (
                      <div className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600">
                        <span className="mr-1">★</span> {plan.discount}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <div className="space-y-4">
                  <div className="border-b border-muted pb-1 mb-4">
                    <h4 className="text-sm font-medium">Features included:</h4>
                  </div>
                  
                  <ul className="space-y-4 text-sm">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start group/feature">
                        {feature.included ? (
                          <div className={`flex-shrink-0 rounded-full p-0.5 mr-2 mt-0.5
                            ${plan.id === 'premium' 
                              ? 'text-blue-500 bg-blue-500/10' 
                              : plan.id === 'vip' 
                                ? 'text-primary bg-primary/10' 
                                : 'text-emerald-500'
                            }`}>
                            <Check className="h-3.5 w-3.5" />
                          </div>
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground mr-2 mt-0.5 flex-shrink-0" />
                        )}
                        <span className={feature.included 
                          ? 'group-hover/feature:translate-x-0.5 transition-transform duration-200' 
                          : 'text-muted-foreground'}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              
              <CardFooter className="relative z-10 pt-4">
                <Button 
                  className={`w-full rounded-lg font-medium transition-all duration-300 ${
                    plan.id === 'free' 
                      ? 'bg-transparent border-border hover:bg-muted text-foreground hover:text-foreground hover:border-muted-foreground' 
                      : plan.id === 'premium'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg hover:shadow-blue-500/20 text-white border-none'
                        : 'bg-gradient-to-r from-primary to-primary/90 hover:from-primary hover:to-primary shadow-md hover:shadow-lg hover:shadow-primary/20 text-white border-none'
                  }`}
                  size="lg"
                  onClick={() => plan.id !== 'free' ? openConfirmDialog(plan) : null}
                  disabled={loading !== null || plan.id === 'free'}
                >
                  {loading === plan.id ? (
                    <div className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      {plan.id === 'free' ? (
                        <>Current Plan</>
                      ) : (
                        <>
                          {plan.buttonText || (plan.id === 'premium' ? 'Start Free Trial' : 'Subscribe Now')}
                          {plan.id !== 'free' && <CreditCard className="ml-2 h-4 w-4" />}
                        </>
                      )}
                    </div>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        ))}
      </div>
      
      {/* Trust Badges Section */}
      <div className="max-w-4xl mx-auto mt-16 mb-20 text-center">
        <h3 className="text-lg font-medium mb-6 text-muted-foreground animate-in fade-in slide-in-from-bottom-5 duration-700">Trusted and Secure Payments</h3>
        <div className="mb-8 transition-all duration-300 hover:scale-105 animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both">
          <TrustBadgesGroup />
        </div>
        <div className="mb-10 transition-all duration-300 hover:opacity-90 animate-in fade-in slide-in-from-bottom-3 duration-1000 fill-mode-both delay-200">
          <PaymentProviderLogos />
        </div>
        
        <div className="grid sm:grid-cols-2 gap-6 mt-10">
          <div className="transition-transform duration-300 hover:translate-y-[-4px] animate-in fade-in-50 duration-1000 fill-mode-both delay-300">
            <SecurityTestimonial />
          </div>
          <div className="bg-card/60 backdrop-blur-sm border rounded-xl p-5 flex flex-col justify-center transition-all duration-300 hover:bg-card/80 hover:shadow-md animate-in fade-in-50 duration-1000 fill-mode-both delay-400">
            <h4 className="text-sm font-medium mb-3 flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-primary mr-2" />
              Secure Payment Processing
            </h4>
            <div className="text-sm text-muted-foreground">
              Your payment is securely processed with 256-bit encryption. We never store your complete payment details on our servers.
            </div>
          </div>
        </div>
      </div>
      
      {/* Side-by-Side Plan Comparison */}
      <div className="mt-24 mb-16 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
            Detailed Plan Comparison
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Compare all features side by side to find the perfect plan for your needs
          </p>
        </div>
        <div className="overflow-x-auto rounded-xl border border-border/50 shadow-md">
          <table className="w-full border-collapse bg-card/50 backdrop-blur-sm">
            <thead>
              <tr className="border-b border-border/70">
                <th className="py-5 px-6 text-left bg-muted/30">
                  <span className="text-lg font-medium">Features</span>
                </th>
                <th className="py-5 px-8 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-lg font-medium text-foreground/90">Free</span>
                    <span className="text-xs text-muted-foreground">Basic plan</span>
                  </div>
                </th>
                <th className="py-5 px-8 text-center bg-blue-600/10 dark:bg-blue-700/20">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-lg font-medium text-blue-500">Premium</span>
                    <span className="text-xs text-blue-500/80">Most popular</span>
                  </div>
                </th>
                <th className="py-5 px-8 text-center bg-primary/10 dark:bg-primary/20">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-lg font-medium text-primary">VIP</span>
                    <span className="text-xs text-primary/80">Best value</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/30 hover:bg-muted/10 transition-colors duration-150">
                <td className="py-4 px-6 font-medium">Video chat duration</td>
                <td className="py-4 px-6 text-center">5 minutes</td>
                <td className="py-4 px-6 text-center bg-blue-600/10 dark:bg-blue-700/20">
                  <span className="font-medium">30 minutes</span>
                </td>
                <td className="py-4 px-6 text-center bg-primary/10 dark:bg-primary/20">
                  <span className="font-medium text-primary">Unlimited</span>
                </td>
              </tr>
              <tr className="border-b border-border/30 hover:bg-muted/10 transition-colors duration-150">
                <td className="py-4 px-6 font-medium">Matching speed</td>
                <td className="py-4 px-6 text-center">Standard</td>
                <td className="py-4 px-6 text-center bg-blue-600/10 dark:bg-blue-700/20">
                  <span className="font-medium">Priority</span>
                </td>
                <td className="py-4 px-6 text-center bg-primary/10 dark:bg-primary/20">
                  <span className="font-medium text-primary">Highest priority</span>
                </td>
              </tr>
              <tr className="border-b border-border/30 hover:bg-muted/10 transition-colors duration-150">
                <td className="py-4 px-6 font-medium">Profile customization</td>
                <td className="py-4 px-6 text-center">
                  <div className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-muted-foreground/30">
                    <X className="h-4 w-4 text-muted-foreground" />
                  </div>
                </td>
                <td className="py-4 px-6 text-center bg-blue-600/10 dark:bg-blue-700/20">
                  <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/30">
                    <Check className="h-4 w-4 text-blue-500" />
                  </div>
                </td>
                <td className="py-4 px-6 text-center bg-primary/10 dark:bg-primary/20">
                  <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 border border-primary/30">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                </td>
              </tr>
              <tr className="border-b border-border/30 hover:bg-muted/10 transition-colors duration-150">
                <td className="py-4 px-6 font-medium">Ad experience</td>
                <td className="py-4 px-6 text-center">With ads</td>
                <td className="py-4 px-6 text-center bg-blue-600/10 dark:bg-blue-700/20">
                  <span className="font-medium">Ad-free</span>
                </td>
                <td className="py-4 px-6 text-center bg-primary/10 dark:bg-primary/20">
                  <span className="font-medium">Ad-free</span>
                </td>
              </tr>
              <tr className="border-b border-border/30 hover:bg-muted/10 transition-colors duration-150">
                <td className="py-4 px-6 font-medium">Customer support</td>
                <td className="py-4 px-6 text-center">Standard</td>
                <td className="py-4 px-6 text-center bg-blue-600/10 dark:bg-blue-700/20">
                  <span className="font-medium">Priority</span>
                </td>
                <td className="py-4 px-6 text-center bg-primary/10 dark:bg-primary/20">
                  <span className="font-medium text-primary">VIP (24/7)</span>
                </td>
              </tr>
              <tr className="border-b border-border/30 hover:bg-muted/10 transition-colors duration-150">
                <td className="py-4 px-6 font-medium">Advanced filters</td>
                <td className="py-4 px-6 text-center">Basic only</td>
                <td className="py-4 px-6 text-center bg-blue-600/10 dark:bg-blue-700/20">
                  <span className="font-medium">Most filters</span>
                </td>
                <td className="py-4 px-6 text-center bg-primary/10 dark:bg-primary/20">
                  <span className="font-medium text-primary">All filters</span>
                </td>
              </tr>
              <tr className="hover:bg-muted/10 transition-colors duration-150">
                <td className="py-6 px-6"></td>
                <td className="py-6 px-6 text-center">
                  <span className="inline-block py-2 px-4 font-medium bg-muted/50 rounded-md border border-border/50">
                    Current Plan
                  </span>
                </td>
                <td className="py-6 px-6 text-center bg-blue-600/10 dark:bg-blue-700/20">
                  <Button 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-none shadow-md hover:shadow-lg hover:shadow-blue-500/20"
                    onClick={() => openConfirmDialog(pricingPlans[1])}
                    disabled={loading !== null}
                    size="lg"
                  >
                    Start Free Trial
                  </Button>
                </td>
                <td className="py-6 px-6 text-center bg-primary/10 dark:bg-primary/20">
                  <Button 
                    className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary hover:to-primary text-white border-none shadow-md hover:shadow-lg hover:shadow-primary/20"
                    onClick={() => openConfirmDialog(pricingPlans[2])}
                    disabled={loading !== null}
                    size="lg"
                  >
                    Subscribe Now
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="mt-10 text-center">
          <h3 className="text-base font-semibold mb-2">Secure Payment Methods</h3>
          <p className="text-sm text-muted-foreground mb-4">We accept all major payment providers</p>
          
          <div className="flex flex-wrap justify-center items-center gap-5 sm:gap-8">
            {/* Visa card */}
            <div className="flex flex-col items-center">
              <div className="h-10 w-16 bg-white rounded-md flex items-center justify-center p-2 shadow-sm border">
                <svg className="h-6 w-auto" viewBox="0 0 780 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M293.2 348.73L318.72 149.58H362.12L336.6 348.73H293.2Z" fill="#3C58BF"/>
                  <path d="M293.2 348.73L325.66 149.58H362.12L336.6 348.73H293.2Z" fill="#293688"/>
                  <path d="M459.56 152.12C450.42 148.64 435.91 144.73 418.06 144.73C367.47 144.73 332.01 170.7 331.79 209.04C331.58 237.22 356.86 252.79 375.9 262.16C395.36 271.74 402.15 277.75 402.15 286.02C401.94 298.49 386.79 304.29 372.73 304.29C352.84 304.29 341.97 301.03 324.54 292.93L317.54 289.89L310.11 327.59C320.91 332.94 341.32 337.5 362.58 337.72C416.52 337.72 451.34 312.18 451.77 271.31C451.98 248.88 438.44 231.45 408.81 217.49C390.52 208.35 379.65 202.11 379.65 192.7C379.87 184.02 390.3 175.18 413.5 175.18C429.9 175.18 441.63 178.44 450.77 182.57L456.08 184.92L463.73 148.42L459.56 152.12Z" fill="#3C58BF"/>
                  <path d="M615.5 149.15H582.35C574.36 149.15 568.59 151.43 565.32 159.06L483.24 348.52H537.41C537.41 348.52 546.4 323.08 548.31 317.84C553.97 317.84 611.78 317.84 619.35 317.84C620.84 324.59 625.64 348.52 625.64 348.52H674.01L615.5 149.15ZM562.37 277.39C566.26 267.33 586.05 214.78 586.05 214.78C585.84 215.21 590.18 203.58 592.51 196.83L595.82 213.18C595.82 213.18 607.72 269.4 609.63 277.39H562.37Z" fill="#3C58BF"/>
                  <path d="M615.5 149.15H593.37C585.38 149.15 579.83 151.43 576.56 159.06L483.24 348.52H537.41C537.41 348.52 546.4 323.08 548.31 317.84C553.97 317.84 611.78 317.84 619.35 317.84C620.84 324.59 625.64 348.52 625.64 348.52H674.01L615.5 149.15ZM562.37 277.39C566.26 267.33 586.05 214.78 586.05 214.78C585.84 215.21 590.18 203.58 592.51 196.83L595.82 213.18C595.82 213.18 607.72 269.4 609.63 277.39H562.37Z" fill="#293688"/>
                  <path d="M231.2 149.23L179.88 282.52L174.55 259.01C165.12 227.53 137.32 194.19 106.17 177.48L153.48 348.1H208.11L283.11 149.23H231.2Z" fill="#3C58BF"/>
                  <path d="M106.17 149.23H29.77L28.71 154.02C86.29 169.22 125.85 210.96 142.87 259.01L128.93 176.17C126.38 161.19 117.65 149.45 106.17 149.23Z" fill="#F7981D"/>
                  <path d="M459.56 152.12C450.42 148.64 435.91 144.73 418.06 144.73C367.47 144.73 332.01 170.7 331.79 209.04C331.58 237.22 356.86 252.79 375.9 262.16C395.36 271.74 402.15 277.75 402.15 286.02C401.94 298.49 386.79 304.29 372.73 304.29C352.84 304.29 341.97 301.03 324.54 292.93L317.54 289.89L310.11 327.59C320.91 332.94 341.32 337.5 362.58 337.72C416.52 337.72 451.34 312.18 451.77 271.31C451.98 248.88 438.44 231.45 408.81 217.49C390.52 208.35 379.65 202.11 379.65 192.7C379.87 184.02 390.3 175.18 413.5 175.18C429.9 175.18 441.63 178.44 450.77 182.57L456.08 184.92L463.73 148.42L459.56 152.12Z" fill="#293688"/>
                </svg>
              </div>
              <span className="text-xs text-muted-foreground mt-1">Visa</span>
            </div>
            
            {/* Mastercard */}
            <div className="flex flex-col items-center">
              <div className="h-10 w-16 bg-white rounded-md flex items-center justify-center p-2 shadow-sm border">
                <svg className="h-6 w-auto" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 12C22 16.4183 18.4183 20 14 20C9.58172 20 6 16.4183 6 12C6 7.58172 9.58172 4 14 4C18.4183 4 22 7.58172 22 12Z" fill="#EB001B"/>
                  <path d="M34 12C34 16.4183 30.4183 20 26 20C21.5817 20 18 16.4183 18 12C18 7.58172 21.5817 4 26 4C30.4183 4 34 7.58172 34 12Z" fill="#F79E1B"/>
                  <path d="M24 4.5C22.2332 5.86656 21 8.77594 21 12C21 15.2241 22.2332 18.1334 24 19.5C25.7668 18.1334 27 15.2241 27 12C27 8.77594 25.7668 5.86656 24 4.5Z" fill="#FF5F00"/>
                </svg>
              </div>
              <span className="text-xs text-muted-foreground mt-1">Mastercard</span>
            </div>
            
            {/* American Express */}
            <div className="flex flex-col items-center">
              <div className="h-10 w-16 bg-white rounded-md flex items-center justify-center p-2 shadow-sm border">
                <svg className="h-6 w-auto" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M38 4H2C0.895431 4 0 4.89543 0 6V18C0 19.1046 0.895431 20 2 20H38C39.1046 20 40 19.1046 40 18V6C40 4.89543 39.1046 4 38 4Z" fill="#016FD0"/>
                  <path d="M18.9997 15L20.9997 11L22.9997 15H18.9997ZM9.99967 15V9H14.9997L16.3097 11.02L17.6897 9H28.9997V10.14H27.1997V11.1H28.8997V12.26H27.1997V13.28H28.9997V14.44H27.1997V15H9.99967ZM10.0197 14.3H11.6597V9.94H14.0997L16.3797 13.28L18.6797 9.94H20.9997V14.28H22.6397V15.7H19.2397L16.9997 12.42L14.7797 15.7H10.0197V14.3Z" fill="white"/>
                </svg>
              </div>
              <span className="text-xs text-muted-foreground mt-1">Amex</span>
            </div>
            
            {/* PayPal */}
            <div className="flex flex-col items-center">
              <div className="h-10 w-16 bg-white rounded-md flex items-center justify-center p-2 shadow-sm border">
                <svg className="h-6 w-auto" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M29.6996 6.9151H25.7113C25.4953 6.9151 25.3042 7.0602 25.2644 7.2609L23.4204 18.9001C23.3924 19.0374 23.4982 19.1626 23.6417 19.1626H25.5617C25.7777 19.1626 25.9688 19.0175 26.0086 18.8168L26.4913 15.972C26.5311 15.7713 26.7222 15.6263 26.9382 15.6263H28.3858C31.1064 15.6263 32.6588 14.3498 33.1117 11.9592C33.3085 10.9851 33.1822 10.2298 32.7593 9.70901C32.2903 9.1364 31.3026 6.9151 29.6996 6.9151ZM30.252 12.0624C29.9873 13.4669 28.9112 13.4669 27.8391 13.4669H27.1789L27.6536 10.4982C27.6796 10.3689 27.7952 10.2777 27.9308 10.2777H28.2355C28.9591 10.2777 29.6391 10.2777 29.996 10.6882C30.195 10.9129 30.3489 11.4095 30.252 12.0624Z" fill="#253B80"/>
                  <path d="M14.6996 6.9151H10.7113C10.4953 6.9151 10.3042 7.0602 10.2644 7.2609L8.4204 18.9001C8.3924 19.0374 8.4982 19.1626 8.6417 19.1626H10.4615C10.5923 19.1626 10.7071 19.0694 10.7317 18.9439L11.2356 15.972C11.2753 15.7713 11.4665 15.6263 11.6824 15.6263H13.1301C15.8507 15.6263 17.4031 14.3498 17.856 11.9592C18.0528 10.9851 17.9264 10.2298 17.5036 9.70901C17.0346 9.1364 16.0469 6.9151 14.6996 6.9151ZM15.252 12.0624C14.9873 13.4669 13.9112 13.4669 12.8391 13.4669H12.1789L12.6536 10.4982C12.6796 10.3689 12.7952 10.2777 12.9308 10.2777H13.2355C13.9591 10.2777 14.6391 10.2777 14.996 10.6882C15.195 10.9129 15.3489 11.4095 15.252 12.0624Z" fill="#253B80"/>
                  <path d="M21.6996 12.0465H19.8777C19.7421 12.0465 19.6264 12.1377 19.6004 12.267L19.4851 12.9556L19.3546 12.7685C18.9317 12.0851 17.9879 11.8574 17.0441 11.8574C14.851 11.8574 12.9991 13.5076 12.6401 15.9102C12.4553 17.0954 12.751 18.214 13.4708 19.0086C14.1307 19.7398 15.0825 20.053 16.235 20.053C18.0031 20.053 19.0231 18.8901 19.0231 18.8901L18.9078 19.5787C18.8798 19.716 18.9856 19.8411 19.1291 19.8411H20.7721C20.9881 19.8411 21.1792 19.6961 21.219 19.4954L22.3008 12.308C22.3288 12.1706 22.223 12.0465 22.0795 12.0465H21.6996ZM19.4811 16.0115C19.2923 17.1687 18.3526 17.9181 17.1801 17.9181C16.5763 17.9181 16.0944 17.7503 15.7873 17.4113C15.4823 17.0723 15.363 16.5837 15.4583 16.0115C15.6291 14.8662 16.5848 14.0889 17.7394 14.0889C18.3273 14.0889 18.8052 14.2588 19.1202 14.6018C19.4373 14.9508 19.5685 15.4464 19.4811 16.0115Z" fill="#253B80"/>
                </svg>
              </div>
              <span className="text-xs text-muted-foreground mt-1">PayPal</span>
            </div>
            
            {/* Apple Pay */}
            <div className="flex flex-col items-center">
              <div className="h-10 w-16 bg-white rounded-md flex items-center justify-center p-2 shadow-sm border">
                <svg className="h-6 w-auto" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.3646 7.3257C12.7718 8.04555 11.9345 7.9409 11.9345 7.9409C11.9345 7.9409 11.8292 7.171 12.421 6.43788C13.0138 5.70485 13.7657 5.85211 13.7657 5.85211C13.7657 5.85211 13.9573 6.60651 13.3646 7.3257Z" fill="black"/>
                  <path d="M13.6294 8.08334C12.8647 8.01392 12.2121 8.51091 11.8462 8.51091C11.4803 8.51091 10.9031 8.1145 10.3171 8.12759C9.56353 8.14067 8.84865 8.57181 8.46494 9.27202C7.68419 10.676 8.25581 12.7572 9.01107 13.9308C9.37791 14.5264 9.82166 15.1766 10.42 15.1624C10.9916 15.1483 11.2266 14.8076 11.9168 14.8076C12.607 14.8076 12.8155 15.1624 13.4227 15.1493C14.057 15.1352 14.4317 14.5475 14.7975 13.953C15.2156 13.2671 15.3882 12.5962 15.4011 12.5598C15.3882 12.5467 14.0744 12.0519 14.0615 10.6712C14.0487 9.52709 15.0962 8.9193 15.1667 8.86161C14.6377 8.06372 13.8116 8.09817 13.6294 8.08334Z" fill="black"/>
                  <path d="M18.1244 6.53851V15.0404H19.3677V12.3261H21.0857C22.6928 12.3261 23.8295 11.2022 23.8295 9.7286C23.8295 8.25499 22.7152 7.14578 21.1355 7.14578H19.1244H18.1244ZM19.3677 8.25499H20.7924C21.8356 8.25499 22.5536 8.84757 22.5536 9.7362C22.5536 10.6248 21.8356 11.2174 20.7796 11.2174H19.3677V8.25499Z" fill="black"/>
                  <path d="M28.2563 13.3019C27.7766 14.1075 27.0088 14.5415 25.9961 14.5415C24.5618 14.5415 23.5547 13.5673 23.5547 12.0859C23.5547 10.6121 24.5686 9.63029 25.9834 9.63029C27.0585 9.63029 27.7766 10.1043 28.1809 10.8189L28.282 10.9942L29.6544 10.3466L29.5332 10.1396C28.9401 9.00831 27.7652 8.31867 25.9961 8.31867C23.7376 8.31867 22.2163 9.95321 22.2163 12.0859C22.2163 14.2452 23.7376 15.8532 25.9834 15.8532C27.81 15.8532 29.0213 15.0551 29.6086 13.7201L29.6898 13.5401L28.3656 12.9066L28.2563 13.3019Z" fill="black"/>
                  <path d="M33.9686 12.8586C33.9686 14.0285 33.1626 14.7886 31.8784 14.7886C30.7464 14.7886 30.0168 14.1365 30.0168 13.1341V8.42755H28.7734V13.1341C28.7734 14.8818 29.9733 16.0592 31.8388 16.0592C33.7498 16.0592 35.2118 14.8453 35.2118 12.8586V8.42755H33.9686V12.8586Z" fill="black"/>
                </svg>
              </div>
              <span className="text-xs text-muted-foreground mt-1">Apple Pay</span>
            </div>
            
            {/* Google Pay */}
            <div className="flex flex-col items-center">
              <div className="h-10 w-16 bg-white rounded-md flex items-center justify-center p-2 shadow-sm border">
                <svg className="h-6 w-auto" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.5953 12.6136C17.5953 12.1705 17.5554 11.7477 17.4821 11.3409H11.2642V13.4545H14.8578C14.6954 14.3409 14.1816 15.0909 13.3844 15.5909V17.3068H15.7293C16.9505 16.1818 17.5953 14.5568 17.5953 12.6136Z" fill="#4285F4"/>
                  <path d="M11.2642 19.5C13.2312 19.5 14.8945 18.8068 15.7293 17.3068L13.3844 15.5909C12.7395 16.0227 12.0679 16.2727 11.2642 16.2727C9.59127 16.2727 8.17613 15.1477 7.71358 13.6364H5.30371V15.4091C6.18393 17.8182 8.5288 19.5 11.2642 19.5Z" fill="#34A853"/>
                  <path d="M7.71358 13.6364C7.57523 13.2045 7.49532 12.7434 7.49532 12.2727C7.49532 11.802 7.57523 11.3409 7.71358 10.9091V9.13637H5.30371C4.86812 10.0795 4.625 11.1477 4.625 12.2727C4.625 13.3977 4.86812 14.4659 5.30371 15.4091L7.71358 13.6364Z" fill="#FBBC05"/>
                  <path d="M11.2642 8.27272C12.1712 8.27272 12.9816 8.58635 13.6133 9.19089L15.695 7.10908C14.8781 6.33635 13.2312 5.77271 11.2642 5.77271C8.5288 5.77271 6.18393 7.45453 5.30371 9.86362L7.71358 11.6364C8.17613 10.125 9.59127 8.27272 11.2642 8.27272Z" fill="#EA4335"/>
                </svg>
              </div>
              <span className="text-xs text-muted-foreground mt-1">Google Pay</span>
            </div>
          </div>
          
          <div className="flex items-center justify-center mt-4">
            <div className="bg-gray-800/50 rounded-full py-1 px-3 flex items-center gap-1.5">
              <svg className="h-4 w-4 text-emerald-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-xs text-gray-300">Secure 256-bit SSL encryption</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Customer Testimonials */}
      <div className="mt-20 mb-10 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-4">What Our Users Say</h2>
        <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
          Join thousands of users who have upgraded their experience with our premium plans
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {/* Testimonial 1 */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-yellow-500">
                {/* Real profile image for Sarah K. */}
                <img 
                  src="/images/profiles/profile-female.png"
                  alt="Sarah K."
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error("Profile image failed to load");
                    // Fallback to initial
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.parentElement) {
                      e.currentTarget.parentElement.innerHTML = '<div class="w-full h-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center"><span class="text-white font-bold text-lg">S</span></div>';
                    }
                  }}
                />
              </div>
              <div className="ml-4">
                <h4 className="font-semibold text-white">Sarah K.</h4>
                <div className="flex items-center text-yellow-400">
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                </div>
                <div className="text-xs text-gray-400 mt-1">United States</div>
              </div>
            </div>
            <p className="text-sm italic mb-3 text-gray-300">
              "I've tried all the random chat apps, but StrangerWave is in a league of its own. The video quality is amazing and I feel much safer with their moderation system."
            </p>
            <div className="text-xs text-gray-500">VIP member for 6 months</div>
          </div>
          
          {/* Testimonial 2 */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-yellow-500">
                {/* Real profile image for Miguel R. */}
                <img 
                  src="/images/profiles/profile-male.png"
                  alt="Miguel R."
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error("Profile image failed to load");
                    // Fallback to initial
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.parentElement) {
                      e.currentTarget.parentElement.innerHTML = '<div class="w-full h-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center"><span class="text-white font-bold text-lg">M</span></div>';
                    }
                  }}
                />
              </div>
              <div className="ml-4">
                <h4 className="font-semibold text-white">Miguel R.</h4>
                <div className="flex items-center text-yellow-400">
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                </div>
                <div className="text-xs text-gray-400 mt-1">Spain</div>
              </div>
            </div>
            <p className="text-sm italic mb-3 text-gray-300">
              "As a language learner, I use StrangerWave to practice conversations with native speakers. The country filter is perfect for finding people from specific regions!"
            </p>
            <div className="text-xs text-gray-500">Premium member for 4 months</div>
          </div>
          
          {/* Testimonial 3 */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-yellow-500">
                {/* Real profile image for Aiden T. */}
                <img 
                  src="/images/profiles/profile-neutral.png"
                  alt="Aiden T."
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error("Profile image failed to load");
                    // Fallback to initial
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.parentElement) {
                      e.currentTarget.parentElement.innerHTML = '<div class="w-full h-full bg-gradient-to-r from-teal-400 to-emerald-500 flex items-center justify-center"><span class="text-white font-bold text-lg">A</span></div>';
                    }
                  }}
                />
              </div>
              <div className="ml-4">
                <h4 className="font-semibold text-white">Aiden T.</h4>
                <div className="flex items-center text-yellow-400">
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current opacity-40" />
                </div>
                <div className="text-xs text-gray-400 mt-1">Australia</div>
              </div>
            </div>
            <p className="text-sm italic mb-3 text-gray-300">
              "The premium features are actually worth it. I'm spending less time waiting and more time having great conversations. The priority matching is fantastic!"
            </p>
            <div className="text-xs text-gray-500">Premium member for 2 months</div>
          </div>
        </div>
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
            
            {/* Payment Progress Indicator */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">1</div>
                <span className="text-xs mt-1 font-medium">Review</span>
              </div>
              <div className="h-0.5 flex-1 bg-muted mx-2 relative">
                <div className="absolute inset-0 bg-primary" style={{ width: '0%' }}></div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-medium">2</div>
                <span className="text-xs mt-1 text-muted-foreground">Payment</span>
              </div>
              <div className="h-0.5 flex-1 bg-muted mx-2">
                <div className="absolute inset-0 bg-primary" style={{ width: '0%' }}></div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-medium">3</div>
                <span className="text-xs mt-1 text-muted-foreground">Confirmation</span>
              </div>
            </div>
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
          
          {/* Customer Testimonial in Payment Dialog */}
          <div className="mt-6 p-4 border rounded-lg bg-muted/30">
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-primary/40 mr-3">
                <img 
                  src="/images/profiles/profile-female.png"
                  alt="Sophia K."
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error("Profile image failed to load");
                    // Fallback to quote icon
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.parentElement) {
                      e.currentTarget.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-muted"><Quote class="h-6 w-6 text-primary/40" /></div>';
                    }
                  }}
                />
              </div>
              <div>
                <div className="flex items-center mb-1">
                  <span className="font-semibold text-sm">Sophia K.</span>
                  <div className="flex ml-2 text-amber-500">
                    <Star className="h-3 w-3 fill-current" />
                    <Star className="h-3 w-3 fill-current" />
                    <Star className="h-3 w-3 fill-current" />
                    <Star className="h-3 w-3 fill-current" />
                    <Star className="h-3 w-3 fill-current" />
                  </div>
                </div>
                <p className="text-xs italic text-muted-foreground">"Upgrading to premium was the best decision I made. The ad-free experience and extended video time made all the difference!"</p>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between sm:space-x-2 mt-4">
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
              className="sm:ml-4 bg-primary hover:bg-primary/90 text-white font-semibold"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-5 w-5" />
                  Proceed to Payment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}