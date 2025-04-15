import { useState, useEffect, useRef } from "react";
import { Message } from "@/lib/chatService";
import { useAuth } from "@/lib/useAuth";
import { TypingIndicator } from "./ui/typing-indicator";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { FlexContainer } from "@/components/ui/responsive-container";
import { useIsMobile } from "@/hooks/use-mobile";
import { Flag, LogOut, Send, Image, User, Shield, Lock, Info, AlertTriangle, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gray-800 mr-2 sm:mr-3">
            <User className="h-4 w-4 text-gray-400" />
            {/* Online indicator */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                repeat: Infinity, 
                repeatType: "reverse", 
                duration: 2 
              }}
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-gray-800"
            />
          </div>
          <div>
            <div className="flex items-center">
              <span className="font-medium text-gray-200 text-sm sm:text-base">Stranger</span>
              <div className="flex items-center ml-2 px-1.5 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1"></span>
                <span className="text-xs text-green-400">online</span>
              </div>
            </div>
            {isPartnerTyping && (
              <span className="text-gray-400 text-xs flex items-center">
                <TypingIndicator /> typing...
              </span>
            )}
          </div>
        </div>
        <div className="flex">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
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
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
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
          </motion.div>
        </div>
      </div>
      
      {/* Security badge - provides trust element */}
      <div className="bg-gray-800 py-1 px-2 flex justify-center items-center border-b border-gray-700">
        <div className="flex items-center space-x-1 text-xs text-gray-400">
          <Lock className="h-3 w-3 text-primary" />
          <span>End-to-end encrypted chat</span>
          <span className="text-gray-500">•</span>
          <Shield className="h-3 w-3 text-green-500" />
          <span>AI moderated</span>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 bg-gray-800 overflow-y-auto p-2 sm:p-4 space-y-3" style={{ height: "calc(100vh - 200px)" }}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 sm:h-10 sm:w-10 text-gray-500" />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="absolute -top-1 -right-1 bg-primary/30 rounded-full p-1.5"
                >
                  <User className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                </motion.div>
              </div>
              
              <h3 className="text-white text-sm sm:text-base font-medium mb-1">Start a conversation</h3>
              <p className="text-xs sm:text-sm text-center px-4 text-gray-400 mb-4">Say hello to your new chat partner!</p>
              
              <div className="grid grid-cols-2 gap-2 max-w-xs w-full">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-gray-700 hover:bg-gray-700/80 text-white py-2 px-3 rounded-lg text-xs sm:text-sm"
                  onClick={() => onSendMessage("Hey there! How are you?")}
                >
                  👋 Say Hello
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-gray-700 hover:bg-gray-700/80 text-white py-2 px-3 rounded-lg text-xs sm:text-sm"
                  onClick={() => onSendMessage("What brings you here today?")}
                >
                  🤔 Ask a question
                </motion.button>
              </div>
              
              <div className="mt-6 text-xs text-gray-500 flex items-center">
                <Shield className="h-3 w-3 mr-1 text-green-500/70" />
                <span>Messages are moderated for your safety</span>
              </div>
            </motion.div>
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
        <form className="flex flex-col" onSubmit={handleSubmit}>
          <div className="flex items-center">
            <div className="relative flex-1">
              <input
                type="text"
                ref={inputRef}
                placeholder="Type a message..."
                className="w-full bg-gray-700 text-gray-200 text-sm sm:text-base rounded-full py-2 sm:py-2.5 px-3 sm:px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-lg"
                value={messageInput}
                onChange={handleInputChange}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center text-gray-400">
                <motion.button 
                  type="button" 
                  className="p-1 hover:text-gray-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Image className="h-4 w-4 sm:h-5 sm:w-5" />
                </motion.button>
              </div>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                type="submit"
                className="ml-1.5 sm:ml-2 bg-primary hover:bg-primary/90 text-white rounded-full p-2 sm:p-2.5 flex items-center justify-center shadow-lg"
                size="icon"
                disabled={!messageInput.trim()}
              >
                <Send className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </motion.div>
          </div>
          
          {/* Trust elements below input */}
          <div className="flex justify-center mt-2">
            <div className="flex items-center px-2 py-1 bg-gray-800/50 rounded-full text-xs text-gray-400 space-x-2">
              <div className="flex items-center">
                <MessageSquare className="h-3 w-3 mr-1 text-primary/70" />
                <span>Strangers can't see your real identity</span>
              </div>
              <span className="text-gray-600">|</span>
              <div className="flex items-center">
                <Shield className="h-3 w-3 mr-1 text-green-500/70" />
                <span>Messages are AI-moderated</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
