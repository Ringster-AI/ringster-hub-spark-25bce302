
import { format } from "date-fns";
import { FileText } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CallRecording, TranscriptSegment } from "./types";
import { useTranscript } from "./useRecordings";
import { useToast } from "@/hooks/use-toast";

interface RecordingDetailsProps {
  recording: CallRecording | null;
}

export const RecordingDetails = ({ recording }: RecordingDetailsProps) => {
  const [activeTab, setActiveTab] = useState<string>("details");
  const [showTranscript, setShowTranscript] = useState<boolean>(false);
  const { toast } = useToast();

  const callSid = recording?.call_log?.call_sid;
  const { data: transcript, isLoading: transcriptLoading, error: transcriptError } = 
    useTranscript(showTranscript ? callSid : undefined);

  const handleLoadTranscript = () => {
    if (!callSid) {
      toast({
        title: "Error",
        description: "Cannot load transcript: Call SID not available",
        variant: "destructive"
      });
      return;
    }
    
    setShowTranscript(true);
    setActiveTab("transcript");
  };

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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
              <TabsTrigger value="transcript" className="flex-1">Transcript</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
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

              {!showTranscript && (
                <div className="flex justify-start pt-4">
                  <Button 
                    onClick={handleLoadTranscript}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Load Transcript
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="transcript">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Call Transcript</h3>
                  {!showTranscript && (
                    <Button 
                      onClick={handleLoadTranscript}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Load Transcript
                    </Button>
                  )}
                </div>

                {showTranscript && (
                  <div className="border rounded-md p-4 h-[400px] overflow-y-auto">
                    {transcriptLoading && (
                      <div className="space-y-2">
                        <Skeleton className="w-full h-6" />
                        <Skeleton className="w-3/4 h-4" />
                        <Skeleton className="w-full h-6" />
                        <Skeleton className="w-5/6 h-4" />
                      </div>
                    )}

                    {transcriptError && (
                      <div className="text-red-500">
                        Error loading transcript: {transcriptError instanceof Error ? transcriptError.message : 'Unknown error'}
                      </div>
                    )}

                    {!transcriptLoading && !transcriptError && transcript && transcript.length > 0 ? (
                      <div className="space-y-4">
                        {transcript.map((segment: TranscriptSegment, index: number) => (
                          <div key={index} className="pb-2 border-b border-gray-100 last:border-0">
                            <p className="text-sm font-medium">
                              {segment.speaker === "assistant" ? "AI Assistant" : "Caller"}
                              {segment.timestamp && (
                                <span className="text-xs text-muted-foreground ml-2">
                                  {new Date(segment.timestamp).toLocaleTimeString()}
                                </span>
                              )}
                            </p>
                            <p className="text-sm mt-1">{segment.text}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      !transcriptLoading && !transcriptError && (
                        <p className="text-center text-muted-foreground">
                          No transcript data available for this call.
                        </p>
                      )
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
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
