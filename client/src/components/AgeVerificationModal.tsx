import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Shield, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AgeVerificationModalProps {
  isOpen: boolean;
  onVerified: () => void;
  onReject: () => void;
}

export default function AgeVerificationModal({ 
  isOpen, 
  onVerified, 
  onReject 
}: AgeVerificationModalProps) {
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showError, setShowError] = useState(false);
  
  // Calculate if user is 18+ based on birthdate
  const isOver18 = (): boolean => {
    if (!birthDate) return false;
    
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // If birth month is later in the year or same month but birth day is later
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= 18;
    }
    
    return age >= 18;
  };
  
  const handleVerify = () => {
    if (isOver18() && termsAccepted) {
      // Save age verification status in localStorage
      localStorage.setItem('ageVerified', 'true');
      localStorage.setItem('ageVerifiedDate', new Date().toISOString());
      
      // Call the onVerified callback
      onVerified();
      
      // Reset state
      setBirthDate(undefined);
      setTermsAccepted(false);
      setShowError(false);
    } else {
      setShowError(true);
    }
  };
  
  const handleReject = () => {
    // Call the onReject callback
    onReject();
    
    // Reset state
    setBirthDate(undefined);
    setTermsAccepted(false);
    setShowError(false);
  };
  
  // Return null if modal should not be shown
  if (!isOpen) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleReject()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center justify-center mb-2">
            <Shield className="h-8 w-8 text-blue-500" />
          </div>
          <DialogTitle className="text-center text-xl">Age Verification Required</DialogTitle>
          <DialogDescription className="text-center">
            StrangerWave is only for users 18 years and older. Please verify your age to continue.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="birthdate">When were you born?</Label>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !birthDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {birthDate ? format(birthDate, "PPP") : "Select your date of birth"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={birthDate}
                  onSelect={(date) => {
                    setBirthDate(date);
                    setDatePickerOpen(false);
                    setShowError(false);
                  }}
                  disabled={(date) => {
                    // Disable future dates and dates less than 100 years ago
                    return date > new Date() || date < new Date(new Date().setFullYear(new Date().getFullYear() - 100));
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="terms" 
              checked={termsAccepted}
              onCheckedChange={(checked) => {
                setTermsAccepted(checked as boolean);
                setShowError(false);
              }} 
            />
            <Label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400">
              I confirm that I am at least 18 years old and I accept the&nbsp;
              <a href="/terms" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
                Terms of Service
              </a>
              &nbsp;and&nbsp;
              <a href="/privacy" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>
            </Label>
          </div>
          
          {showError && (
            <div className="flex items-center text-red-500 text-sm mt-2">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span>You must be at least 18 years old and accept the terms</span>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleReject} className="sm:w-1/2">
            Exit
          </Button>
          <Button onClick={handleVerify} className="sm:w-1/2">
            Continue
          </Button>
        </DialogFooter>
        
        <div className="text-center text-xs text-gray-500 mt-4">
          By using StrangerWave, you confirm that you are at least 18 years old. 
          StrangerWave will collect and process your personal data in accordance with our Privacy Policy.
        </div>
      </DialogContent>
    </Dialog>
  );
}