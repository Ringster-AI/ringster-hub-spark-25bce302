import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { format } from "date-fns";

interface Recording {
  id: string;
  call_log_id: string;
  recording_url: string;
  transcript_url: string;
  created_at: string;
  call_log: {
    from_number: string;
    to_number: string;
    duration: number;
    agent: {
      name: string;
    }
  }
}

const Recordings = () => {
  const { data: recordings, isLoading } = useQuery({
    queryKey: ["recordings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("call_recordings")
        .select(`
          *,
          call_log:call_logs (
            from_number,
            to_number,
            duration,
            agent:agent_configs (
              name
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Recording[];
    },
  });

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse">Loading recordings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Call Recordings</h1>
        <p className="text-muted-foreground">
          Access and download your agent call recordings and transcripts
        </p>
      </div>

      <div className="grid gap-4">
        {recordings?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No recordings found</p>
          </div>
        ) : (
          recordings?.map((recording) => (
            <div
              key={recording.id}
              className="border rounded-lg p-4 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">
                    {recording.call_log.agent.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    From: {recording.call_log.from_number} To:{" "}
                    {recording.call_log.to_number}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Duration: {Math.round(recording.call_log.duration / 60)} minutes
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(recording.created_at), "PPpp")}
                  </p>
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleDownload(
                        recording.recording_url,
                        `recording-${recording.id}.mp3`
                      )
                    }
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Audio
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleDownload(
                        recording.transcript_url,
                        `transcript-${recording.id}.txt`
                      )
                    }
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Transcript
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Recordings;