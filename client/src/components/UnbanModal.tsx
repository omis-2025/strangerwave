import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, AlertTriangle, Info, CheckCircle, CreditCard, Coins, LockKeyhole } from 'lucide-react';
import { SiPaypal } from 'react-icons/si';
import { Button } from '@/components/ui/button';

interface UnbanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnban: () => void;
}

export default function UnbanModal({
  isOpen,
  onClose,
  onUnban
}: UnbanModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'coins'>('card');
  const [isPaying, setIsPaying] = useState(false);
  const [isUnbanned, setIsUnbanned] = useState(false);
  
  const handleUnban = async () => {
    try {
      setIsPaying(true);
      // In a real app, we would make a payment API call here
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsUnbanned(true);
      setTimeout(() => {
        onUnban();
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setIsPaying(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        {isUnbanned ? (
          <div className="p-6 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="w-20 h-20 rounded-full bg-green-600/20 flex items-center justify-center mb-4">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
            </motion.div>
            <h2 className="text-xl font-bold text-white mb-2">Account Unbanned!</h2>
            <p className="text-gray-300 text-center mb-4">
              Thank you for your payment. Your account has been successfully restored. You can now continue chatting.
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center border-b border-gray-800 p-4">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <LockKeyhole className="mr-2 h-5 w-5 text-red-500" />
                Account Banned
              </h2>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <div className="bg-red-900/20 border border-red-900/30 rounded-lg p-4 text-red-200 text-sm flex items-start mb-4">
                  <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0 text-red-400" />
                  <div>
                    <p className="font-medium mb-1">Your account has been banned for violating our community guidelines.</p>
                    <p className="text-xs text-red-300/80">
                      Our AI moderator detected inappropriate content in your messages. 
                      To continue using StrangerWave, you'll need to pay a reinstatement fee.
                    </p>
                  </div>
                </div>
                
                <div className="bg-blue-900/20 border border-blue-900/30 rounded-lg p-4 text-blue-200 text-sm flex items-start">
                  <Info className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0 text-blue-400" />
                  <div>
                    <p className="font-medium mb-1">Why do we charge to remove bans?</p>
                    <p className="text-xs text-blue-300/80">
                      This measure helps maintain a safe community by discouraging repeated violations. 
                      Your payment also helps us improve our moderation systems and provide a better experience.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="text-white font-medium mb-2">Select payment method</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div
                    className={`border ${paymentMethod === 'card' ? 'border-primary bg-primary/10' : 'border-gray-700 bg-gray-800'} rounded-lg p-3 cursor-pointer hover:bg-gray-700 transition-colors flex flex-col items-center`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <CreditCard className={`h-6 w-6 mb-1 ${paymentMethod === 'card' ? 'text-primary' : 'text-gray-400'}`} />
                    <span className="text-xs text-center text-gray-300">Credit Card</span>
                  </div>
                  
                  <div
                    className={`border ${paymentMethod === 'paypal' ? 'border-primary bg-primary/10' : 'border-gray-700 bg-gray-800'} rounded-lg p-3 cursor-pointer hover:bg-gray-700 transition-colors flex flex-col items-center`}
                    onClick={() => setPaymentMethod('paypal')}
                  >
                    <SiPaypal className={`h-6 w-6 mb-1 ${paymentMethod === 'paypal' ? 'text-primary' : 'text-gray-400'}`} />
                    <span className="text-xs text-center text-gray-300">PayPal</span>
                  </div>
                  
                  <div
                    className={`border ${paymentMethod === 'coins' ? 'border-primary bg-primary/10' : 'border-gray-700 bg-gray-800'} rounded-lg p-3 cursor-pointer hover:bg-gray-700 transition-colors flex flex-col items-center`}
                    onClick={() => setPaymentMethod('coins')}
                  >
                    <Coins className={`h-6 w-6 mb-1 ${paymentMethod === 'coins' ? 'text-primary' : 'text-gray-400'}`} />
                    <span className="text-xs text-center text-gray-300">Wave Coins</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Unban fee</span>
                  <span className="text-white font-medium">$10.99</span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-400 border-t border-gray-700 pt-2">
                  <span>One-time payment</span>
                  <span>Instant access</span>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  className="mr-2 border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleUnban}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  disabled={isPaying}
                >
                  {isPaying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>Pay $10.99 and Unban</>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}