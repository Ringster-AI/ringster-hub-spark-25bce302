
import { Card, CardContent } from "@/components/ui/card";

interface MonthlySummaryProps {
  monthlySummary: any;
}

export const MonthlySummary = ({ monthlySummary }: MonthlySummaryProps) => {
  if (!monthlySummary) {
    return null;
  }

  return (
    <div className="mb-6 md:mb-8">
      <h2 className="text-lg font-semibold mb-4">Monthly Summary</h2>
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-muted-foreground text-xs md:text-sm">Total Calls</p>
              <p className="text-xl md:text-2xl font-bold">{monthlySummary.total_calls || 0}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs md:text-sm">Total Minutes</p>
              <p className="text-xl md:text-2xl font-bold">{monthlySummary.total_minutes || 0}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs md:text-sm">Total Transfers</p>
              <p className="text-xl md:text-2xl font-bold">{monthlySummary.total_transfers || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
