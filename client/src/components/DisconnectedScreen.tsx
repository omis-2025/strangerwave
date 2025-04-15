import { motion } from 'framer-motion';
import { RefreshCw, Home, MessageSquare, WifiOff, Search } from 'lucide-react';
import { useState, useEffect } from 'react';

interface DisconnectedScreenProps {
  onNewChat: () => void;
  onBackToWelcome: () => void;
}

export default function DisconnectedScreen({ onNewChat, onBackToWelcome }: DisconnectedScreenProps) {
  const [activeUsers] = useState(Math.floor(Math.random() * 200) + 150);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="relative inline-block mb-5">
          <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl transform scale-110"></div>
          <div className="relative bg-gray-800/80 p-5 rounded-full border border-red-500/30">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-2 border-dashed border-red-500/20"
            ></motion.div>
            <WifiOff className="h-12 w-12 sm:h-14 sm:w-14 text-red-500" />
          </div>
        </div>
        
        <motion.h2 
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-2xl sm:text-3xl font-bold text-white mb-2"
        >
          Chat Disconnected
        </motion.h2>
        
        <motion.p 
          initial={{ y: -5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-gray-300 max-w-md mx-auto mb-5"
        >
          Your conversation with the stranger has ended. Ready for a new conversation?
        </motion.p>
        
        {/* User stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm text-gray-400 mt-2 mb-6"
        >
          <div className="flex items-center space-x-1.5 bg-gray-800/50 px-3 py-1.5 rounded-full">
            <MessageSquare className="h-3.5 w-3.5 text-primary" />
            <span>Chat ended after {seconds} seconds</span>
          </div>
          
          <div className="hidden sm:flex items-center">•</div>
          
          <div className="flex items-center space-x-1.5 bg-gray-800/50 px-3 py-1.5 rounded-full">
            <Search className="h-3.5 w-3.5 text-blue-400" />
            <span>{activeUsers} people looking for chats</span>
          </div>
        </motion.div>
      </motion.div>
      
      {/* Action buttons */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="flex flex-col sm:flex-row items-center gap-3"
      >
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNewChat}
          className="bg-primary hover:bg-primary/90 text-white font-medium py-2.5 px-5 rounded-lg transition-all flex items-center shadow-lg shadow-primary/20"
        >
          <RefreshCw className="h-5 w-5 mr-2" />
          Find New Chat
        </motion.button>
        
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBackToWelcome}
          className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2.5 px-5 rounded-lg transition-all flex items-center shadow-lg"
        >
          <Home className="h-5 w-5 mr-2" />
          Back to Home
        </motion.button>
      </motion.div>
      
      {/* More actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-10 p-5 bg-gray-800/50 rounded-xl border border-gray-700 max-w-md"
      >
        <h3 className="text-lg font-semibold text-white mb-3">Chat Tips</h3>
        <ul className="text-left text-sm text-gray-300 space-y-2">
          <li className="flex items-start">
            <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-2 mt-0.5">1</div>
            <span>Start with a friendly greeting to make a good impression</span>
          </li>
          <li className="flex items-start">
            <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-2 mt-0.5">2</div>
            <span>Ask open-ended questions to keep the conversation flowing</span>
          </li>
          <li className="flex items-start">
            <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-2 mt-0.5">3</div>
            <span>Be respectful and follow our community guidelines</span>
          </li>
        </ul>
      </motion.div>
    </div>
  );
}
