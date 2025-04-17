import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { auth, signInAnonymouslyWithFirebase } from "./firebase";
import { apiRequest } from "./queryClient";
import { useToast } from "@/hooks/use-toast";

export interface User {
  userId: number;
  username: string;
  uid: string;
  isAdmin?: boolean;
  isBanned?: boolean;
  gender?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  isPremium?: boolean;
  premiumUntil?: string;
  premiumTier?: string;
  // Helper property for subscription checks
  hasSubscription?: boolean;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  isBanned: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  isLoading: true,
  isAdmin: false,
  isBanned: false,
  login: async () => {},
  logout: async () => {},
  refreshUserData: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    toast({
      title: type === 'error' ? "Authentication Error" : "Success",
      description: message,
      variant: type === 'error' ? "destructive" : "default",
    });
    console[type === 'error' ? 'error' : 'log'](message);
  };

  // Function to fetch/refresh user data from the backend
  const fetchUserData = async (uid: string): Promise<User | null> => {
    try {
      // Check if user exists in our backend
      console.log(`Fetching user data for uid: ${uid}`);
      const response = await fetch(`/api/users/${uid}`, {
        headers: { 'Cache-Control': 'no-cache' },
      });
      
      if (response.ok) {
        // User exists, get their data
        const userData = await response.json();
        // Add the hasSubscription field based on existing data
        userData.hasSubscription = userData.isPremium || !!userData.stripeSubscriptionId;
        console.log("User data fetched successfully:", userData);
        return userData;
      } else if (response.status === 404) {
        // User doesn't exist, create new anonymous user
        console.log("User not found, creating new anonymous user");
        const newUser = await createAnonymousUser(uid);
        newUser.hasSubscription = false;
        return newUser;
      } else {
        throw new Error(`Failed to fetch user data: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setAuthError(`Failed to load user data: ${error.message}`);
      return null;
    }
  };

  const refreshUserData = async (): Promise<void> => {
    if (!firebaseUser?.uid) {
      console.warn("Cannot refresh user data: No authenticated user");
      return;
    }
    
    setIsLoading(true);
    try {
      const userData = await fetchUserData(firebaseUser.uid);
      if (userData) {
        setUser(userData);
        setAuthError(null);
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
      setAuthError("Failed to refresh user data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("Setting up Firebase auth state listener");
    const unsubscribe = auth.onAuthStateChanged(async (fbUser) => {
      console.log("Firebase auth state changed:", fbUser ? "User authenticated" : "No user");
      setFirebaseUser(fbUser);
      
      if (fbUser) {
        try {
          const userData = await fetchUserData(fbUser.uid);
          if (userData) {
            setUser(userData);
            setAuthError(null);
          }
        } catch (error) {
          console.error("Error in auth state change handler:", error);
          showToast("Failed to load user data. Please try again.", "error");
        }
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
    });

    return () => {
      console.log("Cleaning up Firebase auth state listener");
      unsubscribe();
    };
  }, []);

  const createAnonymousUser = async (uid: string): Promise<User> => {
    try {
      console.log("Creating anonymous user with uid:", uid);
      const response = await apiRequest("POST", "/api/auth/anonymous", { uid });
      
      if (!response.ok) {
        throw new Error(`Failed to create user: ${response.status} ${response.statusText}`);
      }
      
      const userData = await response.json();
      console.log("Anonymous user created successfully:", userData);
      return userData;
    } catch (error) {
      console.error("Error creating anonymous user:", error);
      throw error;
    }
  };

  const login = async () => {
    try {
      console.log("Attempting to login anonymously");
      setIsLoading(true);
      setAuthError(null);
      
      const user = await signInAnonymouslyWithFirebase();
      console.log("Anonymous login successful, user:", user);
      // The onAuthStateChanged listener will handle updating the user state
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Handle rate limiting error
      if (error.code === "auth/too-many-requests") {
        const errorMsg = "Please wait a moment before trying again. Too many login attempts.";
        setAuthError(errorMsg);
        showToast(errorMsg, "error");
        
        // Set a delay before allowing another attempt
        setTimeout(() => {
          setIsLoading(false);
        }, 5000);
      } else {
        const errorMsg = `Failed to login anonymously: ${error.message}`;
        setAuthError(errorMsg);
        showToast(errorMsg, "error");
        setIsLoading(false);
      }
    }
  };

  const logout = async () => {
    try {
      console.log("Attempting to logout");
      await auth.signOut();
      setUser(null);
      console.log("Logout successful");
      
      // Clear any auth-related localStorage flags
      localStorage.removeItem('startChatting');
      localStorage.removeItem('showLandingPage');
      
      showToast("Successfully logged out", "success");
    } catch (error) {
      console.error("Logout error:", error);
      showToast("Failed to logout. Please try again.", "error");
    }
  };

  const isAdmin = !!user?.isAdmin;
  const isBanned = !!user?.isBanned;

  // Include auth error in the context value
  const providerValue = {
    user,
    firebaseUser,
    isLoading,
    isAdmin,
    isBanned,
    login,
    logout,
    refreshUserData
  };

  // Use React.createElement instead of JSX
  return React.createElement(
    AuthContext.Provider,
    { value: providerValue },
    children
  );
};

export const useAuth = () => useContext(AuthContext);