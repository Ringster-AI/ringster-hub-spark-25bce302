import { Json } from './auth';

export interface CallLog {
  id: string;
  call_sid: string;
  agent_id: string | null;
  from_number: string | null;
  to_number: string | null;
  start_time: string | null;
  end_time: string | null;
  duration: number | null;
  status: string | null;
  transfer_count: number | null;
  created_at: string | null;
}

export interface CallLogsSchema {
  Tables: {
    call_logs: {
      Row: CallLog;
      Insert: Partial<CallLog>;
      Update: Partial<CallLog>;
    };
  };
}