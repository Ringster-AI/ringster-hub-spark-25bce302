
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Play, Download, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CallRecording {
  id: string;
  call_log_id: string;
  recording_url: string | null;
  transcript_url: string | null;
  created_at: string;
  call_log: {
    call_sid: string;
    from_number: string;
    to_number: string;
    duration: number;
    start_time: string;
    agent: {
      name: string;
    };
  };
}

const Recordings = () => {
  const [selectedRecording, setSelectedRecording] = useState<CallRecording | null>(null);
  const { toast } = useToast();

  const { data: recordings, isLoading, error } = useQuery({
    queryKey: ['recordings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('call_recordings')
        .select(`
          id,
          call_log_id,
          recording_url,
          transcript_url,
          created_at,
          call_log:call_log_id (
            call_sid,
            from_number,
            to_number,
            duration,
            start_time,
            agent:agent_id (
              name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Cast to ensure type compatibility
      return (data as unknown) as CallRecording[];
    },
  });

  const handlePlay = (recording: CallRecording) => {
    setSelectedRecording(recording);
    
    // Future integration point: 
    // If VAPI.ai - use their player via API
    // If Twilio - use their player or direct audio URL
    
    if (!recording.recording_url) {
      toast({
        title: "No recording available",
        description: "This call doesn't have a recording available to play.",
        variant: "destructive"
      });
      return;
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

  const handleViewTranscript = (recording: CallRecording) => {
    if (recording.transcript_url) {
      window.open(recording.transcript_url, '_blank');
    } else {
      toast({
        title: "Transcript unavailable",
        description: "No transcript is available for this call.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Call Recordings</h1>
        <p className="text-muted-foreground">Loading recordings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Call Recordings</h1>
        <p className="text-red-500">Error loading recordings: {error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Call Recordings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Calls</CardTitle>
              <CardDescription>
                View and listen to your recent call recordings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recordings && recordings.length > 0 ? (
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
                            onClick={() => handleViewTranscript(recording)}
                            disabled={!recording.transcript_url}
                            title={recording.transcript_url ? "View transcript" : "No transcript available"}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No call recordings found. As your agents make calls, recordings will appear here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Call Details</CardTitle>
              <CardDescription>
                {selectedRecording 
                  ? `Recording from ${format(new Date(selectedRecording.created_at), 'MMM d, yyyy')}`
                  : 'Select a recording to view details'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedRecording ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium">Audio Player</h3>
                    {selectedRecording.recording_url ? (
                      <div className="mt-2">
                        <audio 
                          src={selectedRecording.recording_url} 
                          controls 
                          className="w-full"
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No audio available</p>
                    )}
                  </div>
                  
                  {selectedRecording.transcript_url && (
                    <div>
                      <h3 className="text-sm font-medium">Transcript</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        Transcript link available. Click the transcript button to view.
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-sm font-medium">Call Information</h3>
                    <dl className="mt-2 text-sm">
                      <div className="grid grid-cols-3 gap-1 py-1">
                        <dt className="text-muted-foreground">From:</dt>
                        <dd className="col-span-2">{selectedRecording.call_log?.from_number || 'Unknown'}</dd>
                      </div>
                      <div className="grid grid-cols-3 gap-1 py-1">
                        <dt className="text-muted-foreground">To:</dt>
                        <dd className="col-span-2">{selectedRecording.call_log?.to_number || 'Unknown'}</dd>
                      </div>
                      <div className="grid grid-cols-3 gap-1 py-1">
                        <dt className="text-muted-foreground">Duration:</dt>
                        <dd className="col-span-2">
                          {selectedRecording.call_log?.duration 
                            ? `${Math.floor(selectedRecording.call_log.duration / 60)}:${(selectedRecording.call_log.duration % 60).toString().padStart(2, '0')}`
                            : 'n/a'}
                        </dd>
                      </div>
                      <div className="grid grid-cols-3 gap-1 py-1">
                        <dt className="text-muted-foreground">Call SID:</dt>
                        <dd className="col-span-2 truncate">{selectedRecording.call_log?.call_sid || 'n/a'}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center items-center h-40">
                  <p className="text-muted-foreground text-center">
                    Select a recording from the list to view details, listen to the audio, and read the transcript.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Recordings;
