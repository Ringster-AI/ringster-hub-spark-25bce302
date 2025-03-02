
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CallRecording } from "./types";

interface RecordingDetailsProps {
  recording: CallRecording | null;
}

export const RecordingDetails = ({ recording }: RecordingDetailsProps) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Call Details</CardTitle>
        <CardDescription>
          {recording 
            ? `Recording from ${format(new Date(recording.created_at), 'MMM d, yyyy')}`
            : 'Select a recording to view details'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recording ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Audio Player</h3>
              {recording.recording_url ? (
                <div className="mt-2">
                  <audio 
                    src={recording.recording_url} 
                    controls 
                    className="w-full"
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No audio available</p>
              )}
            </div>
            
            {recording.transcript_url && (
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
                  <dd className="col-span-2">{recording.call_log?.from_number || 'Unknown'}</dd>
                </div>
                <div className="grid grid-cols-3 gap-1 py-1">
                  <dt className="text-muted-foreground">To:</dt>
                  <dd className="col-span-2">{recording.call_log?.to_number || 'Unknown'}</dd>
                </div>
                <div className="grid grid-cols-3 gap-1 py-1">
                  <dt className="text-muted-foreground">Duration:</dt>
                  <dd className="col-span-2">
                    {recording.call_log?.duration 
                      ? `${Math.floor(recording.call_log.duration / 60)}:${(recording.call_log.duration % 60).toString().padStart(2, '0')}`
                      : 'n/a'}
                  </dd>
                </div>
                <div className="grid grid-cols-3 gap-1 py-1">
                  <dt className="text-muted-foreground">Call SID:</dt>
                  <dd className="col-span-2 truncate">{recording.call_log?.call_sid || 'n/a'}</dd>
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
  );
};
