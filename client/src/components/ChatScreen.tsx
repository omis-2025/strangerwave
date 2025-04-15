import { useState } from "react";
import ConnectionStatus from "./ConnectionStatus";
import ChatInterface from "./ChatInterface";
import WelcomeScreen from "./WelcomeScreen";
import ConnectingScreen from "./ConnectingScreen";
import DisconnectedScreen from "./DisconnectedScreen";
import FilterModal from "./FilterModal";
import ReportModal from "./ReportModal";
import BanPaymentModal from "./BanPaymentModal";
import { useChatService, ChatPreferences } from "@/lib/chatService";
import { useAuth } from "@/lib/useAuth";

type ChatState = 'welcome' | 'connecting' | 'chatting' | 'disconnected';

export default function ChatScreen() {
  const [chatState, setChatState] = useState<ChatState>('welcome');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const { isBanned } = useAuth();
  const [showBanModal, setShowBanModal] = useState(false);
  
  const [preferences, setPreferences] = useState<ChatPreferences>({
    preferredGender: 'any',
    country: null
  });
  
  const chatService = useChatService();
  
  // Show ban modal if user is banned
  useState(() => {
    if (isBanned) {
      setShowBanModal(true);
    }
  });
  
  const handleStartChat = () => {
    setChatState('connecting');
    chatService.joinQueue(preferences);
  };
  
  const handleCancelConnecting = () => {
    chatService.leaveQueue();
    setChatState('welcome');
  };
  
  const handleDisconnect = () => {
    chatService.disconnect();
    setChatState('disconnected');
  };
  
  const handleNewChat = () => {
    setChatState('connecting');
    chatService.joinQueue(preferences);
  };
  
  const handleBackToWelcome = () => {
    setChatState('welcome');
  };
  
  const handleSavePreferences = (newPreferences: ChatPreferences) => {
    setPreferences(newPreferences);
    setShowFilterModal(false);
  };
  
  const handleReport = async (reason: string, details?: string) => {
    try {
      await chatService.reportPartner(reason, details);
      setShowReportModal(false);
    } catch (error) {
      console.error("Error reporting partner:", error);
    }
  };
  
  // Update state based on chat service events
  if (chatState === 'connecting' && chatService.connected) {
    setChatState('chatting');
  }
  
  if (chatState === 'chatting' && chatService.partnerDisconnected) {
    setChatState('disconnected');
  }
  
  return (
    <main className="flex-1 container mx-auto px-4 sm:px-6 py-6 flex flex-col">
      <ConnectionStatus 
        connected={chatService.connected} 
        activeUsers={chatService.activeUsers} 
      />
      
      {chatState === 'welcome' && (
        <WelcomeScreen 
          onStartChat={handleStartChat}
          onShowFilters={() => setShowFilterModal(true)}
        />
      )}
      
      {chatState === 'connecting' && (
        <ConnectingScreen onCancel={handleCancelConnecting} />
      )}
      
      {chatState === 'chatting' && (
        <ChatInterface 
          messages={chatService.messages}
          partnerId={chatService.partnerId}
          isPartnerTyping={chatService.partnerIsTyping}
          onSendMessage={chatService.sendMessage}
          onTyping={chatService.setTyping}
          onDisconnect={handleDisconnect}
          onReport={() => setShowReportModal(true)}
        />
      )}
      
      {chatState === 'disconnected' && (
        <DisconnectedScreen 
          onNewChat={handleNewChat}
          onBackToWelcome={handleBackToWelcome}
        />
      )}
      
      {/* Modals */}
      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onSave={handleSavePreferences}
        initialPreferences={preferences}
      />
      
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleReport}
      />
      
      <BanPaymentModal
        isOpen={showBanModal}
        onClose={() => setShowBanModal(false)}
      />
    </main>
  );
}
