import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  Card, 
  Title, 
  Text,
  Button,
  TextInput
} from '@tremor/react';
import { 
  Lock, 
  Key, 
  ShieldCheck, 
  AlertTriangle,
  Clock
} from 'lucide-react';

/**
 * Demo access control component for investor due diligence
 * This creates a simple password-protected entry point for the analytics dashboard
 */
const DemoAccessControl: React.FC = () => {
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [, navigate] = useLocation();
  
  // List of valid access codes (in production, this would be server-verified)
  // Each code is associated with different access levels or investor identities
  const validCodes = {
    'INVESTOR2025': { name: 'Investor Demo', expiryDate: '2025-05-17', level: 'Standard' },
    'PARTNER2025': { name: 'Partner Demo', expiryDate: '2025-05-17', level: 'Standard' },
    'DUE-DILIGENCE-A': { name: 'Due Diligence Access - Full', expiryDate: '2025-06-01', level: 'Full' },
    'DUE-DILIGENCE-B': { name: 'Due Diligence Access - Limited', expiryDate: '2025-06-01', level: 'Limited' }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    // Simulate server verification delay
    setTimeout(() => {
      // Check if password is valid
      const accessInfo = validCodes[password as keyof typeof validCodes];
      
      if (accessInfo) {
        // Store access info in session storage (would use more secure methods in production)
        sessionStorage.setItem('demoAccess', JSON.stringify({
          ...accessInfo,
          accessGranted: new Date().toISOString(),
          code: password
        }));
        
        // Navigate to dashboard
        navigate('/analytics-demo');
      } else {
        setError('Invalid access code. Please try again or contact your StrangerWave representative.');
      }
      
      setIsLoading(false);
    }, 1500);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-6">
        <div className="flex items-center justify-center mb-6">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Lock className="h-8 w-8 text-primary" />
          </div>
        </div>
        
        <Title className="text-center mb-2">StrangerWave Analytics</Title>
        <Text className="text-center mb-6">Enter your access code to continue</Text>
        
        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-500">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <Text className="text-red-500 text-sm">{error}</Text>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <TextInput
              placeholder="Access Code"
              icon={Key}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              error={Boolean(error)}
            />
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={!password || isLoading}
            loading={isLoading}
          >
            Access Dashboard
          </Button>
        </form>
        
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
          <Text className="text-sm text-gray-500 flex items-center gap-1 mb-2">
            <ShieldCheck className="h-4 w-4" />
            Confidential information protected by NDA
          </Text>
          <Text className="text-sm text-gray-500 flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Access codes expire after the specified date
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default DemoAccessControl;