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

  const handleCall = async () => {
    try {
      // Log all environment variables that start with VITE_
      console.log('All VITE_ environment variables:', Object.keys(import.meta.env)
        .filter(key => key.startsWith('VITE_'))
        .reduce((acc, key) => ({ ...acc, [key]: import.meta.env[key] }), {}));

      const publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY;
      console.log('Raw VAPI public key value:', publicKey);
      
      if (!publicKey) {
        throw new Error("Vapi public key is not configured. Please check your environment variables.");
      }

      const assistantId = agent.vapi_assistant_id;
      if (!assistantId) {
        throw new Error("This agent doesn't have a valid assistant ID configured.");
      }

      console.log('Starting call with assistant ID:', assistantId);
      console.log('Using Vapi public key:', publicKey);
      
      const vapi = new Vapi(publicKey);
      await vapi.start(assistantId);
      
      toast({
        title: "Call Started",
        description: "You can now speak with your AI agent.",
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
        <Button 
          onClick={handleCall}
          className="ml-auto"
          disabled={agent.status !== 'active'}
        >
          <PhoneCall className="mr-2 h-4 w-4" />
          Call Agent
        </Button>
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
    </div>
  );
};