import { Capacitor } from '@capacitor/core';
import { Camera, CameraPermissionState } from '@capacitor/camera';
import { Microphone, MicrophonePermissionState } from '@capacitor/microphone';

export interface MediaDeviceInfo {
  deviceId: string;
  kind: string;
  label: string;
  groupId: string;
}

/**
 * Mobile WebRTC helper to handle permissions and device access on mobile platforms
 */
export class MobileWebRTCHelper {
  private static instance: MobileWebRTCHelper;
  private cameraPermissionGranted = false;
  private microphonePermissionGranted = false;
  private isNative = Capacitor.isNativePlatform();

  private constructor() {}

  public static getInstance(): MobileWebRTCHelper {
    if (!MobileWebRTCHelper.instance) {
      MobileWebRTCHelper.instance = new MobileWebRTCHelper();
    }
    return MobileWebRTCHelper.instance;
  }

  /**
   * Check if running on native mobile platform
   */
  public isNativeMobile(): boolean {
    return this.isNative;
  }

  /**
   * Request camera permission for video chat
   */
  public async requestCameraPermission(): Promise<boolean> {
    if (!this.isNative) return true; // Web platform, no need for explicit permission

    try {
      const permission = await Camera.checkPermissions();
      
      if (permission.camera === 'granted') {
        this.cameraPermissionGranted = true;
        return true;
      }
      
      const requestResult = await Camera.requestPermissions();
      this.cameraPermissionGranted = requestResult.camera === 'granted';
      return this.cameraPermissionGranted;
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return false;
    }
  }

  /**
   * Request microphone permission for audio chat
   */
  public async requestMicrophonePermission(): Promise<boolean> {
    if (!this.isNative) return true; // Web platform, no need for explicit permission

    try {
      const permission = await Microphone.checkPermissions();
      
      if (permission.microphone === 'granted') {
        this.microphonePermissionGranted = true;
        return true;
      }
      
      const requestResult = await Microphone.requestPermissions();
      this.microphonePermissionGranted = requestResult.microphone === 'granted';
      return this.microphonePermissionGranted;
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
      return false;
    }
  }

  /**
   * Get available video devices (cameras)
   * Handles differences between mobile and web platforms
   */
  public async getVideoDevices(): Promise<MediaDeviceInfo[]> {
    if (!this.cameraPermissionGranted && this.isNative) {
      const granted = await this.requestCameraPermission();
      if (!granted) return [];
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(device => device.kind === 'videoinput');
    } catch (error) {
      console.error('Error enumerating video devices:', error);
      // On mobile, if enumeration fails, return at least one generic device
      if (this.isNative) {
        return [{
          deviceId: 'default',
          kind: 'videoinput',
          label: 'Default Camera',
          groupId: 'default'
        }];
      }
      return [];
    }
  }

  /**
   * Get available audio devices (microphones)
   * Handles differences between mobile and web platforms
   */
  public async getAudioDevices(): Promise<MediaDeviceInfo[]> {
    if (!this.microphonePermissionGranted && this.isNative) {
      const granted = await this.requestMicrophonePermission();
      if (!granted) return [];
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(device => device.kind === 'audioinput');
    } catch (error) {
      console.error('Error enumerating audio devices:', error);
      // On mobile, if enumeration fails, return at least one generic device
      if (this.isNative) {
        return [{
          deviceId: 'default',
          kind: 'audioinput',
          label: 'Default Microphone',
          groupId: 'default'
        }];
      }
      return [];
    }
  }

  /**
   * Initialize media stream with mobile optimizations
   */
  public async initializeMediaStream(
    videoEnabled: boolean = true,
    audioEnabled: boolean = true,
    videoDeviceId?: string,
    audioDeviceId?: string
  ): Promise<MediaStream | null> {
    // Request permissions first if on native platform
    if (this.isNative) {
      if (videoEnabled) await this.requestCameraPermission();
      if (audioEnabled) await this.requestMicrophonePermission();
    }

    try {
      // Mobile-optimized constraints
      const constraints: MediaStreamConstraints = {
        video: videoEnabled ? {
          deviceId: videoDeviceId ? { exact: videoDeviceId } : undefined,
          width: { ideal: 640 }, // Lower resolution for mobile
          height: { ideal: 480 },
          frameRate: { ideal: 24 } // Lower framerate to save battery
        } : false,
        audio: audioEnabled ? {
          deviceId: audioDeviceId ? { exact: audioDeviceId } : undefined,
          echoCancellation: true, // Important for mobile
          noiseSuppression: true,
          autoGainControl: true
        } : false
      };

      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      console.error('Error initializing media stream:', error);
      return null;
    }
  }

  /**
   * Handle mobile-specific WebRTC connection optimization
   */
  public getOptimizedRTCConfiguration(): RTCConfiguration {
    return {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ],
      iceTransportPolicy: 'all',
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require',
      // Mobile-specific optimizations
      iceCandidatePoolSize: 2, // Smaller pool for mobile
    };
  }

  /**
   * Handle device orientation changes for video
   */
  public setupOrientationHandler(videoElement: HTMLVideoElement): void {
    if (!this.isNative) return;

    const handleOrientationChange = () => {
      const isPortrait = window.matchMedia("(orientation: portrait)").matches;
      
      if (videoElement) {
        // Adjust video layout based on orientation
        if (isPortrait) {
          videoElement.style.transform = 'rotate(0deg)';
          videoElement.style.maxHeight = '40vh';
        } else {
          videoElement.style.transform = 'rotate(0deg)';
          videoElement.style.maxHeight = '80vh';
        }
      }
    };

    // Initial setup
    handleOrientationChange();
    
    // Listen for orientation changes
    window.addEventListener('orientationchange', handleOrientationChange);
  }

  /**
   * Clean up resources specific to mobile
   */
  public cleanup(): void {
    // Remove any event listeners or resources specific to mobile
    window.removeEventListener('orientationchange', () => {});
  }
}