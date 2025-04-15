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
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  isBanned: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  isLoading: true,
  isAdmin: false,
  isBanned: false,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (fbUser) => {
      setFirebaseUser(fbUser);
      
      if (fbUser) {
        try {
          // Check if user exists in our backend
          const response = await fetch("/api/users/" + fbUser.uid);
          
          if (response.ok) {
            // User exists, get their data
            const userData = await response.json();
            setUser(userData);
          } else if (response.status === 404) {
            // User doesn't exist, create new anonymous user
            const newUser = await createAnonymousUser(fbUser.uid);
            setUser(newUser);
          } else {
            throw new Error("Failed to fetch user data");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Failed to load user data. Please try again."
          });
        }
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const createAnonymousUser = async (uid: string) => {
    try {
      const response = await apiRequest("POST", "/api/auth/anonymous", { uid });
      return await response.json();
    } catch (error) {
      console.error("Error creating anonymous user:", error);
      throw error;
    }
  };

  const login = async () => {
    try {
      setIsLoading(true);
      await signInAnonymouslyWithFirebase();
      // The onAuthStateChanged listener will handle updating the user state
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Handle rate limiting error
      if (error.code === "auth/too-many-requests") {
        toast({
          variant: "destructive",
          title: "Login Temporarily Unavailable",
          description: "Please wait a moment before trying again. Too many login attempts."
        });
        // Set a delay before allowing another attempt
        setTimeout(() => {
          setIsLoading(false);
        }, 5000);
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Failed to login anonymously. Please try again."
        });
        setIsLoading(false);
      }
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "Failed to logout. Please try again."
      });
    }
  };

  const isAdmin = !!user?.isAdmin;
  const isBanned = !!user?.isBanned;

  const providerValue = {
    user,
    firebaseUser,
    isLoading,
    isAdmin,
    isBanned,
    login,
    logout
  };

  // Use React.createElement instead of JSX
  return React.createElement(
    AuthContext.Provider,
    { value: providerValue },
    children
  );
};

export const useAuth = () => useContext(AuthContext);