import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Users, Shield, Sliders, Play, Lock, Globe, Check, Video, Camera, Mic } from 'lucide-react';

interface WelcomeScreenProps {
  onStartChat: () => void;
  onShowFilters: () => void;
  onToggleVideoChat?: (useVideo: boolean) => void;
}

export default function WelcomeScreen({ onStartChat, onShowFilters, onToggleVideoChat }: WelcomeScreenProps) {
  const [activeUsers] = useState(Math.floor(Math.random() * 200) + 150); // Mock user count between 150-350
  const [chatType, setChatType] = useState<'text' | 'video'>('text');
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center py-6 sm:py-8 px-4 relative overflow-hidden">
      {/* Simple, more performant background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Static glow orbs for better performance */}
        <div className="fixed top-1/4 left-1/4 w-80 h-80 bg-primary rounded-full blur-[120px] opacity-20"></div>
        <div className="fixed bottom-1/4 right-1/4 w-80 h-80 bg-blue-600 rounded-full blur-[120px] opacity-20"></div>
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/50 to-gray-900/80"></div>
        
        {/* Simple grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] opacity-40"></div>
      </div>
      
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8 relative z-10"
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
      
      {/* Trust badges with modern glass design */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="grid grid-cols-3 gap-3 max-w-lg mb-8"
      >
        <motion.div 
          whileHover={{ y: -5, scale: 1.03 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="flex flex-col items-center backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 p-4 rounded-2xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-indigo-600/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full mb-3 shadow-lg relative z-10">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-sm font-medium text-white relative z-10">AI Moderated</span>
          <span className="text-xs text-white/70 mt-1 text-center relative z-10">Real-time content safety</span>
        </motion.div>
        
        <motion.div 
          whileHover={{ y: -5, scale: 1.03 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="flex flex-col items-center backdrop-blur-xl bg-gradient-to-br from-indigo-500/10 to-blue-500/10 p-4 rounded-2xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="p-3 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-full mb-3 shadow-lg relative z-10">
            <Lock className="h-5 w-5 text-white" />
          </div>
          <span className="text-sm font-medium text-white relative z-10">Anonymous</span>
          <span className="text-xs text-white/70 mt-1 text-center relative z-10">Privacy guaranteed</span>
        </motion.div>
        
        <motion.div 
          whileHover={{ y: -5, scale: 1.03 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="flex flex-col items-center backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-4 rounded-2xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-cyan-600/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="p-3 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full mb-3 shadow-lg relative z-10">
            <Globe className="h-5 w-5 text-white" />
          </div>
          <span className="text-sm font-medium text-white relative z-10">Global</span>
          <span className="text-xs text-white/70 mt-1 text-center relative z-10">Connect worldwide</span>
        </motion.div>
      </motion.div>
      
      {/* Chat type selector with premium glass morphism */}
      <motion.div 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="max-w-md w-full backdrop-blur-xl bg-white/5 p-3 rounded-2xl border border-white/10 shadow-lg mb-8"
      >
        <h3 className="text-sm text-white/80 font-medium mb-3 text-center">Choose your chat mode</h3>
        <div className="grid grid-cols-2 gap-4 relative">
          <div className={`absolute inset-y-0 ${chatType === 'text' ? 'left-0' : 'right-0'} w-1/2 bg-gradient-to-r ${
            chatType === 'text' 
              ? 'from-purple-600 to-indigo-600' 
              : 'from-blue-600 to-cyan-600'
          } rounded-xl transition-all duration-300 shadow-lg`} style={{ zIndex: 0 }}></div>
          
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setChatType('text');
              if (onToggleVideoChat) onToggleVideoChat(false);
            }}
            className={`relative z-10 flex flex-col items-center justify-center py-4 px-3 rounded-xl transition-all duration-300 ${
              chatType === 'text' 
                ? 'text-white' 
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            <div className={`p-3 ${chatType === 'text' ? 'bg-white/20' : 'bg-white/5'} rounded-full mb-2 transition-all duration-300`}>
              <MessageSquare className="h-6 w-6" />
            </div>
            <span className="font-medium">Text Chat</span>
            {chatType === 'text' && (
              <span className="text-xs mt-1 opacity-80">Private, text-only messaging</span>
            )}
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setChatType('video');
              if (onToggleVideoChat) onToggleVideoChat(true);
            }}
            className={`relative z-10 flex flex-col items-center justify-center py-4 px-3 rounded-xl transition-all duration-300 ${
              chatType === 'video' 
                ? 'text-white' 
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            <div className={`p-3 ${chatType === 'video' ? 'bg-white/20' : 'bg-white/5'} rounded-full mb-2 transition-all duration-300`}>
              <Video className="h-6 w-6" />
            </div>
            <span className="font-medium">Video Chat</span>
            {chatType === 'video' && (
              <span className="text-xs mt-1 opacity-80">Face-to-face communication</span>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Action buttons with enhanced, more prominent styling */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="flex mt-4 w-full max-w-md"
      >
        {/* Label above button */}
        <div className="w-full">
          {/* Online users counter */}
          <div className="flex items-center justify-center mb-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2"></div>
            <span className="text-sm text-green-400 font-medium">{activeUsers} people online now</span>
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(124,58,237,0.8)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (onToggleVideoChat) onToggleVideoChat(chatType === 'video');
              onStartChat();
            }}
            className={`relative group overflow-hidden text-white font-medium py-5 px-8 rounded-2xl transition-all flex items-center justify-center shadow-xl w-full ${
              chatType === 'video' 
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 border-2 border-blue-500/30' 
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 border-2 border-indigo-500/30'
            }`}
          >
            {/* Enhanced animated glow effect */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/30 to-white/0 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700"></div>
            
            {/* Outer glow */}
            <div className="absolute -inset-0.5 rounded-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-300 blur-md" 
                style={{ 
                  background: chatType === 'video' 
                    ? 'linear-gradient(to right, rgba(37, 99, 235, 0.5), rgba(6, 182, 212, 0.5))' 
                    : 'linear-gradient(to right, rgba(124, 58, 237, 0.5), rgba(79, 70, 229, 0.5))' 
                }}>
            </div>
            
            <div className="flex items-center relative z-10">
              <div className={`rounded-full p-3 mr-4 ${
                chatType === 'video' 
                  ? 'bg-blue-500' 
                  : 'bg-purple-600'
              }`}>
                <Play className="h-6 w-6" />
              </div>
              <div className="flex flex-col items-start">
                <span className="font-bold text-xl">Start Chat</span>
                <span className="text-sm opacity-90">{chatType === 'video' ? 'Face-to-face' : 'Text messaging'}</span>
              </div>
            </div>
          </motion.button>
          
          {/* Safety note underneath */}
          <p className="text-xs text-center text-gray-400 mt-3">
            <Shield className="inline-block h-3 w-3 mr-1 text-green-400" />
            Safe, anonymous, and AI-moderated. No personal data collected.
          </p>
        </div>
      </motion.div>
      
      {/* Testimonials with glass morphism */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-16 max-w-md w-full"
      >
        <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center justify-center">
          <Users className="h-4 w-4 mr-2 text-purple-400" />
          COMMUNITY VOICES
        </h3>
        
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-5 border border-white/10 shadow-lg relative">
          {/* Decorative element */}
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full text-white text-xs font-medium">
            <span>Featured Review</span>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg border-2 border-white/20">
              <span className="text-white text-base font-bold">M</span>
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-base font-medium text-white">Michael</h4>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              
              <p className="text-sm text-white/90 leading-relaxed mb-3">
                "I've made so many interesting connections here. The anonymous format makes conversations more genuine and the video chat feature is incredible!"
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-1 bg-green-500/20 rounded-full mr-2">
                    <Check className="h-3 w-3 text-green-400" />
                  </div>
                  <span className="text-xs text-white/70">Verified user</span>
                </div>
                <span className="text-xs text-white/50">2 days ago</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
