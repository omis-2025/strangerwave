import { useEffect, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input"; 
import { ChatPreferences } from "@/lib/chatService";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sliders, X, Users, Globe, UserCircle2, User, UsersRound, Heart,
  Search, CircleX, Play
} from "lucide-react";
import 'flag-icons/css/flag-icons.min.css';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (preferences: ChatPreferences) => void;
  initialPreferences: ChatPreferences;
}

type GenderOption = 'any' | 'male' | 'female' | 'non-binary' | 'transgender' | 'genderqueer' | 'gender-fluid' | 'other';

// Enhanced countries list with flag codes
const countries = [
  { code: "any", name: "Any Country", flag: null },
  // North America
  { code: "us", name: "United States", flag: "us" },
  { code: "ca", name: "Canada", flag: "ca" },
  { code: "mx", name: "Mexico", flag: "mx" },
  
  // South America
  { code: "ar", name: "Argentina", flag: "ar" },
  { code: "br", name: "Brazil", flag: "br" },
  { code: "cl", name: "Chile", flag: "cl" },
  { code: "co", name: "Colombia", flag: "co" },
  { code: "pe", name: "Peru", flag: "pe" },
  { code: "ve", name: "Venezuela", flag: "ve" },
  
  // Europe
  { code: "gb", name: "United Kingdom", flag: "gb" },
  { code: "de", name: "Germany", flag: "de" },
  { code: "fr", name: "France", flag: "fr" },
  { code: "es", name: "Spain", flag: "es" },
  { code: "it", name: "Italy", flag: "it" },
  { code: "nl", name: "Netherlands", flag: "nl" },
  { code: "pl", name: "Poland", flag: "pl" },
  { code: "pt", name: "Portugal", flag: "pt" },
  { code: "se", name: "Sweden", flag: "se" },
  { code: "no", name: "Norway", flag: "no" },
  { code: "fi", name: "Finland", flag: "fi" },
  { code: "dk", name: "Denmark", flag: "dk" },
  { code: "ie", name: "Ireland", flag: "ie" },
  { code: "ch", name: "Switzerland", flag: "ch" },
  { code: "at", name: "Austria", flag: "at" },
  { code: "be", name: "Belgium", flag: "be" },
  { code: "gr", name: "Greece", flag: "gr" },
  { code: "ru", name: "Russia", flag: "ru" },
  { code: "ua", name: "Ukraine", flag: "ua" },
  { code: "tr", name: "Turkey", flag: "tr" },
  
  // Africa
  { code: "za", name: "South Africa", flag: "za" },
  { code: "ng", name: "Nigeria", flag: "ng" },
  { code: "eg", name: "Egypt", flag: "eg" },
  { code: "ke", name: "Kenya", flag: "ke" },
  { code: "ma", name: "Morocco", flag: "ma" },
  { code: "gh", name: "Ghana", flag: "gh" },
  { code: "et", name: "Ethiopia", flag: "et" },
  
  // Asia
  { code: "cn", name: "China", flag: "cn" },
  { code: "jp", name: "Japan", flag: "jp" },
  { code: "kr", name: "South Korea", flag: "kr" },
  { code: "in", name: "India", flag: "in" },
  { code: "id", name: "Indonesia", flag: "id" },
  { code: "ph", name: "Philippines", flag: "ph" },
  { code: "sg", name: "Singapore", flag: "sg" },
  { code: "my", name: "Malaysia", flag: "my" },
  { code: "th", name: "Thailand", flag: "th" },
  { code: "vn", name: "Vietnam", flag: "vn" },
  { code: "ae", name: "United Arab Emirates", flag: "ae" },
  { code: "sa", name: "Saudi Arabia", flag: "sa" },
  { code: "il", name: "Israel", flag: "il" },
  { code: "pk", name: "Pakistan", flag: "pk" },
  { code: "kz", name: "Kazakhstan", flag: "kz" },
  
  // Oceania
  { code: "au", name: "Australia", flag: "au" },
  { code: "nz", name: "New Zealand", flag: "nz" },
  { code: "fj", name: "Fiji", flag: "fj" },
  { code: "pg", name: "Papua New Guinea", flag: "pg" }
];

interface GenderOptionType {
  value: GenderOption;
  label: string;
  icon: JSX.Element;
  description: string;
}

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

export default function FilterModal({ isOpen, onClose, onSave, initialPreferences }: FilterModalProps) {
  const [preferredGender, setPreferredGender] = useState<GenderOption>(initialPreferences.preferredGender);
  const [country, setCountry] = useState<string | null>(initialPreferences.country);
  const [saving, setSaving] = useState(false);
  const [starting, setStarting] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  
  // Reset form when modal opens with initial preferences
  useEffect(() => {
    if (isOpen) {
      setPreferredGender(initialPreferences.preferredGender);
      setCountry(initialPreferences.country);
      setCountrySearch("");
      setSaving(false);
      setStarting(false);
    }
  }, [isOpen, initialPreferences]);
  
  const handleSave = () => {
    setSaving(true);
    
    // Simulate a slight delay for better UX
    setTimeout(() => {
      onSave({
        preferredGender,
        country
      });
      setSaving(false);
    }, 300);
  };
  
  const handleStartChat = () => {
    setStarting(true);
    
    // Save preferences and close the modal to start chat
    setTimeout(() => {
      onSave({
        preferredGender,
        country
      });
      setStarting(false);
      onClose(); // Close modal to start chat
    }, 300);
  };
  
  const getCurrentCountry = () => {
    const selected = countries.find(c => c.code === (country || "any"));
    return selected || countries[0];
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
                    <Sliders className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium text-white">Chat Preferences</h3>
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
                {/* Info banner */}
                <div className="mb-5 p-3 bg-primary/10 rounded-lg border border-primary/20 flex items-start text-sm">
                  <Heart className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300">
                    Setting specific preferences helps you find better matches and improves your chat experience.
                  </p>
                </div>
                
                <form id="filterForm" onSubmit={(e) => {
                  e.preventDefault();
                  handleSave();
                }}>
                  {/* Gender Preference */}
                  <div className="mb-6">
                    <div className="flex items-center mb-3">
                      <Users className="h-4 w-4 text-primary mr-2" />
                      <Label className="text-white font-medium">I want to chat with:</Label>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                      {genderOptions.map((option) => (
                        <motion.div
                          key={option.value}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={`
                            p-3 rounded-lg flex items-center cursor-pointer transition-all border
                            ${preferredGender === option.value 
                              ? 'bg-primary/10 border-primary/30 shadow-sm shadow-primary/10' 
                              : 'bg-gray-800/70 border-gray-700 hover:border-gray-600'}
                          `}
                          onClick={() => setPreferredGender(option.value)}
                        >
                          <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center mr-3 
                            ${preferredGender === option.value ? 'bg-primary/10' : 'bg-gray-800'}
                          `}>
                            {option.icon}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-white">{option.label}</div>
                            <div className="text-xs text-gray-400">{option.description}</div>
                          </div>
                          <div className={`
                            w-5 h-5 rounded-full border-2 flex-shrink-0
                            ${preferredGender === option.value 
                              ? 'border-primary bg-primary/30' 
                              : 'border-gray-600'}
                          `}>
                            {preferredGender === option.value && (
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
                  
                  {/* Country Selection */}
                  <div className="mb-6">
                    <div className="flex items-center mb-3">
                      <Globe className="h-4 w-4 text-primary mr-2" />
                      <Label htmlFor="country" className="text-white font-medium">
                        Match with people from:
                      </Label>
                    </div>
                    
                    <div className="relative">
                      <Select
                        value={country || "any"}
                        onValueChange={(value) => setCountry(value === "any" ? null : value)}
                      >
                        <SelectTrigger className="w-full bg-gray-800 text-white border-gray-700 py-3 h-auto">
                          <div className="flex items-center space-x-2">
                            {getCurrentCountry().flag && (
                              <span className={`fi fi-${getCurrentCountry().flag} text-base`}></span>
                            )}
                            <SelectValue placeholder="Any Country" />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700 text-white max-h-[300px]">
                          {/* Search Input */}
                          <div className="px-2 pt-1 pb-2 sticky top-0 bg-gray-800 z-10 border-b border-gray-700">
                            <div className="relative">
                              <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                              </div>
                              <input
                                className="pl-8 pr-8 py-2 w-full bg-gray-900 border border-gray-700 rounded-md text-white text-sm"
                                placeholder="Search country..."
                                value={countrySearch}
                                onChange={(e) => setCountrySearch(e.target.value)}
                              />
                              {countrySearch && (
                                <button
                                  type="button"
                                  onClick={() => setCountrySearch("")}
                                  className="absolute inset-y-0 right-2 flex items-center"
                                >
                                  <CircleX className="h-4 w-4 text-gray-400 hover:text-white" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Any Country Option */}
                          <SelectItem 
                            key="any" 
                            value="any"
                            className="focus:bg-primary/20 focus:text-white border-b border-gray-700 mb-2 pb-2"
                          >
                            <div className="flex items-center space-x-2 font-medium">
                              <span className="mr-2 text-lg">🌎</span>
                              <span>Any Country (Worldwide)</span>
                            </div>
                          </SelectItem>
                          
                          {/* North America Section */}
                          <div className="px-2 py-1 text-xs uppercase tracking-wider text-gray-400 font-semibold border-b border-gray-700 mb-1">
                            North America
                          </div>
                          {countries.slice(1, 4).map((country) => (
                            <SelectItem 
                              key={country.code} 
                              value={country.code}
                              className="focus:bg-primary/20 focus:text-white"
                            >
                              <div className="flex items-center space-x-2">
                                {country.flag && (
                                  <span className={`fi fi-${country.flag} text-base mr-2`}></span>
                                )}
                                <span>{country.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                          
                          {/* South America Section */}
                          <div className="px-2 py-1 text-xs uppercase tracking-wider text-gray-400 font-semibold border-b border-gray-700 mt-2 mb-1">
                            South America
                          </div>
                          {countries.slice(4, 10).map((country) => (
                            <SelectItem 
                              key={country.code} 
                              value={country.code}
                              className="focus:bg-primary/20 focus:text-white"
                            >
                              <div className="flex items-center space-x-2">
                                {country.flag && (
                                  <span className={`fi fi-${country.flag} text-base mr-2`}></span>
                                )}
                                <span>{country.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                          
                          {/* Europe Section */}
                          <div className="px-2 py-1 text-xs uppercase tracking-wider text-gray-400 font-semibold border-b border-gray-700 mt-2 mb-1">
                            Europe
                          </div>
                          {countries.slice(10, 30).map((country) => (
                            <SelectItem 
                              key={country.code} 
                              value={country.code}
                              className="focus:bg-primary/20 focus:text-white"
                            >
                              <div className="flex items-center space-x-2">
                                {country.flag && (
                                  <span className={`fi fi-${country.flag} text-base mr-2`}></span>
                                )}
                                <span>{country.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                          
                          {/* Africa Section */}
                          <div className="px-2 py-1 text-xs uppercase tracking-wider text-gray-400 font-semibold border-b border-gray-700 mt-2 mb-1">
                            Africa
                          </div>
                          {countries.slice(30, 37).map((country) => (
                            <SelectItem 
                              key={country.code} 
                              value={country.code}
                              className="focus:bg-primary/20 focus:text-white"
                            >
                              <div className="flex items-center space-x-2">
                                {country.flag && (
                                  <span className={`fi fi-${country.flag} text-base mr-2`}></span>
                                )}
                                <span>{country.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                          
                          {/* Asia Section */}
                          <div className="px-2 py-1 text-xs uppercase tracking-wider text-gray-400 font-semibold border-b border-gray-700 mt-2 mb-1">
                            Asia
                          </div>
                          {countries.slice(37, 52).map((country) => (
                            <SelectItem 
                              key={country.code} 
                              value={country.code}
                              className="focus:bg-primary/20 focus:text-white"
                            >
                              <div className="flex items-center space-x-2">
                                {country.flag && (
                                  <span className={`fi fi-${country.flag} text-base mr-2`}></span>
                                )}
                                <span>{country.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                          
                          {/* Oceania Section */}
                          <div className="px-2 py-1 text-xs uppercase tracking-wider text-gray-400 font-semibold border-b border-gray-700 mt-2 mb-1">
                            Oceania
                          </div>
                          {countries.slice(52).map((country) => (
                            <SelectItem 
                              key={country.code} 
                              value={country.code}
                              className="focus:bg-primary/20 focus:text-white"
                            >
                              <div className="flex items-center space-x-2">
                                {country.flag && (
                                  <span className={`fi fi-${country.flag} text-base mr-2`}></span>
                                )}
                                <span>{country.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Country hint */}
                    <p className="text-xs text-gray-400 mt-2">
                      {country === null 
                        ? "You'll be matched with people from around the world"
                        : `You'll be matched with people from ${getCurrentCountry().name}`
                      }
                    </p>
                  </div>
                  
                  {/* Preview of matches */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-3 bg-gray-800/50 rounded-lg border border-gray-700"
                  >
                    <h4 className="text-sm font-medium text-white mb-2 flex items-center">
                      <Users className="h-3.5 w-3.5 mr-1.5 text-primary" />
                      Match Preview
                    </h4>
                    <div className="flex items-center text-sm text-gray-300">
                      <div className="flex -space-x-2 mr-2">
                        {[1, 2, 3].map((i) => (
                          <div 
                            key={i}
                            className="w-6 h-6 rounded-full bg-gray-700 border-2 border-gray-800 flex items-center justify-center overflow-hidden"
                          >
                            <UserCircle2 className="h-5 w-5 text-gray-500" />
                          </div>
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">
                        {preferredGender === 'any'
                          ? "Matching with all genders"
                          : `Matching with ${genderOptions.find(g => g.value === preferredGender)?.label || preferredGender}`
                        }
                        {country 
                          ? ` from ${getCurrentCountry().name}`
                          : ' worldwide'
                        }
                      </span>
                    </div>
                  </motion.div>
                  
                  <div className="flex flex-col gap-3">
                    {/* Main "Start Chat" button */}
                    <Button 
                      type="button" 
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:bg-gradient-to-r hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-4 h-auto rounded-lg transition-all shadow-lg relative flex items-center justify-center"
                      disabled={starting}
                      onClick={handleStartChat}
                    >
                      {starting ? (
                        <>
                          <span className="opacity-0">Start Chat Now</span>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        </>
                      ) : (
                        <>
                          <Play className="h-5 w-5 mr-2" />
                          Start Chat Now
                        </>
                      )}
                    </Button>
                    
                    {/* Secondary buttons */}
                    <div className="flex gap-3">
                      <Button 
                        type="submit" 
                        className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-lg transition-all shadow-lg relative"
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <span className="opacity-0">Save Preferences</span>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          </>
                        ) : (
                          <>Save Preferences</>
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
                  </div>
                  
                  <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500">
                      You can change these preferences any time
                    </p>
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
