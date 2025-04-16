import { useState, useEffect } from "react";
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from "@/lib/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Shield, Lock, CreditCard, AlertTriangle, CheckCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import PayPalButton from "@/components/PayPalButton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const isMobile = useIsMobile();
  
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
          return_url: `${window.location.origin}/payment-success`,
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
          navigate('/chat');
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
    <div className="space-y-6">
      {/* Security badge at the top */}
      <div className="flex items-center justify-center mb-4 bg-primary/10 p-2 rounded-lg border border-primary/20">
        <Lock className="h-4 w-4 mr-2 text-primary" />
        <span className="text-sm text-primary font-medium">Secure Payment Processing</span>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <PaymentElement />
          
          {/* Secure payment badge */}
          <div className="absolute -top-3 right-0 bg-gray-900 px-2 py-0.5 rounded text-xs font-medium border border-gray-700 flex items-center space-x-1">
            <Lock className="h-3 w-3 text-primary" />
            <span>256-bit SSL</span>
          </div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button 
            type="submit" 
            disabled={!stripe || isProcessing} 
            className="w-full h-12 text-base font-medium"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <RefreshCw className="animate-spin mr-2 h-5 w-5" />
                Processing Payment...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Pay $10.99 & Restore Access
              </span>
            )}
          </Button>
        </motion.div>
      </form>
      
      {/* Trust badges */}
      <div className="pt-4 border-t border-gray-700">
        <div className="flex flex-wrap justify-center gap-4 mb-4">
          <div className="flex items-center text-xs text-gray-400">
            <Shield className="h-4 w-4 mr-1 text-primary" />
            <span>Secure Payments</span>
          </div>
          <div className="flex items-center text-xs text-gray-400">
            <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
            <span>Instant Restoration</span>
          </div>
          <div className="flex items-center text-xs text-gray-400">
            <Lock className="h-4 w-4 mr-1 text-blue-500" />
            <span>GDPR Compliant</span>
          </div>
        </div>
        
        <div className="flex justify-center">
          <img 
            src="https://cdn.pixabay.com/photo/2021/12/06/13/48/visa-6850402_640.png" 
            alt="Accepted Payment Methods" 
            className="h-6 opacity-70"
          />
        </div>
      </div>
    </div>
  );
};

export default function Payment() {
  const { user, isBanned } = useAuth();
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const isMobile = useIsMobile();

  useEffect(() => {
    // If user is not banned, redirect to home
    if (user && !isBanned) {
      navigate('/chat');
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
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center"
        >
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mb-4" />
          <p className="text-gray-300">Preparing secure payment...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col bg-gray-900"
    >
      <header className="bg-gray-800 py-4 px-4 sm:px-6 shadow-lg border-b border-gray-700">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
              Account Restricted
            </h1>
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-gray-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              {!isMobile && "Back"}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 sm:p-6 flex flex-col items-center justify-center">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="max-w-md w-full bg-gray-800 border border-gray-700 shadow-xl">
            <CardHeader className="text-center space-y-3 pb-3">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <CardTitle className="text-2xl text-white">Account Restricted</CardTitle>
              <CardDescription className="text-gray-300">
                Due to violations of our community guidelines, your account has been restricted from using our chat service.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6 pt-3">
              <div className="bg-gray-900/50 p-5 rounded-lg mb-4 border border-gray-700 shadow-inner">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-700">
                  <h3 className="font-medium text-lg text-white">Restore Access</h3>
                  <div className="px-2 py-1 bg-primary/10 rounded text-xs font-medium text-primary border border-primary/20 flex items-center">
                    <Lock className="h-3 w-3 mr-1" />
                    Secure
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-gray-700/30 p-1.5 rounded-full mr-3 mt-0.5">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">One-time $10.99 payment</p>
                      <p className="text-gray-400 text-xs">No recurring charges</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-gray-700/30 p-1.5 rounded-full mr-3 mt-0.5">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Instant access restoration</p>
                      <p className="text-gray-400 text-xs">Resume chatting immediately</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-gray-700/30 p-1.5 rounded-full mr-3 mt-0.5">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Private & anonymous</p>
                      <p className="text-gray-400 text-xs">Your personal data remains protected</p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    {(!stripePromise && !user) ? (
                      <div className="text-center p-5 bg-gray-900/80 rounded-lg border border-red-500/30">
                        <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                        <p className="text-red-400 font-medium mb-1">Payment services unavailable</p>
                        <p className="text-gray-400 text-sm">Please try again later or contact support</p>
                      </div>
                    ) : (
                      <Tabs defaultValue="card" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                          <TabsTrigger value="card" className="flex items-center justify-center">
                            <CreditCard className="h-4 w-4 mr-2" />
                            Credit Card
                          </TabsTrigger>
                          <TabsTrigger value="paypal" className="flex items-center justify-center">
                            <img src="https://cdn.pixabay.com/photo/2015/05/26/09/37/paypal-784404_960_720.png" alt="PayPal" className="h-4 mr-2" />
                            PayPal
                          </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="card" className="mt-0">
                          {clientSecret ? (
                            <Elements stripe={stripePromise} options={{ clientSecret }}>
                              <PaymentForm />
                            </Elements>
                          ) : (
                            <div className="flex justify-center p-4">
                              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                            </div>
                          )}
                        </TabsContent>
                        
                        <TabsContent value="paypal" className="mt-0">
                          {user ? (
                            <div className="space-y-6">
                              <div className="flex items-center justify-center mb-4 bg-blue-500/10 p-2 rounded-lg border border-blue-500/20">
                                <Lock className="h-4 w-4 mr-2 text-blue-500" />
                                <span className="text-sm text-blue-500 font-medium">Secure PayPal Processing</span>
                              </div>
                              
                              <PayPalButton 
                                userId={user.userId}
                                productType="unban"
                                onSuccess={() => {
                                  // Navigate back to the chat after successful payment
                                  setTimeout(() => {
                                    navigate('/chat');
                                  }, 2000);
                                }}
                                onCancel={() => {
                                  toast({
                                    title: "Payment Cancelled",
                                    description: "You have cancelled the payment process.",
                                  });
                                }}
                              />
                              
                              <div className="flex flex-wrap justify-center gap-4 mt-4 pt-4 border-t border-gray-700">
                                <div className="flex items-center text-xs text-gray-400">
                                  <Shield className="h-4 w-4 mr-1 text-primary" />
                                  <span>Buyer Protection</span>
                                </div>
                                <div className="flex items-center text-xs text-gray-400">
                                  <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                                  <span>No PayPal Account Required</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-center p-4">
                              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-center text-gray-400 text-sm space-y-2">
                <p>Need help? <a href="#" className="text-primary hover:underline">Contact support</a></p>
                <p>By proceeding, you agree to our <a href="#" className="text-primary hover:underline">Terms of Service</a></p>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col pt-0">
              <div className="w-full py-3 border-t border-gray-700 mt-2">
                <div className="flex justify-center space-x-4 items-center">
                  <div className="flex items-center text-xs text-gray-400">
                    <Shield className="h-4 w-4 mr-1 text-primary" />
                    <span>Secure</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-400">
                    <Lock className="h-4 w-4 mr-1 text-blue-400" />
                    <span>Encrypted</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-400">
                    <CreditCard className="h-4 w-4 mr-1 text-green-400" />
                    <span>PCI Compliant</span>
                  </div>
                </div>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </main>

      <footer className="bg-gray-800 py-4 px-4 sm:px-6 border-t border-gray-700">
        <div className="container mx-auto max-w-7xl text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} StrangerWave - <a href="#" className="hover:text-primary">Terms</a> · <a href="#" className="hover:text-primary">Privacy</a> · <a href="#" className="hover:text-primary">Support</a></p>
        </div>
      </footer>
    </motion.div>
  );
}
