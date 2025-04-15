import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, details?: string) => void;
}

export default function ReportModal({ isOpen, onClose, onSubmit }: ReportModalProps) {
  const [reason, setReason] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;
    
    onSubmit(reason, details);
    
    // Reset form
    setReason("");
    setDetails("");
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className={`fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 ${isOpen ? '' : 'hidden'}`}>
        <div className="bg-surface rounded-lg w-full max-w-md mx-4 overflow-hidden">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <h3 className="text-lg font-medium text-text-primary">Report User</h3>
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
            <form id="reportForm" onSubmit={handleSubmit}>
              <div className="mb-4">
                <Label className="block text-text-primary mb-2 font-medium">Reason for report:</Label>
                <RadioGroup value={reason} onValueChange={setReason} className="space-y-2">
                  <div className="flex items-center">
                    <RadioGroupItem value="inappropriate" id="r-inappropriate" />
                    <Label htmlFor="r-inappropriate" className="ml-2">Inappropriate content</Label>
                  </div>
                  <div className="flex items-center">
                    <RadioGroupItem value="harassment" id="r-harassment" />
                    <Label htmlFor="r-harassment" className="ml-2">Harassment</Label>
                  </div>
                  <div className="flex items-center">
                    <RadioGroupItem value="spam" id="r-spam" />
                    <Label htmlFor="r-spam" className="ml-2">Spam</Label>
                  </div>
                  <div className="flex items-center">
                    <RadioGroupItem value="other" id="r-other" />
                    <Label htmlFor="r-other" className="ml-2">Other</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="mb-4">
                <Label htmlFor="reportDetails" className="block text-text-primary mb-2 font-medium">
                  Additional details (optional):
                </Label>
                <Textarea
                  id="reportDetails"
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full bg-surface-light text-text-primary rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div className="mt-6 flex gap-3">
                <Button 
                  type="submit" 
                  variant="destructive"
                  className="flex-1"
                  disabled={!reason}
                >
                  Submit Report
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  className="flex-1"
                  onClick={onClose}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
