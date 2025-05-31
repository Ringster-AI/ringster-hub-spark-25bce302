
import { useState } from "react";
import { useSubscriptionFeatures } from "@/hooks/useSubscriptionFeatures";
import { useToast } from "@/hooks/use-toast";
import { AgentConfig } from "@/types/database/agents";
import Vapi from "@vapi-ai/web";
import { EditAgentDialog } from "./EditAgentDialog";
import { AgentTrialWarning } from "./AgentTrialWarning";
import { AgentHeader } from "./AgentHeader";
import { AgentPhoneInfo } from "./AgentPhoneInfo";
import { AgentUsageStats } from "./AgentUsageStats";

// Get the VAPI public key from environment variables
const getVapiPublicKey = () => {
  // Try different ways to get the key
  const key = import.meta.env.VITE_VAPI_PUBLIC_KEY || 
             window.ENV?.VITE_VAPI_PUBLIC_KEY || 
             process.env.VITE_VAPI_PUBLIC_KEY;
  
  console.log('VAPI Public Key available:', !!key);
  return key;
};

interface AgentCardProps {
  agent: AgentConfig;
  onToggleStatus: (id: string, currentStatus: string) => Promise<void>;
  onUpdate: () => void;
}

export const AgentCard = ({ agent, onToggleStatus, onUpdate }: AgentCardProps) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { features } = useSubscriptionFeatures();
  const { toast } = useToast();

  const showTrialWarning = features.isTrialing && features.expiresAt && 
    new Date(features.expiresAt).getTime() - Date.now() < 24 * 60 * 60 * 1000;

  const handleBrowserCall = async () => {
    try {
      const VAPI_PUBLIC_KEY = getVapiPublicKey();
      
      if (!VAPI_PUBLIC_KEY) {
        console.error('VAPI public key not found in environment variables');
        toast({
          title: "Configuration Error",
          description: "VAPI public key is not configured. Please check your environment variables and ensure VITE_VAPI_PUBLIC_KEY is set.",
          variant: "destructive",
        });
        return;
      }

      const assistantId = agent.vapi_assistant_id;
      if (!assistantId) {
        throw new Error("This agent doesn't have a valid assistant ID configured.");
      }

      console.log('Starting browser call with assistant ID:', assistantId);
      const vapi = new Vapi(VAPI_PUBLIC_KEY);
      await vapi.start(assistantId);
      
      toast({
        title: "Call Started",
        description: "You can now speak with your AI agent through your browser.",
      });
    } catch (error) {
      console.error('Vapi call error:', error);
      toast({
        title: "Error Starting Call",
        description: error instanceof Error ? error.message : "Failed to start call. Please check your Vapi configuration.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="border rounded-lg p-6 space-y-4 hover:shadow-md transition-shadow">
      {showTrialWarning && <AgentTrialWarning />}
      
      <AgentHeader
        name={agent.name}
        id={agent.id}
        status={agent.status}
        onEdit={() => setIsEditOpen(true)}
        onToggleStatus={onToggleStatus}
      />

      <p className="text-sm text-muted-foreground line-clamp-2">
        {agent.description || "No description provided"}
      </p>

      <AgentPhoneInfo
        phoneNumber={agent.phone_number}
        isActive={agent.status === 'active'}
        onBrowserCall={handleBrowserCall}
      />

      <AgentUsageStats
        minutesUsed={agent.minutes_used}
        totalMinutesUsed={agent.total_minutes_used}
      />

      <EditAgentDialog 
        agent={agent} 
        onUpdate={onUpdate} 
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </div>
  );
};
