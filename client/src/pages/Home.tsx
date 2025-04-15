import { useState, useEffect } from "react";
import Header from "@/components/Header";
import ChatScreen from "@/components/ChatScreen";
import FilterModal from "@/components/FilterModal";
import AdminModal from "@/components/AdminModal";
import OnboardingModal from "@/components/OnboardingModal";
import { useAuth } from "@/lib/useAuth";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const { isLoading, login, user } = useAuth();
  
  // Move login logic to useEffect to avoid render-time state updates
  useEffect(() => {
    if (!user && !isLoading && loginAttempts < 3) {
      login();
      setLoginAttempts(prev => prev + 1);
    }
  }, [user, isLoading, login, loginAttempts]);
  
  // Handle manual login
  const handleManualLogin = () => {
    setLoginAttempts(0);
    login();
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header 
        onFilterClick={() => setShowFilterModal(true)}
        onAdminClick={() => setShowAdminModal(true)}
      />
      
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
          {loginAttempts >= 3 && (
            <div className="text-center mt-4">
              <p className="text-gray-400 mb-4">Having trouble logging in? Firebase rate limits might be active.</p>
              <Button 
                onClick={handleManualLogin} 
                className="bg-primary hover:bg-primary/90"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      ) : !user && loginAttempts >= 3 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="flex flex-col items-center">
              <div className="bg-gray-700 p-3 rounded-full mb-4">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-10 w-10 text-primary" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-200 mb-2">Login Required</h2>
              <p className="text-gray-400 text-center mb-6">
                We're having trouble logging you in automatically. Firebase may be rate limiting authentication requests.
              </p>
              <Button 
                onClick={handleManualLogin}
                className="w-full bg-primary hover:bg-primary/90 py-6"
              >
                Login Anonymously
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <ChatScreen />
          
          <FilterModal
            isOpen={showFilterModal}
            onClose={() => setShowFilterModal(false)}
            onSave={(preferences) => {
              // This will be handled by ChatScreen component
              setShowFilterModal(false);
            }}
            initialPreferences={{
              preferredGender: 'any',
              country: null
            }}
          />
          
          <AdminModal
            isOpen={showAdminModal}
            onClose={() => setShowAdminModal(false)}
          />
        </>
      )}
      
      <footer className="bg-surface py-4 px-4 sm:px-6 border-t border-gray-800">
        <div className="container mx-auto text-center text-text-secondary text-sm">
          <p>© {new Date().getFullYear()} Anonymous Chat - <a href="#" className="hover:text-primary">Terms</a> · <a href="#" className="hover:text-primary">Privacy</a></p>
        </div>
      </footer>
    </div>
  );
}
