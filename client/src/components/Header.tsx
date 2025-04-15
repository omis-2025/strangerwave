import { useAuth } from "@/lib/useAuth";
import { useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onFilterClick: () => void;
  onAdminClick: () => void;
}

export default function Header({ onFilterClick, onAdminClick }: HeaderProps) {
  const { user, isAdmin, logout } = useAuth();
  const [location, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <header className="bg-background py-3 px-4 sm:px-6 border-b border-gray-800 sticky top-0 z-10 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold flex items-center">
            <img src="/logo.svg" alt="StrangerWave Logo" className="h-8 w-8 mr-2" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">StrangerWave</span>
          </h1>
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="h-6 w-6"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </Button>
        </div>
        
        {/* Desktop menu */}
        <div className="hidden md:flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onFilterClick}
            className="text-gray-300 hover:text-white px-3 py-1 rounded-full flex items-center gap-1 hover:bg-gray-800 transition-all"
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
            <span>Filters</span>
          </Button>
          
          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAdminClick}
              className="text-gray-300 hover:text-white px-3 py-1 rounded-full flex items-center gap-1 hover:bg-gray-800 transition-all"
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
                <path d="M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20z"></path>
                <path d="M12 16v-4"></path>
                <path d="M12 8h.01"></path>
              </svg>
              <span>Admin</span>
            </Button>
          )}
          
          {user && (
            <div className="flex items-center border border-gray-700 rounded-full px-3 py-1 bg-gray-800">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              <span className="text-sm font-medium text-gray-300">{user.username}</span>
            </div>
          )}
          
          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                logout && logout();
                navigate('/');
              }}
              className="text-gray-400 hover:text-white p-2"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-5 h-5"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </Button>
          )}
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 pt-2 pb-4 border-t border-gray-700">
          <nav className="flex flex-col space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onFilterClick}
              className="justify-start"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 mr-2" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              Filters
            </Button>
            
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAdminClick}
                className="justify-start"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-2" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20z"></path>
                  <path d="M12 16v-4"></path>
                  <path d="M12 8h.01"></path>
                </svg>
                Admin
              </Button>
            )}
            
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  logout && logout();
                  navigate('/');
                }}
                className="justify-start text-gray-400"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="w-5 h-5 mr-2"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Logout
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
