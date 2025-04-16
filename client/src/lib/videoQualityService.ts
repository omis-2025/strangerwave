/**
 * Video Quality Management Service for StrangerWave
 * 
 * This service manages the dynamic adjustment of video quality based on:
 * 1. Network conditions (using navigator.connection API)
 * 2. User preferences (manual settings for premium users)
 * 3. Bandwidth saving mode
 * 
 * Quality tiers:
 * - low: 320x240, 15fps (poor connections, mobile data saving)
 * - medium: 640x480, 24fps (standard quality, stable connections)
 * - high: 1280x720, 30fps (good connections, premium users)
 * - hd: 1920x1080, 30fps (excellent connections, premium users only)
 */

export type VideoQuality = 'low' | 'medium' | 'high' | 'hd';

type ConnectionType = 'slow-2g' | '2g' | '3g' | '4g' | '5g' | 'wifi' | 'ethernet' | 'cellular' | 'unknown';

// Interface for NetworkInformation from Navigator API
interface NetworkInformation extends EventTarget {
  readonly downlink: number;
  readonly effectiveType: ConnectionType;
  readonly rtt: number;
  readonly saveData: boolean;
  readonly type: ConnectionType;
  onChange?: EventListener;
}

// Extend Navigator interface to include connection property
interface ExtendedNavigator extends Navigator {
  connection?: NetworkInformation;
  mozConnection?: NetworkInformation;
  webkitConnection?: NetworkInformation;
}

/**
 * Get the Network Information API if available
 */
export function getNetworkInfo(): NetworkInformation | null {
  const navigator = window.navigator as ExtendedNavigator;
  return navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
}

/**
 * Get a user-friendly description of the current network quality
 */
export function getNetworkQualityDescription(): string {
  const connection = getNetworkInfo();
  
  if (!connection) {
    return 'Unknown connection';
  }
  
  if (connection.saveData) {
    return 'Data saving mode';
  }
  
  let description = '';
  
  // Connection type based description
  if (connection.type === 'wifi') {
    description = 'WiFi';
  } else if (connection.type === 'ethernet') {
    description = 'Wired connection';
  } else if (connection.type === 'cellular') {
    description = 'Mobile data';
  } else if (connection.effectiveType === '4g' || connection.effectiveType === '5g') {
    description = 'Fast mobile data';
  } else if (connection.effectiveType === '3g') {
    description = 'Mobile data';
  } else if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
    description = 'Slow connection';
  } else {
    description = connection.effectiveType || 'Connection';
  }
  
  // Add speed indicator if available
  if (connection.downlink) {
    const mbps = connection.downlink.toFixed(1);
    description += ` (${mbps} Mbps)`;
  }
  
  return description;
}

/**
 * Determine the optimal video quality based on network conditions
 * Premium users get access to higher quality settings even in medium quality networks
 */
export function determineOptimalVideoQuality(isPremiumUser: boolean = false): VideoQuality {
  const connection = getNetworkInfo();
  
  // Default to medium quality if we can't detect connection info
  if (!connection) {
    return isPremiumUser ? 'high' : 'medium';
  }
  
  // Honor data saving mode
  if (connection.saveData) {
    return 'low';
  }
  
  // Use effective connection type to determine quality
  switch (connection.effectiveType) {
    case 'slow-2g':
    case '2g':
      return 'low';
    
    case '3g':
      return isPremiumUser ? 'medium' : 'low';
    
    case '4g':
      return isPremiumUser ? 'high' : 'medium';
      
    default:
      // If connection type is unavailable, use downlink speed
      if (connection.downlink) {
        if (connection.downlink < 1.5) {
          return 'low';
        } else if (connection.downlink < 5) {
          return isPremiumUser ? 'medium' : 'low';
        } else if (connection.downlink < 10) {
          return isPremiumUser ? 'high' : 'medium';
        } else {
          return isPremiumUser ? 'hd' : 'high';
        }
      }
  }
  
  // Default fallback based on connection type
  if (connection.type === 'wifi' || connection.type === 'ethernet') {
    return isPremiumUser ? 'high' : 'medium';
  }
  
  return isPremiumUser ? 'medium' : 'low';
}

/**
 * Get MediaTrackConstraints for video based on quality level
 */
export function getVideoConstraints(quality: VideoQuality): MediaTrackConstraints {
  switch (quality) {
    case 'low':
      return {
        width: { ideal: 320 },
        height: { ideal: 240 },
        frameRate: { max: 15 },
      };
    
    case 'medium':
      return {
        width: { ideal: 640 },
        height: { ideal: 480 },
        frameRate: { max: 24 },
      };
    
    case 'high':
      return {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { max: 30 },
      };
      
    case 'hd':
      return {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { max: 30 },
      };
      
    default:
      return {
        width: { ideal: 640 },
        height: { ideal: 480 },
        frameRate: { max: 24 },
      };
  }
}

/**
 * Set up a listener for network quality changes
 * Returns a cleanup function to remove the listener
 */
export function setupQualityChangeListener(
  onQualityChange: (quality: VideoQuality) => void,
  isPremiumUser: boolean = false
): () => void {
  const connection = getNetworkInfo();
  
  if (!connection) {
    // If connection info isn't available, no need for a listener
    return () => {};
  }
  
  const handleConnectionChange = () => {
    const newQuality = determineOptimalVideoQuality(isPremiumUser);
    onQualityChange(newQuality);
  };
  
  // Add event listener
  try {
    connection.addEventListener('change', handleConnectionChange);
    
    // Cleanup function
    return () => {
      connection.removeEventListener('change', handleConnectionChange);
    };
  } catch (error) {
    console.error('Error setting up network quality listener:', error);
    return () => {};
  }
}

/**
 * Estimate current bandwidth and adjust quality accordingly
 * This can be used as an alternative when navigator.connection is not available
 */
export function estimateBandwidth(
  videoElement: HTMLVideoElement,
  onBandwidthEstimate: (mbps: number) => void
): () => void {
  let lastLoadedBytes = 0;
  let intervalId: number;
  
  const estimateInterval = () => {
    try {
      // This access might throw an error due to cross-origin restrictions
      // Using non-standard browser properties to estimate video bitrate
      // @ts-ignore - TypeScript doesn't know about these browser-specific properties
      const videoFile = videoElement.webkitVideoDecodedByteCount || 
                        // @ts-ignore - Mozilla-specific properties
                        (videoElement as any).mozDecodedBytes ||
                        // @ts-ignore - Mozilla-specific properties
                        (videoElement as any).mozParsedBytes || 0;
      
      if (lastLoadedBytes > 0) {
        const bytesDelta = videoFile - lastLoadedBytes;
        const bitsDelta = bytesDelta * 8;
        const mbpsDelta = (bitsDelta / 1000000);
        
        // Only report positive values
        if (mbpsDelta > 0) {
          onBandwidthEstimate(mbpsDelta);
        }
      }
      
      lastLoadedBytes = videoFile;
    } catch (e) {
      console.warn('Cannot estimate bandwidth using video metrics', e);
      clearInterval(intervalId);
    }
  };
  
  // Check every second
  intervalId = window.setInterval(estimateInterval, 1000);
  
  return () => {
    clearInterval(intervalId);
  };
}

/**
 * Get the estimated video bitrate needed for a quality level
 */
export function getEstimatedBitrate(quality: VideoQuality): number {
  switch (quality) {
    case 'low': return 300; // ~300kbps
    case 'medium': return 1000; // ~1Mbps
    case 'high': return 2500; // ~2.5Mbps
    case 'hd': return 5000; // ~5Mbps
    default: return 1000;
  }
}