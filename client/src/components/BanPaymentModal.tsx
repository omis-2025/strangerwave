import { useState } from "react";
import { useLocation } from "wouter";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/useAuth";

interface BanPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BanPaymentModal({ isOpen, onClose }: BanPaymentModalProps) {
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  
  const handlePayment = () => {
    // Navigate to payment page
    navigate("/payment");
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className={`fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 ${isOpen ? '' : 'hidden'}`}>
        <div className="bg-surface rounded-lg w-full max-w-md mx-4 overflow-hidden">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <h3 className="text-lg font-medium text-error">Account Restricted</h3>
            <button 
              className="text-text-secondary hover:text-text-primary"
              onClick={onClose}
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
          
          <div className="p-5">
            <div className="mb-6 text-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-14 w-14 text-error mx-auto mb-4" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              </svg>
              <h4 className="text-xl font-bold text-text-primary mb-2">Your account has been restricted</h4>
              <p className="text-text-secondary">Due to violations of our community guidelines, your account has been restricted from using our service.</p>
            </div>
            
            <div className="bg-surface-light p-4 rounded-lg mb-4">
              <h5 className="font-medium text-text-primary mb-2">Restore Access</h5>
              <p className="text-text-secondary mb-3">You can restore your access by paying a one-time fee of $10.99</p>
              <div className="bg-black bg-opacity-20 p-3 rounded-lg mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-text-secondary">Restoration Fee</span>
                  <span className="text-text-primary font-medium">$10.99</span>
                </div>
              </div>
              <Button 
                onClick={handlePayment}
                className="w-full bg-primary hover:bg-blue-600 text-white font-medium py-3 rounded-lg transition-colors"
              >
                Pay Now & Restore Access
              </Button>
            </div>
            
            <div className="text-center text-text-secondary text-sm">
              <p>If you believe this was a mistake, please <a href="#" className="text-primary hover:underline">contact support</a>.</p>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
