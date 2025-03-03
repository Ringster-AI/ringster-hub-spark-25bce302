
import { useState } from "react";
import { useRecordings } from "./recordings/useRecordings";
import { RecordingsTable } from "./recordings/RecordingsTable";
import { RecordingDetails } from "./recordings/RecordingDetails";
import { CallRecording } from "./recordings/types";
import { useIsMobile } from "@/hooks/use-mobile";

const Recordings = () => {
  const [selectedRecording, setSelectedRecording] = useState<CallRecording | null>(null);
  const { data: recordings, isLoading, error } = useRecordings();
  const isMobile = useIsMobile();

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Call Recordings</h1>

      <div className="flex flex-col space-y-6">
        <div className={`${selectedRecording && isMobile ? 'hidden' : 'block'} w-full`}>
          <RecordingsTable 
            recordings={recordings}
            isLoading={isLoading}
            error={error as Error | null}
            onSelectRecording={(recording) => {
              setSelectedRecording(recording);
              // On mobile, when a recording is selected, we'll scroll to top
              if (isMobile) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          />
        </div>

        {(selectedRecording || !isMobile) && (
          <div className={`${selectedRecording && isMobile ? 'block' : 'block'} w-full`}>
            <div className="flex items-center mb-4">
              {isMobile && selectedRecording && (
                <button 
                  onClick={() => setSelectedRecording(null)}
                  className="text-sm text-blue-600 flex items-center mb-2"
                >
                  ← Back to recordings
                </button>
              )}
            </div>
            <RecordingDetails recording={selectedRecording} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Recordings;
