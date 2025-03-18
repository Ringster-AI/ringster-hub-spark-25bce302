
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { ReactNode } from "react";

interface IntegrationServiceCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  isConnected: boolean;
  connectedEmail?: string;
  scopeCheck?: string;
  isLoading: boolean;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function IntegrationServiceCard({
  icon,
  title,
  description,
  isConnected,
  connectedEmail,
  scopeCheck,
  isLoading,
  isConnecting,
  onConnect,
  onDisconnect
}: IntegrationServiceCardProps) {
  return (
    <div className="flex items-start justify-between border p-4 rounded-lg">
      <div className="flex items-start space-x-4">
        <div className="bg-primary/10 p-2 rounded-full">
          {icon}
        </div>
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
          {isConnected && scopeCheck && connectedEmail && (
            <p className="text-xs text-green-600 mt-1">
              <Check className="inline h-3 w-3 mr-1" />
              Connected with {connectedEmail}
            </p>
          )}
        </div>
      </div>
      <Button
        variant={isConnected ? "outline" : "default"}
        onClick={isConnected ? onDisconnect : onConnect}
        disabled={isConnecting}
        className="min-w-[120px]"
      >
        {isConnected ? (
          isConnecting ? "Disconnecting..." : "Disconnect"
        ) : isConnecting ? (
          "Connecting..."
        ) : (
          "Connect"
        )}
      </Button>
    </div>
  );
}
