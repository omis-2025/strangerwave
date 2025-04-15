import { useState, useEffect } from "react";
import Header from "@/components/Header";
import ChatScreen from "@/components/ChatScreen";
import FilterModal from "@/components/FilterModal";
import AdminModal from "@/components/AdminModal";
import { useAuth } from "@/lib/useAuth";

export default function Home() {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const { isLoading, login, user } = useAuth();
  
  // Move login logic to useEffect to avoid render-time state updates
  useEffect(() => {
    if (!user && !isLoading) {
      login();
    }
  }, [user, isLoading, login]);
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header 
        onFilterClick={() => setShowFilterModal(true)}
        onAdminClick={() => setShowAdminModal(true)}
      />
      
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
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
