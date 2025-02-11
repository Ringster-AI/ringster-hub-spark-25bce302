
import { cn } from "@/lib/utils";
import { Campaign } from "@/types/database/campaigns";
import { Play, Pause, StopCircle, Calendar } from "lucide-react";

interface StatusBadgeProps {
  status: Campaign['status'];
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <Play className="h-4 w-4 text-green-500" />;
      case "paused":
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case "completed":
        return <StopCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Calendar className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <>
      {getStatusIcon(status)}
      <span
        className={cn(
          "text-sm capitalize px-2 py-1 rounded-full",
          {
            "bg-green-100 text-green-800": status === "running",
            "bg-yellow-100 text-yellow-800": status === "paused",
            "bg-red-100 text-red-800": status === "completed",
            "bg-blue-100 text-blue-800": status === "scheduled",
            "bg-gray-100 text-gray-800": status === "draft",
          }
        )}
      >
        {status}
      </span>
    </>
  );
}
