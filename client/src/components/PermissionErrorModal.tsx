import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";

interface PermissionErrorModalProps {
  type: "camera" | "microphone" | "both";
  isOpen: boolean;
  onClose: () => void;
}

export default function PermissionErrorModal({ type, isOpen, onClose }: PermissionErrorModalProps) {
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop">("desktop");
  
  useEffect(() => {
    // Detect platform
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      setPlatform("ios");
    } else if (/Android/i.test(navigator.userAgent)) {
      setPlatform("android");
    } else {
      setPlatform("desktop");
    }
  }, []);
  
  const getInstructions = (): { title: string, steps: string[] } => {
    if (type === "camera") {
      if (platform === "ios") {
        return {
          title: "Camera Access Required",
          steps: [
            "Go to your device Settings",
            "Scroll down and tap on Safari (or the browser you're using)",
            "Tap on Camera",
            "Enable camera access for this website",
            "Return to the app and refresh the page"
          ]
        };
      } else if (platform === "android") {
        return {
          title: "Camera Access Required",
          steps: [
            "Tap the lock icon in the address bar",
            "Tap on Site settings",
            "Enable camera access",
            "Reload the page"
          ]
        };
      } else {
        return {
          title: "Camera Access Required",
          steps: [
            "Click the camera icon or lock icon in the address bar",
            "Enable camera access for this website",
            "Reload the page"
          ]
        };
      }
    } else if (type === "microphone") {
      if (platform === "ios") {
        return {
          title: "Microphone Access Required",
          steps: [
            "Go to your device Settings",
            "Scroll down and tap on Safari (or the browser you're using)",
            "Tap on Microphone",
            "Enable microphone access for this website",
            "Return to the app and refresh the page"
          ]
        };
      } else if (platform === "android") {
        return {
          title: "Microphone Access Required",
          steps: [
            "Tap the lock icon in the address bar",
            "Tap on Site settings",
            "Enable microphone access",
            "Reload the page"
          ]
        };
      } else {
        return {
          title: "Microphone Access Required",
          steps: [
            "Click the microphone icon or lock icon in the address bar",
            "Enable microphone access for this website",
            "Reload the page"
          ]
        };
      }
    } else {
      // Both camera and microphone
      if (platform === "ios") {
        return {
          title: "Camera & Microphone Access Required",
          steps: [
            "Go to your device Settings",
            "Scroll down and tap on Safari (or the browser you're using)",
            "Tap on Camera and enable it for this website",
            "Return and tap on Microphone and enable it for this website",
            "Return to the app and refresh the page"
          ]
        };
      } else if (platform === "android") {
        return {
          title: "Camera & Microphone Access Required",
          steps: [
            "Tap the lock icon in the address bar",
            "Tap on Site settings",
            "Enable camera and microphone access",
            "Reload the page"
          ]
        };
      } else {
        return {
          title: "Camera & Microphone Access Required",
          steps: [
            "Click the lock icon in the address bar",
            "Enable camera and microphone access for this website",
            "Reload the page"
          ]
        };
      }
    }
  };
  
  const instructions = getInstructions();
  
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="bg-slate-900 border border-slate-700 text-white max-w-md mx-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold text-white">{instructions.title}</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-300">
            <p className="mb-4">
              To use video chat in StrangerWave, you need to grant permission to access your {type === "camera" ? "camera" : type === "microphone" ? "microphone" : "camera and microphone"}.
            </p>
            <div className="bg-slate-800 p-4 rounded-md">
              <h3 className="font-semibold text-white mb-2">How to enable {type === "camera" ? "camera" : type === "microphone" ? "microphone" : "camera and microphone"} access:</h3>
              <ol className="list-decimal pl-5 space-y-1">
                {instructions.steps.map((step, index) => (
                  <li key={index} className="text-slate-300">{step}</li>
                ))}
              </ol>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction 
            onClick={onClose}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium"
          >
            Got It
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}