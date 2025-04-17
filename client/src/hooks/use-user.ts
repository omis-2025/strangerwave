import { useContext } from 'react';
import { AuthContext } from '@/lib/useAuth';

export const useUser = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useUser must be used within an AuthProvider');
  }
  
  return {
    user: context.user,
    isLoading: context.isLoading,
    signOut: context.signOut,
  };
};