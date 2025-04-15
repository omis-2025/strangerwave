import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Globe, Shield, X } from 'lucide-react';

interface ConnectingScreenProps {
  onCancel: () => void;
}

// Random country names for animation
const countries = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 
  'Germany', 'France', 'Spain', 'Italy', 'Japan', 'Brazil', 
  'Mexico', 'India', 'China', 'South Korea', 'Russia'
];

export default function ConnectingScreen({ onCancel }: ConnectingScreenProps) {
  const [searchingCountry, setSearchingCountry] = useState('');
  const [userCount] = useState(Math.floor(Math.random() * 200) + 150);
  
  // Simulate searching through different countries
  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * countries.length);
      setSearchingCountry(countries[randomIndex]);
    }, 1500);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative text-center mb-10"
      >
        <div className="relative">
          {/* Animated glow effect behind spinner */}
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl transform scale-125"></div>
          
          <div className="relative w-24 h-24 mx-auto">
            {/* Main spinner */}
            <motion.div 
              className="w-24 h-24 border-4 border-primary border-t-transparent rounded-full absolute inset-0"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            ></motion.div>
            
            {/* Secondary spinner */}
            <motion.div 
              className="w-16 h-16 border-4 border-blue-400 border-b-transparent rounded-full absolute inset-0 m-auto"
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            ></motion.div>
            
            {/* Center icon */}
            <div className="absolute inset-0 m-auto flex items-center justify-center z-10">
              <Search className="h-8 w-8 text-primary" />
            </div>
            
            {/* Orbiting user dot */}
            <motion.div
              className="absolute"
              style={{ width: 10, height: 10 }}
              animate={{
                x: [0, 30, 0, -30, 0],
                y: [30, 0, -30, 0, 30],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </motion.div>
          </div>
        </div>
        
        <motion.h2 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl sm:text-2xl font-bold text-white mt-8 mb-2"
        >
          Finding someone to chat with...
        </motion.h2>
        
        <motion.p 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-300 mb-1"
        >
          This might take a moment
        </motion.p>
        
        {searchingCountry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center text-sm text-gray-400 mt-2"
          >
            <Globe className="h-3 w-3 mr-1 text-primary" />
            <span>Searching in {searchingCountry}...</span>
          </motion.div>
        )}
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center mt-2 bg-gray-800/50 rounded-full px-3 py-1"
        >
          <Users className="h-3 w-3 mr-1 text-blue-400" />
          <span className="text-xs text-gray-300">{userCount} users online now</span>
        </motion.div>
      </motion.div>
      
      {/* Trust elements */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex space-x-3 mb-6 text-xs text-gray-400"
      >
        <div className="flex items-center">
          <Shield className="h-3 w-3 mr-1 text-green-500" />
          <span>AI moderated</span>
        </div>
        <span>•</span>
        <div className="flex items-center">
          <Users className="h-3 w-3 mr-1 text-blue-500" />
          <span>Smart matching</span>
        </div>
      </motion.div>
      
      <motion.button 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onCancel}
        className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-lg transition-all flex items-center"
      >
        <X className="h-4 w-4 mr-1" />
        Cancel
      </motion.button>
    </div>
  );
}
