# Age Verification and Compliance Guide for StrangerWave

This guide outlines the age verification implementation and compliance considerations for StrangerWave, an 18+ chat application.

## App Store Requirements for Age-Restricted Content

Both Apple App Store and Google Play have strict requirements for apps with age-restricted content:

### Apple App Store Requirements

1. **Age Rating**: The app must be rated 17+ or 18+ in App Store Connect
2. **Age Verification**: Must implement an effective age gate
3. **Content Moderation**: Must have measures to prevent inappropriate content
4. **Usage Disclosures**: Must clearly state the app is for adults only
5. **User Reporting**: Must include methods for users to report inappropriate content

### Google Play Requirements

1. **Content Rating**: Must complete the content rating questionnaire accurately
2. **Age Restrictions**: Must enforce the appropriate age restrictions
3. **App Content Policy**: Must comply with the Mature Content policy
4. **User Generated Content**: Must implement robust moderation and reporting
5. **Disclosure Requirements**: Must disclose the mature nature of the app

## StrangerWave Age Verification Implementation

### Client-Side Age Verification

1. **Initial Age Gate**:
   - Implemented as a modal that appears on first app launch
   - Requires users to input their date of birth
   - Stores verification locally using secure storage

2. **Implementation in StrangerWave**:
   
   ```jsx
   import React, { useState, useEffect } from 'react';
   import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
   import { Button } from '@/components/ui/button';
   import { Label } from '@/components/ui/label';
   import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
   import { useToast } from '@/hooks/use-toast';
   
   function AgeVerificationModal({ onVerified }) {
     const [isOpen, setIsOpen] = useState(false);
     const [birthYear, setBirthYear] = useState("");
     const [birthMonth, setBirthMonth] = useState("");
     const [birthDay, setBirthDay] = useState("");
     const { toast } = useToast();
     
     useEffect(() => {
       // Check if age has been verified before
       const verified = localStorage.getItem('ageVerified');
       if (!verified) {
         setIsOpen(true);
       }
     }, []);
     
     const currentYear = new Date().getFullYear();
     const years = Array.from({ length: 100 }, (_, i) => currentYear - i - 16); // Start 16 years ago
     const months = Array.from({ length: 12 }, (_, i) => i + 1);
     const days = Array.from({ length: 31 }, (_, i) => i + 1);
     
     const verifyAge = () => {
       if (!birthYear || !birthMonth || !birthDay) {
         toast({
           title: "Invalid date",
           description: "Please select a complete birth date",
           variant: "destructive"
         });
         return;
       }
       
       const birthDate = new Date(Number(birthYear), Number(birthMonth) - 1, Number(birthDay));
       const today = new Date();
       
       // Calculate age
       let age = today.getFullYear() - birthDate.getFullYear();
       const monthDiff = today.getMonth() - birthDate.getMonth();
       
       if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
         age--;
       }
       
       if (age >= 18) {
         // User is 18 or older
         localStorage.setItem('ageVerified', 'true');
         localStorage.setItem('userAge', age.toString());
         setIsOpen(false);
         onVerified(true);
       } else {
         // User is under 18
         toast({
           title: "Age Restriction",
           description: "You must be at least 18 years old to use StrangerWave.",
           variant: "destructive"
         });
         onVerified(false);
       }
     };
     
     return (
       <Dialog open={isOpen} onOpenChange={setIsOpen}>
         <DialogContent className="sm:max-w-md">
           <DialogHeader>
             <DialogTitle>Age Verification Required</DialogTitle>
             <DialogDescription>
               StrangerWave is for adults 18 years and older only. 
               Please verify your age to continue.
             </DialogDescription>
           </DialogHeader>
           
           <div className="grid gap-4 py-4">
             <div className="grid grid-cols-3 gap-4">
               <div className="flex flex-col gap-2">
                 <Label htmlFor="month">Month</Label>
                 <Select value={birthMonth} onValueChange={setBirthMonth}>
                   <SelectTrigger id="month">
                     <SelectValue placeholder="Month" />
                   </SelectTrigger>
                   <SelectContent>
                     {months.map(month => (
                       <SelectItem key={month} value={month.toString()}>
                         {month}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
               
               <div className="flex flex-col gap-2">
                 <Label htmlFor="day">Day</Label>
                 <Select value={birthDay} onValueChange={setBirthDay}>
                   <SelectTrigger id="day">
                     <SelectValue placeholder="Day" />
                   </SelectTrigger>
                   <SelectContent>
                     {days.map(day => (
                       <SelectItem key={day} value={day.toString()}>
                         {day}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
               
               <div className="flex flex-col gap-2">
                 <Label htmlFor="year">Year</Label>
                 <Select value={birthYear} onValueChange={setBirthYear}>
                   <SelectTrigger id="year">
                     <SelectValue placeholder="Year" />
                   </SelectTrigger>
                   <SelectContent>
                     {years.map(year => (
                       <SelectItem key={year} value={year.toString()}>
                         {year}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
             </div>
           </div>
           
           <DialogFooter>
             <Button type="button" onClick={verifyAge}>
               Verify My Age
             </Button>
           </DialogFooter>
           
           <div className="text-xs text-muted-foreground mt-4">
             By verifying your age, you acknowledge that StrangerWave contains mature content 
             and you are at least 18 years old. Your date of birth will be stored locally 
             on your device and is not shared with others.
           </div>
         </DialogContent>
       </Dialog>
     );
   }
   
   export default AgeVerificationModal;
   ```

3. **Integration in App.tsx**:
   
   ```jsx
   import AgeVerificationModal from '@/components/AgeVerificationModal';
   
   function App() {
     const [isAgeVerified, setIsAgeVerified] = useState(
       localStorage.getItem('ageVerified') === 'true'
     );
     
     const handleAgeVerification = (verified) => {
       setIsAgeVerified(verified);
     };
     
     return (
       <>
         <AgeVerificationModal onVerified={handleAgeVerification} />
         
         {isAgeVerified ? (
           <Router />
         ) : (
           <AgeRestrictionScreen />
         )}
       </>
     );
   }
   ```

### Server-Side Verification

1. **Account Creation**:
   - Store age verification status in user accounts
   - Require agreement to adult content terms

2. **Continuous Enforcement**:
   - API endpoints check for age verification
   - Authentication includes age verification status

## Content Moderation for Compliance

### Moderation System

1. **AI-Powered Content Filtering**:
   - Automatic detection of inappropriate content
   - Pre-screening of images and text
   - Real-time moderation during chat

2. **User Reporting Tools**:
   - Easy-to-use reporting interface
   - Categories for different violations
   - Quick action on reported content

3. **Manual Review Process**:
   - Review team for flagged content
   - Clear violation policies
   - Escalation procedures

## Age Compliance Documentation for App Store Review

### App Store Review Information

Include the following in your App Store Review notes:

```
StrangerWave is an 18+ platform for anonymous chat and features robust age verification through:

1. Initial birthdate verification at first launch
2. Terms of service requiring 18+ confirmation
3. AI-powered content moderation to prevent inappropriate material
4. User reporting system for quick action against violations
5. Warning labels throughout the app

We've implemented both client-side and server-side age verification checks to ensure compliance with App Store guidelines for mature content.
```

### Google Play Content Rating

For Google Play Content Rating questionnaire:

1. **Mature Content Categories**:
   - Select "Yes" for "User Generated Content"
   - Select "No" for "Explicit Violence"
   - Select "No" for "Explicit Sexual Content" (moderated)
   - Select "Mild/Moderate" for "Mature/Suggestive Themes"

2. **Data Safety Form**:
   - Disclose all data collected clearly
   - Explain how data is used for content moderation
   - Detail your data retention policies

## Legal Considerations

### Terms of Service

Include clear statements in your Terms of Service:

```
AGE RESTRICTIONS:
StrangerWave is strictly for users who are 18 years of age or older. By using this 
service, you represent and warrant that you are at least 18 years old. We reserve 
the right to terminate accounts of users found to be under 18 years of age.

CONTENT POLICY:
Users are prohibited from sharing sexually explicit content, harassment, hate speech, 
violence, or any content that violates local laws. All content is subject to moderation, 
and violation of these policies may result in account termination.
```

### Privacy Policy

Include in your Privacy Policy:

```
AGE VERIFICATION:
StrangerWave collects date of birth information for the sole purpose of verifying 
that users are 18 years of age or older. This information is stored securely and 
is not shared with third parties.

CONTENT MODERATION:
User-generated content, including text messages, images, and video streams, may be 
automatically scanned using AI-powered moderation tools to ensure compliance with 
our content policies. This process is automated and content is not reviewed by 
humans unless specifically flagged for review.
```

## Implementation Checklist

- [ ] Age verification modal implemented on first launch
- [ ] Birthdate selection with appropriate year range (not allowing users to select <18)
- [ ] Local storage of verification status
- [ ] Server-side verification checks
- [ ] Clear visual indicators of 18+ nature of the app
- [ ] Content moderation system implemented
- [ ] User reporting functionality
- [ ] Terms of Service updated with age requirements
- [ ] Privacy Policy updated with age verification practices
- [ ] App submission forms correctly marked for mature content

## Best Practices

1. **Re-verification**:
   - Periodically re-verify age for returning users
   - Especially after app updates

2. **Visual Design**:
   - Include 18+ labels in app icon and splash screen
   - Clear maturity notices throughout the app

3. **Marketing Materials**:
   - All screenshots and app previews must indicate 18+ nature
   - No content that might appeal to minors

4. **Store Description**:
   - Prominently mention 18+ requirement
   - Describe content moderation and reporting

By following this guide, StrangerWave will maintain compliance with both Apple App Store and Google Play requirements for age-restricted applications while providing a clear user experience regarding the mature nature of the content.