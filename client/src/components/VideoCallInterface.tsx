import React, { useState, useEffect, useRef } from 'react';
import { Send, Video, Mic, MicOff, VideoOff, Phone, Camera, SkipForward, User, Shield, X, UserRound, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import webRTC from '@/lib/mobileWebRTC';
import PermissionErrorModal from './PermissionErrorModal';

interface VideoCallInterfaceProps {
  onDisconnect: () => void;
  onFindNext: () => void; // New prop for skipping to next user
  onSendMessage: (message: string) => void;
  messages: Array<{
    id: string;
    sender: 'me' | 'partner';
    content: string;
    timestamp: Date;
    translatedContent?: string;
    detectedLanguage?: string;
  }>;
  myCountry?: {
    name: string;
    code: string;
    flag: string;
  };
  partnerCountry?: {
    name: string;
    code: string;
    flag: string;
  };
}

export default function VideoCallInterface({
  onDisconnect,
  onFindNext,
  onSendMessage,
  messages = [],
  myCountry = { name: 'United States', code: 'us', flag: 'us' },
  partnerCountry = { name: 'Spain', code: 'es', flag: 'es' }
}: VideoCallInterfaceProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [showOriginalText, setShowOriginalText] = useState<{[key: string]: boolean}>({});
  
  // Media stream refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  // Connection and permission states
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [permissionErrorType, setPermissionErrorType] = useState<'camera' | 'microphone' | 'both' | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [remoteCameraActive, setRemoteCameraActive] = useState(false);
  
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
  
  // Initialize WebRTC and handle permissions
  useEffect(() => {
    setIsConnecting(true);
    
    // Set up permission error callback
    webRTC.onPermissionError((type, error) => {
      console.error(`Permission error for ${type}:`, error);
      
      if (type === 'camera' && !micEnabled) {
        setPermissionErrorType('camera');
      } else if (type === 'microphone' && !videoEnabled) {
        setPermissionErrorType('microphone');
      } else {
        setPermissionErrorType('both');
      }
      
      setShowPermissionModal(true);
    });
    
    // Set up connection state change callback
    webRTC.onConnectionStateChange((state) => {
      console.log(`WebRTC connection state changed to: ${state}`);
      
      if (state === 'connected') {
        setIsConnecting(false);
      } else if (state === 'disconnected' || state === 'failed' || state === 'closed') {
        setConnectionError('Connection lost. Please try again.');
      }
    });
    
    // Initialize the media stream
    const initializeMedia = async () => {
      try {
        const localStream = await webRTC.getLocalStream(videoEnabled, micEnabled);
        
        // Attach local stream to video element
        if (localVideoRef.current && localStream) {
          localVideoRef.current.srcObject = localStream;
        }
        
        setIsConnecting(false);
      } catch (error) {
        console.error('Failed to get local media stream:', error);
        setConnectionError('Could not access camera or microphone. Please check your device settings.');
      }
    };
    
    // Set up remote stream handler
    webRTC.onTrack((stream) => {
      console.log('Received remote track:', stream);
      
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
        setRemoteCameraActive(true);
      }
    });
    
    initializeMedia();
    
    // Clean up when component unmounts
    return () => {
      webRTC.close();
    };
  }, [videoEnabled, micEnabled]);
  
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-900 relative overflow-hidden">
      {/* Top header/status bar */}
      <div className="bg-gray-900 p-3 border-b border-gray-800 flex justify-between items-center z-10">
        <div className="flex items-center">
          <span className="text-primary font-medium mr-6">StrangerWave</span>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
            <span className="text-sm text-green-500">Connected</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <UserRound className="h-3 w-3 mr-1 text-blue-400" />
            <span className="text-xs text-gray-300">9,995 users online</span>
          </div>
          <button 
            className="bg-gray-800 hover:bg-gray-700 text-white text-xs font-medium py-1 px-3 rounded-full flex items-center"
          >
            <Shield className="h-3 w-3 mr-1 text-red-400" />
            Report
          </button>
        </div>
      </div>

      {/* Main content area - split 50/50 on desktop */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left panel - Video takes half the screen on desktop */}
        <div className="w-full md:w-1/2 h-full relative bg-black">
          {/* Country flags display */}
          <div className="absolute top-2 left-0 right-0 flex justify-center items-center z-20">
            <div className="bg-gray-900/80 backdrop-blur-sm px-4 py-2 rounded-full flex items-center space-x-4">
              {/* My country */}
              <div className="flex items-center">
                <span className={`fi fi-${myCountry.flag} text-lg mr-2`}></span>
                <span className="text-white text-sm">{myCountry.name}</span>
              </div>
              
              <div className="text-gray-400">•</div>
              
              {/* Partner country */}
              <div className="flex items-center">
                <span className={`fi fi-${partnerCountry.flag} text-lg mr-2`}></span>
                <span className="text-white text-sm">{partnerCountry.name}</span>
              </div>
            </div>
          </div>
          
          {/* Remote video stream */}
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
            {isConnecting ? (
              <motion.div 
                className="flex flex-col items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 flex flex-col items-center">
                  <div className="flex items-center mb-4">
                    <motion.div 
                      className="h-16 w-16 rounded-full flex items-center justify-center bg-gray-700 relative overflow-hidden"
                      animate={{ 
                        boxShadow: ['0 0 0 0px rgba(124, 58, 237, 0.2)', '0 0 0 8px rgba(124, 58, 237, 0)'],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.5,
                      }}
                    >
                      <span className={`fi fi-${myCountry.flag} text-2xl absolute`}></span>
                    </motion.div>
                    <motion.div
                      className="mx-4 relative"
                      animate={{
                        x: [0, 10, 0],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        ease: "easeInOut",
                      }}
                    >
                      <div className="w-4 h-1 bg-purple-500 rounded-full mx-1"></div>
                      <div className="w-4 h-1 bg-purple-500 rounded-full mt-1 mx-1"></div>
                      <div className="w-4 h-1 bg-purple-500 rounded-full mt-1 mx-1"></div>
                    </motion.div>
                    <motion.div
                      className="h-16 w-16 rounded-full flex items-center justify-center bg-gray-700 relative overflow-hidden"
                      animate={{ 
                        boxShadow: ['0 0 0 0px rgba(124, 58, 237, 0)', '0 0 0 8px rgba(124, 58, 237, 0.2)', '0 0 0 0px rgba(124, 58, 237, 0)'],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        delay: 0.75,
                      }}
                    >
                      <Globe className="h-6 w-6 text-purple-500" />
                    </motion.div>
                  </div>
                  <p className="text-white font-medium mt-2">Finding your match...</p>
                  <p className="text-gray-400 text-sm mt-1">Setting up secure connection</p>
                </div>
              </motion.div>
            ) : !remoteCameraActive ? (
              <div className="flex flex-col items-center">
                <User className="h-20 w-20 text-gray-700 mb-4" />
                <p className="text-gray-400">Waiting for partner's video...</p>
              </div>
            ) : (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="h-full w-full object-cover"
              />
            )}
          </div>

          {/* Self-view (bottom right) */}
          <div className="absolute bottom-4 right-4 w-1/4 max-w-[200px] aspect-video rounded-lg overflow-hidden border-2 border-gray-700 bg-gray-800">
            {videoEnabled ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <div className="flex flex-col items-center justify-center">
                  <VideoOff className="h-8 w-8 text-gray-600" />
                  <p className="text-[10px] text-gray-500 mt-1">Camera off</p>
                </div>
              </div>
            )}
          </div>

          {/* Video controls overlay (bottom center) */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-gray-900/70 backdrop-blur-sm px-4 py-2 rounded-full">
            <button 
              onClick={() => setMicEnabled(!micEnabled)}
              className={`rounded-full w-10 h-10 flex items-center justify-center ${
                !micEnabled ? 'bg-red-500/90 text-white' : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              {micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </button>
            
            <button 
              onClick={onDisconnect}
              className="bg-red-500 hover:bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center"
            >
              <Phone className="h-6 w-6 transform rotate-135" />
            </button>
            
            <button 
              onClick={() => setVideoEnabled(!videoEnabled)}
              className={`rounded-full w-10 h-10 flex items-center justify-center ${
                !videoEnabled ? 'bg-red-500/90 text-white' : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Right panel - Chat area */}
        <div className="w-full md:w-1/2 flex flex-col bg-gray-900 border-l border-gray-800">
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`rounded-lg px-4 py-3 max-w-[80%] ${
                    message.sender === 'me' 
                      ? 'bg-blue-600 text-white ml-auto' 
                      : 'bg-gray-800 text-white mr-auto'
                  }`}
                >
                  {/* Display translated content if available and not showing original */}
                  {message.translatedContent && !showOriginalText[message.id] ? (
                    <div>
                      <p className="text-sm">{message.translatedContent}</p>
                      {message.detectedLanguage && (
                        <p className="text-xs opacity-60 mt-1">
                          Translated from {message.detectedLanguage}
                          <button 
                            onClick={() => setShowOriginalText(prev => ({...prev, [message.id]: true}))}
                            className="ml-2 underline text-blue-300 hover:text-blue-200"
                          >
                            View Original
                          </button>
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm">{message.content}</p>
                      {message.translatedContent && (
                        <p className="text-xs opacity-60 mt-1">
                          <button 
                            onClick={() => setShowOriginalText(prev => ({...prev, [message.id]: false}))}
                            className="underline text-blue-300 hover:text-blue-200"
                          >
                            View Translation
                          </button>
                        </p>
                      )}
                    </div>
                  )}
                  <p className="text-xs opacity-70 mt-1 text-right">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Chat input area */}
          <div className="p-4 border-t border-gray-800 bg-gray-900">
            <div className="relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type a message..."
                className="w-full bg-gray-800 text-white rounded-full py-3 pl-4 pr-12 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button 
                onClick={handleSendMessage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-blue-600 rounded-full text-white"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            
            {/* Action buttons below chat */}
            <div className="mt-4 flex justify-between">
              <button 
                onClick={onDisconnect}
                className="bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium py-2 px-4 rounded-lg flex items-center"
                aria-label="Stop chat and disconnect"
              >
                <X className="h-4 w-4 mr-2" />
                <span className="hidden xs:inline">Disconnect</span>
                <span className="xs:hidden">Stop</span>
              </button>
              
              <button 
                onClick={onFindNext}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg flex items-center"
                aria-label="Skip to next person"
              >
                <SkipForward className="h-4 w-4 mr-2" />
                <span className="hidden xs:inline">Skip to Next</span>
                <span className="xs:hidden">Next</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Error messages */}
      {connectionError && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-xl font-bold text-white mb-2">Connection Error</h3>
            <p className="text-gray-300 mb-4">{connectionError}</p>
            <div className="flex justify-end">
              <button 
                onClick={() => setConnectionError(null)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Permission error modal */}
      <PermissionErrorModal
        type={permissionErrorType || 'both'}
        isOpen={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
      />
    </div>
  );
}