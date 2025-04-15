import { useState, useEffect, useRef } from "react";
import { Message } from "@/lib/chatService";
import { useAuth } from "@/lib/useAuth";
import { TypingIndicator } from "./ui/typing-indicator";

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
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPartnerTyping]);
  
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
  
  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-surface rounded-t-lg p-3 sm:p-4 flex justify-between items-center border-b border-gray-800">
        <div className="flex items-center">
          <div className="w-2.5 h-2.5 rounded-full bg-success mr-2"></div>
          <span className="text-text-primary font-medium">Stranger</span>
          {isPartnerTyping && (
            <span className="text-text-secondary text-xs ml-2">
              <TypingIndicator /> typing...
            </span>
          )}
        </div>
        <div>
          <button 
            className="text-text-secondary hover:text-error transition-colors mr-3" 
            title="Report"
            onClick={onReport}
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
              <path d="M3 21v-4a4 4 0 0 1 4-4h14" />
              <path d="M18 13V7a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v5" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="21" y1="3" x2="15" y2="9" />
            </svg>
          </button>
          <button 
            className="text-text-secondary hover:text-error transition-colors" 
            title="Disconnect"
            onClick={onDisconnect}
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 bg-surface overflow-y-auto p-4 space-y-4" style={{ height: "350px" }}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start ${
              message.senderId === user?.userId ? "justify-end" : ""
            } mb-4`}
          >
            <div
              className={`chat-bubble ${
                message.senderId === user?.userId
                  ? "bg-primary text-white"
                  : "bg-surface-light text-text-primary"
              } rounded-lg py-2 px-4 max-w-[80%] break-words`}
            >
              {message.content}
            </div>
          </div>
        ))}
        
        {isPartnerTyping && (
          <div className="flex items-start mb-4">
            <div className="bg-surface-light text-text-primary rounded-lg py-2 px-4">
              <TypingIndicator />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="bg-surface rounded-b-lg p-3 border-t border-gray-800">
        <form className="flex items-center" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 bg-surface-light text-text-primary rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
            value={messageInput}
            onChange={handleInputChange}
          />
          <button
            type="submit"
            className="bg-primary hover:bg-blue-600 text-white rounded-lg p-2 ml-2 transition-colors"
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
          </button>
        </form>
      </div>
    </div>
  );
}
