import { Json } from './auth';

export interface UsageSummary {
  id: string;
  user_id: string | null;
  year: number;
  month: number;
  total_calls: number | null;
  total_minutes: number | null;
  total_transfers: number | null;
  created_at: string | null;
}

export interface UsageSummarySchema {
  Tables: {
    usage_summary: {
      Row: UsageSummary;
      Insert: Partial<UsageSummary> & Pick<UsageSummary, 'year' | 'month'>;
      Update: Partial<UsageSummary>;
    };
  };
}