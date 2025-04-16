import React, { useState } from 'react';
import { Send, Video, Mic, MicOff, VideoOff, Phone } from 'lucide-react';
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
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-900">
      <div className="flex flex-1 overflow-hidden">
        {/* Main video area */}
        <div className="relative flex-1 flex flex-col">
          {/* Main video stream (partner) */}
          <div className="relative bg-gray-800 w-full h-full rounded-xl overflow-hidden">
            {/* This would be the partner's video stream */}
            <div className="w-full h-full bg-gradient-to-r from-gray-800 to-gray-900 flex items-center justify-center">
              <div className="text-gray-500 flex flex-col items-center">
                <Video className="h-16 w-16 mb-4" />
                <p>Partner video will appear here</p>
              </div>
            </div>
            
            {/* Self-view (small overlay) */}
            <div className="absolute bottom-4 right-4 w-1/4 max-w-[160px] aspect-video rounded-lg overflow-hidden border-2 border-white shadow-lg">
              <div className="w-full h-full bg-gradient-to-r from-gray-700 to-gray-800 flex items-center justify-center">
                <div className="text-gray-500 flex flex-col items-center">
                  <Camera className="h-8 w-8" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Chat sidebar */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col h-full">
          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`rounded-lg px-4 py-2 max-w-[85%] break-words ${
                    message.sender === 'me' 
                      ? 'bg-primary text-white ml-auto rounded-br-none' 
                      : 'bg-gray-700 text-white mr-auto rounded-bl-none'
                  }`}
                >
                  <p>{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Chat input */}
          <div className="p-3 border-t border-gray-700">
            <div className="relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Escribe tu mensaje"
                className="w-full bg-gray-700 text-white rounded-full py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button 
                onClick={handleSendMessage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-primary rounded-full text-white"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Controls bar */}
      <div className="h-16 bg-gray-800 border-t border-gray-700 flex items-center justify-center gap-4 px-4">
        <button 
          onClick={() => setMicEnabled(!micEnabled)}
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            micEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'
          }`}
        >
          {micEnabled ? <Mic className="h-5 w-5 text-white" /> : <MicOff className="h-5 w-5 text-white" />}
        </button>
        
        <button 
          onClick={() => setVideoEnabled(!videoEnabled)}
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            videoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'
          }`}
        >
          {videoEnabled ? <Video className="h-5 w-5 text-white" /> : <VideoOff className="h-5 w-5 text-white" />}
        </button>
        
        <button 
          onClick={onDisconnect}
          className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center"
        >
          <Phone className="h-6 w-6 text-white transform rotate-135" />
        </button>
      </div>
    </div>
  );
}