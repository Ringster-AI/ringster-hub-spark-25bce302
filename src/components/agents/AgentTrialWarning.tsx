
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";

export const AgentTrialWarning = () => {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        Your trial is ending soon! <Link to="/dashboard/subscription" className="underline">Upgrade now</Link> to keep your agent active.
      </AlertDescription>
    </Alert>
  );
};
