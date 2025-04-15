import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Users, Shield, Sliders, Play, Lock, Globe, Check, Video, Camera, Mic } from 'lucide-react';

interface WelcomeScreenProps {
  onStartChat: () => void;
  onShowFilters: () => void;
}

export default function WelcomeScreen({ onStartChat, onShowFilters }: WelcomeScreenProps) {
  const [activeUsers] = useState(Math.floor(Math.random() * 200) + 150); // Mock user count between 150-350
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center py-6 sm:py-8 px-4">
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center justify-center space-x-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
            <div className="relative bg-gray-800/80 p-5 rounded-full border border-primary/30">
              <MessageSquare className="h-12 w-12 sm:h-14 sm:w-14 text-primary" />
            </div>
            
            {/* Active users badge */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="absolute -top-2 -right-2 bg-primary/20 px-2 py-1 rounded-full flex items-center space-x-1 border border-primary/30"
            >
              <Users className="h-3 w-3 text-primary" />
              <span className="text-xs font-medium text-primary">{activeUsers}</span>
            </motion.div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl"></div>
            <div className="relative bg-gray-800/80 p-5 rounded-full border border-blue-500/30">
              <Video className="h-12 w-12 sm:h-14 sm:w-14 text-blue-500" />
            </div>
            
            {/* Camera badge */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="absolute -bottom-2 -left-2 bg-blue-500/20 px-2 py-1 rounded-full flex items-center space-x-1 border border-blue-500/30"
            >
              <Camera className="h-3 w-3 text-blue-500" />
              <Mic className="h-3 w-3 text-blue-500" />
            </motion.div>
          </div>
        </div>
        
        <motion.h2 
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-2xl sm:text-3xl font-bold text-white mt-6 mb-2"
        >
          Text & Video Chat Anonymously
        </motion.h2>
        
        <motion.p 
          initial={{ y: -5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-gray-300 max-w-md mx-auto"
        >
          Connect with random people around the world via text or video chat. Your identity stays completely private.
        </motion.p>
      </motion.div>
      
      {/* Trust badges */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 max-w-md mb-6"
      >
        <div className="flex flex-col items-center bg-gray-800/50 p-3 rounded-lg border border-gray-700">
          <div className="p-1.5 bg-primary/20 rounded-full mb-2">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <span className="text-xs font-medium text-gray-300">Safe & Moderated</span>
        </div>
        
        <div className="flex flex-col items-center bg-gray-800/50 p-3 rounded-lg border border-gray-700">
          <div className="p-1.5 bg-green-500/20 rounded-full mb-2">
            <Lock className="h-4 w-4 text-green-500" />
          </div>
          <span className="text-xs font-medium text-gray-300">100% Anonymous</span>
        </div>
        
        <div className="flex flex-col items-center bg-gray-800/50 p-3 rounded-lg border border-gray-700 col-span-2 sm:col-span-1">
          <div className="p-1.5 bg-blue-500/20 rounded-full mb-2">
            <Globe className="h-4 w-4 text-blue-500" />
          </div>
          <span className="text-xs font-medium text-gray-300">Global Community</span>
        </div>
      </motion.div>
      
      {/* Action buttons */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="flex flex-col sm:flex-row gap-3 mt-4 w-full max-w-md"
      >
        <motion.button 
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStartChat}
          className="bg-primary hover:bg-primary/90 text-white font-medium py-3 px-6 rounded-lg transition-all flex items-center justify-center shadow-lg shadow-primary/20"
        >
          <Play className="h-5 w-5 mr-2" />
          Start Chatting
        </motion.button>
        
        <motion.button 
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={onShowFilters}
          className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-all flex items-center justify-center shadow-lg"
        >
          <Sliders className="h-5 w-5 mr-2" />
          Set Preferences
        </motion.button>
      </motion.div>
      
      {/* Testimonials */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-10 max-w-md w-full"
      >
        <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center justify-center">
          <Users className="h-3 w-3 mr-1" />
          What our users say
        </h3>
        
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">M</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-sm font-medium text-white">Michael</h4>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-300">
                "I've made so many interesting connections here. The anonymous format makes conversations more genuine."
              </p>
              <div className="flex items-center mt-2">
                <Check className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-xs text-gray-400">Verified user</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
