import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check, User, Search, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UsernameTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSetUsername: (tag: string) => void;
}

export default function UsernameTagModal({
  isOpen,
  onClose,
  onSetUsername
}: UsernameTagModalProps) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    
    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    
    // In a real app, we would validate if the username is available
    if (Math.random() > 0.2 || isPremium) {
      onSetUsername(username);
      onClose();
    } else {
      setError('This username is already taken. Try another or upgrade to premium for exclusive tag.');
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        <div className="flex justify-between items-center border-b border-gray-800 p-4">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <User className="mr-2 h-5 w-5 text-primary" />
            Set Username Tag
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-4">
          <div className="mb-4">
            <p className="text-gray-300 text-sm mb-2">
              Create a username tag to be matched with friends or specific partners.
              Share your username with others to reconnect with them later.
            </p>
            
            <div className="bg-yellow-600/20 border border-yellow-600/30 rounded-lg p-3 text-yellow-200 text-xs flex items-start mb-4">
              <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <p>Using username tags disables the anonymous matching feature. Others can use your tag to find you specifically.</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                className="bg-gray-800 text-white w-full pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-primary"
                placeholder="Enter username tag"
              />
            </div>
            
            {error && (
              <div className="bg-red-600/20 border border-red-600/30 rounded-lg p-3 text-red-200 text-xs mb-4">
                {error}
              </div>
            )}
            
            <div className="flex items-center mb-4">
              <input
                id="premium-username"
                type="checkbox"
                checked={isPremium}
                onChange={() => setIsPremium(!isPremium)}
                className="w-4 h-4 text-primary bg-gray-700 border-gray-600 rounded focus:ring-primary focus:ring-2"
              />
              <label htmlFor="premium-username" className="ml-2 text-sm font-medium text-gray-300 flex items-center">
                Enable premium username 
                <span className="ml-2 px-2 py-0.5 bg-gradient-to-r from-yellow-500 to-amber-500 text-black text-xs rounded-full font-semibold">
                  PREMIUM
                </span>
              </label>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose} className="bg-transparent text-gray-300 border-gray-700 hover:bg-gray-800">
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-white flex items-center">
                <Check className="mr-1 h-4 w-4" />
                Set Username
              </Button>
            </div>
          </form>
        </div>
        
        <div className="bg-gray-800/70 p-3 border-t border-gray-800">
          <div className="flex items-center text-xs text-gray-400">
            <p>Premium users get exclusive username tags, priority matching, and expanded filters.</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}