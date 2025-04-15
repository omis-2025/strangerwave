import { useState, useEffect, useRef } from "react";
import { Message } from "@/lib/chatService";
import { useAuth } from "@/lib/useAuth";
import { TypingIndicator } from "./ui/typing-indicator";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { FlexContainer } from "@/components/ui/responsive-container";
import { useIsMobile } from "@/hooks/use-mobile";
import { Flag, LogOut, Send, Image, User } from "lucide-react";

interface ChatInterfaceProps {
  messages: Message[];
  partnerId: number | null;
  isPartnerTyping: boolean;
  onSendMessage: (content: string) => void;
  onTyping: (isTyping: boolean) => void;
  onDisconnect: () => void;
  onReport: () => void;
}

export default function ChatInterface({
  messages,
  partnerId,
  isPartnerTyping,
  onSendMessage,
  onTyping,
  onDisconnect,
  onReport
}: ChatInterfaceProps) {
  const { user } = useAuth();
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPartnerTyping]);
  
  // Focus on input when chat loads
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim()) {
      onSendMessage(messageInput);
      setMessageInput("");
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    onTyping(e.target.value.length > 0);
  };
  
  // Format timestamp for messages
  const formatMessageTime = (timestamp: Date) => {
    const date = new Date(timestamp);
    return format(date, 'h:mm a');
  };
  
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden rounded-lg border border-gray-800 shadow-lg">
      {/* Chat Header */}
      <div className="bg-gray-900 p-2 sm:p-4 flex justify-between items-center border-b border-gray-800">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-800 mr-2 sm:mr-3">
            <User className="h-4 w-4 text-gray-400" />
          </div>
          <div>
            <div className="flex items-center">
              <span className="font-medium text-gray-200 text-sm sm:text-base">Stranger</span>
              <div className="w-2 h-2 rounded-full bg-green-500 ml-2"></div>
            </div>
            {isPartnerTyping && (
              <span className="text-gray-400 text-xs">
                <TypingIndicator /> typing...
              </span>
            )}
          </div>
        </div>
        <div className="flex">
          <Button 
            variant="ghost" 
            size={isMobile ? "sm" : "default"}
            onClick={onReport}
            className="text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors mr-1 p-1 sm:p-2"
            title="Report user"
          >
            <Flag className="h-4 w-4 sm:h-5 sm:w-5" />
            {!isMobile && <span className="ml-1 hidden sm:inline">Report</span>}
          </Button>
          <Button 
            variant="ghost" 
            size={isMobile ? "sm" : "default"}
            onClick={onDisconnect}
            className="text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors p-1 sm:p-2"
            title="Disconnect"
          >
            <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
            {!isMobile && <span className="ml-1 hidden sm:inline">Leave</span>}
          </Button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 bg-gray-800 overflow-y-auto p-2 sm:p-4 space-y-3" style={{ height: "calc(100vh - 170px)" }}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-8 w-8 sm:h-12 sm:w-12 mb-3 text-gray-600" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <p className="text-xs sm:text-sm text-center px-2">No messages yet. Say hello to your new chat partner!</p>
          </div>
        )}
        
        {messages.map((message, index) => {
          const isSender = message.senderId === user?.userId;
          const isFirstInGroup = index === 0 || messages[index - 1].senderId !== message.senderId;
          const isLastInGroup = index === messages.length - 1 || messages[index + 1].senderId !== message.senderId;
          
          return (
            <div
              key={message.id}
              className={`flex ${isSender ? "justify-end" : "justify-start"} ${isLastInGroup ? "mb-3 sm:mb-4" : "mb-0.5"}`}
            >
              {/* User Avatar (only show for first message in group from other user) */}
              {!isSender && isFirstInGroup && (
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gray-700 flex items-center justify-center mr-1 sm:mr-2">
                    <User className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                  </div>
                </div>
              )}
              
              <div className={`flex flex-col ${!isSender && !isFirstInGroup ? "pl-7 sm:pl-10" : ""}`}>
                {/* User name and timestamp (only show for first message in group) */}
                {isFirstInGroup && (
                  <div className={`flex items-center mb-1 ${isSender ? "justify-end" : "justify-start"}`}>
                    {!isSender && <span className="text-xs font-medium text-gray-400 mr-1">Stranger</span>}
                    <span className="text-xs text-gray-500">{formatMessageTime(message.timestamp)}</span>
                  </div>
                )}
                
                {/* Message bubble */}
                <div className={`
                  flex max-w-[80%] md:max-w-[70%]
                  ${isSender ? "ml-auto" : ""}
                `}>
                  <div className={`
                    py-1.5 px-3 sm:py-2 sm:px-4 rounded-lg break-words text-xs sm:text-sm
                    ${isSender 
                      ? "bg-primary/90 text-white rounded-tr-none" 
                      : "bg-gray-700 text-gray-200 rounded-tl-none"
                    }
                  `}>
                    {message.content}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Typing indicator */}
        {isPartnerTyping && (
          <div className="flex items-start mb-4 pl-7 sm:pl-10">
            <div className="bg-gray-700 text-gray-200 rounded-lg rounded-tl-none py-1.5 px-3 sm:py-2 sm:px-4">
              <TypingIndicator />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="bg-gray-900 p-2 sm:p-3 border-t border-gray-800">
        <form className="flex items-center" onSubmit={handleSubmit}>
          <div className="relative flex-1">
            <input
              type="text"
              ref={inputRef}
              placeholder="Type a message..."
              className="w-full bg-gray-700 text-gray-200 text-sm sm:text-base rounded-full py-1.5 sm:py-2 px-3 sm:px-4 pr-8 sm:pr-10 focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={messageInput}
              onChange={handleInputChange}
            />
            {!isMobile && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center text-gray-400">
                <button type="button" className="p-1 hover:text-gray-200">
                  <Image className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            )}
          </div>
          <Button
            type="submit"
            className="ml-1 sm:ml-2 bg-primary hover:bg-primary/90 text-white rounded-full p-1.5 sm:p-2 flex items-center justify-center"
            size="icon"
            disabled={!messageInput.trim()}
          >
            <Send className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
