import { useState, useEffect, useRef } from "react";
import { Message } from "@/lib/chatService";
import { useAuth } from "@/lib/useAuth";
import mobileWebRTC from "@/lib/mobileWebRTC";
import { TypingIndicator } from "./ui/typing-indicator";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { FlexContainer } from "@/components/ui/responsive-container";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Flag, LogOut, Send, Image, User, Shield, Lock, Info, AlertTriangle, 
  MessageSquare, Video, VideoOff, Mic, MicOff, PhoneOff, SkipForward, RefreshCw, Crown,
  Wifi, WifiOff, FlipHorizontal, CameraIcon
} from "lucide-react";
import { 
  determineOptimalVideoQuality, 
  getVideoConstraints, 
  setupQualityChangeListener,
  getNetworkQualityDescription,
  type VideoQuality
} from "@/lib/videoQualityService";
import { motion, AnimatePresence } from "framer-motion";

interface ChatInterfaceProps {
  messages: Message[];
  partnerId: number | null;
  isPartnerTyping: boolean;
  onSendMessage: (content: string) => void;
  onTyping: (isTyping: boolean) => void;
  onDisconnect: () => void;
  onFindNext?: () => void; // Adding dedicated prop for finding next stranger
  onReport: () => void;
}

export default function ChatInterface({
  messages,
  partnerId,
  isPartnerTyping,
  onSendMessage,
  onTyping,
  onDisconnect,
  onFindNext,
  onReport
}: ChatInterfaceProps) {
  const { user } = useAuth();
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const [viewingOriginalMessages, setViewingOriginalMessages] = useState<Set<number>>(new Set());
  
  // Video chat state
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isMicrophoneMuted, setIsMicrophoneMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isRemoteStreamConnected, setIsRemoteStreamConnected] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  // Video quality states
  const [currentVideoQuality, setCurrentVideoQuality] = useState<VideoQuality>('medium');
  const [networkQuality, setNetworkQuality] = useState<string>('Unknown connection');
  const [isPremiumUser, setIsPremiumUser] = useState<boolean>(false);
  const [isManualQualityMode, setIsManualQualityMode] = useState<boolean>(false);
  const [isBandwidthSavingMode, setIsBandwidthSavingMode] = useState<boolean>(false);
  
  // Get network info on component mount and setup quality listener
  useEffect(() => {
    // For demo purposes, we'll check if the user object has premium status
    // In a real app, this would come from your subscription database
    const userHasPremium = user?.userId === 1 || Math.random() > 0.7;
    setIsPremiumUser(userHasPremium);
    
    // Setup quality change listener
    const cleanupQualityListener = setupQualityChangeListener(
      (quality) => {
        setCurrentVideoQuality(quality);
        setNetworkQuality(getNetworkQualityDescription());
      },
      userHasPremium
    );
    
    return () => {
      cleanupQualityListener();
    };
  }, [user]);

  // Video call functions
  const toggleVideoCall = async (active: boolean) => {
    if (active) {
      try {
        // Determine optimal video quality based on network conditions
        const quality = determineOptimalVideoQuality(isPremiumUser);
        const videoConstraints = getVideoConstraints(quality);
        
        setCurrentVideoQuality(quality);
        setNetworkQuality(getNetworkQualityDescription());
        
        console.log(`Starting video with quality: ${quality}`, videoConstraints);
        
        // Get user media with dynamic constraints
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: videoConstraints, 
          audio: true 
        });
        
        setLocalStream(stream);
        
        // Set local video
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        // Mock remote connection for demo purposes
        // In a real app, this would involve WebRTC connection setup
        setTimeout(() => {
          setIsRemoteStreamConnected(true);
          
          // For demo, just use the same stream
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream;
          }
        }, 2000);
        
        setIsVideoCallActive(true);
        
        // Monitor network quality changes during call
        const cleanupQualityListener = setupQualityChangeListener(
          (newQuality) => {
            if (newQuality !== quality) {
              console.log(`Network conditions changed, quality updated to: ${newQuality}`);
              setCurrentVideoQuality(newQuality);
              setNetworkQuality(getNetworkQualityDescription());
              
              // In a real implementation, we would adjust the stream constraints dynamically
              // This would involve renegotiating the WebRTC connection with new constraints
            }
          },
          isPremiumUser
        );
        
        return () => {
          cleanupQualityListener();
        };
      } catch (error) {
        console.error('Error accessing media devices:', error);
        alert('Could not access camera or microphone. Please check permissions.');
      }
    } else {
      // Stop all tracks
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
      
      setIsVideoCallActive(false);
      setIsRemoteStreamConnected(false);
    }
  };
  
  const toggleMicrophone = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      if (audioTracks.length > 0) {
        const audioEnabled = !isMicrophoneMuted;
        audioTracks[0].enabled = audioEnabled;
        setIsMicrophoneMuted(!audioEnabled);
      }
    }
  };
  
  const toggleCamera = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      if (videoTracks.length > 0) {
        const videoEnabled = !isCameraOff;
        videoTracks[0].enabled = videoEnabled;
        setIsCameraOff(!videoEnabled);
      }
    }
  };
  
  // Switch between front and back cameras (for mobile devices)
  const switchCamera = async () => {
    try {
      console.log('Switching camera...');
      // Use the mobileWebRTC manager to switch cameras
      const newStream = await mobileWebRTC.switchCamera();
      
      if (newStream) {
        // Update the local stream
        setLocalStream(newStream);
        
        // Update the video element
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = newStream;
        }
        
        console.log('Camera switched successfully');
      } else {
        console.error('Failed to switch camera');
      }
    } catch (error) {
      console.error('Error switching camera:', error);
    }
  };
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPartnerTyping]);
  
  // Focus on input when chat loads
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  // For testing translation UI - remove in production
  const sendTestTranslatedMessage = () => {
    // This is just for UI testing - in real implementation messages will come from server with translation info
    const testMessage = {
      id: Date.now(),
      content: "Hello, how are you today?",
      senderId: partnerId || 999,
      timestamp: new Date(),
      isTranslated: true,
      originalContent: "Hola, ¿cómo estás hoy?",
      detectedLanguage: "Spanish"
    };
    
    // Since we don't have a direct onNewMessage prop, simulate receiving the message
    onSendMessage("/test-translation");
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim()) {
      // For testing: if message starts with "/test", send a test translated message
      if (messageInput.startsWith("/test")) {
        sendTestTranslatedMessage();
      } else {
        onSendMessage(messageInput);
      }
      setMessageInput("");
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    onTyping(e.target.value.length > 0);
  };
  
  // Format timestamp for messages
  const formatMessageTime = (timestamp: Date) => {
    const date = new Date(timestamp);
    return format(date, 'h:mm a');
  };
  
  // Toggle viewing original content
  const toggleOriginalContent = (messageId: number) => {
    setViewingOriginalMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };
  
  // Local handler for the "Next" button, fallback if onFindNext isn't provided
  const handleFindNext = () => {
    // If the parent didn't provide an onFindNext handler, use onDisconnect as a fallback
    if (onDisconnect) {
      onDisconnect();
    }
  };
  
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden rounded-lg border border-gray-800 shadow-lg">
      {/* Chat Header */}
      <div className="bg-gray-900 p-2 sm:p-4 flex justify-between items-center border-b border-gray-800">
        <div className="flex items-center">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gray-800 mr-2 sm:mr-3">
            <User className="h-4 w-4 text-gray-400" />
            {/* Online indicator */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                repeat: Infinity, 
                repeatType: "reverse", 
                duration: 2 
              }}
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-gray-800"
            />
          </div>
          <div>
            <div className="flex items-center">
              <span className="font-medium text-gray-200 text-sm sm:text-base">Stranger</span>
              <div className="flex items-center ml-2 px-1.5 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1"></span>
                <span className="text-xs text-green-400">online</span>
              </div>
            </div>
            {isPartnerTyping && (
              <span className="text-gray-400 text-xs flex items-center">
                <TypingIndicator /> typing...
              </span>
            )}
          </div>
        </div>
        <div className="flex">
          {/* Next button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            <Button 
              variant="ghost" 
              size={isMobile ? "sm" : "default"}
              onClick={onFindNext || handleFindNext}
              className="text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 transition-colors mr-1 p-1 sm:p-2"
              title="Skip to next stranger"
            >
              <SkipForward className="h-4 w-4 sm:h-5 sm:w-5" />
              {!isMobile && <span className="ml-1 hidden sm:inline">Skip</span>}
            </Button>
          </motion.div>
          
          {/* Video call button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            <Button 
              variant="ghost" 
              size={isMobile ? "sm" : "default"}
              onClick={() => toggleVideoCall(true)}
              className="text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors mr-1 p-1 sm:p-2"
              title="Start video call"
            >
              <Video className="h-4 w-4 sm:h-5 sm:w-5" />
              {!isMobile && <span className="ml-1 hidden sm:inline">Video</span>}
            </Button>
          </motion.div>
          
          {/* Premium badge (placeholder for monetization) */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            <Button 
              variant="ghost" 
              size={isMobile ? "sm" : "default"}
              onClick={() => alert('Premium features coming soon!')}
              className="text-gray-400 hover:text-yellow-500 hover:bg-yellow-500/10 transition-colors mr-1 p-1 sm:p-2"
              title="Premium Features"
            >
              <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
              {!isMobile && <span className="ml-1 hidden sm:inline">Premium</span>}
            </Button>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            <Button 
              variant="ghost" 
              size={isMobile ? "sm" : "default"}
              onClick={onReport}
              className="text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors mr-1 p-1 sm:p-2"
              title="Report user"
            >
              <Flag className="h-4 w-4 sm:h-5 sm:w-5" />
              {!isMobile && <span className="ml-1 hidden sm:inline">Report</span>}
            </Button>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            <Button 
              variant="ghost" 
              size={isMobile ? "sm" : "default"}
              onClick={onDisconnect}
              className="text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors p-1 sm:p-2"
              title="Stop chatting"
            >
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
              {!isMobile && <span className="ml-1 hidden sm:inline">Stop</span>}
            </Button>
          </motion.div>
        </div>
      </div>
      
      {/* Security badge - provides trust element */}
      <div className="bg-gray-800 py-1 px-2 flex justify-center items-center border-b border-gray-700">
        <div className="flex items-center space-x-1 text-xs text-gray-400 flex-wrap justify-center">
          <Lock className="h-3 w-3 text-primary" />
          <span>End-to-end encrypted</span>
          <span className="text-gray-500">•</span>
          <Shield className="h-3 w-3 text-green-500" />
          <span>AI moderated</span>
          <span className="text-gray-500">•</span>
          <Video className="h-3 w-3 text-blue-500" />
          <span>Video chat</span>
          <span className="text-gray-500">•</span>
          <User className="h-3 w-3 text-yellow-500" />
          <span>Username tags</span>
          <span className="text-gray-500">•</span>
          <Crown className="h-3 w-3 text-yellow-500" />
          <span>Premium filters</span>
        </div>
      </div>
      
      {/* Video Call Modal */}
      {isVideoCallActive && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
          {/* Video call header */}
          <div className="bg-gray-900 p-2 sm:p-4 flex justify-between items-center">
            <div className="flex items-center">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gray-800 mr-2">
                <User className="h-4 w-4 text-gray-400" />
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-gray-800" />
              </div>
              <span className="font-medium text-white">Stranger</span>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => toggleMicrophone()}
                className={`rounded-full aspect-square p-2 ${isMicrophoneMuted ? 'bg-red-500/20 text-red-500' : 'bg-gray-800 text-white'}`}
              >
                {isMicrophoneMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => toggleCamera()}
                className={`rounded-full aspect-square p-2 ${isCameraOff ? 'bg-red-500/20 text-red-500' : 'bg-gray-800 text-white'}`}
              >
                {isCameraOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
              </Button>
              
              {/* Switch camera button for mobile devices */}
              {isMobile && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => switchCamera()}
                  className="rounded-full aspect-square p-2 bg-gray-800 text-white"
                >
                  <FlipHorizontal className="h-5 w-5" />
                </Button>
              )}
              
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => toggleVideoCall(false)}
                className="rounded-full aspect-square p-2"
              >
                <PhoneOff className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Video containers */}
          <div className="flex-1 flex flex-col sm:flex-row p-4 gap-4 relative">
            {/* Remote video (fullscreen) */}
            <div className="flex-1 bg-gray-800 rounded-lg overflow-hidden relative flex items-center justify-center min-h-[300px]">
              {isRemoteStreamConnected ? (
                <>
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Audio level indicators */}
                  <div className="absolute bottom-4 left-4 flex items-center space-x-2 bg-black/40 rounded-full py-1 px-3">
                    <div className="relative h-3 flex items-center space-x-0.5">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <motion.div 
                          key={level}
                          className="w-0.5 bg-green-500 rounded-full"
                          initial={{ height: 3 }}
                          animate={{ 
                            height: Math.random() > 0.5 ? Math.random() * 10 + 3 : 3 
                          }}
                          transition={{ 
                            repeat: Infinity,
                            repeatType: "mirror",
                            duration: 0.2 + (level * 0.1),
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-white">Audio</span>
                  </div>
                  
                  {/* Connection quality indicator */}
                  <div className="absolute top-4 left-4 bg-black/40 rounded-full py-1 px-2 flex items-center">
                    <div className="flex space-x-0.5 mr-1">
                      {/* Dynamic connection bars based on quality */}
                      {currentVideoQuality === 'low' && (
                        <>
                          <div className="w-1 h-3 bg-red-500 rounded-full" />
                          <div className="w-1 h-3 bg-gray-600 rounded-full" />
                          <div className="w-1 h-3 bg-gray-600 rounded-full" />
                          <div className="w-1 h-3 bg-gray-600 rounded-full" />
                        </>
                      )}
                      {currentVideoQuality === 'medium' && (
                        <>
                          <div className="w-1 h-3 bg-yellow-500 rounded-full" />
                          <div className="w-1 h-3 bg-yellow-500 rounded-full" />
                          <div className="w-1 h-3 bg-gray-600 rounded-full" />
                          <div className="w-1 h-3 bg-gray-600 rounded-full" />
                        </>
                      )}
                      {currentVideoQuality === 'high' && (
                        <>
                          <div className="w-1 h-3 bg-green-500 rounded-full" />
                          <div className="w-1 h-3 bg-green-500 rounded-full" />
                          <div className="w-1 h-3 bg-green-500 rounded-full" />
                          <div className="w-1 h-3 bg-gray-600 rounded-full" />
                        </>
                      )}
                      {currentVideoQuality === 'hd' && (
                        <>
                          <div className="w-1 h-3 bg-primary rounded-full" />
                          <div className="w-1 h-3 bg-primary rounded-full" />
                          <div className="w-1 h-3 bg-primary rounded-full" />
                          <div className="w-1 h-3 bg-primary rounded-full" />
                        </>
                      )}
                    </div>
                    <span className="text-xs text-white flex items-center">
                      {currentVideoQuality === 'low' && <WifiOff className="h-3 w-3 mr-1 text-red-400" />}
                      {currentVideoQuality === 'medium' && <Wifi className="h-3 w-3 mr-1 text-yellow-400" />}
                      {currentVideoQuality === 'high' && <Wifi className="h-3 w-3 mr-1 text-green-400" />}
                      {currentVideoQuality === 'hd' && <Wifi className="h-3 w-3 mr-1 text-blue-400" />}
                      {networkQuality}
                      {isPremiumUser && <span className="ml-1 text-yellow-300">· Premium</span>}
                    </span>
                  </div>
                  
                  {/* Video quality controls for premium users */}
                  {isPremiumUser && (
                    <div className="absolute top-4 right-4 bg-black/60 rounded-lg px-2 py-1.5 text-xs text-white">
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="font-medium flex items-center">
                          <Video className="h-3 w-3 mr-1 text-primary" /> Quality Settings
                        </span>
                        <div 
                          className={`ml-2 w-7 h-3.5 rounded-full relative transition-colors ${isManualQualityMode ? 'bg-primary' : 'bg-gray-600'}`}
                          onClick={() => setIsManualQualityMode(!isManualQualityMode)}
                          role="checkbox"
                          aria-checked={isManualQualityMode}
                          tabIndex={0}
                          style={{ cursor: 'pointer' }}
                        >
                          <div 
                            className={`absolute top-[-1px] w-4 h-4 rounded-full shadow transition-transform ${isManualQualityMode ? 'bg-white translate-x-3.5' : 'bg-gray-400 translate-x-0'}`} 
                          />
                        </div>
                      </div>
                      
                      {/* Manual quality selector for premium users */}
                      {isManualQualityMode && (
                        <div className="flex flex-col gap-1 mt-2">
                          <div className="grid grid-cols-2 gap-1">
                            <button 
                              className={`py-1 px-1.5 rounded text-center text-[10px] ${currentVideoQuality === 'low' ? 'bg-red-500/80 text-white' : 'bg-gray-700/80 hover:bg-gray-600/80'}`}
                              onClick={() => {
                                setCurrentVideoQuality('low');
                                // Apply the new constraints if we have an active stream
                                if (localStream) {
                                  const videoTracks = localStream.getVideoTracks();
                                  if (videoTracks.length > 0) {
                                    const constraints = getVideoConstraints('low');
                                    videoTracks[0].applyConstraints(constraints)
                                      .catch(err => console.error('Could not apply video constraints:', err));
                                  }
                                }
                              }}
                            >
                              Low
                            </button>
                            <button 
                              className={`py-1 px-1.5 rounded text-center text-[10px] ${currentVideoQuality === 'medium' ? 'bg-yellow-500/80 text-white' : 'bg-gray-700/80 hover:bg-gray-600/80'}`}
                              onClick={() => {
                                setCurrentVideoQuality('medium');
                                // Apply the new constraints if we have an active stream
                                if (localStream) {
                                  const videoTracks = localStream.getVideoTracks();
                                  if (videoTracks.length > 0) {
                                    const constraints = getVideoConstraints('medium');
                                    videoTracks[0].applyConstraints(constraints)
                                      .catch(err => console.error('Could not apply video constraints:', err));
                                  }
                                }
                              }}
                            >
                              Medium
                            </button>
                            <button 
                              className={`py-1 px-1.5 rounded text-center text-[10px] ${currentVideoQuality === 'high' ? 'bg-green-500/80 text-white' : 'bg-gray-700/80 hover:bg-gray-600/80'}`}
                              onClick={() => {
                                setCurrentVideoQuality('high');
                                // Apply the new constraints if we have an active stream
                                if (localStream) {
                                  const videoTracks = localStream.getVideoTracks();
                                  if (videoTracks.length > 0) {
                                    const constraints = getVideoConstraints('high');
                                    videoTracks[0].applyConstraints(constraints)
                                      .catch(err => console.error('Could not apply video constraints:', err));
                                  }
                                }
                              }}
                            >
                              High
                            </button>
                            <button 
                              className={`py-1 px-1.5 rounded text-center text-[10px] ${currentVideoQuality === 'hd' ? 'bg-blue-500/80 text-white' : 'bg-gray-700/80 hover:bg-gray-600/80'}`}
                              onClick={() => {
                                setCurrentVideoQuality('hd');
                                // Apply the new constraints if we have an active stream
                                if (localStream) {
                                  const videoTracks = localStream.getVideoTracks();
                                  if (videoTracks.length > 0) {
                                    const constraints = getVideoConstraints('hd');
                                    videoTracks[0].applyConstraints(constraints)
                                      .catch(err => console.error('Could not apply video constraints:', err));
                                  }
                                }
                              }}
                            >
                              HD
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* Bandwidth saving toggle */}
                      <div className="mt-2 flex items-center justify-between">
                        <span className="flex items-center">
                          <WifiOff className="h-3 w-3 mr-1 text-yellow-400" /> Save Bandwidth
                        </span>
                        <div 
                          className={`ml-2 w-7 h-3.5 rounded-full relative transition-colors ${isBandwidthSavingMode ? 'bg-yellow-500' : 'bg-gray-600'}`}
                          onClick={() => {
                            const newMode = !isBandwidthSavingMode;
                            setIsBandwidthSavingMode(newMode);
                            
                            // If enabling bandwidth saving, drop quality to low
                            if (newMode) {
                              setCurrentVideoQuality('low');
                              
                              // Apply the new constraints if we have an active stream
                              if (localStream) {
                                const videoTracks = localStream.getVideoTracks();
                                if (videoTracks.length > 0) {
                                  const constraints = getVideoConstraints('low');
                                  videoTracks[0].applyConstraints(constraints)
                                    .catch(err => console.error('Could not apply low quality constraints:', err));
                                }
                              }
                            }
                          }}
                          role="checkbox"
                          aria-checked={isBandwidthSavingMode}
                          tabIndex={0}
                          style={{ cursor: 'pointer' }}
                        >
                          <div 
                            className={`absolute top-[-1px] w-4 h-4 rounded-full shadow transition-transform ${isBandwidthSavingMode ? 'bg-white translate-x-3.5' : 'bg-gray-400 translate-x-0'}`} 
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center p-4">
                  <div className="w-16 h-16 mx-auto bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <User className="h-8 w-8 text-gray-500" />
                  </div>
                  <p className="text-gray-400">Waiting for peer to join video call...</p>
                  <div className="mt-4">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </div>
                </div>
              )}
              
              {/* Local video (pip) */}
              <div className="absolute bottom-4 right-4 w-32 h-24 sm:w-40 sm:h-32 bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-700 shadow-lg">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {isCameraOff && (
                  <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                    <VideoOff className="h-6 w-6 text-gray-500" />
                  </div>
                )}
                
                {/* Camera switch button on the PIP view for mobile users */}
                {isMobile && !isCameraOff && (
                  <div 
                    className="absolute top-1 left-1 bg-black/60 rounded-full p-1.5 cursor-pointer"
                    onClick={() => switchCamera()}
                  >
                    <FlipHorizontal className="h-4 w-4 text-white" />
                  </div>
                )}
                
                {/* Audio/Video status indicators */}
                <div className="absolute bottom-1 right-1 flex space-x-1">
                  <div className={`rounded-full p-0.5 ${!isMicrophoneMuted ? 'bg-green-500/80' : 'bg-red-500/80'}`}>
                    {!isMicrophoneMuted ? <Mic className="h-2 w-2 text-white" /> : <MicOff className="h-2 w-2 text-white" />}
                  </div>
                  <div className={`rounded-full p-0.5 ${!isCameraOff ? 'bg-green-500/80' : 'bg-red-500/80'}`}>
                    {!isCameraOff ? <Video className="h-2 w-2 text-white" /> : <VideoOff className="h-2 w-2 text-white" />}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Text chat in video mode */}
          <div className="h-32 sm:h-40 bg-gray-900 border-t border-gray-800 p-2 flex flex-col">
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {messages.slice(-3).map((message, index) => (
                <div key={index} className={`flex ${message.senderId === user?.userId ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-2 py-1 rounded-lg text-xs max-w-[80%] ${
                    message.senderId === user?.userId ? 'bg-primary/90 text-white' : 'bg-gray-800 text-gray-200'
                  }`}>
                    {message.content}
                    {message.isTranslated && (
                      <div className="mt-0.5 text-[10px] opacity-70 flex items-center">
                        <Flag className="h-2 w-2 mr-0.5" /> Translated
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2 p-1">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 bg-gray-800 text-white rounded-full px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={messageInput}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
              />
              <Button size="sm" className="rounded-full aspect-square p-1" onClick={handleSubmit}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 bg-gray-800 overflow-y-auto p-2 sm:p-4 space-y-3" style={{ height: "calc(100vh - 200px)" }}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 sm:h-10 sm:w-10 text-gray-500" />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="absolute -top-1 -right-1 bg-primary/30 rounded-full p-1.5"
                >
                  <User className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                </motion.div>
              </div>
              
              <h3 className="text-white text-sm sm:text-base font-medium mb-1">Start a conversation</h3>
              <p className="text-xs sm:text-sm text-center px-4 text-gray-400 mb-4">Say hello to your new chat partner!</p>
              
              <div className="grid grid-cols-2 gap-2 max-w-xs w-full">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-gray-700 hover:bg-gray-700/80 text-white py-2 px-3 rounded-lg text-xs sm:text-sm"
                  onClick={() => onSendMessage("Hey there! How are you?")}
                >
                  👋 Say Hello
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-gray-700 hover:bg-gray-700/80 text-white py-2 px-3 rounded-lg text-xs sm:text-sm"
                  onClick={() => onSendMessage("What brings you here today?")}
                >
                  🤔 Ask a question
                </motion.button>
              </div>
              
              <div className="mt-6 text-xs text-gray-500 flex items-center">
                <Shield className="h-3 w-3 mr-1 text-green-500/70" />
                <span>Messages are moderated for your safety</span>
              </div>
            </motion.div>
          </div>
        )}
        
        {messages.map((message, index) => {
          const isSender = message.senderId === user?.userId;
          const isFirstInGroup = index === 0 || messages[index - 1].senderId !== message.senderId;
          const isLastInGroup = index === messages.length - 1 || messages[index + 1].senderId !== message.senderId;
          
          return (
            <div
              key={message.id}
              className={`flex ${isSender ? "justify-end" : "justify-start"} ${isLastInGroup ? "mb-3 sm:mb-4" : "mb-0.5"}`}
            >
              {/* User Avatar (only show for first message in group from other user) */}
              {!isSender && isFirstInGroup && (
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gray-700 flex items-center justify-center mr-1 sm:mr-2">
                    <User className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                  </div>
                </div>
              )}
              
              <div className={`flex flex-col ${!isSender && !isFirstInGroup ? "pl-7 sm:pl-10" : ""}`}>
                {/* User name and timestamp (only show for first message in group) */}
                {isFirstInGroup && (
                  <div className={`flex items-center mb-1 ${isSender ? "justify-end" : "justify-start"}`}>
                    {!isSender && <span className="text-xs font-medium text-gray-400 mr-1">Stranger</span>}
                    <span className="text-xs text-gray-500">{formatMessageTime(message.timestamp)}</span>
                  </div>
                )}
                
                {/* Message bubble */}
                <div className={`
                  flex max-w-[80%] md:max-w-[70%]
                  ${isSender ? "ml-auto" : ""}
                `}>
                  <div className={`
                    py-1.5 px-3 sm:py-2 sm:px-4 rounded-lg break-words text-xs sm:text-sm
                    ${isSender 
                      ? "bg-primary/90 text-white rounded-tr-none" 
                      : "bg-gray-700 text-gray-200 rounded-tl-none"
                    }
                  `}>
                    {/* Message content */}
                    {message.content}
                    
                    {/* Translation indicator for translated messages */}
                    {message.isTranslated && (
                      <div className="mt-1 pt-1 border-t border-gray-600/30 flex items-center justify-between">
                        <span className="text-xs opacity-70 flex items-center">
                          <Flag className="h-3 w-3 mr-1" /> 
                          Translated from {message.detectedLanguage || "another language"}
                        </span>
                        <button 
                          onClick={() => toggleOriginalContent(message.id)}
                          className="text-xs underline opacity-70 hover:opacity-100"
                        >
                          {viewingOriginalMessages.has(message.id) ? "View Translation" : "View Original"}
                        </button>
                      </div>
                    )}
                    
                    {/* Original message content */}
                    {message.isTranslated && viewingOriginalMessages.has(message.id) && message.originalContent && (
                      <div className="mt-1 pt-1 text-xs italic opacity-80">
                        "{message.originalContent}"
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Typing indicator */}
        {isPartnerTyping && (
          <div className="flex items-start mb-4 pl-7 sm:pl-10">
            <div className="bg-gray-700 text-gray-200 rounded-lg rounded-tl-none py-1.5 px-3 sm:py-2 sm:px-4">
              <TypingIndicator />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="bg-gray-900 p-2 sm:p-3 border-t border-gray-800">
        <form className="flex flex-col" onSubmit={handleSubmit}>
          <div className="flex items-center relative">
            <div className="relative flex-1">
              <input
                type="text"
                ref={inputRef}
                placeholder="Type a message..."
                className="w-full bg-gray-700 text-gray-200 text-sm sm:text-base rounded-full py-3 sm:py-3 px-4 sm:px-5 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/70 shadow-lg border-0"
                value={messageInput}
                onChange={handleInputChange}
                style={{ 
                  fontSize: '16px', // Prevents iOS zoom on focus
                  WebkitAppearance: 'none' // Removes iOS styling 
                }}
                aria-label="Message input"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center text-gray-400">
                <motion.button 
                  type="button" 
                  className="p-1.5 hover:text-gray-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Attach image"
                >
                  <Image className="h-5 w-5 sm:h-5 sm:w-5" />
                </motion.button>
              </div>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                type="submit"
                className="ml-1.5 sm:ml-2 bg-primary hover:bg-primary/90 text-white rounded-full p-2 sm:p-2.5 flex items-center justify-center shadow-lg"
                size="icon"
                disabled={!messageInput.trim()}
              >
                <Send className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </motion.div>
          </div>
          
          {/* Trust elements below input */}
          <div className="flex justify-center mt-2">
            <div className="flex items-center px-2 py-1 bg-gray-800/50 rounded-full text-xs text-gray-400 space-x-2">
              <div className="flex items-center">
                <MessageSquare className="h-3 w-3 mr-1 text-primary/70" />
                <span>Strangers can't see your real identity</span>
              </div>
              <span className="text-gray-600">|</span>
              <div className="flex items-center">
                <Shield className="h-3 w-3 mr-1 text-green-500/70" />
                <span>Messages are AI-moderated</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
