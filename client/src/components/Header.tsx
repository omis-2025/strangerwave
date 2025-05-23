import { useAuth } from "@/lib/useAuth";
import { useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import ProfileSettings from "./ProfileSettings";

interface HeaderProps {
  onFilterClick: () => void;
  onAdminClick: () => void;
}

export default function Header({ onFilterClick, onAdminClick }: HeaderProps) {
  const { user, isAdmin, logout } = useAuth();
  const [location, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

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
  
  const handleProfileClick = () => {
    setProfileModalOpen(true);
  };

  return (
    <header className="bg-background py-3 px-4 sm:px-6 border-b border-gray-800 sticky top-0 z-10 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold flex items-center">
            <svg width="32" height="32" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2">
              <circle cx="100" cy="100" r="95" fill="url(#paint0_linear)" />
              <path d="M30 100C30 95 32 90 35 85C38 80 42 75 47 70C52 65 58 60 65 55C72 50 80 45 90 40C100 35 110 30 120 25C130 20 140 15 150 10"
                    stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.3" fill="none"
                    transform="translate(0, 15)"/>
              <path d="M30 100C30 95 32 90 35 85C38 80 42 75 47 70C52 65 58 60 65 55C72 50 80 45 90 40C100 35 110 30 120 25C130 20 140 15 150 10"
                    stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeOpacity="0.6" fill="none"
                    transform="translate(0, 30)"/>
              <path d="M30 100C30 95 32 90 35 85C38 80 42 75 47 70C52 65 58 60 65 55C72 50 80 45 90 40C100 35 110 30 120 25C130 20 140 15 150 10"
                    stroke="#ffffff" strokeWidth="5" strokeLinecap="round" fill="none"
                    transform="translate(0, 45)"/>
              <path d="M85 95H115V125C115 125 105 115 95 115H85V95Z" fill="white"/>
              <path d="M65 65H135V105C135 105 120 90 105 90H65V65Z" fill="white" fillOpacity="0.9"/>
              <defs>
                <linearGradient id="paint0_linear" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#4F46E5"/>
                  <stop offset="100%" stopColor="#0EA5E9"/>
                </linearGradient>
              </defs>
            </svg>
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
          {!user?.hasSubscription && (
            <Button
              onClick={() => navigate('/pricing')}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-1 rounded-full flex items-center gap-1 hover:shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all border border-indigo-500/30"
              size="sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L15 6H9L12 2Z"/>
                <path d="M2 7H22V21H2V7Z"/>
                <path d="M12 11.5C12.8285 11.5 13.5 12.1716 13.5 13L16.5 13C17.3284 13 18 13.6716 18 14.5V18"/>
                <path d="M7.5 18V13.5C7.5 12.6716 8.17157 12 9 12H13.5" stroke="white"/>
              </svg>
              <span>Upgrade</span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/pricing')}
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
              <circle cx="12" cy="12" r="10" />
              <path d="M12 17v.01" />
              <path d="M12 13a2 2 0 0 0 1.882-1.35.9.9 0 1 1 1.788.018A2.977 2.977 0 0 1 12 14.5c-.89 0-1.563-.6-1.939-1.347A3.087 3.087 0 0 1 8.5 13" />
            </svg>
            <span>Pricing</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/demo')}
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
              <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path>
            </svg>
            <span>Demo</span>
          </Button>
          
          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/rewards')}
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
                <path d="M12 15c3 0 6-2 6-5s-3-5-6-5-6 2-6 5 3 5 6 5Z"></path>
                <path d="M3 16v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2"></path>
                <path d="M12 13v8"></path>
                <path d="m8 21 4-4 4 4"></path>
              </svg>
              <span>Rewards</span>
            </Button>
          )}
          
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
            <Button
              variant="ghost"
              size="sm"
              onClick={handleProfileClick}
              className="flex items-center border border-gray-700 rounded-full px-3 py-1 bg-gray-800 hover:bg-gray-700"
            >
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              <span className="text-sm font-medium text-gray-300">{user.username}</span>
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
          
          {/* Profile Settings Modal */}
          {user && (
            <ProfileSettings
              isOpen={profileModalOpen}
              onClose={() => setProfileModalOpen(false)}
              userId={user.userId}
              initialGender={user.gender || 'any'}
            />
          )}
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 pt-2 pb-4 border-t border-gray-700">
          <nav className="flex flex-col space-y-2">
            {!user?.hasSubscription && (
              <Button
                onClick={() => navigate('/pricing')}
                className="justify-start bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 border border-indigo-500/30"
                size="sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L15 6H9L12 2Z"/>
                  <path d="M2 7H22V21H2V7Z"/>
                  <path d="M12 11.5C12.8285 11.5 13.5 12.1716 13.5 13L16.5 13C17.3284 13 18 13.6716 18 14.5V18"/>
                  <path d="M7.5 18V13.5C7.5 12.6716 8.17157 12 9 12H13.5" stroke="white"/>
                </svg>
                Upgrade to Premium
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/pricing')}
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
                <circle cx="12" cy="12" r="10" />
                <path d="M12 17v.01" />
                <path d="M12 13a2 2 0 0 0 1.882-1.35.9.9 0 1 1 1.788.018A2.977 2.977 0 0 1 12 14.5c-.89 0-1.563-.6-1.939-1.347A3.087 3.087 0 0 1 8.5 13" />
              </svg>
              Pricing
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/demo')}
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
                <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path>
              </svg>
              Demo
            </Button>
            
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/rewards')}
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
                  <path d="M12 15c3 0 6-2 6-5s-3-5-6-5-6 2-6 5 3 5 6 5Z"></path>
                  <path d="M3 16v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2"></path>
                  <path d="M12 13v8"></path>
                  <path d="m8 21 4-4 4 4"></path>
                </svg>
                Rewards
              </Button>
            )}
            
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
                onClick={handleProfileClick}
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
                  <circle cx="12" cy="8" r="5" />
                  <path d="M20 21a8 8 0 0 0-16 0" />
                </svg>
                Profile Settings
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
