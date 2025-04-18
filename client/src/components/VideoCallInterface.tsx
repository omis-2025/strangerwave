import React, { useState, useEffect, useRef } from 'react';
import { Send, Video, Mic, MicOff, VideoOff, Phone, Camera, SkipForward, User, Shield, X, UserRound, Globe, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import webRTC from '@/lib/mobileWebRTC';
import { ResponsiveContainer, FlexContainer } from '@/components/ui/responsive-container';
import PermissionErrorModal from './PermissionErrorModal';
import ConnectionStatusToast from './ConnectionStatusToast';
import CountryDisplay from './CountryDisplay';
import TranslationTooltip from './TranslationTooltip';
import TranslationShimmer from './TranslationShimmer';

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
  const [isInputRTL, setIsInputRTL] = useState(false);
  const [translatingMessages, setTranslatingMessages] = useState<{[key: string]: boolean}>({});
  const [showTranslationPref, setShowTranslationPref] = useState(true); // Default to showing translations
  
  // Media stream refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  // Reference to store the local media stream to prevent it from being lost between matches
  const localMediaStreamRef = useRef<MediaStream | null>(null);
  
  // Connection and permission states
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [permissionErrorType, setPermissionErrorType] = useState<'camera' | 'microphone' | 'both' | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [remoteCameraActive, setRemoteCameraActive] = useState(false);
  
  // UI state - never hide controls on mobile
  const [hideControls, setHideControls] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<'video' | 'chat'>('video'); // For mobile tab navigation
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting' | 'partner-left' | null>(null);
  
  // Check if device is mobile for better UI handling
  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
      
      // On mobile, make sure controls are always visible
      if (mobile) {
        setHideControls(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Flag animation state for new match
  const [showFlagAnimation, setShowFlagAnimation] = useState(false);
  
  // Initialize WebRTC and handle permissions
  useEffect(() => {
    console.log(`Initializing WebRTC - video: ${videoEnabled}, audio: ${micEnabled}, mobile: ${isMobile}`);
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
        setConnectionStatus('connected');
        setTimeout(() => setConnectionStatus(null), 3000); // Hide after 3 seconds
        
        // When connected, ensure the local video stream is reattached if needed
        if (localMediaStreamRef.current && localVideoRef.current) {
          if (localVideoRef.current.srcObject !== localMediaStreamRef.current) {
            console.log('Reattaching local stream to video element after connection state change');
            localVideoRef.current.srcObject = localMediaStreamRef.current;
            
            // Make sure video autoplays
            try {
              const playPromise = localVideoRef.current.play();
              if (playPromise !== undefined) {
                playPromise.catch(error => {
                  console.warn('Auto-play was prevented for local video after reconnection:', error);
                });
              }
            } catch (playError) {
              console.warn('Error playing local video after reconnection:', playError);
            }
          }
        }
      } else if (state === 'disconnected') {
        setConnectionStatus('disconnected');
      } else if (state === 'failed' || state === 'closed') {
        setConnectionStatus('partner-left');
        setConnectionError('Connection lost. Please try again.');
      } else if (state === 'connecting') {
        setConnectionStatus('reconnecting');
      }
    });
    
    // Set up remote stream handler - add better error handling
    webRTC.onTrack((stream) => {
      console.log('Received remote track:', stream);
      
      if (remoteVideoRef.current) {
        try {
          remoteVideoRef.current.srcObject = stream;
          setRemoteCameraActive(true);
          
          // Add safeguard in case video doesn't play
          const playPromise = remoteVideoRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.warn('Auto-play was prevented for remote video:', error);
              // Add a manual play button or retry logic here if needed
            });
          }
        } catch (err) {
          console.error('Error attaching remote stream:', err);
        }
      } else {
        console.warn('Remote video ref is not available');
      }
    });
    
    // Initialize the media stream with better error handling
    const initializeMedia = async () => {
      let retryCount = 0;
      const maxRetries = 3;
      
      const attemptInitialize = async () => {
        try {
          console.log(`Attempting to get local stream (attempt ${retryCount + 1}/${maxRetries})`);
          const localStream = await webRTC.getLocalStream(videoEnabled, micEnabled);
          
          // Store a reference to the local stream
          localMediaStreamRef.current = localStream;
          
          // Attach local stream to video element
          if (localVideoRef.current && localStream) {
            console.log('Attaching local stream to video element');
            localVideoRef.current.srcObject = localStream;
            
            // Make sure autoplay works properly on mobile
            if (isMobile) {
              try {
                const playPromise = localVideoRef.current.play();
                if (playPromise !== undefined) {
                  playPromise.catch(error => {
                    console.warn('Auto-play was prevented for local video:', error);
                  });
                }
              } catch (playError) {
                console.warn('Error playing local video:', playError);
              }
            }
          } else {
            console.warn('Local video ref is not available or stream is null');
          }
          
          setIsConnecting(false);
        } catch (error) {
          console.error(`Failed to get local media stream (attempt ${retryCount + 1}/${maxRetries}):`, error);
          
          if (retryCount < maxRetries - 1) {
            retryCount++;
            console.log(`Retrying in 1 second... (${retryCount}/${maxRetries - 1})`);
            setTimeout(attemptInitialize, 1000);
          } else {
            setConnectionError('Could not access camera or microphone. Please check your device settings and permissions.');
          }
        }
      };
      
      await attemptInitialize();
    };
    
    initializeMedia();
    
    // Clean up when component unmounts
    return () => {
      console.log('Cleaning up WebRTC resources');
      
      // Save a reference to our local media stream before we close the connection
      const savedStream = localMediaStreamRef.current;
      
      // Here's the trick: we're going to manually save the tracks before closing
      const savedTracks = savedStream?.getTracks() || [];
      
      // Close the WebRTC connection - this normally stops all tracks
      webRTC.close();
      
      // But we don't want the tracks to be completely stopped when finding a new match
      // So we only stop the tracks if component is truly unmounting (not just disconnecting)
      if (window.onbeforeunload) {
        console.log('Page is unloading, stopping all media tracks');
        savedTracks.forEach(track => track.stop());
      } else {
        console.log('Preserving media tracks for potential reconnection');
      }
    };
  }, [videoEnabled, micEnabled, isMobile]);

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
  
  // Trigger flag animation when connection is established
  useEffect(() => {
    if (connectionStatus === 'connected') {
      setShowFlagAnimation(true);
      
      // Reset flag animation after it plays
      const timer = setTimeout(() => {
        setShowFlagAnimation(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [connectionStatus]);
  
  // Simulate messages being translated for demo purposes
  useEffect(() => {
    messages.forEach(message => {
      if (message.sender === 'partner' && !message.translatedContent && !translatingMessages[message.id]) {
        // Mark the message as being translated
        setTranslatingMessages(prev => ({ ...prev, [message.id]: true }));
        
        // Simulate translation completion after 1-2 seconds
        const delay = 1000 + Math.random() * 1000;
        setTimeout(() => {
          setTranslatingMessages(prev => ({ ...prev, [message.id]: false }));
        }, delay);
      }
    });
  }, [messages, translatingMessages]);
  
  return (
    <ResponsiveContainer 
      className="flex flex-col h-full bg-gray-900 relative overflow-hidden" 
      fixOverflow={true}
    >
      {/* Top header/status bar */}
      <div className="bg-gray-900 p-3 border-b border-gray-800 flex justify-between items-center z-10">
        <div className="flex items-center">
          <span className="text-primary font-medium mr-3 sm:mr-6 truncate">StrangerWave</span>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-1 sm:mr-2"></div>
            <span className="text-xs sm:text-sm text-green-500">Connected</span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center">
            <UserRound className="h-3 w-3 mr-1 text-blue-400" />
            <span className="text-xs text-gray-300">9,995 online</span>
          </div>
          <button 
            className="bg-gray-800 hover:bg-gray-700 text-white text-xs font-medium py-1 px-2 sm:px-3 rounded-full flex items-center"
          >
            <Shield className="h-3 w-3 mr-1 text-red-400" />
            <span>Report</span>
          </button>
        </div>
      </div>

      {/* Main content area with mobile-optimized navigation */}
      <div className="relative w-full h-full flex-1 overflow-hidden">
        {/* Mobile tab navigation - only visible on mobile */}
        {isMobile && (
          <div className="absolute top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-800 flex justify-center p-1">
            <div className="inline-flex rounded-lg p-1 bg-gray-800">
              <button
                onClick={() => setActiveTab('video')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'video' 
                    ? 'bg-primary text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
                aria-label="Show video"
              >
                <span className="flex items-center"><Video className="h-4 w-4 mr-2" /> Video</span>
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'chat' 
                    ? 'bg-primary text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
                aria-label="Show chat"
              >
                <span className="flex items-center"><MessageSquare className="h-4 w-4 mr-2" /> Chat</span>
              </button>
            </div>
          </div>
        )}

        <FlexContainer
          className={`flex-1 w-full overflow-hidden ${isMobile ? 'pt-12' : ''}`}
          direction={{ 
            mobile: "column",
            tablet: "row",
            desktop: "row"
          }}
          fullHeight={true}
        >
          {/* Video panel - conditionally show/hide based on activeTab on mobile */}
          <div 
            className={`w-full md:w-1/2 h-[45vh] md:h-full relative bg-black cursor-pointer ${
              isMobile && activeTab !== 'video' ? 'hidden' : ''
            }`} 
            onClick={() => setHideControls(!hideControls)}
          >
            {/* Video content here */}
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
              {isConnecting ? (
                <div className="text-white">Connecting...</div>
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

            {/* Self-view */}
            <div className="absolute bottom-4 right-4 w-1/4 max-w-[200px] aspect-video rounded-lg overflow-hidden border-2 border-gray-700 bg-gray-800 shadow-lg z-20">
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

            {/* Video controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-gray-900/70 backdrop-blur-lg px-4 py-2 rounded-full shadow-lg z-20 border border-gray-800/30">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setMicEnabled(!micEnabled);
                }}
                className={`rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center ${
                  !micEnabled ? 'bg-red-500/90 text-white' : 'bg-gray-800/80 text-white hover:bg-gray-700/90'
                }`}
              >
                {micEnabled ? <Mic className="h-4 w-4 sm:h-5 sm:w-5" /> : <MicOff className="h-4 w-4 sm:h-5 sm:w-5" />}
              </button>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDisconnect();
                }}
                className="bg-red-500/90 hover:bg-red-600 text-white rounded-full w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center shadow-lg shadow-red-500/20 ring-2 ring-red-500/50"
                aria-label="End call and disconnect"
              >
                <Phone className="h-5 w-5 sm:h-6 sm:w-6 transform rotate-135" />
              </button>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setVideoEnabled(!videoEnabled);
                }}
                className={`rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center ${
                  !videoEnabled ? 'bg-red-500/90 text-white' : 'bg-gray-800/80 text-white hover:bg-gray-700/90'
                }`}
                aria-label={videoEnabled ? "Turn camera off" : "Turn camera on"}
              >
                {videoEnabled ? <Video className="h-4 w-4 sm:h-5 sm:w-5" /> : <VideoOff className="h-4 w-4 sm:h-5 sm:w-5" />}
              </button>
            </div>
          </div>

          {/* Chat panel - conditionally show/hide based on activeTab on mobile */}
          <div 
            className={`w-full md:w-1/2 flex flex-col bg-gray-900 border-l border-gray-800 h-[50vh] md:h-full ${
              isMobile && activeTab !== 'chat' ? 'hidden' : ''
            }`}
          >
            {/* Chat header */}
            <div className="p-2 sm:p-3 border-b border-gray-800 flex justify-between items-center">
              <div className="flex items-center">
                <h3 className="text-sm font-medium text-white mr-2">Messages</h3>
              </div>
              <button
                onClick={onFindNext}
                className="bg-gray-800 hover:bg-gray-700 text-white text-xs font-medium py-1 px-3 rounded-full flex items-center"
              >
                <SkipForward className="h-3 w-3 mr-1" />
                <span>Find Next</span>
              </button>
            </div>
            
            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(message => (
                <div 
                  key={message.id} 
                  className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.sender === 'me' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-gray-800 text-gray-100'
                    }`}
                  >
                    <p>{message.content}</p>
                    {message.translatedContent && (
                      <p className="text-sm mt-1 opacity-80">{message.translatedContent}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Chat input */}
            <div className="p-3 border-t border-gray-800">
              <div className="flex items-center">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type a message..."
                  className="w-full bg-gray-800 text-white rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="ml-2 bg-primary hover:bg-primary/90 text-white rounded-full w-10 h-10 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </FlexContainer>
      </div>
      
      {/* Connection error message */}
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
      
      {/* Connection status toast */}
      <ConnectionStatusToast 
        status={connectionStatus} 
        onClose={() => setConnectionStatus(null)}
      />
    </ResponsiveContainer>
  );
}