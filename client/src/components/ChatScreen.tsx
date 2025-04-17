import { useState, useEffect } from "react";
import ConnectionStatus from "./ConnectionStatus";
import ChatInterface from "./ChatInterface";
import VideoCallInterface from "./VideoCallInterface";
import WelcomeScreen from "./WelcomeScreen";
import ConnectingScreen from "./ConnectingScreen";
import DisconnectedScreen from "./DisconnectedScreen";
import FilterModal from "./FilterModal";
import ReportModal from "./ReportModal";
import BanPaymentModal from "./BanPaymentModal";
import GenderSelectionScreen from "./GenderSelectionScreen";
import { useChatService, ChatPreferences } from "@/lib/chatService";
import { useAuth } from "@/lib/useAuth";

type ChatState = 'welcome' | 'gender-selection' | 'connecting' | 'chatting' | 'videochat' | 'disconnected';

export default function ChatScreen() {
  const [chatState, setChatState] = useState<ChatState>('welcome');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const { isBanned } = useAuth();
  const [showBanModal, setShowBanModal] = useState(false);
  const [useVideoChat, setUseVideoChat] = useState(false);
  
  const [preferences, setPreferences] = useState<ChatPreferences>({
    preferredGender: 'any',
    country: null
  });
  
  const [videoMessages, setVideoMessages] = useState<Array<{
    id: string;
    sender: 'me' | 'partner';
    content: string;
    timestamp: Date;
    translatedContent?: string;
    detectedLanguage?: string;
  }>>([
    // Sample messages for demo
    {
      id: '1',
      sender: 'partner',
      content: 'La mejor fiesta de todas! 🎉🎊🎉',
      timestamp: new Date(Date.now() - 60000 * 5),
      translatedContent: 'The best party ever! 🎉🎊🎉',
      detectedLanguage: 'Spanish'
    },
    {
      id: '2',
      sender: 'me',
      content: 'Bailamos toda la noche! Fue muy divertido...',
      timestamp: new Date(Date.now() - 60000 * 4)
    },
    {
      id: '3',
      sender: 'partner',
      content: 'Fue muy divertido... 😊',
      timestamp: new Date(Date.now() - 60000 * 3),
      translatedContent: 'It was a lot of fun... 😊',
      detectedLanguage: 'Spanish'
    },
    {
      id: '4',
      sender: 'partner',
      content: 'Te veo mañana! 👋😄',
      timestamp: new Date(Date.now() - 60000 * 2),
      translatedContent: 'See you tomorrow! 👋😄',
      detectedLanguage: 'Spanish'
    },
    {
      id: '5',
      sender: 'me',
      content: '¡Adiós, señorass! 👋',
      timestamp: new Date(Date.now() - 60000 * 1)
    }
  ]);
  
  const chatService = useChatService();
  
  // Show ban modal if user is banned
  useEffect(() => {
    if (isBanned) {
      setShowBanModal(true);
    }
  }, [isBanned]);
  
  const handleStartChat = () => {
    setChatState('gender-selection');
  };
  
  const handleContinueToMatching = () => {
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
  
  const handleToggleVideoChat = (useVideo: boolean) => {
    setUseVideoChat(useVideo);
  };
  
  const handleSendVideoMessage = (message: string) => {
    const newMessage = {
      id: crypto.randomUUID(),
      sender: 'me' as const,
      content: message,
      timestamp: new Date()
    };
    setVideoMessages(prev => [...prev, newMessage]);
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
  useEffect(() => {
    if (chatState === 'connecting' && chatService.connected) {
      setChatState(useVideoChat ? 'videochat' : 'chatting');
    }
    
    if ((chatState === 'chatting' || chatState === 'videochat') && chatService.partnerDisconnected) {
      setChatState('disconnected');
    }
  }, [chatState, chatService.connected, chatService.partnerDisconnected, useVideoChat]);
  
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
          onToggleVideoChat={handleToggleVideoChat}
        />
      )}
      
      {chatState === 'gender-selection' && (
        <GenderSelectionScreen 
          selectedGender={preferences.preferredGender}
          onSelectGender={(gender) => setPreferences(prev => ({ ...prev, preferredGender: gender }))}
          onContinue={handleContinueToMatching}
          onCancel={() => setChatState('welcome')}
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
      
      {chatState === 'videochat' && (
        <VideoCallInterface
          messages={videoMessages}
          onSendMessage={handleSendVideoMessage}
          onDisconnect={handleDisconnect}
          onFindNext={handleNewChat}
          myCountry={preferences.country ? {
            name: preferences.country.name,
            code: preferences.country.code,
            flag: preferences.country.flag
          } : { name: 'United States', code: 'us', flag: 'us' }}
          partnerCountry={{ name: 'Spain', code: 'es', flag: 'es' }}
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
