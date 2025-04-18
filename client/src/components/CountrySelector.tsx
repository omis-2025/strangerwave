import { useState, useEffect } from 'react';
import { Globe, Search, ChevronDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define the country interface
interface Country {
  name: string;
  code: string;
  flag: string;
}

interface CountrySelectorProps {
  selectedCountry: Country | null;
  onSelectCountry: (country: Country) => void;
}

// List of most popular countries
const popularCountries: Country[] = [
  { name: 'United States', code: 'us', flag: '🇺🇸' },
  { name: 'United Kingdom', code: 'gb', flag: '🇬🇧' },
  { name: 'Canada', code: 'ca', flag: '🇨🇦' },
  { name: 'Australia', code: 'au', flag: '🇦🇺' },
  { name: 'Germany', code: 'de', flag: '🇩🇪' },
  { name: 'France', code: 'fr', flag: '🇫🇷' },
  { name: 'Spain', code: 'es', flag: '🇪🇸' },
  { name: 'Italy', code: 'it', flag: '🇮🇹' },
  { name: 'Brazil', code: 'br', flag: '🇧🇷' },
  { name: 'Mexico', code: 'mx', flag: '🇲🇽' },
  { name: 'Japan', code: 'jp', flag: '🇯🇵' },
  { name: 'South Korea', code: 'kr', flag: '🇰🇷' },
  { name: 'India', code: 'in', flag: '🇮🇳' },
  { name: 'Russia', code: 'ru', flag: '🇷🇺' },
  { name: 'China', code: 'cn', flag: '🇨🇳' },
  { name: 'South Africa', code: 'za', flag: '🇿🇦' },
  { name: 'Nigeria', code: 'ng', flag: '🇳🇬' },
  { name: 'Argentina', code: 'ar', flag: '🇦🇷' },
  { name: 'Norway', code: 'no', flag: '🇳🇴' },
  { name: 'Sweden', code: 'se', flag: '🇸🇪' },
  { name: 'Finland', code: 'fi', flag: '🇫🇮' },
  { name: 'Denmark', code: 'dk', flag: '🇩🇰' },
  { name: 'Netherlands', code: 'nl', flag: '🇳🇱' },
  { name: 'Belgium', code: 'be', flag: '🇧🇪' },
  { name: 'Switzerland', code: 'ch', flag: '🇨🇭' },
  { name: 'Poland', code: 'pl', flag: '🇵🇱' },
  { name: 'Portugal', code: 'pt', flag: '🇵🇹' },
  { name: 'Ireland', code: 'ie', flag: '🇮🇪' },
  { name: 'New Zealand', code: 'nz', flag: '🇳🇿' },
  { name: 'Singapore', code: 'sg', flag: '🇸🇬' },
  { name: 'Philippines', code: 'ph', flag: '🇵🇭' },
  { name: 'Malaysia', code: 'my', flag: '🇲🇾' },
  { name: 'Thailand', code: 'th', flag: '🇹🇭' },
  { name: 'Indonesia', code: 'id', flag: '🇮🇩' },
  { name: 'Saudi Arabia', code: 'sa', flag: '🇸🇦' },
  { name: 'United Arab Emirates', code: 'ae', flag: '🇦🇪' },
  { name: 'Egypt', code: 'eg', flag: '🇪🇬' },
  { name: 'Turkey', code: 'tr', flag: '🇹🇷' },
  { name: 'Israel', code: 'il', flag: '🇮🇱' },
  { name: 'Any', code: 'any', flag: '🌎' },
];

export default function CountrySelector({ selectedCountry, onSelectCountry }: CountrySelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCountries, setFilteredCountries] = useState(popularCountries);
  const [isOpen, setIsOpen] = useState(false);

  // Filter countries based on search query
  useEffect(() => {
    const filtered = popularCountries.filter(country => 
      country.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCountries(filtered);
  }, [searchQuery]);

  return (
    <div className="relative">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-between border-gray-700 bg-gray-800 hover:bg-gray-700 text-white"
          >
            {selectedCountry ? (
              <div className="flex items-center">
                <span className="mr-2 text-lg">{selectedCountry.flag}</span>
                <span>{selectedCountry.name}</span>
              </div>
            ) : (
              <div className="flex items-center">
                <Globe className="mr-2 h-4 w-4" />
                <span>Choose Country</span>
              </div>
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="w-[300px] p-0 bg-gray-900 border border-gray-700" 
          align="start"
        >
          <div className="p-2 border-b border-gray-800">
            <div className="flex items-center px-3 h-9 bg-gray-800 rounded-md">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 text-gray-400" />
              <Input
                placeholder="Search countries..."
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm text-white placeholder:text-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-[300px] overflow-y-auto py-1">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <DropdownMenuItem
                  key={country.code}
                  className="flex items-center px-3 py-2 cursor-pointer text-white hover:bg-gray-800"
                  onClick={() => {
                    onSelectCountry(country);
                    setIsOpen(false);
                  }}
                >
                  <span className="mr-2 text-lg">{country.flag}</span>
                  <span>{country.name}</span>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="px-3 py-2 text-center text-sm text-gray-400">
                No countries found
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Export the Country interface for use in other components
export type { Country };