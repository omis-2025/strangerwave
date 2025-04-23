
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface WarningNotificationProps {
  warning: {
    id: number;
    reason: string;
    timestamp: string;
    toxicityScore?: number;
  };
  onAcknowledge: (warningId: number) => void;
}

export default function WarningNotification({ warning, onAcknowledge }: WarningNotificationProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    setShow(true);
  }, [warning.id]);

  const handleAcknowledge = () => {
    setShow(false);
    onAcknowledge(warning.id);
  };

  if (!show) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTitle>Content Warning</AlertTitle>
      <AlertDescription className="mt-2">
        <p>{warning.reason}</p>
        {warning.toxicityScore && (
          <p className="text-sm mt-1">Severity Score: {warning.toxicityScore}</p>
        )}
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2"
          onClick={handleAcknowledge}
        >
          I Understand
        </Button>
      </AlertDescription>
    </Alert>
  );
}
