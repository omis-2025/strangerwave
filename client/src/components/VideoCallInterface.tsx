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
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-blue-900 bg-gradient-to-b from-blue-800 to-blue-950">
      <div className="flex flex-1 overflow-hidden p-4">
        <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-4 rounded-xl overflow-hidden shadow-2xl">
          {/* Main video content */}
          <div className="flex-1 flex flex-col lg:flex-row">
            {/* Main video stream (left side) */}
            <div className="flex-1 relative rounded-xl overflow-hidden mb-4 lg:mb-0 bg-white">
              <div className="w-full h-full bg-gradient-to-r from-rose-100 to-indigo-100 flex items-center justify-center relative overflow-hidden rounded-xl">
                {/* Partner video stream */}
                <div className="absolute inset-0 rounded-xl overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-r from-gray-800 to-gray-900 flex items-center justify-center">
                    <div className="text-gray-400 flex flex-col items-center">
                      <Video className="h-20 w-20 mb-4 text-blue-300" />
                      <p className="text-white text-xl">Connecting to partner...</p>
                    </div>
                  </div>
                </div>

                {/* Self-view (small overlay) */}
                <div className="absolute bottom-4 right-4 w-1/4 max-w-[180px] aspect-video rounded-xl overflow-hidden border-2 border-white shadow-xl z-10">
                  <div className="w-full h-full bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center">
                    <Camera className="h-10 w-10 text-blue-200" />
                  </div>
                </div>
              </div>
            </div>

            {/* Chat area (right side) */}
            <div className="w-full lg:w-80 bg-white rounded-xl flex flex-col overflow-hidden">
              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-100">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`rounded-xl px-4 py-2 max-w-[85%] break-words shadow-md ${
                        message.sender === 'me' 
                          ? 'bg-blue-600 text-white ml-auto rounded-br-none' 
                          : 'bg-white text-gray-800 mr-auto rounded-bl-none border border-gray-200'
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className="text-xs opacity-70 mt-1 text-right">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Chat input */}
              <div className="p-3 border-t border-gray-200 bg-white">
                <div className="relative">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Escribe tu mensaje"
                    className="w-full bg-gray-100 text-gray-800 rounded-full py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200"
                  />
                  <button 
                    onClick={handleSendMessage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-blue-600 rounded-full text-white shadow-md"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Controls bar at bottom */}
      <div className="flex justify-center items-center py-4 space-x-4">
        <button 
          onClick={() => setMicEnabled(!micEnabled)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg ${
            micEnabled ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-500 hover:bg-red-600'
          }`}
        >
          {micEnabled ? <Mic className="h-6 w-6 text-white" /> : <MicOff className="h-6 w-6 text-white" />}
        </button>
        
        <button 
          onClick={onDisconnect}
          className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg"
        >
          <Phone className="h-7 w-7 text-white transform rotate-135" />
        </button>
        
        <button 
          onClick={() => setVideoEnabled(!videoEnabled)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg ${
            videoEnabled ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-500 hover:bg-red-600'
          }`}
        >
          {videoEnabled ? <Video className="h-6 w-6 text-white" /> : <VideoOff className="h-6 w-6 text-white" />}
        </button>
      </div>
    </div>
  );
}