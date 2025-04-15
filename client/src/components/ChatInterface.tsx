import { useState, useEffect, useRef } from "react";
import { Message } from "@/lib/chatService";
import { useAuth } from "@/lib/useAuth";
import { TypingIndicator } from "./ui/typing-indicator";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

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
      <div className="bg-gray-900 p-3 sm:p-4 flex justify-between items-center border-b border-gray-800">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-800 mr-3">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 text-gray-400" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div>
            <div className="flex items-center">
              <span className="font-medium text-gray-200">Stranger</span>
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
            size="sm"
            onClick={onReport}
            className="text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors mr-1"
            title="Report user"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onDisconnect}
            className="text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
            title="Disconnect"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
              <line x1="12" y1="2" x2="12" y2="12"></line>
            </svg>
          </Button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 bg-gray-800 overflow-y-auto p-4 space-y-3" style={{ height: "350px" }}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-12 w-12 mb-3 text-gray-600" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <p className="text-sm">No messages yet. Say hello!</p>
          </div>
        )}
        
        {messages.map((message, index) => {
          const isSender = message.senderId === user?.userId;
          const isFirstInGroup = index === 0 || messages[index - 1].senderId !== message.senderId;
          const isLastInGroup = index === messages.length - 1 || messages[index + 1].senderId !== message.senderId;
          
          return (
            <div
              key={message.id}
              className={`flex ${isSender ? "justify-end" : "justify-start"} ${isLastInGroup ? "mb-4" : "mb-0.5"}`}
            >
              {/* User Avatar (only show for first message in group from other user) */}
              {!isSender && isFirstInGroup && (
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center mr-2">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4 text-gray-400" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                </div>
              )}
              
              <div className={`flex flex-col ${!isSender && !isFirstInGroup ? "pl-10" : ""}`}>
                {/* User name and timestamp (only show for first message in group) */}
                {isFirstInGroup && (
                  <div className={`flex items-center mb-1 ${isSender ? "justify-end" : "justify-start"}`}>
                    {!isSender && <span className="text-xs font-medium text-gray-400 mr-1">Stranger</span>}
                    <span className="text-xs text-gray-500">{formatMessageTime(message.timestamp)}</span>
                  </div>
                )}
                
                {/* Message bubble */}
                <div className={`
                  flex max-w-[80%] 
                  ${isSender ? "ml-auto" : ""}
                `}>
                  <div className={`
                    py-2 px-4 rounded-lg break-words
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
          <div className="flex items-start mb-4 pl-10">
            <div className="bg-gray-700 text-gray-200 rounded-lg rounded-tl-none py-2 px-4">
              <TypingIndicator />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="bg-gray-900 p-3 border-t border-gray-800">
        <form className="flex items-center" onSubmit={handleSubmit}>
          <div className="relative flex-1">
            <input
              type="text"
              ref={inputRef}
              placeholder="Type a message..."
              className="w-full bg-gray-700 text-gray-200 rounded-full py-2 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={messageInput}
              onChange={handleInputChange}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center text-gray-400">
              <button type="button" className="p-1 hover:text-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
                  <circle cx="12" cy="13" r="3"></circle>
                </svg>
              </button>
            </div>
          </div>
          <Button
            type="submit"
            className="ml-2 bg-primary hover:bg-primary/90 text-white rounded-full p-2 flex items-center justify-center"
            size="icon"
            disabled={!messageInput.trim()}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </Button>
        </form>
      </div>
    </div>
  );
}
