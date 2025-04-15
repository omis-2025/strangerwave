import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/lib/useAuth';
import { signInAnonymouslyWithFirebase } from '@/lib/firebase';
import { FlexContainer } from '@/components/ui/responsive-container';

// Login form validation schema
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const { toast } = useToast();
  const { login: authLogin } = useAuth();
  const [loginMethod, setLoginMethod] = useState<'anonymous' | 'credentials'>('anonymous');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });
  
  // Handle form submission
  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    setError(null);
    
    try {
      // Make API request to login endpoint
      const response = await apiRequest('POST', '/api/auth/login', data);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Login failed. Please try again.');
      }
      
      // Show success toast
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${result.username}!`,
      });
      
      // Handle JWT token
      localStorage.setItem('auth_token', result.token);
      
      // Additional login logic can be added here
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
      toast({
        title: 'Login Failed',
        description: err.message || 'Please check your credentials and try again',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle anonymous login
  const handleAnonymousLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await authLogin();
      toast({
        title: 'Anonymous Login Successful',
        description: 'You are now chatting anonymously',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to login anonymously');
      toast({
        title: 'Anonymous Login Failed',
        description: err.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Welcome to StrangerWave</CardTitle>
        <CardDescription className="text-center">
          Login to start chatting or continue anonymously
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Login method tabs */}
        <div className="flex mb-6 border-b">
          <button
            type="button"
            className={`flex-1 py-2 text-center transition-colors ${
              loginMethod === 'anonymous' ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'
            }`}
            onClick={() => setLoginMethod('anonymous')}
          >
            Anonymous
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-center transition-colors ${
              loginMethod === 'credentials' ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'
            }`}
            onClick={() => setLoginMethod('credentials')}
          >
            Login
          </button>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {loginMethod === 'credentials' ? (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                {...form.register('username')}
                disabled={loading}
              />
              {form.formState.errors.username && (
                <p className="text-sm text-red-500">{form.formState.errors.username.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...form.register('password')}
                disabled={loading}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
              )}
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-center">
              Chat anonymously without creating an account. Your data is only temporarily stored.
            </p>
            <Button 
              className="w-full"
              onClick={handleAnonymousLogin}
              disabled={loading}
            >
              {loading ? 'Connecting...' : 'Start StrangerWave Chat'}
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-xs text-center text-muted-foreground">
          By using our service, you agree to our Terms of Service and Privacy Policy
        </div>
      </CardFooter>
    </Card>
  );
}