import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Flag, X, User, ShieldAlert, MessageSquare } from "lucide-react";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, details?: string) => void;
}

const reportReasons = [
  {
    id: "inappropriate",
    label: "Inappropriate content",
    description: "Sexually explicit, offensive, or illegal content",
    icon: <AlertTriangle className="h-4 w-4 text-amber-500" />
  },
  {
    id: "harassment",
    label: "Harassment or bullying",
    description: "Threats, hate speech, or personal attacks",
    icon: <User className="h-4 w-4 text-red-500" />
  },
  {
    id: "spam",
    label: "Spam or scams",
    description: "Repeated messages, ads, or phishing attempts",
    icon: <MessageSquare className="h-4 w-4 text-blue-500" />
  },
  {
    id: "other",
    label: "Other violation",
    description: "Any other community guideline violation",
    icon: <ShieldAlert className="h-4 w-4 text-purple-500" />
  }
];

export default function ReportModal({ isOpen, onClose, onSubmit }: ReportModalProps) {
  const [reason, setReason] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;
    
    setSubmitting(true);
    
    // Simulate a brief delay for better UX
    setTimeout(() => {
      onSubmit(reason, details);
      
      // Reset form
      setReason("");
      setDetails("");
      setSubmitting(false);
    }, 500);
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-gray-900 rounded-xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-700"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-gray-800 flex justify-between items-center bg-gradient-to-r from-gray-800 to-gray-900">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-red-500/20 rounded-full">
                    <Flag className="h-5 w-5 text-red-500" />
                  </div>
                  <h3 className="text-lg font-medium text-white">Report User</h3>
                </div>
                
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-gray-400 hover:text-white rounded-full p-1 transition-colors"
                  onClick={onClose}
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>
              
              <div className="p-5">
                {/* Form info notice */}
                <div className="mb-5 p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-sm text-gray-300">
                  <p>
                    Reports are reviewed by our moderation team to maintain a safe and respectful community.
                    Thank you for helping keep our platform safe.
                  </p>
                </div>
                
                <form id="reportForm" onSubmit={handleSubmit}>
                  <div className="mb-5">
                    <Label className="block text-white mb-3 font-medium text-sm">What's the issue?</Label>
                    <RadioGroup 
                      value={reason} 
                      onValueChange={setReason} 
                      className="space-y-3"
                    >
                      {reportReasons.map((item) => (
                        <div 
                          key={item.id}
                          className={`flex items-start p-3 rounded-lg transition-colors ${
                            reason === item.id 
                              ? 'bg-primary/10 border border-primary/30' 
                              : 'bg-gray-800/50 border border-gray-700 hover:border-gray-600'
                          }`}
                        >
                          <RadioGroupItem value={item.id} id={`r-${item.id}`} className="mt-1" />
                          <div className="ml-3">
                            <Label htmlFor={`r-${item.id}`} className="flex items-center text-white font-medium">
                              {item.icon}
                              <span className="ml-2">{item.label}</span>
                            </Label>
                            <p className="text-xs text-gray-400 mt-1">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                  
                  <div className="mb-5">
                    <Label htmlFor="reportDetails" className="block text-white mb-2 font-medium text-sm">
                      Additional details (optional):
                    </Label>
                    <Textarea
                      id="reportDetails"
                      placeholder="Please provide specific details about the incident..."
                      rows={3}
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      className="w-full bg-gray-800 text-white border-gray-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  
                  <div className="mt-6 flex gap-3">
                    <Button 
                      type="submit" 
                      variant="destructive"
                      className="flex-1 relative"
                      disabled={!reason || submitting}
                    >
                      {submitting ? (
                        <>
                          <span className="opacity-0">Submit Report</span>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        </>
                      ) : (
                        <>
                          <Flag className="h-4 w-4 mr-2" />
                          Submit Report
                        </>
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      className="flex-1 border-gray-700 hover:bg-gray-800 text-gray-300"
                      onClick={onClose}
                    >
                      Cancel
                    </Button>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500">
                      Repeated false reports may result in account restrictions
                    </p>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
