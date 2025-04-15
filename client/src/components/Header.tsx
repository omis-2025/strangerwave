import { useAuth } from "@/lib/useAuth";
import { useLocation } from "wouter";

interface HeaderProps {
  onFilterClick: () => void;
  onAdminClick: () => void;
}

export default function Header({ onFilterClick, onAdminClick }: HeaderProps) {
  const { isAdmin } = useAuth();
  const [location, navigate] = useLocation();

  // Only show admin button if user has admin rights
  const handleAdminClick = () => {
    if (isAdmin) {
      if (location === "/admin") {
        navigate("/");
      } else {
        navigate("/admin");
      }
    } else {
      onAdminClick();
    }
  };

  return (
    <header className="bg-surface py-4 px-4 sm:px-6 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold text-text-primary flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-2 text-accent" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Anonymous Chat
        </h1>
        
        <div className="flex items-center space-x-3">
          <button 
            className="text-text-primary hover:text-primary transition-colors"
            onClick={onFilterClick}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
          </button>
          
          <button 
            className="text-text-primary hover:text-primary transition-colors"
            onClick={handleAdminClick}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M19 7V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v2" />
              <path d="M12 12v7" />
              <path d="M17 12v7" />
              <path d="M7 12v7" />
              <path d="M22 12H2" />
              <path d="M19 12a3 3 0 0 1-3-3" />
              <path d="M8 12a3 3 0 0 1-3-3" />
              <path d="M14 9a2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 1 2-2 2 2 0 0 1 2 2Z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
