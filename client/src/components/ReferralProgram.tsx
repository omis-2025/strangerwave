
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

export default function ReferralProgram() {
  const [isLoading, setIsLoading] = useState(false);

  const handleReferral = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement referral link generation and sending logic
      toast({
        title: "Success!",
        description: "Referral link has been sent to your friends.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send referral link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-800">
      <h2 className="text-2xl font-bold mb-4">Invite Your Friends!</h2>
      <Button 
        onClick={handleReferral} 
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? "Sending..." : "Send Referral Link"}
      </Button>
    </div>
  );
}
