/**
 * Service to detect network conditions and adjust video quality accordingly
 */

export type VideoQuality = 'low' | 'medium' | 'high' | 'hd';

export interface VideoConstraints {
  width: { ideal: number };
  height: { ideal: number };
  frameRate: { max: number };
}

interface NetworkInfo {
  type: string | null;
  effectiveType: string | null;
  downlink: number | null;
  rtt: number | null;
  saveData: boolean | null;
}

// Video quality presets
const VIDEO_QUALITY_PRESETS: Record<VideoQuality, VideoConstraints> = {
  low: {
    width: { ideal: 320 },
    height: { ideal: 240 },
    frameRate: { max: 15 }
  },
  medium: {
    width: { ideal: 640 },
    height: { ideal: 480 },
    frameRate: { max: 20 }
  },
  high: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { max: 30 }
  },
  hd: {
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    frameRate: { max: 30 }
  }
};

/**
 * Get network information using Navigator.connection if available
 */
export function getNetworkInfo(): NetworkInfo {
  // Check if the browser supports the NetworkInformation API
  const connection = (navigator as any).connection;
  
  if (!connection) {
    return {
      type: null,
      effectiveType: null,
      downlink: null,
      rtt: null,
      saveData: null
    };
  }
  
  return {
    type: connection.type || null,
    effectiveType: connection.effectiveType || null,
    downlink: connection.downlink || null,
    rtt: connection.rtt || null,
    saveData: connection.saveData || null
  };
}

/**
 * Determine the optimal video quality based on network conditions
 */
export function determineOptimalVideoQuality(isPremiumUser: boolean = false): VideoQuality {
  const networkInfo = getNetworkInfo();
  
  // If network info is not available, default to medium quality
  if (!networkInfo.effectiveType && !networkInfo.downlink) {
    return isPremiumUser ? 'high' : 'medium';
  }
  
  // If save data is enabled, use low quality
  if (networkInfo.saveData) {
    return 'low';
  }
  
  // Based on effective connection type
  if (networkInfo.effectiveType) {
    switch (networkInfo.effectiveType) {
      case 'slow-2g':
      case '2g':
        return 'low';
      case '3g':
        return isPremiumUser ? 'medium' : 'low';
      case '4g':
        return isPremiumUser ? 'high' : 'medium';
      default:
        return isPremiumUser ? 'medium' : 'low';
    }
  }
  
  // Based on downlink speed (Mbps)
  if (networkInfo.downlink) {
    if (networkInfo.downlink < 1) {
      return 'low';
    } else if (networkInfo.downlink < 3) {
      return isPremiumUser ? 'medium' : 'low';
    } else if (networkInfo.downlink < 8) {
      return isPremiumUser ? 'high' : 'medium';
    } else {
      return isPremiumUser ? 'hd' : 'high';
    }
  }
  
  // Default fallback
  return isPremiumUser ? 'high' : 'medium';
}

/**
 * Get video constraints based on quality level
 */
export function getVideoConstraints(quality: VideoQuality): VideoConstraints {
  return VIDEO_QUALITY_PRESETS[quality];
}

/**
 * Setup quality change listener that updates when network conditions change
 */
export function setupQualityChangeListener(
  callback: (quality: VideoQuality) => void,
  isPremiumUser: boolean = false
): (() => void) {
  const connection = (navigator as any).connection;
  
  if (!connection) {
    // If connection API not supported, just determine quality once
    const initialQuality = determineOptimalVideoQuality(isPremiumUser);
    callback(initialQuality);
    return () => {}; // Return empty cleanup function
  }
  
  // Initial quality determination
  const initialQuality = determineOptimalVideoQuality(isPremiumUser);
  callback(initialQuality);
  
  // Set up connection change listener
  const handleConnectionChange = () => {
    const newQuality = determineOptimalVideoQuality(isPremiumUser);
    callback(newQuality);
  };
  
  connection.addEventListener('change', handleConnectionChange);
  
  // Return cleanup function
  return () => {
    connection.removeEventListener('change', handleConnectionChange);
  };
}

/**
 * Create a string description of current network conditions
 */
export function getNetworkQualityDescription(): string {
  const networkInfo = getNetworkInfo();
  
  if (!networkInfo.effectiveType && !networkInfo.downlink) {
    return 'Unknown connection';
  }
  
  let description = '';
  
  if (networkInfo.effectiveType) {
    switch (networkInfo.effectiveType) {
      case 'slow-2g':
        description = 'Very slow connection';
        break;
      case '2g':
        description = 'Slow connection';
        break;
      case '3g':
        description = 'Good connection';
        break;
      case '4g':
        description = 'Excellent connection';
        break;
      default:
        description = 'Good connection';
    }
  } else if (networkInfo.downlink) {
    if (networkInfo.downlink < 1) {
      description = 'Poor connection';
    } else if (networkInfo.downlink < 3) {
      description = 'Fair connection';
    } else if (networkInfo.downlink < 8) {
      description = 'Good connection';
    } else {
      description = 'Excellent connection';
    }
  }
  
  if (networkInfo.saveData) {
    description += ' (Data Saver enabled)';
  }
  
  return description;
}