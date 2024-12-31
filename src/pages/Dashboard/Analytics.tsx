import { BarChart3 } from "lucide-react";

const Analytics = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Analytics functionality is currently being updated
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center h-96 space-y-4 border-2 border-dashed rounded-lg p-8">
        <BarChart3 className="w-12 h-12 text-muted-foreground" />
        <div className="text-center">
          <h3 className="text-lg font-semibold">Analytics Coming Soon</h3>
          <p className="text-muted-foreground">
            We're working on bringing you powerful analytics features
          </p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;