
export interface CalendarSettingsType {
  calendar_id: string;
  calendar_name?: string;
  default_duration: number;
  buffer_time: number;
  availability_days: number[];
  availability_start: string;
  availability_end: string;
}
