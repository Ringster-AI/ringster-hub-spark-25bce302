
import { Phone, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AgentPhoneInfoProps {
  phoneNumber?: string | null;
  isActive: boolean;
  onBrowserCall: () => void;
}

export const AgentPhoneInfo = ({ phoneNumber, isActive, onBrowserCall }: AgentPhoneInfoProps) => {
  return (
    <div className="flex items-center justify-between">
      {phoneNumber && (
        <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-md">
          <Phone className="h-5 w-5 text-primary" />
          <span className="text-base font-medium text-primary">{phoneNumber}</span>
        </div>
      )}
      <div className="flex gap-2 ml-auto">
        <Button 
          onClick={onBrowserCall}
          disabled={!isActive}
        >
          <PhoneCall className="mr-2 h-4 w-4" />
          Call Agent
        </Button>
      </div>
    </div>
  );
};
