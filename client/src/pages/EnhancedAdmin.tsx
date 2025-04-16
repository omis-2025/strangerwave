import { useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import EnhancedAdminPanel from '@/components/EnhancedAdminPanel';
import { useAuth } from '@/lib/useAuth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function EnhancedAdmin() {
  const { user, isLoading } = useAuth();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [isActive] = useRoute('/enhanced-admin');

  useEffect(() => {
    // Redirect non-admin users
    if (!isLoading && (!user || !user.isAdmin)) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin panel.",
        variant: "destructive",
      });
      navigate('/');
    }
  }, [user, isLoading, navigate, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-lg text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return null; // Will redirect from the useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
              S
            </div>
            <h1 className="text-xl font-bold">StrangerWave Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Logged in as <span className="font-medium">{user.username}</span>
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/chat')}
            >
              Back to App
            </Button>
          </div>
        </div>
      </header>
      
      <main className="py-8">
        <EnhancedAdminPanel />
      </main>

      <footer className="border-t py-4 mt-8">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} StrangerWave Admin Panel • Version 2.0.0
        </div>
      </footer>
    </div>
  );
}