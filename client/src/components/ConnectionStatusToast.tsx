import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, WifiOff, User } from "lucide-react";

interface ConnectionStatusToastProps {
  status: 'connected' | 'disconnected' | 'reconnecting' | 'partner-left' | null;
  partnerName?: string;
  onClose?: () => void;
  autoHideDuration?: number;
}

export default function ConnectionStatusToast({ 
  status, 
  partnerName,
  onClose,
  autoHideDuration = 5000 
}: ConnectionStatusToastProps) {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    if (status) {
      setVisible(true);
      
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, autoHideDuration);
      
      return () => clearTimeout(timer);
    }
  }, [status, autoHideDuration, onClose]);

  const getMessage = () => {
    switch(status) {
      case 'connected':
        return {
          icon: <CheckCircle2 className="h-5 w-5 text-green-400" />,
          title: "Connected",
          message: partnerName ? `Connected with ${partnerName}` : "Connection established",
          bgColor: "bg-green-900/80"
        };
      case 'disconnected':
        return {
          icon: <WifiOff className="h-5 w-5 text-red-400" />,
          title: "Disconnected",
          message: "Connection lost. Attempting to reconnect...",
          bgColor: "bg-red-900/80"
        };
      case 'reconnecting':
        return {
          icon: <AlertCircle className="h-5 w-5 text-yellow-400" />,
          title: "Reconnecting",
          message: "Trying to restore connection...",
          bgColor: "bg-yellow-900/80"
        };
      case 'partner-left':
        return {
          icon: <User className="h-5 w-5 text-blue-400" />,
          title: "Chat Ended",
          message: "Your chat partner has disconnected",
          bgColor: "bg-blue-900/80"
        };
      default:
        return {
          icon: <AlertCircle className="h-5 w-5 text-gray-400" />,
          title: "Status Update",
          message: "Connection status changed",
          bgColor: "bg-gray-900/80"
        };
    }
  };

  const { icon, title, message, bgColor } = getMessage();

  return (
    <AnimatePresence>
      {visible && status && (
        <motion.div 
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 pointer-events-auto"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        >
          <div className={`${bgColor} backdrop-blur-md rounded-lg shadow-lg px-4 py-3 min-w-[280px] max-w-[350px] border border-white/10`}>
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                {icon}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-white">{title}</p>
                <p className="mt-1 text-xs text-white/80">{message}</p>
              </div>
              <button
                onClick={() => {
                  setVisible(false);
                  if (onClose) onClose();
                }}
                className="ml-4 flex-shrink-0 text-white/60 hover:text-white"
              >
                <span className="sr-only">Close</span>
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}