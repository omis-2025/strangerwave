import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, AlertTriangle, LogOut } from 'lucide-react';

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
  const [isVisible, setIsVisible] = useState(!!status);

  useEffect(() => {
    if (status) {
      setIsVisible(true);
      
      // Auto-hide the toast after a certain duration
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) {
          setTimeout(onClose, 300); // Allow exit animation to complete
        }
      }, autoHideDuration);
      
      return () => clearTimeout(timer);
    }
  }, [status, autoHideDuration, onClose]);

  if (!status) return null;

  const getStatusDetails = () => {
    switch (status) {
      case 'connected':
        return {
          icon: <Wifi className="h-5 w-5 text-green-500" />,
          title: 'Connected',
          message: 'You are now connected to the call.',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/30',
          textColor: 'text-green-500'
        };
      case 'disconnected':
        return {
          icon: <WifiOff className="h-5 w-5 text-red-500" />,
          title: 'Disconnected',
          message: 'You have been disconnected from the call.',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
          textColor: 'text-red-500'
        };
      case 'reconnecting':
        return {
          icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
          title: 'Connection Issue',
          message: 'Trying to reconnect you to the call...',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/30',
          textColor: 'text-yellow-500'
        };
      case 'partner-left':
        return {
          icon: <LogOut className="h-5 w-5 text-blue-500" />,
          title: 'Partner Left',
          message: partnerName 
            ? `${partnerName} has left the call.` 
            : 'Your chat partner has left the call.',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/30',
          textColor: 'text-blue-500'
        };
      default:
        return {
          icon: <AlertTriangle className="h-5 w-5 text-gray-500" />,
          title: 'Status Update',
          message: 'Connection status has changed.',
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/30',
          textColor: 'text-gray-500'
        };
    }
  };

  const { icon, title, message, bgColor, borderColor, textColor } = getStatusDetails();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div 
            className={`rounded-lg shadow-lg border px-4 py-3 ${bgColor} ${borderColor} backdrop-blur-md min-w-[260px] max-w-[90vw]`}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-3">
                {icon}
              </div>
              <div className="flex-1">
                <h4 className={`font-medium text-sm ${textColor}`}>{title}</h4>
                <p className="text-xs text-gray-300 mt-0.5">{message}</p>
              </div>
              <button 
                onClick={() => {
                  setIsVisible(false);
                  if (onClose) {
                    setTimeout(onClose, 300);
                  }
                }}
                className="ml-3 text-gray-400 hover:text-gray-300 flex-shrink-0"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}