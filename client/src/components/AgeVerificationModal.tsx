import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Capacitor } from '@capacitor/core';

// Form schema with validation
const formSchema = z.object({
  age: z.string().min(1, "Please confirm your age"),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and privacy policy"
  }),
  region: z.string().min(1, "Please select your region")
});

// Component props
interface AgeVerificationModalProps {
  isOpen: boolean;
  onVerified: () => void;
  onReject: () => void;
}

// Generate array of years (for age selection)
const generateYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear; i >= currentYear - 100; i--) {
    years.push(i);
  }
  return years;
};

export default function AgeVerificationModal({ 
  isOpen, 
  onVerified, 
  onReject 
}: AgeVerificationModalProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();
  const years = generateYears();
  const isNative = Capacitor.isNativePlatform();
  
  // Get platform-specific information
  const platform = Capacitor.getPlatform();
  const isIOS = platform === 'ios';
  const isAndroid = platform === 'android';
  
  // Set up form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: '',
      termsAccepted: false,
      region: ''
    },
  });
  
  // Handle form submission
  const onSubmit = (values: z.infer<typeof formSchema>) {
    // Calculate if user is 18+
    const birthYear = parseInt(values.age, 10);
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;
    
    if (age < 18) {
      // User is under 18
      toast({
        variant: "destructive",
        title: "Age Verification Failed",
        description: "You must be at least 18 years old to use StrangerWave.",
      });
      
      onReject();
      return;
    }
    
    // Save verification status in localStorage
    localStorage.setItem('age_verified', 'true');
    localStorage.setItem('age_verified_date', new Date().toISOString());
    localStorage.setItem('user_region', values.region);
    
    toast({
      title: "Age Verified",
      description: "Welcome to StrangerWave!",
    });
    
    // Call the onVerified callback
    onVerified();
  };
  
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Age Verification Required</DialogTitle>
          <DialogDescription>
            StrangerWave is strictly for users 18 years and older. Please verify your age to continue.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year of Birth</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year of birth" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[200px]">
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Region</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your region" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="eu">Europe</SelectItem>
                      <SelectItem value="asia">Asia</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="termsAccepted"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I agree to the <a href="/terms.html" target="_blank" className="text-primary">Terms of Service</a> and <a href="/privacy.html" target="_blank" className="text-primary">Privacy Policy</a>
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            
            {showDetails && (
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-sm">
                <h4 className="font-semibold mb-2">Important Information</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>StrangerWave is an anonymous chat platform for adults only (18+)</li>
                  <li>All chats are moderated by AI to detect inappropriate content</li>
                  <li>We don't store your personal information, but your IP address is logged for security</li>
                  <li>Premium features require payment and subscription management is available in account settings</li>
                  {isIOS && (
                    <li>Subscriptions will be charged to your iTunes account and will automatically renew unless canceled at least 24 hours before the end of the current period</li>
                  )}
                  {isAndroid && (
                    <li>Subscriptions will be charged to your Google Play account and will automatically renew unless canceled at least 24 hours before the end of the current period</li>
                  )}
                </ul>
              </div>
            )}
            
            <Button 
              type="button" 
              variant="link" 
              className="p-0 h-auto text-sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? "Hide details" : "Show more details"}
            </Button>
            
            <DialogFooter className="flex flex-col sm:flex-row gap-3">
              <Button type="button" variant="outline" onClick={onReject} className="sm:w-1/2">
                Decline
              </Button>
              <Button type="submit" className="sm:w-1/2">
                Verify Age
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}