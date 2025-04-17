import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, Mic, AlertTriangle } from 'lucide-react';

interface PermissionErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'camera' | 'microphone' | 'both';
}

export default function PermissionErrorModal({ isOpen, onClose, type }: PermissionErrorModalProps) {
  const getPermissionDetails = () => {
    switch (type) {
      case 'camera':
        return {
          title: 'Camera Access Required',
          description: 'StrangerWave needs access to your camera to connect with other users.',
          icon: <Camera className="h-10 w-10 text-blue-500" />,
          instructions: [
            'Click the camera icon in your browser\'s address bar',
            'Select "Allow" when prompted for camera permissions',
            'If using a mobile device, check your device settings'
          ]
        };
      case 'microphone':
        return {
          title: 'Microphone Access Required',
          description: 'StrangerWave needs access to your microphone to connect with other users.',
          icon: <Mic className="h-10 w-10 text-blue-500" />,
          instructions: [
            'Click the microphone icon in your browser\'s address bar',
            'Select "Allow" when prompted for microphone permissions',
            'If using a mobile device, check your device settings'
          ]
        };
      default:
        return {
          title: 'Camera & Microphone Access Required',
          description: 'StrangerWave needs access to your camera and microphone to connect with other users.',
          icon: <AlertTriangle className="h-10 w-10 text-yellow-500" />,
          instructions: [
            'Click the camera/microphone icon in your browser\'s address bar',
            'Select "Allow" when prompted for permissions',
            'If using a mobile device, check your device settings',
            'Make sure no other app is currently using your camera/microphone'
          ]
        };
    }
  };

  const { title, description, icon, instructions } = getPermissionDetails();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 text-white border-gray-800 max-w-md mx-auto">
        <DialogHeader>
          <div className="mx-auto mb-4 p-4 bg-gray-800 rounded-full">
            {icon}
          </div>
          <DialogTitle className="text-xl text-center">{title}</DialogTitle>
          <DialogDescription className="text-gray-300 text-center">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="my-4">
          <h4 className="font-medium text-white mb-2">How to fix:</h4>
          <ul className="space-y-3">
            {instructions.map((instruction, index) => (
              <li key={index} className="flex items-start">
                <span className="flex-shrink-0 text-sm font-bold bg-blue-600 text-white rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5">{index + 1}</span>
                <span className="text-sm text-gray-300">{instruction}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gray-800/70 p-3 rounded-lg mt-2 mb-3">
          <p className="text-xs text-gray-400 italic">
            Note: If you've denied permission previously, you may need to manually change the settings by clicking on the lock/info icon in your browser's address bar.
          </p>
        </div>

        <DialogFooter>
          <Button 
            onClick={onClose} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            I've Fixed It
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}