import { format } from "date-fns";
import { Play, FileText, Download, Share2, Phone, PhoneIncoming, PhoneOutgoing, MessageSquare } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { CallRecording } from "./types";

interface RecordingsTableProps {
  recordings: CallRecording[] | undefined;
  isLoading: boolean;
  error: Error | null;
  onSelectRecording: (recording: CallRecording) => void;
}

export const RecordingsTable = ({ recordings, isLoading, error, onSelectRecording }: RecordingsTableProps) => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [callTypeFilter, setCallTypeFilter] = useState<string>("all");
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const getCallStatus = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return { label: 'Answered', variant: 'default' as const, icon: Phone };
      case 'no-answer': return { label: 'Missed', variant: 'secondary' as const, icon: PhoneIncoming };
      case 'busy': return { label: 'Busy', variant: 'secondary' as const, icon: Phone };
      case 'failed': return { label: 'Failed', variant: 'destructive' as const, icon: Phone };
      default: return { label: status || 'Unknown', variant: 'outline' as const, icon: Phone };
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      case 'neutral': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const filteredRecordings = recordings?.filter(recording => {
    const matchesStatus = statusFilter === "all" || recording.call_log?.status === statusFilter;
    const matchesSearch = !searchTerm || 
      recording.call_log?.from_number?.includes(searchTerm) ||
      recording.call_log?.to_number?.includes(searchTerm) ||
      recording.call_log?.agent?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  }) || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Call Recordings</h2>
        </div>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Date/Time</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Sentiment</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Recordings</p>
              <p className="text-2xl font-bold">{recordings?.length || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Avg. Call Length</p>
              <p className="text-2xl font-bold">
                {recordings?.length > 0 
                  ? `${Math.floor(recordings.reduce((acc, r) => acc + (r.call_log?.duration || 0), 0) / recordings.length / 60)}:${Math.floor(recordings.reduce((acc, r) => acc + (r.call_log?.duration || 0), 0) / recordings.length % 60).toString().padStart(2, '0')}`
                  : '0:00'
                }
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <PhoneIncoming className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Answered</p>
              <p className="text-2xl font-bold text-green-600">
                {recordings?.filter(r => r.call_log?.status === 'completed').length || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <PhoneOutgoing className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">Missed</p>
              <p className="text-2xl font-bold text-orange-600">
                {recordings?.filter(r => r.call_log?.status === 'no-answer').length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 p-3 sm:p-4 bg-card rounded-lg border">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <label className="text-sm font-medium shrink-0">Status:</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="completed">Answered</SelectItem>
              <SelectItem value="no-answer">Missed</SelectItem>
              <SelectItem value="busy">Busy</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <label className="text-sm font-medium shrink-0">Type:</label>
          <Select value={callTypeFilter} onValueChange={setCallTypeFilter}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="inbound">Inbound</SelectItem>
              <SelectItem value="outbound">Outbound</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <label className="text-sm font-medium shrink-0">Search:</label>
          <Input
            placeholder="Search calls..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-48"
          />
        </div>
      </div>
      
      {error && (
        <div className="text-red-600 bg-red-50 p-4 rounded-lg">
          Error loading recordings: {error.message}
        </div>
      )}

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Date/Time</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Sentiment</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!filteredRecordings || filteredRecordings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {searchTerm || statusFilter !== 'all' ? 'No recordings match your filters' : 'No recordings found'}
                </TableCell>
              </TableRow>
            ) : (
              filteredRecordings.map((recording) => {
                const statusInfo = getCallStatus(recording.call_log?.status);
                const StatusIcon = statusInfo.icon;
                // Mock sentiment for demo - in production this would come from AI analysis
                const sentiment = Math.random() > 0.7 ? 'positive' : Math.random() > 0.4 ? 'neutral' : 'negative';
                
                return (
                  <TableRow 
                    key={recording.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onSelectRecording(recording)}
                  >
                    <TableCell>
                      <Badge variant={statusInfo.variant} className="flex items-center gap-1 w-fit">
                        <StatusIcon className="h-3 w-3" />
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {recording.call_log?.start_time 
                        ? format(new Date(recording.call_log.start_time), 'MMM d, yyyy HH:mm')
                        : 'Unknown'
                      }
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {recording.call_log?.from_number || 'Unknown'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          → {recording.call_log?.to_number || 'Unknown'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {recording.call_log?.duration 
                        ? `${Math.floor(recording.call_log.duration / 60)}:${(recording.call_log.duration % 60).toString().padStart(2, '0')}`
                        : 'n/a'
                      }
                    </TableCell>
                    <TableCell>
                      <Badge className={getSentimentColor(sentiment)}>
                        {sentiment || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>{recording.call_log?.agent?.name || 'Unknown'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectRecording(recording);
                          }}
                          className="h-8 w-8 p-0"
                          title="Play recording"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle download
                          }}
                          className="h-8 w-8 p-0"
                          title="Download MP3"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle share
                          }}
                          className="h-8 w-8 p-0"
                          title="Share link"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};