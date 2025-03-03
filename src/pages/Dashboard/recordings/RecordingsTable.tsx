
import { format } from "date-fns";
import { Play, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CallRecording } from "./types";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface RecordingsTableProps {
  recordings: CallRecording[] | undefined;
  isLoading: boolean;
  error: Error | null;
  onSelectRecording: (recording: CallRecording) => void;
}

export const RecordingsTable = ({ 
  recordings, 
  isLoading, 
  error, 
  onSelectRecording 
}: RecordingsTableProps) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handlePlay = (recording: CallRecording) => {
    onSelectRecording(recording);
    
    if (!recording.recording_url) {
      toast({
        title: "No recording available",
        description: "This call doesn't have a recording available to play.",
        variant: "destructive"
      });
    }
    
    console.log("Playing recording:", recording);
  };

  const handleDownload = (recording: CallRecording) => {
    if (recording.recording_url) {
      window.open(recording.recording_url, '_blank');
    } else {
      toast({
        title: "Download failed",
        description: "No recording URL available for this call.",
        variant: "destructive"
      });
    }
  };

  const handleTranscript = (recording: CallRecording) => {
    onSelectRecording(recording);
    // The transcript loading is now handled within the RecordingDetails component
  };

  if (isLoading) {
    return <p className="text-muted-foreground">Loading recordings...</p>;
  }

  if (error) {
    return <p className="text-red-500">Error loading recordings: {error instanceof Error ? error.message : 'Unknown error'}</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Calls</CardTitle>
        <CardDescription>
          View and listen to your recent call recordings
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recordings && recordings.length > 0 ? (
          isMobile ? (
            <div className="space-y-4">
              {recordings.map((recording) => (
                <div key={recording.id} className="border rounded p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {recording.call_log?.agent?.name || 'Unknown'}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {recording.call_log?.start_time && 
                        format(new Date(recording.call_log.start_time), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">
                      {recording.call_log?.from_number || 'Unknown'} 
                      {recording.call_log?.duration && 
                        ` (${Math.floor(recording.call_log.duration / 60)}:${(recording.call_log.duration % 60).toString().padStart(2, '0')})`}
                    </span>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handlePlay(recording)}
                        disabled={!recording.recording_url}
                        title={recording.recording_url ? "Play recording" : "No recording available"}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDownload(recording)}
                        disabled={!recording.recording_url}
                        title={recording.recording_url ? "Download recording" : "No recording available"}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleTranscript(recording)}
                        title="View transcript"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableCaption>A list of your recent call recordings</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Number</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recordings.map((recording) => (
                  <TableRow key={recording.id}>
                    <TableCell>
                      {recording.call_log?.start_time && 
                        format(new Date(recording.call_log.start_time), 'MMM d, yyyy h:mm a')}
                    </TableCell>
                    <TableCell>{recording.call_log?.agent?.name || 'Unknown'}</TableCell>
                    <TableCell>{recording.call_log?.from_number || 'Unknown'}</TableCell>
                    <TableCell>
                      {recording.call_log?.duration 
                        ? `${Math.floor(recording.call_log.duration / 60)}:${(recording.call_log.duration % 60).toString().padStart(2, '0')}`
                        : 'n/a'}
                    </TableCell>
                    <TableCell className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handlePlay(recording)}
                        disabled={!recording.recording_url}
                        title={recording.recording_url ? "Play recording" : "No recording available"}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDownload(recording)}
                        disabled={!recording.recording_url}
                        title={recording.recording_url ? "Download recording" : "No recording available"}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleTranscript(recording)}
                        title="View transcript"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No call recordings found. As your agents make calls, recordings will appear here.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
