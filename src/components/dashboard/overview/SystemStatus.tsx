import { CheckCircle2, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

interface SystemStatusProps {
  activeAgents: number;
}

export const SystemStatus = ({ activeAgents }: SystemStatusProps) => {
  const isActive = activeAgents > 0;

  return (
    <div className="flex items-center gap-3 text-sm">
      <div className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full",
        isActive 
          ? "bg-success/8 text-success" 
          : "bg-muted text-muted-foreground"
      )}>
        {isActive ? (
          <>
            <Radio className="h-3.5 w-3.5 animate-pulse" />
            <span>Your agents are live and answering calls 24/7</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>All systems operational</span>
          </>
        )}
      </div>
    </div>
  );
};
