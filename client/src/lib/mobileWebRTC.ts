import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType } from '@capacitor/camera';
// Import the microphone plugin this way to avoid type issues
import '@mozartec/capacitor-microphone';
// We'll access it through window
declare global {
  interface Window {
    Microphone?: {
      requestPermission: () => Promise<{ value: string }>;
    };
  }
}

// Constants for media constraints
const DEFAULT_VIDEO_CONSTRAINTS = {
  width: { ideal: 1280, max: 1920 },
  height: { ideal: 720, max: 1080 },
  frameRate: { ideal: 24, max: 30 },
  facingMode: 'user',
};

const MOBILE_VIDEO_CONSTRAINTS = {
  width: { ideal: 640, max: 1280 },
  height: { ideal: 480, max: 720 },
  frameRate: { ideal: 15, max: 24 },
  facingMode: 'user',
};

const MOBILE_VIDEO_CONSTRAINTS_BACK = {
  width: { ideal: 640, max: 1280 },
  height: { ideal: 480, max: 720 },
  frameRate: { ideal: 15, max: 24 },
  facingMode: 'environment',
};

const DEFAULT_AUDIO_CONSTRAINTS = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

// WebRTC configuration for different networks
const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  // Added free TURN servers for NAT traversal
  {
    urls: 'turn:openrelay.metered.ca:80',
    username: 'openrelayproject',
    credential: 'openrelayproject'
  },
  {
    urls: 'turn:openrelay.metered.ca:443',
    username: 'openrelayproject',
    credential: 'openrelayproject'
  },
  {
    urls: 'turn:openrelay.metered.ca:443?transport=tcp',
    username: 'openrelayproject',
    credential: 'openrelayproject'
  }
];

/**
 * Mobile WebRTC Manager
 * Handles WebRTC connections with optimizations for mobile devices
 */
export class MobileWebRTCManager {
  private static instance: MobileWebRTCManager;
  private isInitialized: boolean = false;
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private isNative: boolean = false;
  private dataChannel: RTCDataChannel | null = null;
  
  // Permission flags
  private hasCameraPermission: boolean = false;
  private hasMicrophonePermission: boolean = false;
  
  // Event callbacks
  private onIceCandidateCallback: ((candidate: RTCIceCandidate) => void) | null = null;
  private onTrackCallback: ((stream: MediaStream) => void) | null = null;
  private onDataChannelMessageCallback: ((message: string) => void) | null = null;
  private onConnectionStateChangeCallback: ((state: RTCPeerConnectionState) => void) | null = null;
  private onPermissionErrorCallback: ((type: 'camera' | 'microphone', error: unknown) => void) | null = null;
  
  private constructor() {
    this.isNative = Capacitor.isNativePlatform();
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): MobileWebRTCManager {
    if (!MobileWebRTCManager.instance) {
      MobileWebRTCManager.instance = new MobileWebRTCManager();
    }
    return MobileWebRTCManager.instance;
  }
  
  /**
   * Initialize WebRTC
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    // Create peer connection with ICE servers
    this.peerConnection = new RTCPeerConnection({
      iceServers: ICE_SERVERS,
      iceCandidatePoolSize: 10,
    });
    
    // Set up event listeners
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.onIceCandidateCallback) {
        this.onIceCandidateCallback(event.candidate);
      }
    };
    
    this.peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0] && this.onTrackCallback) {
        this.remoteStream = event.streams[0];
        this.onTrackCallback(event.streams[0]);
      }
    };
    
    this.peerConnection.ondatachannel = (event) => {
      const dataChannel = event.channel;
      dataChannel.onmessage = (e) => {
        if (this.onDataChannelMessageCallback) {
          this.onDataChannelMessageCallback(e.data);
        }
      };
    };
    
    this.peerConnection.onconnectionstatechange = () => {
      if (this.onConnectionStateChangeCallback) {
        this.onConnectionStateChangeCallback(this.peerConnection!.connectionState);
      }
    };
    
    this.isInitialized = true;
  }
  
  /**
   * Get local media stream with device-specific optimizations
   */
  public async getLocalStream(videoEnabled: boolean = true, audioEnabled: boolean = true): Promise<MediaStream> {
    console.log(`Initializing media stream - video: ${videoEnabled}, audio: ${audioEnabled}, native: ${this.isNative}`);
    
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    // If we already have a stream, check if we need to update it
    if (this.localStream) {
      const videoTracks = this.localStream.getVideoTracks();
      const audioTracks = this.localStream.getAudioTracks();
      
      const hasVideo = videoTracks.length > 0;
      const hasAudio = audioTracks.length > 0;
      
      // If the requirements match what we already have, return the existing stream
      if (hasVideo === videoEnabled && hasAudio === audioEnabled) {
        console.log('Using existing media stream with matching requirements');
        return this.localStream;
      }
      
      // Otherwise, stop existing tracks
      console.log('Stream requirements changed, creating new stream');
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    try {
      // Log device info to help with debugging
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(device => device.kind === 'videoinput');
        console.log(`Found ${videoInputs.length} video input devices`);
        videoInputs.forEach((device, i) => {
          console.log(`Video device ${i + 1}: ${device.label || 'unnamed'}`);
        });
      } catch (err) {
        console.error('Failed to enumerate devices:', err);
      }
      
      // For native platforms, use platform-specific APIs
      if (this.isNative) {
        console.log('Using native platform camera access methods');
        this.localStream = new MediaStream();
        
        // Handle video track for native platforms
        if (videoEnabled) {
          try {
            // Request camera permission using Capacitor Camera API
            const cameraPermission = await Camera.checkPermissions();
            console.log('Camera permission status:', cameraPermission.camera);
            
            if (cameraPermission.camera !== 'granted') {
              console.log('Requesting camera permission');
              const result = await Camera.requestPermissions();
              console.log('Camera permission request result:', result);
            }
            
            console.log('Getting native video track');
            const videoTrack = await this.getNativeVideoTrack();
            if (videoTrack) {
              console.log('Successfully created video track, adding to stream');
              this.localStream.addTrack(videoTrack);
            } else {
              console.warn('Failed to get video track');
              if (this.onPermissionErrorCallback) {
                this.onPermissionErrorCallback('camera', new Error('Failed to get video track'));
              }
            }
          } catch (error) {
            console.error('Error getting native video track:', error);
            // Handle camera permission error
            if (this.onPermissionErrorCallback) {
              this.onPermissionErrorCallback('camera', error);
            }
          }
        }
        
        // Handle audio track for native platforms
        if (audioEnabled) {
          try {
            // Request microphone permission using Capacitor Microphone plugin via window object
            if (window.Microphone) {
              const micPermission = await window.Microphone.requestPermission();
              if (micPermission.value === 'granted') {
                const audioTrack = await this.getNativeAudioTrack();
                if (audioTrack) {
                  this.localStream.addTrack(audioTrack);
                }
              }
            } else {
              // Fallback if plugin is not available
              const audioTrack = await this.getNativeAudioTrack();
              if (audioTrack) {
                this.localStream.addTrack(audioTrack);
              }
            }
          } catch (error) {
            console.error('Error getting native audio track:', error);
            
            // Fallback to default audio track acquisition
            try {
              const audioTrack = await this.getNativeAudioTrack();
              if (audioTrack && this.localStream) {
                this.localStream.addTrack(audioTrack);
              }
            } catch (fallbackError) {
              console.error('Error getting fallback audio track:', fallbackError);
            }
          }
        }
      } else {
        // For web, use standard getUserMedia
        const constraints: MediaStreamConstraints = {
          video: videoEnabled ? 
            (this.isMobileDevice() ? MOBILE_VIDEO_CONSTRAINTS : DEFAULT_VIDEO_CONSTRAINTS) : 
            false,
          audio: audioEnabled ? DEFAULT_AUDIO_CONSTRAINTS : false,
        };
        
        this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      }
      
      // Add tracks to peer connection
      if (this.localStream && this.peerConnection) {
        this.localStream.getTracks().forEach(track => {
          if (this.peerConnection && this.localStream) {
            this.peerConnection.addTrack(track, this.localStream);
          }
        });
      }
      
      return this.localStream || new MediaStream();
    } catch (error) {
      console.error('Error getting local stream:', error);
      
      // Determine if this is a permission error
      const errorMessage = (error as Error).toString().toLowerCase();
      if (errorMessage.includes('permission') || 
          errorMessage.includes('denied') || 
          errorMessage.includes('not allowed') ||
          (error as any).name === 'NotAllowedError' || 
          (error as any).name === 'PermissionDeniedError') {
        
        // Handle camera permission error
        if (videoEnabled && !this.localStream?.getVideoTracks().length) {
          this.hasCameraPermission = false;
          if (this.onPermissionErrorCallback) {
            this.onPermissionErrorCallback('camera', error);
          }
        }
        
        // Handle microphone permission error
        if (audioEnabled && !this.localStream?.getAudioTracks().length) {
          this.hasMicrophonePermission = false;
          if (this.onPermissionErrorCallback) {
            this.onPermissionErrorCallback('microphone', error);
          }
        }
      }
      
      // Return empty stream as fallback
      return new MediaStream();
    }
  }
  
  /**
   * Create and send an offer
   */
  public async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.isInitialized || !this.peerConnection) {
      await this.initialize();
    }
    
    // Create data channel
    this.dataChannel = this.peerConnection!.createDataChannel('chat');
    this.setupDataChannel(this.dataChannel);
    
    // Create offer
    const offer = await this.peerConnection!.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });
    
    // Set local description
    await this.peerConnection!.setLocalDescription(offer);
    
    return offer;
  }
  
  /**
   * Accept an offer and create an answer
   */
  public async acceptOffer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    if (!this.isInitialized || !this.peerConnection) {
      await this.initialize();
    }
    
    // Set remote description
    await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(offer));
    
    // Create answer
    const answer = await this.peerConnection!.createAnswer();
    
    // Set local description
    await this.peerConnection!.setLocalDescription(answer);
    
    return answer;
  }
  
  /**
   * Accept an answer
   */
  public async acceptAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.isInitialized || !this.peerConnection) {
      await this.initialize();
    }
    
    // Set remote description
    await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(answer));
  }
  
  /**
   * Add ICE candidate
   */
  public async addIceCandidate(candidate: RTCIceCandidate): Promise<void> {
    if (!this.isInitialized || !this.peerConnection) {
      await this.initialize();
    }
    
    await this.peerConnection!.addIceCandidate(candidate);
  }
  
  /**
   * Send message via data channel
   */
  public sendMessage(message: string): boolean {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      return false;
    }
    
    try {
      this.dataChannel.send(message);
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }
  
  /**
   * Close connection and clean up
   */
  public close(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }
    
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    
    this.isInitialized = false;
  }
  
  /**
   * Set callback for ICE candidates
   */
  public onIceCandidate(callback: (candidate: RTCIceCandidate) => void): void {
    this.onIceCandidateCallback = callback;
  }
  
  /**
   * Set callback for tracks
   */
  public onTrack(callback: (stream: MediaStream) => void): void {
    this.onTrackCallback = callback;
  }
  
  /**
   * Set callback for data channel messages
   */
  public onDataChannelMessage(callback: (message: string) => void): void {
    this.onDataChannelMessageCallback = callback;
  }
  
  /**
   * Set callback for connection state changes
   */
  public onConnectionStateChange(callback: (state: RTCPeerConnectionState) => void): void {
    this.onConnectionStateChangeCallback = callback;
  }
  
  /**
   * Set callback for permission errors
   */
  public onPermissionError(callback: (type: 'camera' | 'microphone', error: unknown) => void): void {
    this.onPermissionErrorCallback = callback;
  }
  
  /**
   * Get connection state
   */
  public getConnectionState(): RTCPeerConnectionState | null {
    return this.peerConnection?.connectionState || null;
  }
  
  /**
   * Switch camera between front and back
   */
  public async switchCamera(): Promise<MediaStream | null> {
    if (!this.localStream) {
      console.error('Cannot switch camera: no local stream exists');
      return null;
    }
    
    // Get current video track
    const videoTrack = this.localStream.getVideoTracks()[0];
    if (!videoTrack) {
      console.error('Cannot switch camera: no video track found');
      return null;
    }
    
    // Stop the current track
    videoTrack.stop();
    
    try {
      // Determine current facing mode
      const currentFacingMode = videoTrack.getSettings().facingMode || 'user';
      const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
      
      console.log(`Switching camera from ${currentFacingMode} to ${newFacingMode}`);
      
      // Create new video constraints with the opposite facing mode
      const videoConstraints = newFacingMode === 'user' 
        ? MOBILE_VIDEO_CONSTRAINTS 
        : MOBILE_VIDEO_CONSTRAINTS_BACK;
      
      // Get new video track
      const newStream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints });
      const newVideoTrack = newStream.getVideoTracks()[0];
      
      // Remove old track from the peer connection
      const senders = this.peerConnection?.getSenders() || [];
      const videoSender = senders.find(sender => sender.track?.kind === 'video');
      
      if (videoSender) {
        videoSender.replaceTrack(newVideoTrack);
      }
      
      // Replace track in local stream
      this.localStream.removeTrack(videoTrack);
      this.localStream.addTrack(newVideoTrack);
      
      return this.localStream;
    } catch (error) {
      console.error('Error switching camera:', error);
      return null;
    }
  }
  
  /**
   * Check if device is mobile
   */
  private isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  
  /**
   * Get video track for native platforms
   */
  private async getNativeVideoTrack(): Promise<MediaStreamTrack | null> {
    try {
      // First try to get camera permissions using Capacitor Camera
      if (this.isNative) {
        try {
          const cameraPermission = await Camera.checkPermissions();
          if (cameraPermission.camera !== 'granted') {
            await Camera.requestPermissions();
          }
        } catch (permError) {
          console.warn('Camera permission request failed:', permError);
          // Continue anyway, as getUserMedia will also request permissions
        }
      }
      
      // Use appropriate constraints based on device type
      const videoConstraints = this.isMobileDevice() 
        ? MOBILE_VIDEO_CONSTRAINTS 
        : DEFAULT_VIDEO_CONSTRAINTS;
      
      // Use standard getUserMedia API (works on both web and Capacitor WebView)
      console.log('Requesting camera with constraints:', videoConstraints);
      const tempStream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: false
      });
      
      const videoTrack = tempStream.getVideoTracks()[0];
      if (!videoTrack) {
        throw new Error('No video track found in stream');
      }
      
      console.log('Successfully got video track:', videoTrack.label);
      return videoTrack;
    } catch (error) {
      console.error('Error getting video track:', error);
      
      // Fallback to try with minimal constraints
      try {
        console.log('Trying fallback camera access with minimal constraints');
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true
        });
        const fallbackTrack = fallbackStream.getVideoTracks()[0];
        console.log('Got fallback video track:', fallbackTrack?.label);
        return fallbackTrack || null;
      } catch (fallbackError) {
        console.error('Fallback camera access also failed:', fallbackError);
        return null;
      }
    }
  }
  
  /**
   * Get audio track for native platforms
   */
  private async getNativeAudioTrack(): Promise<MediaStreamTrack | null> {
    try {
      // Try to get microphone permissions using Capacitor Microphone plugin if available
      if (this.isNative && window.Microphone) {
        try {
          const micPermission = await window.Microphone.requestPermission();
          if (micPermission.value !== 'granted') {
            console.warn('Microphone permission not granted via Capacitor plugin');
          }
        } catch (permError) {
          console.warn('Microphone permission request failed via Capacitor plugin:', permError);
          // Continue anyway, as getUserMedia will also request permissions
        }
      }
      
      // Use standard getUserMedia API with optimized constraints
      console.log('Requesting microphone with constraints:', DEFAULT_AUDIO_CONSTRAINTS);
      const tempStream = await navigator.mediaDevices.getUserMedia({
        audio: DEFAULT_AUDIO_CONSTRAINTS,
        video: false
      });
      
      const audioTrack = tempStream.getAudioTracks()[0];
      if (!audioTrack) {
        throw new Error('No audio track found in stream');
      }
      
      console.log('Successfully got audio track:', audioTrack.label);
      return audioTrack;
    } catch (error) {
      console.error('Error getting audio track:', error);
      
      // Fallback to try with minimal constraints
      try {
        console.log('Trying fallback microphone access with minimal constraints');
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          audio: true
        });
        const fallbackTrack = fallbackStream.getAudioTracks()[0];
        console.log('Got fallback audio track:', fallbackTrack?.label);
        return fallbackTrack || null;
      } catch (fallbackError) {
        console.error('Fallback microphone access also failed:', fallbackError);
        return null;
      }
    }
  }
  
  /**
   * Setup data channel
   */
  private setupDataChannel(dataChannel: RTCDataChannel): void {
    dataChannel.onopen = () => {
      console.log('Data channel opened');
    };
    
    dataChannel.onclose = () => {
      console.log('Data channel closed');
    };
    
    dataChannel.onmessage = (event) => {
      if (this.onDataChannelMessageCallback) {
        this.onDataChannelMessageCallback(event.data);
      }
    };
    
    dataChannel.onerror = (error) => {
      console.error('Data channel error:', error);
    };
  }
}

// Export a default instance
export default MobileWebRTCManager.getInstance();