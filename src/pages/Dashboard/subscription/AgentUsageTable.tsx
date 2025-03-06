
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";

interface AgentUsageTableProps {
  billingData: any;
}

export const AgentUsageTable = ({ billingData }: AgentUsageTableProps) => {
  const isMobile = useIsMobile();

  if (!billingData?.agents || billingData.agents.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 md:mb-8 overflow-x-auto">
      <h2 className="text-lg font-semibold mb-4">Agent Usage</h2>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-base md:text-lg font-medium gap-2">
            <BarChart className="h-5 w-5 text-[#9b87f5]" />
            Agent Minutes Used
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {isMobile ? (
            <div className="space-y-4">
              {billingData.agents.map((agent: any) => (
                <div key={agent.id} className="border rounded p-3">
                  <p className="font-medium">{agent.name}</p>
                  <div className="flex justify-between text-sm mt-1">
                    <span>Current: {agent.minutes_used || 0} min</span>
                    <span>All time: {agent.total_minutes_used || 0} min</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Current Period</TableHead>
                  <TableHead>All Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billingData.agents.map((agent: any) => (
                  <TableRow key={agent.id}>
                    <TableCell>{agent.name}</TableCell>
                    <TableCell>{agent.minutes_used || 0} minutes</TableCell>
                    <TableCell>{agent.total_minutes_used || 0} minutes</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
