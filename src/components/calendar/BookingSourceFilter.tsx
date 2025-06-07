
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface BookingSourceFilterProps {
  selectedSource: string;
  onSourceChange: (source: string) => void;
}

export function BookingSourceFilter({ selectedSource, onSourceChange }: BookingSourceFilterProps) {
  const sources = [
    { value: "all", label: "All Sources" },
    { value: "inbound", label: "Inbound" },
    { value: "outbound_campaign", label: "Outbound Campaign" }
  ];

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'inbound':
        return <Badge variant="outline">Inbound</Badge>;
      case 'outbound_campaign':
        return <Badge variant="default">Campaign</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedSource} onValueChange={onSourceChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filter by source" />
        </SelectTrigger>
        <SelectContent>
          {sources.map((source) => (
            <SelectItem key={source.value} value={source.value}>
              <div className="flex items-center gap-2">
                {source.label}
                {source.value !== "all" && getSourceBadge(source.value)}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
