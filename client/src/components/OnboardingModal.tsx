import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Video, MessageSquare, Users, Shield, Camera, Mic, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingModalProps {
  onClose: () => void;
}

export default function OnboardingModal({ onClose }: OnboardingModalProps) {
  const [step, setStep] = useState(0);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  
  useEffect(() => {
    // Check if user has already seen the onboarding
    const onboardingSeen = localStorage.getItem('hasSeenOnboarding');
    if (onboardingSeen) {
      setHasSeenOnboarding(true);
      onClose();
    }
  }, [onClose]);
  
  const steps = [
    {
      title: "Welcome to StrangerChat!",
      description: "Connect with people from around the world through text and video chat.",
      icon: <Users className="h-10 w-10 text-primary" />,
    },
    {
      title: "Text & Video Chat",
      description: "Toggle between text and video chat mode anytime during your conversation.",
      icon: <Video className="h-10 w-10 text-primary" />,
    },
    {
      title: "Privacy First",
      description: "Your identity is always protected. No personal information is shared with other users.",
      icon: <Shield className="h-10 w-10 text-green-500" />,
    },
    {
      title: "Camera Controls",
      description: "Easily toggle your camera and microphone on/off with our intuitive controls.",
      icon: <Camera className="h-10 w-10 text-blue-500" />,
    }
  ];
  
  const finishOnboarding = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    onClose();
  };
  
  if (hasSeenOnboarding) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-900 rounded-xl max-w-md w-full shadow-2xl border border-gray-800 overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800">
          <div className="flex items-center">
            <Info className="h-5 w-5 text-primary mr-2" />
            <h3 className="font-bold text-white">Getting Started</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={finishOnboarding} className="text-gray-400 hover:text-white">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center text-center"
            >
              <div className="bg-gray-800/50 p-5 rounded-full mb-5">
                {steps[step].icon}
              </div>
              
              <h2 className="text-xl font-bold text-white mb-2">
                {steps[step].title}
              </h2>
              
              <p className="text-gray-300 mb-6">
                {steps[step].description}
              </p>
            </motion.div>
          </AnimatePresence>
          
          {/* Steps indicator */}
          <div className="flex justify-center space-x-2 mb-6">
            {steps.map((_, index) => (
              <div 
                key={index}
                className={`h-1.5 rounded-full ${index === step ? 'w-6 bg-primary' : 'w-2 bg-gray-700'}`}
              />
            ))}
          </div>
          
          {/* Navigation buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              disabled={step === 0}
              onClick={() => setStep(step - 1)}
              className={step === 0 ? 'opacity-0' : 'opacity-100'}
            >
              Previous
            </Button>
            
            {step === steps.length - 1 ? (
              <Button onClick={finishOnboarding} className="bg-primary hover:bg-primary/90">
                Get Started
              </Button>
            ) : (
              <Button onClick={() => setStep(step + 1)}>
                Next
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}