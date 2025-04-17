import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Globe, Shield, X, Video, Camera, Mic, VideoOff, MicOff, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

export default function ConnectingScreen({ onCancel }: ConnectingScreenProps) {
  const [searchingCountry, setSearchingCountry] = useState('');
  const [userCount] = useState(Math.floor(Math.random() * 200) + 150);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
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
  
  // Simulate searching through different countries
  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * countries.length);
      setSearchingCountry(countries[randomIndex]);
    }, 1500);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="flex-1 flex flex-col max-h-screen overflow-hidden">
      {/* Top status bar */}
      <div className="bg-gray-900 p-3 border-b border-gray-800 flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2 animate-pulse"></div>
          <span className="text-sm font-medium text-yellow-500">Finding match</span>
        </div>
        <div className="flex items-center">
          <Users className="h-3 w-3 mr-1 text-blue-400" />
          <span className="text-xs text-gray-300">{userCount} users online</span>
        </div>
      </div>

      {/* Main content - desktop layout is side by side, mobile is stacked */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left panel - Video preview (takes half the screen on desktop) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full md:w-1/2 h-full relative bg-black flex-shrink-0"
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

          {/* Camera controls - moved to centered bottom of video */}
          <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex space-x-3">
            <Button
              size="sm"
              variant="secondary"
              className={`rounded-full w-12 h-12 p-0 flex items-center justify-center shadow-lg ${!micEnabled ? 'bg-red-500 text-white' : 'bg-gray-800/80 text-white'}`}
              onClick={toggleMic}
            >
              {micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>
            
            <Button
              size="sm"
              variant="secondary"
              className={`rounded-full w-12 h-12 p-0 flex items-center justify-center shadow-lg ${!videoEnabled ? 'bg-red-500 text-white' : 'bg-gray-800/80 text-white'}`}
              onClick={toggleVideo}
            >
              {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
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
          {/* Matching animation and status */}
          <div className="flex-1 p-6 flex flex-col items-center justify-center">
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
            
            {/* Trust elements */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center space-x-4 mb-6 text-sm text-gray-400"
            >
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-1 text-green-500" />
                <span>AI moderated</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1 text-blue-500" />
                <span>Smart matching</span>
              </div>
              <div className="flex items-center">
                <Camera className="h-4 w-4 mr-1 text-blue-500" />
                <span>HD video</span>
              </div>
            </motion.div>
          </div>

          {/* Action buttons */}
          <div className="p-5 border-t border-gray-800 flex justify-between">
            <motion.button 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onCancel}
              className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-all flex items-center"
            >
              <X className="h-5 w-5 mr-2" />
              Cancel
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
              Skip
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
