import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, Globe, Shield, X, Video, Camera, Mic, VideoOff, MicOff, 
  SkipForward, RefreshCw, MessageCircle, Send, Clock, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface ConnectingScreenProps {
  onCancel: () => void;
}

interface MediaError {
  name?: string;
  message?: string;
}

// Random country names for animation
const countries = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 
  'Germany', 'France', 'Spain', 'Italy', 'Japan', 'Brazil', 
  'Mexico', 'India', 'China', 'South Korea', 'Russia'
];

// Possible status messages that will rotate during searching
const statusMessages = [
  "Looking for someone with similar interests...",
  "Matching you with the perfect conversation partner...",
  "Searching through thousands of active users...",
  "Hang tight! Finding someone interesting for you...",
  "Using AI to find the best match for you...",
  "Almost there! Connecting you soon..."
];

// Sample placeholder messages for the chat preview
const placeholderMessages = [
  { id: 1, sender: 'partner', content: 'Hey there! How are you doing today?', time: '12:01 PM' },
  { id: 2, sender: 'me', content: 'Hi! I\'m good, thanks for asking. How about you?', time: '12:02 PM' }
];

export default function ConnectingScreen({ onCancel }: ConnectingScreenProps) {
  const [searchingCountry, setSearchingCountry] = useState('');
  const [userCount] = useState(Math.floor(Math.random() * 200) + 150);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showPreviewChat, setShowPreviewChat] = useState(false);
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
  const [searchTimeSeconds, setSearchTimeSeconds] = useState(0);
  const [connectionProgress, setConnectionProgress] = useState(0);
  const [showTimeout, setShowTimeout] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  
  // Initialize camera on component mount
  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const startCamera = async () => {
      try {
        // First check if media devices are supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Media devices not supported in this browser');
        }
        
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        setLocalStream(stream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        const error = err as MediaError;
        console.error('Error accessing camera:', error);
        setVideoEnabled(false);
        
        // More user-friendly error handling
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          alert('Please allow camera and microphone access to use video chat features');
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          alert('No camera or microphone found. Please connect a device and try again.');
        } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
          alert('Your camera or microphone is already in use by another application.');
        } else {
          alert('Unable to access camera and microphone. Video preview disabled.');
        }
      }
    };
    
    startCamera();
    
    // Cleanup function to stop all tracks when component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  // Toggle video 
  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      if (videoTracks.length > 0) {
        videoTracks[0].enabled = !videoEnabled;
        setVideoEnabled(!videoEnabled);
      }
    }
  };
  
  // Toggle microphone
  const toggleMic = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      if (audioTracks.length > 0) {
        audioTracks[0].enabled = !micEnabled;
        setMicEnabled(!micEnabled);
      }
    }
  };
  
  // Show chat preview after a few seconds to give users an idea of what to expect
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPreviewChat(true);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Simulate searching through different countries
  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * countries.length);
      setSearchingCountry(countries[randomIndex]);
    }, 1500);
    
    return () => clearInterval(interval);
  }, []);
  
  // Rotate through different status messages
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStatusIndex(prevIndex => (prevIndex + 1) % statusMessages.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Timer for search duration
  useEffect(() => {
    const interval = setInterval(() => {
      setSearchTimeSeconds(prev => {
        const newTime = prev + 1;
        
        // Simulate progress based on time
        const newProgress = Math.min(95, newTime * 5);
        setConnectionProgress(newProgress);
        
        // Show timeout message after 20 seconds
        if (newTime > 20 && !showTimeout) {
          setShowTimeout(true);
        }
        
        // Set timed out state after 30 seconds
        if (newTime > 30) {
          setTimedOut(true);
          clearInterval(interval);
        }
        
        return newTime;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [showTimeout]);
  
  // Format search time as MM:SS
  const formatSearchTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  // Handle retry when timed out
  const handleRetry = () => {
    setTimedOut(false);
    setShowTimeout(false);
    setSearchTimeSeconds(0);
    setConnectionProgress(0);
    // Would typically reconnect to the server here
  };
  
  return (
    <div className="flex-1 flex flex-col max-h-screen overflow-hidden">
      {/* Top status bar */}
      <div className="bg-gray-900 p-3 border-b border-gray-800 flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2 animate-pulse"></div>
          <span className="text-sm font-medium text-yellow-500">Finding match</span>
          <div className="ml-3 flex items-center text-xs text-gray-400">
            <Clock className="h-3 w-3 mr-1" />
            <span>{formatSearchTime(searchTimeSeconds)}</span>
          </div>
        </div>
        <div className="flex items-center">
          <Users className="h-3 w-3 mr-1 text-blue-400" />
          <span className="text-xs text-gray-300">{userCount} users online</span>
        </div>
      </div>

      {/* Main content - optimized for mobile with stacked layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Video preview (full width on mobile, half on desktop) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full md:w-1/2 h-[40vh] md:h-full relative bg-black flex-shrink-0"
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${!videoEnabled ? 'hidden' : ''}`}
          />
          
          {!videoEnabled && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
              <VideoOff className="h-16 w-16 text-gray-700 mb-3" />
              <p className="text-gray-400 font-medium">Camera is turned off</p>
            </div>
          )}

          {/* Video preview caption overlay */}
          <div className="absolute left-0 right-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <p className="text-white text-sm">This is how others will see you when connected</p>
            <p className="text-gray-400 text-xs mt-1">You can adjust your camera or microphone settings now</p>
          </div>

          {/* Mobile-optimized camera controls */}
          <div className="absolute bottom-10 left-0 right-0 flex justify-center space-x-4 px-4">
            <Button
              size="sm"
              variant="secondary"
              className={`rounded-full w-14 h-14 p-0 flex items-center justify-center shadow-xl border-2 ${!micEnabled ? 'bg-red-500 text-white border-red-400' : 'bg-gray-800/90 text-white border-gray-700'}`}
              onClick={toggleMic}
              aria-label={micEnabled ? "Mute microphone" : "Unmute microphone"}
            >
              {micEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
            </Button>
            
            <Button
              size="sm"
              variant="secondary"
              className={`rounded-full w-14 h-14 p-0 flex items-center justify-center shadow-xl border-2 ${!videoEnabled ? 'bg-red-500 text-white border-red-400' : 'bg-gray-800/90 text-white border-gray-700'}`}
              onClick={toggleVideo}
              aria-label={videoEnabled ? "Turn off camera" : "Turn on camera"}
            >
              {videoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
            </Button>
            
            <Button
              size="sm"
              variant="secondary"
              className="rounded-full w-14 h-14 p-0 flex items-center justify-center shadow-xl bg-primary/90 text-white border-2 border-primary"
              onClick={onCancel}
              aria-label="Cancel search"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Status label */}
          <div className="absolute top-4 left-4 bg-gray-900/70 rounded-full px-3 py-1 text-sm flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
            <span className="text-white">Your camera</span>
          </div>

          {/* Quality indicator */}
          <div className="absolute top-4 right-4 bg-gray-900/70 rounded-full px-3 py-1 text-xs">
            <span className="text-white font-medium">HD Quality</span>
          </div>
        </motion.div>

        {/* Right panel - Matching status/chat placeholder */}
        <div className="flex-1 flex flex-col bg-gray-900">
          <AnimatePresence mode="wait">
            {timedOut ? (
              <motion.div 
                key="timeout"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 p-6 flex flex-col items-center justify-center"
              >
                <div className="text-center max-w-md">
                  <div className="mb-6 mx-auto w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center">
                    <Clock className="h-8 w-8 text-yellow-500" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-white mb-3">
                    Taking longer than expected
                  </h2>
                  
                  <p className="text-gray-300 mb-6">
                    We're having trouble finding a match right now. This could be due to your preferences or current user availability.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      variant="destructive" 
                      onClick={onCancel}
                      className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700"
                    >
                      <X className="h-4 w-4" />
                      Stop
                    </Button>
                    
                    <Button 
                      onClick={handleRetry}
                      className="flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Try Again
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : showPreviewChat ? (
              <motion.div 
                key="preview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col"
              >
                {/* Connection status with progress bar */}
                <div className="p-4 border-b border-gray-800">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center text-sm text-gray-300">
                      <Zap className="h-4 w-4 text-primary mr-2" />
                      <span>Finding you an awesome match...</span>
                    </div>
                    <span className="text-xs text-gray-400">{connectionProgress}%</span>
                  </div>
                  <Progress value={connectionProgress} className="h-1" />
                  
                  <p className="mt-2 text-sm text-gray-400">
                    {statusMessages[currentStatusIndex]}
                  </p>
                </div>
                
                {/* Chat preview with placeholder messages */}
                <div className="flex-1 p-4 overflow-auto">
                  <div className="text-center text-xs text-gray-500 mb-3">
                    Chat preview - Here's what the interface will look like when connected
                  </div>
                  
                  {placeholderMessages.map(message => (
                    <div 
                      key={message.id} 
                      className={`flex mb-3 ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          message.sender === 'me' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-gray-800 text-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-baseline gap-4">
                          <p>{message.content}</p>
                          <span className="text-xs opacity-70 whitespace-nowrap">
                            {message.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-start mb-3">
                    <div className="max-w-[80%] px-4 py-2 rounded-lg bg-gray-800 text-gray-400 flex items-center">
                      <div className="flex space-x-1">
                        <span className="animate-bounce">•</span>
                        <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>•</span>
                        <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>•</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Fake message input */}
                <div className="p-4 border-t border-gray-800">
                  <div className="flex items-center relative">
                    <input
                      type="text"
                      disabled
                      placeholder="Waiting to connect..."
                      className="w-full bg-gray-800 text-gray-400 rounded-full py-3 pl-4 pr-12 border border-gray-700 focus:outline-none"
                    />
                    <button 
                      disabled
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-gray-700 rounded-full text-gray-400"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="searching"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 p-6 flex flex-col items-center justify-center"
              >
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative mb-5"
                >
                  <div className="relative">
                    {/* Animated glow effect behind spinner */}
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl transform scale-150"></div>
                    
                    <div className="relative w-28 h-28 mx-auto">
                      {/* Main spinner */}
                      <motion.div 
                        className="w-28 h-28 border-4 border-primary border-t-transparent rounded-full absolute inset-0"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      ></motion.div>
                      
                      {/* Secondary spinner */}
                      <motion.div 
                        className="w-20 h-20 border-4 border-blue-400 border-b-transparent rounded-full absolute inset-0 m-auto"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      ></motion.div>
                      
                      {/* Center icon */}
                      <div className="absolute inset-0 m-auto flex items-center justify-center z-10">
                        <Search className="h-10 w-10 text-primary" />
                      </div>
                      
                      {/* Orbiting user dots */}
                      <motion.div
                        className="absolute"
                        style={{ width: 12, height: 12 }}
                        animate={{
                          x: [0, 40, 0, -40, 0],
                          y: [40, 0, -40, 0, 40],
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      >
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </motion.div>
                      
                      <motion.div
                        className="absolute"
                        style={{ width: 10, height: 10 }}
                        animate={{
                          x: [30, -30, 0, 30],
                          y: [0, 30, -30, 0],
                        }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
                      >
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </motion.div>
                    </div>
                  </div>
                  
                  <motion.h2 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl sm:text-3xl font-bold text-white mt-8 mb-3"
                  >
                    Finding someone to chat with...
                  </motion.h2>
                  
                  <motion.p 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-lg text-gray-300 mb-2"
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
                      <Globe className="h-4 w-4 mr-1 text-primary" />
                      <span>Searching in {searchingCountry}...</span>
                    </motion.div>
                  )}
                </motion.div>
                
                {/* Message telling users the preview is coming */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 1, 0] }}
                  transition={{ delay: 1, duration: 2, times: [0, 0.1, 0.9, 1] }}
                  className="bg-primary/10 rounded-lg py-2 px-4 flex items-center mb-5"
                >
                  <MessageCircle className="h-4 w-4 text-primary mr-2" />
                  <span className="text-sm text-primary">Preview loading in a moment...</span>
                </motion.div>
                
                {/* Trust elements */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-wrap justify-center gap-3 mb-6 text-sm text-gray-400"
                >
                  <div className="flex items-center bg-gray-800/50 rounded-full px-3 py-1">
                    <Shield className="h-4 w-4 mr-1 text-green-500" />
                    <span>AI moderated</span>
                  </div>
                  <div className="flex items-center bg-gray-800/50 rounded-full px-3 py-1">
                    <Users className="h-4 w-4 mr-1 text-blue-500" />
                    <span>Smart matching</span>
                  </div>
                  <div className="flex items-center bg-gray-800/50 rounded-full px-3 py-1">
                    <Camera className="h-4 w-4 mr-1 text-blue-500" />
                    <span>HD video</span>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action buttons */}
          <div className="p-5 border-t border-gray-800 flex justify-between">
            <motion.button 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onCancel}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-all flex items-center"
            >
              <X className="h-5 w-5 mr-2" />
              Stop
            </motion.button>
            
            <motion.button 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onCancel} // For now using the same handler as Cancel, would need a skipMatch handler
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all flex items-center"
            >
              <SkipForward className="h-5 w-5 mr-2" />
              Next
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
