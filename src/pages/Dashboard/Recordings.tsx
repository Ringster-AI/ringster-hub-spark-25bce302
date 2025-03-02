
import { useState } from "react";
import { useRecordings } from "./recordings/useRecordings";
import { RecordingsTable } from "./recordings/RecordingsTable";
import { RecordingDetails } from "./recordings/RecordingDetails";
import { CallRecording } from "./recordings/types";

const Recordings = () => {
  const [selectedRecording, setSelectedRecording] = useState<CallRecording | null>(null);
  const { data: recordings, isLoading, error } = useRecordings();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Call Recordings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecordingsTable 
            recordings={recordings}
            isLoading={isLoading}
            error={error as Error | null}
            onSelectRecording={setSelectedRecording}
          />
        </div>

        <div>
          <RecordingDetails recording={selectedRecording} />
        </div>
      </div>
    </div>
  );
};

export default Recordings;
