import React, { useState } from 'react';
import { Send, Video, Mic, MicOff, VideoOff, Phone, Camera } from 'lucide-react';
import { motion } from 'framer-motion';

interface VideoCallInterfaceProps {
  onDisconnect: () => void;
  onSendMessage: (message: string) => void;
  messages: Array<{
    id: string;
    sender: 'me' | 'partner';
    content: string;
    timestamp: Date;
  }>;
}

export default function VideoCallInterface({
  onDisconnect,
  onSendMessage,
  messages = []
}: VideoCallInterfaceProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  
  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      onSendMessage(inputMessage);
      setInputMessage('');
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute w-96 h-96 rounded-full bg-purple-500 blur-3xl animate-pulse top-1/4 -left-20"></div>
          <div className="absolute w-96 h-96 rounded-full bg-blue-500 blur-3xl animate-pulse bottom-1/4 -right-20"></div>
          <div className="absolute w-80 h-80 rounded-full bg-indigo-500 blur-3xl animate-pulse top-2/3 left-1/3"></div>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden p-4 z-10 relative">
        <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-4">
          {/* Main video content with glass morphism */}
          <div className="flex-1 flex flex-col lg:flex-row gap-4">
            {/* Main video stream (left side) */}
            <div className="flex-1 relative rounded-3xl overflow-hidden mb-4 lg:mb-0 backdrop-blur-lg bg-white/10 border border-white/20 shadow-[0_0_20px_rgba(79,70,229,0.4)]">
              <div className="w-full h-full flex items-center justify-center relative overflow-hidden rounded-3xl">
                {/* Partner video stream */}
                <div className="absolute inset-0 rounded-3xl overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center relative">
                    {/* Static background pattern */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj4KICA8ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgPHBhdGggZmlsbD0iI0ZGRiIgZD0iTTM5LDI0IEwzOSwyMSBMNDIsMjEgTDQyLDE4IEwzNiwxOCBMMzYsMjcgTDM5LDI3IEwzOSwyNCBaIE0yMSwyNyBMMjEsMTggTDE4LDE4IEwxOCwyMSBMMTUsMjEgTDE1LDI0IEwxOCwyNCBMMTgsMjcgTDIxLDI3IFogTTQyLDQyIEw0MiwzOSBMMzksMzkgTDM5LDM2IEwzNiwzNiBMMzYsNDUgTDQyLDQ1IEw0Miw0MiBaIE0yMSw0NSBMMjQsNDUgTDI0LDM5IEwyMSwzOSBMMjEsNDIgTDE4LDQyIEwxOCwzOSBMMTUsMzkgTDE1LDQyIEwxOCw0MiBMMTgsNDUgTDIxLDQ1IFoiLz4KICA8L2c+Cjwvc3ZnPg==')] bg-repeat"></div>
                    </div>
                    <div className="flex flex-col items-center relative">
                      <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center mb-6 animate-pulse shadow-[0_0_20px_rgba(124,58,237,0.7)]">
                        <Video className="h-12 w-12 text-white" />
                      </div>
                      <p className="text-white text-xl font-medium tracking-wider">Connecting to partner...</p>
                      
                      {/* Animated loading indicator */}
                      <div className="flex gap-2 mt-4">
                        {[1, 2, 3].map((i) => (
                          <motion.div 
                            key={i}
                            initial={{ opacity: 0.3 }}
                            animate={{ opacity: 1 }}
                            transition={{ 
                              duration: 0.6, 
                              repeat: Infinity, 
                              repeatType: "reverse",
                              delay: i * 0.2
                            }}
                            className="w-3 h-3 rounded-full bg-white"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Self-view with animated border */}
                <div className="absolute bottom-6 right-6 w-1/4 max-w-[180px] aspect-video rounded-2xl overflow-hidden z-10">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 animate-pulse rounded-2xl"></div>
                  <div className="absolute inset-[2px] rounded-2xl overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-indigo-800 to-purple-900 flex items-center justify-center">
                      <Camera className="h-10 w-10 text-white/80" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat area with premium glass design */}
            <div className="w-full lg:w-96 backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl flex flex-col overflow-hidden shadow-[0_0_20px_rgba(79,70,229,0.4)]">
              {/* Chat header */}
              <div className="px-4 py-3 border-b border-white/10 flex items-center">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  <h3 className="text-white font-medium">Live Chat</h3>
                </div>
              </div>
              
              {/* Chat messages with custom scrollbar */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`rounded-2xl px-4 py-2 max-w-[85%] break-words ${
                        message.sender === 'me' 
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white ml-auto rounded-br-sm' 
                          : 'backdrop-blur-md bg-white/20 text-white mr-auto rounded-bl-sm border border-white/10'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1 text-right">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Chat input with modern styling */}
              <div className="p-3 border-t border-white/10 backdrop-blur-md bg-white/5">
                <div className="relative">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Escribe tu mensaje..."
                    className="w-full bg-white/10 backdrop-blur-md text-white rounded-full py-3 pl-4 pr-12 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-white/50"
                  />
                  <button 
                    onClick={handleSendMessage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full text-white shadow-lg hover:shadow-purple-500/50 transition-all"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Controls bar with floating effect */}
      <div className="relative py-8 z-20">
        <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-auto px-8 py-4 rounded-full backdrop-blur-lg bg-white/10 border border-white/20 shadow-[0_0_30px_rgba(79,70,229,0.5)] flex items-center gap-6">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setMicEnabled(!micEnabled)}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
              micEnabled 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-purple-500/50' 
                : 'bg-gradient-to-r from-red-500 to-pink-500 hover:shadow-red-500/50'
            }`}
          >
            {micEnabled ? <Mic className="h-6 w-6 text-white" /> : <MicOff className="h-6 w-6 text-white" />}
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDisconnect}
            className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-red-500/50 transition-all"
          >
            <Phone className="h-7 w-7 text-white transform rotate-135" />
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setVideoEnabled(!videoEnabled)}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
              videoEnabled 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-purple-500/50' 
                : 'bg-gradient-to-r from-red-500 to-pink-500 hover:shadow-red-500/50'
            }`}
          >
            {videoEnabled ? <Video className="h-6 w-6 text-white" /> : <VideoOff className="h-6 w-6 text-white" />}
          </motion.button>
        </div>
      </div>
    </div>
  );
}