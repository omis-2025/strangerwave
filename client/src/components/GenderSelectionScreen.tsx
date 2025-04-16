import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { User, UsersRound, ArrowRight, X, MessageSquare } from "lucide-react";

type GenderOption = 'any' | 'male' | 'female' | 'non-binary' | 'transgender' | 'genderqueer' | 'gender-fluid' | 'other';

interface GenderOptionType {
  value: GenderOption;
  label: string;
  icon: JSX.Element;
  description: string;
}

interface GenderSelectionScreenProps {
  selectedGender: GenderOption;
  onSelectGender: (gender: GenderOption) => void;
  onContinue: () => void;
  onCancel: () => void;
}

export default function GenderSelectionScreen({
  selectedGender,
  onSelectGender,
  onContinue,
  onCancel
}: GenderSelectionScreenProps) {
  
  const genderOptions: GenderOptionType[] = [
    { 
      value: 'any', 
      label: 'Anyone', 
      icon: <UsersRound className="h-6 w-6 text-blue-500" />,
      description: 'Chat with people of any gender'
    },
    { 
      value: 'male', 
      label: 'Males', 
      icon: <User className="h-6 w-6 text-blue-500" />,
      description: 'Chat with males only'
    },
    { 
      value: 'female', 
      label: 'Females', 
      icon: <User className="h-6 w-6 text-pink-500" />,
      description: 'Chat with females only'
    },
    { 
      value: 'non-binary', 
      label: 'Non-Binary', 
      icon: <User className="h-6 w-6 text-purple-500" />,
      description: 'Chat with non-binary people only'
    },
    { 
      value: 'transgender', 
      label: 'Transgender', 
      icon: <User className="h-6 w-6 text-indigo-500" />,
      description: 'Chat with transgender people only'
    },
    { 
      value: 'genderqueer', 
      label: 'Genderqueer', 
      icon: <User className="h-6 w-6 text-green-500" />,
      description: 'Chat with genderqueer people only'
    },
    { 
      value: 'gender-fluid', 
      label: 'Gender-fluid', 
      icon: <User className="h-6 w-6 text-teal-500" />,
      description: 'Chat with gender-fluid people only'
    },
    { 
      value: 'other', 
      label: 'Other', 
      icon: <User className="h-6 w-6 text-amber-500" />,
      description: 'Chat with people of other gender identities'
    }
  ];

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header with title */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center">
          <div className="h-8 w-8 mr-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-semibold text-white">StrangerWave</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-200"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 gap-3">
          {genderOptions.map((option) => (
            <div
              key={option.value}
              className={`
                p-3 rounded-lg flex items-center cursor-pointer border
                ${selectedGender === option.value 
                  ? 'bg-primary/10 border-primary/30' 
                  : 'bg-gray-800/70 border-gray-700'}
              `}
              onClick={() => onSelectGender(option.value)}
            >
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center mr-3 
                ${selectedGender === option.value ? 'bg-primary/10' : 'bg-gray-800'}
              `}>
                {option.icon}
              </div>
              <div className="flex-1">
                <div className="font-medium text-white">{option.label}</div>
                <div className="text-xs text-gray-400">{option.description}</div>
              </div>
              <div className={`
                w-5 h-5 rounded-full border-2 flex-shrink-0
                ${selectedGender === option.value 
                  ? 'border-primary bg-primary/30' 
                  : 'border-gray-600'}
              `}>
                {selectedGender === option.value && (
                  <div className="w-full h-full rounded-full bg-primary scale-50" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Footer with buttons */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex gap-3">
          <Button 
            variant="outline"
            className="flex-1 border-gray-700 hover:bg-gray-800 text-gray-300"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium shadow-lg"
            onClick={onContinue}
            disabled={!selectedGender}
          >
            <span>Continue</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}