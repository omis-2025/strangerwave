import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Admin from "@/pages/Admin";
import EnhancedAdmin from "@/pages/EnhancedAdmin";
import Payment from "@/pages/Payment";
import PaymentSuccess from "@/pages/PaymentSuccess";
import Pricing from "@/pages/Pricing";
import LandingPage from "@/pages/LandingPage";
import Rewards from "@/pages/Rewards";
import ReferralPage from "@/pages/ReferralPage";
import SocialSharingPage from "@/pages/SocialSharingPage";
import CreatorModePage from "@/pages/CreatorModePage";
import DemoDashboardPage from "./pages/DemoDashboardPage";
import DemoAccessPage from "./pages/DemoAccessPage";
import Demo from "./pages/Demo";
import FoodSourceDemo from "./pages/FoodSourceDemo";
import { AuthProvider, useAuth } from "./lib/useAuth";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ToolsAccess from './pages/ToolsAccess';

// Loading indicator component for transitions
function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-lg text-gray-200">Loading...</p>
      </div>
    </div>
  );
}

// Auth route component to handle protected routes
function AuthRoute({ component: Component, adminOnly = false, ...rest }: any) {
  const { user, isLoading } = useAuth();
  const [location, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      // Redirect to landing page if not authenticated
      navigate('/');
    } else if (adminOnly && !isLoading && user && !user.isAdmin) {
      // Redirect to home if not admin
      navigate('/chat');
    }
  }, [user, isLoading, navigate, adminOnly]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return user ? <Component {...rest} /> : null;
}

function Router() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  // Simulated loading for smoother transitions
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Enhanced navigation logic with stability improvements
  useEffect(() => {
    // Only execute navigation logic if we're not in a loading state
    if (isLoading) return;

    try {
      const currentPath = window.location.pathname;
      const isOnLandingPage = currentPath === '/' || currentPath === '/landing';

      // Handle navigation flags with more information
      console.log('Navigation check:', { 
        currentPath,
        isAuthenticated: !!user,
        startChatting: localStorage.getItem('startChatting'),
        showLandingPage: localStorage.getItem('showLandingPage')
      });

      // Setting landing page preference
      if (isOnLandingPage) {
        localStorage.setItem('showLandingPage', 'true');

        // Don't overwrite explicit startChatting preference if it exists
        if (localStorage.getItem('startChatting') !== 'true') {
          localStorage.removeItem('startChatting');
        }
      }

      // Only perform redirection under specific conditions
      const shouldRedirectToChat = 
        user && // User must be authenticated
        isOnLandingPage && // Must be on landing page
        localStorage.getItem('startChatting') === 'true' && // Must have explicit redirect flag
        !localStorage.getItem('preventRedirect'); // Emergency override for debugging

      if (shouldRedirectToChat) {
        console.log('Redirecting from landing page to chat based on user preference');

        // Set a temporary flag to prevent redirect loops
        localStorage.setItem('redirecting', 'true');

        // Clear navigation flags after redirect
        localStorage.removeItem('startChatting');
        localStorage.removeItem('showLandingPage');

        // Navigate to chat page
        navigate('/chat');

        // Remove temporary flag after a short delay
        setTimeout(() => {
          localStorage.removeItem('redirecting');
        }, 1000);
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // Don't let navigation errors break the app
    }
  }, [user, navigate, isLoading]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <AnimatePresence mode="wait">
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/landing" component={LandingPage} />
        <Route path="/chat" component={Home} />
        <Route path="/admin" component={() => <AuthRoute component={Admin} adminOnly={true} />} />
        <Route path="/enhanced-admin" component={() => <AuthRoute component={EnhancedAdmin} adminOnly={true} />} />
        <Route path="/payment" component={Payment} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/tools" element={<ToolsAccess />} />
        <Route path="/rewards" component={() => <AuthRoute component={Rewards} />} />
        <Route path="/referral" component={() => <AuthRoute component={ReferralPage} />} />
        <Route path="/social" component={() => <AuthRoute component={SocialSharingPage} />} />
        <Route path="/creator" component={() => <AuthRoute component={CreatorModePage} />} />
        <Route path="/demo-access" component={DemoAccessPage} />
        <Route path="/analytics-demo" component={DemoDashboardPage} />
        <Route path="/payment-success" component={PaymentSuccess} />
        <Route path="/demo" component={Demo} />
        <Route path="/foodsource" component={FoodSourceDemo} />
        <Route path="/payment-canceled">
          {() => (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen bg-gray-900 flex items-center justify-center p-4"
            >
              <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-lg p-8 text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Payment Canceled</h1>
                <p className="text-gray-300 mb-6">Your payment was canceled. You can try again when you're ready.</p>
                <button 
                  onClick={() => navigate('/pricing')}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Return to Pricing
                </button>
              </div>
            </motion.div>
          )}
        </Route>
        <Route component={NotFound} />
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen bg-gray-900 text-gray-100">
          <Router />
          <Toaster />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;