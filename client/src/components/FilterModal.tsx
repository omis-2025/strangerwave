import { useEffect, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChatPreferences } from "@/lib/chatService";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (preferences: ChatPreferences) => void;
  initialPreferences: ChatPreferences;
}

type GenderOption = 'any' | 'male' | 'female';

const countries = [
  { code: "any", name: "Any Country" },
  { code: "us", name: "United States" },
  { code: "ca", name: "Canada" },
  { code: "gb", name: "United Kingdom" },
  { code: "au", name: "Australia" },
  { code: "de", name: "Germany" },
  { code: "fr", name: "France" },
  { code: "es", name: "Spain" },
  { code: "it", name: "Italy" },
  { code: "jp", name: "Japan" },
  { code: "cn", name: "China" },
  { code: "in", name: "India" },
  { code: "br", name: "Brazil" },
  { code: "mx", name: "Mexico" },
];

export default function FilterModal({ isOpen, onClose, onSave, initialPreferences }: FilterModalProps) {
  const [preferredGender, setPreferredGender] = useState<GenderOption>(initialPreferences.preferredGender);
  const [country, setCountry] = useState<string | null>(initialPreferences.country);
  
  // Reset form when modal opens with initial preferences
  useEffect(() => {
    if (isOpen) {
      setPreferredGender(initialPreferences.preferredGender);
      setCountry(initialPreferences.country);
    }
  }, [isOpen, initialPreferences]);
  
  const handleSave = () => {
    onSave({
      preferredGender,
      country
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className={`fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 ${isOpen ? '' : 'hidden'}`}>
        <div className="bg-surface rounded-lg w-full max-w-md mx-4 overflow-hidden">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <h3 className="text-lg font-medium text-text-primary">Chat Preferences</h3>
            <button 
              className="text-text-secondary hover:text-text-primary"
              onClick={onClose}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          
          <div className="p-5">
            <form id="filterForm" onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}>
              {/* Gender Preference */}
              <div className="mb-4">
                <Label className="block text-text-primary mb-2 font-medium">I want to chat with:</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={preferredGender === 'any' ? 'default' : 'outline'}
                    onClick={() => setPreferredGender('any')}
                  >
                    Any
                  </Button>
                  <Button
                    type="button"
                    variant={preferredGender === 'male' ? 'default' : 'outline'}
                    onClick={() => setPreferredGender('male')}
                  >
                    Male
                  </Button>
                  <Button
                    type="button"
                    variant={preferredGender === 'female' ? 'default' : 'outline'}
                    onClick={() => setPreferredGender('female')}
                  >
                    Female
                  </Button>
                </div>
              </div>
              
              {/* Country Selection */}
              <div className="mb-4">
                <Label htmlFor="country" className="block text-text-primary mb-2 font-medium">
                  Country:
                </Label>
                <Select
                  value={country || "any"}
                  onValueChange={(value) => setCountry(value === "any" ? null : value)}
                >
                  <SelectTrigger className="w-full bg-surface-light text-text-primary">
                    <SelectValue placeholder="Any Country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="mt-6">
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-blue-600 text-white font-medium py-3 rounded-lg transition-colors"
                >
                  Save Preferences
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
