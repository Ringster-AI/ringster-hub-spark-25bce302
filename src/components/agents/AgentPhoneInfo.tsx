
import { Phone, PhoneCall, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface AgentPhoneInfoProps {
  phoneNumber?: string | null;
  isActive: boolean;
  onBrowserCall: () => void;
}

export const AgentPhoneInfo = ({ phoneNumber, isActive, onBrowserCall }: AgentPhoneInfoProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = () => {
    if (phoneNumber) {
      navigator.clipboard.writeText(phoneNumber)
        .then(() => {
          setCopied(true);
          toast({
            title: "Copied to clipboard",
            description: `Phone number ${phoneNumber} copied to clipboard`,
          });
          
          // Reset the copied state after 2 seconds
          setTimeout(() => setCopied(false), 2000);
        })
        .catch((err) => {
          console.error('Failed to copy: ', err);
          toast({
            title: "Failed to copy",
            description: "Could not copy the phone number to clipboard",
            variant: "destructive",
          });
        });
    }
  };

  return (
    <div className="flex items-center justify-between">
      {phoneNumber && (
        <div 
          className="flex items-center gap-2 p-2 bg-primary/5 rounded-md cursor-pointer hover:bg-primary/10 transition-colors"
          onClick={copyToClipboard}
          role="button"
          aria-label="Copy phone number to clipboard"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              copyToClipboard();
            }
          }}
        >
          <Phone className="h-5 w-5 text-primary" />
          <span className="text-base font-medium text-primary">{phoneNumber}</span>
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4 text-primary opacity-70" />
          )}
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
