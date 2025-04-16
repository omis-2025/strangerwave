import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { User, X, Sliders, UserRound } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ProfileSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  initialGender: string;
}

type GenderOption = 'any' | 'male' | 'female' | 'non-binary' | 'transgender' | 'genderqueer' | 'gender-fluid' | 'other';

interface GenderOptionType {
  value: GenderOption;
  label: string;
  icon: JSX.Element;
  description: string;
}

const genderOptions: GenderOptionType[] = [
  { 
    value: 'male', 
    label: 'Male', 
    icon: <User className="h-6 w-6 text-blue-500" />,
    description: 'Identify as male'
  },
  { 
    value: 'female', 
    label: 'Female', 
    icon: <User className="h-6 w-6 text-pink-500" />,
    description: 'Identify as female'
  },
  { 
    value: 'non-binary', 
    label: 'Non-Binary', 
    icon: <User className="h-6 w-6 text-purple-500" />,
    description: 'Identify as non-binary'
  },
  { 
    value: 'transgender', 
    label: 'Transgender', 
    icon: <User className="h-6 w-6 text-indigo-500" />,
    description: 'Identify as transgender'
  },
  { 
    value: 'genderqueer', 
    label: 'Genderqueer', 
    icon: <User className="h-6 w-6 text-green-500" />,
    description: 'Identify as genderqueer'
  },
  { 
    value: 'gender-fluid', 
    label: 'Gender-fluid', 
    icon: <User className="h-6 w-6 text-teal-500" />,
    description: 'Identify as gender-fluid'
  },
  { 
    value: 'other', 
    label: 'Other', 
    icon: <User className="h-6 w-6 text-amber-500" />,
    description: 'Prefer a different identity'
  },
  { 
    value: 'any', 
    label: 'Prefer not to say', 
    icon: <UserRound className="h-6 w-6 text-gray-500" />,
    description: 'Keep gender private'
  }
];

export default function ProfileSettings({ isOpen, onClose, userId, initialGender }: ProfileSettingsProps) {
  const [gender, setGender] = useState<GenderOption>(initialGender as GenderOption || 'any');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  
  // Reset form when modal opens with initial preferences
  useEffect(() => {
    if (isOpen) {
      setGender(initialGender as GenderOption || 'any');
      setSaving(false);
    }
  }, [isOpen, initialGender]);
  
  const handleSave = async () => {
    setSaving(true);
    
    try {
      const response = await apiRequest('POST', '/api/user/update-profile', {
        userId,
        gender
      });
      
      if (response.ok) {
        toast({
          title: 'Profile Updated',
          description: 'Your profile settings have been saved successfully.',
        });
        onClose();
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'There was an error updating your profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-gray-900 rounded-xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-700"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-gray-800 flex justify-between items-center bg-gradient-to-r from-gray-800 to-gray-900">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-primary/20 rounded-full">
                    <UserRound className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium text-white">Profile Settings</h3>
                </div>
                
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-gray-400 hover:text-white rounded-full p-1 transition-colors"
                  onClick={onClose}
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>
              
              <div className="p-5">
                <form id="profileForm" onSubmit={(e) => {
                  e.preventDefault();
                  handleSave();
                }}>
                  {/* Gender Selection */}
                  <div className="mb-6">
                    <div className="flex items-center mb-3">
                      <UserRound className="h-4 w-4 text-primary mr-2" />
                      <Label className="text-white font-medium">I identify as:</Label>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                      {genderOptions.map((option) => (
                        <motion.div
                          key={option.value}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={`
                            p-3 rounded-lg flex items-center cursor-pointer transition-all border
                            ${gender === option.value 
                              ? 'bg-primary/10 border-primary/30 shadow-sm shadow-primary/10' 
                              : 'bg-gray-800/70 border-gray-700 hover:border-gray-600'}
                          `}
                          onClick={() => setGender(option.value)}
                        >
                          <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center mr-3 
                            ${gender === option.value ? 'bg-primary/10' : 'bg-gray-800'}
                          `}>
                            {option.icon}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-white">{option.label}</div>
                            <div className="text-xs text-gray-400">{option.description}</div>
                          </div>
                          <div className={`
                            w-5 h-5 rounded-full border-2 flex-shrink-0
                            ${gender === option.value 
                              ? 'border-primary bg-primary/30' 
                              : 'border-gray-600'}
                          `}>
                            {gender === option.value && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-full h-full rounded-full bg-primary scale-50"
                              />
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      type="submit" 
                      className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-lg transition-all shadow-lg relative"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span className="opacity-0">Save Profile</span>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        </>
                      ) : (
                        <>Save Profile</>
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      className="flex-shrink-0 border-gray-700 hover:bg-gray-800 text-gray-300"
                      onClick={onClose}
                    >
                      Cancel
                    </Button>
                  </div>
                  
                </form>
              </div>
            </motion.div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}