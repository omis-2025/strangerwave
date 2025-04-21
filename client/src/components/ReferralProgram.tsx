
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

export default function ReferralProgram() {
  const [isLoading, setIsLoading] = useState(false);
  const [referralCode, setReferralCode] = useState('');

  const generateReferralCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from(
      { length: 8 },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join('');
  };

  const handleReferral = async () => {
    try {
      setIsLoading(true);
      const code = generateReferralCode();
      setReferralCode(code);
      toast({
        title: "Success!",
        description: "Your referral code has been generated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate referral code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-800">
      <h2 className="text-2xl font-bold mb-4">Invite Your Friends!</h2>
      <p className="mb-4 text-gray-600 dark:text-gray-300">
        Share StrangerWave with friends and earn rewards when they join!
      </p>
      {referralCode && (
        <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded">
          <p className="font-mono text-center text-lg">{referralCode}</p>
        </div>
      )}
      <Button 
        onClick={handleReferral} 
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? "Generating..." : "Generate Referral Code"}
      </Button>
    </div>
  );
}
