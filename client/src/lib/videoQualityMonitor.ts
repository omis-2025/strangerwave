import analytics, { VideoQualityEvent } from './analytics';

interface VideoStats {
  resolution: string;
  fps: number;
  bitrate: number;
  packetsLost: number;
  jitter: number;
  roundTripTime: number;
  timestamp: number;
}

/**
 * VideoQualityMonitor utility to track video call quality metrics and issues
 */
class VideoQualityMonitor {
  private static instance: VideoQualityMonitor;
  private isMonitoring = false;
  private statsInterval: ReturnType<typeof setInterval> | null = null;
  private lastStats: VideoStats | null = null;
  private freezeDetectionThreshold = 500; // ms without frame updates to consider as freeze
  private lagThreshold = 250; // ms round trip time to consider as lag
  private packetLossThreshold = 2; // % packet loss to report
  private lowBitrateThreshold = 100; // kbps
  private buffering = false;

  // Peer connection and media streams
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  public static getInstance(): VideoQualityMonitor {
    if (!VideoQualityMonitor.instance) {
      VideoQualityMonitor.instance = new VideoQualityMonitor();
    }
    return VideoQualityMonitor.instance;
  }

  /**
   * Initialize monitoring with WebRTC peer connection and streams
   * @param peerConnection WebRTC peer connection
   * @param localStream Local media stream
   * @param remoteStream Remote media stream
   */
  public initialize(
    peerConnection: RTCPeerConnection,
    localStream: MediaStream,
    remoteStream: MediaStream
  ): void {
    this.peerConnection = peerConnection;
    this.localStream = localStream;
    this.remoteStream = remoteStream;

    // Listen for connection state changes
    this.peerConnection.addEventListener('connectionstatechange', this.handleConnectionStateChange.bind(this));
    
    // Listen for ICE connection state changes
    this.peerConnection.addEventListener('iceconnectionstatechange', this.handleIceConnectionStateChange.bind(this));
  }

  /**
   * Start monitoring video quality
   * @param callId Unique ID for the current call
   */
  public startMonitoring(callId: string): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.lastStats = null;
    
    // Start periodic stats collection
    this.statsInterval = setInterval(() => {
      this.collectStats(callId);
    }, 1000);
    
    // Track monitoring start
    analytics.trackVideoQuality(VideoQualityEvent.QualityChanged, {
      call_id: callId,
      monitoring_started: true,
      has_local_stream: !!this.localStream,
      has_remote_stream: !!this.remoteStream
    });
  }

  /**
   * Stop monitoring video quality
   */
  public stopMonitoring(): void {
    if (!this.isMonitoring) return;
    
    // Clear stats collection interval
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }
    
    this.isMonitoring = false;
    this.lastStats = null;
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
  }

  /**
   * Manually report buffering start
   * @param callId Unique ID for the current call
   */
  public reportBufferingStart(callId: string): void {
    if (this.buffering) return;
    
    this.buffering = true;
    analytics.trackVideoQuality(VideoQualityEvent.BufferingStart, {
      call_id: callId,
      timestamp: Date.now()
    });
  }

  /**
   * Manually report buffering end
   * @param callId Unique ID for the current call
   * @param bufferingDurationMs Duration of buffering in milliseconds
   */
  public reportBufferingEnd(callId: string, bufferingDurationMs: number): void {
    if (!this.buffering) return;
    
    this.buffering = false;
    analytics.trackVideoQuality(VideoQualityEvent.BufferingEnd, {
      call_id: callId,
      buffering_duration_ms: bufferingDurationMs,
      timestamp: Date.now()
    });
  }

  /**
   * Collect WebRTC stats and analyze for quality issues
   */
  private async collectStats(callId: string): Promise<void> {
    if (!this.peerConnection) return;
    
    try {
      const stats = await this.peerConnection.getStats();
      const now = Date.now();
      
      // Process stats and extract video metrics
      const videoStats: VideoStats = {
        resolution: '',
        fps: 0,
        bitrate: 0,
        packetsLost: 0,
        jitter: 0,
        roundTripTime: 0,
        timestamp: now
      };
      
      // Iterate through all stats
      stats.forEach((stat) => {
        if (stat.type === 'inbound-rtp' && stat.kind === 'video') {
          // Video resolution (if available)
          if (stat.frameWidth && stat.frameHeight) {
            videoStats.resolution = `${stat.frameWidth}x${stat.frameHeight}`;
          }
          
          // Frame rate
          if (stat.framesPerSecond) {
            videoStats.fps = Math.round(stat.framesPerSecond);
          }
          
          // Packet loss
          if (stat.packetsLost && stat.packetsReceived) {
            const totalPackets = stat.packetsLost + stat.packetsReceived;
            videoStats.packetsLost = totalPackets > 0 ? (stat.packetsLost / totalPackets) * 100 : 0;
          }
          
          // Jitter
          if (stat.jitter) {
            videoStats.jitter = stat.jitter * 1000; // Convert to ms
          }
        }
        
        // Bitrate calculation (if bytes information available)
        if ((stat.type === 'inbound-rtp' || stat.type === 'remote-inbound-rtp') && stat.kind === 'video') {
          if (stat.bytesReceived && this.lastStats) {
            const bytesDelta = stat.bytesReceived - (this.lastStats as any).bytesReceived || 0;
            const timeDelta = now - this.lastStats.timestamp;
            
            if (timeDelta > 0) {
              // Calculate bitrate in kbps
              videoStats.bitrate = Math.round((bytesDelta * 8) / timeDelta); // bits per ms -> kbps
            }
          }
        }
        
        // Round trip time
        if (stat.type === 'remote-inbound-rtp' && stat.kind === 'video') {
          if (stat.roundTripTime) {
            videoStats.roundTripTime = stat.roundTripTime * 1000; // Convert to ms
          }
        }
      });
      
      // Detect and report quality issues
      this.detectQualityIssues(videoStats, callId);
      
      // Store current stats for next comparison
      this.lastStats = videoStats;
      
    } catch (error) {
      console.error('Error collecting WebRTC stats:', error);
    }
  }

  /**
   * Detect quality issues based on collected stats
   */
  private detectQualityIssues(stats: VideoStats, callId: string): void {
    // Skip first stats collection (need at least 2 samples to detect issues)
    if (!this.lastStats) return;
    
    // Resolution change detection
    if (stats.resolution && this.lastStats.resolution !== stats.resolution) {
      analytics.trackVideoQuality(VideoQualityEvent.QualityChanged, {
        call_id: callId,
        old_resolution: this.lastStats.resolution,
        new_resolution: stats.resolution,
        timestamp: stats.timestamp
      });
    }
    
    // Packet loss detection
    if (stats.packetsLost > this.packetLossThreshold) {
      analytics.trackVideoQuality(VideoQualityEvent.PacketLoss, {
        call_id: callId,
        packet_loss_percentage: stats.packetsLost.toFixed(2),
        timestamp: stats.timestamp
      });
    }
    
    // Lag detection
    if (stats.roundTripTime > this.lagThreshold) {
      analytics.trackVideoQuality(VideoQualityEvent.Lag, {
        call_id: callId,
        round_trip_time_ms: stats.roundTripTime.toFixed(2),
        timestamp: stats.timestamp
      });
    }
    
    // Low bitrate detection
    if (stats.bitrate > 0 && stats.bitrate < this.lowBitrateThreshold) {
      analytics.trackVideoQuality(VideoQualityEvent.LowBandwidth, {
        call_id: callId,
        bitrate_kbps: stats.bitrate,
        timestamp: stats.timestamp
      });
    }
    
    // Freeze detection (FPS dropped to 0 or very low)
    if (this.lastStats.fps > 0 && stats.fps === 0) {
      analytics.trackVideoQuality(VideoQualityEvent.Frozen, {
        call_id: callId,
        timestamp: stats.timestamp
      });
    }
  }

  /**
   * Handle connection state changes
   */
  private handleConnectionStateChange(): void {
    if (!this.peerConnection) return;
    
    const state = this.peerConnection.connectionState;
    
    // Track connection issues
    if (state === 'disconnected' || state === 'failed' || state === 'closed') {
      analytics.trackVideoQuality(VideoQualityEvent.ConnectionIssue, {
        connection_state: state,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Handle ICE connection state changes
   */
  private handleIceConnectionStateChange(): void {
    if (!this.peerConnection) return;
    
    const state = this.peerConnection.iceConnectionState;
    
    // Track ICE connection issues
    if (state === 'disconnected' || state === 'failed' || state === 'closed') {
      analytics.trackVideoQuality(VideoQualityEvent.ConnectionIssue, {
        ice_connection_state: state,
        timestamp: Date.now()
      });
    }
  }
}

// Create and export singleton instance
const videoQualityMonitor = VideoQualityMonitor.getInstance();
export default videoQualityMonitor;