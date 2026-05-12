import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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

type Provider = "google" | "microsoft" | null;

export function CalendarPicker({ form, disabled }: CalendarPickerProps) {
  const [calendars, setCalendars] = useState<CalendarOption[]>([]);
  const [provider, setProvider] = useState<Provider>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const selectedId = form.watch("calendar_booking.calendar_id") || "";

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setError(null);
      setCalendars([]);
      setProvider(null);
      setLoading(true);

      // Probe Google first
      const g = await supabase.functions.invoke("google-calendar-list");
      if (cancelled) return;
      if (!g.error && g.data?.calendars?.length) {
        setProvider("google");
        setCalendars(g.data.calendars as CalendarOption[]);
        setLoading(false);
        return;
      }

      // Then probe Microsoft
      const m = await supabase.functions.invoke("microsoft-calendar-list");
      if (cancelled) return;
      if (!m.error && m.data?.calendars?.length) {
        setProvider("microsoft");
        setCalendars(m.data.calendars as CalendarOption[]);
        setLoading(false);
        return;
      }

      setLoading(false);
      // Surface whichever error was most informative (non-404)
      const gMsg = (g.data as any)?.error;
      const mMsg = (m.data as any)?.error;
      if (gMsg && !/not found/i.test(gMsg)) setError(gMsg);
      else if (mMsg && !/not found/i.test(mMsg)) setError(mMsg);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const handleChange = (value: string) => {
    const cal = calendars.find((c) => c.id === value);
    form.setValue("calendar_booking.calendar_id", value, { shouldDirty: true });
    form.setValue("calendar_booking.calendar_name", cal?.summary || "", { shouldDirty: true });
    form.setValue(
      "calendar_booking.calendar_provider",
      provider === "google" ? "google" : "microsoft",
      { shouldDirty: true },
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Target Calendar
        </Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setRefreshKey((k) => k + 1)}
          disabled={loading}
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>
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
          No connected calendar detected. Connect Google Calendar or Microsoft Outlook in
          Settings → Integrations, then click refresh.
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
