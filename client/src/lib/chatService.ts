import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./useAuth";
import { apiRequest } from "./queryClient";

export interface ChatPreferences {
  preferredGender: 'male' | 'female' | 'any';
  country: string | null;
}

export interface Message {
  id: number;
  content: string;
  senderId: number;
  timestamp: Date;
}

export interface ChatService {
  connecting: boolean;
  connected: boolean;
  activeUsers: number;
  partnerId: number | null;
  sessionId: number | null;
  messages: Message[];
  partnerIsTyping: boolean;
  partnerDisconnected: boolean;
  joinQueue: (preferences: ChatPreferences) => void;
  leaveQueue: () => void;
  sendMessage: (content: string) => void;
  disconnect: () => void;
  setTyping: (isTyping: boolean) => void;
  reportPartner: (reason: string, details?: string) => Promise<void>;
}

export function useChatService(): ChatService {
  const { user } = useAuth();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [connected, setConnected] = useState<boolean>(false);
  const [activeUsers] = useState<number>(Math.floor(Math.random() * 5000) + 5000); // Mock active users count
  const [partnerId, setPartnerId] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [partnerIsTyping, setPartnerIsTyping] = useState<boolean>(false);
  const [partnerDisconnected, setPartnerDisconnected] = useState<boolean>(false);
  
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const initializeSocket = useCallback(() => {
    if (!user?.userId) return;
    
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws?uid=${user.userId}`;
    
    const newSocket = new WebSocket(wsUrl);
    
    newSocket.onopen = () => {
      console.log("WebSocket connection established");
    };
    
    newSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WebSocket message received:", data);
        
        switch (data.type) {
          case "connected":
            // Successfully connected to WebSocket server
            break;
            
          case "queue_joined":
            setConnecting(true);
            break;
            
          case "queue_left":
            setConnecting(false);
            break;
            
          case "match_found":
            setConnecting(false);
            setConnected(true);
            setPartnerId(data.partnerId);
            setSessionId(data.sessionId);
            setMessages([]);
            setPartnerDisconnected(false);
            break;
            
          case "message":
            setMessages(prev => [...prev, {
              id: data.message.id,
              content: data.message.content,
              senderId: data.message.senderId,
              timestamp: new Date(data.message.timestamp)
            }]);
            break;
            
          case "typing":
            setPartnerIsTyping(data.isTyping);
            break;
            
          case "partner_disconnected":
            setPartnerDisconnected(true);
            setConnected(false);
            setPartnerId(null);
            setSessionId(null);
            break;
            
          case "disconnected":
            setConnected(false);
            setPartnerId(null);
            setSessionId(null);
            break;
            
          case "banned":
            // Handle user being banned - redirect to payment page
            window.location.href = "/payment";
            break;
            
          case "unbanned":
            // Handle user being unbanned
            break;
            
          case "error":
            console.error("WebSocket error:", data.error);
            break;
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };
    
    newSocket.onclose = () => {
      console.log("WebSocket connection closed");
      setSocket(null);
    };
    
    newSocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
    
    setSocket(newSocket);
    
    return () => {
      newSocket.close();
    };
  }, [user?.userId]);
  
  useEffect(() => {
    if (user?.userId && !socket) {
      initializeSocket();
    }
    
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [user?.userId, socket, initializeSocket]);
  
  const sendSocketMessage = useCallback((type: string, data: any = {}) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type, data }));
    } else {
      console.warn("WebSocket not connected, cannot send message");
    }
  }, [socket]);
  
  const joinQueue = useCallback((preferences: ChatPreferences) => {
    sendSocketMessage("join_queue", preferences);
  }, [sendSocketMessage]);
  
  const leaveQueue = useCallback(() => {
    sendSocketMessage("leave_queue");
    setConnecting(false);
  }, [sendSocketMessage]);
  
  const sendMessage = useCallback((content: string) => {
    if (!content.trim()) return;
    
    sendSocketMessage("send_message", { content });
  }, [sendSocketMessage]);
  
  const disconnect = useCallback(() => {
    sendSocketMessage("disconnect");
    setConnected(false);
    setPartnerId(null);
    setSessionId(null);
  }, [sendSocketMessage]);
  
  const setTyping = useCallback((isTyping: boolean) => {
    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    
    sendSocketMessage("typing", { isTyping });
    
    // If typing, set a timeout to automatically clear the typing indicator
    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        sendSocketMessage("typing", { isTyping: false });
      }, 3000);
    }
  }, [sendSocketMessage]);
  
  const reportPartner = useCallback(async (reason: string, details?: string) => {
    if (!partnerId || !sessionId) {
      throw new Error("No active chat to report");
    }
    
    await apiRequest("POST", "/api/reports", {
      reporterId: user?.userId,
      reportedId: partnerId,
      sessionId: sessionId,
      reason,
      details
    });
  }, [partnerId, sessionId, user?.userId]);
  
  return {
    connecting,
    connected,
    activeUsers,
    partnerId,
    sessionId,
    messages,
    partnerIsTyping,
    partnerDisconnected,
    joinQueue,
    leaveQueue,
    sendMessage,
    disconnect,
    setTyping,
    reportPartner
  };
}
