import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/useAuth";
import { Check, Crown, Shield, Zap } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const premiumPlans = [
  {
    id: "vip",
    name: "VIP",
    description: "Get VIP access with priority matching and advanced features",
    price: 4.99,
    features: [
      "Priority in matching queue",
      "No waiting time",
      "Choose country preference",
      "Ad-free experience",
    ],
    icon: Crown,
    popular: true,
  },
  {
    id: "premium",
    name: "Premium",
    description: "Enhanced experience with extra customization options",
    price: 9.99,
    features: [
      "All VIP features",
      "Gender preference filter",
      "Advanced chat tools",
      "24/7 priority support",
      "Custom username colors",
    ],
    icon: Shield,
    popular: false,
  },
];

export default function PremiumFeatures() {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to subscribe to premium features.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Call the subscription endpoint
      const response = await apiRequest(
        "POST",
        "/api/get-or-create-subscription",
        { planId }
      );
      
      if (!response.ok) {
        throw new Error("Failed to create subscription");
      }
      
      const data = await response.json();
      
      // Redirect to payment page with client secret
      window.location.href = `/payment?clientSecret=${data.clientSecret}&subscriptionId=${data.subscriptionId}`;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
          Upgrade Your Experience
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Get exclusive features like priority matching, country selection, and more with our premium plans
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {premiumPlans.map((plan) => (
          <Card 
            key={plan.id}
            className={`relative overflow-hidden border-gray-800 ${
              plan.popular ? 'border-primary/50 shadow-lg shadow-primary/20' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0">
                <div className="bg-primary text-white text-xs font-bold px-3 py-1 transform rotate-45 translate-x-2 -translate-y-1 shadow-md">
                  POPULAR
                </div>
              </div>
            )}
            <CardHeader>
              <div className="flex items-center mb-2">
                <div className={`p-2 rounded-lg ${plan.popular ? 'bg-primary/10 text-primary' : 'bg-gray-800 text-gray-400'}`}>
                  <plan.icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-400">
                    {plan.description}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-end mt-2">
                <span className="text-3xl font-bold">${plan.price.toFixed(2)}</span>
                <span className="text-gray-400 ml-1 mb-1">/mo</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                variant={plan.popular ? "default" : "outline"}
                className={`w-full ${plan.popular ? 'py-6' : ''}`}
                onClick={() => handleSubscribe(plan.id)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Subscribe
                    {plan.popular && <Zap className="ml-2 h-4 w-4" />}
                  </div>
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mt-8">
        <div className="flex items-start">
          <div className="bg-blue-500/10 p-2 rounded-full mr-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-blue-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-gray-200">Subscription Information</h4>
            <p className="text-gray-400 text-sm mt-1">
              All plans include automatic renewal. You can cancel anytime from your account settings.
              By subscribing, you agree to our terms of service and privacy policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}