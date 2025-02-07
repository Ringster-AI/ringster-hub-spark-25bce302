
import { CheckSquare, XSquare, Phone, Edit, AlertTriangle, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditAgentDialog } from "./EditAgentDialog";
import { AgentConfig } from "@/types/database/agents";
import { useState } from "react";
import { useSubscriptionFeatures } from "@/hooks/useSubscriptionFeatures";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import Vapi from "@vapi-ai/web";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

const VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY || window.ENV?.VITE_VAPI_PUBLIC_KEY || '';

interface AgentCardProps {
  agent: AgentConfig;
  onToggleStatus: (id: string, currentStatus: string) => Promise<void>;
  onUpdate: () => void;
}

export const AgentCard = ({ agent, onToggleStatus, onUpdate }: AgentCardProps) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isOutboundDialogOpen, setIsOutboundDialogOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { features } = useSubscriptionFeatures();
  const { toast } = useToast();

  const showTrialWarning = features.isTrialing && features.expiresAt && 
    new Date(features.expiresAt).getTime() - Date.now() < 24 * 60 * 60 * 1000;

  const handleBrowserCall = async () => {
    try {
      if (!VAPI_PUBLIC_KEY) {
        throw new Error("Vapi public key is not configured. Please check your environment variables and ensure VITE_VAPI_PUBLIC_KEY is set.");
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

  const handleOutboundCall = async () => {
    if (!phoneNumber) {
      toast({
        title: "Phone Number Required",
        description: "Please enter a phone number to call.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/.netlify/functions/make-outbound-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: agent.id,
          toNumber: phoneNumber,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to initiate call');
      }

      toast({
        title: "Call Initiated",
        description: `Calling ${phoneNumber}...`,
      });
      setIsOutboundDialogOpen(false);
      setPhoneNumber('');
    } catch (error) {
      console.error('Outbound call error:', error);
      toast({
        title: "Error Making Call",
        description: error instanceof Error ? error.message : "Failed to make call. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-6 space-y-4 hover:shadow-md transition-shadow">
      {showTrialWarning && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Your trial is ending soon! <Link to="/dashboard/subscription" className="underline">Upgrade now</Link> to keep your agent active.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{agent.name}</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditOpen(true)}
            title="Edit agent"
          >
            <Edit className="h-5 w-5 text-gray-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleStatus(agent.id, agent.status)}
            title={`Click to ${agent.status === 'active' ? 'deactivate' : 'activate'}`}
          >
            {agent.status === 'active' ? (
              <CheckSquare className="h-5 w-5 text-green-600" />
            ) : (
              <XSquare className="h-5 w-5 text-gray-400" />
            )}
          </Button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2">
        {agent.description || "No description provided"}
      </p>
      <div className="flex items-center justify-between">
        {agent.phone_number && (
          <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-md">
            <Phone className="h-5 w-5 text-primary" />
            <span className="text-base font-medium text-primary">{agent.phone_number}</span>
          </div>
        )}
        <div className="flex gap-2 ml-auto">
          <Button 
            onClick={handleBrowserCall}
            disabled={agent.status !== 'active'}
          >
            <PhoneCall className="mr-2 h-4 w-4" />
            Call Agent
          </Button>
        </div>
      </div>
      <div className="text-sm text-muted-foreground">
        <p>Minutes used: {agent.minutes_used || 0}</p>
        <p>Total minutes: {agent.total_minutes_used || 0}</p>
      </div>
      <EditAgentDialog 
        agent={agent} 
        onUpdate={onUpdate} 
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
      <Dialog open={isOutboundDialogOpen} onOpenChange={setIsOutboundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Make Outbound Call</DialogTitle>
            <DialogDescription>
              Enter the phone number you want to call
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="tel"
              placeholder="+1234567890"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsOutboundDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleOutboundCall}
                disabled={isLoading}
              >
                {isLoading ? "Calling..." : "Call"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
