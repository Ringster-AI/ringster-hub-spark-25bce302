import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useIntegrations } from "@/hooks/useIntegrations";
import { AgentFormData } from "@/types/agents";

interface CalendarOption {
  id: string;
  summary: string;
  primary?: boolean;
}

interface CalendarPickerProps {
  form: UseFormReturn<AgentFormData>;
  disabled?: boolean;
}

export function CalendarPicker({ form, disabled }: CalendarPickerProps) {
  const { integrations } = useIntegrations();
  const [calendars, setCalendars] = useState<CalendarOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connected = integrations.find(
    (i) =>
      ["google_calendar", "cal_com", "calendly"].includes(i.integration_type) &&
      i.status === "connected" &&
      i.is_active,
  );
  // Microsoft lives in its own table — detect via direct probe later.
  const provider = connected?.integration_type;

  const selectedId = form.watch("calendar_booking.calendar_id") || "";

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setError(null);
      setCalendars([]);

      // Try Google first if connected
      if (provider === "google_calendar") {
        setLoading(true);
        const { data, error } = await supabase.functions.invoke("google-calendar-list");
        setLoading(false);
        if (cancelled) return;
        if (error) {
          setError("Could not load Google calendars.");
          return;
        }
        setCalendars((data?.calendars || []) as CalendarOption[]);
        return;
      }

      // Microsoft (no row in `integrations` table — probe the list endpoint)
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("microsoft-calendar-list");
      setLoading(false);
      if (cancelled) return;
      if (!error && data?.calendars?.length) {
        setCalendars(data.calendars as CalendarOption[]);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [provider]);

  // Cal.com / Calendly use event types in the provider's own UI — no per-agent picker.
  if (provider === "cal_com" || provider === "calendly") {
    return (
      <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
        Bookings will use the default event type configured in your{" "}
        {provider === "cal_com" ? "Cal.com" : "Calendly"} account.
      </div>
    );
  }

  const handleChange = (value: string) => {
    const cal = calendars.find((c) => c.id === value);
    form.setValue("calendar_booking.calendar_id", value, { shouldDirty: true });
    form.setValue("calendar_booking.calendar_name", cal?.summary || "", { shouldDirty: true });
    form.setValue(
      "calendar_booking.calendar_provider",
      provider === "google_calendar" ? "google" : "microsoft",
      { shouldDirty: true },
    );
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        Target Calendar
      </Label>
      <p className="text-xs text-muted-foreground">
        Choose which calendar this agent should book into. Defaults to your primary calendar.
      </p>
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading calendars…
        </div>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : calendars.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Connect Google Calendar or Microsoft Outlook in Settings → Integrations to pick a calendar.
        </p>
      ) : (
        <Select value={selectedId} onValueChange={handleChange} disabled={disabled}>
          <SelectTrigger>
            <SelectValue placeholder="Select a calendar" />
          </SelectTrigger>
          <SelectContent>
            {calendars.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.summary}
                {c.primary ? " (primary)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
