
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
    <Card className="overflow-hidden">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="text-lg sm:text-xl">Recent Calls</CardTitle>
        <CardDescription className="text-sm">
          View and listen to your recent call recordings
        </CardDescription>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        {recordings && recordings.length > 0 ? (
          isMobile ? (
            <div className="space-y-3">
              {recordings.map((recording) => (
                <div key={recording.id} className="border rounded p-3 space-y-2 text-sm">
                  <div className="flex justify-between items-start">
                    <span className="font-medium truncate max-w-[160px]">
                      {recording.call_log?.agent?.name || 'Unknown'}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {recording.call_log?.start_time && 
                        format(new Date(recording.call_log.start_time), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-xs overflow-hidden text-ellipsis">
                      {recording.call_log?.from_number || 'Unknown'} 
                      {recording.call_log?.duration && 
                        ` (${Math.floor(recording.call_log.duration / 60)}:${(recording.call_log.duration % 60).toString().padStart(2, '0')})`}
                    </span>
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handlePlay(recording)}
                        disabled={!recording.recording_url}
                        title={recording.recording_url ? "Play recording" : "No recording available"}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleDownload(recording)}
                        disabled={!recording.recording_url}
                        title={recording.recording_url ? "Download recording" : "No recording available"}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0"
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
            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <Table>
                <TableCaption>A list of your recent call recordings</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Date</TableHead>
                    <TableHead className="whitespace-nowrap">Agent</TableHead>
                    <TableHead className="whitespace-nowrap">Number</TableHead>
                    <TableHead className="whitespace-nowrap">Duration</TableHead>
                    <TableHead className="whitespace-nowrap">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recordings.map((recording) => (
                    <TableRow key={recording.id}>
                      <TableCell className="whitespace-nowrap">
                        {recording.call_log?.start_time && 
                          format(new Date(recording.call_log.start_time), 'MMM d, yyyy h:mm a')}
                      </TableCell>
                      <TableCell>{recording.call_log?.agent?.name || 'Unknown'}</TableCell>
                      <TableCell>{recording.call_log?.from_number || 'Unknown'}</TableCell>
                      <TableCell className="whitespace-nowrap">
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
            </div>
          )
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">
              No call recordings found. As your agents make calls, recordings will appear here.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
